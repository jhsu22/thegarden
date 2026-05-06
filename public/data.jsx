// Seed data + helpers for the digital garden
// All scores are 1.0–10.0 with one decimal.

// rating: 'simple' (one slider 1-10)
//       | 'cafe' (3 axes ambiance/taste/originality, w/ optional kind switch + companion)
//       | 'companion' (one slider, optional companion average)
// custom: true means user-created and persisted to localStorage
// extraField: optional secondary string field (e.g. 'author', 'artist', 'location')
const CATEGORIES = [
  { id: 'cafes',   label: 'Cafés & Restaurants', glyph: 'cup',    accent: 'rose',   rating: 'cafe',      extraField: 'location', kindSwitch: ['café', 'restaurant'] },
  { id: 'cooking', label: 'Cooking',             glyph: 'whisk',  accent: 'butter', rating: 'simple',    extraField: null,       kindSwitch: ['baked', 'cooked'] },
  { id: 'books',   label: 'Books',               glyph: 'book',   accent: 'clay',   rating: 'simple',    extraField: 'author' },
  { id: 'movies',  label: 'Movies',              glyph: 'reel',   accent: 'plum',   rating: 'simple',    extraField: null },
  { id: 'shows',   label: 'Shows',               glyph: 'screen', accent: 'sage',   rating: 'simple',    extraField: null },
  { id: 'albums',  label: 'Albums',              glyph: 'disc',   accent: 'sky',    rating: 'simple',    extraField: 'artist' },
];

// Per-person, per-kind weights for cafés/restaurants
// Shape: WEIGHTS[person][kind] = { ambiance, taste, originality }
const DEFAULT_WEIGHTS = {
  josie: {
    café:       { ambiance: 0.50, taste: 0.30, originality: 0.20 },
    restaurant: { ambiance: 0.25, taste: 0.50, originality: 0.25 },
  },
  sammy: {
    café:       { ambiance: 0.30, taste: 0.35, originality: 0.35 },
    restaurant: { ambiance: 0.10, taste: 0.60, originality: 0.20 },
  },
};

const weighted = (r, w) =>
  +(r.ambiance * w.ambiance + r.taste * w.taste + r.originality * w.originality).toFixed(1);

const personWeights = (W, person, kind) => {
  const k = (kind === 'restaurant') ? 'restaurant' : 'café';
  return (W[person] && W[person][k]) || { ambiance: 1/3, taste: 1/3, originality: 1/3 };
};

// ────────────────────────────────────────────────────────────
// Cafés & Restaurants (you + Sammy)
const CAFES = [
  {
    id: 'c1', name: 'Sundial Coffee', kind: 'café',
    location: 'Echo Park, LA', date: '2026-04-22', price: 18,
    notes: 'The light in the back garden at 4pm is unreal. Cardamom bun was the best of the year.',
    photo: { tone: 'rose',  shape: 'circle' },
    me:    { ambiance: 9.4, taste: 9.0, originality: 8.2 },
    sammy: { ambiance: 9.0, taste: 9.2, originality: 7.8 },
    tags: ['pastries', 'patio', 'mornings'],
  },
  {
    id: 'c2', name: 'Komorebi Soba', kind: 'restaurant',
    location: 'Sawtelle, LA', date: '2026-04-09', price: 64,
    notes: 'Cold soba was perfect texture. Tempura a touch heavy. Worth the line.',
    photo: { tone: 'sage', shape: 'arch' },
    me:    { ambiance: 8.0, taste: 9.5, originality: 7.0 },
    sammy: { ambiance: 8.4, taste: 9.0, originality: 7.4 },
    tags: ['japanese', 'lunch', 'noodles'],
  },
  {
    id: 'c3', name: 'Folio Bakery', kind: 'café',
    location: 'Highland Park, LA', date: '2026-03-30', price: 14,
    notes: 'Cute little corner spot. Galette dough was incredible — flaky, almost shattering.',
    photo: { tone: 'butter', shape: 'rounded' },
    me:    { ambiance: 7.5, taste: 9.2, originality: 7.0 },
    sammy: { ambiance: 8.0, taste: 8.5, originality: 6.5 },
    tags: ['bakery', 'weekend'],
  },
  {
    id: 'c4', name: 'Marigold Wine Bar', kind: 'restaurant',
    location: 'Silver Lake, LA', date: '2026-03-18', price: 92,
    notes: 'Funky orange wine flight, the labneh-with-honey thing was a revelation.',
    photo: { tone: 'plum', shape: 'circle' },
    me:    { ambiance: 9.6, taste: 8.8, originality: 9.0 },
    sammy: { ambiance: 9.2, taste: 8.4, originality: 9.4 },
    tags: ['date night', 'wine', 'small plates'],
  },
  {
    id: 'c5', name: 'Tide Pool Oyster',  kind: 'restaurant',
    location: 'Venice, CA', date: '2026-02-14', price: 110,
    notes: 'Oysters were pristine. Service a bit chaotic on a Saturday.',
    photo: { tone: 'sky', shape: 'arch' },
    me:    { ambiance: 8.2, taste: 9.0, originality: 7.2 },
    sammy: { ambiance: 7.8, taste: 9.4, originality: 7.0 },
    tags: ['seafood', 'celebration'],
  },
  {
    id: 'c6', name: 'Lavender & Linen', kind: 'café',
    location: 'Pasadena, CA', date: '2026-04-15', price: 9,
    notes: 'Solo morning. Lavender latte was a touch too sweet but the back patio is heaven.',
    photo: { tone: 'rose', shape: 'rounded' },
    me:    { ambiance: 8.6, taste: 7.4, originality: 7.0 },
    sammy: null,
    tags: ['solo', 'mornings', 'patio'],
  },
];

// Cooking
const COOKING = [
  {
    id: 'k1', name: 'Sourdough Focaccia', kind: 'baked',
    date: '2026-04-28', price: 6,
    notes: 'Long cold ferment (36h). Crumb was open and chewy — best one yet.',
    photo: { tone: 'butter', shape: 'rounded' },
    score: 9.2,
    tags: ['bread', 'sourdough'],
    difficulty: 'medium', time: '3h + 36h ferment', portions: 12,
    ingredients: [
      { qty: 500, unit: 'g',    name: 'bread flour' },
      { qty: 375, unit: 'ml',   name: 'water (lukewarm)' },
      { qty: 100, unit: 'g',    name: 'active sourdough starter' },
      { qty: 10,  unit: 'g',    name: 'fine salt' },
      { qty: 4,   unit: 'tbsp', name: 'olive oil' },
      { qty: 1,   unit: 'tbsp', name: 'flaky sea salt' },
    ],
    instructions: `Mix flour, water, and starter until no dry flour remains. Rest 30 min.

Add salt and fold the dough over itself 4 times. Repeat every 30 min for 2 hours (4 sets).

Transfer to an oiled container and cold ferment in the fridge for 36 hours.

Stretch into an oiled 9×13 pan. Proof at room temp 2 hours until puffy.

Dimple aggressively with wet fingers. Drizzle with olive oil, flaky salt, and rosemary.

Bake at 230°C for 22–25 min until deep golden. Cool on a rack.`,
  },
  {
    id: 'k2', name: 'Miso-glazed Eggplant', kind: 'cooked',
    date: '2026-04-21', price: 12,
    notes: 'Broiled a touch too long, crust got bitter. Sauce ratio nailed it.',
    photo: { tone: 'plum', shape: 'arch' },
    score: 7.8,
    tags: ['weeknight', 'japanese'],
    difficulty: 'easy', time: '25 min', portions: 2,
    ingredients: [
      { qty: 2, unit: '',     name: 'Japanese eggplants' },
      { qty: 2, unit: 'tbsp', name: 'white miso' },
      { qty: 1, unit: 'tbsp', name: 'mirin' },
      { qty: 1, unit: 'tbsp', name: 'sake' },
      { qty: 1, unit: 'tsp',  name: 'sesame oil' },
      { qty: 1, unit: 'tsp',  name: 'sugar' },
      { qty: 2, unit: '',     name: 'scallions, sliced' },
      { qty: 1, unit: 'tsp',  name: 'sesame seeds' },
    ],
    instructions: `Halve eggplants lengthwise and score the flesh in a crosshatch. Brush with oil.

Mix miso, mirin, sake, sesame oil, and sugar until smooth.

Broil eggplants cut-side down 5 min, then flip. Spoon glaze over the cut side.

Broil 4–5 min more until the glaze is caramelised and flesh is tender.

Top with scallions and sesame seeds.`,
  },
  {
    id: 'k3', name: 'Strawberry Galette', kind: 'baked',
    date: '2026-04-12', price: 9,
    notes: 'Used the leftover pâte brisée — basil sugar on top was the move.',
    photo: { tone: 'rose', shape: 'circle' },
    score: 9.0,
    tags: ['dessert', 'summer'],
    difficulty: 'medium', time: '1h 15m', portions: 6,
    ingredients: [
      { qty: 200, unit: 'g',    name: 'pâte brisée (cold)' },
      { qty: 400, unit: 'g',    name: 'strawberries, hulled and halved' },
      { qty: 3,   unit: 'tbsp', name: 'sugar' },
      { qty: 6,   unit: '',     name: 'fresh basil leaves' },
      { qty: 1,   unit: 'tbsp', name: 'cornstarch' },
      { qty: 1,   unit: '',     name: 'egg (for egg wash)' },
      { qty: 1,   unit: 'tbsp', name: 'turbinado sugar' },
    ],
    instructions: `Toss strawberries with 2 tbsp sugar, cornstarch, and torn basil. Macerate 15 min.

Roll dough on parchment into a rough 12-inch circle, about 3mm thick.

Pile filling in the centre leaving a 5cm border. Fold border up and pleat as you go.

Brush crust with egg wash and sprinkle turbinado sugar over everything.

Bake at 200°C for 40–45 min until crust is deep golden and filling is bubbling.

Rest 10 min before slicing.`,
  },
  {
    id: 'k4', name: 'Cacio e Pepe', kind: 'cooked',
    date: '2026-04-05', price: 8,
    notes: 'Sauce broke twice before it came together. Need a wider pan.',
    photo: { tone: 'sage', shape: 'rounded' },
    score: 7.0,
    tags: ['pasta', 'classic'],
    difficulty: 'hard', time: '20 min', portions: 2,
    ingredients: [
      { qty: 200, unit: 'g',   name: 'tonnarelli or spaghetti' },
      { qty: 80,  unit: 'g',   name: 'Pecorino Romano, finely grated' },
      { qty: 30,  unit: 'g',   name: 'Parmigiano Reggiano, finely grated' },
      { qty: 2,   unit: 'tsp', name: 'whole black peppercorns' },
    ],
    instructions: `Toast peppercorns in a wide pan over medium heat until fragrant, 2 min. Crush coarsely.

Cook pasta in salted boiling water until 2 min before al dente. Reserve 200ml pasta water.

Add a splash of pasta water to the pepper pan. Reduce heat to low. Add pasta and toss.

Add pasta water a little at a time, tossing constantly to build a glossy sauce.

Off heat, add half the cheese and toss vigorously. Add remaining cheese and water as needed.

Serve immediately with extra Pecorino and cracked pepper.`,
  },
];

// Books
const BOOKS = [
  {
    id: 'b1', name: 'A Memoir of the Hawk', author: 'J. Pessoa',
    date: '2026-04-25', price: 22,
    notes: 'Dense in the middle but the last fifty pages broke me open.',
    photo: { tone: 'clay', shape: 'arch' },
    score: 9.1,
    tags: ['memoir', 'lyrical'],
  },
  {
    id: 'b2', name: 'Bright Earth', author: 'Philip Ball',
    date: '2026-03-12', price: 18,
    notes: 'History of pigments. Surprisingly emotional re: ultramarine.',
    photo: { tone: 'sky', shape: 'circle' },
    score: 8.4,
    tags: ['nonfiction', 'art'],
  },
  {
    id: 'b3', name: 'The Long Hello', author: 'A. Marsh',
    date: '2026-02-20', price: 16,
    notes: 'Quiet novel. I underlined a lot.',
    photo: { tone: 'rose', shape: 'rounded' },
    score: 8.0,
    tags: ['fiction', 'quiet'],
  },
];

// Movies
const MOVIES = [
  {
    id: 'm1', name: 'Perfect Days', date: '2026-04-19', price: 14,
    notes: 'Hirayama’s mornings live in my head now.',
    photo: { tone: 'sage', shape: 'arch' },
    score: 9.4, tags: ['drama', 'rewatch'],
  },
  {
    id: 'm2', name: 'Past Lives', date: '2026-03-22', price: 14,
    notes: 'The 24-hour stretch in NYC — devastating in a soft way.',
    photo: { tone: 'plum', shape: 'circle' },
    score: 9.2, tags: ['drama', 'romance'],
  },
  {
    id: 'm3', name: 'Anatomy of a Fall', date: '2026-02-08', price: 14,
    notes: 'The dog. That’s all.',
    photo: { tone: 'clay', shape: 'rounded' },
    score: 8.6, tags: ['thriller'],
  },
];

// Shows
const SHOWS = [
  {
    id: 's1', name: 'Shōgun (S1)', date: '2026-04-30',
    notes: 'Hiroyuki Sanada commands every frame.',
    photo: { tone: 'plum', shape: 'arch' },
    score: 9.3, tags: ['historical', 'epic'],
  },
  {
    id: 's2', name: 'Slow Horses (S4)', date: '2026-04-02',
    notes: 'Lamb is the best character on television.',
    photo: { tone: 'sage', shape: 'rounded' },
    score: 8.9, tags: ['spy', 'comedy'],
  },
  {
    id: 's3', name: 'The Bear (S3)', date: '2026-03-15',
    notes: 'The first three episodes are perfect; the rest meanders.',
    photo: { tone: 'butter', shape: 'circle' },
    score: 7.8, tags: ['drama'],
  },
];

// Albums
const ALBUMS = [
  {
    id: 'a1', name: 'Brat', artist: 'Charli XCX',
    date: '2026-04-10',
    notes: 'Sweat-pop perfection. "Sympathy is a knife" lives on repeat.',
    photo: { tone: 'sage', shape: 'circle' },
    score: 9.0, tags: ['pop', 'electronic'],
  },
  {
    id: 'a2', name: 'Gold-Diggers Sound', artist: 'Leon Bridges',
    date: '2026-03-25',
    notes: 'Velvety late-night drive album.',
    photo: { tone: 'butter', shape: 'arch' },
    score: 8.5, tags: ['soul', 'r&b'],
  },
  {
    id: 'a3', name: 'A Light for Attracting Attention', artist: 'The Smile',
    date: '2026-02-28',
    notes: 'Tom Skinner’s drumming is the whole game.',
    photo: { tone: 'clay', shape: 'rounded' },
    score: 8.7, tags: ['rock', 'experimental'],
  },
];

const ALL_DATA = {
  cafes: CAFES, cooking: COOKING, books: BOOKS,
  movies: MOVIES, shows: SHOWS, albums: ALBUMS,
};

// ────────────────────────────────────────────────────────────
// Helpers
const fmtScore = (n) => (n == null ? '—' : Number(n).toFixed(1));

const fmtDate = (iso) => {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const fmtMonthYear = (iso) => {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// item.me / item.sammy may be null (solo log)
const cafeScore = (item, who, W) => {
  const wJ = personWeights(W, 'josie', item.kind);
  const wS = personWeights(W, 'sammy', item.kind);
  if (who === 'josie') return item.me    ? weighted(item.me, wJ)    : null;
  if (who === 'sammy') return item.sammy ? weighted(item.sammy, wS) : null;
  // average of available individual scores
  const j = item.me    ? weighted(item.me, wJ)    : null;
  const s = item.sammy ? weighted(item.sammy, wS) : null;
  if (j != null && s != null) return +(((j + s) / 2)).toFixed(1);
  return j != null ? j : s;
};

const itemScore = (cat, item, W) => {
  if (cat === 'cafes') return cafeScore(item, 'avg', W);
  return item.score;
};

// flat feed across categories, newest first
const flatFeed = (w) => {
  const rows = [];
  for (const cat of CATEGORIES) {
    for (const item of ALL_DATA[cat.id]) {
      rows.push({ ...item, _cat: cat.id, _score: itemScore(cat.id, item, w) });
    }
  }
  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  return rows;
};

Object.assign(window, {
  CATEGORIES, DEFAULT_WEIGHTS, ALL_DATA,
  weighted, personWeights, cafeScore, itemScore, flatFeed,
  fmtScore, fmtDate, fmtMonthYear,
});

// ────────────────────────────────────────────────────────────
// Persistence — load custom beds + entries from localStorage,
// mutate the in-place CATEGORIES / ALL_DATA so existing readers see them.
const STORAGE_KEY = 'garden.v1';

const loadStore = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
};
const saveStore = (s) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
};

const hydrate = () => {
  const s = loadStore();
  // Apply stored edits to seed entries so edits survive page reloads
  if (s.updates && typeof s.updates === 'object') {
    for (const [catId, updates] of Object.entries(s.updates)) {
      if (!ALL_DATA[catId]) continue;
      for (const updated of updates) {
        const idx = ALL_DATA[catId].findIndex((x) => x.id === updated.id);
        if (idx >= 0) ALL_DATA[catId][idx] = updated;
      }
    }
  }
  // Apply stored deletes
  if (s.deletes && typeof s.deletes === 'object') {
    for (const [catId, ids] of Object.entries(s.deletes)) {
      if (!ALL_DATA[catId]) continue;
      ALL_DATA[catId] = ALL_DATA[catId].filter((x) => !ids.includes(x.id));
    }
  }
  // Append custom beds
  if (Array.isArray(s.customBeds)) {
    for (const bed of s.customBeds) {
      if (!CATEGORIES.find((c) => c.id === bed.id)) {
        CATEGORIES.push(bed);
        ALL_DATA[bed.id] = [];
      }
    }
  }
  // Append user-added entries
  if (s.entries && typeof s.entries === 'object') {
    for (const [catId, items] of Object.entries(s.entries)) {
      if (!ALL_DATA[catId]) ALL_DATA[catId] = [];
      for (const it of items) {
        if (!ALL_DATA[catId].find((x) => x.id === it.id)) ALL_DATA[catId].push(it);
      }
    }
  }
};
hydrate();

const addBed = (bed) => {
  if (CATEGORIES.find((c) => c.id === bed.id)) return false;
  const next = { ...bed, custom: true };
  CATEGORIES.push(next);
  ALL_DATA[bed.id] = [];
  const s = loadStore();
  s.customBeds = [...(s.customBeds || []), next];
  saveStore(s);
  return true;
};

const removeBed = (id) => {
  const idx = CATEGORIES.findIndex((c) => c.id === id);
  if (idx < 0 || !CATEGORIES[idx].custom) return false;
  CATEGORIES.splice(idx, 1);
  delete ALL_DATA[id];
  const s = loadStore();
  s.customBeds = (s.customBeds || []).filter((b) => b.id !== id);
  if (s.entries) delete s.entries[id];
  saveStore(s);
  return true;
};

const addEntry = (catId, entry) => {
  if (!ALL_DATA[catId]) return false;
  ALL_DATA[catId].unshift(entry);
  const s = loadStore();
  s.entries = s.entries || {};
  s.entries[catId] = [entry, ...(s.entries[catId] || [])];
  saveStore(s);
  return true;
};

const updateEntry = (catId, id, updates) => {
  if (!ALL_DATA[catId]) return false;
  const idx = ALL_DATA[catId].findIndex((i) => i.id === id);
  if (idx < 0) return false;
  const updated = { ...ALL_DATA[catId][idx], ...updates };
  ALL_DATA[catId][idx] = updated;
  const s = loadStore();
  s.updates = s.updates || {};
  s.updates[catId] = s.updates[catId] || [];
  const ui = s.updates[catId].findIndex((x) => x.id === id);
  if (ui >= 0) s.updates[catId][ui] = updated;
  else s.updates[catId].push(updated);
  if (s.entries?.[catId]) {
    const ei = s.entries[catId].findIndex((x) => x.id === id);
    if (ei >= 0) s.entries[catId][ei] = updated;
  }
  saveStore(s);
  return true;
};

const deleteEntry = (catId, id) => {
  if (!ALL_DATA[catId]) return false;
  const idx = ALL_DATA[catId].findIndex((i) => i.id === id);
  if (idx < 0) return false;
  ALL_DATA[catId].splice(idx, 1);
  const s = loadStore();
  s.deletes = s.deletes || {};
  s.deletes[catId] = [...new Set([...(s.deletes[catId] || []), id])];
  if (s.entries?.[catId]) s.entries[catId] = s.entries[catId].filter((x) => x.id !== id);
  if (s.updates?.[catId]) s.updates[catId] = s.updates[catId].filter((x) => x.id !== id);
  saveStore(s);
  return true;
};

Object.assign(window, { addBed, removeBed, addEntry, updateEntry, deleteEntry });
