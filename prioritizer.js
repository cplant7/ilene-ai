/* ilene.ai — AI Use Case Prioritization Tool */
(function () {
  "use strict";

  var KEY = "ilene-usecase-prioritizer-v1";
  var MAX = 12;
  var CRITERIA = [
    { id: "impact", name: "Business impact", hint: "1 minor, 5 significant" },
    { id: "fit", name: "Strategic fit", hint: "1 nice to have, 5 central" },
    { id: "feas", name: "Feasibility", hint: "1 major stretch, 5 straightforward" },
    { id: "data", name: "Data readiness", hint: "1 not available, 5 ready" },
    { id: "risk", name: "Risk", hint: "1 low, 5 high" }
  ];
  var QUAD = {
    start: { label: "Start now", order: 0, next: "Confirm a named owner, set a baseline and scope a time-boxed pilot with clear success measures." },
    plan: { label: "Plan and prepare", order: 1, next: "High value, but not ready to build. Close the gaps below before committing delivery budget." },
    later: { label: "Fit in if capacity allows", order: 2, next: "Easy to deliver with limited value. Pursue it only if it does not draw capacity from higher-value work, or bundle it with related work." },
    park: { label: "Park", order: 3, next: "Low value and hard to deliver today. Revisit when priorities, data or available technology change." }
  };
  var EXAMPLES = [
    { name: "Customer inquiry triage and routing", impact: 4, fit: 4, feas: 4, data: 4, risk: 2 },
    { name: "Invoice and document processing", impact: 4, fit: 3, feas: 4, data: 3, risk: 2 },
    { name: "Demand forecasting for planning", impact: 5, fit: 5, feas: 2, data: 2, risk: 3 },
    { name: "Internal policy question assistant", impact: 2, fit: 3, feas: 5, data: 4, risk: 2 },
    { name: "Automated screening of job applicants", impact: 3, fit: 2, feas: 3, data: 2, risk: 5 }
  ];

  var $ = function (id) { return document.getElementById(id); };
  var list = $("pzList"), dots = $("pzDots"), rank = $("pzRank");
  var items = [], seq = 0, openId = null;

  /* ---------- storage (per browser, optional) ---------- */
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(items.map(strip))); } catch (e) { /* storage unavailable */ }
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : null;
    } catch (e) { return null; }
  }
  function strip(it) {
    var o = { name: it.name, example: !!it.example };
    CRITERIA.forEach(function (c) { o[c.id] = it[c.id]; });
    return o;
  }
  function clampRating(v) { v = Math.round(+v); return v >= 1 && v <= 5 ? v : 3; }
  function make(src, example) {
    var it = { id: ++seq, name: String(src.name || "").slice(0, 90), example: !!example };
    CRITERIA.forEach(function (c) { it[c.id] = clampRating(src[c.id]); });
    return it;
  }

  /* ---------- scoring ---------- */
  function score(it) {
    var value = (it.impact + it.fit) / 2;
    var ease = (it.feas + it.data + (6 - it.risk)) / 3;
    var q = value >= 3 ? (ease >= 3 ? "start" : "plan") : (ease >= 3 ? "later" : "park");
    var flags = [];
    if (it.data <= 2) flags.push(["Data gap.", "Confirm the data exists, is accessible and is fit for purpose before design starts."]);
    if (it.risk >= 4) flags.push(["Elevated risk.", "Route through governance review and define human oversight before build."]);
    if (it.feas <= 2) flags.push(["Delivery gap.", "Confirm skills, budget and the integration path are available."]);
    if (it.impact >= 4 && it.fit <= 2) flags.push(["Alignment check.", "Strong potential impact, but a weak link to stated priorities. Confirm leadership support."]);
    if (it.fit >= 4 && it.impact <= 2) flags.push(["Impact check.", "Aligned with priorities, but the business case is thin. Define how value will be measured."]);
    return { value: value, ease: ease, priority: value * ease, q: q, flags: flags };
  }
  function displayName(it, i) { return it.name.trim() || "Untitled use case " + (i + 1); }
  function fmt(n) { return (Math.round(n * 10) / 10).toFixed(1); }

  /* ---------- cards ---------- */
  var CHEV = '<svg class="pz-chev" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 7l5 5 5-5"/></svg>';
  function esc(s) { return String(s).replace(/[&<>"']/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]; }); }

  function cardHTML(it) {
    var crit = CRITERIA.map(function (c) {
      var opts = "";
      for (var v = 1; v <= 5; v++) {
        opts += '<label><input type="radio" name="r' + it.id + "-" + c.id + '" value="' + v + '" data-crit="' + c.id + '"' + (it[c.id] === v ? " checked" : "") + '><span>' + v + "</span></label>";
      }
      return '<div class="pz-crit' + (c.id === "risk" ? " risk" : "") + '"><div class="pz-crit-label"><b>' + c.name + "</b><span>" + c.hint + '</span></div><fieldset class="pz-rate"><legend>' + c.name + "</legend>" + opts + "</fieldset></div>";
    }).join("");
    return '<summary><span class="pz-num"></span><span class="pz-sum-name"><span class="pz-sum-text"></span><small></small></span><span class="pz-tag"></span>' + CHEV + "</summary>" +
      '<div class="pz-body"><div class="pz-name-field"><label for="n' + it.id + '">Use case</label><input id="n' + it.id + '" type="text" maxlength="90" placeholder="For example, contract review support" value="' + esc(it.name) + '"></div>' +
      crit + '<div class="pz-card-foot"><span class="pz-card-scores"></span><button class="pz-remove" type="button">Remove</button></div></div>';
  }

  function buildCards() {
    list.innerHTML = "";
    items.forEach(function (it) {
      var d = document.createElement("details");
      d.className = "pz-card";
      d.dataset.id = it.id;
      d.innerHTML = cardHTML(it);
      if (it.id === openId) d.open = true;
      d.addEventListener("toggle", function () {
        if (d.open) {
          openId = it.id;
          Array.prototype.forEach.call(list.children, function (o) { if (o !== d) o.open = false; });
        } else if (openId === it.id) { openId = null; }
      });
      d.querySelector("input[type=text]").addEventListener("input", function (e) {
        it.name = e.target.value; it.example = false; update(false);
      });
      d.querySelectorAll("input[type=radio]").forEach(function (r) {
        r.addEventListener("change", function () { it[r.dataset.crit] = +r.value; update(false); });
      });
      d.querySelector(".pz-remove").addEventListener("click", function () {
        items = items.filter(function (x) { return x !== it; });
        if (openId === it.id) openId = null;
        buildCards(); update(true);
      });
      list.appendChild(d);
    });
    $("pzAdd").disabled = items.length >= MAX;
    $("pzAdd").querySelector("span").textContent = items.length >= MAX ? "Maximum of " + MAX + " use cases" : "Add a use case";
  }

  function focusCard(id) {
    var d = list.querySelector('[data-id="' + id + '"]');
    if (!d) return;
    d.open = true;
    d.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    d.classList.remove("flash"); void d.offsetWidth; d.classList.add("flash");
  }

  /* ---------- matrix ---------- */
  function pos(v) { return 12 + ((v - 1) / 4) * 76; }
  function placeDots(scored, popId) {
    var existing = {};
    Array.prototype.forEach.call(dots.children, function (b) { existing[b.dataset.id] = b; });
    var buckets = {};
    scored.forEach(function (s) {
      // keep a point that sits exactly on a midline visibly inside its quadrant
      var x = pos(s.sc.ease), y = 100 - pos(s.sc.value);
      if (s.sc.ease >= 3 && x < 53) x = Math.max(x, 53);
      if (s.sc.value >= 3 && y > 47) y = Math.min(y, 47);
      x = Math.min(90, Math.max(10, x)); y = Math.min(88, Math.max(14, y));
      var key = Math.round(x / 4) + ":" + Math.round(y / 4);
      (buckets[key] = buckets[key] || []).push({ s: s, x: x, y: y });
    });
    var seen = {};
    Object.keys(buckets).forEach(function (k) {
      var group = buckets[k];
      group.forEach(function (g, i) {
        var dx = 0, dy = 0;
        if (group.length > 1) { var a = (i / group.length) * Math.PI * 2; dx = Math.cos(a) * 16; dy = Math.sin(a) * 16; }
        var id = String(g.s.it.id);
        seen[id] = true;
        var b = existing[id];
        if (!b) {
          b = document.createElement("button");
          b.type = "button"; b.className = "pz-dot"; b.dataset.id = id;
          b.innerHTML = '<span class="pz-n"></span><span class="pz-tip"></span>';
          b.addEventListener("click", function () { focusCard(+id); });
          dots.appendChild(b);
          if (popId !== false) b.classList.add("pop");
        }
        b.dataset.q = g.s.sc.q;
        b.style.left = "calc(" + g.x + "% + " + dx + "px)";
        b.style.top = "calc(" + g.y + "% + " + dy + "px)";
        b.querySelector(".pz-n").textContent = g.s.n;
        b.querySelector(".pz-tip").textContent = g.s.label;
        b.setAttribute("aria-label", g.s.n + ". " + g.s.label + ", " + QUAD[g.s.sc.q].label + ". Open to edit.");
      });
    });
    Object.keys(existing).forEach(function (id) { if (!seen[id]) existing[id].remove(); });
  }

  /* ---------- update everything ---------- */
  function update(rebuildRank) {
    var scored = items.map(function (it, i) {
      return { it: it, n: i + 1, label: displayName(it, i), sc: score(it) };
    });

    // cards
    scored.forEach(function (s) {
      var d = list.querySelector('[data-id="' + s.it.id + '"]');
      if (!d) return;
      d.dataset.q = s.sc.q;
      d.querySelector(".pz-num").textContent = s.n;
      d.querySelector(".pz-sum-text").textContent = s.label;
      d.querySelector("small").textContent = s.it.example ? "Example" : "Value " + fmt(s.sc.value) + ", ease " + fmt(s.sc.ease);
      d.querySelector(".pz-tag").textContent = QUAD[s.sc.q].label;
      d.querySelector(".pz-card-scores").innerHTML = "Value <b>" + fmt(s.sc.value) + "</b> &middot; Ease <b>" + fmt(s.sc.ease) + "</b> &middot; Priority <b>" + fmt(s.sc.priority) + "</b> of 25";
    });

    // quadrant counts
    var counts = { start: 0, plan: 0, later: 0, park: 0 };
    scored.forEach(function (s) { counts[s.sc.q]++; });
    document.querySelectorAll(".pz-q").forEach(function (q) {
      var c = counts[q.dataset.quad];
      q.querySelector("em").textContent = c;
      q.classList.toggle("has", c > 0);
    });
    placeDots(scored);

    // summary
    var n = scored.length;
    var sum = $("pzSummary");
    if (!n) { sum.textContent = "No use cases yet. Add one to see where it lands."; }
    else {
      var flagged = scored.filter(function (s) { return s.sc.flags.length; }).length;
      sum.innerHTML = "Of <b>" + n + "</b> use case" + (n === 1 ? "" : "s") + ", <b>" + counts.start + "</b> " + (counts.start === 1 ? "is" : "are") + " ready to start, <b>" + counts.plan + "</b> need" + (counts.plan === 1 ? "s" : "") + " preparation, <b>" + counts.later + "</b> can wait for spare capacity and <b>" + counts.park + "</b> should be parked." +
        (flagged ? " <b>" + flagged + "</b> carr" + (flagged === 1 ? "ies" : "y") + " a gap to close first." : "");
    }

    // ranked list
    var ranked = scored.slice().sort(function (a, b) {
      return QUAD[a.sc.q].order - QUAD[b.sc.q].order || b.sc.priority - a.sc.priority || a.n - b.n;
    });
    $("pzEmpty").hidden = n > 0;
    var html = ranked.map(function (s, i) {
      var flags = s.sc.flags.length ? '<ul class="pz-flags">' + s.sc.flags.map(function (f) { return "<li><span><b>" + f[0] + "</b> " + f[1] + "</span></li>"; }).join("") + "</ul>" : "";
      return '<li data-q="' + s.sc.q + '" style="animation-delay:' + (rebuildRank ? i * 50 : 0) + 'ms">' +
        '<span class="pz-pos">' + (i + 1) + "</span>" +
        "<div><h3>" + esc(s.label) + '</h3><span class="pz-tag">' + QUAD[s.sc.q].label + "</span></div>" +
        '<div class="pz-next-wrap"><p class="pz-next">' + QUAD[s.sc.q].next + "</p>" + flags + "</div>" +
        '<div class="pz-score"><b>' + fmt(s.sc.priority) + '</b><span>of 25</span><div class="pz-meter"><i style="width:' + (s.sc.priority / 25 * 100).toFixed(1) + '%"></i></div></div></li>';
    }).join("");
    if (rebuildRank || rank.dataset.sig !== sig(ranked)) {
      rank.innerHTML = html;
      rank.dataset.sig = sig(ranked);
    } else {
      rank.innerHTML = html.replace(/animation-delay:\d+ms/g, "animation:none");
    }
    save();
  }
  function sig(r) { return r.map(function (s) { return s.it.id + s.sc.q; }).join("|"); }

  /* ---------- summary text for copy ---------- */
  function summaryText() {
    var scored = items.map(function (it, i) { return { it: it, n: i + 1, label: displayName(it, i), sc: score(it) }; });
    scored.sort(function (a, b) { return QUAD[a.sc.q].order - QUAD[b.sc.q].order || b.sc.priority - a.sc.priority; });
    var lines = ["AI use case shortlist (ilene.ai AI Use Case Prioritization Tool)", ""];
    scored.forEach(function (s, i) {
      lines.push((i + 1) + ". " + s.label + " | " + QUAD[s.sc.q].label + " | priority " + fmt(s.sc.priority) + " of 25 (value " + fmt(s.sc.value) + ", ease " + fmt(s.sc.ease) + ")");
      lines.push("   Next step: " + QUAD[s.sc.q].next);
      s.sc.flags.forEach(function (f) { lines.push("   " + f[0] + " " + f[1]); });
    });
    lines.push("", "Directional only. Results reflect the ratings entered. https://ilene.ai/use-case-prioritizer.html");
    return lines.join("\n");
  }

  /* ---------- controls ---------- */
  $("pzAdd").addEventListener("click", function () {
    if (items.length >= MAX) return;
    var it = make({ name: "", impact: 3, fit: 3, feas: 3, data: 3, risk: 3 }, false);
    items.push(it); openId = it.id;
    buildCards(); update(true);
    var d = list.querySelector('[data-id="' + it.id + '"]');
    if (d) { d.scrollIntoView({ block: "nearest" }); d.querySelector("input[type=text]").focus({ preventScroll: true }); }
  });
  $("pzReset").addEventListener("click", function () {
    items = EXAMPLES.map(function (e) { return make(e, true); });
    openId = items[0].id; buildCards(); update(true);
  });
  $("pzClear").addEventListener("click", function () {
    if (items.length && !confirm("Remove all use cases from this list?")) return;
    items = []; openId = null; buildCards(); update(true);
  });
  $("pzPrint").addEventListener("click", function () { window.print(); });
  $("pzCopy").addEventListener("click", function () {
    var btn = this, text = summaryText();
    var done = function (ok) { var old = "Copy summary"; btn.textContent = ok ? "Copied" : "Copy not available"; setTimeout(function () { btn.textContent = old; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else { done(false); }
  });

  /* ---------- start ---------- */
  var stored = load();
  if (stored) { items = stored.slice(0, MAX).map(function (s) { return make(s, s.example); }); }
  else { items = EXAMPLES.map(function (e) { return make(e, true); }); }
  if (items.length) openId = items[0].id;
  buildCards();
  update(true);

  // expose for automated checks
  window.__pz = { score: score, items: function () { return items; }, summaryText: summaryText };
})();
