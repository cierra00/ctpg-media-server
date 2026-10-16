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
    // Oct 15, 3.0.0 (plan 10 6.22): tuck the bar while scrolling down, show it on any scroll up.
    var lastY = window.scrollY;
    var hero = home.querySelector(".hero");
    var tuck = function () {
      var y = window.scrollY;
      var past = hero ? y > hero.offsetTop + hero.offsetHeight + 120 : y > 600;
      if (y > lastY + 4 && past) jump.classList.add("is-tucked");
      else if (y < lastY - 4 || !past) jump.classList.remove("is-tucked");
      lastY = y;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { mark(); tuck(); }); } }, { passive: true });
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

// Load more cards as you scroll (10-design-system.md 6.23, plan 41). Cierra Oct 16: "we need the scroll load to
// happen every grid when there is more than 5 rows" and "like ships we cant load them all at once".
// Every .ctpg-cards grid taller than 5 rows shows 5 rows, then the next 5 as the visitor nears the end (with a
// button and a count as well). Rows follow the columns on screen: 4 across = 20 cards, 2 across = 10, 1 across = 5.
// A wrapper with data-ctpg-more holds several grids that load as one list (ships grouped by cruise line);
// data-ctpg-more-noun names the things ("ships").
// Big lists send only the first batch: data-ctpg-more-src (a JSON address), -total and -next. Each answer is
// {items:[{id, section, cards}], next, total}: cards go into the section with that id, or a new section is added.
// A filter can fire "ctpg-more-reset" on the wrapper after hiding cards (hidden attribute).
(function () {
  "use strict";
  var ROWS = 5;
  var CARD = ".ctpg-place, .ctpg-story, .ctpg-panel, .ctpg-tile, .ctpg-row";
  // Photos shimmer until they arrive, then fade in (Cierra Oct 16: "need a loading affect and animation").
  document.documentElement.classList.add("ctpg-js");
  function photos(root) {
    Array.prototype.forEach.call(root.querySelectorAll(".ctpg-media:not(.is-loaded)"), function (m) {
      var img = m.querySelector("img");
      function done() { m.classList.add("is-loaded"); }
      if (!img || (img.complete && img.naturalWidth)) { done(); return; }
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });
  }
  photos(document);

  var units = Array.prototype.slice.call(document.querySelectorAll("[data-ctpg-more]"));
  // Item containers: card grids, list rows, and any list marked data-ctpg-more-items (its children are the items).
  var CONT = ".ctpg-cards, .ctpg-rows, [data-ctpg-more-items]";
  Array.prototype.forEach.call(document.querySelectorAll(CONT), function (g) {
    if (!g.closest("[data-ctpg-more]")) units.push(g);
  });
  // A to Z link lists (the theme's Directory lists: ports, restaurants, rides...) load the same way.
  Array.prototype.forEach.call(document.querySelectorAll(".dir"), function (d) {
    if (!d.closest("[data-ctpg-more]")) units.push(d);
  });
  if (!units.length) return;

  // Columns on screen: a grid's tracks, or a CSS-columns list's column count at its current width.
  function cols(el) {
    var cs = getComputedStyle(el);
    if (cs.display === "grid") {
      var t = cs.gridTemplateColumns;
      return t && t !== "none" ? t.split(" ").filter(Boolean).length : 1;
    }
    var count = parseInt(cs.columnCount, 10) || 99;
    var width = parseFloat(cs.columnWidth) || 0;
    var gap = parseFloat(cs.columnGap) || 0;
    var fit = width ? Math.max(1, Math.floor((el.clientWidth + gap) / (width + gap))) : (count === 99 ? 1 : count);
    return Math.max(1, Math.min(count, fit));
  }

  units.forEach(function (box) {
    var solo = box.matches(CONT);
    var src = box.getAttribute("data-ctpg-more-src");
    var total = parseInt(box.getAttribute("data-ctpg-more-total"), 10) || 0;
    var next = src ? parseInt(box.getAttribute("data-ctpg-more-next"), 10) : null;
    var noun = box.getAttribute("data-ctpg-more-noun") || "";
    var cards = [], foot = null, status, btn, io = null;
    var size = 0, shown = 0, loading = false, failed = false, first = true, skels = [];

    // Cards that appear after the first paint rise in, one after another.
    function arrive(list) {
      var k = 0;
      list.forEach(function (c, i) {
        if (i >= shown || c.ctpgSeen) return;
        c.ctpgSeen = true;
        if (first) return;
        c.style.setProperty("--ctpg-i", String(k++ % 12));
        c.classList.add("ctpg-in");
        c.addEventListener("animationend", function () { c.classList.remove("ctpg-in"); c.style.removeProperty("--ctpg-i"); }, { once: true });
      });
    }

    // Placeholder cards while the next batch comes from the server: one row's worth.
    function skeletons(on) {
      skels.forEach(function (s) { s.remove(); });
      skels = [];
      if (!on) return;
      var all = solo ? [box] : box.querySelectorAll(".ctpg-cards");
      var grid = all[all.length - 1];
      if (!grid) return;
      var n = Math.min(4, Math.max(2, cols(grid)));
      for (var i = 0; i < n; i++) {
        var s = document.createElement("div");
        s.className = "ctpg-skel";
        s.setAttribute("aria-hidden", "true");
        s.innerHTML = '<span class="ctpg-skel__photo"></span><span class="ctpg-skel__body"><span class="ctpg-skel__line"></span><span class="ctpg-skel__line ctpg-skel__line--title"></span><span class="ctpg-skel__line ctpg-skel__line--fact"></span><span class="ctpg-skel__line ctpg-skel__line--btn"></span></span>';
        grid.appendChild(s);
        skels.push(s);
      }
    }

    var isDir = box.matches(".dir");
    function itemsOf(g) {
      var any = g.hasAttribute("data-ctpg-more-items");
      return Array.prototype.filter.call(g.children, function (c) { return any ? !c.classList.contains("ctpg-skel") : c.matches(CARD); });
    }
    function collect() {
      cards = [];
      if (isDir) { cards = Array.prototype.slice.call(box.querySelectorAll(".dir-list > li")); return; }
      (solo ? [box] : Array.prototype.slice.call(box.querySelectorAll(CONT))).forEach(function (g) {
        Array.prototype.push.apply(cards, itemsOf(g));
      });
    }
    function pool() { return cards.filter(function (c) { return !c.hidden; }); }
    function remoteLeft() { return src && next !== null && !isNaN(next); }
    function count() { return remoteLeft() ? Math.max(total, pool().length) : pool().length; }

    function build() {
      foot = document.createElement("div");
      foot.className = "ctpg-more";
      foot.innerHTML = '<p class="ctpg-more__status" aria-live="polite"></p><button type="button" class="ctpg-cta ctpg-more__btn"></button>';
      if (solo) box.parentNode.insertBefore(foot, box.nextSibling); else box.appendChild(foot);
      status = foot.querySelector(".ctpg-more__status");
      btn = foot.querySelector(".ctpg-more__btn");
      btn.addEventListener("click", function () {
        var from = shown;
        more(function () {
          var first = pool()[from];
          if (first) { var link = first.matches("a") ? first : first.querySelector("a"); if (link) link.focus({ preventScroll: true }); }
        });
      });
      if ("IntersectionObserver" in window) {
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting && !foot.hidden && !failed) more(); });
        }, { rootMargin: "0px 0px 500px 0px" });
        io.observe(foot);
      }
    }
    // Re-observe so a batch that leaves the end in view loads the next one too.
    function poke() { if (io && foot) { io.unobserve(foot); io.observe(foot); } }

    function paint() {
      var list = pool();
      cards.forEach(function (c) { c.classList.remove("ctpg-later"); });
      if (list.length <= size && !remoteLeft()) { if (foot) foot.hidden = true; arrive(list); groups(); return; }
      if (!foot) build();
      list.forEach(function (c, i) { if (i >= shown) c.classList.add("ctpg-later"); });
      arrive(list);
      groups();
      var now = Math.min(shown, list.length);
      foot.hidden = now >= list.length && !remoteLeft();
      status.textContent = failed ? "Couldn't load more just now." : loading ? "Loading more" + (noun ? " " + noun : "") + "..." : "Showing " + now + " of " + count() + (noun ? " " + noun : "");
      btn.textContent = failed ? "Try again" : loading ? "Loading" : (noun ? "Show more " + noun : "Show more");
      btn.classList.toggle("is-loading", loading);
    }

    // Hide group headings (a cruise line) whose cards are all folded.
    function groups() {
      Array.prototype.forEach.call(box.querySelectorAll("[data-ctpg-more-group], .dir-group"), function (g) {
        var any = Array.prototype.some.call(g.querySelectorAll(".ctpg-cards > *, .ctpg-rows > *, [data-ctpg-more-items] > *, .dir-list > li"), function (c) { return !c.hidden && !c.classList.contains("ctpg-later"); });
        g.classList.toggle("ctpg-later", !any);
      });
    }

    function fetchMore(to, done) {
      if (loading || !remoteLeft()) { if (done && !loading) done(); return; }
      loading = true; failed = false; paint(); skeletons(true);
      var url = src + (src.indexOf("?") < 0 ? "?" : "&") + "offset=" + next + (to ? "&to=" + encodeURIComponent(to) : "");
      fetch(url, { headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) {
          skeletons(false);
          (d.items || []).forEach(function (it) {
            var sec = document.getElementById(it.id);
            if (!sec) {
              var tmp = document.createElement("div");
              tmp.innerHTML = it.section;
              sec = tmp.firstElementChild;
              box.insertBefore(sec, foot);
            }
            var grid = sec.matches(".ctpg-cards") ? sec : sec.querySelector(".ctpg-cards");
            grid.insertAdjacentHTML("beforeend", it.cards);
          });
          next = d.next === null || d.next === undefined ? null : d.next;
          if (d.total) total = d.total;
          loading = false;
          collect(); photos(box); paint(); poke();
          if (done) done();
        })
        .catch(function () { skeletons(false); loading = false; failed = true; paint(); });
    }

    function more(done) {
      failed = false;
      shown += size;
      if (shown > pool().length && remoteLeft()) { paint(); fetchMore("", done); return; }
      paint();
      if (done) done();
    }

    function measure() {
      var grid = solo ? box : isDir ? (box.querySelector(".dir-list--cols") || box.querySelector(".dir-list")) : box.querySelector(CONT);
      if (!grid) return;
      var s = cols(grid) * ROWS;
      if (s === size) return;
      shown = Math.max(s, Math.ceil(shown / s) * s);
      size = s;
      paint();
    }

    box.addEventListener("ctpg-more-reset", function () { shown = size; paint(); });

    // Jump links to a group (#ships-carnival) open everything up to the end of that group, loading it if needed.
    function openTo(id, scroll) {
      var target = document.getElementById(id);
      if (!target) {
        // Only for this list's own jump links (a cruise line not loaded yet).
        if (remoteLeft() && box.querySelector('a[href="#' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]')) fetchMore(id, function () { if (document.getElementById(id)) openTo(id, true); });
        return;
      }
      if (!box.contains(target)) return;
      var list = pool();
      var inside = list.filter(function (c) { return target.contains(c); });
      if (inside.length) {
        var last = list.indexOf(inside[inside.length - 1]) + 1;
        if (last > shown) { shown = last; paint(); }
      }
      if (scroll) target.scrollIntoView({ block: "start" });
    }
    box.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = decodeURIComponent(a.getAttribute("href").slice(1));
      if (!id) return;
      if (!document.getElementById(id) && remoteLeft() && box.contains(a)) {
        e.preventDefault();
        history.pushState(null, "", "#" + id);
        openTo(id, true);
      } else {
        openTo(id, false);
      }
    });
    window.addEventListener("hashchange", function () { if (location.hash.length > 1) openTo(decodeURIComponent(location.hash.slice(1)), true); });

    collect();
    measure();
    first = false;
    if (location.hash.length > 1) openTo(decodeURIComponent(location.hash.slice(1)), true);
    var timer;
    window.addEventListener("resize", function () { clearTimeout(timer); timer = setTimeout(measure, 150); });
  });
})();
