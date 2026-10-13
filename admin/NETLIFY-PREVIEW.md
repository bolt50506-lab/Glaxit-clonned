# Safe CompanyFlow CMS preview deployment (Netlify)

The main CompanyFlow site is hosted on Netlify. This guide creates a **separate Netlify site** for the CMS admin preview. Do not change the existing `companyflow` production site, its domain, or its build settings.

## Create a separate preview site

1. Open the [Netlify dashboard](https://app.netlify.com/).
2. Choose **Add new project / site → Import an existing project** (wording may vary).
3. Connect/select GitHub repository `bolt50506-lab/Glaxit-clonned`.
4. Select branch `feature/companyflow-admin-panel`.
5. Give the new site a distinct name such as `companyflow-cms-preview`.
6. Leave **Base directory** empty (repository root).
7. Set **Build command** to empty / no build command (or the dashboard's static-site default if it requires a value).
8. Set **Publish directory** to `.` (repository root). This preserves the `/admin/`, `/builder.html` and all static-site paths on the isolated preview. Do **not** set base directory to `admin`, or the importer/editor URLs will be at the wrong paths.
9. Do not attach `companyflow.co.uk` or the existing production domain. Use the new site's generated `netlify.app` URL.
10. Keep automatic production publishing disabled until you've confirmed the preview site's branch and publish directory. Do not edit settings on the existing main site.

## Test checklist

- Confirm the new site's deploy branch is `feature/companyflow-admin-panel`.
- Confirm the base directory is empty and publish directory is `.` (repository root).
- Open `/admin/`, `/admin/builder.html`, and `/admin/import-pages.html` on the preview URL.
- Open the generated preview URL and test sign-in using the pre-authorised `alihotspot1@gmail.com` account.
- Test page create/edit/archive, revision restore, SEO fields, and media upload/delete.
- Confirm non-admin accounts cannot write to CMS tables or upload media.
- Keep public sign-ups disabled in the dedicated `companyflow-cms` Supabase project.
- Do not merge to `main` or connect the CMS to live-page publishing yet.

## Publishing limitation

The CMS currently stores structured JSON in Supabase. The static public site does not yet read these CMS records, so a CMS “published” status does not update the public website. A separate, reviewed publishing adapter is still required.
