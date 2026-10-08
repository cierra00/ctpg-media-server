// CTPG website behaviour (10-design-system.md 6.2): phone menu and header search.
// Loaded by ctpg-theme with defer. No dependencies.
(function () {
  "use strict";

  var header = document.querySelector(".ctpg-header");
  if (!header) return;

  var menuButton = header.querySelector("[data-ctpg-menu]");
  var nav = document.getElementById("ctpg-nav");
  var searchButton = header.querySelector("[data-ctpg-search]");
  var panel = document.getElementById("ctpg-search-panel");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
      // Homepage: the hero has the search box, so go there instead of opening the panel.
      var hero = document.querySelector("[data-ctpg-hero-search] input[type=search], .ctpg-hero-search input[type=search]");
      setMenu(false);
      if (hero) {
        hero.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
        hero.focus({ preventScroll: true });
        return;
      }
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
