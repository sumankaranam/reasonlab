CREATE TABLE IF NOT EXISTS daily_usage (
  day TEXT NOT NULL,
  page TEXT NOT NULL CHECK(page IN ('kids','french','discovery','account','classic')),
  page_views INTEGER NOT NULL DEFAULT 0,
  visits INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(day,page)
);
CREATE TABLE IF NOT EXISTS sent_reports (day TEXT PRIMARY KEY);
