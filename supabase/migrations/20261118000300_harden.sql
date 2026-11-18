-- Hardening after the Supabase advisors ran.
-- 1. is_admin() moves to a private schema the API does not expose.
-- 2. One permissive policy per table, role and action (no overlapping policies).
-- 3. Indexes for every foreign key.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke execute on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

-- Drop every policy that used public.is_admin() or overlapped, then recreate.
drop policy "profiles: read own" on public.profiles;
drop policy "profiles: update own" on public.profiles;
drop policy "profiles: admin manages" on public.profiles;
drop policy "vehicles: public read" on public.vehicles;
drop policy "vehicles: admin write" on public.vehicles;
drop policy "assets: public read" on public.vehicle_assets;
drop policy "assets: admin write" on public.vehicle_assets;
drop policy "categories: public read" on public.customisation_categories;
drop policy "categories: admin write" on public.customisation_categories;
drop policy "options: public read" on public.customisation_options;
drop policy "options: admin write" on public.customisation_options;
drop policy "configurations: owner reads" on public.configurations;
drop policy "configuration options: follow the build" on public.configuration_options;
drop policy "configuration options: admin reads" on public.configuration_options;
drop policy "gallery: read approved or own" on public.gallery_posts;
drop policy "gallery: owner edits while pending" on public.gallery_posts;
drop policy "gallery: owner deletes" on public.gallery_posts;
drop policy "gallery: admin moderates" on public.gallery_posts;
drop policy "enquiries: admin reads" on public.enquiries;
drop policy "enquiries: admin updates" on public.enquiries;
drop function public.is_admin();

-- Profiles. Owners may change only display_name (column grant from the first migration).
-- Changing a role will go through a server-side admin function in Phase 7.
create policy "profiles: read own" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Catalogue tables: one read policy for everyone, separate admin-only write policies.
create policy "vehicles: read" on public.vehicles for select to anon, authenticated
  using (is_active or (select private.is_admin()));
create policy "vehicles: admin inserts" on public.vehicles for insert to authenticated with check ((select private.is_admin()));
create policy "vehicles: admin updates" on public.vehicles for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "vehicles: admin deletes" on public.vehicles for delete to authenticated using ((select private.is_admin()));

create policy "assets: read" on public.vehicle_assets for select to anon, authenticated
  using (is_current or (select private.is_admin()));
create policy "assets: admin inserts" on public.vehicle_assets for insert to authenticated with check ((select private.is_admin()));
create policy "assets: admin updates" on public.vehicle_assets for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "assets: admin deletes" on public.vehicle_assets for delete to authenticated using ((select private.is_admin()));

create policy "categories: read" on public.customisation_categories for select to anon, authenticated using (true);
create policy "categories: admin inserts" on public.customisation_categories for insert to authenticated with check ((select private.is_admin()));
create policy "categories: admin updates" on public.customisation_categories for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "categories: admin deletes" on public.customisation_categories for delete to authenticated using ((select private.is_admin()));

create policy "options: read" on public.customisation_options for select to anon, authenticated
  using (is_active or (select private.is_admin()));
create policy "options: admin inserts" on public.customisation_options for insert to authenticated with check ((select private.is_admin()));
create policy "options: admin updates" on public.customisation_options for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "options: admin deletes" on public.customisation_options for delete to authenticated using ((select private.is_admin()));

-- Builds.
create policy "configurations: owner or admin reads" on public.configurations for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "configuration options: read with the build" on public.configuration_options for select to authenticated
  using ((select private.is_admin()) or exists (select 1 from public.configurations c where c.id = configuration_id and c.user_id = (select auth.uid())));
create policy "configuration options: owner inserts" on public.configuration_options for insert to authenticated
  with check (exists (select 1 from public.configurations c where c.id = configuration_id and c.user_id = (select auth.uid())));
create policy "configuration options: owner deletes" on public.configuration_options for delete to authenticated
  using (exists (select 1 from public.configurations c where c.id = configuration_id and c.user_id = (select auth.uid())));

-- Gallery.
create policy "gallery: read approved, own or as admin" on public.gallery_posts for select to anon, authenticated
  using (status = 'approved' or user_id = (select auth.uid()) or (select private.is_admin()));
create policy "gallery: owner edits while pending, admin moderates" on public.gallery_posts for update to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()))
  with check ((user_id = (select auth.uid()) and status = 'pending') or (select private.is_admin()));
create policy "gallery: owner or admin deletes" on public.gallery_posts for delete to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

-- Enquiries.
create policy "enquiries: admin reads" on public.enquiries for select to authenticated using ((select private.is_admin()));
create policy "enquiries: admin updates" on public.enquiries for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- Foreign-key indexes.
create index configuration_options_category on public.configuration_options (category_id);
create index configurations_vehicle on public.configurations (vehicle_slug);
create index enquiries_user on public.enquiries (user_id);
create index gallery_posts_user on public.gallery_posts (user_id);
