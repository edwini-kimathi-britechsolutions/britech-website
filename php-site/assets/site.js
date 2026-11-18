/* Britech Solutions — public site behaviour (header, mobile menu, hero animation, reveals, product tabs). */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.remove("no-js");
  doc.classList.add("js");
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    /* ---------------------------- sticky header ---------------------------- */
    var header = document.querySelector("[data-header]");
    if (header) {
      var on = "border-navy-100 bg-white/85 shadow-sm backdrop-blur-lg".split(" ");
      var off = "border-transparent bg-white".split(" ");
      var onScroll = function () {
        var s = window.scrollY > 40;
        on.forEach(function (c) { header.classList.toggle(c, s); });
        off.forEach(function (c) { header.classList.toggle(c, !s); });
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* ----------------------------- mobile menu ----------------------------- */
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.getElementById("mobile-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("hidden") === false;
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.querySelector("[data-icon-open]").classList.toggle("hidden", open);
        toggle.querySelector("[data-icon-close]").classList.toggle("hidden", !open);
      });
    }

    /* ------------------- network field (hero background) ------------------- */
    var canvas = document.querySelector("canvas[data-network]");
    if (canvas && canvas.getContext) networkField(canvas);

    /* ----------------------------- rotating word --------------------------- */
    var rot = document.querySelector("[data-rotating]");
    if (rot && !reduced) {
      var words = rot.querySelectorAll("[data-word]");
      var underline = rot.querySelector("[data-underline]");
      var i = 0;
      setInterval(function () {
        var prev = words[i];
        i = (i + 1) % words.length;
        var next = words[i];
        prev.classList.remove("translate-x-0", "opacity-100");
        prev.classList.add("-translate-x-4", "opacity-0");
        prev.setAttribute("aria-hidden", "true");
        next.classList.remove("-translate-x-4", "opacity-0");
        next.classList.add("translate-x-0", "opacity-100");
        next.removeAttribute("aria-hidden");
        if (underline) {
          underline.classList.remove("animate-underline");
          void underline.offsetWidth; // restart the animation
          underline.classList.add("animate-underline");
        }
      }, 2600);
    }

    /* ------------------------ reveal + count-up on view -------------------- */
    var reveals = document.querySelectorAll("[data-reveal]");
    var counters = document.querySelectorAll("[data-count]");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          if (e.target.hasAttribute("data-count")) countUp(e.target);
          else e.target.classList.add("is-in");
        });
      }, { threshold: 0.15 });
      reveals.forEach(function (el) { io.observe(el); });
      counters.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("is-in"); });
    }

    /* ------------------------------ product tabs --------------------------- */
    document.querySelectorAll("[data-tabs]").forEach(function (root) {
      var tabs = root.querySelectorAll("[data-tab]");
      var panels = root.querySelectorAll("[data-panel]");
      var activeCls = "bg-white text-navy-900 shadow ring-1 ring-navy-100".split(" ");
      var idleCls = "text-navy-500 hover:text-navy-900".split(" ");
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var n = tab.getAttribute("data-tab");
          tabs.forEach(function (t) {
            var act = t === tab;
            t.setAttribute("aria-selected", act ? "true" : "false");
            activeCls.forEach(function (c) { t.classList.toggle(c, act); });
            idleCls.forEach(function (c) { t.classList.toggle(c, !act); });
          });
          panels.forEach(function (p) { p.classList.toggle("hidden", p.getAttribute("data-panel") !== n); });
        });
      });
    });

    /* ------------------- forms: disable button while sending ---------------- */
    document.querySelectorAll("form[data-pending-form]").forEach(function (form) {
      form.addEventListener("submit", function () {
        var btn = form.querySelector('button[type="submit"]');
        if (!btn) return;
        setTimeout(function () { btn.disabled = true; }, 0);
        var label = btn.getAttribute("data-pending-label");
        var span = btn.querySelector("span");
        if (label && span) span.textContent = label;
      });
    });
  });

  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var pre = el.getAttribute("data-prefix") || "";
    var suf = el.getAttribute("data-suffix") || "";
    if (reduced) return;
    var start = performance.now();
    var dur = 1600;
    function frame(t) {
      var p = Math.min((t - start) / dur, 1);
      el.textContent = pre + Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString() + suf;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* Drifting data nodes joined by faint links — connected systems. */
  function networkField(canvas) {
    var ctx = canvas.getContext("2d");
    var nodes = [], w = 0, h = 0, visible = true, LINK = 150;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function setup() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(90, Math.round((w * h) / 16000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, accent: Math.random() < 0.15 });
      }
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            var alpha = (1 - d / LINK) * 0.14;
            ctx.strokeStyle = a.accent || b.accent ? "rgba(1,99,154," + alpha * 1.6 + ")" : "rgba(25,29,64," + alpha + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      nodes.forEach(function (n) {
        ctx.fillStyle = n.accent ? "rgba(1,99,154,0.9)" : "rgba(25,29,64,0.25)";
        ctx.beginPath(); ctx.arc(n.x, n.y, n.accent ? 2.4 : 1.6, 0, Math.PI * 2); ctx.fill();
      });
    }
    function tick() {
      requestAnimationFrame(tick);
      if (!visible) return;
      nodes.forEach(function (n) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });
      draw();
    }
    setup();
    if ("ResizeObserver" in window) new ResizeObserver(setup).observe(canvas);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(canvas);
    if (!reduced) requestAnimationFrame(tick);
  }
})();
