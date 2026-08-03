# Jing Chen's Personal Website

Personal website designed in an **Engineering Spec Sheet** style (hairline rules,
mono data labels, one ink-blue accent), hosted on **GitHub Pages**. Pure static
HTML / CSS / JS — no build step required.

The site is **bilingual (中文 / English)**, defaulting to Chinese. A toggle in the
top header switches the whole site — the visitor's choice is remembered in
`localStorage`.

```
.
├── index.html          # Homepage (recent posts + sidebar)
├── blog.html           # All blog posts
├── projects.html       # Projects page
├── timeline.html       # Career / life timeline
├── about.html          # About page
├── 404.html
├── assets/
│   ├── css/style.css   # All styles
│   ├── js/main.js      # Site config + shared header/sidebar/footer
│   ├── posts.json      # Post manifest (renders the blog list)
│   └── img/            # avatar.svg placeholder (replace with your photo)
└── blog/               # One HTML file per post
```

## How to customize

Almost everything lives in **`assets/js/main.js`** → the `SITE` object at the top:

- `name` / `role` / `bio` / `location` — your identity
- `contacts` — email & social links shown in the sidebar
- `nav` — top navigation items

Bilingual fields (`role`, `location`, `bio`, nav `label`s, footer `extra`) are
objects of the form `{ "en": "...", "zh": "..." }`. The `name` and `contacts`
are the same in both languages.

### Blog admin

There is a browser-based admin page at **`/admin.html`** (not shown in the nav) for
writing and publishing posts without touching git: enter a GitHub token once, write
bilingual Markdown, and click **Publish** — the post is committed to `main` via the
GitHub API and GitHub Pages deploys automatically. See the token hint on that page
(fine-grained token, Contents: read/write, scoped to this repo only).

The **站点资料 / Settings** tab edits the site profile (avatar — including uploading
an image into `assets/img/`, name, role, location, bio, contacts, footer). Saved
settings are written to `assets/js/site-config.js`, which `main.js` merges over its
defaults, so pages don't need to change.

### Publishing via the site relay server

When the browser cannot reach `api.github.com` directly (e.g. a restrictive
network), the admin can publish through the **server relay**: it runs a small
server (`relay_server.py`, port 8090) that serves this site and commits + pushes
files to GitHub. Open `http://60.205.211.224:8090/admin.html` and the "服务器中转"
transport is selected automatically (or toggle it in the top bar). The same GitHub
token is used for auth; the relay server itself holds the git/gh credentials.

## Add a new blog post

1. Copy `blog/welcome.html` to `blog/your-post-name.html` and edit the content.
   Posts are bilingual: write the Chinese body inside `<div data-lang="zh">…</div>`
   and the English body inside `<div data-lang="en" hidden>…</div>` (keep the
   `hidden` on the English block so the Chinese version shows first). Titles and
   labels use the same pattern with `<span data-lang="…">`.
2. Add an entry to `assets/posts.json` with both languages:

```json
{
  "title": "Your post title",
  "title_zh": "你的文章标题",
  "slug": "your-post-name",
  "date": "2026-08-03",
  "tags": ["Tag A"],
  "tags_zh": ["标签"],
  "excerpt": "One-line summary shown on the Blog page.",
  "excerpt_zh": "博客页面上显示的一行摘要。",
  "file": "blog/your-post-name.html"
}
```

### Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

Push to the `main` branch — GitHub Pages serves the site automatically:

```bash
git add -A
git commit -m "Initial version of personal website"
git push origin main
```

The site will be live at `https://JingChenCHN.github.io/`.
