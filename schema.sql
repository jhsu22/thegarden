-- The Garden — D1 schema
-- Run: wrangler d1 execute thegarden-db --file=schema.sql

CREATE TABLE IF NOT EXISTS entries (
  id       TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name     TEXT NOT NULL,
  date     TEXT NOT NULL,     -- YYYY-MM-DD
  notes    TEXT,
  score    REAL,              -- NULL for cafes (derived from me/sammy ratings)
  metadata TEXT NOT NULL DEFAULT '{}'  -- JSON: all category-specific fields
);

CREATE INDEX IF NOT EXISTS idx_entries_category ON entries(category);
CREATE INDEX IF NOT EXISTS idx_entries_date     ON entries(date DESC);

-- ── Seed data ────────────────────────────────────────────────────────────────
-- Cafés & Restaurants
INSERT OR IGNORE INTO entries (id, category, name, date, notes, score, metadata) VALUES
('c1', 'cafes', 'Sundial Coffee', '2026-04-22',
 'The light in the back garden at 4pm is unreal. Cardamom bun was the best of the year.',
 NULL,
 '{"kind":"café","location":"Echo Park, LA","price":18,"photo":{"tone":"rose","shape":"circle"},"me":{"ambiance":9.4,"taste":9.0,"originality":8.2},"sammy":{"ambiance":9.0,"taste":9.2,"originality":7.8},"tags":["pastries","patio","mornings"]}'),

('c2', 'cafes', 'Komorebi Soba', '2026-04-09',
 'Cold soba was perfect texture. Tempura a touch heavy. Worth the line.',
 NULL,
 '{"kind":"restaurant","location":"Sawtelle, LA","price":64,"photo":{"tone":"sage","shape":"arch"},"me":{"ambiance":8.0,"taste":9.5,"originality":7.0},"sammy":{"ambiance":8.4,"taste":9.0,"originality":7.4},"tags":["japanese","lunch","noodles"]}'),

('c3', 'cafes', 'Folio Bakery', '2026-03-30',
 'Cute little corner spot. Galette dough was incredible — flaky, almost shattering.',
 NULL,
 '{"kind":"café","location":"Highland Park, LA","price":14,"photo":{"tone":"butter","shape":"rounded"},"me":{"ambiance":7.5,"taste":9.2,"originality":7.0},"sammy":{"ambiance":8.0,"taste":8.5,"originality":6.5},"tags":["bakery","weekend"]}'),

('c4', 'cafes', 'Marigold Wine Bar', '2026-03-18',
 'Funky orange wine flight, the labneh-with-honey thing was a revelation.',
 NULL,
 '{"kind":"restaurant","location":"Silver Lake, LA","price":92,"photo":{"tone":"plum","shape":"circle"},"me":{"ambiance":9.6,"taste":8.8,"originality":9.0},"sammy":{"ambiance":9.2,"taste":8.4,"originality":9.4},"tags":["date night","wine","small plates"]}'),

('c5', 'cafes', 'Tide Pool Oyster', '2026-02-14',
 'Oysters were pristine. Service a bit chaotic on a Saturday.',
 NULL,
 '{"kind":"restaurant","location":"Venice, CA","price":110,"photo":{"tone":"sky","shape":"arch"},"me":{"ambiance":8.2,"taste":9.0,"originality":7.2},"sammy":{"ambiance":7.8,"taste":9.4,"originality":7.0},"tags":["seafood","celebration"]}'),

('c6', 'cafes', 'Lavender & Linen', '2026-04-15',
 'Solo morning. Lavender latte was a touch too sweet but the back patio is heaven.',
 NULL,
 '{"kind":"café","location":"Pasadena, CA","price":9,"photo":{"tone":"rose","shape":"rounded"},"me":{"ambiance":8.6,"taste":7.4,"originality":7.0},"sammy":null,"tags":["solo","mornings","patio"]}');

-- Cooking
INSERT OR IGNORE INTO entries (id, category, name, date, notes, score, metadata) VALUES
('k1', 'cooking', 'Sourdough Focaccia', '2026-04-28',
 'Long cold ferment (36h). Crumb was open and chewy — best one yet.',
 9.2,
 '{"kind":"baked","price":6,"photo":{"tone":"butter","shape":"rounded"},"tags":["bread","sourdough"],"difficulty":"medium","time":"3h + 36h ferment","portions":12,"ingredients":[{"qty":500,"unit":"g","name":"bread flour"},{"qty":375,"unit":"ml","name":"water (lukewarm)"},{"qty":100,"unit":"g","name":"active sourdough starter"},{"qty":10,"unit":"g","name":"fine salt"},{"qty":4,"unit":"tbsp","name":"olive oil"},{"qty":1,"unit":"tbsp","name":"flaky sea salt"}],"instructions":"Mix flour, water, and starter until no dry flour remains. Rest 30 min.\n\nAdd salt and fold the dough over itself 4 times. Repeat every 30 min for 2 hours (4 sets).\n\nTransfer to an oiled container and cold ferment in the fridge for 36 hours.\n\nStretch into an oiled 9×13 pan. Proof at room temp 2 hours until puffy.\n\nDimple aggressively with wet fingers. Drizzle with olive oil, flaky salt, and rosemary.\n\nBake at 230°C for 22–25 min until deep golden. Cool on a rack."}'),

('k2', 'cooking', 'Miso-glazed Eggplant', '2026-04-21',
 'Broiled a touch too long, crust got bitter. Sauce ratio nailed it.',
 7.8,
 '{"kind":"cooked","price":12,"photo":{"tone":"plum","shape":"arch"},"tags":["weeknight","japanese"],"difficulty":"easy","time":"25 min","portions":2,"ingredients":[{"qty":2,"unit":"","name":"Japanese eggplants"},{"qty":2,"unit":"tbsp","name":"white miso"},{"qty":1,"unit":"tbsp","name":"mirin"},{"qty":1,"unit":"tbsp","name":"sake"},{"qty":1,"unit":"tsp","name":"sesame oil"},{"qty":1,"unit":"tsp","name":"sugar"},{"qty":2,"unit":"","name":"scallions, sliced"},{"qty":1,"unit":"tsp","name":"sesame seeds"}],"instructions":"Halve eggplants lengthwise and score the flesh in a crosshatch. Brush with oil.\n\nMix miso, mirin, sake, sesame oil, and sugar until smooth.\n\nBroil eggplants cut-side down 5 min, then flip. Spoon glaze over the cut side.\n\nBroil 4–5 min more until the glaze is caramelised and flesh is tender.\n\nTop with scallions and sesame seeds."}'),

('k3', 'cooking', 'Strawberry Galette', '2026-04-12',
 'Used the leftover pâte brisée — basil sugar on top was the move.',
 9.0,
 '{"kind":"baked","price":9,"photo":{"tone":"rose","shape":"circle"},"tags":["dessert","summer"],"difficulty":"medium","time":"1h 15m","portions":6,"ingredients":[{"qty":200,"unit":"g","name":"pâte brisée (cold)"},{"qty":400,"unit":"g","name":"strawberries, hulled and halved"},{"qty":3,"unit":"tbsp","name":"sugar"},{"qty":6,"unit":"","name":"fresh basil leaves"},{"qty":1,"unit":"tbsp","name":"cornstarch"},{"qty":1,"unit":"","name":"egg (for egg wash)"},{"qty":1,"unit":"tbsp","name":"turbinado sugar"}],"instructions":"Toss strawberries with 2 tbsp sugar, cornstarch, and torn basil. Macerate 15 min.\n\nRoll dough on parchment into a rough 12-inch circle, about 3mm thick.\n\nPile filling in the centre leaving a 5cm border. Fold border up and pleat as you go.\n\nBrush crust with egg wash and sprinkle turbinado sugar over everything.\n\nBake at 200°C for 40–45 min until crust is deep golden and filling is bubbling.\n\nRest 10 min before slicing."}'),

('k4', 'cooking', 'Cacio e Pepe', '2026-04-05',
 'Sauce broke twice before it came together. Need a wider pan.',
 7.0,
 '{"kind":"cooked","price":8,"photo":{"tone":"sage","shape":"rounded"},"tags":["pasta","classic"],"difficulty":"hard","time":"20 min","portions":2,"ingredients":[{"qty":200,"unit":"g","name":"tonnarelli or spaghetti"},{"qty":80,"unit":"g","name":"Pecorino Romano, finely grated"},{"qty":30,"unit":"g","name":"Parmigiano Reggiano, finely grated"},{"qty":2,"unit":"tsp","name":"whole black peppercorns"}],"instructions":"Toast peppercorns in a wide pan over medium heat until fragrant, 2 min. Crush coarsely.\n\nCook pasta in salted boiling water until 2 min before al dente. Reserve 200ml pasta water.\n\nAdd a splash of pasta water to the pepper pan. Reduce heat to low. Add pasta and toss.\n\nAdd pasta water a little at a time, tossing constantly to build a glossy sauce.\n\nOff heat, add half the cheese and toss vigorously. Add remaining cheese and water as needed.\n\nServe immediately with extra Pecorino and cracked pepper."}');

-- Books
INSERT OR IGNORE INTO entries (id, category, name, date, notes, score, metadata) VALUES
('b1', 'books', 'A Memoir of the Hawk', '2026-04-25',
 'Dense in the middle but the last fifty pages broke me open.',
 9.1,
 '{"author":"J. Pessoa","price":22,"photo":{"tone":"clay","shape":"arch"},"tags":["memoir","lyrical"]}'),

('b2', 'books', 'Bright Earth', '2026-03-12',
 'History of pigments. Surprisingly emotional re: ultramarine.',
 8.4,
 '{"author":"Philip Ball","price":18,"photo":{"tone":"sky","shape":"circle"},"tags":["nonfiction","art"]}'),

('b3', 'books', 'The Long Hello', '2026-02-20',
 'Quiet novel. I underlined a lot.',
 8.0,
 '{"author":"A. Marsh","price":16,"photo":{"tone":"rose","shape":"rounded"},"tags":["fiction","quiet"]}');

-- Movies
INSERT OR IGNORE INTO entries (id, category, name, date, notes, score, metadata) VALUES
('m1', 'movies', 'Perfect Days', '2026-04-19',
 'Hirayama''s mornings live in my head now.',
 9.4,
 '{"price":14,"photo":{"tone":"sage","shape":"arch"},"tags":["drama","rewatch"]}'),

('m2', 'movies', 'Past Lives', '2026-03-22',
 'The 24-hour stretch in NYC — devastating in a soft way.',
 9.2,
 '{"price":14,"photo":{"tone":"plum","shape":"circle"},"tags":["drama","romance"]}'),

('m3', 'movies', 'Anatomy of a Fall', '2026-02-08',
 'The dog. That''s all.',
 8.6,
 '{"price":14,"photo":{"tone":"clay","shape":"rounded"},"tags":["thriller"]}');

-- Shows
INSERT OR IGNORE INTO entries (id, category, name, date, notes, score, metadata) VALUES
('s1', 'shows', 'Shōgun (S1)', '2026-04-30',
 'Hiroyuki Sanada commands every frame.',
 9.3,
 '{"photo":{"tone":"plum","shape":"arch"},"tags":["historical","epic"]}'),

('s2', 'shows', 'Slow Horses (S4)', '2026-04-02',
 'Lamb is the best character on television.',
 8.9,
 '{"photo":{"tone":"sage","shape":"rounded"},"tags":["spy","comedy"]}'),

('s3', 'shows', 'The Bear (S3)', '2026-03-15',
 'The first three episodes are perfect; the rest meanders.',
 7.8,
 '{"photo":{"tone":"butter","shape":"circle"},"tags":["drama"]}');

-- Albums
INSERT OR IGNORE INTO entries (id, category, name, date, notes, score, metadata) VALUES
('a1', 'albums', 'Brat', '2026-04-10',
 'Sweat-pop perfection. "Sympathy is a knife" lives on repeat.',
 9.0,
 '{"artist":"Charli XCX","photo":{"tone":"sage","shape":"circle"},"tags":["pop","electronic"]}'),

('a2', 'albums', 'Gold-Diggers Sound', '2026-03-25',
 'Velvety late-night drive album.',
 8.5,
 '{"artist":"Leon Bridges","photo":{"tone":"butter","shape":"arch"},"tags":["soul","r&b"]}'),

('a3', 'albums', 'A Light for Attracting Attention', '2026-02-28',
 'Tom Skinner''s drumming is the whole game.',
 8.7,
 '{"artist":"The Smile","photo":{"tone":"clay","shape":"rounded"},"tags":["rock","experimental"]}');

-- Coffee
INSERT OR IGNORE INTO entries (id, category, name, date, notes, score, metadata) VALUES
('cf1', 'coffee', 'Ethiopia Yirgacheffe', '2026-04-30',
 'Intensely floral — jasmine and bergamot up front. The acidity is electric, almost sparkling. One of the best cups this year.',
 9.2,
 '{"price":24,"origin":"Yirgacheffe, Ethiopia","roaster":"Blue Bottle Coffee","photo":{"tone":"butter","shape":"rounded"},"tags":["single-origin","light-roast","washed"],"attributes":{"complexity":4.5,"body":2.5,"roastLevel":1.5,"acidity":4.5},"flavors":{"sweet":3.5,"bitter":1,"earthy":1.5,"floral":5,"nutty":0.5,"spicy":0.5}}'),

('cf2', 'coffee', 'Colombia Huila', '2026-04-14',
 'Caramel sweetness with a juicy plum finish. Medium body, approachable acidity — a reliable morning pour-over.',
 8.4,
 '{"price":22,"origin":"Huila, Colombia","roaster":"Verve Coffee Roasters","photo":{"tone":"rose","shape":"rounded"},"tags":["single-origin","medium-roast","washed"],"attributes":{"complexity":3.5,"body":3.5,"roastLevel":3,"acidity":3},"flavors":{"sweet":4,"bitter":2,"earthy":2,"floral":2,"nutty":3,"spicy":1}}'),

('cf3', 'coffee', 'Sumatra Mandheling', '2026-03-22',
 'Earthy, syrupy, and bold. Dark chocolate and cedar. Not subtle — exactly what you want it to be.',
 7.8,
 '{"price":20,"origin":"North Sumatra, Indonesia","roaster":"Intelligentsia Coffee","photo":{"tone":"clay","shape":"rounded"},"tags":["single-origin","dark-roast","wet-hulled"],"attributes":{"complexity":3,"body":5,"roastLevel":4.5,"acidity":1.5},"flavors":{"sweet":2,"bitter":4,"earthy":5,"floral":0.5,"nutty":3.5,"spicy":2.5}}');
