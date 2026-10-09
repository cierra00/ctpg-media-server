// CTPG website behaviour (10-design-system.md 6.2, 6.20): phone menu, header search, footer sections.
// Loaded by ctpg-theme with defer. No dependencies.
(function () {
  "use strict";

  // Footer link columns (6.20): open on wide screens, folded into tap-to-open sections on phones.
  var phone = window.matchMedia("(max-width: 680px)");
  var cols = Array.prototype.slice.call(document.querySelectorAll(".ctpg-footer__col"));
  function setCols() {
    cols.forEach(function (d) { if (phone.matches) { d.removeAttribute("open"); } else { d.setAttribute("open", ""); } });
  }
  if (cols.length) {
    setCols();
    if (phone.addEventListener) phone.addEventListener("change", setCols);
    cols.forEach(function (d) {
      var summary = d.querySelector("summary");
      if (summary) summary.addEventListener("click", function (e) { if (!phone.matches) e.preventDefault(); });
    });
  }

  var header = document.querySelector(".ctpg-header");
  if (!header) return;

  var menuButton = header.querySelector("[data-ctpg-menu]");
  var nav = document.getElementById("ctpg-nav");
  var searchButton = header.querySelector("[data-ctpg-search]");
  var panel = document.getElementById("ctpg-search-panel");

  function setMenu(open, returnFocus) {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    if (!open && returnFocus) menuButton.focus();
  }

  function setPanel(open, returnFocus) {
    if (!searchButton || !panel) return;
    searchButton.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
    if (open) {
      var input = panel.querySelector("input[type=search]");
      if (input) input.focus();
    } else if (returnFocus) {
      searchButton.focus();
    }
  }

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      var open = menuButton.getAttribute("aria-expanded") !== "true";
      setPanel(false);
      setMenu(open);
      if (open) {
        var first = nav.querySelector("a");
        if (first) first.focus();
      }
    });
  }

  if (searchButton) {
    searchButton.addEventListener("click", function () {
      // The header searches the site on every page, the homepage included. The big hero box is
      // the separate travel search engine (Cierra, Oct 8), so the pill never sends people there.
      setMenu(false);
      setPanel(searchButton.getAttribute("aria-expanded") !== "true");
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (nav && nav.classList.contains("is-open")) setMenu(false, true);
    if (panel && !panel.hidden) setPanel(false, true);
  });

  document.addEventListener("click", function (e) {
    if (!header.contains(e.target)) {
      if (nav && nav.classList.contains("is-open")) setMenu(false);
      if (panel && !panel.hidden) setPanel(false);
    }
  });

  // Leaving phone width closes the phone menu.
  var wide = window.matchMedia("(min-width: " + (header.getAttribute("data-ctpg-nav-collapse") || 961) + "px)");
  var onWide = function () { if (wide.matches) setMenu(false); };
  if (wide.addEventListener) wide.addEventListener("change", onWide);
})();

// Homepage behaviour (ctpg/home block, 09 plan Phase 3, built to the Figma mock, Oct 8).
(function () {
  "use strict";
  var home = document.querySelector(".ctpg-home");
  if (!home) return;
  var each = function (sel, root, fn) { Array.prototype.forEach.call((root || home).querySelectorAll(sel), fn); };
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  // "Coming soon" note for mock controls with nothing behind them yet (Cierra: exactly like the mock).
  var notice = home.querySelector("[data-ctpg-notice]");
  var noticeTimer;
  function soon(text) {
    if (!notice) return;
    notice.textContent = text;
    notice.hidden = false;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(function () { notice.hidden = true; }, 3000);
  }
  each("[data-ctpg-soon]", null, function (el) {
    var msg = el.getAttribute("data-ctpg-soon");
    if (el.tagName === "FORM") {
      el.addEventListener("submit", function (e) { e.preventDefault(); soon(msg); });
    } else {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        if (el.hasAttribute("data-ctpg-chip")) {
          each("[data-ctpg-chip]", el.parentNode, function (b) { b.setAttribute("aria-pressed", String(b === el)); });
        }
        soon(msg);
      });
    }
  });

  // Hero: three slides that crossfade every 7 seconds. Any choice by the reader stops it for good.
  var hero = home.querySelector("[data-ctpg-hero]");
  if (hero) {
    var slides = [];
    try { slides = JSON.parse(hero.getAttribute("data-slides") || "[]"); } catch (e) { slides = []; }
    var bgs = hero.querySelectorAll(".hero-bg");
    var tabs = hero.querySelectorAll("[data-ctpg-slide]");
    var title = hero.querySelector("[data-ctpg-hero-title]");
    var copy = hero.querySelector("[data-ctpg-hero-copy]");
    var pause = hero.querySelector("[data-ctpg-pause]");
    var current = 0, timer = null;

    var show = function (i) {
      current = i;
      Array.prototype.forEach.call(bgs, function (b, n) { b.classList.toggle("active", n === i); });
      Array.prototype.forEach.call(tabs, function (t, n) {
        t.classList.toggle("active", n === i);
        t.setAttribute("aria-pressed", String(n === i));
      });
      if (slides[i]) {
        if (title) title.textContent = slides[i].title;
        if (copy) copy.textContent = slides[i].copy;
      }
    };
    var stop = function () {
      clearInterval(timer);
      timer = null;
      if (pause) { pause.setAttribute("aria-pressed", "true"); pause.setAttribute("aria-label", "Play slideshow"); }
    };
    var play = function () {
      if (slides.length < 2) return;
      clearInterval(timer);
      timer = setInterval(function () { show((current + 1) % slides.length); }, 7000);
      if (pause) { pause.setAttribute("aria-pressed", "false"); pause.setAttribute("aria-label", "Pause slideshow"); }
    };

    Array.prototype.forEach.call(tabs, function (t) {
      t.addEventListener("click", function () { stop(); show(parseInt(t.getAttribute("data-ctpg-slide"), 10) || 0); });
    });
    if (pause) pause.addEventListener("click", function () { if (timer) stop(); else play(); });
    if (calm.matches) stop(); else play();

    // Search scope tabs set the hidden scope field; prompt chips fill the box.
    var field = hero.querySelector("[data-ctpg-scope-field]");
    var input = hero.querySelector("[data-ctpg-hero-input]");
    each("[data-ctpg-scope]", hero, function (b) {
      b.addEventListener("click", function () {
        each("[data-ctpg-scope]", hero, function (o) {
          o.classList.toggle("active", o === b);
          o.setAttribute("aria-pressed", String(o === b));
        });
        if (field) field.value = b.getAttribute("data-ctpg-scope");
        if (input) input.focus();
      });
    });
    each("[data-ctpg-prompt]", hero, function (b) {
      b.addEventListener("click", function () {
        if (input) { input.value = b.textContent.trim(); input.focus(); }
      });
    });
  }

  // Side-scrolling rails (topics, trips, destinations) with arrow buttons.
  each("[data-ctpg-rail-controls]", null, function (c) {
    var rail = home.querySelector('[data-ctpg-rail="' + c.getAttribute("data-ctpg-rail-controls") + '"]');
    if (!rail) return;
    each("button[data-dir]", c, function (b) {
      b.addEventListener("click", function () {
        var dir = parseInt(b.getAttribute("data-dir"), 10) || 1;
        rail.scrollBy({ left: dir * rail.clientWidth * 0.8, behavior: calm.matches ? "auto" : "smooth" });
      });
    });
  });

  // Filter chips (More from the guide, Food and drink): swap which cards show, no reload.
  each("[data-ctpg-filter]", null, function (row) {
    var target = document.getElementById(row.getAttribute("data-ctpg-filter"));
    if (!target) return;
    var show = parseInt(target.getAttribute("data-show"), 10) || 4;
    var cards = Array.prototype.slice.call(target.children);
    var isFood = target.classList.contains("food-grid");
    each("button[data-key]", row, function (b) {
      b.addEventListener("click", function () {
        var key = b.getAttribute("data-key");
        each("button[data-key]", row, function (o) { o.setAttribute("aria-pressed", String(o === b)); });
        var list = cards.filter(function (c) {
          return key ? (" " + (c.getAttribute("data-keys") || "") + " ").indexOf(" " + key + " ") > -1 : c.hasAttribute("data-default");
        }).slice(0, show);
        cards.forEach(function (c) { c.hidden = list.indexOf(c) < 0; });
        list.forEach(function (c, i) {
          var n = c.querySelector("[data-ctpg-num]");
          if (n) n.textContent = (i < 9 ? "0" : "") + (i + 1);
        });
        if (isFood) target.classList.toggle("is-filtered", !!key);
      });
    });
  });

  // Sticky "On this page" bar: sits under the header, marks the section being read.
  var jump = home.querySelector("[data-ctpg-jump]");
  if (jump) {
    var siteHeader = document.querySelector(".wp-site-blocks > header");
    var topbar = document.querySelector(".ctpg-topbar");
    var setTop = function () {
      if (!siteHeader) return;
      var h = siteHeader.offsetHeight - (topbar ? topbar.offsetHeight : 0);
      var bar = document.getElementById("wpadminbar");
      document.documentElement.style.setProperty("--ctpg-sticky-top", (h + (bar && getComputedStyle(bar).position === "fixed" ? bar.offsetHeight : 0)) + "px");
    };
    setTop();
    window.addEventListener("resize", setTop);
    var links = Array.prototype.slice.call(jump.querySelectorAll("a[href^='#']")).filter(function (a) {
      var ok = !!document.getElementById(a.getAttribute("href").slice(1));
      if (!ok) a.parentNode.hidden = true; // a section with no stories is not on the page
      return ok;
    });
    var list = jump.querySelector("ul");
    var ticking = false;
    var mark = function () {
      ticking = false;
      var line = jump.getBoundingClientRect().bottom + 12;
      var current = null;
      links.forEach(function (a) {
        var t = document.getElementById(a.getAttribute("href").slice(1));
        if (t.getBoundingClientRect().top <= line && t.getBoundingClientRect().bottom > line) current = a;
      });
      links.forEach(function (a) {
        if (a === current) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      if (current && list) {
        var l = current.offsetLeft, r = l + current.offsetWidth;
        if (l < list.scrollLeft || r > list.scrollLeft + list.clientWidth) list.scrollLeft = l - 16;
      }
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(mark); } }, { passive: true });
    mark();
  }

  // Vacation ideas: choosing a tile swaps the trip detail.
  var detail = home.querySelector("[data-ctpg-trip-detail]");
  if (detail) {
    var details = [];
    try { details = JSON.parse(detail.getAttribute("data-details") || "[]"); } catch (e) { details = []; }
    var body = detail.querySelector("[data-ctpg-trip-body]");
    each("[data-ctpg-trip]", null, function (tile) {
      tile.addEventListener("click", function () {
        var i = parseInt(tile.getAttribute("data-ctpg-trip"), 10) || 0;
        each("[data-ctpg-trip]", null, function (t) {
          var on = t === tile;
          t.classList.toggle("active", on);
          t.setAttribute("aria-pressed", String(on));
          var state = t.querySelector("[data-ctpg-trip-state]");
          if (state) state.textContent = on ? "Selected" : "View trip";
        });
        if (body && details[i]) body.innerHTML = details[i];
      });
    });
  }
})();

// Trip wizard (plans/17): one step at a time with Back and Next; without the script every step shows.
(function () {
  "use strict";
  var wiz = document.querySelector("[data-ctpg-wizard] form");
  if (!wiz) return;
  var steps = Array.prototype.slice.call(wiz.querySelectorAll("[data-ctpg-step]"));
  var back = wiz.querySelector("[data-ctpg-wizard-back]");
  var next = wiz.querySelector("[data-ctpg-wizard-next]");
  var submit = wiz.querySelector("button[type=submit]");
  var progress = wiz.querySelector("[data-ctpg-wizard-progress]");
  if (!steps.length || !back || !next) return;
  var at = 0;
  wiz.classList.add("is-stepped");
  progress.hidden = false;
  function show(i, focus) {
    at = Math.max(0, Math.min(steps.length - 1, i));
    steps.forEach(function (s, n) { s.classList.toggle("is-current", n === at); });
    back.hidden = at === 0;
    next.hidden = at === steps.length - 1;
    submit.hidden = at !== steps.length - 1;
    progress.textContent = "Step " + (at + 1) + " of " + steps.length;
    if (focus) {
      var first = steps[at].querySelector("input, select");
      if (first) first.focus();
    }
  }
  back.addEventListener("click", function () { show(at - 1, true); });
  next.addEventListener("click", function () { show(at + 1, true); });
  show(0, false);
})();
