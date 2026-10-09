#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CompanyFlow Solutions builder.
Run from anywhere:  python3 tools/build_solutions.py [--root <site root>] [--patch-existing]
 - writes solutions/<slug>/index.html for all 30 services
 - writes staff-augmentation/index.html and project-base/index.html
 - --patch-existing swaps the header of every other inner page (company, contact-us, case studies ...)
   for the new white tabbed mega-menu header and adds the CSS/JS links.
"""
import os, re, sys, html, glob, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import data
E = html.escape
SITE = "CompanyFlow"
WA = "https://wa.me/923407465567?text=Hi%20CompanyFlow%2C%20I%27d%20like%20to%20discuss%20a%20project."
DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/{n}/{n}-original.svg"
ALL = [(c, s, n, d) for c, items in data.CATS for (s, n, d) in items]
NAME = {s: n for _, s, n, _ in ALL}

# ---------- small SVG helpers ----------
ICON = {
 "code":'<path d="M8 7 3 12l5 5M16 7l5 5-5 5M14 4l-4 16"/>', "pen":'<path d="M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3"/>',
 "chart":'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', "gear":'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
 "shield":'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>', "doc":'<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
 "users":'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.5 2.5-6 6-6s6 2.5 6 6M16 5a3 3 0 010 6M18 14c2 .8 3 3 3 6"/>',
 "star":'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
 "bolt":'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', "lock":'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
 "check":'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>', "layers":'<path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/>',
}
CARD_ICONS = ["layers","bolt","lock","users"]
def svg_icon(n): return '<svg viewBox="0 0 24 24" aria-hidden="true">%s</svg>' % ICON[n]
def chip_icon(i): return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="%s"/></svg>' % (
    "M4 5h16v10H4zM2 19h20" if i == 0 else "M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z")

def hero_art(glyph):
    g = ICON.get(glyph, ICON["code"])
    return ('<svg viewBox="0 0 520 430" role="img" aria-label="Illustration">'
    '<defs><linearGradient id="gA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2bbf99"/><stop offset="1" stop-color="#0e8e75"/></linearGradient>'
    '<linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d2a22"/><stop offset="1" stop-color="#121a15"/></linearGradient></defs>'
    '<ellipse cx="260" cy="370" rx="215" ry="52" fill="#e8ece9" opacity=".95"/><ellipse cx="260" cy="360" rx="190" ry="42" fill="#cfd7d2"/>'
    '<ellipse cx="260" cy="350" rx="165" ry="34" fill="url(#gA)" opacity=".35"/>'
    '<g transform="translate(110 60)"><rect x="0" y="0" width="300" height="205" rx="16" fill="url(#gB)" stroke="#2bbf99" stroke-width="3"/>'
    '<rect x="0" y="0" width="300" height="30" rx="16" fill="#2bbf99"/><circle cx="18" cy="15" r="4.5" fill="#fff" opacity=".9"/><circle cx="34" cy="15" r="4.5" fill="#fff" opacity=".7"/><circle cx="50" cy="15" r="4.5" fill="#fff" opacity=".5"/>'
    '<rect x="20" y="48" width="96" height="70" rx="8" fill="#2bbf99" opacity=".9"/><rect x="130" y="48" width="150" height="12" rx="6" fill="#3b4a41"/><rect x="130" y="70" width="110" height="10" rx="5" fill="#33443a"/><rect x="130" y="90" width="130" height="10" rx="5" fill="#33443a"/>'
    '<rect x="20" y="136" width="30" height="48" rx="5" fill="#23b293"/><rect x="62" y="120" width="30" height="64" rx="5" fill="#2bbf99"/><rect x="104" y="104" width="30" height="80" rx="5" fill="#23b293"/>'
    '<path d="M160 176l36-34 28 18 48-52" fill="none" stroke="#2bbf99" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>'
    '<g transform="translate(335 40)"><circle cx="48" cy="48" r="48" fill="url(#gA)"/><g transform="translate(24 24) scale(2)" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">%s</g></g>'
    '<g transform="translate(70 230)"><rect width="104" height="64" rx="10" fill="#fff"/><rect x="14" y="14" width="46" height="8" rx="4" fill="#2bbf99"/><rect x="14" y="30" width="76" height="6" rx="3" fill="#cfd7d2"/><rect x="14" y="44" width="58" height="6" rx="3" fill="#cfd7d2"/></g>'
    '<g fill="#2bbf99"><circle cx="440" cy="250" r="7"/><circle cx="470" cy="215" r="4"/><circle cx="62" cy="150" r="5"/></g></svg>') % g

def q_art():
    return ('<svg viewBox="0 0 420 420" role="img" aria-label="Question mark illustration"><defs><linearGradient id="qg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3ccfa8"/><stop offset="1" stop-color="#0e8e75"/></linearGradient></defs>'
    '<circle cx="215" cy="210" r="170" fill="#2bbf99" opacity=".07"/>'
    '<path d="M150 140c0-42 30-70 72-70 44 0 72 26 72 62 0 30-18 46-40 62-18 13-26 24-26 44v10h-46v-14c0-30 12-46 34-62 16-12 26-22 26-38 0-16-12-26-28-26-18 0-28 12-28 30z" fill="url(#qg)"/>'
    '<rect x="196" y="318" width="52" height="52" rx="10" fill="url(#qg)"/>'
    '<rect x="56" y="96" width="70" height="14" rx="3" fill="none" stroke="#2bbf99" stroke-width="3"/><rect x="40" y="120" width="70" height="14" rx="3" fill="none" stroke="#2bbf99" stroke-width="3"/>'
    '<circle cx="70" cy="330" r="30" fill="#10150f" stroke="#2bbf99" stroke-width="3"/><g fill="#fff"><circle cx="58" cy="330" r="4"/><circle cx="70" cy="330" r="4"/><circle cx="82" cy="330" r="4"/></g></svg>')

def badge(name):
    t = "BEST %s SERVICES \u2022" % name.upper()
    return ('<svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="bp" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0"/></defs>'
            '<text font-family="Montserrat,Arial" font-weight="600" font-size="8.6" fill="#fff"><textPath href="#bp" textLength="274" lengthAdjust="spacing">%s</textPath></text>'
            '<circle cx="60" cy="60" r="21" fill="#2bbf99"/><path d="M52 68l16-16M56 52h12v12" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>') % E(t)

# ---------- shell: head, header, footer ----------
def head(title, desc, R):
    return ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
      '<title>%s</title><meta name="description" content="%s"><link rel="icon" href="%sassets/companyflow-cf-favicon.svg">'
      '<link rel="stylesheet" href="%sassets/cf-solutions.css"></head><body class="cfs">') % (E(title), E(desc), R, R)

def mega(R):
    tabs = "".join('<button type="button" class="cfs-tab%s">%s</button>' % (" is-active" if i == 0 else "", E(c)) for i, (c, _) in enumerate(data.CATS))
    pans = ""
    for i, (c, items) in enumerate(data.CATS):
        its = "".join('<a class="cfs-item" href="%ssolutions/%s/"><strong>%s</strong><span>%s</span></a>' % (R, s, E(n), E(d)) for s, n, d in items)
        pans += '<div class="cfs-panel%s"><span class="cfs-panel-label">Solutions</span><div class="cfs-items">%s</div></div>' % (" is-active" if i == 0 else "", its)
    eng = ('<aside class="cfs-engage"><h4>Engagement Mode</h4><p>Your success is our code</p>'
      '<a class="cfs-eng-row" href="%sstaff-augmentation/"><i><svg viewBox="0 0 24 24"><path d="M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm7 1a3 3 0 100-6 3 3 0 000 6zM2 20c0-3.5 3-6 7-6s7 2.5 7 6zm13.5-5.6c3 .3 6 1.8 6 5.6h-4.2c0-2-.8-3.9-1.8-5.6z"/></svg></i>Staff Augmentation</a>'
      '<a class="cfs-eng-row" href="%sproject-base/"><i><svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6zm8 1.5V8h4.5zM9 13h8v1.6H9zm0 4h8v1.6H9z"/></svg></i>Project Base</a></aside>') % (R, R)
    return ('<div class="cfs-dd"><button type="button" class="cfs-navbtn" aria-haspopup="true">Solutions<i class="cfs-caret"></i></button>'
      '<div class="cfs-mega"><div class="cfs-mega-head"><h3>Our Solutions</h3><p>Digital products, software and automation built around your business.</p></div><div class="cfs-mega-line"></div>'
      '<div class="cfs-mega-body"><div class="cfs-tabs">%s</div><div class="cfs-panels">%s</div>%s</div></div></div>') % (tabs, pans, eng)

def header(R, active=""):
    def a(href, label, key=""):
        return '<a%s href="%s">%s</a>' % (' class="is-active"' if key and key == active else "", href, label)
    mob = ""
    for c, items in data.CATS:
        mob += "<h5>%s</h5>" % E(c) + "".join('<a class="sub" href="%ssolutions/%s/">%s</a>' % (R, s, E(n)) for s, n, _ in items)
    mob += '<h5>Engagement Mode</h5><a class="sub" href="%sstaff-augmentation/">Staff Augmentation</a><a class="sub" href="%sproject-base/">Project Base</a>' % (R, R)
    return ('<header class="cfs-header"><nav class="cfs-nav"><a class="cfs-logo" href="%(R)s" aria-label="CompanyFlow home"><img src="%(R)sassets/companyflow-logo-new.svg" alt="CompanyFlow"></a>'
      '<div class="cfs-menu">%(home)s%(company)s%(mega)s'
      '<div class="cfs-dd"><button type="button" class="cfs-navbtn">Resources<i class="cfs-caret"></i></button><div class="cfs-drop"><a href="%(R)s#projects">Blog</a><a href="%(R)scareers/">Careers</a></div></div>'
      '%(cases)s</div><a class="cfs-contact" href="%(R)scontact-us/">Contact Us</a>'
      '<button class="cfs-toggle" type="button" aria-label="Open menu" aria-expanded="false"><span></span></button></nav>'
      '<div class="cfs-mobile"><a href="%(R)s">Home</a><a href="%(R)scompany/">Company</a>%(mob)s<a href="%(R)sblog/case-study/">Case Studies</a><a href="%(R)scontact-us/">Contact Us</a></div></header>') % dict(
        R=R, home=a(R, "Home", "home"), company=a(R + "company/", "Company", "company"), mega=mega(R), cases=a(R + "blog/case-study/", "Case Studies", "cases"), mob=mob)

def footer(R):
    q = [("Custom Software","custom-business-software"),("Websites","websites-landing-pages"),("App Development","mobile-web-apps"),("Ecommerce","ecommerce-development"),
         ("AI Automation","ai-automation"),("Application Security","application-hardening"),("Digital Growth","digital-growth")]
    ql = "".join('<li><a href="%ssolutions/%s/">%s</a></li>' % (R, s, E(n)) for n, s in q)
    return ('<footer class="cfs-footer"><div class="cfs-fgrid"><div class="cfs-fbrand"><a href="%(R)s"><img src="%(R)sassets/companyflow-logo-new.svg" alt="CompanyFlow"></a>'
      '<p>Step into the future of practical digital solutions, where technology meets your business challenges and drives impactful growth.</p><div class="cfs-soc"><a href="https://www.linkedin.com/" aria-label="LinkedIn">in</a><a href="https://x.com/" aria-label="X">X</a></div></div>'
      '<div><h3>Quick Links</h3><ul>%(ql)s</ul></div>'
      '<div><h3>Company</h3><ul><li><a href="%(R)scompany/">Company</a></li><li><a href="%(R)sblog/case-study/">Projects</a></li><li><a href="%(R)sstaff-augmentation/">Staff Augmentation</a></li><li><a href="%(R)sproject-base/">Project Base</a></li><li><a href="%(R)scontact-us/">Contact Us</a></li><li><a href="%(R)sprivacy-policy/">Privacy Policy</a></li><li><a href="%(R)sterms-and-conditions/">Terms &amp; Conditions</a></li></ul></div>'
      '<div><h3>Contact Us</h3><div class="cfs-fline">&#9993; <a href="mailto:alihotspot1@gmail.com">alihotspot1@gmail.com</a></div><div class="cfs-fline">&#9742; <a href="tel:+923407465567">+92 340 746 5567</a></div><a class="cfs-btn sq" style="margin-top:14px" href="%(R)scontact-us/">Start an Enquiry &#8599;</a></div></div>'
      '<div class="cfs-fbottom">&copy; 2026 CompanyFlow. All Rights Reserved</div></footer>'
      '<a class="cfs-wa" href="%(wa)s" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1l-1 1.2c-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.3-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.100 3.200 5.100 4.500 1.900.8 2.600.9 3.500.7.600-.1 1.800-.7 2-1.400.3-.7.3-1.300.2-1.400-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 00-8.600 15L2 22l5.200-1.400A10 10 0 1012 2z"/></svg></a>'
      '<script src="%(R)sassets/cf-solutions.js" defer></script></body></html>') % dict(R=R, ql=ql, wa=WA)

CTA = ('<section class="sv-cta"><div class="sv-wrap sv-cta-in"><h2>Your Solutions Are One Call Away Lets Reach Out Today!</h2>'
       '<div class="sv-cta-btns"><a class="cfs-btn sq" href="%(R)scontact-us/">Contact Us</a><a class="cfs-btn sq" href="' + WA.replace('%','%%') + '">Talk Now</a></div></div></section>')

# ---------- service page ----------
def tiles(items):
    out = ""
    for label, icon in items:
        out += '<div class="sv-tile" title="%s"><img class="sv-logo" src="%s" alt="%s" loading="lazy"></div>' % (E(label), DEVICON.format(n=icon), E(label))
    return out

def service_page(cat, slug, name, desc):
    R = "../../"
    h1, hero, cta, ab_h, ab_p, chips, exp, faq, (proj, yrs) = data.P[slug]
    tech = data.TECH[data.PRESET[slug]]
    tabs = "".join('<button type="button" class="sv-tabbtn%s">%s</button>' % (" is-active" if i == 0 else "", E(k)) for i, k in enumerate(tech))
    pans = "".join('<div class="sv-techpanel%s">%s</div>' % (" is-active" if i == 0 else "", tiles(v)) for i, (k, v) in enumerate(tech.items()))
    cards = "".join('<div class="sv-card sv-rv"><i>%s</i><h3>%s</h3><p>%s</p></div>' % (svg_icon(CARD_ICONS[i]), E(t), E(x)) for i, (t, x) in enumerate(exp))
    generic = [("How long does a %s project take?" % name, "Timelines depend on scope. Small projects usually take two to four weeks, and larger projects are planned in milestones so you see progress every week."),
               ("Do you provide support after delivery?", "Yes. Every project includes a support period, and we offer monthly plans for updates, monitoring and improvements."),
               ("How do I get started?", "Contact us with a short description of your goals. We will schedule a call, share a plan and quote, and begin once you approve it.")]
    qa = list(faq) + generic
    faqs = "".join('<details class="sv-q"%s><summary>%s</summary><p>%s</p></details>' % (" open" if i == 0 else "", E(q), E(a)) for i, (q, a) in enumerate(qa))
    glyph = data.GLYPH[cat]
    body = ('<main>'
      '<section class="sv-hero"><div class="sv-wrap sv-hero-grid"><div class="sv-rv"><h1>%(h1)s</h1><p>%(hero)s</p><a class="cfs-btn" href="%(R)scontact-us/">%(cta)s</a></div><div class="sv-art sv-rv">%(art)s</div></div></section>'
      '<div class="sv-line"></div>'
      '<section class="sv-about"><div class="sv-wrap sv-about-grid"><div class="sv-collage sv-rv"><div class="big"></div><div class="small"></div><div class="sv-badge">%(badge)s</div></div>'
      '<div class="sv-rv"><span class="sv-eyebrow">About Services</span><h2 class="sv-h2">%(ab_h)s</h2><p>%(ab_p)s</p>'
      '<div class="sv-chips"><div class="sv-chip"><i>%(c0)s</i>%(chip0)s</div><div class="sv-chip"><i>%(c1)s</i>%(chip1)s</div></div>'
      '<div class="sv-stats"><div class="sv-stat"><strong>%(yrs)s+</strong><span>Years of Experience</span></div><div class="sv-stat"><strong>%(proj)s</strong><span>Projects Delivered</span></div><div class="sv-stat"><strong>100%%</strong><span>Happy Clients</span></div></div></div></div></section>'
      '<div class="sv-line"></div>'
      '<section class="sv-tech"><div class="sv-wrap sv-rv"><h2 class="sv-h2">Technologies We Work With</h2><p class="sv-tech-sub">We embrace emerging technologies that shake up industries by providing smarter, faster, and more efficient solutions for a digital edge.</p>'
      '<div class="sv-tabs">%(tabs)s</div><div class="sv-techline"></div>%(pans)s</div></section>'
      '<section class="sv-exp"><div class="sv-wrap"><span class="sv-eyebrow sv-rv">Expertise</span><h2 class="sv-h2 sv-rv">Unmatched Expertise,<br>Proven Results</h2><div class="sv-cards">%(cards)s</div></div></section>'
      '<div class="sv-line"></div>'
      '<section class="sv-faq"><div class="sv-wrap sv-faq-grid"><div class="sv-qart sv-rv">%(qart)s</div><div class="sv-rv"><span class="sv-eyebrow">FAQ</span><h2 class="sv-h2">Got Questions? Find Your<br>Answers Here!</h2>%(faqs)s</div></div></section>'
      + CTA + '</main>') % dict(h1=E(h1), hero=E(hero), cta=E(cta), R=R, art=hero_art(glyph), badge=badge(name), ab_h=E(ab_h), ab_p=E(ab_p),
        c0=chip_icon(0), c1=chip_icon(1), chip0=E(chips[0]), chip1=E(chips[1]), yrs=yrs, proj=proj, tabs=tabs, pans=pans, cards=cards, qart=q_art(), faqs=faqs)
    return head("%s \u2014 %s" % (h1, SITE), "%s. %s" % (desc, hero), R) + header(R) + body + footer(R)

# ---------- Staff Augmentation / Project Base ----------
def engage_page(slug, label):
    R = "../"
    d = data.ENGAGE[slug]
    ben = d["benefits"]
    def b(i): t, x = ben[i]; return '<div class="sv-b"><b>%02d</b><div><strong>%s</strong><span>%s</span></div></div>' % (i + 1, E(t), E(x))
    form = ('<form class="sv-formcard" id="cfs-form" data-subject="New %s enquiry" novalidate>'
      '<div class="sv-frow"><label><span>First name</span><input name="first" required></label><label><span>Last name</span><input name="last"></label></div>'
      '<div class="sv-frow"><label><span>Email</span><input type="email" name="email" required></label><label><span>Company name</span><input name="company"></label></div>'
      '<div class="sv-frow"><label><span>How can we help you?</span><input name="help"></label><label><span>Phone Number</span><input name="phone"></label></div>'
      '<label><span>Message</span><textarea name="message" required></textarea></label><button class="cfs-btn sq" type="submit">SEND REQUEST</button><p class="sv-note" id="cfs-note" hidden></p></form>') % E(label)
    body = ('<main><section class="sv-hero"><div class="sv-wrap sv-hero-grid"><div class="sv-rv"><h1>%(h1)s</h1><p>%(hero)s</p><a class="cfs-btn" href="%(R)scontact-us/">%(cta)s</a></div><div class="sv-art sv-rv">%(art)s</div></div></section><div class="sv-line"></div>'
      '<section class="sv-ben"><div class="sv-wrap"><span class="sv-eyebrow sv-rv">About Services</span><h2 class="sv-h2 sv-rv">%(adv)s</h2><p class="sv-ben-sub sv-rv">%(advp)s</p>'
      '<div class="sv-ben-grid"><div class="sv-ben-col sv-rv">%(b0)s%(b1)s%(b2)s</div><div class="sv-art sv-rv">%(art2)s</div><div class="sv-ben-col sv-rv">%(b3)s%(b4)s%(b5)s</div></div></div></section><div class="sv-line"></div>'
      '<section class="sv-form"><div class="sv-wrap sv-form-grid"><div class="sv-rv"><h2 class="sv-h2">%(fh)s</h2><p class="sv-form-p">%(fp)s</p><div class="sv-qart">%(qart)s</div></div><div class="sv-rv">%(form)s</div></div></section>'
      + CTA + '</main>') % dict(h1=E(d["h1"]), hero=E(d["hero"]), cta=E(d["cta"]), R=R, art=hero_art("users" if slug == "staff-augmentation" else "layers"), art2=hero_art("check"),
        adv=E(d["adv_h"]), advp=E(d["adv_p"]), b0=b(0), b1=b(1), b2=b(2), b3=b(3), b4=b(4), b5=b(5), fh=E(d["form_h"]), fp=E(d["form_p"]), qart=q_art(), form=form)
    return head("%s \u2014 %s" % (label, SITE), d["hero"], R) + header(R) + body + footer(R)

# ---------- patch existing pages ----------
def patch_existing(root):
    count = 0
    skip = ("solutions", "staff-augmentation", "project-base", "tools", "wp-content", "wp-includes", "assets")
    for f in glob.glob(os.path.join(root, "**", "index.html"), recursive=True):
        rel = os.path.relpath(f, root).replace("\\", "/")
        if rel == "index.html" or rel.split("/")[0] in skip: continue
        s = open(f, encoding="utf-8").read()
        if "cfs-header" in s or "gx-site-header" not in s: continue
        depth = rel.count("/")
        R = "../" * depth
        s = re.sub(r'<header class="gx-site-header.*?</header>', lambda m: header(R), s, count=1, flags=re.S)
        s = s.replace("</head>", '<link rel="stylesheet" href="%sassets/cf-solutions.css"></head>' % R, 1)
        s = s.replace("</body>", '<script src="%sassets/cf-solutions.js" defer></script></body>' % R, 1)
        open(f, "w", encoding="utf-8").write(s); count += 1
    return count

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")))
    ap.add_argument("--patch-existing", action="store_true")
    a = ap.parse_args()
    root = a.root
    for cat, slug, name, desc in ALL:
        d = os.path.join(root, "solutions", slug); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(service_page(cat, slug, name, desc))
    for slug, label in (("staff-augmentation", "Staff Augmentation"), ("project-base", "Project Base")):
        d = os.path.join(root, slug); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(engage_page(slug, label))
    print("built %d service pages + 2 engagement pages" % len(ALL))
    if a.patch_existing: print("patched headers on %d existing pages" % patch_existing(root))

if __name__ == "__main__": main()
