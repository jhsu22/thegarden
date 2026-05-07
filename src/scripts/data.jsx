// Seed config + helpers for the digital garden.
// Data is persisted in Cloudflare D1 via /api/entries.
// Custom beds (user-created categories) remain in localStorage.

const CATEGORIES = [
  { id: 'cafes',   label: 'Cafés & Restaurants', glyph: 'cup',    accent: 'rose',   rating: 'cafe',   extraField: 'location', kindSwitch: ['café', 'restaurant'] },
  { id: 'cooking', label: 'Cooking',             glyph: 'whisk',  accent: 'butter', rating: 'simple', extraField: null,       kindSwitch: ['baked', 'cooked'] },
  { id: 'books',   label: 'Books',               glyph: 'book',   accent: 'clay',   rating: 'simple', extraField: 'author' },
  { id: 'movies',  label: 'Movies',              glyph: 'reel',   accent: 'plum',   rating: 'simple', extraField: null },
  { id: 'shows',   label: 'Shows',               glyph: 'screen', accent: 'sage',   rating: 'simple', extraField: null },
  { id: 'albums',  label: 'Albums',              glyph: 'disc',   accent: 'sky',    rating: 'simple', extraField: 'artist' },
  { id: 'coffee',  label: 'Coffee',              glyph: 'bean',   accent: 'butter', rating: 'simple', extraField: null },
];

const DEFAULT_WEIGHTS = {
  josie: {
    café:       { ambiance: 0.50, taste: 0.30, originality: 0.20 },
    restaurant: { ambiance: 0.25, taste: 0.50, originality: 0.25 },
  },
  sammy: {
    café:       { ambiance: 0.30, taste: 0.35, originality: 0.35 },
    restaurant: { ambiance: 0.10, taste: 0.60, originality: 0.30 },
  },
};

const weighted = (r, w) =>
  +(r.ambiance * w.ambiance + r.taste * w.taste + r.originality * w.originality).toFixed(1);

const personWeights = (W, person, kind) => {
  const k = kind === 'restaurant' ? 'restaurant' : 'café';
  return (W[person] && W[person][k]) || { ambiance: 1/3, taste: 1/3, originality: 1/3 };
};

const fmtScore = (n) => (n == null ? '—' : Number(n).toFixed(1));

const fmtDate = (iso) => {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const fmtMonthYear = (iso) => {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const cafeScore = (item, who, W) => {
  const wJ = personWeights(W, 'josie', item.kind);
  const wS = personWeights(W, 'sammy', item.kind);
  if (who === 'josie') return item.me    ? weighted(item.me, wJ)    : null;
  if (who === 'sammy') return item.sammy ? weighted(item.sammy, wS) : null;
  const j = item.me    ? weighted(item.me, wJ)    : null;
  const s = item.sammy ? weighted(item.sammy, wS) : null;
  if (j != null && s != null) return +(((j + s) / 2)).toFixed(1);
  return j != null ? j : s;
};

const itemScore = (cat, item, W) => {
  if (cat === 'cafes') return cafeScore(item, 'avg', W);
  return item.score;
};

const flatFeed = (w) => {
  const rows = [];
  for (const cat of CATEGORIES) {
    for (const item of ALL_DATA[cat.id] || []) {
      rows.push({ ...item, _cat: cat.id, _score: itemScore(cat.id, item, w) });
    }
  }
  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  return rows;
};

// ── Mutable data store — populated by hydrate() ───────────────────────────
const ALL_DATA = {};
for (const cat of CATEGORIES) ALL_DATA[cat.id] = [];

// ── API helpers ───────────────────────────────────────────────────────────
const apiFetch = (path, options = {}) =>
  fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  }).then((r) => {
    if (!r.ok) throw new Error(`API ${options.method || 'GET'} ${path} failed: ${r.status}`);
    return r.json();
  });

// ── Hydrate from D1 ───────────────────────────────────────────────────────
const hydrate = async () => {
  const entries = await apiFetch('/api/entries');

  // Reset all known categories
  for (const cat of CATEGORIES) ALL_DATA[cat.id] = [];

  for (const entry of entries) {
    if (ALL_DATA[entry.category]) {
      ALL_DATA[entry.category].push(entry);
    }
  }

  // Merge custom beds from localStorage (config only, entries come from D1)
  const s = loadCustomStore();
  if (Array.isArray(s.customBeds)) {
    for (const bed of s.customBeds) {
      if (!CATEGORIES.find((c) => c.id === bed.id)) {
        CATEGORIES.push(bed);
        ALL_DATA[bed.id] = entries.filter((e) => e.category === bed.id);
      }
    }
  }

  // Apply saved bed order
  try {
    const savedOrder = JSON.parse(localStorage.getItem(BEDS_ORDER_KEY));
    if (Array.isArray(savedOrder) && savedOrder.length) applyBedOrder(savedOrder);
  } catch {}
};

// ── CRUD — writes go to D1 and update local cache optimistically ──────────
const addEntry = async (catId, entry) => {
  await apiFetch('/api/entries', {
    method: 'POST',
    body: JSON.stringify({ ...entry, category: catId }),
  });
  ALL_DATA[catId] = [entry, ...(ALL_DATA[catId] || [])];
  return true;
};

const updateEntry = async (catId, id, updates) => {
  if (!ALL_DATA[catId]) return false;
  const idx = ALL_DATA[catId].findIndex((i) => i.id === id);
  if (idx < 0) return false;
  const updated = { ...ALL_DATA[catId][idx], ...updates };
  await apiFetch('/api/entries', {
    method: 'POST',
    body: JSON.stringify({ ...updated, category: catId }),
  });
  ALL_DATA[catId] = ALL_DATA[catId].map((item, i) => i === idx ? updated : item);
  return true;
};

const deleteEntry = async (catId, id) => {
  if (!ALL_DATA[catId]) return false;
  await apiFetch('/api/entries', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
  ALL_DATA[catId] = (ALL_DATA[catId] || []).filter((i) => i.id !== id);
  return true;
};

// ── Bed ordering — persisted to localStorage ─────────────────────────────
const BEDS_ORDER_KEY = 'garden.beds.order';

const applyBedOrder = (orderedIds) => {
  const lookup = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
  const known = new Set(CATEGORIES.map((c) => c.id));
  const reordered = orderedIds.filter((id) => known.has(id)).map((id) => lookup[id]);
  const rest = CATEGORIES.filter((c) => !orderedIds.includes(c.id));
  CATEGORIES.splice(0, CATEGORIES.length, ...reordered, ...rest);
};

const reorderBeds = (orderedIds) => {
  applyBedOrder(orderedIds);
  try { localStorage.setItem(BEDS_ORDER_KEY, JSON.stringify(orderedIds)); } catch {}
};

// ── Custom beds — stored in localStorage (they're config, not data) ───────
const BEDS_KEY = 'garden.beds';

const loadCustomStore = () => {
  try { return JSON.parse(localStorage.getItem(BEDS_KEY)) || {}; }
  catch { return {}; }
};
const saveCustomStore = (s) => {
  try { localStorage.setItem(BEDS_KEY, JSON.stringify(s)); } catch {}
};

const addBed = (bed) => {
  if (CATEGORIES.find((c) => c.id === bed.id)) return false;
  const next = { ...bed, custom: true };
  CATEGORIES.push(next);
  ALL_DATA[bed.id] = [];
  const s = loadCustomStore();
  s.customBeds = [...(s.customBeds || []), next];
  saveCustomStore(s);
  return true;
};

const removeBed = (id) => {
  const idx = CATEGORIES.findIndex((c) => c.id === id);
  if (idx < 0 || !CATEGORIES[idx].custom) return false;
  CATEGORIES.splice(idx, 1);
  delete ALL_DATA[id];
  const s = loadCustomStore();
  s.customBeds = (s.customBeds || []).filter((b) => b.id !== id);
  saveCustomStore(s);
  return true;
};

Object.assign(window, {
  CATEGORIES, DEFAULT_WEIGHTS, ALL_DATA,
  weighted, personWeights, cafeScore, itemScore, flatFeed,
  fmtScore, fmtDate, fmtMonthYear,
  hydrate, addEntry, updateEntry, deleteEntry, addBed, removeBed, reorderBeds,
});
