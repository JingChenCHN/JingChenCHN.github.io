# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary visitor: readers of Jing Chen's content — people who click a link to the
site to read product-thinking posts and to quickly gauge who Jing Chen is. The
site is bilingual (中文 / English) and defaults to Chinese; many readers are
Chinese-speaking.

## Product Purpose

Jing Chen's personal website: a home for product-thinking writing (blog), plus
identity, projects, and career timeline. Success = readers find the writing
clear and worth reading, and leave with a sense of who Jing Chen is.

## Positioning

A personal, bilingual blog of a China-based product manager — readable writing
first, professional identity alongside. Nothing commercial or transactional.

## Operating Context

Pure static site hosted on GitHub Pages (repo `JingChenCHN/JingChenCHN.github.io`,
branch `main`), no build step. Content lives in `assets/js/main.js` (site config)
and `assets/posts.json` (post manifest); posts are HTML files in `blog/*.html`.
A browser admin page (`admin.html`) publishes posts and site settings via the
GitHub API or a server relay. Deploy = push to `main`.

## Capabilities and Constraints

- Bilingual with a `中文 | EN` toggle (default 中文), persisted in localStorage.
- Pages: Home (recent posts), Blog, Projects, Timeline, About, 404, admin tool.
- Blog posts support Markdown-authored HTML with GFM tables, code blocks, tags.
- Identity (avatar, name, role, location, bio, contacts, footer) is user-editable
  through the admin page, writing overrides to `assets/js/site-config.js`.
- No build tooling; every page is plain HTML + shared CSS/JS. The admin page
  reuses the same `assets/css/style.css` tokens.
- Placeholder content on about / timeline / projects is intentionally kept —
  the owner replaces it later.

## Brand Commitments

- Name: Jing Chen. Identity: product manager (产品经理).
- Bilingual, defaulting to Chinese — both languages must render on every surface.
- Design brief (explicit, negative): 现代简洁设计，不要太复古 — modern and clean,
  not retro. This is a style constraint on the visual world, not a content one.
- Content and information architecture are authoritative as-is: the homepage
  leads with recent posts; about/timeline/projects keep their existing (partly
  placeholder) content during the redesign.

## Evidence on Hand

- One published post: `blog/my-thought-of-making-a-good-product.html`
  («一些做好一个产品的principel», 2026-08-03).
- Real identity data in `assets/js/main.js` (SITE) and user-editable overrides
  in `assets/js/site-config.js`.
- Placeholder avatar `assets/img/avatar.svg`; real photo to be added by owner.
- Contact: hemo8212@outlook.com; GitHub: https://github.com/JingChenCHN.

## Product Principles

- **Reading comes first.** The visitor is a reader; layout and typography serve
  long-form comprehension over decoration.
- **Information architecture is settled.** Homepage = recent posts; do not
  rearrange navigation or page roles during a visual redesign.
- **Bilingual parity.** Every surface renders identically well in 中文 and EN.
- **Content stays authoritative.** Do not invent or replace the owner's copy;
  placeholders remain placeholders until the owner writes real content.
- **Modern and clean.** The visual world must read as current, not retro.

## Accessibility & Inclusion

- Language switching sets `document.documentElement.lang` appropriately.
- New design must keep contrast, focus states, and responsive behavior at least
  as good as the current site (screen readers, mobile).
