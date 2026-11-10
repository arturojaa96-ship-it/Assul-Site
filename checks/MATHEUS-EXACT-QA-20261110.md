# Matheus snippet candidate QA, 2026-11-10

Local candidate only. Source copy: verified main merge 1e0090aaf6cdb7a46d77c351e52e4927c4487c87, as supplied by parent. No Git commands, external network, remote container changes or publication were performed.

## Implementation

- Both pages begin their head with the confirmed GTM-5RM4RSMJ async script and global gtag/js initialization. Code tokens match Matheus's screenshot. Canonical LF formatting is used because screenshot wrapping cannot establish original whitespace byte-for-byte.
- Exact inline hash: sha256-jYHg7tXSuuVUqjy+JeRT8vyG97+Spkw5IFHdQEBbmrw=.
- CSP differs only by adding that hash to script-src. No unsafe-inline, new domain, other directive or cache policy change.
- Removed dynamic GTM loader and additional gtm.start/event gtm.js startup. No direct AW tag, extra js initialization, conversion/config commands or local form-field transmission was added. app.js is byte-identical to source.
- Consent UI updates signals without reloading or claiming that withdrawal unloads GTM. Existing choice/session/URL fallbacks remain. Default denial is deferred and can lose the race against the async GTM load.
- Both pages request assets/privacy.js?v=matheus-20261110 to avoid reusing the previous one-hour-cached dynamic loader. Old cached HTML still uses the old consent loader alone. New HTML uses the versioned consent-only script.
- Public policy and both banners describe initial connection, deferred signal timing, withdrawal limitations, and lack of control over remote tags. README and SECURITY identify historical reports as superseded.

## Passed

- npm run check: form validation/injection safety, 19 unchanged brand/image hashes, two pages, 35 local references, 11 consent VM groups, exact inline bytes/hash, global gtag, one js initialization per page, no second loader/startup, no direct Ads tag, versioned privacy reference, exact CSP comparison.
- npm run smoke: 17 loopback requests, including versioned privacy.js, private files/backend routes return 404, security headers present.
- Consent VM covers grant/reject/regrant, duplicate actions/evaluation, focus/cancel/Escape, invalid/expired records, cross-tab deletion/refusal, BFCache/visibility, failing storage, URL/session fallbacks, exact grant host list, malformed dataLayer, and saved preferences across pages.
- No backups removed; original verified copy preserved.

## Limits

No browser rendering or live deployment/network/Tag Assistant/remote GTM inspection. VM and loopback HTTP tests do not execute Google code and cannot prove tag behavior, delivered production CSP, or consent sequencing in a real browser. Parent must verify actual remote state before publishing claims.

The literal HTML requests GTM regardless of consent or hostname. Local host checks restrict only grant signals, not this request. No changes were made to Assul.com.br. The local code does not read or transmit form fields to Google, but arbitrary remote GTM configuration cannot be certified by these tests. The snippet does not include standard gtm.start/event gtm.js; no supplementary events were added, preserving the requested code.
