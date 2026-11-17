# Phase 2 report

## Completed

- **3D studio** in the configurator: React Three Fiber canvas with ACES tone mapping, generated environment maps, key light, contact shadow and a reflective floor on capable devices.
- **Three lighting rigs** (studio, daylight, night) built from light panels in code. No HDR files are downloaded.
- **Camera system:** drag to rotate, scroll or pinch to zoom, named views (three-quarter, front, side, rear) with GSAP transitions, zoom buttons, reset and full screen. Limits keep the camera above the floor and outside the subject. Portrait screens pull the camera back automatically. Reduced-motion preference removes the animation.
- **Adaptive quality:** three tiers chosen from device hints, stepping down automatically if the frame rate drops. The lowest tier switches off shadows and floor reflection.
- **Vehicle loading architecture:** `VehicleModel` loads a GLB only when its car is opened, drives materials through the manifest's slot mapping, shows real download progress, reports load errors, and disposes geometry, materials and textures on unmount.
- **Slot resolver** (`lib/vehicles/slots.ts`): maps a model's real node and material names to configurator slots, never guesses a name, and includes an inventory function for writing manifests.
- **WebGL fallback:** without WebGL the static studio bay is shown with an explanation, and options, pricing and saving keep working.
- **Now live that Phase 1 had switched off:** custom colour picker (carried through pricing, saved builds and share links) and Download image.
- **Lazy loading:** the 3D bundle is fetched only when a configurator opens.

## What stands in the studio

A material sample board: one large painted form, a caliper-colour sphere and a leather block with a stitched seam. It is a development placeholder, labelled on screen as "Material sample, not the <model>", and downloaded images are named `...-material-sample.png`. Paint, caliper, leather and stitching choices change real materials on it. Wheel designs, trim and body additions are recorded and priced but have nothing to show on until a car model exists.

## Tested

| Check | Result |
| --- | --- |
| Lint, typecheck, production build | Pass |
| 22 unit tests (slot resolver, quality tiers, cameras, paint, custom colour, pricing, share links, catalogue) | Pass |
| Headless Chrome with software WebGL: canvas renders | Pass |
| Choosing Racing red raises the red channel of the rendered frame | Pass |
| Side view changes the frame and marks the button active | Pass |
| Interior view is disabled | Pass |
| Daylight renders brighter than studio | Pass |
| Mouse drag rotates the scene | Pass |
| Download image saves a PNG (about 200 KB) | Pass |
| Share link with custom colour, yellow calipers, tan leather, red stitching renders those colours | Pass, checked by screenshot |
| Opening four cars in succession, console and page errors | None |
| 390 px wide viewport renders and frames the sample | Pass |
| WebGL disabled: fallback message shown, no canvas mounted | Pass |

## Not tested

- **Loading a real vehicle GLB.** No licensed model exists. The loader, progress bar, error message and disposal path are written but have never run against a real file. The slot logic they depend on is unit-tested with in-memory meshes.
- Real GPUs. Everything ran on software rendering, so frame rate, the automatic tier step-down and the reflective floor's look on hardware are unconfirmed.
- Touch gestures on a physical device, Safari and Firefox.
- Memory use over a long session.
- Full screen (headless Chrome cannot enter it).

## Known issues

- The night rig is dark enough that the leather sample is hard to see.
- The sample sits small on very tall phone screens.
- Carried over from Phase 1: unknown car addresses return HTTP 200 with the not-found page.

## Next: Phase 3

Porsche 911 as the first real configurable car. This is blocked on an asset: a 911 model whose licence allows future commercial use. The leads found so far are editorial-only, so Phase 3 starts with a sourcing decision, not code.
