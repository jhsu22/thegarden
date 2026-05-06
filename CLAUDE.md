# The Garden — Claude Reference

Personal life tracker for Josie (and Sammy for café visits). Records cafés, cooking, books, movies, shows, albums, and coffee.

## Stack

- **Astro 5** — SSR, `output: "server"`, deployed to **Cloudflare Pages**
- **Adapter** — `@astrojs/cloudflare` v12+
- **React** — CDN (unpkg), React 18 + Babel standalone. No `@astrojs/react`. JSX files are inlined into the HTML shell at build time via Vite `?raw` imports.
- **Database** — Cloudflare D1 (binding: `DB`)
- **Settings** — Cloudflare KV (binding: `SETTINGS`)
- **Photos** — IndexedDB (browser-side, no server storage)
- **Custom beds** — localStorage (config only; entries are in D1)
- **TypeScript** — strict mode (`astro/tsconfigs/strict`)

## File Structure

```
src/
  env.d.ts              # Cloudflare binding types (DB, SETTINGS)
  pages/
    index.astro         # HTML shell — inlines all JSX, loading state, App root
    api/
      entries.ts        # GET / POST / DELETE entries in D1
      settings.ts       # GET / PUT DEFAULT_WEIGHTS in KV
  scripts/              # Client-side JSX (browser-executed via Babel)
    data.jsx            # CATEGORIES config, helpers, async CRUD via fetch()
    app.jsx             # Sidebar, views, AddSheet, DetailView
    components.jsx      # SVG ornaments, Card, Button, ScoreBadge, etc.
    photos.jsx          # IndexedDB photo storage + PhotoDisplay/PhotoUpload
    coffee.jsx          # CircleRating, HexFlavorWheel, CoffeeDetails
    dashboard.jsx       # Constellation scatter plot
    new-bed.jsx         # NewBedModal
public/
  favicon.svg
schema.sql              # D1 schema + all seed INSERTs
wrangler.toml           # Cloudflare bindings config
```

## Architecture Notes

### JSX loading
All `src/scripts/*.jsx` files are **not** processed by Vite as modules. They are imported as raw strings (`?raw`) in `index.astro` and inlined inside `<script type="text/babel">` tags via `<Fragment set:html={...}>`. Babel runs in the browser and compiles them at runtime. Load order matters — each file adds to `window`:

```
components → photos → coffee → data → app → dashboard → new-bed
```

### Data flow
1. `App` mounts → calls `hydrate()` + `fetch('/api/settings')` in parallel
2. `hydrate()` GETs `/api/entries`, populates the global `ALL_DATA` object grouped by category
3. `setLoading(false)` triggers render with real data
4. Mutations (add/update/delete) call the API then update `ALL_DATA` in place (optimistic)

### D1 schema
`entries(id, category, name, date, notes, score, metadata TEXT)` — `metadata` is a JSON blob holding all category-specific fields: `photo`, `tags`, `price`, `kind`, `me`/`sammy` (cafes), `ingredients`/`instructions` (cooking), `attributes`/`flavors` (coffee), etc.

### Café scoring
Josie and Sammy each score `ambiance`, `taste`, `originality` (1–10). These are weighted by `kind` (café vs. restaurant). Weights are stored in KV under key `DEFAULT_WEIGHTS` and fetched on app init. Default weights live in both `settings.ts` (server fallback) and `data.jsx` (client initial state).

## Cloudflare Setup

Run once to create cloud resources:
```bash
wrangler d1 create thegarden-db        # paste database_id into wrangler.toml
wrangler kv namespace create SETTINGS  # paste id + preview_id into wrangler.toml
```

Seed the database (both local and remote):
```bash
npx wrangler d1 execute thegarden-db --local  --file=schema.sql   # local dev
npx wrangler d1 execute thegarden-db --remote --file=schema.sql   # production
```

Re-run `--local` any time — all INSERTs use `OR IGNORE` so they're idempotent.

## Local Dev

```bash
npm install --ignore-scripts   # sharp native build unavailable in this env
npm run dev                    # astro dev (platformProxy auto-enabled in v12+)
```

The local D1 database lives at `.wrangler/state/v3/d1/`. If you see `no such table: entries`, run the local seed command above.

## Deploying

Cloudflare Pages picks up the `main` branch automatically. `wrangler.toml` tells it the output dir (`./dist`) and bindings.

## When Done with Changes — Commit & Push

```bash
git add -p                          # stage selectively (review each hunk)
# or: git add <specific files>
git status                          # confirm staged set
git commit -m "your message here"
git push origin main
```

Prefer specific file staging over `git add .` to avoid accidentally committing `.env` files, generated assets, or `.wrangler/` state.

The `.wrangler/` directory (local D1/KV state) should stay out of git — confirm it's in `.gitignore`.

## Categories

| id | Label | Rating |
|---|---|---|
| cafes | Cafés & Restaurants | 3-axis (ambiance/taste/originality) × Josie + Sammy |
| cooking | Cooking | Simple 1–10 |
| books | Books | Simple 1–10 |
| movies | Movies | Simple 1–10 |
| shows | Shows | Simple 1–10 |
| albums | Albums | Simple 1–10 |
| coffee | Coffee | Simple 1–10 + profile circles + hex flavor wheel |

Custom beds (user-created) are stored in `localStorage` under key `garden.beds`.

## Key Globals (window)

From `data.jsx`: `CATEGORIES`, `DEFAULT_WEIGHTS`, `ALL_DATA`, `hydrate`, `addEntry`, `updateEntry`, `deleteEntry`, `addBed`, `removeBed`, `weighted`, `personWeights`, `cafeScore`, `itemScore`, `flatFeed`, `fmtScore`, `fmtDate`, `fmtMonthYear`

From `photos.jsx`: `savePhoto`, `loadPhoto`, `deletePhoto`, `PhotoDisplay`, `PhotoUpload`

From `components.jsx`: `Card`, `Button`, `Chip`, `ScoreBadge`, `SectionTitle`, `Squiggle`, `Sparkle`, `LeafMark`, `PetalMark`, `Glyph`, `DottedDivider`, `PhotoPlaceholder`
