# Phase 1 report

## Completed

- Next.js 16 project with TypeScript, Tailwind 4, ESLint, Vitest.
- Design system: colour, type and motion tokens in `app/globals.css`; Button, Nav, Footer, PageHeader, Notice, StudioBay components.
- Brand identity: original racing-line logo mark and wordmark, Saira (display) with Geist (text), silver-on-carbon palette with violet reserved for interactive and selected states.
- Typed vehicle data model and a nine-car seed. AMG GT targets the C192 generation.
- Routes: `/`, `/cars`, `/cars/[slug]`, `/configure`, `/configure/[slug]`, `/garage`, `/compare`, `/gallery`, `/about`, `/contact`, `/auth/login`, `/auth/register`, `/auth/recover`, `/admin`, and a not-found page.
- Working now: catalogue search and filters; option selection with live summary and illustrative option pricing; save, rename, duplicate, delete and edit builds (stored in the browser); share links that restore a build; compare up to three cars; contact and auth form validation.
- Manufacturer non-affiliation disclaimer in the footer and on About.

## Tested

| Check | Result |
| --- | --- |
| `npm run lint` | Pass |
| `npm run typecheck` (via build) | Pass |
| `npm test`: 9 unit tests on pricing, share-link encoding, catalogue rules | Pass |
| `npm run build` | Pass, 35 pages generated |
| HTTP status of all 17 routes plus an unknown path | 200 for routes, 404 for unknown path |
| Browser flow in headless Chrome: choose paint and body part, save, see it in garage, duplicate, edit restores selection | Pass |
| Contact form shows four errors when submitted empty | Pass |
| Catalogue search "v10" returns one car | Pass |
| Browser console and page errors during the above | None |
| Visual review at 1440x900 and 390x844: home, cars, details, configurator | Reviewed from screenshots |

## Not tested

- Safari, Firefox and real mobile devices. Only headless Chrome was used.
- Tablet widths between 390 and 1440 px were not screenshotted.
- Screen-reader behaviour. Semantics and focus states are in place but unaudited.
- Rename, delete and share-link copy in the garage were not exercised in the browser run.

## Deliberately not live, and labelled as such in the interface

- 3D viewport, camera views, custom colour picker, Download image (Phase 2 to 4).
- Accounts, cross-device garage, contact delivery (Phase 6). Forms validate and state plainly that nothing is sent.
- Gallery publishing and admin tools (Phase 7). Gallery shows an honest empty state; admin modules are locked.

## Known issues

- An unknown car address such as `/cars/nope` shows the not-found page but returns HTTP 200, a side effect of Next's Cache Components streaming. `dynamicParams = false` is not allowed with that setting. Options for Phase 8: turn Cache Components off, or accept it.
- Vehicle identity facts are marked unverified and need checking against manufacturer sources.
- All option prices are illustrative.

## Next: Phase 2

React Three Fiber canvas mounted inside `StudioBay`, studio lighting and floor, camera presets with smooth transitions, adaptive quality tiers, lazy per-vehicle loading with progress and disposal, WebGL fallback. Built against a clearly labelled development placeholder shape, not a stand-in car.
