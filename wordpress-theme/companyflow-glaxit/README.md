# CompanyFlow WordPress migration

This is the first migration layer for the existing Glaxit-cloned CompanyFlow frontend.

It intentionally does **not** rebuild the frontend with Gutenberg, Elementor, or another page builder. WordPress renders the existing frontend source so the current visual design, animations, project pages, CSS and JavaScript remain the source of truth.

## Permanent migration

Once custom theme upload/hosting is available, copy the static assets into this theme and replace the remote bridge in functions.php with local asset/template loading. No frontend redesign is required.

## Current source

https://github.com/bolt50506-lab/Glaxit-clonned
