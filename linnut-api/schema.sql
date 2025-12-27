-- Sightings table
CREATE TABLE IF NOT EXISTS sightings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  species TEXT NOT NULL,
  latin_name TEXT,
  location TEXT,
  date TEXT NOT NULL,
  image_url TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Index for faster searching
CREATE INDEX IF NOT EXISTS idx_species ON sightings(species);
CREATE INDEX IF NOT EXISTS idx_date ON sightings(date);
CREATE INDEX IF NOT EXISTS idx_location ON sightings(location);