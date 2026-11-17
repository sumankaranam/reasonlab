CREATE TABLE IF NOT EXISTS learning_progress (
  user_id TEXT PRIMARY KEY NOT NULL,
  revision INTEGER NOT NULL CHECK (revision > 0),
  payload TEXT,
  updated_at TEXT NOT NULL
);
