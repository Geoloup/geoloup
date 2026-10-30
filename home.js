(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;

  /* ---------- Theme toggle ---------- */
  var toggle = document.getElementById("theme-toggle");

  function setToggleLabel() {
    if (!toggle) return;
    var isDark = root.getAttribute("data-theme") === "dark";
    toggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
  }

  if (toggle) {
    setToggleLabel();
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("geoloup-theme", next);
      } catch (e) {}
      setToggleLabel();
    });
  }

  /* ---------- Navbar border once the page scrolls ---------- */
  var navbar = document.getElementById("navbar");
  var cue = document.querySelector(".scroll-cue");
  function onScrollNavbar() {
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 8);
    if (cue) cue.classList.toggle("is-hidden", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScrollNavbar, { passive: true });
  onScrollNavbar();

  /* ---------- Nav: sliding pill + section tracking ---------- */
  var nav = document.getElementById("nav-links");
  if (nav) {
    var pill = nav.querySelector(".nav-pill");
    var navLinks = Array.prototype.slice.call(nav.querySelectorAll("a"));
    var linkFor = {};
    navLinks.forEach(function (l) {
      linkFor[l.getAttribute("data-section")] = l;
    });
    var current = navLinks[0];
    var hovered = null;

    function movePill(link) {
      if (!pill) return;
      if (!link) {
        pill.style.opacity = "0";
      } else {
        pill.style.width = link.offsetWidth + "px";
        pill.style.transform = "translateX(" + link.offsetLeft + "px)";
        pill.style.opacity = "1";
      }
      navLinks.forEach(function (l) {
        l.classList.toggle("on-pill", l === link);
      });
    }

    function setCurrent(link) {
      if (link === current) return;
      current = link;
      navLinks.forEach(function (l) {
        if (l === link) l.setAttribute("aria-current", "true");
        else l.removeAttribute("aria-current");
      });
      if (!hovered) movePill(current);
    }

    navLinks.forEach(function (link) {
      link.addEventListener("pointerenter", function () {
        hovered = link;
        movePill(link);
      });
      link.addEventListener("focus", function () {
        hovered = link;
        movePill(link);
      });
      link.addEventListener("blur", function () {
        hovered = null;
        movePill(current);
      });
    });
    nav.addEventListener("pointerleave", function () {
      hovered = null;
      movePill(current);
    });

    movePill(current);
    requestAnimationFrame(function () {
      if (pill) pill.classList.add("ready");
    });
    window.addEventListener("resize", function () {
      movePill(hovered || current);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        movePill(hovered || current);
      });
    }

    // The current section is the last one whose top has passed 40% of the screen
    var spyIds = ["hero", "services", "projects", "contact"];
    var spyFrame = null;

    function spy() {
      spyFrame = null;
      var probe = window.innerHeight * 0.4;
      var found = "hero";
      spyIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= probe) found = id;
      });
      var atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) found = "contact";
      setCurrent(linkFor[found] || null);
    }

    function requestSpy() {
      if (spyFrame === null) spyFrame = requestAnimationFrame(spy);
    }
    window.addEventListener("scroll", requestSpy, { passive: true });
    window.addEventListener("resize", requestSpy);
    spy();
  }

  /* ---------- Hero ---------- */
  var hero = document.getElementById("hero");
  var win = document.getElementById("win");
  var stage = document.getElementById("stage");

  /* Window tilt that follows the pointer */
  if (hero && win && stage && finePointer && !reduceMotion) {
    var tiltFrame = null;
    var tx = 0;
    var ty = 0;

    function tilt() {
      tiltFrame = null;
      var s = stage.getBoundingClientRect();
      var nx = (tx - (s.left + s.width / 2)) / (window.innerWidth / 2);
      var ny = (ty - (s.top + s.height / 2)) / (window.innerHeight / 2);
      nx = Math.max(-1, Math.min(1, nx));
      ny = Math.max(-1, Math.min(1, ny));
      win.style.setProperty("--ry", (nx * 9).toFixed(2) + "deg");
      win.style.setProperty("--rx", (ny * -7).toFixed(2) + "deg");
    }

    hero.addEventListener("pointermove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (tiltFrame === null) tiltFrame = requestAnimationFrame(tilt);
    });
    hero.addEventListener("pointerleave", function () {
      win.style.setProperty("--ry", "0deg");
      win.style.setProperty("--rx", "0deg");
    });
  }

  /* Window tabs: switch between projects */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".win-tab"));

  function showTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      var shot = document.getElementById(t.getAttribute("aria-controls"));
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.setAttribute("tabindex", on ? "0" : "-1");
      if (shot) {
        shot.hidden = !on;
        shot.classList.toggle("is-active", on);
      }
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      showTab(tab);
    });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next) {
        e.preventDefault();
        showTab(next);
        next.focus();
      }
    });
  });

  /* ---------- Animated background: drifting network ---------- */
  var canvas = document.getElementById("hero-bg");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;

  if (hero && canvas && ctx) {
    var LINK = 140;
    var REACH = 190;
    var w = 0;
    var h = 0;
    var nodes = [];
    var colors = { node: "#546a7b", accent: "#62929e" };
    var mouse = null;
    var visible = true;
    var running = false;
    var raf = 0;
    var last = 0;

    function readColors() {
      var cs = getComputedStyle(root);
      colors.node = cs.getPropertyValue("--hl-base").trim() || colors.node;
      colors.accent = cs.getPropertyValue("--accent").trim() || colors.accent;
    }

    function spawn() {
      var angle = Math.random() * Math.PI * 2;
      var speed = 8 + Math.random() * 16;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1 + Math.random() * 1.4
      };
    }

    function resize() {
      var rect = hero.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(28, Math.min(80, Math.round((w * h) / 17000)));
      while (nodes.length < count) nodes.push(spawn());
      nodes.length = count;
      if (!running) draw();
    }

    function step(dt) {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < -10) n.x = w + 10;
        else if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10;
        else if (n.y > h + 10) n.y = -10;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.node;
      var i;
      var j;
      var a;
      var b;
      var dx;
      var dy;
      var d;

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.x - b.x;
          dy = a.y - b.y;
          if (dx > LINK || dx < -LINK || dy > LINK || dy < -LINK) continue;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d >= LINK) continue;
          ctx.globalAlpha = (1 - d / LINK) * 0.45;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      if (mouse) {
        ctx.strokeStyle = colors.accent;
        for (i = 0; i < nodes.length; i++) {
          a = nodes[i];
          dx = a.x - mouse.x;
          dy = a.y - mouse.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d >= REACH) continue;
          ctx.globalAlpha = (1 - d / REACH) * 0.85;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 0.9;
      ctx.fillStyle = colors.node;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function frame(t) {
      raf = 0;
      if (!running) return;
      var dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    }

    function updateRunning() {
      running = visible && !reduceMotion && !document.hidden;
      if (running && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    readColors();
    resize();
    updateRunning();

    if ("ResizeObserver" in window) {
      new ResizeObserver(resize).observe(hero);
    } else {
      window.addEventListener("resize", resize);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        updateRunning();
      }).observe(hero);
    }
    document.addEventListener("visibilitychange", updateRunning);

    new MutationObserver(function () {
      readColors();
      if (!running) draw();
    }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    if (finePointer && !reduceMotion) {
      hero.addEventListener("pointermove", function (e) {
        var r = canvas.getBoundingClientRect();
        mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
      });
      hero.addEventListener("pointerleave", function () {
        mouse = null;
      });
    }
  }

  /* ---------- Custom cursor ---------- */
  /* Dot and ring are both placed straight from the pointer event, so
     nothing trails behind. The ring only animates its size. */
  var dot = document.getElementById("cursor-dot");
  var ring = document.getElementById("cursor-ring");

  if (dot && ring && finePointer) {
    root.classList.add("has-cursor");

    var shown = false;
    var seen = false;
    var interactive = "a, button, [role='tab'], .service, .frame";

    function place(x, y) {
      var t = "translate3d(" + x + "px," + y + "px,0) translate(-50%,-50%)";
      dot.style.transform = t;
      ring.style.transform = t;
    }

    function setShown(on) {
      shown = on;
      dot.classList.toggle("on", on);
      ring.classList.toggle("on", on);
    }

    document.addEventListener(
      "pointermove",
      function (e) {
        place(e.clientX, e.clientY);
        seen = true;
        if (!shown) setShown(true);
      },
      { passive: true }
    );

    document.addEventListener("pointerover", function (e) {
      var t = e.target;
      ring.classList.toggle("hot", !!(t && t.closest && t.closest(interactive)));
    });
    document.addEventListener("pointerdown", function () {
      ring.classList.add("down");
    });
    document.addEventListener("pointerup", function () {
      ring.classList.remove("down");
    });
    document.documentElement.addEventListener("mouseleave", function () {
      setShown(false);
    });
    document.documentElement.addEventListener("mouseenter", function () {
      if (seen) setShown(true);
    });
  }

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById("copy-mail");
  var status = document.getElementById("copy-status");

  if (copyBtn) {
    var original = copyBtn.textContent;
    var timer = null;

    function done(message) {
      copyBtn.textContent = message;
      if (status) status.textContent = message;
      clearTimeout(timer);
      timer = setTimeout(function () {
        copyBtn.textContent = original;
        if (status) status.textContent = "";
      }, 2000);
    }

    function fallbackCopy(text) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {}
      document.body.removeChild(area);
      return ok;
    }

    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(
          function () {
            done("Copied");
          },
          function () {
            done(fallbackCopy(email) ? "Copied" : "Copy failed");
          }
        );
      } else {
        done(fallbackCopy(email) ? "Copied" : "Copy failed");
      }
    });
  }
})();
