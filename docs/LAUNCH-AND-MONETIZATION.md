# Public launch and monetization plan

Updated 2026-11-16. Planning guidance, not enabled billing or ads. No spending or ad network integration authorized by this document.

## Positioning and first audience

The workers.dev site is already publicly accessible. Treat the next step as a controlled beta, not simply making the URL public. Start with one clear promise: short, playful French lessons and reasoning practice for children, managed by parents. Avoid claims of validated IQ, diagnosis, fixed personality or certified fluency. Recruit 20–50 families and 2–3 teachers through personal introductions and parent groups where promotion is allowed. Ask adults whether the child can start, finish and return to a lesson; use feedback to improve content before paid acquisition. Test demand for French first rather than simultaneously building many languages.

## Before broad promotion

- Choose a memorable domain and connect it to Cloudflare; update Google origins and Supabase exact redirects when the domain changes. Domain purchase remains an owner decision.
- Test an actual Google login/callback/sign-out with an unrelated adult account. The app uses identity-only scopes; Google documents an exception to ordinary Testing-mode user limits for basic sign-in. Check current branding/audience and publish appropriately, rather than assuming the generic 100-user restriction applies.
- Publish clear privacy, terms, contact/support and data deletion information, with accurate disclosure of local profiles, Supabase identity and optional speech recognition. Determine launch countries and obtain children's-privacy advice before adding tracking, cloud child records or advertising. The adult checkbox is not verified parental consent.
- Have a French educator review vocabulary, instructions and conversation progression. Test low-end phones, keyboard use, voice availability and contrast. Give users a clear feedback route.
- Add useful indexable parent-facing pages, descriptive metadata and a sitemap; submit the chosen domain to Search Console. Do not promise search ranking.
- Before selling continuity, implement optional secure cloud progress, ownership policies, conflict handling, export/deletion and verified integration tests. Current progress is device-local, and paid entitlements cannot be secured with client-side localStorage flags.

## Recommended revenue sequence

1. Keep useful daily practice and introductory French free. Test a parent-paid family plan for additional reviewed lesson packs, printable activities, parent summaries and eventual cross-device progress. A suggested research price band is INR 149–299/month, not a market valuation or established willingness to pay. Survey and pilot before implementing payments.
2. Offer one-time printable/story/conversation packs. Keep checkout in the adult area with clear contents, pricing and refund terms.
3. Pilot teacher/classroom licenses only after educator feedback. Class management and child-record storage introduce additional permissions, consent and security work.
4. Consider clearly labeled fixed sponsorships on genuinely parent-facing editorial pages after audience validation. Review sponsor suitability and avoid behavioral targeting or using children's answers/interests for ads.

## Advertising tradeoffs

AdSense approval is not automatic: Google requires original, useful content and policy compliance. For COPPA-covered services Google requires child-directed treatment and prohibits interest-based targeting based on under-13 users or child-directed activity. The FTC also treats third-party collection on behalf of a child-directed service as relevant; a parent login does not automatically exempt the learning pages. Non-personalized ads are not automatically tracking-free or legally compliant. Review the actual SDK/scripts, countries, consent and privacy disclosures before integrating anything. Avoid interstitials, rewarded ads for lesson completion, or ads beside answer buttons.

My recommendation is an ad-free learning experience, supported first by optional parent purchases. Ads can be revisited once retention and meaningful traffic are established. Hypothetical arithmetic only: 100 paying families at INR 199/month yields INR 19,900 gross before fees/tax/refunds/costs. At an assumed (not forecast) INR 50 page RPM, 100,000 monetized page views yields INR 5,000 gross. Actual ad RPM, fill and eligibility vary substantially.

## Scaling without premature cost

Keep static lesson content and assets on Cloudflare. Cloudflare currently documents free/unlimited static asset requests; Worker compute, authentication, database, storage and future paid APIs have separate limits and charges. Do not assume that makes the whole product free at any scale. Add a backend only for requirements such as synchronization, billing and teacher workflows. Use adult-account authorization and row-level policies for records. Cache reviewed content, impose quotas on future voice/AI services, and set budget alerts. Do not put expensive live AI generation in every child interaction.

Measure activation (first lesson completed), week-two return and parent-reported learning value. Prefer adult feedback and minimal aggregate measurements over profiling children. Analytics itself requires a data/consent review. Define the retention threshold for expanding the pilot before paying for acquisition.

## Official references checked

- Google OAuth audience and identity-only exception: https://support.google.com/cloud/answer/15549945
- AdSense eligibility: https://support.google.com/adsense/answer/9724
- Google child-directed advertising policy: https://support.google.com/publisherpolicies/answer/10436800
- Google personalized advertising restrictions: https://support.google.com/publisherpolicies/answer/15101728
- FTC COPPA FAQ: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- Cloudflare static asset billing: https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/

Country-specific legal applicability, deadlines and consent requirements must be checked for the actual launch markets. This plan does not assert that the current app has passed legal review.
