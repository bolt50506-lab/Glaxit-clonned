#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Shared CompanyFlow SEO helpers for static pages and generated solution pages."""
import html, json, re
SITE_URL = "https://companyflow.co.uk"
BRAND = "CompanyFlow"
EMAIL = "alihotspot1@gmail.com"
PHONE = "+92 340 746 5567"
OG_IMAGE = SITE_URL + "/assets/og-default.svg"
ORG = {
    "@type": "Organization",
    "@id": SITE_URL + "/#org",
    "name": BRAND,
    "url": SITE_URL + "/",
    "logo": SITE_URL + "/assets/companyflow-logo-new.svg",
    "email": EMAIL,
    "telephone": PHONE,
}
def clip(text, limit=155):
    text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", str(text)))).strip()
    return text if len(text) <= limit else text[:limit - 1].rsplit(" ", 1)[0].rstrip(".,;:") + "…"
def url(path=""):
    path = str(path or "").lstrip("/")
    return SITE_URL + ("/" + path if path else "/")
def ld(items):
    return '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@graph": items}, ensure_ascii=False, separators=(",", ":")) + "</script>"
def tags(title, desc, path="", root=""):
    canonical = url(path)
    title, desc = html.escape(str(title), quote=True), html.escape(clip(desc), quote=True)
    return (
        '<link rel="canonical" href="%s">' % html.escape(canonical, quote=True) +
        '<meta property="og:type" content="website"><meta property="og:site_name" content="CompanyFlow">' +
        '<meta property="og:title" content="%s"><meta property="og:description" content="%s">' % (title, desc) +
        '<meta property="og:url" content="%s"><meta property="og:image" content="%s">' % (html.escape(canonical, quote=True), OG_IMAGE) +
        '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">' +
        '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="%s">' % title +
        '<meta name="twitter:description" content="%s"><meta name="twitter:image" content="%s">' % (desc, OG_IMAGE)
    )
def page_ld(title, path):
    u = url(path)
    return ld([{"@type":"WebPage","name":str(title),"url":u,"isPartOf":{"@type":"WebSite","name":BRAND,"url":url()}},
               {"@type":"BreadcrumbList","itemListElement":[
                   {"@type":"ListItem","position":1,"name":"Home","item":url()},
                   {"@type":"ListItem","position":2,"name":str(title),"item":u}]}])
def make_title(title):
    title = re.sub(r"\s+", " ", str(title)).strip()
    return title if BRAND.lower() in title.lower() else title + " | " + BRAND
def make_desc(desc):
    return clip(desc, 155)
def service_ld(name, desc, path, faq=None):
    data = {"@type":"Service","name":str(name),"description":clip(desc),"url":url(path),"provider":{"@id":SITE_URL + "/#org"}}
    graph = [ORG, data]
    if faq:
        items = []
        for item in faq:
            if isinstance(item, (list, tuple)) and len(item) >= 2:
                items.append({"@type":"Question","name":str(item[0]),"acceptedAnswer":{"@type":"Answer","text":str(item[1])}})
        if items: graph.append({"@type":"FAQPage","mainEntity":items})
    return ld(graph)
