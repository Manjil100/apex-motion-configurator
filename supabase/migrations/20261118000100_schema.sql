-- APEX MOTION schema. Phase 6.
-- Every table has Row Level Security on. Customers can only see and change their own
-- builds; catalogue tables are read-only to the public; writes to them need the admin role,
-- which is checked in the database, never trusted from the browser.

create extension if not exists pgcrypto;

-- Shared helpers ---------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Profiles ---------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 60),
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 60), ''));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Catalogue --------------------------------------------------------------------

create table public.vehicles (
  slug text primary key check (slug ~ '^[a-z0-9-]{2,60}$'),
  manufacturer text not null,
  model text not null,
  variant text not null default '',
  generation text not null,
  model_year int check (model_year between 1950 and 2100),
  model_year_status text not null default 'unverified' check (model_year_status in ('verified', 'unverified', 'illustrative')),
  body_style text not null,
  drivetrain text not null check (drivetrain in ('RWD', 'AWD')),
  layout text not null,
  engine text not null,
  facts_status text not null default 'unverified' check (facts_status in ('verified', 'unverified', 'illustrative')),
  summary text not null,
  base_price_nzd numeric(12, 2) check (base_price_nzd is null or base_price_nzd > 0),
  base_price_status text check (base_price_status in ('verified', 'unverified', 'illustrative')),
  base_price_source text,
  specs jsonb not null default '[]',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A price is never stored without saying where it stands.
  constraint price_has_status check (base_price_nzd is null or base_price_status is not null)
);

create table public.vehicle_assets (
  id uuid primary key default gen_random_uuid(),
  vehicle_slug text not null references public.vehicles (slug) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'placeholder', 'verified')),
  model_url text,
  licence jsonb,
  slots jsonb not null default '{}',
  visibility jsonb not null default '{}',
  cameras jsonb not null default '{}',
  lighting jsonb not null default '{"defaultEnvironment": "studio"}',
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A model marked verified must record a licence that allows commercial use.
  constraint verified_needs_commercial_licence check (
    status <> 'verified' or (licence ->> 'commercialUse')::boolean is true
  )
);
create unique index vehicle_assets_one_current on public.vehicle_assets (vehicle_slug) where is_current;

create table public.customisation_categories (
  id text primary key check (id ~ '^[a-z-]{2,40}$'),
  name text not null,
  group_name text not null check (group_name in ('Exterior', 'Wheels', 'Interior', 'Body', 'Scene')),
  slot text,
  multi boolean not null default false,
  sort_order int not null default 0
);

create table public.customisation_options (
  category_id text not null references public.customisation_categories (id) on delete cascade,
  id text not null check (id ~ '^[a-z0-9-]{2,40}$'),
  name text not null,
  price_nzd numeric(10, 2) not null default 0 check (price_nzd >= 0),
  price_status text not null default 'illustrative' check (price_status in ('verified', 'unverified', 'illustrative')),
  swatch text check (swatch is null or swatch ~ '^#[0-9a-f]{6}$'),
  finish text check (finish is null or finish in ('gloss', 'matte', 'metallic', 'pearl')),
  note text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  primary key (category_id, id)
);

-- Builds -----------------------------------------------------------------------

create table public.configurations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vehicle_slug text not null references public.vehicles (slug),
  name text not null check (char_length(trim(name)) between 1 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index configurations_user_recent on public.configurations (user_id, updated_at desc);

-- One row per chosen option. option_id is deliberately not a foreign key: a retired
-- option must not delete or block a customer's saved build, and custom paint
-- colours ("custom-1a2b3c") are not catalogue rows.
create table public.configuration_options (
  configuration_id uuid not null references public.configurations (id) on delete cascade,
  category_id text not null references public.customisation_categories (id),
  option_id text not null check (option_id ~ '^[a-z0-9-]{2,40}$'),
  primary key (configuration_id, category_id, option_id)
);

-- Community (used from Phase 7) ------------------------------------------------

create table public.gallery_posts (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null unique references public.configurations (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 80),
  description text check (description is null or char_length(description) <= 500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index gallery_posts_feed on public.gallery_posts (status, created_at desc);

create table public.favourites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  gallery_post_id uuid not null references public.gallery_posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, gallery_post_id)
);
create index favourites_by_post on public.favourites (gallery_post_id);

-- Enquiries --------------------------------------------------------------------

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null check (char_length(trim(name)) between 2 and 80),
  email text not null check (char_length(email) <= 254 and email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'),
  subject text not null check (char_length(trim(subject)) between 3 and 120),
  message text not null check (char_length(trim(message)) between 20 and 2000),
  status text not null default 'new' check (status in ('new', 'read', 'resolved')),
  created_at timestamptz not null default now()
);
create index enquiries_inbox on public.enquiries (status, created_at desc);

-- updated_at triggers ----------------------------------------------------------

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger vehicles_updated before update on public.vehicles for each row execute function public.set_updated_at();
create trigger vehicle_assets_updated before update on public.vehicle_assets for each row execute function public.set_updated_at();
create trigger configurations_updated before update on public.configurations for each row execute function public.set_updated_at();
create trigger gallery_posts_updated before update on public.gallery_posts for each row execute function public.set_updated_at();

-- Row Level Security -----------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_assets enable row level security;
alter table public.customisation_categories enable row level security;
alter table public.customisation_options enable row level security;
alter table public.configurations enable row level security;
alter table public.configuration_options enable row level security;
alter table public.gallery_posts enable row level security;
alter table public.favourites enable row level security;
alter table public.enquiries enable row level security;

-- Profiles: read and rename your own. The role column cannot be changed by its owner.
create policy "profiles: read own" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "profiles: admin manages" on public.profiles for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
revoke update on public.profiles from authenticated, anon;
grant update (display_name) on public.profiles to authenticated;

-- Catalogue: anyone reads active rows; only admins write.
create policy "vehicles: public read" on public.vehicles for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "vehicles: admin write" on public.vehicles for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "assets: public read" on public.vehicle_assets for select to anon, authenticated
  using (is_current or (select public.is_admin()));
create policy "assets: admin write" on public.vehicle_assets for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "categories: public read" on public.customisation_categories for select to anon, authenticated using (true);
create policy "categories: admin write" on public.customisation_categories for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "options: public read" on public.customisation_options for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "options: admin write" on public.customisation_options for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Builds: owners only. Admins can read for support and moderation.
create policy "configurations: owner reads" on public.configurations for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "configurations: owner inserts" on public.configurations for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "configurations: owner updates" on public.configurations for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "configurations: owner deletes" on public.configurations for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "configuration options: follow the build" on public.configuration_options for all to authenticated
  using (exists (select 1 from public.configurations c where c.id = configuration_id and c.user_id = (select auth.uid())))
  with check (exists (select 1 from public.configurations c where c.id = configuration_id and c.user_id = (select auth.uid())));
create policy "configuration options: admin reads" on public.configuration_options for select to authenticated
  using ((select public.is_admin()));

-- Gallery: approved posts are public; owners see their own; only admins change status.
create policy "gallery: read approved or own" on public.gallery_posts for select to anon, authenticated
  using (status = 'approved' or user_id = (select auth.uid()) or (select public.is_admin()));
create policy "gallery: owner submits own build" on public.gallery_posts for insert to authenticated
  with check (
    user_id = (select auth.uid()) and status = 'pending'
    and exists (select 1 from public.configurations c where c.id = configuration_id and c.user_id = (select auth.uid()))
  );
create policy "gallery: owner edits while pending" on public.gallery_posts for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and status = 'pending');
create policy "gallery: owner deletes" on public.gallery_posts for delete to authenticated
  using (user_id = (select auth.uid()));
create policy "gallery: admin moderates" on public.gallery_posts for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "favourites: own" on public.favourites for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Enquiries: anyone can send one; nobody but an admin can read them.
create policy "enquiries: anyone sends" on public.enquiries for insert to anon, authenticated
  with check (status = 'new' and (user_id is null or user_id = (select auth.uid())));
create policy "enquiries: admin reads" on public.enquiries for select to authenticated using ((select public.is_admin()));
create policy "enquiries: admin updates" on public.enquiries for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Saving a build ---------------------------------------------------------------
-- Creates or updates a build and replaces its options in one transaction. Runs as the
-- caller (security invoker), so every row it touches still passes the policies above.

create or replace function public.save_configuration(
  p_id uuid, p_name text, p_vehicle_slug text, p_selection jsonb
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in to save builds to your account.' using errcode = '42501';
  end if;
  if jsonb_typeof(p_selection) is distinct from 'object' then
    raise exception 'Selection must be an object of category to option ids.' using errcode = '22023';
  end if;

  if p_id is null then
    insert into public.configurations (vehicle_slug, name) values (p_vehicle_slug, trim(p_name)) returning id into v_id;
  else
    update public.configurations set name = trim(p_name), vehicle_slug = p_vehicle_slug
      where id = p_id and user_id = auth.uid() returning id into v_id;
    if v_id is null then
      raise exception 'Build not found.' using errcode = 'P0002';
    end if;
    delete from public.configuration_options where configuration_id = v_id;
  end if;

  insert into public.configuration_options (configuration_id, category_id, option_id)
  select distinct v_id, s.key, o.value
  from jsonb_each(p_selection) as s
  cross join lateral jsonb_array_elements_text(s.value) as o(value)
  where jsonb_typeof(s.value) = 'array';

  return v_id;
end $$;

revoke execute on function public.save_configuration(uuid, text, text, jsonb) from public, anon;
grant execute on function public.save_configuration(uuid, text, text, jsonb) to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
