/* =========================================================================
   Ebru Subutay — Portfolio
   Shared vanilla JS: footer year, mobile nav, blog list, photo gallery+lightbox.
   Every block is feature-detected so each page only runs what it needs.
   ========================================================================= */
(function () {
  "use strict";

  /* ---- Footer year ---------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Demo videos: autoplay only when motion is allowed -------------- */
  // Videos ship WITHOUT the `autoplay` attribute. We add it (and start
  // playback) only when the user has not requested reduced motion, so the
  // poster still image is shown instead of a moving clip otherwise.
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("video[data-autoplay]").forEach(function (v) {
    v.muted = true; // required for programmatic autoplay in browsers
    if (reduceMotion) return;
    v.setAttribute("autoplay", "");
    var p = v.play();
    if (p && typeof p.catch === "function") p.catch(function () {});
  });

  /* ---- Theme toggle (dark / light) ----------------------------------- */
  // The no-flash inline <head> script already set data-theme before paint.
  // Here we just wire the pill switch and persist the choice.
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    var syncThemeBtn = function () {
      var isDark =
        (document.documentElement.getAttribute("data-theme") || "dark") !==
        "light";
      // aria-pressed reflects "dark mode is on".
      themeBtn.setAttribute("aria-pressed", String(isDark));
      themeBtn.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
    };
    syncThemeBtn();
    themeBtn.addEventListener("click", function () {
      var next =
        (document.documentElement.getAttribute("data-theme") || "dark") ===
        "light"
          ? "dark"
          : "light";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
      syncThemeBtn();
    });
  }

  /* ---- Mobile nav (hamburger drops the rail panel) ------------------- */
  var burger = document.getElementById("nav-burger");
  var panel = document.getElementById("nav-panel");
  if (burger && panel) {
    burger.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    // Close the panel after navigating on mobile.
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        panel.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Open menu");
      }
    });
  }

  /* =====================================================================
     BLOG: render post cards from a single editable array.
     To add a post: append an object below and (optionally) create its page.
     ===================================================================== */
  var blogMount = document.getElementById("post-list");
  if (blogMount) {
    var posts = [
      {
        title: "Bounding Boxes vs Segmentation: the best way to turn 2D objects to 3D",
        date: "2026-01-19",
        readtime: "6 min",
        tag: "stereo-vision",
        excerpt:
          "Do segmentation masks or bounding boxes better estimate object distance when lifting 2D detections into 3D? A hands-on comparison — and why neither wins outright: it depends on the depth source, sampling, and metrics.",
        url: "https://medium.com/@subutayebru/bounding-boxes-vs-segmentation-the-best-way-to-turn-2d-objects-to-3d-dbc52601739c",
      },
    ];

    var fmtDate = function (iso) {
      var d = new Date(iso + "T00:00:00");
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    var frag = document.createDocumentFragment();
    posts.forEach(function (p) {
      var a = document.createElement("a");
      a.className = "post-card";
      a.href = p.url;
      if (p.url === "#") {
        a.setAttribute("aria-disabled", "true");
        a.title = "Draft — coming soon";
      } else if (/^https?:/.test(p.url)) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      a.innerHTML =
        '<div class="post-card__meta">' +
        '<time datetime="' + p.date + '">' + fmtDate(p.date) + "</time>" +
        '<span aria-hidden="true">•</span>' +
        "<span>" + p.readtime + " read</span>" +
        '<span class="tag-pill">' + p.tag + "</span>" +
        "</div>" +
        '<h2 class="post-card__title">' + p.title + "</h2>" +
        '<p class="post-card__excerpt">' + p.excerpt + "</p>";
      frag.appendChild(a);
    });
    blogMount.appendChild(frag);
  }

  /* =====================================================================
     PHOTOGRAPHY: render placeholder tiles + lightbox.
     To use real photos: set `src` on an item and the tile shows the image.
     Swap the whole list by editing this array only.
     ===================================================================== */
  var galleryMount = document.getElementById("gallery");
  if (galleryMount) {
    var photos = [
      { caption: "Field rig — stereo calibration", path: "assets/photos/01.jpg", src: null },
      { caption: "Lab — Franka arm setup",        path: "assets/photos/02.jpg", src: null },
      { caption: "Long exposure — city at night",  path: "assets/photos/03.jpg", src: null },
      { caption: "Macro — sensor board detail",    path: "assets/photos/04.jpg", src: null },
      { caption: "On location — depth test scene", path: "assets/photos/05.jpg", src: null },
      { caption: "Travel — coastline panorama",    path: "assets/photos/06.jpg", src: null },
    ];

    var lb = document.getElementById("lightbox");
    var lbStage = document.getElementById("lb-stage");
    var lbCap = document.getElementById("lb-cap");
    var lbClose = document.getElementById("lb-close");
    var lbPrev = document.getElementById("lb-prev");
    var lbNext = document.getElementById("lb-next");
    var current = 0;
    var lastFocused = null;

    var tileMarkup = function (p) {
      if (p.src) {
        return '<img src="' + p.src + '" alt="' + p.caption + '">';
      }
      return (
        '<div class="photo__tile" role="img" aria-label="Placeholder for ' +
        p.caption + '">' +
        '<span class="ph-label">Coming soon</span>' +
        "</div>"
      );
    };

    var gfrag = document.createDocumentFragment();
    photos.forEach(function (p, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "photo";
      btn.setAttribute("aria-haspopup", "dialog");
      btn.innerHTML =
        tileMarkup(p) +
        '<span class="photo__cap"><span>' + p.caption + "</span>" +
        '<span class="idx">' + String(i + 1).padStart(2, "0") +
        "/" + String(photos.length).padStart(2, "0") + "</span></span>";
      btn.addEventListener("click", function () { openLightbox(i); });
      gfrag.appendChild(btn);
    });
    galleryMount.appendChild(gfrag);

    function renderStage(i) {
      var p = photos[i];
      if (p.src) {
        lbStage.innerHTML = '<img src="' + p.src + '" alt="' + p.caption + '">';
      } else {
        lbStage.innerHTML =
          '<span class="ph-label">Photo coming soon</span>';
      }
      lbCap.textContent =
        p.caption + "  (" + (i + 1) + "/" + photos.length + ")";
    }

    function openLightbox(i) {
      current = i;
      lastFocused = document.activeElement;
      renderStage(i);
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      lbClose.focus();
      document.addEventListener("keydown", onKey);
    }
    function closeLightbox() {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      document.removeEventListener("keydown", onKey);
      if (lastFocused) lastFocused.focus();
    }
    function step(d) {
      current = (current + d + photos.length) % photos.length;
      renderStage(current);
    }
    function onKey(e) {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    }

    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    if (lbPrev) lbPrev.addEventListener("click", function () { step(-1); });
    if (lbNext) lbNext.addEventListener("click", function () { step(1); });
    if (lb)
      lb.addEventListener("click", function (e) {
        if (e.target === lb) closeLightbox();
      });
  }

  /* =====================================================================
     HOME HERO — ASCII / dot-matrix "veil" (canvas background).
     A faint grid of monospace glyphs at very low opacity, gently twinkling
     behind the oversized name — atmosphere for the hero's negative space,
     kept to a whisper so the minimal / elegant look is preserved.
     Theme-aware: recolors when the dark/light toggle flips data-theme.
     Performance-light:
       • throttled to ~16 fps via timestamp gating
       • cell count capped (dynamic cell size targets ~6.5k cells)
       • paused when the tab is hidden or the hero scrolls off-screen
       • prefers-reduced-motion → a single static frame, no loop
     Decorative + aria-hidden; the headline reads above it via the scrim.
     Feature-detected, so interior pages (no #hero-veil) skip this entirely.
     ===================================================================== */
  var veil = document.getElementById("hero-veil");
  if (veil && veil.getContext) {
    var vctx = veil.getContext("2d");
    var hero = veil.closest(".hero") || veil.parentElement;
    var glyphs = ["·", "·", ":", "+", "*", "#", "░", "▒", ".", " "];
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var mono =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font-mono")
        .trim() || "monospace";

    // Per-theme palettes. Light stays even fainter; orange flares minimal.
    var THEMES = {
      dark: {
        glyph: "237,237,237",
        aCenter: 0.09, aAmp: 0.05,   // 0.04 .. 0.14
        flareThresh: 0.985,
        flareA: 0.30,
        accent: "224,101,31",        // #E0651F
      },
      light: {
        glyph: "70,70,70",
        aCenter: 0.05, aAmp: 0.03,   // 0.02 .. 0.08
        flareThresh: 0.992,
        flareA: 0.13,
        accent: "194,65,12",         // #C2410C
      },
    };

    var getTheme = function () {
      return document.documentElement.getAttribute("data-theme") === "light"
        ? "light"
        : "dark";
    };
    var theme = getTheme();

    var cell = 16, cols = 0, rows = 0, dpr = 1;
    var seeds = null, chars = null, lastT = 1200;

    function build() {
      var rect = hero.getBoundingClientRect();
      var w = Math.max(1, Math.floor(rect.width));
      var h = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Dynamic cell size caps total cell count (~6.5k) regardless of viewport.
      cell = Math.max(16, Math.round(Math.sqrt((w * h) / 6500)));
      veil.width = Math.floor(w * dpr);
      veil.height = Math.floor(h * dpr);
      veil.style.width = w + "px";
      veil.style.height = h + "px";
      vctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
      var total = cols * rows;
      seeds = new Float32Array(total);
      chars = new Uint8Array(total);
      for (var i = 0; i < total; i++) {
        seeds[i] = Math.random() * Math.PI * 2;
        chars[i] = Math.floor(Math.random() * glyphs.length);
      }
      vctx.font = (cell - 4) + "px " + mono;
      vctx.textBaseline = "top";
    }

    function draw(t) {
      lastT = t;
      var T = THEMES[theme];
      var wpx = veil.width / dpr, hpx = veil.height / dpr;
      vctx.clearRect(0, 0, wpx, hpx);
      var idx = 0;
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++, idx++) {
          var s = seeds[idx];
          var b = T.aCenter + T.aAmp * Math.sin(t * 0.0011 + s);   // twinkle
          var flare = Math.sin(t * 0.0007 + s * 1.7) > T.flareThresh;
          var a = flare ? T.flareA : b;
          if (a < 0.03) continue;
          vctx.fillStyle =
            "rgba(" + (flare ? T.accent : T.glyph) + "," + a.toFixed(3) + ")";
          vctx.fillText(glyphs[chars[idx]], x * cell, y * cell);
        }
      }
    }

    var last = 0, raf = 0, running = false, visible = true;
    var FRAME = 1000 / 16;

    function loop(t) {
      if (!running) return;
      if (t - last >= FRAME) { last = t; draw(t); }
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (running || reduce.matches || !visible) return;
      running = true; last = 0; raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    build();
    if (reduce.matches) draw(1200);   // single static frame, no loop
    else start();

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
      }, { threshold: 0.01 }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else if (visible) start();
    });

    var rt = 0;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        build();
        if (reduce.matches || !running) draw(lastT);
      }, 150);
    });

    // Rebuild once web fonts settle — the hero height can shift after load.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        build();
        if (reduce.matches || !running) draw(lastT);
      });
    }

    // Recolor when the dark/light toggle flips data-theme on <html>. When the
    // loop is running it already reads `theme` each frame; this redraws the
    // static frame for the paused / reduced-motion case.
    if ("MutationObserver" in window) {
      new MutationObserver(function () {
        theme = getTheme();
        if (reduce.matches || !running) draw(lastT);
      }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    }

    if (reduce.addEventListener) {
      reduce.addEventListener("change", function () {
        if (reduce.matches) { stop(); build(); draw(lastT); }
        else start();
      });
    }
  }
})();
