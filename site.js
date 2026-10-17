/* ilene.ai site behaviour and motion. No dependencies. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  if (!reduce) doc.classList.add("js-motion");

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function onVisible(el, cb, opts) {
    if (!("IntersectionObserver" in window)) { cb(true); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { cb(e.isIntersecting, e); });
    }, opts || { threshold: 0.15 });
    io.observe(el);
    return io;
  }

  /* ---------- header ---------- */
  var head = $(".site-head");
  if (head) {
    var setScrolled = function () { head.classList.toggle("scrolled", window.scrollY > 8); };
    setScrolled();
    window.addEventListener("scroll", setScrolled, { passive: true });
    var menuBtn = $(".menu-btn", head), nav = $(".nav", head);
    if (menuBtn && nav) {
      menuBtn.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
        menuBtn.textContent = open ? "Close" : "Menu";
      });
    }
  }

  /* ---------- reveal: only elements that start below the first screen ---------- */
  if (!reduce) {
    $$(".reveal").forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) return;
      el.classList.add("pre");
      el.style.transitionDelay = ((el.dataset.delay || 0) * 1) + "ms";
      onVisible(el, function (vis) { if (vis) el.classList.add("in"); }, { threshold: 0.12 });
    });
  }

  /* ---------- hero: tiles assemble into the power symbol ---------- */
  var stage = $("#stage");
  if (stage) buildStage(stage);

  function buildStage(stage) {
    var inner = $(".stage-inner", stage);
    // Geometry measured from the logo (656-unit artboard).
    var CX = 325, CY = 359, R = 258, GAP = 28, BOX_CX = 325, BOX_CY = 352, SCALE = 0.6 / 656;
    var targets = [];
    var ringCount = 20;
    var start = -90 + GAP, end = 270 - GAP;
    for (var i = 0; i < ringCount; i++) {
      var a = start + (end - start) * (i / (ringCount - 1));
      var rad = a * Math.PI / 180;
      targets.push({ u: CX + Math.cos(rad) * R, v: CY + Math.sin(rad) * R, rot: a + 90, ring: true, order: i });
    }
    var barTop = 70, barBottom = 236, barCount = 4;
    for (var j = 0; j < barCount; j++) {
      targets.push({ u: CX, v: barTop + (barBottom - barTop) * (j / (barCount - 1)), rot: 0, ring: false, order: j });
    }
    var tiles = targets.map(function (t) {
      var el = document.createElement("span");
      el.className = "tile" + (t.ring ? "" : " bar");
      el.style.left = (50 + (t.u - BOX_CX) * SCALE * 100) + "%";
      el.style.top = (50 + (t.v - BOX_CY) * SCALE * 100) + "%";
      el.style.transform = "translate(-50%,-50%) rotate(" + t.rot + "deg)";
      el.dataset.rot = t.rot;
      inner.appendChild(el);
      return { el: el, t: t };
    });
    var barTiles = tiles.filter(function (o) { return !o.t.ring; }).map(function (o) { return o.el; });
    var ringTiles = tiles.filter(function (o) { return o.t.ring; }).map(function (o) { return o.el; });

    // Switch on: the ring lights clockwise, then the bar (the "i") lights from the bottom up.
    function switchOn() {
      var step = reduce ? 0 : 38;
      ringTiles.forEach(function (el, k) { setTimeout(function () { el.classList.add("ring-on"); }, k * step); });
      var after = ringTiles.length * step + (reduce ? 0 : 120);
      barTiles.forEach(function (el, k) {
        setTimeout(function () { el.classList.add("lit"); }, after + (reduce ? 0 : 130 * (barTiles.length - 1 - k)));
      });
      setTimeout(function () { stage.classList.add("on"); }, after + (reduce ? 0 : 520));
    }

    if (reduce || !inner.animate) { switchOn(); return; }

    var w = stage.clientWidth || 480;
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var finished = 0;
    tiles.forEach(function (o) {
      var rot = o.el.dataset.rot;
      var dx = (rnd() - 0.5) * w * 1.4, dy = (rnd() - 0.5) * w * 1.1, dz = (rnd() - 0.2) * 480;
      var rz = (rnd() - 0.5) * 300;
      var delay = 300 + (o.t.ring ? o.t.order * 28 : 900 + o.t.order * 60) + rnd() * 80;
      var anim = o.el.animate([
        { transform: "translate(-50%,-50%) translate3d(" + dx + "px," + dy + "px," + dz + "px) rotate(" + rz + "deg)", opacity: 0 },
        { opacity: 1, offset: 0.3 },
        { transform: "translate(-50%,-50%) rotate(" + rot + "deg)", opacity: 1 }
      ], { duration: 1400, delay: delay, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
      anim.onfinish = function () { finished++; if (finished === tiles.length) { switchOn(); startShimmer(); } };
    });

    // The highlight travels clockwise. Each dot it passes melts into a solid line, so one lap
    // draws the ring as it appears in the logo. Back at the top, the bar pulses, the line breaks
    // back into dots, and the next lap begins.
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "orb-line"); svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("aria-hidden", "true");
    var px = function (u) { return 50 + (u - BOX_CX) * SCALE * 100; };
    var py = function (v) { return 50 + (v - BOX_CY) * SCALE * 100; };
    var rPct = R * SCALE * 100;
    var a0 = start * Math.PI / 180, a1 = end * Math.PI / 180;
    var arc = document.createElementNS(NS, "path");
    arc.setAttribute("d", "M" + px(CX + Math.cos(a0) * R) + " " + py(CY + Math.sin(a0) * R) +
      " A" + rPct + " " + rPct + " 0 1 1 " + px(CX + Math.cos(a1) * R) + " " + py(CY + Math.sin(a1) * R));
    svg.appendChild(arc);
    inner.appendChild(svg);
    var arcLen = arc.getTotalLength();
    arc.style.strokeDasharray = arcLen; arc.style.strokeDashoffset = arcLen;

    function startShimmer() {
      var running = true;
      onVisible(stage, function (vis) { running = vis; });
      var STEP = 95, LAP = ringTiles.length * STEP, HOLD = 2600;
      function lap() {
        if (!running || document.hidden) { setTimeout(lap, 1200); return; }
        svg.classList.add("on");
        arc.animate([{ strokeDashoffset: arcLen }, { strokeDashoffset: 0 }], { duration: LAP, easing: "linear", fill: "forwards" });
        ringTiles.forEach(function (el, k) {
          setTimeout(function () {
            el.classList.add("flash");
            setTimeout(function () { el.classList.remove("flash"); el.classList.add("merged"); }, 160);
          }, k * STEP);
        });
        setTimeout(reset, LAP + HOLD);
      }
      function reset() {
        barTiles.forEach(function (el) { el.classList.add("flash"); setTimeout(function () { el.classList.remove("flash"); }, 380); });
        svg.classList.remove("on");
        ringTiles.forEach(function (el, k) { setTimeout(function () { el.classList.remove("merged"); }, 120 + k * 18); });
        setTimeout(function () {
          arc.getAnimations().forEach(function (an) { an.cancel(); });
          arc.style.strokeDashoffset = arcLen;
          lap();
        }, 1300);
      }
      setTimeout(lap, 1800);
    }

    // Pointer parallax: the symbol leans toward the cursor.
    var hero = stage.closest(".hero") || stage;
    if (finePointer) {
      hero.addEventListener("pointermove", function (e) {
        var r = stage.getBoundingClientRect();
        var px = clamp((e.clientX - (r.left + r.width / 2)) / r.width, -1, 1);
        var py = clamp((e.clientY - (r.top + r.height / 2)) / r.height, -1, 1);
        inner.style.transform = "rotateY(" + (px * 14) + "deg) rotateX(" + (-py * 12) + "deg)";
      });
      hero.addEventListener("pointerleave", function () { inner.style.transform = ""; });
    }
  }

  /* ---------- solutions carousel (3D ring on desktop, swipe row on small screens) ---------- */
  var carousel = $("[data-carousel]");
  if (carousel) buildCarousel(carousel);

  function buildCarousel(root) {
    var ring = $(".carousel-ring", root);
    var cards = $$(".sol-card", root);
    var chips = $$("[data-go]", root.parentNode);
    var n = cards.length, idx = 0, timer = null, hovering = false, inView = false;
    var small = window.matchMedia("(max-width: 860px)");
    function layout() {
      if (small.matches) { cards.forEach(function (c) { c.style.transform = ""; c.style.zIndex = ""; c.style.opacity = ""; }); return; }
      var spread = Math.min(320, root.clientWidth * 0.27);
      cards.forEach(function (c, k) {
        var d = k - idx;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        var a = Math.abs(d);
        var jump = c._d !== undefined && Math.abs(c._d - d) > 2;
        c._d = d;
        if (jump) { c.style.transition = "none"; }
        c.style.transform = "translateX(" + (d * spread) + "px) translateZ(" + (-a * 190) + "px) rotateY(" + (-d * 24) + "deg)";
        c.style.zIndex = String(10 - a);
        c.style.opacity = a > 2 ? "0" : "1"; c.style.setProperty("--fade", String(a * 0.34));
        if (jump) { void c.offsetWidth; c.style.transition = ""; }
      });
    }
    function select(i, fromUser) {
      var next = ((i % n) + n) % n;
      // keep rotation continuous so the ring never spins the long way round
      idx = next;
      cards.forEach(function (c, k) {
        var on = k === idx;
        c.classList.toggle("active", on);
        c.setAttribute("tabindex", on ? "0" : "-1");
        c.setAttribute("aria-hidden", small.matches || on ? "false" : "true");
      });
      chips.forEach(function (c) { c.setAttribute("aria-pressed", (+c.dataset.go === idx) ? "true" : "false"); });
      if (small.matches && fromUser) cards[idx].scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest", inline: "start" });
      layout();
      if (fromUser) restart();
    }
    function restart() {
      clearInterval(timer);
      if (reduce || small.matches) return;
      timer = setInterval(function () { if (!hovering && inView && !document.hidden) select(idx + 1); }, 5200);
    }
    chips.forEach(function (c) { c.addEventListener("click", function () { select(+c.dataset.go, true); }); });
    var prev = $("[data-prev]", root.parentNode), next = $("[data-next]", root.parentNode);
    if (prev) prev.addEventListener("click", function () { select(idx - 1, true); });
    if (next) next.addEventListener("click", function () { select(idx + 1, true); });
    cards.forEach(function (c, k) {
      c.addEventListener("click", function (e) {
        if (small.matches) return;
        if (k !== idx) { e.preventDefault(); select(k, true); }
      });
    });
    root.addEventListener("pointerenter", function () { hovering = true; });
    root.addEventListener("pointerleave", function () { hovering = false; });
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { select(idx + 1, true); cards[idx].focus({ preventScroll: true }); }
      if (e.key === "ArrowLeft") { select(idx - 1, true); cards[idx].focus({ preventScroll: true }); }
    });
    // drag / swipe on desktop ring
    var downX = null;
    root.addEventListener("pointerdown", function (e) { if (!small.matches) downX = e.clientX; });
    window.addEventListener("pointerup", function (e) {
      if (downX === null) return;
      var d = e.clientX - downX; downX = null;
      if (Math.abs(d) > 50) select(idx + (d < 0 ? 1 : -1), true);
    });
    onVisible(root, function (vis) { inView = vis; }, { threshold: 0.35 });
    if (small.addEventListener) small.addEventListener("change", function () { select(idx); restart(); });
    window.addEventListener("resize", layout);
    select(0);
    restart();
  }

  /* ---------- data flow canvas ---------- */
  var dataCanvas = $("#dataflow");
  if (dataCanvas) buildDataFlow(dataCanvas);

  function buildDataFlow(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var LANES = 5, parts = [], running = false, raf = 0;
    var palette = { cream: "150,147,138", leaf: "238,234,222", amber: "215,179,122", rose: "196,132,120" };
    function size() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function laneY(l) { return H * (0.2 + 0.56 * (l / (LANES - 1))); }
    function spawn(p, anywhere) {
      p.x = anywhere ? Math.random() * W * 0.46 : -10 - Math.random() * 40;
      p.y = H * 0.1 + Math.random() * H * 0.72;
      p.vx = 0.25 + Math.random() * 0.5;
      p.vy = (Math.random() - 0.5) * 0.9;
      p.r = 1.4 + Math.random() * 3.2;
      p.lane = Math.floor(Math.random() * LANES);
      var k = Math.random();
      p.col = k < 0.62 ? palette.cream : (k < 0.82 ? palette.amber : palette.rose);
      p.a = 0.25 + Math.random() * 0.5;
      p.clean = false;
      return p;
    }
    function init() {
      size();
      var count = Math.round(clamp(W * 0.22, 70, 170));
      parts = [];
      for (var i = 0; i < count; i++) parts.push(spawn({}, true));
      // seed some already-clean particles so the first frame shows both sides
      for (var j = 0; j < count * 0.45; j++) {
        var p = spawn({}, false);
        p.x = W * 0.52 + Math.random() * W * 0.46; p.clean = true; p.y = laneY(p.lane); p.r = 2.6; p.col = palette.leaf; p.a = 0.9; p.vx = 1.1 + Math.random() * 0.3;
        parts.push(p);
      }
    }
    function drawGate() {
      var gx = W * 0.5;
      var g = ctx.createLinearGradient(gx - 30, 0, gx + 30, 0);
      g.addColorStop(0, "rgba(238,234,222,0)"); g.addColorStop(0.5, "rgba(238,234,222,0.16)"); g.addColorStop(1, "rgba(238,234,222,0)");
      ctx.fillStyle = g; ctx.fillRect(gx - 30, H * 0.08, 60, H * 0.76);
      ctx.strokeStyle = "rgba(238,234,222,0.55)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(gx, H * 0.1); ctx.lineTo(gx, H * 0.84); ctx.stroke();
      for (var l = 0; l < LANES; l++) {
        var y = laneY(l);
        ctx.strokeStyle = "rgba(238,234,222,0.12)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(W, y); ctx.stroke();
        ctx.fillStyle = "rgba(238,234,222,0.9)";
        ctx.beginPath(); ctx.arc(gx, y, 3, 0, Math.PI * 2); ctx.fill();
      }
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      drawGate();
      var gx = W * 0.5;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (!p.clean) {
          p.vy += (Math.random() - 0.5) * 0.18; p.vy *= 0.97;
          p.x += p.vx; p.y += p.vy;
          if (p.y < H * 0.08 || p.y > H * 0.84) p.vy *= -1;
          if (p.x > gx - 40) { // drawn toward its lane as it nears the gate
            var ty = laneY(p.lane); p.y += (ty - p.y) * 0.09; p.vy *= 0.8;
          }
          if (p.x >= gx) { p.clean = true; p.col = palette.leaf; p.vx = 1.1 + Math.random() * 0.3; }
        } else {
          p.y += (laneY(p.lane) - p.y) * 0.2;
          p.r += (2.6 - p.r) * 0.1; p.a += (0.9 - p.a) * 0.1;
          p.x += p.vx;
          if (p.x > W + 10) spawn(p, false);
        }
        ctx.fillStyle = "rgba(" + p.col + "," + p.a + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      if (running) raf = requestAnimationFrame(frame);
    }
    init();
    frame();
    if (reduce) return;
    onVisible(canvas, function (vis) {
      if (vis && !running) { running = true; raf = requestAnimationFrame(frame); }
      else if (!vis) { running = false; cancelAnimationFrame(raf); }
    }, { threshold: 0.05 });
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { init(); if (!running) frame(); }, 200); });
  }

  /* ---------- maturity radar (illustrative profiles) ---------- */
  $$("[data-radar]").forEach(buildRadar);

  function buildRadar(wrap) {
    var NS = "http://www.w3.org/2000/svg";
    var labels = [["Operational", "alignment"], ["Ownership &", "accountability"], ["Data & systems", "integration"], ["Revenue &", "efficiency linkage"], ["Leadership", "visibility"], ["Governance &", "risk controls"]];
    var stages = [
      { name: "Fragmented", v: [0.24, 0.16, 0.22, 0.14, 0.2, 0.12] },
      { name: "Emerging", v: [0.46, 0.34, 0.3, 0.42, 0.32, 0.28] },
      { name: "Aligned", v: [0.7, 0.62, 0.52, 0.74, 0.6, 0.46] },
      { name: "Optimized", v: [0.9, 0.86, 0.82, 0.92, 0.88, 0.85] }
    ];
    var cx = 320, cy = 226, R = 150, n = 6;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 640 452");
    svg.setAttribute("class", "radar");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Illustrative maturity profile across six dimensions, moving from Fragmented to Optimized");
    function pt(i, r) { var a = (-90 + i * 360 / n) * Math.PI / 180; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }
    function el(name, attrs, parent) { var e = document.createElementNS(NS, name); for (var k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; }
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      var d = ""; for (var i = 0; i < n; i++) { var p = pt(i, R * f); d += (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }
      el("path", { d: d + "Z", "class": "grid-ring" });
    });
    for (var i = 0; i < n; i++) {
      var p = pt(i, R); el("line", { x1: cx, y1: cy, x2: p[0], y2: p[1], "class": "axis" });
      var lp = pt(i, R + 26);
      var anchor = Math.abs(lp[0] - cx) < 4 ? "middle" : (lp[0] > cx ? "start" : "end");
      var t = el("text", { x: lp[0].toFixed(1), y: (lp[1] + (lp[1] < cy - 20 ? -14 : (lp[1] > cy + 20 ? 10 : -4))).toFixed(1), "text-anchor": anchor });
      labels[i].forEach(function (line, li) { var ts = el("tspan", { x: lp[0].toFixed(1), dy: li ? "16" : "0" }, t); ts.textContent = line; });
    }
    var shape = el("path", { "class": "shape" });
    var nodes = []; for (var k = 0; k < n; k++) nodes.push(el("circle", { r: 5, "class": "node" }));
    wrap.insertBefore(svg, wrap.firstChild);
    var pills = $$(".stage-pill", wrap);
    var cur = stages[0].v.slice(), si = 0;
    function draw(vals) {
      var d = ""; for (var i = 0; i < n; i++) { var p = pt(i, R * vals[i]); d += (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); nodes[i].setAttribute("cx", p[0].toFixed(1)); nodes[i].setAttribute("cy", p[1].toFixed(1)); }
      shape.setAttribute("d", d + "Z");
    }
    var doc = wrap.closest(".score-doc"), stageName = doc ? $("[data-stage-name]", doc) : null;
    function setPill(s) {
      pills.forEach(function (pl, k) { pl.classList.toggle("on", k === s); });
      if (stageName) stageName.textContent = stages[s].name;
    }
    var fixed = wrap.hasAttribute("data-radar-stage") ? +wrap.getAttribute("data-radar-stage") : null;
    if (reduce || fixed !== null) {
      si = fixed !== null ? fixed : 2; draw(stages[si].v); setPill(si);
      if (reduce) return;
    } else { draw(cur); setPill(0); }
    var visible = false, tween = null;
    function go(to) {
      var from = cur.slice(), target = stages[to].v, t0 = performance.now(), dur = 1300;
      setPill(to);
      cancelAnimationFrame(tween);
      (function step(now) {
        var t = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - t, 4);
        cur = from.map(function (f, i) { return f + (target[i] - f) * e; });
        draw(cur);
        if (t < 1) tween = requestAnimationFrame(step);
      })(t0);
      si = to;
    }
    wrap.goStage = go;
    if (fixed !== null) return;
    onVisible(wrap, function (vis) { visible = vis; }, { threshold: 0.3 });
    setInterval(function () { if (visible && !document.hidden) go((si + 1) % stages.length); }, 2900);
    pills.forEach(function (pl, k) { pl.style.cursor = "default"; });
  }

  /* ---------- method progress line ---------- */
  var method = $("[data-method]");
  if (method) {
    var steps = $$("li", method);
    var update = function () {
      var r = method.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : clamp((vh * 0.82 - r.top) / (r.height + vh * 0.25), 0, 1);
      method.style.setProperty("--p", p.toFixed(3));
      steps.forEach(function (li, i) { li.classList.toggle("lit", p >= (i / (steps.length - 1)) * 0.94); });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------- tabs (journey, maturity stages) ---------- */
  $$("[data-tabs]").forEach(function (root) {
    var tabs = $$("[role=tab]", root), panels = $$("[role=tabpanel]", root), bar = $(".journey-bar", root);
    var radar = root.getAttribute("data-radar-link") ? $(root.getAttribute("data-radar-link")) : null;
    function select(i, focus) {
      tabs.forEach(function (t, k) { t.setAttribute("aria-selected", k === i ? "true" : "false"); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach(function (p, k) {
        p.hidden = k !== i;
        if (k === i && !reduce) { p.classList.remove("swap"); void p.offsetWidth; p.classList.add("swap"); }
      });
      if (bar) bar.style.transform = "translateX(" + (i * 100) + "%)";
      if (focus) tabs[i].focus();
      if (radar && radar.goStage) radar.goStage(i);
    }
    // "Next stage" links inside each panel move to the following tab and keep it in view.
    $$("[data-go-tab]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var n = +b.getAttribute("data-go-tab"); select(n);
        var tl = $("[role=tablist]", root); if (tl) tl.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        if (tabs[n].scrollIntoView && tl && tl.scrollWidth > tl.clientWidth) tl.scrollTo({ left: tabs[n].offsetLeft - 16, behavior: reduce ? "auto" : "smooth" });
      });
    });
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") select((i + 1) % tabs.length, true);
        if (e.key === "ArrowLeft") select((i - 1 + tabs.length) % tabs.length, true);
      });
    });
    select(0);
  });

  /* ---------- solutions page: scroll spy + icon draw ---------- */
  var index = $(".sol-index");
  if (index) {
    var links = $$("a", index);
    var blocks = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);
    var spy = function () {
      var y = window.innerHeight * 0.3, active = 0;
      blocks.forEach(function (b, i) { if (b.getBoundingClientRect().top <= y) active = i; });
      links.forEach(function (a, i) { a.classList.toggle("active", i === active); });
    };
    spy();
    window.addEventListener("scroll", spy, { passive: true });
  }
  $$(".sol-block").forEach(function (b) {
    onVisible(b, function (vis) { if (vis) b.classList.add("drawn"); }, { threshold: 0.3 });
  });

  /* ---------- resource cards lean toward the pointer ---------- */
  if (finePointer && !reduce) {
    $$("[data-tilt]").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateY(" + (x * 5) + "deg) rotateX(" + (-y * 5) + "deg) translateY(-4px)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- bars that fill when seen ---------- */
  $$("[data-fill]").forEach(function (bar) {
    var target = bar.getAttribute("data-fill");
    if (reduce) { bar.style.setProperty("--w", target); return; }
    bar.style.setProperty("--w", "6%");
    onVisible(bar, function (vis) { if (vis) bar.style.setProperty("--w", target); });
  });

  /* ---------- copy buttons ---------- */
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () { var old = btn.textContent; btn.textContent = "Copied"; setTimeout(function () { btn.textContent = old; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { selectText(btn.previousElementSibling); });
      } else { selectText(btn.previousElementSibling); }
    });
  });
  function selectText(node) {
    if (!node) return;
    var range = document.createRange(); range.selectNodeContents(node);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
  }
})();
