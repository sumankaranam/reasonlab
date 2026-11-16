# Daily owner statistics and email setup

Updated 2026-11-16. Recipient: sumanmighty@gmail.com. Schedule: 9:00 AM Asia/Kolkata (03:30 UTC), previous calendar day. The owner chose cloud scheduling so the computer can be off, and explicitly deferred sender setup. No Codex desktop automation is needed.

## What is implemented

- A first-party `/api/usage` endpoint stores date/page aggregate totals in Cloudflare D1 `reasonlab-usage` (binding `USAGE_DB`). Five page labels only: Kids, French, Discovery, Account, Classic. No identity, IP, user agent, child name, answers, audio or URL query stored in this database. Cloudflare still handles network metadata.
- Browser page loads count page views. A new tab or a subsequent page load after 30 minutes without a recorded load in that tab counts an estimated visit. A tab-local timestamp stays in sessionStorage; it is never sent. These are not unique people or reliably deduplicated sessions. Multiple tabs/devices, restored tabs, bots, blockers and spoofed requests affect results. Do not call them exact visitors or use them for billing.
- Browser opt-out, Do Not Track and Global Privacy Control skip collection. Storage failures skip collection; learning remains usable. Only one event per document, including when a hidden page first becomes visible. Dynamic in-page lesson navigation does not count as a new page view.
- Counts start at deployment; no past traffic can be recovered. First day includes setup/QA traffic and may be partial. Aggregate retention is approximately 90 days, cleaned by the daily scheduled job.
- The cloud scheduled job is configured, but sends nothing without `RESEND_API_KEY`. With sender configured but registration setup missing, the email explicitly says registrations are unavailable. No fake zeroes.
- Registration totals count currently retained adult Supabase auth accounts by creation date, not anonymous child profiles. Deleted accounts are absent. Email/Supabase responses are not logged. Successful email API acceptance does not prove inbox delivery.

## Finish setup later

1. Create a Resend account at https://resend.com with **sumanmighty@gmail.com**. Resend's `onboarding@resend.dev` testing sender can send only to the address used for that Resend account. This is enough to test this owner-only report without buying a domain. For an established sender or other recipients, verify a domain you own and use its sender address. No public-user email login is enabled by this setup.
2. Create a sending API key in Resend. In Cloudflare Dashboard → Workers & Pages → **reasonlab** → Settings → Variables and Secrets, add **RESEND_API_KEY** as a Secret. Paste the key directly there, never in chat, source, `.jsonc`, screenshots or Git. Recipient is fixed server-side to the owner's email; no public email-send endpoint exists.
3. In your existing Supabase project `krbuoncrksahcrnufprg`, open SQL Editor and run the contents of `scripts/supabase-reporting.sql`. It defines an aggregate-only function over `auth.users` and revokes execution from public/anonymous/authenticated clients. Only service_role can execute it. This SQL is prepared but has NOT been executed by Codex.
4. In Supabase API key settings, obtain a server secret key (or legacy service_role key). Add it directly to Cloudflare as Secret **SUPABASE_REPORT_KEY**. This is a highly privileged key: keep it server-only, restrict dashboard access and rotate it if exposed. The deployed browser public key cannot query registration totals. The report only calls the aggregate RPC; it does not download user lists.
5. Optional: after verifying a sender domain, add **REPORT_FROM** (e.g. `ReasonLab <reports@yourdomain.com>`) as a Worker variable. Without it, sender defaults to `ReasonLab <onboarding@resend.dev>`.
6. Save/deploy the secret configuration in Cloudflare. The Worker cron is already `30 3 * * *` (UTC). Check Triggers/Cron Events to confirm it is enabled; updates may take time to propagate. Do not create a duplicate desktop/GitHub schedule. The site code need not be modified when adding secrets.
7. After the next 9 AM India run, check Cloudflare scheduled invocation status and your inbox/spam. Provider acceptance logs say `Daily report accepted by email provider`. Missing sender logs `Daily report pending sender setup`. Sender errors fail the invocation; they do not mark the day as sent. If new registrations says unavailable, verify SQL grants/key and look at the function configuration. Never log provider response bodies or keys to debug.

For a deliberate first-send test before waiting until morning, an operator can temporarily invoke a scheduled event using the Cloudflare supported development/testing workflow with secrets securely supplied; do not add a public send-report endpoint. Real provider/Supabase testing remains outstanding until keys are configured.

## Viewing counts before email is enabled

Open Cloudflare D1 → **reasonlab-usage** → Console and run:

```sql
SELECT day, SUM(visits) AS estimated_tab_visits, SUM(page_views) AS page_views
FROM daily_usage GROUP BY day ORDER BY day DESC LIMIT 30;
```

To see the breakdown: `SELECT * FROM daily_usage ORDER BY day DESC, page;`.

Supabase Authentication → Users shows adult accounts. Do not mistake child nickname profiles (browser-only) for registrations. Counts are owner-only in provider dashboards; the public website has no stats read endpoint.

## Reliability and maintenance

`worker/reporting.js` uses India-time day boundaries, an email idempotency key per report date, and `sent_reports` to skip accepted reports on later invocations. Resend's provider idempotency retention is finite; if provider acceptance succeeded but the D1 write failed, retries outside that retention can duplicate mail. Cron does not guarantee retry/catch-up for missed days. Monitor scheduled failures; no secondary alert channel is configured. Do not represent the system as exactly-once delivery.

Public usage requests are same-origin JSON, bounded and allowlisted; they are still unauthenticated and can be artificially inflated. Endpoint intentionally accepts no child/user fields. D1/Worker quotas apply; review billing before heavy promotion. Static assets still use asset-first routing except `/api/*`.

## Files and tests

- `public/usage.js`: page-load events, tab-local timestamp, privacy signals.
- `public/usage-privacy.*`: visitor explanation and opt-out, linked from footers.
- `worker/index.js`: write-only endpoint, static fallback and cron handler.
- `worker/reporting.js`: aggregate query, report text, Resend send/dedup.
- `migrations/0001_usage.sql`: aggregate D1 schema, applied to cloud database.
- `scripts/supabase-reporting.sql`: owner-run aggregate registration RPC, not applied yet.
- `tests/reporting.test.mjs`: day boundaries, validation, rejection, missing/failed providers and dedup.
- `tests/browser/usage.mjs`: mocked collection tests; no actual email or registration credentials.

## Official references

- https://resend.com/docs/knowledge-base/403-error-resend-dev-domain
- https://resend.com/docs/api-reference/emails/send-email
- https://developers.cloudflare.com/workers/configuration/cron-triggers/
- https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
- https://supabase.com/docs/guides/auth/users

This owner report does not enable advertising, marketing email, child profiling, or email OTP sign-in.
