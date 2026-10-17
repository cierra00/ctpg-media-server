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
    var pause = hero.querySelector("[data-ctpg-pause]");
    var current = 0, timer = null;

    var show = function (i) {
      current = i;
      Array.prototype.forEach.call(bgs, function (b, n) { b.classList.toggle("active", n === i); });
      Array.prototype.forEach.call(tabs, function (t, n) {
        t.classList.toggle("active", n === i);
        t.setAttribute("aria-pressed", String(n === i));
      });
      // One fixed headline since Oct 17, 2026 (plans/44): only the photo changes.
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
        c.addEventListener("animationend", function () { c.classList.remove("ctpg-in"); c.style.removeProperty("--ctpg-i"); if (!c.getAttribute("style")) c.removeAttribute("style"); }, { once: true });
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

// Homepage trip planner (Cierra, Oct 17, 2026; plans/42-homepage-search-fields-research.md).
// Trip type tabs show that type's fields in one row; each field opens a small panel (a sheet on
// phones). "Find my trip" turns the answers into the results page address.
(function () {
  "use strict";
  var form = document.querySelector("[data-ctpg-tp]");
  if (!form) return;
  var data = {};
  try { data = JSON.parse(form.getAttribute("data-tp") || "{}"); } catch (e) { data = {}; }
  var $ = function (sel, root) { return (root || form).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || form).querySelectorAll(sel)); };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var ORLANDO = ["port-canaveral", "miami", "fort-lauderdale", "tampa"];
  var SOCAL = ["long-beach", "san-diego"];
  var POPULAR = {
    cruise: ["Caribbean", "Bahamas", "Alaska", "Mexican Riviera", "Mediterranean", "Port Canaveral (Orlando)", "Royal Caribbean International"],
    unsure: ["Caribbean", "Walt Disney World", "Universal Orlando", "Disneyland", "Bahamas", "Alaska", "Port Canaveral (Orlando)"]
  };
  var s = {
    type: "unsure", pick: null, months: [], tab: "months", from: "", to: "", adults: 2, kids: [],
    nr: "", parks: [], comboPark: "wdw", days: 0, first: "parks", cnights: "6-9", port: ""
  };
  var open = null, opener = null;
  var phone = window.matchMedia("(max-width: 680px)");
  form.classList.add("tp-ready");

  function typeKey() { return s.type || "unsure"; }

  // ── Chips ──
  // Built once per set of choices; later renders only update which are pressed (keeps focus).
  function chips(box, items, isOn, onPick) {
    var sig = items.map(function (it) { return it[0]; }).join("|");
    if (box.getAttribute("data-sig") === sig) {
      Array.prototype.forEach.call(box.children, function (b, i) { b.setAttribute("aria-pressed", String(isOn(items[i][0]))); });
      box._pick = onPick;
      return;
    }
    box.setAttribute("data-sig", sig);
    box._pick = onPick;
    box.innerHTML = "";
    items.forEach(function (it) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tp-chip";
      b.textContent = it[1];
      b.setAttribute("aria-pressed", String(isOn(it[0])));
      b.addEventListener("click", function () { box._pick(it[0]); render(); });
      box.appendChild(b);
    });
  }

  // ── Fields shown for the trip type ──
  function showFields() {
    var k = typeKey(), n = 0;
    $$("[data-tp-for]").forEach(function (f) {
      var on = f.getAttribute("data-tp-for").split(" ").indexOf(k) > -1;
      f.hidden = !on;
      if (on) n++;
      if (on) f.setAttribute("data-pos", String(n)); else f.removeAttribute("data-pos");
    });
    $("[data-tp-fields]").setAttribute("data-count", String(n));
    var wl = $("[data-tp-where-label]");
    if (wl) wl.textContent = k === "cruise" ? "Where to?" : "Where?";
    var q = $("#tp-q");
    if (q) q.placeholder = k === "cruise" ? "Region, port, line or ship" : "Region, park, port, line or ship";
  }

  // ── Values shown in the fields ──
  function monthLabel(key) { var p = key.split("-"); return MONTHS[+p[1] - 1] + " " + p[0]; }
  function dateLabel(v) { if (!v) return ""; var d = new Date(v + "T12:00:00"); return MONTHS[d.getMonth()] + " " + d.getDate(); }
  function parkName(k) { return (data.parks || {})[k] || k; }
  function setVal(key, text, empty) {
    var el = $('[data-tp-val="' + key + '"]');
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("is-empty", !!empty);
  }
  function render() {
    var sorted = s.months.slice().sort();
    if (s.tab === "dates" && (s.from || s.to)) setVal("when", (dateLabel(s.from) || "Any day") + " to " + (dateLabel(s.to) || "any day"), false);
    else if (!sorted.length) setVal("when", "Anytime", true);
    else setVal("when", sorted.length <= 2 ? sorted.map(monthLabel).join(", ") : monthLabel(sorted[0]) + " + " + (sorted.length - 1) + " more", false);
    var k = s.kids.length;
    setVal("who", s.adults + (s.adults === 1 ? " adult" : " adults") + (k ? ", " + k + (k === 1 ? " kid" : " kids") : ""), false);
    var nightsLabel = { "2-5": "2 to 5 nights", "6-9": "6 to 9 nights", "10-14": "10 to 14 nights", "15-0": "15+ nights" };
    setVal("nights", s.nr ? nightsLabel[s.nr] : "Any length", !s.nr);
    if (s.type === "cruise-and-park") setVal("park", parkName(s.comboPark), false);
    else setVal("park", s.parks.length ? s.parks.map(parkName).join(", ") : "Any park", !s.parks.length);
    setVal("days", s.days ? s.days + (s.days === 1 ? " park day" : " park days") : "Not sure yet", !s.days);
    var pd = (s.days || 4) + (s.days === 1 ? " day" : " days");
    setVal("combo", s.first === "parks" ? pd + " + cruise" : "Cruise + " + pd, false);
    // Panels
    $$("[data-tp-num]").forEach(function (o) {
      var key = o.getAttribute("data-tp-num");
      o.textContent = key === "days" ? String(s.days || 4) : key === "kids" ? String(s.kids.length) : String(s[key]);
    });
    $$("[data-tp-step]").forEach(function (b) {
      var key = b.getAttribute("data-tp-step"), dir = +b.getAttribute("data-dir");
      var v = key === "days" ? (s.days || 4) : key === "kids" ? s.kids.length : s.adults;
      var lim = { adults: [1, 8], kids: [0, 6], days: [1, 10] }[key];
      b.disabled = dir < 0 ? v <= lim[0] : v >= lim[1];
    });
    var mt = $("[data-tp-months]");
    if (mt && mt.children.length) {
      $$(".tp-chip", mt).forEach(function (b) { b.setAttribute("aria-pressed", String(s.months.indexOf(b.getAttribute("data-key")) > -1)); });
    } else if (mt) {
      var now = new Date(), y = now.getFullYear(), m = now.getMonth(), group = null;
      for (var i = 0; i < 24; i++) {
        if (!group || group.getAttribute("data-year") !== String(y)) {
          group = document.createElement("div");
          group.className = "tp-year";
          group.setAttribute("data-year", String(y));
          group.innerHTML = '<span class="tp-year-l">' + y + '</span><div class="tp-mgrid"></div>';
          mt.appendChild(group);
        }
        (function (key, label, grid) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "tp-chip";
          b.textContent = label;
          b.setAttribute("aria-label", label + " " + key.slice(0, 4));
          b.setAttribute("data-key", key);
          b.setAttribute("aria-pressed", String(s.months.indexOf(key) > -1));
          b.addEventListener("click", function () {
            var j = s.months.indexOf(key);
            if (j > -1) s.months.splice(j, 1); else s.months.push(key);
            render();
          });
          grid.appendChild(b);
        })(y + "-" + ("0" + (m + 1)).slice(-2), MONTHS[m], group.querySelector(".tp-mgrid"));
        m++;
        if (m > 11) { m = 0; y++; }
      }
    }
    var any = $("[data-tp-anytime]");
    if (any) any.setAttribute("aria-pressed", String(!s.months.length));
    $$("[data-tp-when-tab]").forEach(function (t) { t.setAttribute("aria-selected", String(t.getAttribute("data-tp-when-tab") === s.tab)); });
    $$("[data-tp-when-pane]").forEach(function (p) { p.hidden = p.getAttribute("data-tp-when-pane") !== s.tab; });
    var park = s.type === "theme-park";
    $("[data-tp-park-hint]").hidden = !park;
    chips($('[data-tp-chips="park"]'), Object.keys(data.parks || {}).map(function (k2) { return [k2, parkName(k2)]; }),
      function (v) { return park ? s.parks.indexOf(v) > -1 : s.comboPark === v; },
      function (v) {
        if (park) { var j = s.parks.indexOf(v); if (j > -1) s.parks.splice(j, 1); else s.parks.push(v); }
        else { s.comboPark = v; s.port = ""; }
      });
    chips($('[data-tp-chips="nights"]'), [["", "Any length"], ["2-5", "2 to 5"], ["6-9", "6 to 9"], ["10-14", "10 to 14"], ["15-0", "15+"]],
      function (v) { return s.nr === v; }, function (v) { s.nr = v; });
    chips($('[data-tp-chips="first"]'), [["parks", "Parks first"], ["cruise", "Cruise first"]],
      function (v) { return s.first === v; }, function (v) { s.first = v; });
    chips($('[data-tp-chips="cnights"]'), [["3-5", "3 to 5"], ["6-9", "6 to 9"], ["10-0", "10+"]],
      function (v) { return s.cnights === v; }, function (v) { s.cnights = v; });
    var sel = $("[data-tp-port]");
    if (sel) {
      var list = s.comboPark === "disneyland" ? SOCAL : ORLANDO;
      if (list.indexOf(s.port) < 0) s.port = list[0];
      sel.innerHTML = list.map(function (p) { return '<option value="' + p + '"' + (p === s.port ? " selected" : "") + ">" + ((data.ports || {})[p] || p) + "</option>"; }).join("");
    }
    var ages = $("[data-tp-ages]");
    if (ages && ages.children.length !== s.kids.length) {
      ages.innerHTML = "";
      s.kids.forEach(function (age, i) {
        var l = document.createElement("label");
        var opts = '<option value="">Age</option><option value="0"' + (age === "0" ? " selected" : "") + ">Under 1</option>";
        for (var a = 1; a <= 17; a++) opts += '<option value="' + a + '"' + (age === String(a) ? " selected" : "") + ">" + a + "</option>";
        l.innerHTML = "<span>Kid " + (i + 1) + "</span><select>" + opts + "</select>";
        l.querySelector("select").addEventListener("change", function (e) { s.kids[i] = e.target.value; });
        ages.appendChild(l);
      });
    }
    $("[data-tp-ages-hint]").hidden = !s.kids.length;
    var park2 = s.type === "theme-park";
    $("[data-tp-from-label]").textContent = park2 ? "Arrive" : "Leave on or after";
    $("[data-tp-to-label]").textContent = park2 ? "Head home" : "Home by";
  }

  // ── Panels ──
  function close(back) {
    if (!open) return;
    open.hidden = true;
    var t = open.parentNode.querySelector("[aria-expanded]");
    if (t) t.setAttribute("aria-expanded", "false");
    open.parentNode.classList.remove("is-open");
    document.documentElement.classList.remove("tp-sheet-open", "tp-open");
    open = null;
    if (back && opener) opener.focus();
    opener = null;
  }
  function openPanel(field, trigger) {
    var pop = $(".tp-pop", field);
    if (!pop) return;
    if (open === pop) { close(true); return; }
    close(false);
    pop.hidden = false;
    open = pop;
    opener = trigger;
    field.classList.add("is-open");
    document.documentElement.classList.add("tp-open");
    trigger.setAttribute("aria-expanded", "true");
    if (phone.matches && !field.classList.contains("tp-where")) document.documentElement.classList.add("tp-sheet-open");
    // Keep the panel inside the box.
    pop.style.left = "";
    pop.style.right = "";
    if (!phone.matches) {
      var box = form.getBoundingClientRect(), r = pop.getBoundingClientRect();
      if (r.right > box.right - 12) { pop.style.left = "auto"; pop.style.right = "0"; }
    }
    if (!field.classList.contains("tp-where")) {
      var first = pop.querySelector("[aria-pressed='true'], button, select, input");
      if (first) first.focus();
    }
  }
  $$("[data-tp-field] .tp-box[aria-controls]").forEach(function (b) {
    b.addEventListener("click", function () { openPanel(b.parentNode, b); });
  });
  form.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-tp-close]") : null;
    if (t) close(true);
    var c = e.target.closest ? e.target.closest("[data-tp-clear]") : null;
    if (c) {
      var k = c.getAttribute("data-tp-clear");
      if (k === "when") { s.months = []; s.from = s.to = ""; $("[data-tp-from]").value = ""; $("[data-tp-to]").value = ""; }
      if (k === "who") { s.adults = 2; s.kids = []; }
      if (k === "nights") s.nr = "";
      if (k === "park") { s.parks = []; s.comboPark = "wdw"; }
      if (k === "days") s.days = 0;
      if (k === "combo") { s.days = 0; s.first = "parks"; s.cnights = "6-9"; s.port = ""; }
      render();
    }
  });
  document.addEventListener("click", function (e) {
    if (open && e.target.isConnected && !open.parentNode.contains(e.target)) close(false);
  });
  // A panel closes once the whole panel has scrolled up under the header (desktop).
  window.addEventListener("scroll", function () {
    if (open && !phone.matches && open.getBoundingClientRect().bottom < 140) close(false);
  }, { passive: true });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) { e.preventDefault(); close(true); }
  });

  // ── Steppers, months, dates, port ──
  $$("[data-tp-step]").forEach(function (b) {
    b.addEventListener("click", function () {
      var key = b.getAttribute("data-tp-step"), dir = +b.getAttribute("data-dir");
      if (key === "adults") s.adults = Math.min(8, Math.max(1, s.adults + dir));
      if (key === "kids") { if (dir > 0 && s.kids.length < 6) s.kids.push(""); if (dir < 0) s.kids.pop(); }
      if (key === "days") s.days = Math.min(10, Math.max(1, (s.days || 4) + dir));
      render();
    });
  });
  $("[data-tp-anytime]").addEventListener("click", function () { s.months = []; render(); });
  $$("[data-tp-when-tab]").forEach(function (t) {
    t.addEventListener("click", function () { s.tab = t.getAttribute("data-tp-when-tab"); render(); });
  });
  var today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  [["from", "[data-tp-from]"], ["to", "[data-tp-to]"]].forEach(function (p) {
    var el = $(p[1]);
    el.min = today;
    el.addEventListener("change", function () {
      s[p[0]] = el.value;
      if (p[0] === "from") $("[data-tp-to]").min = el.value || today;
      render();
    });
  });
  $("[data-tp-port]").addEventListener("change", function (e) { s.port = e.target.value; });

  // ── Trip type tabs ──
  $$('input[name="style"]').forEach(function (r) {
    r.addEventListener("change", function () {
      s.type = r.value;
      if (s.type === "cruise" && s.pick && s.pick[2] === "park") { s.pick = null; $("#tp-q").value = ""; }
      close(false);
      showFields();
      render();
    });
  });

  // ── Where: suggestions as you type ──
  var q = $("#tp-q"), list = $("#tp-where-list"), whereField = $('[data-tp-field="where"]');
  var where = (data.where || []), active = -1, shown = [];
  function suggest() {
    var k = typeKey(), text = q.value.trim().toLowerCase();
    var pool = k === "cruise" ? where.filter(function (w) { return w[2] !== "park"; }) : where;
    if (s.pick && q.value === s.pick[0]) text = "";
    if (!text) {
      shown = (POPULAR[k] || POPULAR.unsure).map(function (l) { return pool.filter(function (w) { return w[0] === l; })[0]; }).filter(Boolean);
    } else {
      var starts = [], has = [];
      pool.forEach(function (w) {
        var l = w[0].toLowerCase();
        if (l.indexOf(text) === 0) starts.push(w);
        else if (l.indexOf(text) > -1 || (" " + l).indexOf(" " + text) > -1) has.push(w);
      });
      shown = starts.concat(has).slice(0, 8);
    }
    $("[data-tp-where-heading]").textContent = text ? "Matches" : "Popular";
    var none = $("[data-tp-where-none]");
    none.hidden = !!shown.length || !text;
    if (!shown.length && text) none.textContent = "No exact match. I'll search trip ideas for “" + q.value.trim() + "”.";
    list.innerHTML = "";
    active = -1;
    shown.forEach(function (w, i) {
      var li = document.createElement("li");
      li.id = "tp-opt-" + i;
      li.setAttribute("role", "option");
      li.className = "tp-opt";
      li.innerHTML = '<span class="tp-opt-l"></span><span class="tp-tag tp-tag-' + w[1].toLowerCase() + '"></span>';
      li.querySelector(".tp-opt-l").textContent = w[0] + (w[4] ? " · " + w[4] : "");
      li.querySelector(".tp-tag").textContent = w[1];
      li.addEventListener("mousedown", function (e) { e.preventDefault(); choose(w); });
      list.appendChild(li);
    });
    q.removeAttribute("aria-activedescendant");
  }
  function choose(w) {
    s.pick = w;
    q.value = w[0];
    if (s.type === "" && w[1] !== "Region") {
      var to = w[2] === "park" ? "theme-park" : "cruise";
      $('input[name="style"][value="' + to + '"]').checked = true;
      s.type = to;
      if (to === "theme-park") s.parks = [w[3]];
      showFields();
    }
    close(false);
    render();
  }
  function openWhere() {
    if (open !== $(".tp-pop", whereField)) openPanel(whereField, q);
    suggest();
    q.setAttribute("aria-expanded", "true");
  }
  q.addEventListener("focus", openWhere);
  q.addEventListener("input", function () {
    if (s.pick && q.value !== s.pick[0]) s.pick = null;
    openWhere();
  });
  q.addEventListener("keydown", function (e) {
    if (!shown.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) openWhere();
      active = (active + (e.key === "ArrowDown" ? 1 : shown.length - 1)) % shown.length;
      $$(".tp-opt", list).forEach(function (o, i) { o.classList.toggle("is-active", i === active); });
      q.setAttribute("aria-activedescendant", "tp-opt-" + active);
    } else if (e.key === "Enter" && active > -1 && open) {
      e.preventDefault();
      choose(shown[active]);
    }
  });
  var origClose = close;
  close = function (back) {
    if (open === $(".tp-pop", whereField)) q.setAttribute("aria-expanded", "false");
    origClose(back);
  };

  // ── Find my trip ──
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var p = new URLSearchParams(), t = s.type;
    if (t) p.set("style", t);
    if (t === "cruise" || t === "") {
      if (s.pick && q.value === s.pick[0]) p.set(s.pick[2], s.pick[3]);
      else if (q.value.trim()) p.set("q", q.value.trim());
    }
    if (s.tab === "dates" && (s.from || s.to)) { if (s.from) p.set("from", s.from); if (s.to) p.set("to", s.to); }
    else if (s.months.length) p.set("when", s.months.slice().sort().join(","));
    if (t === "cruise" && s.nr) p.set("nr", s.nr);
    if (t === "theme-park") {
      if (s.parks.length) p.set("park", s.parks.join(","));
      if (s.days) p.set("days", String(s.days));
    }
    if (t === "cruise-and-park") {
      p.set("park", s.comboPark);
      p.set("first", s.first);
      p.set("days", String(s.days || 4));
      p.set("nr", s.cnights);
      p.set("port", s.port);
    }
    p.set("adults", String(s.adults));
    if (s.kids.length) {
      p.set("kids", String(s.kids.length));
      var ages = s.kids.filter(function (a) { return a !== ""; });
      if (ages.length === s.kids.length) p.set("ages", ages.join(","));
    }
    window.location.assign(form.action + (form.action.indexOf("?") > -1 ? "&" : "?") + p.toString());
  });

  // Edit search (Oct 17, 2026): the results page sends its answers back in the address.
  (function () {
    var u = new URLSearchParams(window.location.search);
    if (!u.toString()) return;
    var list = function (k) { return (u.get(k) || "").split(",").filter(function (v) { return v !== ""; }); };
    var style = u.get("style");
    if (style !== null) {
      var r = $('input[name="style"][value="' + style.replace(/[^a-z-]/g, "") + '"]');
      if (r) { r.checked = true; s.type = r.value; }
    }
    if (s.type === "cruise" || s.type === "") {
      ["dest", "port", "line", "ship", "park"].some(function (k) {
        var v = u.get(k);
        var w = v && where.filter(function (x) { return x[2] === k && x[3] === v.split(",")[0]; })[0];
        if (w) { s.pick = w; q.value = w[0]; }
        return !!w;
      });
      if (!s.pick && u.get("q")) q.value = u.get("q");
    }
    if (s.type === "theme-park") s.parks = list("park").filter(function (k) { return (data.parks || {})[k]; });
    if (s.type === "cruise-and-park") {
      if ((data.parks || {})[list("park")[0]]) s.comboPark = list("park")[0];
      if (u.get("first") === "cruise") s.first = "cruise";
      if (["3-5", "6-9", "10-0"].indexOf(u.get("nr")) > -1) s.cnights = u.get("nr");
      if ((data.ports || {})[u.get("port")]) s.port = u.get("port");
    }
    if (s.type === "cruise" && ["2-5", "6-9", "10-14", "15-0"].indexOf(u.get("nr")) > -1) s.nr = u.get("nr");
    var days = parseInt(u.get("days"), 10);
    if (days >= 1 && days <= 10) s.days = days;
    s.months = list("when").filter(function (m) { return /^20\d\d-(0[1-9]|1[0-2])$/.test(m); });
    if (u.get("from") || u.get("to")) {
      s.tab = "dates";
      s.from = u.get("from") || "";
      s.to = u.get("to") || "";
      $("[data-tp-from]").value = s.from;
      $("[data-tp-to]").value = s.to;
    }
    var adults = parseInt(u.get("adults"), 10);
    if (adults >= 1 && adults <= 8) s.adults = adults;
    var ages = list("ages"), kids = Math.min(6, parseInt(u.get("kids"), 10) || ages.length);
    s.kids = [];
    for (var i = 0; i < kids; i++) s.kids.push(ages[i] !== undefined ? ages[i] : "");
  })();

  showFields();
  render();
})();
