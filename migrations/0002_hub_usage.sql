-- Add hub counts without rewriting or deleting historical reasoning totals.
CREATE TABLE IF NOT EXISTS hub_usage (
 day TEXT NOT NULL,
 page TEXT NOT NULL CHECK(page = 'hub'),
 page_views INTEGER NOT NULL DEFAULT 0,
 visits INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(day,page)
);
CREATE VIEW IF NOT EXISTS usage_totals AS
 SELECT day,page,page_views,visits FROM daily_usage
 UNION ALL
 SELECT day,page,page_views,visits FROM hub_usage;
