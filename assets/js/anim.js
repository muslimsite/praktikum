/* ── Лендинг практикума — premium scroll motion ────────────────────
   Progressive enhancement: the page is fully usable without JS.
   Everything here degrades gracefully and honours prefers-reduced-motion. */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1. Reveal on scroll ─────────────────────────────────────── */
  function setupReveal() {
    var groups = Array.prototype.slice.call(
      document.querySelectorAll("[data-reveal-group]")
    );
    // Stagger the children of each group.
    groups.forEach(function (g) {
      var step = parseInt(g.getAttribute("data-stagger"), 10) || 90;
      Array.prototype.forEach.call(g.children, function (child, i) {
        child.style.transitionDelay = i * step + "ms";
      });
    });

    var targets = Array.prototype.slice.call(
      document.querySelectorAll("[data-reveal], [data-reveal-group]")
    );

    if (reduce || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      runCounters(document);
      return;
    }

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        runCounters(e.target);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

    targets.forEach(function (el) {
      // Elements above the fold reveal immediately on load.
      if (el.hasAttribute("data-reveal-now")) {
        requestAnimationFrame(function () { el.classList.add("is-in"); });
        runCounters(el);
      } else {
        io.observe(el);
      }
    });
  }

  /* ── 2. Count-up numbers ─────────────────────────────────────── */
  function runCounters(scope) {
    var nums = scope.querySelectorAll
      ? scope.querySelectorAll("[data-count]")
      : [];
    Array.prototype.forEach.call(nums, function (el) {
      if (el.__counted) return;
      el.__counted = true;
      var target = parseFloat(el.getAttribute("data-count"));
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduce || isNaN(target)) {
        el.textContent = prefix + target + suffix;
        return;
      }
      var dur = 1400, start = null;
      function ease(t) { return 1 - Math.pow(1 - t, 3); }
      function tick(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var val = Math.round(ease(p) * target);
        el.textContent = prefix + val + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      el.textContent = prefix + "0" + suffix;
      requestAnimationFrame(tick);
    });
  }

  /* ── 3. Scroll-progress bar + sticky CTA bar ─────────────────── */
  function setupScrollChrome() {
    var bar = document.querySelector(".lp-progress");
    var sticky = document.querySelector(".lp-sticky");
    var hero = document.querySelector(".lp-hero");
    var ticking = false;

    function update() {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var y = window.pageYOffset || doc.scrollTop;

      if (bar && !reduce) {
        bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
      }
      if (sticky && hero) {
        var trigger = hero.offsetHeight - 90;
        sticky.classList.toggle("is-visible", y > trigger);
      }
      // Subtle hero image parallax.
      if (heroImg && !reduce) {
        var shift = Math.max(-24, Math.min(24, y * 0.08));
        heroImg.style.transform = "translate3d(0," + shift + "px,0)";
      }
    }

    var heroImg = document.querySelector(".lp-hero__frame img");

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  function init() {
    setupReveal();
    setupScrollChrome();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
