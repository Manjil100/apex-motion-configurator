# Phase 6 report: accounts, saved builds, enquiries

## Completed

- **Supabase project** `apex-motion` in Sydney. To stay within the free plan's two active projects, `my-cafe` was paused at the owner's request.
- **Schema** with all ten tables from the brief: profiles, vehicles, vehicle_assets, customisation_categories, customisation_options, configurations, configuration_options, favourites, gallery_posts, enquiries. Primary and foreign keys, indexes on every foreign key, timestamps with update triggers, and check constraints.
- **Constraints carrying the project's rules.** A vehicle price cannot be stored without a status, and a model cannot be marked verified unless its licence allows commercial use. Enquiry lengths and email format are checked in the database as well as the form.
- **Row Level Security on every table.** Customers see and change only their own builds. The catalogue is read-only to the public, and only admins write to it. Anyone can send an enquiry, but only admins read them. The admin check lives in a private schema the API does not expose. Customers cannot change their own role (column-level grant).
- **save_configuration()** saves a build and its options in one transaction, running as the caller so RLS still applies.
- **Seed data** generated from the app's own catalogue files (`tools/db/generate-seed.ts`), so the database and the code start identical.
- **Accounts:** create account (with email confirmation), sign in, sign out, password reset through an emailed link, and choose a new password. Errors are explained in plain language. Email links can only redirect within this site.
- **Garage:** signed in, builds are saved to the account; signed out, they stay in the browser as before. Signing in offers to move browser builds into the account. Rename, duplicate, delete, share and edit work in both modes.
- **Contact form:** a server action validates again on the server and stores the enquiry. It includes a honeypot field against simple bots.
- **Session refresh** in `proxy.ts`, skipped entirely for visitors without a session cookie.
- **Fixed a bug present since Phase 1:** saving a new build remounted the configurator, reloading the 3D studio and losing the "Saved" message.

## Tested

| Check | Result |
| --- | --- |
| 23 database access checks as two customers, a visitor and an admin (`supabase/tests/rls-check.sql`), before and after hardening | All pass |
| Supabase security advisor | No findings |
| Supabase performance advisor | Only "unused index" notices on the new, empty database |
| Lint, typecheck, production build | Pass |
| 37 unit tests (6 new: build mapping, shared validation) | Pass |
| Browser flow against a simulated Supabase: save signed out, wrong password, sign in, move browser builds to account, save, edit and reopen from account, rename, duplicate, delete, sign out, register, reset, off-site redirect blocked | Pass, no page errors |
| Contact form when the database cannot be reached | Shows "not sent" and why |

## Not tested

- **The real Supabase service from the app.** This development workspace cannot reach supabase.co, so the browser test used a simulated Supabase. The database rules were tested on the real database; the app's calls to it were not. The first real sign-up on the live site is the real test.
- Confirmation and reset emails. They depend on the Site URL setting in the dashboard (see README), and Supabase's built-in email sender allows only a few emails per hour.
- Rate limiting of the contact form beyond the honeypot.

## Left for Phase 7

Gallery publishing, likes and favourites; the admin screens; changing a user's role from the app; enquiry inbox.
