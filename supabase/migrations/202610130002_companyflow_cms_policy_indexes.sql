-- Index author foreign keys and avoid per-row JWT function evaluation in RLS policies.
create index if not exists cms_pages_created_by_idx on public.cms_pages(created_by);
create index if not exists cms_pages_updated_by_idx on public.cms_pages(updated_by);
create index if not exists cms_revisions_created_by_idx on public.cms_revisions(created_by);
create index if not exists cms_assets_created_by_idx on public.cms_assets(created_by);
create index if not exists cms_settings_updated_by_idx on public.cms_settings(updated_by);

drop policy if exists "CompanyFlow admins manage pages" on public.cms_pages;
create policy "CompanyFlow admins manage pages" on public.cms_pages
  for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'companyflow_admin') = 'true')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'companyflow_admin') = 'true');
drop policy if exists "CompanyFlow admins manage revisions" on public.cms_revisions;
create policy "CompanyFlow admins manage revisions" on public.cms_revisions
  for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'companyflow_admin') = 'true')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'companyflow_admin') = 'true');
drop policy if exists "CompanyFlow admins manage assets" on public.cms_assets;
create policy "CompanyFlow admins manage assets" on public.cms_assets
  for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'companyflow_admin') = 'true')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'companyflow_admin') = 'true');
drop policy if exists "CompanyFlow admins manage settings" on public.cms_settings;
create policy "CompanyFlow admins manage settings" on public.cms_settings
  for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'companyflow_admin') = 'true')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'companyflow_admin') = 'true');
