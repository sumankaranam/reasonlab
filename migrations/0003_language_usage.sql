-- Preserve all existing counters and add the new courses.
CREATE TABLE IF NOT EXISTS language_usage (
 day TEXT NOT NULL,
 page TEXT NOT NULL CHECK(page IN ('tamil','kannada')),
 page_views INTEGER NOT NULL DEFAULT 0,
 visits INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(day,page)
);
DROP VIEW IF EXISTS usage_totals;
CREATE VIEW usage_totals AS
 SELECT day,page,page_views,visits FROM daily_usage
 UNION ALL SELECT day,page,page_views,visits FROM hub_usage
 UNION ALL SELECT day,page,page_views,visits FROM language_usage;
