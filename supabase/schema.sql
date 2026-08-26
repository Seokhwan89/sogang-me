-- ============================================================
-- Sogang University Dept. of Mechanical Engineering — schema
-- Run this in Supabase SQL Editor (once). Safe to re-run.
-- ============================================================
create extension if not exists pgcrypto;

-- Admin allow-list. Any Supabase Auth user whose email is listed here can manage the site.
create table if not exists admins (
  email text primary key,
  created_at timestamptz default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Boards: notice | research | award | scholarship | major | gallery | archive | events | alumni_news
create table if not exists posts (
  id bigserial primary key,
  board text not null,
  title_ko text not null,
  title_en text,
  content_ko text default '',
  content_en text,
  excerpt_ko text,
  excerpt_en text,
  thumbnail_url text,
  images jsonb default '[]'::jsonb,       -- gallery: [{url, caption}]
  attachments jsonb default '[]'::jsonb,  -- [{name, url, size}]
  author text default '기계공학과',
  is_pinned boolean default false,
  show_on_home boolean default true,
  published boolean default true,
  view_count int default 0,
  legacy_id text,                          -- original gnuboard wr_id for migration
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists posts_board_idx on posts(board, created_at desc);

create table if not exists faculty (
  id bigserial primary key,
  name_ko text not null,
  name_en text,
  title_ko text default '교수',
  title_en text default 'Professor',
  email text,
  tel text,
  lab_ko text,
  lab_en text,
  lab_url text,
  office text,
  photo_url text,
  field text,                 -- design | thermal | control | manufacturing
  research_ko text,
  research_en text,
  bio_ko text,
  bio_en text,
  sort_order int default 100,
  is_emeritus boolean default false,
  published boolean default true,
  created_at timestamptz default now()
);

-- Editable static pages (admin can edit body text without redeploy)
create table if not exists pages (
  slug text primary key,
  title_ko text,
  title_en text,
  content_ko text,
  content_en text,
  updated_at timestamptz default now()
);

-- Facility reservations: seminar | meeting | drafting | server1..server4
create table if not exists reservations (
  id bigserial primary key,
  facility text not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  user_name text not null,
  affiliation text,
  purpose text,
  contact text,
  status text default 'approved',  -- pending | approved | rejected
  created_at timestamptz default now()
);
create index if not exists reservations_idx on reservations(facility, date);

create table if not exists banners (
  id bigserial primary key,
  title_ko text,
  title_en text,
  subtitle_ko text,
  subtitle_en text,
  image_url text,
  link text,
  sort_order int default 100,
  visible boolean default true,
  created_at timestamptz default now()
);

create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ---------- Row level security ----------
alter table admins enable row level security;
alter table posts enable row level security;
alter table faculty enable row level security;
alter table pages enable row level security;
alter table reservations enable row level security;
alter table banners enable row level security;
alter table site_settings enable row level security;

drop policy if exists "admins self read" on admins;
create policy "admins self read" on admins for select using (is_admin());

drop policy if exists "posts public read" on posts;
create policy "posts public read" on posts for select using (published or is_admin());
drop policy if exists "posts admin write" on posts;
create policy "posts admin write" on posts for all using (is_admin()) with check (is_admin());

drop policy if exists "faculty public read" on faculty;
create policy "faculty public read" on faculty for select using (published or is_admin());
drop policy if exists "faculty admin write" on faculty;
create policy "faculty admin write" on faculty for all using (is_admin()) with check (is_admin());

drop policy if exists "pages public read" on pages;
create policy "pages public read" on pages for select using (true);
drop policy if exists "pages admin write" on pages;
create policy "pages admin write" on pages for all using (is_admin()) with check (is_admin());

drop policy if exists "reservations public read" on reservations;
create policy "reservations public read" on reservations for select using (true);
drop policy if exists "reservations public insert" on reservations;
create policy "reservations public insert" on reservations for insert with check (status = 'pending');
drop policy if exists "reservations admin write" on reservations;
create policy "reservations admin write" on reservations for all using (is_admin()) with check (is_admin());

drop policy if exists "banners public read" on banners;
create policy "banners public read" on banners for select using (visible or is_admin());
drop policy if exists "banners admin write" on banners;
create policy "banners admin write" on banners for all using (is_admin()) with check (is_admin());

drop policy if exists "settings public read" on site_settings;
create policy "settings public read" on site_settings for select using (true);
drop policy if exists "settings admin write" on site_settings;
create policy "settings admin write" on site_settings for all using (is_admin()) with check (is_admin());

-- view counter callable by anyone
create or replace function increment_view(post_id bigint) returns void
language sql security definer as $$
  update posts set view_count = view_count + 1 where id = post_id;
$$;

-- Storage bucket for uploads (images, attachments)
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;
drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects for all
  using (bucket_id = 'media' and is_admin()) with check (bucket_id = 'media' and is_admin());

-- Default settings
insert into site_settings (key, value) values
 ('home', '{"sections":["hero","intro","news","quicklinks","programs","gallery"],"news_count":6,"tagline_ko":"움직이는 모든 것의 원리를 설계합니다","tagline_en":"We design the principles behind everything that moves"}')
on conflict (key) do nothing;
