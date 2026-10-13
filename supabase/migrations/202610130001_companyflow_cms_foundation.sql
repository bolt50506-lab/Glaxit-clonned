-- CompanyFlow CMS foundation migration.
-- Apply to the dedicated companyflow-cms Supabase project only.
create extension if not exists pgcrypto;

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  page_type text not null default 'page' check (page_type in ('page','solution','case-study','landing')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  content jsonb not null default '{"sections":[]}'::jsonb,
  seo_title text,
  seo_description text,
  canonical_url text,
  robots_index boolean not null default true,
  og_image_path text,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.cms_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.cms_pages(id) on delete cascade,
  snapshot jsonb not null,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.cms_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  byte_size bigint,
  alt_text text not null default '',
  caption text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.cms_settings (
  setting_key text primary key,
  setting_value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
create index if not exists cms_pages_status_updated_idx on public.cms_pages(status, updated_at desc);
create index if not exists cms_revisions_page_created_idx on public.cms_revisions(page_id, created_at desc);
create index if not exists cms_assets_created_idx on public.cms_assets(created_at desc);

alter table public.cms_pages enable row level security;
alter table public.cms_revisions enable row level security;
alter table public.cms_assets enable row level security;
alter table public.cms_settings enable row level security;

drop policy if exists "Published pages are readable" on public.cms_pages;
create policy "Published pages are readable" on public.cms_pages
  for select to anon, authenticated using (status = 'published');
drop policy if exists "CompanyFlow admins manage pages" on public.cms_pages;
create policy "CompanyFlow admins manage pages" on public.cms_pages
  for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'companyflow_admin') = 'true')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'companyflow_admin') = 'true');
drop policy if exists "CompanyFlow admins manage revisions" on public.cms_revisions;
create policy "CompanyFlow admins manage revisions" on public.cms_revisions
  for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'companyflow_admin') = 'true')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'companyflow_admin') = 'true');
drop policy if exists "CompanyFlow admins manage assets" on public.cms_assets;
create policy "CompanyFlow admins manage assets" on public.cms_assets
  for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'companyflow_admin') = 'true')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'companyflow_admin') = 'true');
drop policy if exists "CompanyFlow admins manage settings" on public.cms_settings;
create policy "CompanyFlow admins manage settings" on public.cms_settings
  for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'companyflow_admin') = 'true')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'companyflow_admin') = 'true');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cms-media', 'cms-media', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','video/mp4','application/pdf'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Public can view published CMS media" on storage.objects;
create policy "Public can view published CMS media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'cms-media');
drop policy if exists "CompanyFlow admins upload CMS media" on storage.objects;
create policy "CompanyFlow admins upload CMS media" on storage.objects
  for insert to authenticated with check (bucket_id = 'cms-media' and (select auth.jwt() -> 'app_metadata' ->> 'companyflow_admin') = 'true');
drop policy if exists "CompanyFlow admins update CMS media" on storage.objects;
create policy "CompanyFlow admins update CMS media" on storage.objects
  for update to authenticated using (bucket_id = 'cms-media' and (select auth.jwt() -> 'app_metadata' ->> 'companyflow_admin') = 'true')
  with check (bucket_id = 'cms-media' and (select auth.jwt() -> 'app_metadata' ->> 'companyflow_admin') = 'true');
drop policy if exists "CompanyFlow admins delete CMS media" on storage.objects;
create policy "CompanyFlow admins delete CMS media" on storage.objects
  for delete to authenticated using (bucket_id = 'cms-media' and (select auth.jwt() -> 'app_metadata' ->> 'companyflow_admin') = 'true');

grant select on public.cms_pages to anon, authenticated;
grant all on public.cms_pages to authenticated;
grant all on public.cms_revisions to authenticated;
grant all on public.cms_assets to authenticated;
grant all on public.cms_settings to authenticated;
