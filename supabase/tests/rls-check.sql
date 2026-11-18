-- Row Level Security check. Run in the Supabase SQL editor (or via the MCP execute_sql tool).
-- Creates two throwaway users, acts as each of them and as an anonymous visitor, then
-- raises an exception carrying the report, which rolls every change back.
-- Expect: every line reads "(pass)" or matches its "(expect ...)" value.

do $$
declare
  r text := E'\n';
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  cfg uuid;
  n int;
  as_user text := 'select set_config(''request.jwt.claims'', $1, true)';
begin
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at) values
    (a, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a@test.invalid', '{"display_name":"Tester A"}', now(), now()),
    (b, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@test.invalid', '{}', now(), now());
  select count(*) into n from public.profiles where id in (a, b);
  r := r || '01 profiles made by sign-up trigger: ' || n || ' (expect 2)' || E'\n';
  execute as_user using json_build_object('sub', a, 'role', 'authenticated')::text;
  execute 'set local role authenticated';
  cfg := public.save_configuration(null, 'A build', 'porsche-911', '{"paint":["racing-red"],"body":["rear-spoiler","side-skirts"],"wheels":["standard"]}');
  select count(*) into n from public.configuration_options where configuration_id = cfg;
  r := r || '02 A saves a build, option rows: ' || n || ' (expect 4)' || E'\n';
  perform public.save_configuration(cfg, 'A build v2', 'porsche-911', '{"paint":["custom-12abef"]}');
  select count(*) into n from public.configuration_options where configuration_id = cfg;
  r := r || '03 A updates it, option rows now: ' || n || ' (expect 1)' || E'\n';
  begin
    update public.profiles set role = 'admin' where id = a;
    r := r || '04 A makes self admin: ALLOWED  <-- FAIL' || E'\n';
  exception when insufficient_privilege then r := r || '04 A makes self admin: refused (pass)' || E'\n';
  end;
  update public.profiles set display_name = 'Renamed' where id = a; get diagnostics n = row_count;
  r := r || '05 A renames own profile: ' || n || ' row (expect 1)' || E'\n';
  execute 'reset role';
  execute as_user using json_build_object('sub', b, 'role', 'authenticated')::text;
  execute 'set local role authenticated';
  select count(*) into n from public.configurations;
  r := r || '06 B sees builds: ' || n || ' (expect 0)' || E'\n';
  select count(*) into n from public.profiles;
  r := r || '07 B sees profiles: ' || n || ' (expect 1, own)' || E'\n';
  update public.configurations set name = 'hijack' where id = cfg; get diagnostics n = row_count;
  r := r || '08 B renames A''s build: ' || n || ' rows (expect 0)' || E'\n';
  delete from public.configurations where id = cfg; get diagnostics n = row_count;
  r := r || '09 B deletes A''s build: ' || n || ' rows (expect 0)' || E'\n';
  begin
    perform public.save_configuration(cfg, 'hijack', 'bmw-m4', '{}');
    r := r || '10 B overwrites A''s build via save: ALLOWED  <-- FAIL' || E'\n';
  exception when others then r := r || '10 B overwrites A''s build via save: refused (' || sqlerrm || ')' || E'\n';
  end;
  begin
    insert into public.configuration_options values (cfg, 'paint', 'matte-black');
    r := r || '11 B adds an option to A''s build: ALLOWED  <-- FAIL' || E'\n';
  exception when others then r := r || '11 B adds an option to A''s build: refused (pass)' || E'\n';
  end;
  begin
    insert into public.gallery_posts (configuration_id, title) values (cfg, 'stolen');
    r := r || '12 B publishes A''s build: ALLOWED  <-- FAIL' || E'\n';
  exception when others then r := r || '12 B publishes A''s build: refused (pass)' || E'\n';
  end;
  begin
    insert into public.vehicles (slug, manufacturer, model, generation, body_style, drivetrain, layout, engine, summary)
    values ('fake-car', 'X', 'Y', 'Z', 'Coupé', 'RWD', 'x', 'x', 'x');
    r := r || '13 customer edits catalogue: ALLOWED  <-- FAIL' || E'\n';
  exception when others then r := r || '13 customer edits catalogue: refused (pass)' || E'\n';
  end;
  execute 'reset role';
  execute as_user using '{"role":"anon"}';
  execute 'set local role anon';
  select count(*) into n from public.vehicles;
  r := r || '14 visitor reads vehicles: ' || n || ' (expect 9)' || E'\n';
  select count(*) into n from public.customisation_options;
  r := r || '15 visitor reads options: ' || n || ' (expect 33)' || E'\n';
  select count(*) into n from public.configurations;
  r := r || '16 visitor sees builds: ' || n || ' (expect 0)' || E'\n';
  begin
    perform public.save_configuration(null, 'x', 'bmw-m4', '{}');
    r := r || '17 visitor saves to database: ALLOWED  <-- FAIL' || E'\n';
  exception when others then r := r || '17 visitor saves to database: refused (pass)' || E'\n';
  end;
  insert into public.enquiries (name, email, subject, message) values ('Test Person', 'test@example.com', 'Hello', 'This is a test message that is long enough.');
  r := r || '18 visitor sends a valid enquiry: accepted' || E'\n';
  select count(*) into n from public.enquiries;
  r := r || '19 visitor reads enquiries: ' || n || ' (expect 0)' || E'\n';
  begin
    insert into public.enquiries (name, email, subject, message) values ('T', 'nope', 'Hi', 'short');
    r := r || '20 invalid enquiry: ALLOWED  <-- FAIL' || E'\n';
  exception when check_violation then r := r || '20 invalid enquiry: refused by constraints (pass)' || E'\n';
  end;
  begin
    insert into public.enquiries (name, email, subject, message, status) values ('Test Person', 'test@example.com', 'Hello', 'This is a test message that is long enough.', 'resolved');
    r := r || '21 enquiry with forged status: ALLOWED  <-- FAIL' || E'\n';
  exception when others then r := r || '21 enquiry with forged status: refused (pass)' || E'\n';
  end;
  execute 'reset role';
  update public.profiles set role = 'admin' where id = b;
  execute as_user using json_build_object('sub', b, 'role', 'authenticated')::text;
  execute 'set local role authenticated';
  select count(*) into n from public.enquiries;
  r := r || '22 admin reads enquiries: ' || n || ' (expect 1)' || E'\n';
  select count(*) into n from public.configurations;
  r := r || '23 admin reads builds: ' || n || ' (expect 1)' || E'\n';
  execute 'reset role';
  raise exception 'RLS REPORT (all changes rolled back):%', r;
end $$;
