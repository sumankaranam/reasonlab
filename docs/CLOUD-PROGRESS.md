# Cloud progress and adult controls

## Scope and activation

Adults sign in, open Account, confirm the cloud-saving choice and enable it per device. No new Supabase table, secret key or provider is needed: the existing Supabase account verifies identity and the existing Cloudflare D1 binding stores an account-scoped copy. Deploy migration `0004_cloud_progress.sql` before deploying the API.

Included: three learner nicknames/avatars, numeric Kids/French settings, completed Kids and Reasoning Adventures summaries, French journey/lesson progress, Tamil/Kannada completion records and vocabulary review schedules. Not included: guest data, Discovery/personality reflections, Classic history, recordings, unfinished answers or language drafts. A cloud restore replaces included local progress and clears local drafts after the adult confirms; automatic startup refresh preserves valid local drafts.

## Client flow

`auth-client.js` verifies the account using the existing service, then awaits `initializeCloud` before a learning page reads its account-scoped storage. A failed verification or sign-out aborts client work and deactivates sync. No silent guest import.

`cloud-core.js` reads a fixed allowlist of account-local keys and projects data into versioned DTO fields. It never serializes arbitrary localStorage, auth tokens or raw typed answers. Restore writes only those keys and attempts rollback on storage errors. A malformed local JSON record blocks upload rather than uploading an empty replacement. Device storage remains unencrypted.

`cloud-sync.js` stores per-device opt-in, revision and SHA-256 digest in `reasonlab-cloud:<user UUID>`. Every four seconds while visible it checks local changes; unchanged data does not trigger network requests. Changed data or retryable errors cause a checked save. Startup/manual checks fetch cloud state. Errors retain device data; retry delay is 20 seconds. The footer shows save/conflict status and links to account controls through the existing activity leave guard. Closing before a save finishes can leave new work only on the device.

No automatic merge: matching base revisions permit a conditional upload. If remote data changed, unchanged local data can be refreshed before page startup. While a page is active, conflicting or newly changed remote data pauses saving and requires adult choice. Restore cloud and Replace cloud are explicit confirmations. An already accepted server write may finish after a client abort; abort is not rollback.

## Server authorization and storage

`worker/progress.js` handles same-origin GET/PUT/DELETE `/api/progress`. It validates the Bearer token by requesting the fixed Supabase project's `/auth/v1/user` using the public project key. Only the verified returned UUID selects the database row; a body user ID is ignored. Anonymous identities are rejected. There is no service-role key, custom JWT decoding, public list endpoint or CORS grant. Responses are no-store.

The request body is streamed with a 256 KiB ceiling. DTO cleaning happens again on the server. Invalid credentials return 401, cross-origin access 403, stale revision 409, oversized data 413, and unavailable upstream/database 503. Tokens and snapshots are not logged by application code.

`learning_progress(user_id PRIMARY KEY, revision, payload, updated_at)` uses one conditional INSERT/UPDATE RETURNING statement. Matching revisions prevent stale overwrites. DELETE sets payload to NULL and advances the revision; this minimal tombstone prevents old devices silently recreating deleted data. The account UUID, revision and timestamp remain, as disclosed publicly. Records remain until adult deletion; the aggregate usage retention job does not touch progress. These are separate data categories in the same D1 binding.

Reference: [Supabase getUser](https://supabase.com/docs/reference/javascript/auth-getuser) describes requesting an authentic user record from the Auth server. Browser getSession only supplies the token; server authorization never trusts its embedded client user object.

## Verification and limits

`tests/cloud.test.mjs` tests projection/identity scoping, partial-write rollback, authorization/origin/body rejection, two-account isolation, actual in-memory SQLite conditional writes/tombstones, startup restore, conflicts and logout cancellation. `tests/browser/cloud-account.mjs` uses two browser contexts with simulated auth and remote transport to verify consent, restore, conflict, deletion and account separation. These mocks do not establish a real Google login or authenticated production save.

Production acceptance with two devices: sign in to the same adult account, enable saving on device A, complete a lesson and wait for confirmation. Enable on B and choose the cloud copy; confirm the correct learner and completion. Make competing changes to verify the explicit choice. Delete the cloud copy and confirm A does not automatically recreate it. Do not paste access tokens into chat or store them in fixtures.

## Owner deployment

Use authenticated Wrangler: `wrangler d1 migrations apply reasonlab-usage --remote`, then deploy the existing Worker. Keep Google OAuth and email sender configuration separate. Email reports still need the previously deferred Resend setup. No paid service was added by this feature.

## Workers runtime note

The server-side Supabase request uses `redirect: manual`; a non-OK redirect is rejected. Cloudflare Workers rejects `redirect: error` with TypeError even though Node and browsers support it. See [Workers Request API](https://developers.cloudflare.com/workers/runtime-apis/request/). This runtime difference was found and fixed during production rejection checks. Client browser fetch can retain `error`.
