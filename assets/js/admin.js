/* ==========================================================================
   Blog admin — author & publish posts directly to GitHub from the browser.
   --------------------------------------------------------------------------
   Requires a GitHub token (stored in localStorage, sent only to api.github.com).
   Reads/writes blog/<slug>.html and assets/posts.json on branch "main";
   GitHub Pages deploys automatically after each commit.
   ========================================================================== */

/* -------------------------------------------------------------------------- */
/*  Config / state                                                            */
/* -------------------------------------------------------------------------- */
const OWNER = "JingChenCHN";
const REPO = "JingChenCHN.github.io";
const BRANCH = "main";
const TOKEN_KEY = "gh_admin_token";
const API = "https://api.github.com";

const state = {
  token: "",
  mode: "md",            // "md" | "html" — html for legacy posts with no #md-source
  editingSlug: null,     // slug of the post being edited (before any rename)
  slugTouched: false,    // user manually edited the slug field?
  posts: [],             // parsed assets/posts.json array
  pendingIndexJson: null // held if the posts.json write failed, for retry
};

const $ = (sel) => document.querySelector(sel);

/* -------------------------------------------------------------------------- */
/*  UTF-8-safe base64 (Chinese content is the norm — btoa alone throws)       */
/* -------------------------------------------------------------------------- */
function utf8ToB64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin); // single line — GitHub rejects MIME-wrapped base64
}

function b64ToUtf8(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/* -------------------------------------------------------------------------- */
/*  GitHub Contents API (browser, CORS is supported)                          */
/* -------------------------------------------------------------------------- */
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function authHeaders() {
  const h = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (state.token) h.Authorization = "Bearer " + state.token;
  return h;
}

async function api(method, path, bodyObj) {
  const opts = { method, headers: authHeaders() };
  if (bodyObj) {
    opts.body = JSON.stringify(bodyObj);
    opts.headers["Content-Type"] = "application/json";
  }
  const res = await fetch(API + path, opts);
  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }
  if (!res.ok) {
    throw new ApiError(res.status, (data && data.message) || res.statusText);
  }
  return data;
}

async function apiGetFile(path) {
  return api("GET", "/repos/" + OWNER + "/" + REPO + "/contents/" + path);
}

async function apiWriteFile(path, contentB64, message, sha) {
  const body = { message, content: contentB64, branch: BRANCH };
  if (sha) body.sha = sha;
  return api("PUT", "/repos/" + OWNER + "/" + REPO + "/contents/" + path, body);
}

async function apiDeleteFile(path, sha, message) {
  return api("DELETE", "/repos/" + OWNER + "/" + REPO + "/contents/" + path, {
    message,
    sha,
    branch: BRANCH,
  });
}

/* -------------------------------------------------------------------------- */
/*  Markdown                                                                  */
/* -------------------------------------------------------------------------- */
function initMarked() {
  if (typeof window.marked !== "undefined") {
    window.marked.setOptions({ gfm: true, breaks: false });
  }
}
function renderBody(md) {
  return typeof window.marked !== "undefined" ? window.marked.parse(md) : md;
}

/* -------------------------------------------------------------------------- */
/*  Metadata helpers                                                          */
/* -------------------------------------------------------------------------- */
function slugify(str) {
  const s = (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.length >= 2 ? s : "";
}
function defaultSlug() {
  const s = slugify($("#title").value);
  if (s) return s;
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return "post-" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
    pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
}
function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
function dateDisplay(iso, lang) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}
function splitCsv(str) {
  return (str || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
function autoExcerpt(md, lang) {
  const first = (md || "").trim().split(/\n{2,}/)[0] || "";
  const text = first
    .replace(/```[\s\S]*?```/g, " ")   // code fences
    .replace(/`[^`]*`/g, " ")          // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links
    .replace(/^#{1,6}\s+/gm, "")       // headings
    .replace(/[*_~>#|+-]/g, " ")       // remaining marks
    .replace(/\s+/g, " ")
    .trim();
  const cut = text.length > 140 ? text.slice(0, 139) + "…" : text;
  return cut || (lang === "zh" ? "（暂无摘要）" : "No excerpt yet.");
}

/* -------------------------------------------------------------------------- */
/*  Template generation                                                       */
/* -------------------------------------------------------------------------- */
function safeJson(o) {
  // Escape every "<" so a "</script>" in markdown cannot terminate the tag.
  return JSON.stringify(o).replace(/</g, "\\u003c");
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildPostHtml(meta, bodyZhHtml, bodyEnHtml, mode) {
  const tagsZh = meta.tags_zh.join(" · ");
  const tagsEn = meta.tags.join(" · ");
  const mdSource = mode === "md"
    ? `\n  <script type="application/json" id="md-source">${safeJson({ md_zh: meta.md_zh, md_en: meta.md_en })}</script>\n`
    : "\n";
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(meta.title_zh)} · Jing Chen</title>
  <meta name="description" content="${esc(meta.excerpt_zh)} / ${esc(meta.excerpt)}" />
  <link rel="icon" href="../assets/img/avatar.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="../assets/css/style.css" />${mdSource}</head>
<body>
  <div id="site-header"></div>

  <div class="container">
    <div class="page-grid">
      <div id="site-sidebar"></div>

      <main class="content">
        <h1>
          <span data-lang="zh">${esc(meta.title_zh)}</span>
          <span data-lang="en" hidden>${esc(meta.title)}</span>
        </h1>
        <p class="page-meta">
          <span data-lang="zh">${dateDisplay(meta.date, "zh")} · ${tagsZh}</span>
          <span data-lang="en" hidden>${dateDisplay(meta.date, "en")} · ${tagsEn}</span>
        </p>

        <div data-lang="zh">${bodyZhHtml}</div>
        <div data-lang="en" hidden>${bodyEnHtml}</div>

        <nav class="post-nav">
          <div>
            <a href="../blog.html">
              <span data-lang="zh">← 返回博客</span>
              <span data-lang="en" hidden>← Back to blog</span>
            </a>
          </div>
        </nav>
      </main>
    </div>
  </div>

  <div id="site-footer"></div>
  <script src="../assets/js/site-config.js"></script>
  <script src="../assets/js/main.js"></script>
</body>
</html>
`;
}

function buildIndexJson(posts) {
  const sorted = posts.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  return JSON.stringify(sorted, null, 2) + "\n";
}

function upsertPost(posts, meta) {
  const next = posts.filter((p) => p.slug !== meta.slug);
  next.push(meta);
  return next;
}

/* -------------------------------------------------------------------------- */
/*  Form: collect / fill / validate                                           */
/* -------------------------------------------------------------------------- */
function collectForm() {
  const title = $("#title").value.trim();
  const title_zh = $("#title_zh").value.trim();
  const slug = $("#slug").value.trim();
  const date = $("#date").value || todayISO();
  const meta = {
    title,
    title_zh,
    slug,
    date,
    tags: splitCsv($("#tags").value),
    tags_zh: splitCsv($("#tags_zh").value),
    excerpt: $("#excerpt").value.trim(),
    excerpt_zh: $("#excerpt_zh").value.trim(),
    file: "blog/" + slug + ".html",
  };
  if (!slug) throw new Error("slug 不能为空 / slug is required (fill the English title first).");
  return meta;
}

function fillForm(meta, zh, en) {
  $("#title").value = meta.title || "";
  $("#title_zh").value = meta.title_zh || "";
  $("#slug").value = meta.slug || "";
  $("#date").value = meta.date || todayISO();
  $("#tags").value = (meta.tags || []).join(", ");
  $("#tags_zh").value = (meta.tags_zh || []).join(", ");
  $("#excerpt").value = meta.excerpt || "";
  $("#excerpt_zh").value = meta.excerpt_zh || "";
  $("#bodyZh").value = zh || "";
  $("#bodyEn").value = en || "";
  state.slugTouched = false;
}

function clearForm() {
  fillForm({
    title: "", title_zh: "", slug: "", date: todayISO(),
    tags: [], tags_zh: [], excerpt: "", excerpt_zh: "",
  }, "", "");
}

/* -------------------------------------------------------------------------- */
/*  Article body: extract from a fetched post page                            */
/* -------------------------------------------------------------------------- */
function extractFromDoc(doc) {
  const src = doc.getElementById("md-source");
  if (src) {
    try {
      const data = JSON.parse(src.textContent);
      return { mode: "md", md_zh: data.md_zh || "", md_en: data.md_en || "" };
    } catch (e) { /* fall through to html mode */ }
  }
  // Legacy hand-written post: pull the HTML of each language body div.
  const zhEl = doc.querySelector('[data-lang="zh"]');
  const enEl = doc.querySelector('[data-lang="en"]');
  return {
    mode: "html",
    html_zh: zhEl ? zhEl.innerHTML : "",
    html_en: enEl ? enEl.innerHTML : "",
  };
}

function setMode(mode) {
  state.mode = mode;
  const banner = $("#modeBanner");
  if (mode === "html") {
    banner.hidden = false;
    banner.textContent = "这篇文章是手写的 HTML 正文，将以 HTML 模式编辑（保留原样），不经过 Markdown 渲染。/ This post's body was hand-written in HTML; editing in HTML mode. Markdown rendering is bypassed.";
  } else {
    banner.hidden = true;
  }
}

/* -------------------------------------------------------------------------- */
/*  GitHub token                                                              */
/* -------------------------------------------------------------------------- */
function restoreToken() {
  state.token = localStorage.getItem(TOKEN_KEY) || "";
  if (state.token) $("#token").value = state.token;
}
function saveToken() {
  state.token = $("#token").value.trim();
  if (state.token) {
    localStorage.setItem(TOKEN_KEY, state.token);
    log("Token saved / 令牌已保存", false);
    loadPostsList();
  } else {
    localStorage.removeItem(TOKEN_KEY);
    log("Token cleared / 令牌已清除", false);
  }
}
function clearToken() {
  state.token = "";
  $("#token").value = "";
  localStorage.removeItem(TOKEN_KEY);
  log("Token cleared / 令牌已清除", false);
}

/* -------------------------------------------------------------------------- */
/*  Post list                                                                 */
/* -------------------------------------------------------------------------- */
async function loadPostsList() {
  const list = $("#postList");
  const st = $("#listStatus");
  st.hidden = false;
  st.textContent = "Loading posts / 正在加载文章…";
  try {
    const f = await apiGetFile("assets/posts.json");
    state.posts = JSON.parse(b64ToUtf8(f.content));
    st.hidden = true;
    renderPostsList();
  } catch (e) {
    // Fallback: read-only list from the published site (no token needed).
    try {
      const r = await fetch("assets/posts.json");
      state.posts = await r.json();
      st.hidden = true;
      renderPostsList();
      log("帖子列表来自本地文件（只读）；设置 token 后可发布。/ List loaded locally (read-only); add a token to publish.", false);
    } catch (e2) {
      st.textContent = "无法加载文章列表。/ Could not load posts.";
    }
  }
}

function renderPostsList() {
  const list = $("#postList");
  if (!state.posts.length) {
    list.innerHTML = '<li style="color:var(--text-faint)">No posts yet / 暂无文章</li>';
    return;
  }
  list.innerHTML = state.posts
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(
      (p) => `
      <li>
        <div>
          <span class="pl-date">${p.date}</span> · ${esc(p.title_zh || p.title)}
        </div>
        <div class="pl-actions">
          <button type="button" data-edit="${p.slug}">Edit / 编辑</button>
          <button type="button" class="del" data-del="${p.slug}">✕</button>
        </div>
      </li>`
    )
    .join("");
}

/* -------------------------------------------------------------------------- */
/*  Editor: new / open                                                        */
/* -------------------------------------------------------------------------- */
function newPost() {
  state.editingSlug = null;
  state.pendingIndexJson = null;
  $("#retryIndex").hidden = true;
  $("#delete").hidden = true;
  clearForm();
  setMode("md");
  switchTab("zh");
  log("New post / 新建文章", false);
  $("#title").focus();
}

async function openPost(slug) {
  state.editingSlug = slug;
  state.pendingIndexJson = null;
  $("#retryIndex").hidden = true;
  const meta = state.posts.find((p) => p.slug === slug);
  if (!meta) { log("Post not found / 未找到文章", true); return; }
  log("Loading " + slug + "…", false);
  try {
    const f = await apiGetFile("blog/" + slug + ".html");
    const doc = new DOMParser().parseFromString(b64ToUtf8(f.content), "text/html");
    const body = extractFromDoc(doc);
    fillForm(meta, body.md_zh !== undefined ? body.md_zh : body.html_zh,
      body.md_en !== undefined ? body.md_en : body.html_en);
    setMode(body.mode);
    switchTab("zh");
    $("#delete").hidden = false;
    refreshPreview();
    log("Loaded / 已加载", false);
  } catch (e) {
    // Post file missing — still allow editing metadata + bodies from scratch.
    log("正文文件缺失，仅编辑元数据：/" + e.message, true);
    fillForm(meta, "", "");
    setMode("md");
    switchTab("zh");
    $("#delete").hidden = false;
  }
}

/* -------------------------------------------------------------------------- */
/*  Tabs & preview                                                            */
/* -------------------------------------------------------------------------- */
function currentPanelLang() {
  const btn = document.querySelector(".lang-tabs button.active");
  return btn ? btn.dataset.langPanel : "zh";
}

function switchTab(lang) {
  document.querySelectorAll(".lang-tabs button").forEach((b) => {
    b.classList.toggle("active", b.dataset.langPanel === lang);
  });
  document.querySelectorAll("textarea[data-lang-panel]").forEach((ta) => {
    ta.hidden = ta.dataset.langPanel !== lang;
  });
  refreshPreview();
}

let previewTimer = null;
function schedulePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(refreshPreview, 250);
}

function refreshPreview() {
  const lang = currentPanelLang();
  const ta = document.querySelector('textarea[data-lang-panel="' + lang + '"]');
  const iframe = $("#preview");
  if (!ta || !iframe) return;
  const html = state.mode === "html" ? ta.value : renderBody(ta.value);
  iframe.srcdoc = buildPreviewDoc(html);
}

function buildPreviewDoc(html) {
  return `<!doctype html><html><head><meta charset="utf-8">
<base href="/">
<link rel="stylesheet" href="/assets/css/style.css"></head>
<body><main class="content">${html}</main></body></html>`;
}

/* -------------------------------------------------------------------------- */
/*  Publish / delete                                                          */
/* -------------------------------------------------------------------------- */
async function publish() {
  if (!state.token) { log("先保存 GitHub token。/ Save a token first.", true); return; }
  let meta;
  try { meta = collectForm(); }
  catch (e) { log(e.message, true); return; }

  // Fill auto-excerpts for empty languages.
  const bodyZhRaw = $("#bodyZh").value;
  const bodyEnRaw = $("#bodyEn").value;
  meta.excerpt_zh = meta.excerpt_zh || autoExcerpt(bodyZhRaw, "zh");
  meta.excerpt = meta.excerpt || autoExcerpt(bodyEnRaw, "en");

  const bodyZhHtml = state.mode === "html" ? bodyZhRaw : renderBody(bodyZhRaw);
  const bodyEnHtml = state.mode === "html" ? bodyEnRaw : renderBody(bodyEnRaw);
  meta.md_zh = bodyZhRaw;
  meta.md_en = bodyEnRaw;

  const html = buildPostHtml(meta, bodyZhHtml, bodyEnHtml, state.mode);
  log("Publishing " + meta.slug + "… / 正在发布…", false);

  try {
    // 1) Article file (create or update).
    let fileSha = null;
    try { fileSha = (await apiGetFile("blog/" + meta.slug + ".html")).sha; }
    catch (e) { if (e.status !== 404) throw e; }
    await apiWriteFile("blog/" + meta.slug + ".html", utf8ToB64(html),
      "Publish post: " + meta.slug, fileSha);

    // 2) If the slug changed while editing, remove the old file.
    if (state.editingSlug && state.editingSlug !== meta.slug) {
      try {
        const old = await apiGetFile("blog/" + state.editingSlug + ".html");
        await apiDeleteFile("blog/" + state.editingSlug + ".html", old.sha,
          "Rename post: " + state.editingSlug);
      } catch (e) { if (e.status !== 404) throw e; }
    }

    // 3) Index.
    const nextPosts = upsertPost(state.posts, meta);
    const indexJson = buildIndexJson(nextPosts);
    try {
      const idx = await apiGetFile("assets/posts.json");
      await apiWriteFile("assets/posts.json", utf8ToB64(indexJson),
        "Update post list (" + meta.slug + ")", idx.sha);
    } catch (e) {
      state.pendingIndexJson = indexJson;
      $("#retryIndex").hidden = false;
      log("文章已发布，但文章列表更新失败，点击「重试索引」完成。/ Post published; list update failed — click Retry index.", true);
      throw e;
    }

    state.posts = nextPosts;
    state.editingSlug = meta.slug;
    renderPostsList();
    log("已发布 ✓ 约 30–60 秒后上线 / Published ✓ live on GitHub Pages within ~1 min.", false);
  } catch (e) {
    // Index failure was already logged inside; only surface non-index errors here.
    if (state.pendingIndexJson === null) handleError(e);
  }
}

async function retryIndex() {
  if (!state.pendingIndexJson) return;
  const indexJson = state.pendingIndexJson;
  try {
    const idx = await apiGetFile("assets/posts.json");
    await apiWriteFile("assets/posts.json", utf8ToB64(indexJson),
      "Update post list", idx.sha);
    $("#retryIndex").hidden = true;
    state.pendingIndexJson = null;
    state.posts = JSON.parse(indexJson);
    renderPostsList();
    log("索引已更新 / Index updated.", false);
  } catch (e) {
    handleError(e);
  }
}

async function removePostAction(slug) {
  if (!state.token) { log("先保存 GitHub token。/ Save a token first.", true); return; }
  if (!confirm("确定删除这篇文章？/ Really delete \"" + slug + "\"?")) return;
  log("Deleting " + slug + "…", false);
  try {
    const f = await apiGetFile("blog/" + slug + ".html");
    await apiDeleteFile("blog/" + slug + ".html", f.sha, "Delete post: " + slug);

    const nextPosts = state.posts.filter((p) => p.slug !== slug);
    const idx = await apiGetFile("assets/posts.json");
    await apiWriteFile("assets/posts.json", utf8ToB64(buildIndexJson(nextPosts)),
      "Update post list (delete " + slug + ")", idx.sha);

    state.posts = nextPosts;
    renderPostsList();
    log("已删除 / Deleted.", false);
  } catch (e) {
    handleError(e);
  }
}

/* -------------------------------------------------------------------------- */
/*  Site settings (avatar, profile, contacts, footer)                        */
/* -------------------------------------------------------------------------- */
const DEFAULT_SITE = {
  avatar: "assets/img/avatar.svg",
  name: "Jing Chen",
  role: { en: "Product Manager", zh: "产品经理" },
  location: { en: "China", zh: "中国" },
  bio: {
    en: "Product manager, passionate about building products that solve real problems. I write about product thinking and the technology behind it.",
    zh: "产品经理，热衷于打造能解决真实问题的产品。我会在这里写一些关于产品思考以及背后技术的文章。",
  },
  contacts: [
    { icon: "email", label: "hemo8212@outlook.com", href: "mailto:hemo8212@outlook.com" },
    { icon: "github", label: "GitHub", href: "https://github.com/JingChenCHN" },
    { icon: "rss", label: "RSS", href: "blog.html" },
  ],
  footer: {
    copyright: "© 2026 Jing Chen",
    extra: {
      en: 'Built with <a href="https://pages.github.com/">GitHub Pages</a>',
      zh: '基于 <a href="https://pages.github.com/">GitHub Pages</a> 构建',
    },
  },
};

const ICON_OPTIONS = ["email", "github", "twitter", "scholar", "linkedin", "rss", "location"];

function normalizeSite(site) {
  const s = site || {};
  return {
    avatar: s.avatar || DEFAULT_SITE.avatar,
    name: s.name || DEFAULT_SITE.name,
    role: Object.assign({}, DEFAULT_SITE.role, s.role),
    location: Object.assign({}, DEFAULT_SITE.location, s.location),
    bio: Object.assign({}, DEFAULT_SITE.bio, s.bio),
    contacts: Array.isArray(s.contacts) ? s.contacts : DEFAULT_SITE.contacts,
    footer: Object.assign({}, DEFAULT_SITE.footer, s.footer,
      { extra: Object.assign({}, DEFAULT_SITE.footer.extra, (s.footer || {}).extra) }),
  };
}

function loadSiteConfig() {
  return apiGetFile("assets/js/site-config.js")
    .then((f) => {
      const src = b64ToUtf8(f.content);
      const m = src.match(/window\.SITE_OVERRIDES\s*=\s*(\{[\s\S]*?\});/);
      if (!m) throw new Error("site-config.js 格式异常 / unexpected format");
      return new Function("return (" + m[1] + ");")();
    })
    .catch((e) => {
      if (e.status === 404) return DEFAULT_SITE;
      throw e;
    });
}

function renderContacts(site) {
  const rows = $("#contactRows");
  rows.innerHTML = (site.contacts || []).map((c, i) => `
    <div class="contact-row" data-idx="${i}">
      <select data-c-icon>
        ${ICON_OPTIONS.map((ic) => `<option value="${ic}" ${ic === c.icon ? "selected" : ""}>${ic}</option>`).join("")}
      </select>
      <input data-c-label value="${esc(c.label || "")}" placeholder="label" />
      <input data-c-href value="${esc(c.href || "")}" placeholder="mailto:… / https://…" />
      <button type="button" class="btn-ghost" data-c-del>✕</button>
    </div>`).join("");
}

function populateSettingsForm(site) {
  $("#avatarPath").value = site.avatar;
  $("#avatarPreview").src = site.avatar;
  $("#sName").value = site.name;
  $("#sRoleZh").value = site.role.zh || "";
  $("#sRoleEn").value = site.role.en || "";
  $("#sLocZh").value = site.location.zh || "";
  $("#sLocEn").value = site.location.en || "";
  $("#sBioZh").value = site.bio.zh || "";
  $("#sBioEn").value = site.bio.en || "";
  $("#sCopyright").value = site.footer.copyright || "";
  $("#sFooterZh").value = site.footer.extra.zh || "";
  $("#sFooterEn").value = site.footer.extra.en || "";
  renderContacts(site);
}

function collectSettings() {
  const contacts = Array.from(document.querySelectorAll("#contactRows .contact-row")).map((row) => ({
    icon: row.querySelector("[data-c-icon]").value,
    label: row.querySelector("[data-c-label]").value.trim(),
    href: row.querySelector("[data-c-href]").value.trim(),
  })).filter((c) => c.href || c.label);
  return {
    avatar: $("#avatarPath").value.trim() || DEFAULT_SITE.avatar,
    name: $("#sName").value.trim() || DEFAULT_SITE.name,
    role: { en: $("#sRoleEn").value.trim(), zh: $("#sRoleZh").value.trim() },
    location: { en: $("#sLocEn").value.trim(), zh: $("#sLocZh").value.trim() },
    bio: { en: $("#sBioEn").value.trim(), zh: $("#sBioZh").value.trim() },
    contacts,
    footer: {
      copyright: $("#sCopyright").value.trim() || "© " + new Date().getFullYear() + " Jing Chen",
      extra: { en: $("#sFooterEn").value.trim(), zh: $("#sFooterZh").value.trim() },
    },
  };
}

function buildSiteConfigJs(site) {
  return `/* ==========================================================================
   Site profile overrides — edited via the admin page (admin.html).
   --------------------------------------------------------------------------
   Values here override the SITE defaults in assets/js/main.js (merged with
   Object.assign). Loaded before main.js on every page. This file is written
   programmatically by assets/js/admin.js — keep the window.SITE_OVERRIDES
   object literal intact so it stays machine-parseable.
   ========================================================================== */
window.SITE_OVERRIDES = ${JSON.stringify(site, null, 2)};
`;
}

function settingsLog(msg, isError) {
  const el = $("#settingsStatus");
  el.textContent = msg;
  el.className = isError ? "status err" : "status";
}

async function publishSiteConfig() {
  if (!state.token) { settingsLog("先保存 GitHub token。/ Save a token first.", true); return; }
  const site = collectSettings();
  settingsLog("Saving site settings… / 正在保存站点资料…", false);
  try {
    let sha = null;
    try { sha = (await apiGetFile("assets/js/site-config.js")).sha; }
    catch (e) { if (e.status !== 404) throw e; }
    await apiWriteFile("assets/js/site-config.js", utf8ToB64(buildSiteConfigJs(site)),
      "Update site settings", sha);
    settingsLog("已保存 ✓ 约 1 分钟生效 / Saved ✓ live on GitHub Pages within ~1 min.", false);
  } catch (e) {
    handleError(e);
  }
}

async function uploadAvatar() {
  const input = $("#avatarFile");
  const file = input.files && input.files[0];
  if (!file) { $("#avatarHint").textContent = "请先选择图片文件。/ Pick an image file first."; $("#avatarHint").hidden = false; return; }
  if (!state.token) { $("#avatarHint").textContent = "先保存 GitHub token。/ Save a token first."; $("#avatarHint").hidden = false; return; }
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = "assets/img/avatar." + ext;
  $("#avatarHint").textContent = "Uploading… / 正在上传 " + file.name;
  $("#avatarHint").hidden = false;
  try {
    // Binary-safe base64 from FileReader.readAsArrayBuffer.
    const buf = await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsArrayBuffer(file);
    });
    const b64 = bufToB64(buf);
    let sha = null;
    try { sha = (await apiGetFile(path)).sha; }
    catch (e) { if (e.status !== 404) throw e; }
    await apiWriteFile(path, b64, "Upload avatar", sha);
    $("#avatarPath").value = path;
    $("#avatarPreview").src = path + "?t=" + Date.now();
    $("#avatarHint").textContent = "头像已上传 ✓ 记得点「保存并发布」让站点资料生效。/ Avatar uploaded — click Save settings to apply.";
  } catch (e) {
    $("#avatarHint").textContent = "上传失败 / Upload failed: " + (e.message || e);
  }
}

/* Binary-safe base64 for image upload (ArrayBuffer -> base64, chunked to
   avoid btoa stack limits on large files). */
function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

/* -------------------------------------------------------------------------- */
/*  Status / errors                                                           */
/* -------------------------------------------------------------------------- */
function log(msg, isError) {
  const el = $("#status");
  el.textContent = msg;
  el.className = isError ? "status err" : "status";
}
function handleError(e) {
  const msg = e && e.message ? e.message : String(e);
  log("错误 / Error: " + msg, true);
  console.error(e);
}

/* -------------------------------------------------------------------------- */
/*  Init                                                                      */
/* -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  restoreToken();
  initMarked();

  $("#tokenHint").textContent =
    "创建令牌请选择最小权限：GitHub → Settings → Developer settings → Personal access tokens → " +
    "Fine-grained tokens，仅选择本仓库 JingChenCHN/JingChenCHN.github.io，权限只勾 Contents: Read and write。" +
    "（经典令牌需勾 repo。）令牌仅保存在你浏览器的 localStorage，只发送到 api.github.com，不会出现在公开页面上。";

  $("#saveToken").addEventListener("click", saveToken);
  $("#clearToken").addEventListener("click", clearToken);
  $("#newPost").addEventListener("click", newPost);
  $("#publish").addEventListener("click", publish);
  $("#delete").addEventListener("click", () => {
    if (state.editingSlug) removePostAction(state.editingSlug);
  });
  $("#retryIndex").addEventListener("click", retryIndex);

  document.querySelectorAll(".lang-tabs button").forEach((b) => {
    b.addEventListener("click", () => switchTab(b.dataset.langPanel));
  });
  ["bodyZh", "bodyEn"].forEach((id) => {
    $("#" + id).addEventListener("input", schedulePreview);
  });
  $("#title").addEventListener("input", () => {
    if (!state.slugTouched) $("#slug").value = slugify($("#title").value);
  });
  $("#slug").addEventListener("input", () => { state.slugTouched = true; });

  $("#postList").addEventListener("click", (e) => {
    const edit = e.target.closest("[data-edit]");
    if (edit) { openPost(edit.dataset.edit); return; }
    const del = e.target.closest("[data-del]");
    if (del) removePostAction(del.dataset.del);
  });

  clearForm();
  switchTab("zh");
  loadPostsList();

  // Main tabs: Posts / Settings.
  let settingsLoaded = false;
  function switchMainTab(which) {
    const posts = which === "posts";
    $("#tabPosts").classList.toggle("active", posts);
    $("#tabSettings").classList.toggle("active", !posts);
    $("#postsView").hidden = !posts;
    $("#settingsView").hidden = posts;
    if (!posts && !settingsLoaded) {
      settingsLoaded = true;
      loadSiteConfig()
        .then((site) => populateSettingsForm(normalizeSite(site)))
        .catch((e) => settingsLog("加载失败 / Load failed: " + (e.message || e), true));
    }
  }
  $("#tabPosts").addEventListener("click", () => switchMainTab("posts"));
  $("#tabSettings").addEventListener("click", () => switchMainTab("settings"));

  // Settings actions.
  $("#saveSettings").addEventListener("click", publishSiteConfig);
  $("#avatarUpload").addEventListener("click", uploadAvatar);
  $("#avatarFile").addEventListener("change", () => {
    const f = $("#avatarFile").files && $("#avatarFile").files[0];
    if (f) $("#avatarHint").textContent = "已选择 " + f.name + " — 点击「上传」/ Selected, click Upload.";
    $("#avatarHint").hidden = false;
  });
  $("#addContact").addEventListener("click", () => {
    const current = collectSettings();
    current.contacts.push({ icon: "github", label: "", href: "" });
    renderContacts(current);
  });
  $("#contactRows").addEventListener("click", (e) => {
    const del = e.target.closest("[data-c-del]");
    if (!del) return;
    const current = collectSettings();
    const idx = Number(del.closest(".contact-row").dataset.idx);
    current.contacts.splice(idx, 1);
    renderContacts(current);
  });
  $("#avatarPath").addEventListener("input", () => {
    const v = $("#avatarPath").value.trim();
    if (v) $("#avatarPreview").src = v;
  });
});
