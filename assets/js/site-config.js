/* ==========================================================================
   Site profile overrides — edited via the admin page (admin.html).
   --------------------------------------------------------------------------
   Values here override the SITE defaults in assets/js/main.js (merged with
   Object.assign). Loaded before main.js on every page. This file is written
   programmatically by assets/js/admin.js — keep the window.SITE_OVERRIDES
   object literal intact so it stays machine-parseable.
   ========================================================================== */
window.SITE_OVERRIDES = {
  "avatar": "assets/img/avatar.svg",
  "name": "Jing Chen",
  "role": { "en": "Product Manager", "zh": "产品经理" },
  "location": { "en": "China", "zh": "中国" },
  "bio": {
    "en": "Product manager, passionate about building products that solve real problems. I write about product thinking and the technology behind it.",
    "zh": "产品经理，热衷于打造能解决真实问题的产品。我会在这里写一些关于产品思考以及背后技术的文章。"
  },
  "contacts": [
    { "icon": "email", "label": "hemo8212@outlook.com", "href": "mailto:hemo8212@outlook.com" },
    { "icon": "github", "label": "GitHub", "href": "https://github.com/JingChenCHN" },
    { "icon": "rss", "label": "RSS", "href": "blog.html" }
  ],
  "footer": {
    "copyright": "© 2026 Jing Chen",
    "extra": {
      "en": "Built with <a href=\"https://pages.github.com/\">GitHub Pages</a>",
      "zh": "基于 <a href=\"https://pages.github.com/\">GitHub Pages</a> 构建"
    }
  }
};
