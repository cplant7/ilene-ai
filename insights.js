/* ilene.ai — Insights articles: reading progress, contents highlight, figure reveal. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var bar = document.querySelector(".art-progress");
  var art = document.querySelector(".art");
  if (bar && art && !reduce) {
    var tick = function () {
      var r = art.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.6;
      var done = Math.min(1, Math.max(0, -r.top / (total > 0 ? total : 1)));
      bar.style.transform = "scaleX(" + done + ")";
    };
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    tick();
  }
  var links = Array.prototype.slice.call(document.querySelectorAll(".art-toc a"));
  var heads = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);
  if (heads.length) {
    var spy = function () {
      var current = heads[0];
      heads.forEach(function (h) { if (h.getBoundingClientRect().top < 160) current = h; });
      links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + current.id); });
    };
    window.addEventListener("scroll", spy, { passive: true });
    spy();
  }
  var figs = document.querySelectorAll(".chain-fig");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("lit"); io.unobserve(e.target); } });
    }, { threshold: 0.35 });
    figs.forEach(function (f) { io.observe(f); });
  } else {
    figs.forEach(function (f) { f.classList.add("lit"); });
  }
})();
