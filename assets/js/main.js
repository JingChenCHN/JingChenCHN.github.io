/* ==========================================================================
   Personal website — shared components & site config
   --------------------------------------------------------------------------
   Edit the SITE object below to update your name, role, contacts and links.
   Post lists are rendered from assets/posts.json — add/remove entries there.

   Bilingual:
   - Strings are either plain text or { en, zh } objects; t() picks the
     current language. The visitor's choice is stored in localStorage.
   - Hand-written pages mark translated blocks with data-lang="en" / "zh";
     applyLang() shows only the current language (default: Chinese).
   ========================================================================== */

/* -------------------------------------------------------------------------- */
/*  Language                                                                  */
/* -------------------------------------------------------------------------- */
let lang = "zh";
try { lang = localStorage.getItem("site-lang") || "zh"; } catch (e) { /* storage unavailable */ }

/* Escape user-config text before it goes into innerHTML. */
const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
const t = (o) =>
  typeof o === "string" ? o : (o && (o[lang] || o.en || o.zh)) || "";

const SITE = {
  // ---- Basic info ------------------------------------------------------
  name: "Jing Chen",                 // your display name
  avatar: "assets/img/avatar.svg",   // path to your photo (or placeholder)
  role: { en: "Product Manager", zh: "产品经理" },
  location: { en: "China", zh: "中国" },   // set to "" to hide this row

  // ---- Contact / social links (shown in the sidebar) -------------------
  contacts: [
    { icon: "email",    label: "hemo8212@outlook.com", href: "mailto:hemo8212@outlook.com" },
    { icon: "github",   label: "GitHub",               href: "https://github.com/JingChenCHN" },
    { icon: "rss",      label: "RSS",                  href: "blog.html" },
  ],

  // ---- Sidebar "profile" box (short bio) -------------------------------
  bio: {
    en: "Product manager, passionate about building products that solve real problems. I write about product thinking and the technology behind it.",
    zh: "产品经理，热衷于打造能解决真实问题的产品。我会在这里写一些关于产品思考以及背后技术的文章。",
  },

  // ---- Nav bar links ----------------------------------------------------
  nav: [
    { label: { en: "Home",     zh: "首页" },   href: "index.html" },
    { label: { en: "Blog",     zh: "博客" },   href: "blog.html" },
    { label: { en: "Projects", zh: "项目" },   href: "projects.html" },
    { label: { en: "Timeline", zh: "时间线" }, href: "timeline.html" },
    { label: { en: "About",    zh: "关于" },   href: "about.html" },
  ],

  // ---- Footer ------------------------------------------------------------
  footer: {
    copyright: "© 2026 Jing Chen",
    extra: {
      en: 'Built with <a href="https://pages.github.com/">GitHub Pages</a>',
      zh: '基于 <a href="https://pages.github.com/">GitHub Pages</a> 构建',
    },
  },
};

// Site profile overrides from assets/js/site-config.js (edited via admin.html).
// Loaded before this script on every page; merged values take precedence.
if (window.SITE_OVERRIDES) Object.assign(SITE, window.SITE_OVERRIDES);

/* -------------------------------------------------------------------------- */
/*  SVG icons                                                                 */
/* -------------------------------------------------------------------------- */
const ICONS = {
  email:   '<path d="M2 4h20v16H2V4zm2 2v.77l8 5.6 8-5.6V6H4zm0 12h16V9.23l-8 5.6-8-5.6V18z"/>',
  github:  '<path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.34.96.11-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12v3.14c0 .3.2.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>',
  twitter: '<path d="M18.9 2H22l-6.8 7.8L23.3 22h-6.3l-4.9-6.4L6.5 22H3.3l7.3-8.3L2 2h6.4l4.4 5.9L18.9 2zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20z"/>',
  scholar: '<path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm8-9a10 10 0 0 0-1.3-5L23 6l-2-2-5.4 4.4a10 10 0 0 0-7.2 0L3 4 1 6l4.3 4A10 10 0 0 0 10 20.7V23h4v-2.3A10 10 0 0 0 20 15z"/>',
  linkedin:'<path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.77-2.2 4.03 0 4.78 2.65 4.78 6.1V24h-4v-8.4c0-2-.04-4.58-2.8-4.58-2.8 0-3.23 2.18-3.23 4.43V24h-4V8z"/>',
  location:'<path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>',
  rss:     '<path d="M6.18 17.82a4.32 4.32 0 0 0-6.18 0v-2.18a6.5 6.5 0 0 1 6.18 0v2.18zM0 14v-4c5.52 0 10 4.48 10 10H6a6 6 0 0 0-6-6zm0-8a18 18 0 0 1 18 18h-4A14 14 0 0 0 0 10V6z"/>',
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */
const $ = (sel) => document.querySelector(sel);
const iconHTML = (name) =>
  `<span class="icon"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${ICONS[name] || ""}</svg></span>`;

function currentPage() {
  const p = location.pathname.split("/").pop() || "index.html";
  return p.toLowerCase();
}

/* Posts live in /blog/, so pages inside that folder need one level up. */
function siteRoot() {
  return location.pathname.includes("/blog/") ? "../" : "";
}
/* Resolve a repo-relative path (config value, nav href) from the current page. */
function sitePath(p) {
  if (!p || p.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(p)) return p;
  return siteRoot() + p;
}

/* Spec-sheet page id shown in the header margin, e.g. "S.01 — HOME". */
function sheetId(page) {
  const map = {
    "index.html": "S.01 — HOME",
    "blog.html": "S.02 — BLOG",
    "projects.html": "S.03 — PROJECTS",
    "timeline.html": "S.04 — TIMELINE",
    "about.html": "S.05 — ABOUT",
    "404.html": "ERR — 404",
  };
  if (map[page]) return map[page];
  return "S.02 — " + page.replace(/\.html$/, "");
}

function renderHeader() {
  const host = $("#site-header");
  if (!host) return;
  const page = currentPage();
  const inBlog = location.pathname.includes("/blog/");
  const nav = SITE.nav
    .map(
      (n) =>
        `<a href="${sitePath(n.href)}" class="${page === n.href || (inBlog && n.href === "blog.html") ? "active" : ""}">${esc(t(n.label))}</a>`
    )
    .join("");
  const now = new Date();
  const rev = `REV ${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}`;
  host.innerHTML = `
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="${sitePath("index.html")}">${esc(SITE.name)}<span class="brand-spec">SPEC</span></a>
        <nav class="nav">${nav}</nav>
        <div class="lang-toggle" role="group" aria-label="Language / 语言">
          <button type="button" data-lang-btn="zh" aria-pressed="${lang === "zh"}" class="${lang === "zh" ? "active" : ""}">中文</button>
          <button type="button" data-lang-btn="en" aria-pressed="${lang === "en"}" class="${lang === "en" ? "active" : ""}">EN</button>
        </div>
      </div>
      <div class="header-spec" aria-hidden="true">
        <span class="hs-left">${sheetId(page)}</span>
        <span class="hs-right">${rev}</span>
      </div>
    </header>`;
}

function renderSidebar() {
  const host = $("#site-sidebar");
  if (!host) return;
  const contacts = SITE.contacts
    .map((c) => {
      const key = (c.icon || "LINK").toUpperCase();
      const target = c.href.startsWith("http") ? '_blank' : "";
      return `<li><span class="k">${iconHTML(c.icon)}${key}</span><a class="v" href="${sitePath(c.href)}" target="${target}" rel="noopener">${esc(c.label)}</a></li>`;
    })
    .join("");
  const loc = SITE.location
    ? `<li><span class="k">${iconHTML("location")}BASE</span><span class="v">${esc(t(SITE.location))}</span></li>`
    : "";
  host.innerHTML = `
    <aside class="sidebar">
      <div class="profile">
        <img class="avatar" src="${sitePath(SITE.avatar)}" alt="${esc(SITE.name)}" />
        <span class="id-tag">ID · ${esc(SITE.name.toUpperCase())}</span>
        <p class="name">${esc(SITE.name)}</p>
        <p class="role">${esc(t(SITE.role))}</p>
        <ul class="spec-rows">
          ${loc}
          ${contacts}
        </ul>
      </div>
      <div class="sidebar-box">
        <h4>${esc(t({ en: "Profile", zh: "简介" }))}</h4>
        <p>${esc(t(SITE.bio))}</p>
      </div>
    </aside>`;
}

function renderFooter() {
  const host = $("#site-footer");
  if (!host) return;
  host.innerHTML = `
    <footer class="site-footer">
      <div class="footer-inner">
        <span>${esc(SITE.footer.copyright)}</span>
        <span>${t(SITE.footer.extra)}</span>
      </div>
    </footer>`;
}

/* -------------------------------------------------------------------------- */
/*  Posts (from assets/posts.json)                                            */
/* -------------------------------------------------------------------------- */
/* Spec dates render as ISO (YYYY-MM-DD) in mono. */
function fmtDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y) return iso;
  return `${y}-${m || "00"}-${d || "00"}`;
}

/* Posts live in /blog/, so pages inside that folder need one level up. */
function postsPath() {
  return location.pathname.includes("/blog/")
    ? "../assets/posts.json"
    : "assets/posts.json";
}

function postCard(p, idx) {
  const title = esc(t({ en: p.title, zh: p.title_zh || p.title }));
  const excerpt = esc(t({ en: p.excerpt, zh: p.excerpt_zh || p.excerpt }));
  const tagArr = lang === "zh" ? p.tags_zh || p.tags : p.tags;
  const tags = (tagArr || [])
    .map((tag) => `<a class="pm-tag" href="blog.html">${esc(tag)}</a>`)
    .join("");
  const entry = String(idx + 1).padStart(2, "0");
  return `
    <li>
      <div class="post-meta">
        <span class="pm-entry">ENTRY ${entry}</span>
        <span class="pm-date">${fmtDate(p.date)}</span>
        ${tags ? `<span class="pm-tags">${tags}</span>` : ""}
      </div>
      <h3 class="post-title"><a href="${p.file}">${title}</a></h3>
      <p class="post-excerpt">${excerpt}</p>
    </li>`;
}

function renderPosts() {
  const list = $("#js-posts");
  const all = $("#js-all-posts");
  const max = list ? parseInt(list.dataset.max || "5", 10) : null;

  fetch(postsPath())
    .then((r) => r.json())
    .then((posts) => {
      const sorted = posts
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : -1));

      if (list) list.innerHTML = sorted.slice(0, max).map(postCard).join("");
      if (all) all.innerHTML = sorted.map(postCard).join("");

      document.querySelectorAll(".js-post-count").forEach((el) => {
        el.textContent = posts.length;
      });
    })
    .catch((err) => console.error("Failed to load posts:", err));
}

/* -------------------------------------------------------------------------- */
/*  Language switching                                                        */
/* -------------------------------------------------------------------------- */
function applyLang() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-lang]").forEach((el) => {
    el.hidden = el.dataset.lang !== lang;
  });
}

function setLang(next) {
  if (next === lang) return;
  lang = next;
  localStorage.setItem("site-lang", lang);
  renderHeader();
  renderSidebar();
  renderFooter();
  renderPosts();
  applyLang();
}

/* -------------------------------------------------------------------------- */
/*  Init                                                                      */
/* -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderSidebar();
  renderFooter();
  renderPosts();
  applyLang();
});

/* Event delegation — survives the header being re-rendered on each switch. */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-lang-btn]");
  if (btn) setLang(btn.dataset.langBtn);
});
