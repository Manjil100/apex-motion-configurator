# Adding a vehicle

The loader, slot resolver and camera system from Phase 2 handle every step below. No real model has been through them yet.

1. **Catalogue entry.** Add a seed object to `lib/vehicles/data.ts`. Give it a unique `slug`. Mark identity facts with `u(...)` (unverified) unless you have checked them against a manufacturer source, in which case use `{ value, status: "verified", source: "<url>" }`. Leave `basePrice` null until verified. The car now appears in the catalogue, details, compare and configurator pages with the empty studio bay.

2. **Source the model.** The licence must allow commercial use. Do not use editorial-only or "IP restricted" assets without the project owner's sign-off. Record vendor, listing URL, licence text and purchase date.

3. **Inspect.** List every node and material in the file with `inventory()` from `lib/vehicles/slots.ts`. Check exterior, interior, scale, orientation, texture quality and whether parts are separate meshes.

4. **Convert.** Export to GLB with compressed geometry and KTX2 textures. Starting budgets: about 300k triangles desktop, 100k mobile.

5. **Place.** Put the GLB where the app can fetch it and set `asset.modelUrl`. Add `asset.cameras` for any view whose default framing does not suit the car; `interior` has no default and stays disabled until you set it.

6. **Map.** Fill `asset.slots`, mapping each generic slot (`car_body`, `brake_calipers`, `seats`, ...) to the file's real node and material names. For anything the model cannot support, set `{ supported: false, reason }`; the configurator disables that option and shows the reason.

7. **Verify.** Write `docs/asset-reports/<slug>.md` covering identity, licence, inventory, mapping, what is approximate, and measured load time. Only then set `asset.status` to `"verified"`.
