-- Published page records are readable to anonymous site visitors.
-- Authenticated CMS administrators use the separate admin-only policy.
drop policy if exists "Published pages are readable" on public.cms_pages;
create policy "Published pages are readable" on public.cms_pages
  for select to anon using (status = 'published');
