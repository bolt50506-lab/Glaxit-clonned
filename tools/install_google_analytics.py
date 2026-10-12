#!/usr/bin/env python3
"""Install the CompanyFlow GA4 Google tag on every static HTML page."""
from pathlib import Path
import re

TAG_ID = "G-3JDQLPT97M"
SNIPPET = f'''<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id={TAG_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', '{TAG_ID}');
</script>'''

root = Path(__file__).resolve().parent.parent
changed = []
skipped = []
for path in root.rglob("*.html"):
    if ".git" in path.parts:
        continue
    content = path.read_text(encoding="utf-8")
    if TAG_ID in content:
        skipped.append(path.relative_to(root).as_posix())
        continue
    match = re.search(r"<head(?:\s[^>]*)?>", content, flags=re.IGNORECASE)
    if not match:
        skipped.append(path.relative_to(root).as_posix() + " (no head)")
        continue
    content = content[:match.end()] + "\n" + SNIPPET + "\n" + content[match.end():]
    path.write_text(content, encoding="utf-8")
    changed.append(path.relative_to(root).as_posix())
print(f"Google Analytics tag installed on {len(changed)} HTML pages; skipped {len(skipped)}.")
if changed:
    print("\n".join(changed))
