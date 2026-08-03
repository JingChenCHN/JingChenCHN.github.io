# Design — Engineering Spec Sheet

<!-- impeccable:design-schema 1 -->

The site's visual world is that of a **precise engineering specification**: a
"sheet" of hairline rules and mono data labels, one restrained ink-blue accent,
and a clean reading column. Replaces the former Lilian Weng academic-blog look.
Every rule below is what the shipped `assets/css/style.css` + `assets/js/main.js`
actually render.

## Direction

- **THESIS** — The site reads like a product spec / title block: hairline rules,
  mono data labels (ENTRY / REV / ID / sheet numbers), one ink-blue accent, clean
  white reading column. It refuses the generic "minimal blog": no soft cards, no
  icon-tile hero, no rounded everything.
- **OWN-WORLD** — ink `#161b22` on paper white; blueprint-blue `#1e54b3` accent;
  a faint construction grid (`rgba(30,84,179,.05)`, 26px) in the header/footer
  margins; registration crosshairs at the header/footer corners and title block;
  Space Grotesk (display) + Inter (body) + IBM Plex Mono (data), self-hosted
  woff2, system CJK fallback (PingFang / Hiragino / Microsoft YaHei).
- **STORY** — A reader lands on a spec sheet, sees numbered entries, reads a post
  in a comfortable 700px column, and understands Jing Chen as a precise,
  product-minded writer.
- **FORM** — spec-sheet world, grounded direction 5 of concept roll
  (seed `cf2d08f6`), selected by the owner over the dealt challengers.

## Tokens

CSS custom properties in `assets/css/style.css` `:root`:

| token | value | role |
|---|---|---|
| `--text` | `#161b22` | body ink (17.3:1 on white) |
| `--text-muted` | `#5a6472` | secondary (6.0:1) |
| `--text-faint` | `#66707f` | mono labels, dates (5.0:1) |
| `--accent` / `--link` | `#1e54b3` | the single ink-blue accent (7.1:1) |
| `--border` | `#e0e4ea` | hairlines |
| `--border-strong` | `#c6cdd8` | emphasized rules |
| `--bg-soft` | `#f6f7f9` | note blocks, soft fills |
| `--code-bg` / `--code-fg` | `#161b22` / `#e8ecf2` | dark code panel |
| `--font-body` | Inter + CJK | body |
| `--font-display` | Space Grotesk + CJK | headings, brand, nav |
| `--font-mono` | IBM Plex Mono | data labels only |

Accent usage is deliberately sparse: sheet ids, ENTRY numbers, active nav, links,
tags-on-hover, the ID/SPEC tags, timeline nodes, table headers. Reading text
stays ink-on-white (list markers are muted, not blue).

## Typography

- Body: Inter 16px / 1.75, `--content-max: 700px` reading column.
- Display: Space Grotesk for h1–h3, brand, post titles; weights 600/700.
- Data: IBM Plex Mono for dates, ENTRY numbers, sheet/REV lines, spec-table keys,
  page meta, footer spec line — numbers and measurement, never body prose.
- Self-hosted latin woff2 in `assets/fonts/` (Space Grotesk 500/600/700, Inter
  400/600, IBM Plex Mono 400/600; latin + latin-ext), so the site renders even
  where Google Fonts is unreachable (mainland China). CJK always falls back to
  system fonts.

## Layout & components

- **Header (sheet margin)**: faint blueprint grid band, corner registration
  crosshairs, brand `Jing Chen [SPEC]`, hairline nav with an ink underline on the
  active item, segmented `中文 | EN` toggle (active segment filled ink), and a
  running mono footnote `S.01 — HOME · REV 2026.08`.
- **Sidebar (title block)**: bordered identification block — circular avatar,
  mono `ID · <NAME>` tag, display name, role, then a label:value spec table
  (BASE / EMAIL / GITHUB / RSS with inline SVG icons), then a `NOTE — 简介`
  bio panel. Sticky on desktop; flexes to a horizontal strip on mobile.
- **Post list (spec entries)**: hairline-ruled rows, each with a mono meta line
  `ENTRY 01 · 2026-08-03 · tags`, a display-font title that draws a hairline
  underline on hover, and a muted excerpt. ENTRY numbering is reverse-chron rank.
- **Content pages**: mono page-meta under a display h1 with a hairline rule;
  blockquote = hairline-left + soft fill; code = dark ink panel; tables = hairline
  grid with mono uppercase header row.
- **Timeline**: hairline vertical rule with square (registration-mark) accent
  nodes and mono dates.
- **Footer (closing line)**: faint grid band, crosshairs, mono `© YEAR · extra`.
- **Admin tool page**: unchanged structure; reuses the same `:root` tokens.
  Contact-row grid collapses at ≤600px.

## Motion & states

- One authored moment: the `[SPEC]` tag stamps in on load (420ms ease). Post-title
  hover draws a hairline underline L→R. Both disabled under `prefers-reduced-motion`.
- States: `:focus-visible` ink outline on all interactive elements; hover states
  on nav, links, tags, view-all; lang buttons expose `aria-pressed`.

## Responsive

- ≤960px: single column, sidebar becomes a horizontal profile strip (avatar left,
  spec rows below).
- ≤540px: tighter padding, smaller post titles / h1.

## Implementation notes

- `assets/js/main.js` renders header/sidebar/footer and the post list; it resolves
  all repo-relative hrefs through `sitePath()` so `/blog/*` pages link correctly
  (`../index.html` etc.) and marks the 博客 nav active on post pages.
- Bilingual: `data-lang` blocks + `t()` picker; language in `localStorage["site-lang"]`
  (default zh), guarded against storage-unavailable contexts.
- Config values are HTML-escaped before insertion (`esc()`); `footer.extra` stays
  intentional HTML.
