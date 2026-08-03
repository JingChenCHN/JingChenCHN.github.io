# Jing Chen's Personal Website

Personal website built in the style of [lilianweng.github.io](https://lilianweng.github.io/),
hosted on **GitHub Pages**. Pure static HTML / CSS / JS — no build step required.

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

### Add a new blog post

1. Copy `blog/welcome.html` to `blog/your-post-name.html` and edit the content.
2. Add an entry to `assets/posts.json`:

```json
{
  "title": "Your post title",
  "slug": "your-post-name",
  "date": "2026-08-03",
  "tags": ["Tag A", "Tag B"],
  "excerpt": "One-line summary shown on the Blog page.",
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
