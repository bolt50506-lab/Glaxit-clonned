# CompanyFlow Admin / CMS (development branch)

This workspace is isolated on `feature/companyflow-admin-panel`. It does not alter public pages and has not been deployed or merged to `main`.

## Dedicated backend

- Supabase project: `companyflow-cms`
- Project ref: `sawqalrbdbayroypbopp`
- Region: `eu-west-2`
- Storage bucket: `cms-media`
- Foundation schema migration: `supabase/migrations/202610130001_companyflow_cms_foundation.sql`

The migration has been applied to the new CompanyFlow-only project. It creates `cms_pages`, `cms_revisions`, `cms_assets`, and `cms_settings`; enables RLS; and limits writes to accounts whose server-managed `app_metadata.companyflow_admin` claim is `true`. Do not put a Supabase service-role key in browser code.

## One-time admin account setup

Before sign-in can work:

1. Open the `companyflow-cms` project in Supabase Dashboard.
2. In **Authentication → Settings**, disable public sign-ups. Only pre-created accounts should be able to sign in.
3. In **Authentication → Users**, add/invite the owner email address you want to use for administration.
4. In the project's SQL Editor, assign the server-controlled admin claim to that exact account. Replace the email before running:
   
   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
       || '{"companyflow_admin": true}'::jsonb
   where email = 'YOUR_ADMIN_EMAIL';
   ```

5. Verify exactly one intended account was updated. Do not put admin permission in `user_metadata`; users can edit that field themselves.
6. Open `/admin/` on a preview of this branch and request a magic sign-in link. Sign out and sign back in after changing claims so the JWT refreshes.

The admin interface has no password form; it uses Supabase's email magic-link flow. Authentication and database authorization are separate: RLS policies still reject authenticated users who do not have the server-managed admin claim.

## Current functionality

- Protected dashboard and counts.
- Create, edit, archive, and search CMS page records.
- SEO title, description, canonical, robots-index and social-image fields.
- Structured content stored as JSON (not arbitrary executable HTML).
- Automatic revision snapshots and snapshot restore.
- Media upload, listing, public URL copying, and deletion.
- JSON-valued global settings.
- SEO metadata completeness report.

## Import existing static HTML pages

The isolated admin includes a browser-based migration helper at `/admin/import-pages.html`.

1. Sign in to the authorised admin account on the **isolated preview deployment**.
2. Open **Import website pages** in the dashboard.
3. Click **Load HTML from GitHub branch** to read eligible HTML from `feature/companyflow-admin-panel` directly. The repository must be publicly readable and the browser must be able to reach GitHub. Alternatively, select the extracted repository folder to scan locally.
4. Review the detected page list. Legal/utility pages are excluded unless you opt in. Admin pages, WordPress internals, vendor libraries and assets are always excluded.
5. Leave **Update existing CMS pages** unchecked for a safe first run.
6. Import selected pages. All imported records are saved as **drafts** and revision snapshots are created.

The importer extracts page titles, meta descriptions, canonical URLs and starter sections from headings, paragraphs and images. It does **not** reproduce exact CSS, layouts, animations or scripts. Review imported content in the visual editor. If the repository contains duplicate slugs, import only the intended version. Do not run an import from an untrusted folder.

The importer only works when this branch's admin files are actually deployed on a preview site and the authenticated browser session can access the dedicated CMS Supabase project. Creating the files in GitHub alone does not deploy them.

## Important publishing boundary

The current public site is still static HTML. The CMS stores editable content in Supabase, but the public site has **not** yet been connected to consume these records, and saving/publishing a CMS record does not update the public website. The next phase must implement and test a controlled export/publish adapter that preserves the existing markup, CSS, animation, URLs, metadata, and generated solution pages. Keep all work on this branch and do not merge/deploy until preview tests pass.

## Safe testing checklist

- Test with an authorised account and a non-admin account.
- Confirm non-admin reads/writes are rejected by RLS.
- Test media upload/replace/delete and revision restore.
- Validate mobile layout and keyboard navigation.
- Confirm the live site and production branch have no changes.
