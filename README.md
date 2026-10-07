# CompanyFlow — Glaxit Source-Based Clone

This build uses the extracted Glaxit HTML/CSS/asset/animation structure as the visual source of truth and adapts the visible branding/content for CompanyFlow.

## Run locally

Any static server works. For example:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173/`.

## Important

- The original layout/animation system is retained rather than recreated from screenshots.
- Glaxit tracking endpoints were removed from the static build.
- CompanyFlow-specific missing image names are mapped to locally extracted visual assets so the clone remains self-contained.
- The project is intentionally static at this stage; the next stage is production content/data integration.
