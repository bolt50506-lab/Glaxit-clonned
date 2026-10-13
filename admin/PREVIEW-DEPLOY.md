# Safe CMS preview deployment (Render)

This is a separate preview only. Do not change, redeploy, or reconnect the production service/domain.

## Create a new service in Render

1. Open the Render dashboard and choose **New → Static Site**.
2. Select repository `bolt50506-lab/Glaxit-clonned`.
3. Set the branch to `feature/companyflow-admin-panel`.
4. Name the service `companyflow-cms-preview`.
5. Set the publish directory to `admin`.
6. The build command can be `echo "CompanyFlow CMS preview"`.
7. Keep Auto-Deploy disabled for the first test.
8. Create the service with its own generated `onrender.com` URL. Do not add the production custom domain.
9. Open the generated preview URL and test the admin login with `alihotspot1@gmail.com`.

Only the `admin/` folder should be published. Do not set the publish directory to `.` or to the repository root. That would expose files that are not intended as public static assets.

## Before considering it tested

- Confirm the generated preview URL is not the production domain.
- Request the magic link and verify sign-in.
- Confirm dashboard loads, page CRUD works, revisions can be restored, and media upload works.
- Verify a signed-in non-admin account is rejected by the admin gate and RLS.
- Confirm public sign-ups remain disabled in Supabase.
- Do not use the CMS to publish important content yet: the static public site still does not consume CMS page records.
- Do not merge to `main` or deploy production.

## Blueprint file

The repository includes `render.cms-preview.yaml` as a separate preview configuration reference. If the Render dashboard's Blueprint flow allows specifying an alternate Blueprint file path, use that file. Otherwise, create the Static Site with the settings above. Do not replace or modify the production `render.yaml` or existing service.
