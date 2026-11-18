# APEX MOTION

Configure your dream. Experience the difference.

An independent concept platform for configuring performance cars in 3D. Not affiliated with any vehicle manufacturer.

**Status: Phases 1, 2 and 4 complete; Phase 3 waiting on an asset.** The configurator runs a real-time 3D studio and a customisation engine that switches off options a model cannot show. No licensed car model exists yet, so catalogue cars show a labelled material sample, not a car. There is no database or sign-in yet; the pages say so wherever that matters.

## Run it

Requires Node 20.9 or newer (built and tested on Node 22).

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

| Command | Does |
| --- | --- |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Unit tests (Vitest) |
| `npm run asset:inspect -- model.glb [--out draft.json]` | List a model's real parts, materials, textures, size and problems; optionally write a draft manifest |
| `npm run asset:optimise -- in.glb out.glb [--ratio 0.5] [--texture 2048]` | Shrink a model for the web: simplify, WebP textures, Meshopt compression, names kept |
| `npm run asset:fixture` | Rebuild the loader test model (blocks, not a vehicle) |

No environment variables are needed in Phase 1. `.env.example` lists the ones Phase 6 will use.

## Stack

Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript, Tailwind CSS 4, Zustand, Three.js with React Three Fiber and Drei, GSAP for camera moves. Framer Motion is installed but not yet used. Supabase joins in Phase 6.

## Structure

```
app/                      routes
  page.tsx                home
  cars/                   catalogue and /cars/[slug] details
  configure/              car chooser and /configure/[slug] configurator
  garage/ compare/ gallery/ about/ contact/ admin/
  auth/login|register|recover/
components/
  brand/                  logo
  ui/                     Button, Nav, Footer, PageHeader, StudioBay
  showroom/               ShowroomStage (loader, fallback, controls), Showroom (canvas),
                          Studio, CameraRig, VehicleModel, SampleForm (placeholder)
  cars/ configurator/ compare/ garage/ contact/ auth/
lib/
  vehicles/               types.ts (data model), data.ts (nine-car seed), slots.ts (mesh mapping, visibility,
                          disposal), fixture.ts (loader test model manifest, not in the catalogue)
  showroom/               quality.ts, environments.ts, cameras.ts, materials.ts
  customisation/          options.ts (categories, pricing, share links), capabilities.ts (what each model can show)
stores/                   garage.ts (saved builds), showroom.ts (quality tier, camera commands)
tools/asset-pipeline/     inspect, optimise and fixture scripts
public/fixtures/          compressed loader test model
tests/                    unit tests
docs/                     adding-a-vehicle.md, phase-1-report.md
```

## Rules the code follows

- **No fake 3D.** Until a car has a licensed, verified model, the interface shows the empty studio bay with the car's generation code. It never shows a stand-in car or a static picture presented as 3D.
- **No invented facts.** Values that could be read as manufacturer figures are wrapped in `Sourced<T>` with a status of `verified`, `unverified` or `illustrative`. Performance figures, dimensions and base prices are blank until verified. Option prices are illustrative and labelled.
- **No editorial-only assets without sign-off.** `VehicleAsset.licence.commercialUse` must be true before a model is marked verified; a unit test enforces it.

## Deploying

The project deploys to Vercel with default settings: import the repository, framework preset Next.js, no environment variables for Phase 1.

## Connecting to GitHub

Git is already initialised. To publish:

```bash
git add -A && git commit -m "Phase 1: design system, routing and page layouts"
git remote add origin https://github.com/<you>/apex-motion.git
git push -u origin main
```

## Roadmap

1. Set-up, design system, brand, routing, page layouts (done)
2. 3D showroom and vehicle loading system (done)
3. Porsche 911 as the first configurable car (waiting on a licensed model)
4. Reusable customisation engine (done)
5. Remaining eight cars
6. Supabase, authentication, saved builds, garage
7. Compare, gallery, sharing, admin
8. Testing, optimisation, security review, deployment

See the reports in `docs/` for what was tested and what is deliberately not live. `/dev/loader-test` runs the configurator against the test model; it is switched off in production.
