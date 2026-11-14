/* Cothren Plumbing & Construction — page behaviour (no libraries) */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  // ---------- mobile menu ----------
  var menuBtn = $(".menu-btn"), nav = $("#nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") !== "true";
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("open", open);
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { menuBtn.setAttribute("aria-expanded", "false"); nav.classList.remove("open"); }); });
  }

  // ---------- reveal on scroll ----------
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("seen"); ro.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else revealEls.forEach(function (el) { el.classList.add("seen"); });

  // ---------- plumbing / building switch ----------
  var sw = $(".switch");
  if (sw) {
    var tabs = $$("[role=tab]", sw);
    tabs.forEach(function (t) {
      t.addEventListener("click", function () { pick(t); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var o = tabs[tabs.indexOf(t) ^ 1]; o.focus(); pick(o); }
      });
    });
    function pick(t) {
      tabs.forEach(function (x) {
        var on = x === t, p = document.getElementById(x.getAttribute("aria-controls"));
        x.setAttribute("aria-selected", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
        p.hidden = !on;
        p.classList.toggle("show", on);
      });
      sw.setAttribute("data-side", t.getAttribute("data-side"));
    }
  }

  // ---------- pressure gauges ----------
  var gauges = $$(".gauge");
  function runGauge(g) {
    var val = parseFloat(g.getAttribute("data-val")), max = parseFloat(g.getAttribute("data-max")) || val;
    var pct = Math.max(0, Math.min(1, val / max));
    var fill = $(".fill", g), needle = $(".needle", g), out = $("b", g);
    fill.style.strokeDashoffset = (188.5 * (1 - pct)).toFixed(1);
    needle.style.transform = "rotate(" + (-90 + 180 * pct).toFixed(1) + "deg)";
    var dec = (g.getAttribute("data-dec") | 0), suf = g.getAttribute("data-suf") || "", t0 = 0;
    if (reduce) { out.textContent = val.toFixed(dec) + suf; return; }
    function step(now) {
      if (!t0) t0 = now;
      var k = Math.min(1, (now - t0) / 1500); k = 1 - Math.pow(1 - k, 3);
      out.textContent = (val * k).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (gauges.length) {
    if ("IntersectionObserver" in window) {
      var go = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { runGauge(e.target); go.unobserve(e.target); } });
      }, { threshold: .4 });
      gauges.forEach(function (g) { go.observe(g); });
    } else gauges.forEach(runGauge);
  }

  // ---------- reviews carousel ----------
  $$(".carousel").forEach(function (car) {
    var track = $(".track", car), cards = $$(".rv", track);
    var prev = $(".prev", car), next = $(".next", car), pauseBtn = $(".pause", car);
    var flow = $(".flow i", car), count = $(".count", car);
    var i = 0, timer = 0, paused = reduce, hover = false;
    function perView() { var w = car.clientWidth, c = cards[0].getBoundingClientRect().width; return Math.max(1, Math.round(w / (c + 14))); }
    function maxI() { return Math.max(0, cards.length - perView()); }
    function go(n) {
      var m = maxI();
      i = n > m ? 0 : n < 0 ? m : n;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      var x = cards[i].offsetLeft - cards[0].offsetLeft;
      track.style.transform = "translateX(" + (-x) + "px)";
      var pv = perView();
      cards.forEach(function (c, k) {
        var vis = k >= i && k < i + pv;
        c.classList.toggle("dim", !vis);
        c.setAttribute("aria-hidden", vis ? "false" : "true");
      });
      var shown = Math.min(cards.length, i + pv);
      if (flow) flow.style.width = (shown / cards.length * 100).toFixed(1) + "%";
      if (count) count.textContent = shown + " / " + cards.length;
      void gap;
    }
    function tick() { clearTimeout(timer); if (!paused && !hover) timer = setTimeout(function () { go(i + 1); tick(); }, 6500); }
    prev.addEventListener("click", function () { go(i - 1); tick(); });
    next.addEventListener("click", function () { go(i + 1); tick(); });
    if (pauseBtn) {
      pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      pauseBtn.textContent = paused ? "▶" : "❚❚";
      pauseBtn.addEventListener("click", function () {
        paused = !paused;
        pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
        pauseBtn.setAttribute("aria-label", paused ? "Play reviews" : "Pause reviews");
        pauseBtn.textContent = paused ? "▶" : "❚❚";
        tick();
      });
    }
    car.addEventListener("mouseenter", function () { hover = true; clearTimeout(timer); });
    car.addEventListener("mouseleave", function () { hover = false; tick(); });
    car.addEventListener("focusin", function () { hover = true; clearTimeout(timer); });
    car.addEventListener("focusout", function () { hover = false; tick(); });
    car.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { go(i + 1); tick(); } else if (e.key === "ArrowLeft") { go(i - 1); tick(); }
    });
    // swipe
    var sx = null, sy = null;
    track.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; hover = true; clearTimeout(timer); }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(i + (dx < 0 ? 1 : -1));
      sx = null; hover = false; tick();
    }, { passive: true });
    var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { go(Math.min(i, maxI())); }, 150); });
    go(0); tick();
  });

  // ---------- drag-to-scroll photo strip ----------
  $$(".strip").forEach(function (st) {
    var down = false, x0 = 0, s0 = 0, moved = false;
    st.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = false; x0 = e.clientX; s0 = st.scrollLeft; st.classList.add("drag"); });
    window.addEventListener("pointermove", function (e) { if (!down) return; var d = e.clientX - x0; if (Math.abs(d) > 4) moved = true; st.scrollLeft = s0 - d; });
    window.addEventListener("pointerup", function () { if (!down) return; down = false; st.classList.remove("drag"); });
    st.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  // ---------- services page: side index follows the reader ----------
  var idx = $(".index");
  if (idx && "IntersectionObserver" in window) {
    var links = $$("a", idx), level = $(".level", idx);
    var groups = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var k = groups.indexOf(e.target);
        links.forEach(function (a, j) { a.classList.toggle("on", j <= k); });
        if (level) level.style.height = (links[k].offsetTop + links[k].offsetHeight) + "px";
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    groups.forEach(function (g) { if (g) io.observe(g); });
  }

  // ---------- work gallery: filters + lightbox ----------
  var gal = $(".gallery");
  if (gal) {
    var figs = $$("figure", gal), fbtns = $$(".filters button");
    fbtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-f");
        fbtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        figs.forEach(function (fg) { fg.classList.toggle("out", f !== "all" && fg.getAttribute("data-k").indexOf(f) < 0); });
        gal.classList.toggle("filtered", f !== "all");
        var empty = $(".gal-empty"), none = shownFigs().length === 0;
        if (empty) empty.hidden = !none;
        gal.hidden = none;
      });
    });
    var lb = $(".lightbox"), lbImg = $("img", lb), lbCap = $("p", lb), cur = 0, lastFocus = null;
    function shownFigs() { return figs.filter(function (f) { return !f.classList.contains("out"); }); }
    function openLb(fig) {
      var list = shownFigs(); cur = list.indexOf(fig);
      show(list[cur]); lastFocus = document.activeElement; lb.hidden = false; $(".x", lb).focus();
      document.body.style.overflow = "hidden";
    }
    function show(fig) { var im = $("img", fig); lbImg.src = im.getAttribute("data-full") || im.currentSrc || im.src; lbImg.alt = im.alt; lbCap.textContent = $("figcaption", fig).textContent; }
    function step(d) { var list = shownFigs(); cur = (cur + d + list.length) % list.length; show(list[cur]); }
    function close() { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
    figs.forEach(function (f) { $("button", f).addEventListener("click", function () { openLb(f); }); });
    $(".x", lb).addEventListener("click", close);
    $(".pv", lb).addEventListener("click", function () { step(-1); });
    $(".nx", lb).addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowRight") step(1); else if (e.key === "ArrowLeft") step(-1);
    });
  }

  // ---------- contact page: project vs job inquiry ----------
  var ftabs = $$(".tabs [role=tab]");
  function showForm(id) {
    ftabs.forEach(function (t) {
      var on = t.getAttribute("aria-controls") === id;
      t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  }
  ftabs.forEach(function (t) {
    t.addEventListener("click", function () { showForm(t.getAttribute("aria-controls")); history.replaceState(null, "", t.getAttribute("aria-controls") === "job-form" ? "#jobs" : location.pathname + location.search); });
    t.addEventListener("keydown", function (e) { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var o = ftabs[ftabs.indexOf(t) ^ 1]; o.focus(); o.click(); } });
  });
  if (ftabs.length && location.hash === "#jobs") showForm("job-form");
  // a quick pick on another page (?need=plumbing) preselects the job type
  var need = new URLSearchParams(location.search).get("need");
  if (need && /^[a-z-]+$/.test(need)) { var chip = $("input[name='Job type'][data-k='" + need + "']"); if (chip) chip.checked = true; }
  var urgent = $$("input[name='How soon']"), alertBox = $("#urgent-alert");
  urgent.forEach(function (r) { r.addEventListener("change", function () { if (alertBox) alertBox.hidden = !(r.checked && r.value.indexOf("Emergency") === 0); }); });

  // Both forms email the business through FormSubmit. FormSubmit sometimes delivers the email
  // but answers the page slowly, so after WAIT_MS the visitor gets a thank-you with the phone
  // number as a backup and the slow request is cancelled (a hung request can be resent twice).
  // FormSubmit's ajax endpoint ignores _honey, so the spam trap is checked here.
  var ENDPOINT = "https://formsubmit.co/ajax/cothrenplumbing@gmail.com";
  var WAIT_MS = 12000;
  var CALL = "<a href=\"tel:+13075787873\">(307) 578-7873</a>";
  function wire(formId, okText, slowText, failText) {
    var form = document.getElementById(formId);
    if (!form) return;
    var note = $(".form-note", form), sending = false;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = $("button[type=submit]", form), trap = form.elements["_honey"];
      if (trap && trap.value) { form.reset(); note.innerHTML = okText; note.hidden = false; return; }
      var data = new FormData(form); data.delete("_honey");
      var ctrl = window.AbortController ? new AbortController() : null, settled = false;
      sending = true; btn.disabled = true;
      var label = btn.innerHTML; btn.innerHTML = "Sending…";
      function finish(html, sent) {
        if (settled) return; settled = true; clearTimeout(timer);
        if (sent) form.reset();
        note.innerHTML = html; note.hidden = false;
        btn.disabled = false; btn.innerHTML = label; sending = false;
        if (alertBox) alertBox.hidden = true;
        note.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
      }
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); finish(slowText, true); }, WAIT_MS);
      fetch(ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" }, signal: ctrl ? ctrl.signal : undefined })
        .then(function (r) { if (!r.ok) throw new Error(); finish(okText, true); })
        .catch(function () { finish(failText, false); });
    });
  }
  wire("project-form",
    "Thanks! Your inquiry is on its way to Alex and Natalia. We'll get back to you soon. If water is coming in right now, call " + CALL + ".",
    "Thanks! Your inquiry is on its way. If you don't hear back soon, call or text " + CALL + ".",
    "That didn't send. Please call or text " + CALL + " and we'll take it from there.");
  wire("job-form",
    "Thanks for your interest! Natalia will reach out about next steps. You can also call or text her at <a href=\"tel:+13072723858\">(307) 272-3858</a>.",
    "Thanks! Your job inquiry is on its way. You can also call or text Natalia at <a href=\"tel:+13072723858\">(307) 272-3858</a>.",
    "That didn't send. Please call or text Natalia at <a href=\"tel:+13072723858\">(307) 272-3858</a>.");

  // ---------- footer year ----------
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
