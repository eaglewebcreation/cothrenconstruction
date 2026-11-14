/* Cothren Plumbing & Construction: the hero's 3D line-drawn house.
   A wireframe house, shop and porch, with the plumbing run drawn in red inside it.
   It draws itself in on load, then turns slowly and follows the pointer and the scroll.
   Plain canvas, no libraries. Reduced motion gets one still drawing. */
(function () {
  "use strict";
  var canvas = document.getElementById("house3d");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var wrap = canvas.parentNode;
  var labels = Array.prototype.slice.call(wrap.querySelectorAll("[data-at]"));
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- model (units are roughly feet / 3) ----------
  var S = []; // segments: [x1,y1,z1,x2,y2,z2,kind,order]
  var order = 0;
  function seg(a, b, kind) { S.push([a[0], a[1], a[2], b[0], b[1], b[2], kind || 0, order]); }
  function poly(pts, kind, closed) {
    for (var i = 0; i < pts.length - 1; i++) seg(pts[i], pts[i + 1], kind);
    if (closed !== false) seg(pts[pts.length - 1], pts[0], kind);
  }
  function box(x0, y0, z0, x1, y1, z1, kind) {
    poly([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], kind);
    poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], kind);
    seg([x0, y0, z0], [x0, y1, z0], kind); seg([x1, y0, z0], [x1, y1, z0], kind);
    seg([x1, y0, z1], [x1, y1, z1], kind); seg([x0, y0, z1], [x0, y1, z1], kind);
  }
  function rectZ(x0, y0, x1, y1, z, kind, mullion) { // window or door on a front/back wall
    poly([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], kind);
    if (mullion) { var mx = (x0 + x1) / 2, my = (y0 + y1) / 2; seg([mx, y0, z], [mx, y1, z], 2); seg([x0, my, z], [x1, my, z], 2); }
  }
  function rectX(z0, y0, z1, y1, x, kind, mullion) { // window on a side wall
    poly([[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]], kind);
    if (mullion) { var mz = (z0 + z1) / 2; seg([x, y0, mz], [x, y1, mz], 2); }
  }

  // 1. slab and footprint
  poly([[-0.6, 0, -2.6], [13.4, 0, -2.6], [13.4, 0, 6.6], [-0.6, 0, 6.6]], 2); order++;
  // 2. main house walls
  box(0, 0, 0, 8, 4, 6, 0); order++;
  // 3. framing studs on the back wall (light)
  for (var sx = 1; sx < 8; sx += 1) seg([sx, 0, 6], [sx, 4, 6], 2);
  order++;
  // 4. gable roof
  var rY = 6.6, eY = 3.7;
  poly([[-0.5, eY, -0.5], [8.5, eY, -0.5], [8.5, rY, 3], [-0.5, rY, 3]], 0);
  poly([[-0.5, eY, 6.5], [8.5, eY, 6.5], [8.5, rY, 3], [-0.5, rY, 3]], 0, false);
  seg([0, 4, 0], [0, rY - 0.15, 3], 0); seg([0, rY - 0.15, 3], [0, 4, 6], 0);
  seg([8, 4, 0], [8, rY - 0.15, 3], 0); seg([8, rY - 0.15, 3], [8, 4, 6], 0);
  for (var rx = 0.5; rx < 8.5; rx += 1) { seg([rx, eY, -0.5], [rx, rY, 3], 2); }
  order++;
  // 5. front gable over the porch
  poly([[2.2, 4, -0.02], [3.6, 5.5, -0.02], [5, 4, -0.02]], 0, false);
  seg([3.6, 5.5, -0.02], [3.6, 5.85, 1.6], 2);
  order++;
  // 6. chimney
  box(5.6, 5.2, 3.6, 6.4, 7.6, 4.4, 0); order++;
  // 7. shop / garage wing with shed roof
  box(8, 0, 1, 13, 3.4, 6, 0);
  poly([[7.9, 3.9, 0.6], [13.4, 3.4, 0.6], [13.4, 3.4, 6.4], [7.9, 3.9, 6.4]], 0);
  rectZ(8.8, 0, 12.2, 2.8, 1, 1);
  for (var gy = 0.7; gy < 2.8; gy += 0.7) seg([8.8, gy, 1], [12.2, gy, 1], 2);
  order++;
  // 8. windows and door
  rectZ(0.8, 1.4, 2.0, 3.0, 0, 1, true);
  rectZ(6.0, 1.4, 7.2, 3.0, 0, 1, true);
  rectZ(3.1, 0.6, 4.1, 3.1, 0, 1);
  seg([3.85, 1.8, 0], [3.85, 1.9, 0], 1);
  rectX(1.2, 1.4, 2.6, 3.0, 0, 1, true);
  rectX(3.6, 1.4, 5.0, 3.0, 0, 1, true);
  rectX(2.2, 1.2, 4.2, 2.8, 13, 1, true);
  order++;
  // 9. porch deck, posts, rail and steps
  poly([[1.2, 0.6, -2.2], [6.8, 0.6, -2.2], [6.8, 0.6, 0], [1.2, 0.6, 0]], 0, false);
  for (var px = 1.2; px <= 6.81; px += 1.4) { seg([px, 0, -2.2], [px, 0.6, -2.2], 2); seg([px, 0.6, -2.2], [px, 3.9, -2.2], 0); }
  seg([1.2, 1.6, -2.2], [3.0, 1.6, -2.2], 2); seg([5.0, 1.6, -2.2], [6.8, 1.6, -2.2], 2);
  poly([[1.0, 3.9, -2.4], [7.0, 3.9, -2.4], [7.0, 3.9, 0], [1.0, 3.9, 0]], 0, false);
  for (var st = 0; st < 3; st++) { var sy = 0.6 - st * 0.2, sz = -2.2 - st * 0.45; poly([[3.0, sy, sz], [5.0, sy, sz], [5.0, sy, sz - 0.45], [3.0, sy, sz - 0.45]], 2); }
  order++;
  // 10. the plumbing run (red, drawn last): water heater, supply lines, drain and vent stack
  var hx = 6.7, hz = 4.7, hr = 0.55;
  var ring = function (y) { var p = []; for (var a = 0; a < 12; a++) { var t = a / 12 * Math.PI * 2; p.push([hx + Math.cos(t) * hr, y, hz + Math.sin(t) * hr]); } return p; };
  poly(ring(0.05), 3); poly(ring(2.2), 3);
  for (var a2 = 0; a2 < 12; a2 += 3) { var t2 = a2 / 12 * Math.PI * 2; seg([hx + Math.cos(t2) * hr, 0.05, hz + Math.sin(t2) * hr], [hx + Math.cos(t2) * hr, 2.2, hz + Math.sin(t2) * hr], 3); }
  order++;
  var run = [[hx, 2.2, hz], [hx, 2.9, hz], [hx, 2.9, 5.6], [2.2, 2.9, 5.6], [2.2, 1.2, 5.6]];         // hot line to the kitchen sink
  poly(run, 3, false);
  poly([[hx - 0.3, 2.2, hz], [hx - 0.3, 2.6, hz], [hx - 0.3, 2.6, 2.4], [1.4, 2.6, 2.4], [1.4, 1.0, 2.4]], 3, false); // line to the bath
  order++;
  poly([[1.4, 0.4, 2.4], [1.4, 0.15, 2.4], [4.0, 0.15, 2.4], [4.0, 0.15, 3.2]], 3, false);      // drain
  poly([[2.2, 0.4, 5.6], [2.2, 0.15, 5.6], [4.0, 0.15, 5.6], [4.0, 0.15, 3.2]], 3, false);
  seg([4.0, 0.15, 3.2], [4.0, rY + 0.5, 3.2], 3);                                                 // vent stack through the roof
  seg([4.0, 0.15, 3.2], [4.0, -0.6, 3.2], 3);
  // fixtures: tub and sink outlines in light line
  poly([[0.3, 0.05, 1.4], [1.9, 0.05, 1.4], [1.9, 0.05, 3.2], [0.3, 0.05, 3.2]], 2);
  poly([[0.3, 0.9, 1.4], [1.9, 0.9, 1.4], [1.9, 0.9, 3.2], [0.3, 0.9, 3.2]], 2);
  poly([[1.6, 1.2, 5.3], [2.8, 1.2, 5.3], [2.8, 1.2, 5.9], [1.6, 1.2, 5.9]], 2);
  order++;
  var LAST = order;
  var CENTER = [6.4, 2.8, 2.0];

  // label anchor points (3D)
  var ANCH = {
    heater: [hx, 2.4, hz],
    shop: [12.6, 3.5, 3.4],
    roof: [2.0, 5.6, 1.8],
    vent: [4.0, rY + 0.5, 3.2]
  };

  // ---------- view ----------
  var W = 0, H = 0, dpr = 1;
  function size() {
    var r = wrap.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
  }

  var yaw = -0.62, pitch = 0.32, tYaw = yaw, tPitch = pitch;
  var pointer = { x: 0, y: 0 };
  var scrollTurn = 0;

  function project(p, cy, sy, cp, sp, scale) {
    var x = p[0] - CENTER[0], y = p[1] - CENTER[1], z = p[2] - CENTER[2];
    var x1 = x * cy - z * sy, z1 = x * sy + z * cy;          // turn
    var y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;         // tilt
    var dist = 30, f = dist / (dist + z2);
    return [W / 2 + x1 * scale * f, H * 0.56 - y2 * scale * f, z2];
  }

  var STYLE = [
    { w: 1.35, c: "11,11,12" },      // structure
    { w: 1.15, c: "11,11,12" },      // openings
    { w: 0.8, c: "11,11,12", a: 0.38 }, // light lines
    { w: 2.4, c: "232,38,37" }       // plumbing (red)
  ];

  var start = 0, BUILD = 2600;
  function draw(now) {
    var t = reduce ? 1 : Math.min(1, (now - start) / BUILD);
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    var scale = Math.min(W / 17.5, H / 11.5);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round"; ctx.lineJoin = "round";

    // soft ground shadow
    var g = project([CENTER[0], 0, CENTER[2] + 1], cy, sy, cp, sp, scale);
    var grad = ctx.createRadialGradient(g[0], g[1], 0, g[0], g[1], scale * 9);
    grad.addColorStop(0, "rgba(0,0,0,0.10)"); grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad; ctx.beginPath(); ctx.ellipse(g[0], g[1], scale * 9, scale * 2.6, 0, 0, Math.PI * 2); ctx.fill();

    for (var i = 0; i < S.length; i++) {
      var s = S[i];
      // each layer draws in after the one before it
      var local = t * (LAST + 1) - s[7];
      if (local <= 0) continue;
      var k = Math.min(1, local);
      var a = project([s[0], s[1], s[2]], cy, sy, cp, sp, scale);
      var b = project([s[3], s[4], s[5]], cy, sy, cp, sp, scale);
      var st = STYLE[s[6]];
      var depth = (a[2] + b[2]) / 2;
      var fade = Math.max(0.35, Math.min(1, 0.75 - depth / 22));
      ctx.strokeStyle = "rgba(" + st.c + "," + ((st.a || 1) * (s[6] === 3 ? 1 : fade)).toFixed(3) + ")";
      ctx.lineWidth = st.w;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k);
      ctx.stroke();
    }

    // water drop travelling along the hot line once the house is built
    if (t >= 1 && !reduce) {
      var pathPts = run, total = 0, lens = [];
      for (var j = 0; j < pathPts.length - 1; j++) { var d = Math.hypot(pathPts[j + 1][0] - pathPts[j][0], pathPts[j + 1][1] - pathPts[j][1], pathPts[j + 1][2] - pathPts[j][2]); lens.push(d); total += d; }
      var pos = ((now - start - BUILD) / 2600 % 1) * total, idx = 0;
      while (idx < lens.length - 1 && pos > lens[idx]) { pos -= lens[idx]; idx++; }
      var u = Math.min(1, pos / lens[idx]), A = pathPts[idx], B = pathPts[idx + 1];
      var dp = project([A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u], cy, sy, cp, sp, scale);
      ctx.fillStyle = "#E82625"; ctx.beginPath(); ctx.arc(dp[0], dp[1], 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(232,38,37,0.35)"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(dp[0], dp[1], 9, 0, Math.PI * 2); ctx.stroke();
    }

    // place the notes on their 3D points
    for (var l = 0; l < labels.length; l++) {
      var el = labels[l], p = ANCH[el.getAttribute("data-at")];
      if (!p) continue;
      var q = project(p, cy, sy, cp, sp, scale);
      el.style.transform = "translate(" + q[0].toFixed(1) + "px," + q[1].toFixed(1) + "px)";
      if (t >= 1) el.classList.add("on");
    }
  }

  // ---------- loop ----------
  var running = false, visible = true, raf = 0;
  function frame(now) {
    if (!start) start = now;
    var idle = Math.sin((now - start) / 5200) * 0.32;
    tYaw = -0.62 + idle + pointer.x * 0.45 + scrollTurn;
    tPitch = 0.30 + pointer.y * 0.12;
    yaw += (tYaw - yaw) * 0.06; pitch += (tPitch - pitch) * 0.06;
    draw(now);
    if (running) raf = requestAnimationFrame(frame);
  }
  function play() { if (running || reduce || !visible || document.hidden) return; running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  size();
  if (reduce) { draw(performance.now()); for (var r = 0; r < labels.length; r++) labels[r].classList.add("on"); }
  else play();

  window.addEventListener("resize", function () { size(); if (!running) draw(performance.now()); });
  wrap.addEventListener("pointermove", function (e) {
    var rc = wrap.getBoundingClientRect();
    pointer.x = ((e.clientX - rc.left) / rc.width - 0.5) * 2;
    pointer.y = ((e.clientY - rc.top) / rc.height - 0.5) * 2;
  });
  wrap.addEventListener("pointerleave", function () { pointer.x = 0; pointer.y = 0; });
  window.addEventListener("scroll", function () { scrollTurn = Math.min(window.scrollY, 900) / 900 * 0.9; }, { passive: true });
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else play(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) play(); else stop(); }).observe(wrap);
  }
})();
