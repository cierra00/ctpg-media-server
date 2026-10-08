// CTPG — global JavaScript entrypoint

(function () {
  "use strict";

  // Expose a lightweight analytics helper that pushes to GTM dataLayer.
  window.ctpgTrack = function (event, params) {
    if (window.dataLayer) {
      window.dataLayer.push(Object.assign({ event: event }, params || {}));
    }
  };

  // ============================================
  // CAROUSEL FUNCTIONALITY
  // ============================================
  function initCarousels() {
    var carousels = document.querySelectorAll('.carousel');

    carousels.forEach(function (carouselEl) {
      var carouselId = carouselEl.id;
      if (!carouselId) return;

      var interval = carouselEl.classList.contains('carousel-fast') ? 3000 : 5000;

      if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
        new bootstrap.Carousel(carouselEl, {
          interval: interval,
          ride: carouselEl.dataset.bsRide === 'carousel' ? 'carousel' : false,
          pause: 'hover',
          wrap: true,
          touch: true
        });

        carouselEl.addEventListener('slide.bs.carousel', function (e) {
          window.ctpgTrack('ctpg_carousel_slide', {
            carousel_id: carouselId,
            from_slide: e.from,
            to_slide: e.to
          });
        });
      }
    });

    var dotIndicators = document.querySelectorAll('[data-bs-slide-to]');
    dotIndicators.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = this.dataset.bsTarget;
        var slideIndex = parseInt(this.dataset.bsSlideTo);
        var carousel = document.querySelector(target);

        if (carousel && typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
          var bsCarousel = bootstrap.Carousel.getInstance(carousel);
          if (bsCarousel) bsCarousel.to(slideIndex);
        }

        var allDots = document.querySelectorAll('[data-bs-target="' + target + '"][data-bs-slide-to]');
        allDots.forEach(function (d) { d.classList.remove('active'); });
        this.classList.add('active');
      });
    });

    carousels.forEach(function (carousel) {
      carousel.addEventListener('mouseenter', function () {
        if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
          var bsCarousel = bootstrap.Carousel.getInstance(this);
          if (bsCarousel) bsCarousel.pause();
        }
      });
      carousel.addEventListener('mouseleave', function () {
        if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
          var bsCarousel = bootstrap.Carousel.getInstance(this);
          if (bsCarousel && this.dataset.bsRide === 'carousel') bsCarousel.cycle();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
  } else {
    initCarousels();
  }

  // ============================================
  // SWIPER FUNCTIONALITY
  // ============================================
  function initSwipers() {
    if (typeof Swiper === 'undefined') return;

    // Peek / reel carousel — 4.2 slides desktop, 2.2 tablet, 1.3 mobile
    var reelEl = document.querySelector('.reelSwiper');
    if (reelEl) {
      new Swiper('.reelSwiper', {
        slidesPerView: 4.2,
        spaceBetween: 12,
        loop: true,
        navigation: { prevEl: '#reelPrev', nextEl: '#reelNext' },
        breakpoints: {
          0:   { slidesPerView: 1.3 },
          576: { slidesPerView: 2.2 },
          768: { slidesPerView: 4.2 }
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSwipers);
  } else {
    initSwipers();
  }

  // ============================================
  // BOOTSTRAP COMPONENTS
  // ============================================
  function logBootstrapReady() {
    if (typeof bootstrap !== 'undefined') {
      console.log('Bootstrap JS loaded - components auto-initialized via data attributes');
    } else {
      console.error('Bootstrap JS not loaded - interactive components will not work');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', logBootstrapReady);
  } else {
    logBootstrapReady();
  }

  // ============================================
  // MODAL ACCESSIBILITY FIX
  // ============================================
  function initModalAccessibility() {
    document.addEventListener('click', function (e) {
      var closeBtn = e.target.closest('[data-bs-dismiss="modal"]');
      if (closeBtn) {
        setTimeout(function () { document.body.focus(); }, 0);
      }
    });

    var modals = document.querySelectorAll('.modal');
    modals.forEach(function (modal) {
      modal.addEventListener('hide.bs.modal', function () {
        var focusedElement = modal.querySelector(':focus');
        if (focusedElement) {
          focusedElement.blur();
          document.body.focus();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalAccessibility);
  } else {
    initModalAccessibility();
  }

  // ============================================
  // MOBILE NAVIGATION
  // ============================================

  var navToggle = document.querySelector("[data-ctpg-nav-toggle]");
  var navMenu = document.getElementById("siteNav");
  var navOverlay = document.getElementById("mobileMenuOverlay");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".ctpg-nav-link"));

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navMenu.classList.toggle("is-open");
      if (navOverlay) navOverlay.classList.toggle("is-open");
    });

    if (navOverlay) {
      navOverlay.addEventListener("click", function () {
        navMenu.classList.remove("is-open");
        navOverlay.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    }

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 991.98px)").matches) {
          navMenu.classList.remove("is-open");
          if (navOverlay) navOverlay.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  var sectionIds = ["home", "cruises", "parks", "guides", "about"];
  var sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setActiveLink() {
    var current = "home";
    var offset = window.scrollY + 140;

    sections.forEach(function (section) {
      if (section.offsetTop <= offset) current = section.id;
    });

    navLinks.forEach(function (link) {
      var target = link.getAttribute("href");
      link.classList.toggle("is-active", target === "#" + current);
    });
  }

  if (sections.length > 0 && navLinks.length > 0) {
    setActiveLink();
    window.addEventListener("scroll", setActiveLink, { passive: true });
  }

  console.log("CTPG media server loaded.");
})();