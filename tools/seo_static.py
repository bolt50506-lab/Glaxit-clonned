#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Run from site root:  python3 tools/seo_static.py   (safe to re-run)
For every NON-generated page: adds missing meta description, canonical, Open Graph/Twitter, Organization JSON-LD (home),
alt text from file names, lazy-loading, and removes WordPress leftovers (xmlrpc, wp-json, gmpg, shortlink, s.w.org).
Then writes sitemap.xml and robots.txt (stub/redirect pages and generated tool folders are excluded)."""
import os, re, sys, html, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import seo
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SKIP_DIRS = {"tools", "wp-includes", "wp-json", "wp-content", "assets", "unpkg.com", "cdnjs.cloudflare.com", "gmpg.org", "text", ".git"}
DESC = {"": "CompanyFlow builds custom software, websites, mobile apps, AI automation and digital products around your business. Get a free quote.",
        "company": "Meet CompanyFlow: a software agency delivering custom software, websites, AI automation and dedicated engineering teams worldwide.",
        "contact-us": "Contact CompanyFlow to discuss your website, software, mobile app or AI automation project. Get a free quote within one working day.",
        "blog/case-study": "See CompanyFlow case studies across business software, healthcare, ecommerce, real estate, travel and AI automation projects."}
def is_stub(s): return 'http-equiv="refresh"' in s.lower() or len(s) < 1500
def pages():
    for dp, dn, fs in os.walk(ROOT):
        dn[:] = [d for d in dn if d not in SKIP_DIRS or dp != ROOT]
        if "index.html" in fs: yield os.path.join(dp, "index.html")
def alt_from(src):
    n = os.path.splitext(os.path.basename(src.split("?")[0]))[0]
    n = re.sub(r"[-_]+", " ", re.sub(r"-\d+x\d+$", "", n)).strip()
    return n.title() if n else "CompanyFlow"
def fix(path):
    s = open(path, encoding="utf-8", errors="ignore").read()
    rel = os.path.relpath(os.path.dirname(path), ROOT).replace(os.sep, "/")
    rel = "" if rel == "." else rel
    if is_stub(s) or rel.startswith("solutions") or rel in ("staff-augmentation", "project-base"): return None
    o = s
    s = re.sub(r'<link[^>]+(?:xmlrpc|wp-json|gmpg\.org|rel=["\']shortlink|rel=["\']EditURI|dns-prefetch["\'][^>]*s\.w\.org|oembed)[^>]*>\s*', "", s, flags=re.I)
    t = re.search(r"<title[^>]*>(.*?)</title>", s, re.S | re.I)
    title = html.unescape(t.group(1).strip()) if t else "CompanyFlow"
    m = re.search(r'<meta name="description" content="([^"]*)"', s)
    desc = html.unescape(m.group(1)) if m else DESC.get(rel) or seo.clip(re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style|header|footer|nav)[^>]*>.*?</\1>", " ", s, flags=re.S | re.I)).strip(), 155)
    add = ""
    if not m: add += '<meta name="description" content="%s">' % html.escape(desc)
    if 'rel="canonical"' not in s: add += seo.tags(title, desc, rel + "/" if rel else "", ROOT)
    og_image = seo.SITE_URL + "/assets/og-default.svg"
    if 'property="og:image"' not in s: add += '<meta property="og:image" content="%s"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">' % og_image
    if 'name="twitter:image"' not in s: add += '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="%s">' % og_image
    if rel == "" and "application/ld+json" not in s: add += seo.ld([seo.ORG, {"@type": "WebSite", "url": seo.SITE_URL + "/", "name": seo.BRAND, "publisher": {"@id": seo.SITE_URL + "/#org"}}])
    elif rel and "BreadcrumbList" not in s: add += seo.page_ld(title.split("|")[0].split("\u2014")[0].strip(), rel + "/")
    if add: s = s.replace("</head>", add + "</head>", 1)
    def img_tag(tag, eager):
        if not re.search(r'\balt="', tag):
            m2 = re.search(r'src="([^"]*)"', tag)
            tag = tag.replace("<img", '<img alt="%s"' % html.escape(alt_from(m2.group(1)) if m2 else "CompanyFlow"), 1)
        if not eager and "loading=" not in tag: tag = tag.replace("<img", '<img loading="lazy" decoding="async"', 1)
        return tag
    for k, mm in reversed(list(enumerate(re.finditer(r"<img\b[^>]*>", s)))):      # first 2 images stay eager (LCP)
        s = s[:mm.start()] + img_tag(mm.group(0), k < 2) + s[mm.end():]
    if s != o: open(path, "w", encoding="utf-8").write(s); return True
    return False
def sitemap():
    urls = []
    for p in pages():
        s = open(p, encoding="utf-8", errors="ignore").read()
        if is_stub(s) or 'content="noindex' in s: continue
        rel = os.path.relpath(os.path.dirname(p), ROOT).replace(os.sep, "/"); rel = "" if rel == "." else rel + "/"
        d = datetime.date.fromtimestamp(os.path.getmtime(p)).isoformat()
        pr = "1.0" if rel == "" else ("0.9" if rel.count("/") == 1 and rel.startswith(("solutions/", "company", "contact")) else "0.7")
        urls.append((rel, d, pr))
    x = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for rel, d, pr in sorted(urls): x += "  <url><loc>%s</loc><lastmod>%s</lastmod><priority>%s</priority></url>\n" % (seo.url(rel), d, pr)
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(x + "</urlset>\n")
    open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8").write("User-agent: *\nAllow: /\nDisallow: /tools/\nDisallow: /wp-json/\nDisallow: /xmlrpc.php\n\nSitemap: %s/sitemap.xml\n" % seo.SITE_URL)
    return len(urls)
if __name__ == "__main__":
    ch = [p for p in pages() if fix(p)]
    print("updated %d page(s)" % len(ch)); print("sitemap.xml: %d url(s), robots.txt written" % sitemap())
