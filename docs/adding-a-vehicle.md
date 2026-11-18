# Adding a vehicle

The loader, slot resolver and camera system from Phase 2 handle every step below. No real model has been through them yet.

1. **Catalogue entry.** Add a seed object to `lib/vehicles/data.ts`. Give it a unique `slug`. Mark identity facts with `u(...)` (unverified) unless you have checked them against a manufacturer source, in which case use `{ value, status: "verified", source: "<url>" }`. Leave `basePrice` null until verified. The car now appears in the catalogue, details, compare and configurator pages with the empty studio bay.

2. **Source the model.** The licence must allow commercial use. Do not use editorial-only or "IP restricted" assets without the project owner's sign-off. Record vendor, listing URL, licence text and purchase date.

3. **Inspect.** Run `npm run asset:inspect -- model.glb --out draft.json`. It lists every mesh node, group node, material and texture by its real name, and warns about wrong units, a model that is not Y-up, a floating origin, too many triangles and oversized textures. Check exterior, interior, scale, orientation, texture quality and whether parts are separate meshes.

4. **Convert.** If the source is FBX or BLEND, export GLB from Blender first. Then run `npm run asset:optimise -- in.glb out.glb`. Starting budgets: about 300k triangles desktop, 100k mobile. Inspect the result again and look at it: simplification can damage badges, grilles and stitching, so lower `--ratio` gently.

5. **Place.** Put the GLB where the app can fetch it and set `asset.modelUrl`. Add `asset.cameras` for any view whose default framing does not suit the car; `interior` has no default and stays disabled until you set it.

6. **Map.** Fill `asset.slots` from the draft, mapping each generic slot (`car_body`, `brake_calipers`, `seats`, ...) to the file's real node or material names. For anything the model cannot support, set `{ supported: false, reason }`; the configurator switches that option off and shows the reason. Add `asset.visibility` for anything an option switches on or off: alternative wheel sets (`wheels`) and add-on parts (`body`), keyed by option id, naming nodes to `show` and `hide`. An option with no rule is switched off for that car, and old share links that include it are cleaned up on load. `lib/vehicles/fixture.ts` is a complete worked example. Check the result at `/dev/loader-test` style: point a dev page at the new car before adding it to the catalogue.

7. **Verify.** Write `docs/asset-reports/<slug>.md` covering identity, licence, inventory, mapping, what is approximate, and measured load time. Only then set `asset.status` to `"verified"`.
