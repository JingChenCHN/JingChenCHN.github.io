/* ==========================================================================
   Personal website — shared components & site config
   --------------------------------------------------------------------------
   Edit the SITE object below to update your name, role, contacts and links.
   Post lists are rendered from assets/posts.json — add/remove entries there.
   ========================================================================== */

const SITE = {
  // ---- Basic info ------------------------------------------------------
  name: "Jing Chen",                 // your display name
  avatar: "assets/img/avatar.svg",   // path to your photo (or placeholder)
  role: "Product Manager",           // one-line job / field
  location: "China",                 // set to "" to hide this row

  // ---- Contact / social links (shown in the sidebar) -------------------
  contacts: [
    { icon: "email",    label: "hemo8212@outlook.com", href: "mailto:hemo8212@outlook.com" },
    { icon: "github",   label: "GitHub",               href: "https://github.com/JingChenCHN" },
    { icon: "rss",      label: "RSS Feed",             href: "blog.html" },
  ],

  // ---- Sidebar "profile" box (short bio) -------------------------------
  bio: "Product manager, passionate about building products that solve real problems. I write about product thinking and the technology behind it.",

  // ---- Nav bar links ----------------------------------------------------
  nav: [
    { label: "Home",     href: "index.html" },
    { label: "Blog",     href: "blog.html" },
    { label: "Projects", href: "projects.html" },
    { label: "Timeline", href: "timeline.html" },
    { label: "About",    href: "about.html" },
  ],

  // ---- Footer ------------------------------------------------------------
  footer: {
    copyright: "© 2026 Jing Chen",
    extra: 'Built with <a href="https://pages.github.com/">GitHub Pages</a>',
  },
};

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

function renderHeader() {
  const host = $("#site-header");
  if (!host) return;
  const page = currentPage();
  const nav = SITE.nav
    .map(
      (n) =>
        `<a href="${n.href}" class="${page === n.href ? "active" : ""}">${n.label}</a>`
    )
    .join("");
  host.innerHTML = `
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="index.html">${SITE.name}</a>
        <nav class="nav">${nav}</nav>
      </div>
    </header>`;
}

function renderSidebar() {
  const host = $("#site-sidebar");
  if (!host) return;
  const contacts = SITE.contacts
    .map(
      (c) =>
        `<li><a href="${c.href}" title="${c.label}" target="${c.href.startsWith("http") ? "_blank" : ""}" rel="noopener">${iconHTML(c.icon)}<span>${c.label}</span></a></li>`
    )
    .join("");
  host.innerHTML = `
    <aside class="sidebar">
      <div class="profile">
        <img class="avatar" src="${SITE.avatar}" alt="${SITE.name}" />
        <p class="name">${SITE.name}</p>
        <p class="role">${SITE.role}</p>
        <ul class="contact-list">
          ${SITE.location ? `<li>${iconHTML("location")}<span>${SITE.location}</span></li>` : ""}
          ${contacts}
        </ul>
      </div>
      <div class="sidebar-box">
        <h4>Profile</h4>
        <p>${SITE.bio}</p>
      </div>
    </aside>`;
}

function renderFooter() {
  const host = $("#site-footer");
  if (!host) return;
  host.innerHTML = `
    <footer class="site-footer">
      ${SITE.footer.copyright} &nbsp;·&nbsp; ${SITE.footer.extra}
    </footer>`;
}

/* -------------------------------------------------------------------------- */
/*  Posts (from assets/posts.json)                                            */
/* -------------------------------------------------------------------------- */
function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function postCard(p) {
  const tags = (p.tags || [])
    .map((t) => `<a class="tag" href="blog.html">${t}</a>`)
    .join("");
  return `
    <li>
      <h3 class="post-title"><a href="${p.file}">${p.title}</a></h3>
      <span class="post-date">${fmtDate(p.date)}</span>
      <p class="post-excerpt">${p.excerpt}</p>
      <div class="post-tags">${tags}</div>
    </li>`;
}

function renderPosts() {
  const list = $("#js-posts");
  const all = $("#js-all-posts");
  const max = list ? parseInt(list.dataset.max || "5", 10) : null;

  fetch("assets/posts.json")
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
/*  Init                                                                      */
/* -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderSidebar();
  renderFooter();
  renderPosts();
});
