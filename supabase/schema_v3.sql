-- v3: new boards (promo/capstone/festival/videos), youtube, URECA applications, notification email
alter table posts add column if not exists video_url text;
alter table posts add column if not exists term text;        -- e.g. '2025-2' (학년도-학기) or year '2025'
alter table posts add column if not exists members text;     -- 조원
alter table posts add column if not exists advisor text;     -- 지도교수
alter table posts add column if not exists category text;    -- videos: 분야 / festival: ureca|capstone|project|award
alter table posts add column if not exists sort_order int default 100;

create table if not exists ureca_applications (
  id bigserial primary key,
  year int not null,
  term text not null,            -- spring | summer | fall | winter
  name text not null,
  student_id text not null,
  semester text,                 -- 현재 학기
  phone text,
  email text,
  choices jsonb default '[]'::jsonb,   -- [{rank:1, lab:'...', prof:'...'}]
  message text,
  status text default 'pending',       -- pending | accepted | rejected
  created_at timestamptz default now()
);
alter table ureca_applications enable row level security;
drop policy if exists "ureca public insert" on ureca_applications;
create policy "ureca public insert" on ureca_applications for insert with check (status = 'pending');
drop policy if exists "ureca admin all" on ureca_applications;
create policy "ureca admin all" on ureca_applications for all using (is_admin()) with check (is_admin());

update site_settings set value = value || '{"notify_email":"sgmeoffice@gmail.com"}'::jsonb where key='home' and not (value ? 'notify_email');
alter table posts add column if not exists category_en text;
