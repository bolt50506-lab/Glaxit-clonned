# CompanyFlow Admin

This is the first CMS/admin layer for the existing CompanyFlow frontend. It does not rebuild or replace the public design.

## Current build
- Dashboard
- Project CRUD UI
- Categories
- Homepage content fields
- Animation preview
- Safe local preview storage while backend is being connected

## Production backend
The included schema is ready for Supabase. Supabase Free currently provides a free project tier with 500 MB database and 1 GB storage quotas, subject to its usage limits.

Next connection step: configure the Supabase URL/publishable key in admin.js and switch the CRUD functions from localStorage to the tables in schema.sql. Then the same panel can publish projects/content without editing HTML.

The existing frontend/animation files remain the source of truth.