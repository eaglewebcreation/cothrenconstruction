/* Cothren Plumbing & Construction: line-drawn 3D scenes for the inner page headers.
   data-scene="dig"   an excavator digging a trench and dumping on a pile (Services)
   data-scene="phone" an old rotary desk phone that rings and lifts its handset (Contact)
   Same blueprint style as the home hero. Plain canvas, no libraries.
   Each scene draws itself in, then loops. It pauses off screen, runs lighter on
   phones, and reduced motion gets one still drawing. */
(function () {
  "use strict";

  // ---------- small vector + geometry helpers ----------
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function rotY(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[2] * s, p[1], p[0] * s + p[2] * c]; }
  function rotX(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; }
  function rotZ(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; }
  function ease(u) { return u <= 0 ? 0 : u >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * u); }
  var D = Math.PI / 180;

  function Builder(map) {
    var S = [], o = 0, f = map || function (p) { return p; };
    var b = {
      S: S,
      next: function () { o++; },
      order: function () { return o; },
      seg: function (a, c, k) { var A = f(a), C = f(c); S.push([A[0], A[1], A[2], C[0], C[1], C[2], k || 0, o]); },
      poly: function (p, k, closed) {
        for (var i = 0; i < p.length - 1; i++) b.seg(p[i], p[i + 1], k);
        if (closed !== false) b.seg(p[p.length - 1], p[0], k);
      },
      box: function (x0, y0, z0, x1, y1, z1, k) {
        b.poly([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], k);
        b.poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], k);
        b.seg([x0, y0, z0], [x0, y1, z0], k); b.seg([x1, y0, z0], [x1, y1, z0], k);
        b.seg([x1, y0, z1], [x1, y1, z1], k); b.seg([x0, y0, z1], [x0, y1, z1], k);
      },
      // circle around c in the plane of unit vectors u and v
      circle: function (c, u, v, r, n, k, a0, a1) {
        var p = [], full = a0 === undefined;
        a0 = full ? 0 : a0; a1 = full ? Math.PI * 2 : a1;
        for (var i = 0; i <= n; i++) { var t = a0 + (a1 - a0) * i / n; p.push(add(c, add(mul(u, Math.cos(t) * r), mul(v, Math.sin(t) * r)))); }
        if (full) p.pop();
        b.poly(p, k, full);
        return p;
      },
      // the same outline at two depths, joined at each corner
      prism: function (pts, z0, z1, k, kj) {
        var A = pts.map(function (q) { return [q[0], q[1], z0]; }), B = pts.map(function (q) { return [q[0], q[1], z1]; });
        b.poly(A, k); b.poly(B, k);
        for (var i = 0; i < pts.length; i++) b.seg(A[i], B[i], kj === undefined ? k : kj);
      }
    };
    return b;
  }

  // =====================================================================
  // Scene 1: excavator digging
  // =====================================================================
  function digScene() {
    // static: ground, trench, spoil pile, tracks
    var st = Builder();
    [[-3.6, 2.9, -2.7], [-3.6, -2.9, -2.9]].forEach(function (g) { st.seg([g[0], 0, g[1]], [3.8, 0, g[2]], 2); });
    for (var gx = -3.2; gx < 3.6; gx += 0.9) st.seg([gx, 0, -2.75], [gx + 0.35, 0, -3.15], 2);
    st.next();
    // tracks and carbody
    function track(z0, z1) {
      var P = [[-3.1, 0.28], [-2.7, 0], [2.7, 0], [3.1, 0.28], [3.1, 0.78], [2.7, 1.02], [-2.7, 1.02], [-3.1, 0.78]];
      st.prism(P, z0, z1, 0, 2);
      for (var rx = -2.1; rx <= 2.11; rx += 0.84) st.circle([rx, 0.3, z1 + 0.01], [1, 0, 0], [0, 1, 0], 0.2, 10, 2);
      for (var sx = -2.6; sx <= 2.6; sx += 0.52) st.seg([sx, 1.02, z0], [sx, 1.02, z1], 2);
    }
    track(-2.35, -1.45); track(1.45, 2.35);
    st.box(-1.2, 0.5, -1.45, 1.2, 1.05, 1.45, 0);
    st.next();
    var orderHouse = st.order();
    // trench in front of the machine (arm plane sits at z = -0.9 when swing is 0)
    var tz0 = -1.75, tz1 = -0.05, tx0 = 5.5, tx1 = 8.7, tdep = -1.6;
    var tr = Builder();
    tr.poly([[tx0, 0, tz0], [tx1, 0, tz0], [tx1, 0, tz1], [tx0, 0, tz1]], 0);
    tr.poly([[tx0 + 0.3, tdep, tz0], [tx1 - 0.2, tdep, tz0], [tx1 - 0.2, tdep, tz1], [tx0 + 0.3, tdep, tz1]], 2);
    tr.seg([tx0, 0, tz0], [tx0 + 0.3, tdep, tz0], 2); tr.seg([tx1, 0, tz0], [tx1 - 0.2, tdep, tz0], 2);
    tr.seg([tx0, 0, tz1], [tx0 + 0.3, tdep, tz1], 2); tr.seg([tx1, 0, tz1], [tx1 - 0.2, tdep, tz1], 2);
    for (var hz = tz0 + 0.42; hz < tz1; hz += 0.42) tr.seg([tx1, 0, hz], [tx1 - 0.2, tdep, hz], 2);
    // spoil pile where the bucket dumps (swing 1.3 rad)
    var SW = -1.3, pile = rotY([7.6, 0, -0.9], SW);
    var PH = 1.25, PR = 1.9;
    for (var ri = 0; ri < 4; ri++) {
      var hy = ri * PH / 4, rr = PR * Math.pow(1 - hy / (PH + 0.15), 0.8);
      var pts = [];
      for (var a = 0; a < 18; a++) { var t = a / 18 * Math.PI * 2, wob = 1 + 0.06 * Math.sin(a * 2.3 + ri); pts.push([pile[0] + Math.cos(t) * rr * wob, hy, pile[2] + Math.sin(t) * rr * 0.8 * wob]); }
      tr.poly(pts, ri === 0 ? 0 : 2);
    }
    for (var pa = 0; pa < 7; pa++) {
      var tt = pa / 7 * Math.PI * 2;
      tr.poly([[pile[0] + Math.cos(tt) * PR, 0, pile[2] + Math.sin(tt) * PR * 0.8], [pile[0] + Math.cos(tt) * PR * 0.5, PH * 0.62, pile[2] + Math.sin(tt) * PR * 0.4], [pile[0], PH, pile[2]]], 2, false);
    }

    // keyframes: [time to reach (s), swing rad, boom deg, stick deg, bucket deg]
    var K = [
      [0.0, 0.0, 35, -40, -80],    // reach out
      [1.1, 0.0, 22, -75, -110],   // bite into the trench
      [2.1, 0.0, 26, -100, -200],  // drag and curl the bucket
      [3.0, 0.0, 50, -60, -210],   // lift the load
      [4.3, SW, 50, -60, -210],    // swing over the pile
      [5.0, SW, 48, -55, -60],     // dump
      [5.5, SW, 48, -55, -60],     // hold while it falls
      [6.9, 0.0, 40, -45, -80],    // swing back
      [7.4, 0.0, 35, -40, -80]     // ready for the next bite
    ];
    var CYCLE = 7.4;
    function pose(T) {
      var tm = ((T % CYCLE) + CYCLE) % CYCLE, i = 0;
      while (i < K.length - 2 && tm > K[i + 1][0]) i++;
      var A = K[i], B = K[i + 1], u = ease((tm - A[0]) / Math.max(0.001, B[0] - A[0]));
      return { sw: A[1] + (B[1] - A[1]) * u, a1: (A[2] + (B[2] - A[2]) * u) * D, s: (A[3] + (B[3] - A[3]) * u) * D, k: (A[4] + (B[4] - A[4]) * u) * D, tm: tm };
    }
    function dir(a) { return [Math.cos(a), Math.sin(a)]; }
    function p2(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k]; }
    var ZA = -0.9; // arm plane in the house frame
    function joints(P) {
      var P0 = [1.9, 1.9], L1 = 2.8, L2 = 2.4, L3 = 2.8;
      var J1 = p2(P0, dir(P.a1), L1), J2 = p2(J1, dir(P.a1 - 0.75), L2), J3 = p2(J2, dir(P.s), L3);
      return { P0: P0, J1: J1, J2: J2, J3: J3 };
    }
    function bucketPt(P, J, along, perp) {
      var u = dir(P.k), v = [-u[1], u[0]];
      return [J.J3[0] + u[0] * along + v[0] * perp, J.J3[1] + u[1] * along + v[1] * perp];
    }
    function world(P, x, y, z) { return add(rotY([x, y, z], P.sw), [0, 0, 0]); }

    function frame(T) {
      var P = pose(T), J = joints(P);
      var b = Builder(function (p) { return rotY(p, P.sw); });
      // walk the build order on from where the tracks ended
      for (var o = 0; o < orderHouse; o++) b.next();
      // turntable + deck
      b.circle([0, 1.1, 0], [1, 0, 0], [0, 0, 1], 1.3, 16, 2);
      b.box(-2.4, 1.15, -1.7, 2.2, 1.55, 1.7, 0);
      // counterweight: a curved back
      var cw = [];
      for (var c = 0; c <= 8; c++) { var ang = (-0.5 + c / 8) * Math.PI * 0.9; cw.push([-2.4 - Math.cos(ang) * 0.45, 0, Math.sin(ang) * 1.85]); }
      b.poly(cw.map(function (q) { return [q[0], 1.15, q[2]]; }), 0, false);
      b.poly(cw.map(function (q) { return [q[0], 2.35, q[2]]; }), 0, false);
      b.seg([cw[4][0], 1.15, 0], [cw[4][0], 2.35, 0], 2);
      // engine hood and exhaust
      b.box(-2.4, 1.55, -1.7, 0.0, 2.35, 1.7, 0);
      for (var vx = -2.0; vx < -0.3; vx += 0.35) b.seg([vx, 2.35, -1.3], [vx, 2.35, -0.5], 2);
      b.seg([-1.3, 2.35, -1.1], [-1.3, 3.15, -1.1], 0);
      b.box(0.0, 1.55, -1.7, 2.2, 1.95, -0.25, 2); // toolbox beside the boom
      b.next();
      // cab
      var cabP = [[0.1, 1.55], [2.05, 1.55], [2.05, 2.55], [1.75, 3.75], [0.1, 3.75]];
      b.prism(cabP, 0.2, 1.7, 0);
      b.poly([[0.4, 2.2, 1.71], [1.75, 2.2, 1.71], [1.75, 2.75, 1.71], [1.5, 3.5, 1.71], [0.4, 3.5, 1.71]], 1);
      b.seg([1.9, 2.6, 0.35], [1.62, 3.6, 0.35], 2); b.seg([1.9, 2.6, 1.55], [1.62, 3.6, 1.55], 2);
      b.seg([2.05, 2.1, 0.5], [2.05, 2.1, 1.4], 2);
      b.next();
      // boom: a bent beam, drawn at both side plates
      var zb0 = ZA - 0.24, zb1 = ZA + 0.24;
      var n1 = [-Math.sin(P.a1), Math.cos(P.a1)], n2 = [-Math.sin(P.a1 - 0.75), Math.cos(P.a1 - 0.75)];
      var nm = [(n1[0] + n2[0]) / 2, (n1[1] + n2[1]) / 2];
      var top = [p2(J.P0, n1, 0.18), p2(J.J1, nm, 0.3), p2(J.J2, n2, 0.15)];
      var bot = [p2(J.P0, n1, -0.18), p2(J.J1, nm, -0.26), p2(J.J2, n2, -0.15)];
      var boomOut = top.concat(bot.slice().reverse());
      var bp = boomOut.map(function (q) { return [q[0], q[1]]; });
      b.prism(bp, zb0, zb1, 4, 2);
      b.circle([J.P0[0], J.P0[1], zb1 + 0.01], [1, 0, 0], [0, 1, 0], 0.13, 8, 4);
      b.circle([J.J2[0], J.J2[1], zb1 + 0.01], [1, 0, 0], [0, 1, 0], 0.13, 8, 4);
      // boom cylinder
      var bc0 = [1.5, 1.55], bc1 = p2(p2(J.P0, dir(P.a1), 1.7), n1, -0.2);
      b.seg([bc0[0], bc0[1], ZA], [bc1[0], bc1[1], ZA], 1);
      b.next();
      // stick, with its heel behind the pin for the cylinder
      var sd = dir(P.s), sn = [-sd[1], sd[0]];
      var heel = p2(J.J2, sd, -0.55);
      var sp = [p2(heel, sn, 0.16), p2(J.J3, sn, 0.1), p2(J.J3, sn, -0.1), p2(heel, sn, -0.12)];
      b.prism(sp, ZA - 0.17, ZA + 0.17, 4, 2);
      var cyl0 = p2(J.J1, nm, 0.35);
      b.seg([cyl0[0], cyl0[1], ZA], [heel[0], heel[1], ZA], 1);
      // bucket: cup profile at both side walls, teeth on the lip
      var prof = [[0, 0], [0.22, 0.42], [0.62, 0.56], [1.02, 0.4], [1.25, 0.02], [0.9, -0.06], [0.42, -0.07]];
      var bpz = prof.map(function (q) { return bucketPt(P, J, q[0], q[1]); });
      b.prism(bpz, ZA - 0.44, ZA + 0.44, 4, 2);
      for (var tz = -0.33; tz <= 0.34; tz += 0.22) {
        var t0 = bucketPt(P, J, 1.25, 0.02), t1 = bucketPt(P, J, 1.45, -0.02);
        b.seg([t0[0], t0[1], ZA + tz], [t1[0], t1[1], ZA + tz], 4);
      }
      var bk0 = p2(J.J2, sd, 0.4), bk1 = bucketPt(P, J, 0.1, 0.36);
      b.seg([bk0[0] + sn[0] * 0.14, bk0[1] + sn[1] * 0.14, ZA], [bk1[0], bk1[1], ZA], 1);
      b.next();

      // dirt: a load in the curled bucket, and clods falling onto the pile
      var dots = [], tm = P.tm, loaded = tm > 1.9 && tm < 4.75;
      if (loaded) {
        for (var d = 0; d < 7; d++) {
          var q = bucketPt(P, J, 0.3 + d * 0.11, 0.18 + 0.12 * Math.sin(d * 1.7));
          dots.push([rotY([q[0], q[1], ZA - 0.3 + (d % 3) * 0.3], P.sw), 2.4 + (d % 2)]);
        }
      }
      if (tm > 4.55 && tm < 6.3) {
        for (var c2 = 0; c2 < 12; c2++) {
          var t0d = 4.6 + c2 * 0.06, age = tm - t0d;
          if (age < 0) continue;
          var Ps = pose(t0d), Js = joints(Ps), m = bucketPt(Ps, Js, 0.9, 0.2);
          var y = m[1] - 6.0 * age * age, floor = PH * 0.7;
          if (y < floor) continue;
          var drift = (c2 % 4 - 1.5) * 0.18 * age;
          dots.push([rotY([m[0] + drift, y, ZA - 0.3 + (c2 % 3) * 0.3], Ps.sw), 2 + (c2 % 3)]);
        }
      }
      return { S: b.S, dots: dots, last: b.order() };
    }

    var stat = st.S.concat(tr.S.map(function (s) { var c = s.slice(); c[7] = 7; return c; }));
    return {
      stat: stat,
      frame: frame,
      last: 8,
      still: 3.2,
      center: [3.2, 1.0, -3.2],
      dx: 2.4,
      fit: [15, 11.5],
      baseY: 0.56,
      yaw: 0.55, pitch: 0.36, sway: 0.16,
      anchors: { trench: [tx1, 0, tz1], pile: [pile[0], PH + 0.1, pile[2]] }
    };
  }

  // =====================================================================
  // Scene 2: rotary desk phone
  // =====================================================================
  function phoneScene() {
    var st = Builder();
    // plinth
    st.box(-2.3, 0, -2.6, 2.3, 0.3, 2.6, 0);
    st.next();
    // body: a side profile (z, y) that tapers in width toward the top
    var prof = [[2.55, 0.3], [2.35, 2.25], [1.15, 2.72], [-0.55, 2.72], [-2.45, 1.0], [-2.55, 0.3]];
    function half(y) { return 2.15 - 0.55 * (y - 0.3) / 2.42; }
    var R = prof.map(function (q) { return [half(q[1]), q[1], q[0]]; }), L = prof.map(function (q) { return [-half(q[1]), q[1], q[0]]; });
    st.poly(R, 0); st.poly(L, 0);
    for (var i = 0; i < prof.length; i++) st.seg(L[i], R[i], i === 0 || i === 5 ? 2 : 0);
    // a couple of light section lines across the body
    [1.2, 1.9].forEach(function (yy) {
      var w = half(yy);
      st.poly([[-w, yy, 2.45 - (yy - 0.3) * 0.1], [w, yy, 2.45 - (yy - 0.3) * 0.1]], 2, false);
    });
    st.next();
    // cradle horns and the two hook switch buttons
    [-1, 1].forEach(function (sx) {
      st.prism([[0.0, 2.72], [0.0, 3.05], [0.18, 3.3], [0.42, 3.3], [0.6, 3.05], [0.6, 2.72]].map(function (q) { return [q[0] - 0.05, q[1]]; }), sx * 0.85, sx * 1.3, 0, 2);
    });
    st.next();
    // dial on the sloped front
    var dz = -1.5, dy = 1.86;
    var dv = [0, -1.72, -1.9], dl = Math.hypot(dv[1], dv[2]); dv = [0, dv[1] / dl, dv[2] / dl];
    var nrm = [0, -dv[2], dv[1]];        // outward, front and up
    var C = add([0, dy, dz], mul(nrm, 0.12)), ux = [1, 0, 0];
    st.circle(C, ux, dv, 1.12, 28, 0);
    st.circle(add(C, mul(nrm, -0.1)), ux, dv, 1.12, 28, 2);
    st.circle(add(C, mul(nrm, 0.04)), ux, dv, 0.42, 16, 1);
    st.next();
    var orderHandset = st.order();

    var CYCLE = 6.4;
    function lift(tm) { // 0 resting, 1 fully up
      if (tm < 1.5) return 0;
      if (tm < 2.4) return ease((tm - 1.5) / 0.9);
      if (tm < 4.6) return 1;
      if (tm < 5.5) return 1 - ease((tm - 4.6) / 0.9);
      return 0;
    }
    function frame(T) {
      var tm = ((T % CYCLE) + CYCLE) % CYCLE, up = lift(tm);
      var ringing = tm < 1.5, buzz = ringing ? Math.sin(tm * 70) * 0.05 * Math.min(1, (1.5 - tm) * 4) : 0;
      var bob = up > 0.99 ? Math.sin((tm - 2.4) * 3) * 0.08 : 0;
      var hc = [0, 3.55, 0.25];
      function hs(p) {
        var q = [p[0] - hc[0], p[1] - hc[1], p[2] - hc[2]];
        q = rotZ(q, up * 0.22 + buzz * 0.6);
        q = rotX(q, -up * 0.42);
        q = rotY(q, up * 0.35);
        return [q[0] + hc[0], q[1] + hc[1] + up * 2.1 + bob + Math.abs(buzz), q[2] + hc[2] - up * 0.7];
      }
      var b = Builder(hs);
      for (var o = 0; o < orderHandset; o++) b.next();
      // dial finger wheel turns while the call comes in, then settles back
      var spin = (tm > 2.3 && tm < 4.4) ? Math.sin(ease((tm - 2.3) / 2.1) * Math.PI) * 1.4 : 0;
      var dB = Builder();
      for (var o2 = 0; o2 < orderHandset - 1; o2++) dB.next();
      for (var h = 0; h < 10; h++) {
        var ang = (65 + h * 27) * D + spin;
        var hcn = add(C, add(mul(ux, Math.cos(ang) * 0.8), mul(dv, Math.sin(ang) * 0.8)));
        dB.circle(add(hcn, mul(nrm, 0.03)), ux, dv, 0.15, 10, 4);
      }
      var stopA = 25 * D;
      dB.seg(add(C, add(mul(ux, Math.cos(stopA) * 0.95), mul(dv, Math.sin(stopA) * 0.95))), add(add(C, add(mul(ux, Math.cos(stopA) * 1.2), mul(dv, Math.sin(stopA) * 1.2))), mul(nrm, 0.25)), 4);
      // hook switch buttons rise when the handset leaves
      var pb = 2.72 + 0.28 * up;
      [-0.38, 0.38].forEach(function (bx) { dB.box(bx - 0.16, 2.72, 0.05, bx + 0.16, pb, 0.45, 2); });

      // handset: grip bar between the earpiece and mouthpiece cups
      b.prism([[-1.55, 3.32], [1.55, 3.32], [1.55, 3.78], [-1.55, 3.78]].map(function (q) { return [q[0], q[1]]; }), 0.0, 0.5, 0, 2);
      [-1, 1].forEach(function (sx) {
        var cx = sx * 2.15, cz = 0.25;
        // shoulder from the bar down to the cup
        b.seg([sx * 1.55, 3.78, 0.0], [cx, 3.5, cz - 0.55], 0); b.seg([sx * 1.55, 3.78, 0.5], [cx, 3.5, cz + 0.55], 0);
        b.seg([sx * 1.55, 3.32, 0.0], [cx - sx * 0.5, 3.1, cz - 0.3], 2); b.seg([sx * 1.55, 3.32, 0.5], [cx - sx * 0.5, 3.1, cz + 0.3], 2);
        var top = b.circle([cx, 3.5, cz], [1, 0, 0], [0, 0, 1], 0.6, 16, 0);
        var bot = b.circle([cx, 2.95, cz], [1, 0, 0], [0, 0, 1], 0.55, 16, 0);
        for (var k = 0; k < 16; k += 4) b.seg(hsInv(top[k]), hsInv(bot[k]), 2);
        b.circle([cx, 2.94, cz], [1, 0, 0], [0, 0, 1], 0.22, 10, 2);
      });
      function hsInv(p) { return p; } // circle() already returns local points
      b.next();

      // coiled cord from the mouthpiece down to the side of the base
      var A = hs([2.15, 2.95, 0.4]), Bp = [2.0, 0.95, 1.6];
      var mid = [Math.max(A[0], Bp[0]) + 1.3, Math.min(A[1], Bp[1]) - 0.5 + up * 0.9, (A[2] + Bp[2]) / 2 + 0.2];
      var cord = [], N = 90, turns = 15;
      for (var c = 0; c <= N; c++) {
        var u = c / N, iu = 1 - u;
        var p = [iu * iu * A[0] + 2 * iu * u * mid[0] + u * u * Bp[0], iu * iu * A[1] + 2 * iu * u * mid[1] + u * u * Bp[1], iu * iu * A[2] + 2 * iu * u * mid[2] + u * u * Bp[2]];
        var tg = [2 * iu * (mid[0] - A[0]) + 2 * u * (Bp[0] - mid[0]), 2 * iu * (mid[1] - A[1]) + 2 * u * (Bp[1] - mid[1]), 2 * iu * (mid[2] - A[2]) + 2 * u * (Bp[2] - mid[2])];
        var tl = Math.hypot(tg[0], tg[1], tg[2]) || 1; tg = mul(tg, 1 / tl);
        var e1 = [tg[1], -tg[0], 0], el = Math.hypot(e1[0], e1[1]) || 1; e1 = mul(e1, 1 / el);
        var e2 = [tg[1] * e1[2] - tg[2] * e1[1], tg[2] * e1[0] - tg[0] * e1[2], tg[0] * e1[1] - tg[1] * e1[0]];
        var th = u * turns * Math.PI * 2, rr = (u < 0.06 || u > 0.94) ? 0.04 : 0.17;
        cord.push(add(p, add(mul(e1, Math.cos(th) * rr), mul(e2, Math.sin(th) * rr))));
      }
      var cb = Builder();
      for (var o3 = 0; o3 < orderHandset + 1; o3++) cb.next();
      cb.poly(cord, 4, false);

      // ring lines while it rings
      if (ringing && Math.floor(tm * 6) % 2 === 0) {
        [-1, 1].forEach(function (sx) {
          for (var r = 0; r < 3; r++) {
            var rr2 = 0.55 + r * 0.38;
            cb.circle([sx * 2.9, 3.4, 0.25], [sx, 0, 0], [0, 1, 0], rr2, 8, 3, -0.7, 0.7);
          }
        });
      }
      return { S: dB.S.concat(b.S, cb.S), dots: [], last: orderHandset + 2 };
    }
    return {
      stat: st.S,
      frame: frame,
      last: orderHandset + 2,
      still: 3.4,
      center: [0, 3.0, 0],
      fit: [9.6, 9.0],
      baseY: 0.5,
      yaw: -0.5, pitch: 0.42, sway: 0.22,
      anchors: { dial: add(C, mul(ux, 1.15)) }
    };
  }

  // =====================================================================
  // Scene 3: the blueprint house from their current site (home hero).
  // Lines start scattered and fly into place, foundation first, roof last.
  // =====================================================================
  function blueprintScene() {
    var b = Builder();
    function rz(x0, y0, x1, y1, z, k, mx, my) { // rectangle on a front wall, with optional mullions
      b.poly([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], k);
      if (mx) for (var x = x0 + mx; x < x1 - 0.05; x += mx) b.seg([x, y0, z], [x, y1, z], 2);
      if (my) b.seg([x0, my, z], [x1, my, z], 2);
    }
    function rx(z0, y0, z1, y1, x, k, mz, my) { // rectangle on a side wall
      b.poly([[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]], k);
      if (mz) for (var z = z0 + mz; z < z1 - 0.05; z += mz) b.seg([x, y0, z], [x, y1, z], 2);
      if (my) b.seg([x, my, z0], [x, my, z1], 2);
    }
    // 0. terrace and site lines
    b.poly([[-4.2, 0, -4.4], [12.8, 0, -4.4], [12.8, 0, 9.6], [-4.2, 0, 9.6]], 2);
    b.seg([-7.6, 0, -2.9], [-4.2, 0, -2.9], 2); b.seg([-7.6, 0, -0.6], [-4.2, 0, -0.6], 2);
    b.seg([12.8, 0, 6.6], [12.8, 0, 11.4], 2); b.seg([10.4, 0, 9.6], [10.4, 0, 11.4], 2);
    b.next();
    // 1. walkout lower level
    b.box(0, 0, 0, 10, 2.4, 8, 0);
    rz(4.6, 0, 7.8, 2.0, -0.01, 1); b.seg([6.2, 0, -0.3], [6.2, 2.4, -0.3], 0);
    rz(0.7, 0.5, 3.0, 2.0, -0.01, 1, 0.77);
    for (var wz = 1; wz < 7.5; wz += 2) rx(wz, 1.45, wz + 1.0, 1.95, 10.01, 1);
    b.next();
    // 2. main floor slab and the front deck
    b.box(-0.3, 2.4, -0.6, 10.6, 2.75, 8.3, 0);
    b.poly([[-3.4, 2.6, -2.8], [4.4, 2.6, -2.8], [4.4, 2.6, -0.6], [-3.4, 2.6, -0.6]], 0);
    b.poly([[-3.4, 2.4, -2.8], [4.4, 2.4, -2.8]], 2, false);
    [-3.2, -1.1, 1.1, 3.2].forEach(function (px) { b.seg([px, 0, -2.6], [px, 4.9, -2.6], 0); });
    b.poly([[-3.4, 3.6, -0.6], [-3.4, 3.6, -2.8], [4.4, 3.6, -2.8]], 0, false);
    b.poly([[-3.4, 3.1, -2.8], [4.4, 3.1, -2.8]], 2, false);
    b.poly([[5.0, 3.7, -0.6], [10.6, 3.7, -0.6], [10.6, 3.7, 8.3]], 0, false);
    b.poly([[5.0, 3.2, -0.6], [10.6, 3.2, -0.6], [10.6, 3.2, 8.3]], 2, false);
    b.next();
    // 3. main floor walls, windows and the glass corner
    b.box(0, 2.75, 0, 10, 5.9, 8, 0);
    rz(0.8, 3.3, 2.0, 5.4, -0.01, 1, 0.6, 4.4);
    rz(3.0, 3.3, 4.4, 5.4, -0.01, 1, 0.7);
    rz(6.0, 2.9, 10, 5.7, -0.01, 1, 0.8, 4.4);
    rx(0, 2.9, 3.6, 5.7, 10.01, 1, 0.72, 4.4);
    rx(5.0, 3.4, 6.6, 5.4, 10.01, 1, 0.8);
    b.poly([[6.0, 4.55, -0.25], [10.25, 4.55, -0.25], [10.25, 4.55, 3.8]], 1, false);
    b.next();
    // 4. pergola over the deck
    b.seg([-3.6, 4.9, -2.6], [4.6, 4.9, -2.6], 0); b.seg([-3.6, 4.9, -0.05], [4.6, 4.9, -0.05], 0);
    for (var sx = -3.3; sx <= 4.4; sx += 0.42) b.seg([sx, 5.0, -3.0], [sx, 5.0, 0], 2);
    b.next();
    // 5. eaves and the main hip roof
    var E = 5.9;
    b.poly([[-1.0, E, -1.0], [11.0, E, -1.0], [11.0, E, 9.0], [-1.0, E, 9.0]], 0);
    b.poly([[-1.0, E - 0.25, -1.0], [11.0, E - 0.25, -1.0], [11.0, E - 0.25, 9.0]], 2, false);
    b.seg([3.5, 9.0, 4.0], [6.5, 9.0, 4.0], 0);
    b.seg([-1.0, E, -1.0], [3.5, 9.0, 4.0], 0); b.seg([11.0, E, -1.0], [6.5, 9.0, 4.0], 0);
    b.seg([11.0, E, 9.0], [6.5, 9.0, 4.0], 0); b.seg([-1.0, E, 9.0], [3.5, 9.0, 4.0], 0);
    for (var rr = 1; rr < 4; rr++) { var f = rr / 4; b.seg([-1 + 12 * f, E, -1.0], [3.5 + 3 * f, 9.0, 4.0], 2); }
    b.next();
    // 6. big front gable with the triangle window
    var GA = -1.5, ax = 2.2, ay = 10.7;
    b.poly([[-1.3, E, GA], [ax, ay, GA], [5.7, E, GA]], 0, false);
    b.poly([[-1.3, E - 0.3, GA + 0.05], [ax, ay - 0.42, GA + 0.05], [5.7, E - 0.3, GA + 0.05]], 2, false);
    b.seg([ax, ay, GA], [ax, ay, 2.6], 0);
    b.seg([-1.3, E, GA], [-1.0, E, -1.0], 0); b.seg([5.7, E, GA], [5.4, E, -1.0], 0);
    b.seg([5.4, E, -1.0], [ax + 1.4, 8.6, 2.6], 2); b.seg([ax, ay, 2.6], [3.5, 9.0, 4.0], 0);
    b.poly([[-0.1, 6.45, GA + 0.02], [ax, 9.55, GA + 0.02], [4.5, 6.45, GA + 0.02]], 1);
    b.poly([[0.8, 6.85, GA + 0.03], [ax, 8.75, GA + 0.03], [3.6, 6.85, GA + 0.03]], 1);
    b.seg([ax, 6.85, GA + 0.03], [ax, 8.75, GA + 0.03], 2);
    b.next();
    // 7. side gable with the arched window
    var GB = 11.4, bz = 4.0, by = 10.0;
    b.poly([[GB, E, 0.7], [GB, by, bz], [GB, E, 7.3]], 0, false);
    b.poly([[GB - 0.05, E - 0.3, 0.7], [GB - 0.05, by - 0.42, bz], [GB - 0.05, E - 0.3, 7.3]], 2, false);
    b.seg([GB, by, bz], [8.0, by, bz], 0); b.seg([8.0, by, bz], [6.5, 9.0, bz], 0);
    b.seg([GB, E, 0.7], [11.0, E, 0.7], 0); b.seg([GB, E, 7.3], [11.0, E, 7.3], 0);
    b.circle([GB - 0.02, 7.0, bz], [0, 0, 1], [0, 1, 0], 1.3, 12, 1, 0, Math.PI);
    b.circle([GB - 0.03, 7.0, bz], [0, 0, 1], [0, 1, 0], 0.95, 10, 2, 0, Math.PI);
    b.seg([GB - 0.02, 7.0, bz - 1.3], [GB - 0.02, 7.0, bz + 1.3], 1);
    b.seg([GB - 0.03, 7.0, bz], [GB - 0.03, 8.3, bz], 2);
    b.poly([[GB - 0.01, 6.3, 1.9], [GB - 0.01, 9.2, bz], [GB - 0.01, 6.3, 6.1]], 1, false);
    // skylight on the side roof
    b.poly([[8.9, 7.3, 1.9], [9.7, 7.3, 1.9], [9.7, 8.2, 2.6], [8.9, 8.2, 2.6]], 1);
    b.next();
    // 8. dormer and the two chimneys
    var dz = 0.7;
    b.poly([[5.8, 7.4, dz], [6.8, 8.7, dz], [7.8, 7.4, dz]], 0, false);
    rz(6.05, 6.5, 7.55, 7.4, dz, 0); rz(6.4, 6.65, 7.2, 7.25, dz - 0.01, 1);
    b.seg([6.8, 8.7, dz], [6.8, 8.7, 2.7], 0);
    b.seg([5.8, 7.4, dz], [5.8, 7.6, 2.5], 2); b.seg([7.8, 7.4, dz], [7.8, 7.6, 2.5], 2);
    b.box(4.4, 8.3, 4.6, 5.2, 10.9, 5.4, 0); b.box(4.25, 10.9, 4.45, 5.35, 11.2, 5.55, 0);
    b.box(7.6, 8.2, 5.4, 8.3, 10.5, 6.1, 0); b.box(7.45, 10.5, 5.25, 8.45, 10.8, 6.25, 0);
    b.next();
    // 9. stairs down from the deck (left) and along the side (right)
    for (var i = 0; i < 8; i++) {
      var x0 = -3.4 - i * 0.4, ty = 2.6 - (i + 1) * 0.325;
      b.poly([[x0, ty, -2.6], [x0 - 0.4, ty, -2.6], [x0 - 0.4, ty, -1.3], [x0, ty, -1.3]], 2);
      var z0 = 1.1 + i * 0.62, ry = 2.4 - (i + 1) * 0.3;
      b.poly([[10.8, ry, z0], [12.3, ry, z0], [12.3, ry, z0 + 0.62], [10.8, ry, z0 + 0.62]], 2);
    }
    b.seg([-3.4, 2.6, -2.6], [-6.6, 0, -2.6], 0); b.seg([-3.4, 2.6, -1.3], [-6.6, 0, -1.3], 0);
    b.seg([-3.4, 3.6, -2.7], [-6.6, 1.0, -2.7], 0);
    b.seg([10.8, 2.4, 1.1], [10.8, 0, 6.06], 0); b.seg([12.3, 2.4, 1.1], [12.3, 0, 6.06], 0);
    b.seg([12.4, 3.4, 1.1], [12.4, 1.0, 6.06], 0); b.seg([12.4, 1.0, 6.06], [12.4, 0, 6.06], 2);
    b.next();
    // 10. the plumbing, in red: water heater, supply run, drains and the vent stack
    var hx = 8.6, hz = 6.6, hr = 0.5;
    b.circle([hx, 0.05, hz], [1, 0, 0], [0, 0, 1], hr, 12, 3); b.circle([hx, 1.9, hz], [1, 0, 0], [0, 0, 1], hr, 12, 3);
    for (var a = 0; a < 4; a++) { var t = a / 4 * Math.PI * 2; b.seg([hx + Math.cos(t) * hr, 0.05, hz + Math.sin(t) * hr], [hx + Math.cos(t) * hr, 1.9, hz + Math.sin(t) * hr], 3); }
    var run = [[hx, 1.9, hz], [hx, 3.3, hz], [3.0, 3.3, hz], [3.0, 3.3, 3.0], [3.0, 2.95, 3.0]];
    b.poly(run, 3, false);
    b.poly([[3.0, 2.85, 3.0], [3.0, 0.2, 3.0], [5.6, 0.2, 3.5]], 3, false);
    b.seg([5.6, 0.2, 3.5], [5.6, 9.7, 3.5], 3);
    b.seg([5.6, 0.2, 3.5], [5.6, -0.7, 3.5], 3);
    b.next();
    var LAST = b.order();

    // where each line starts: scattered around the house, turned at random
    var rnd = (function (s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })(20231114);
    var seeds = b.S.map(function (s) {
      var th = rnd() * Math.PI * 2, ph = (rnd() - 0.5) * 1.6, dist = 5 + rnd() * 9;
      return {
        off: [Math.cos(th) * Math.cos(ph) * dist, Math.sin(ph) * dist * 0.7 + 2, Math.sin(th) * Math.cos(ph) * dist],
        r1: (rnd() - 0.5) * 4, r2: (rnd() - 0.5) * 3,
        d: Math.min(1, s[7] / (LAST + 1) * 0.8 + rnd() * 0.2)
      };
    });

    function frame(T) {
      // a drop of water runs the supply line once the house is together
      var total = 0, lens = [];
      for (var j = 0; j < run.length - 1; j++) { var dd = Math.hypot(run[j + 1][0] - run[j][0], run[j + 1][1] - run[j][1], run[j + 1][2] - run[j][2]); lens.push(dd); total += dd; }
      var pos = (T / 2.8 % 1) * total, idx = 0;
      while (idx < lens.length - 1 && pos > lens[idx]) { pos -= lens[idx]; idx++; }
      var u = Math.min(1, pos / lens[idx]), A = run[idx], B = run[idx + 1];
      return { S: [], dots: [[[A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u], 4, "232,38,37"]], last: LAST };
    }
    return {
      stat: b.S,
      seeds: seeds,
      fly: true,
      build: 4200,
      frame: frame,
      last: LAST,
      still: 0,
      center: [3.0, 4.6, 3.0],
      fit: [26, 18.5],
      baseY: 0.56,
      yaw: -0.72, pitch: 0.3, sway: 0.24, scroll: true,
      anchors: { roof: [ax, 8.2, GA], vent: [5.6, 9.7, 3.5], heater: [hx, 1.0, hz - hr], shop: [GB, 8.3, bz] }
    };
  }

  // =====================================================================
  // Scene 4: a checkmark with five stars set one by one in an arch (Our Work)
  // =====================================================================
  function checkScene() {
    var st = Builder();
    // the checkmark: one thick stroke, extruded
    var P1 = [-2.6, 0.8], V = [-1.0, -0.8], P2 = [2.6, 2.8], th = 0.68, s2 = Math.SQRT1_2;
    var ck = [[P1[0] - s2 * th, P1[1] + s2 * th], [V[0], V[1] + th * 1.414], [P2[0] - s2 * th, P2[1] + s2 * th], [P2[0] + s2 * th, P2[1] - s2 * th], [V[0], V[1] - th * 1.414], [P1[0] + s2 * th, P1[1] - s2 * th]];
    st.poly(ck.map(function (q) { return [q[0], q[1], -0.5]; }), 0);
    st.next();
    st.prism(ck, -0.5, 0.5, 0, 0);
    // a second, inset outline on the front face so it reads as a solid block
    var cx0 = 0, cy0 = 0; ck.forEach(function (q) { cx0 += q[0] / 6; cy0 += q[1] / 6; });
    st.poly(ck.map(function (q) { return [q[0] + (cx0 - q[0]) * 0.08, q[1] + (cy0 - q[1]) * 0.08, 0.51]; }), 2);
    st.next();
    // a faint ground line under it
    st.seg([-3.6, -1.9, 0], [3.6, -1.9, 0], 2);
    st.next();
    var orderStars = st.order();

    function starPts(cx, cy) {
      var p = [];
      for (var k = 0; k < 10; k++) { var a = Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 0.27 : 0.66; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
      return p;
    }
    var ARC = [150, 120, 90, 60, 30].map(function (d) { return [Math.cos(d * D) * 4.2, 1.9 + Math.sin(d * D) * 3.6]; });
    var CYCLE = 9.0;
    function frame(T) {
      var tm = ((T % CYCLE) + CYCLE) % CYCLE;
      var b = Builder();
      for (var o = 0; o < orderStars; o++) b.next();
      var leave = tm > 7.8 ? ease((tm - 7.8) / 0.8) : 0;
      for (var s = 0; s < 5; s++) {
        var t0 = 0.25 + s * 0.42, u = (tm - t0) / 0.55;
        if (u <= 0) continue;
        var e = u >= 1 ? 1 : 1 - Math.pow(1 - u, 3) * (1 - 1.7 * u * 0); // ease out
        var drop = (1 - e) * 3.2, spin = (1 - e) * Math.PI * 2 + (u >= 1 ? Math.sin((tm - t0) * 1.6 + s) * 0.18 : 0);
        var lift = leave * 3.5, c = ARC[s];
        var pts = starPts(0, 0);
        var front = [], back = [];
        for (var q = 0; q < pts.length; q++) {
          var f3 = rotY([pts[q][0], pts[q][1], 0.16], spin), b3 = rotY([pts[q][0], pts[q][1], -0.16], spin);
          front.push(add(f3, [c[0], c[1] + drop + lift, 0])); back.push(add(b3, [c[0], c[1] + drop + lift, 0]));
        }
        if (leave < 0.98) {
          b.poly(front, 4); b.poly(back, 2);
          for (var q2 = 0; q2 < front.length; q2 += 2) b.seg(front[q2], back[q2], 2);
        }
      }
      return { S: b.S, dots: [], last: orderStars + 1 };
    }
    return {
      stat: st.S,
      frame: frame,
      last: orderStars + 1,
      still: 4.0,
      center: [0, 2.1, 0],
      fit: [11, 9.4],
      baseY: 0.5,
      yaw: 0.35, pitch: 0.2, sway: 0.3,
      anchors: {}
    };
  }

  // =====================================================================
  // renderer
  // =====================================================================
  var STYLE = [
    { w: 1.35, c: "11,11,12" },        // structure
    { w: 1.15, c: "11,11,12" },        // openings, cylinders
    { w: 0.8, c: "11,11,12", a: 0.38 }, // light lines
    { w: 2.4, c: "232,38,37" },        // red accent, heavy
    { w: 1.6, c: "232,38,37" }         // red accent
  ];

  function render(ctx, sc, W, H, yaw, pitch, t, T) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    var scale = Math.min(W / sc.fit[0], H / sc.fit[1]);
    function project(p) {
      var x = p[0] - sc.center[0], y = p[1] - sc.center[1], z = p[2] - sc.center[2];
      var x1 = x * cy - z * sy, z1 = x * sy + z * cy;
      var y2 = y * cp + z1 * sp, z2 = z1 * cp - y * sp; // camera above, looking down
      var f = 30 / (30 + z2);
      return [W / 2 + ((sc.dx || 0) + x1 * f) * scale, H * sc.baseY - y2 * scale * f, z2];
    }
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    var g = project([sc.center[0], 0, sc.center[2]]);
    // keep the ground shadow inside the canvas so its edges never get cut off
    var k = Math.max(0, Math.min(1, (Math.min(g[0], W - g[0]) - 2) / (scale * 7), (H - g[1] - 2) / (scale * 2)));
    var rx = scale * 7 * k, ry = scale * 2 * k;
    if (rx > 1) {
      var grad = ctx.createRadialGradient(g[0], g[1], 0, g[0], g[1], rx);
      grad.addColorStop(0, "rgba(0,0,0,0.09)"); grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad; ctx.beginPath(); ctx.ellipse(g[0], g[1], rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    }

    var fr = sc.frame(T), all = sc.stat.concat(fr.S), last = sc.last;
    for (var i = 0; i < all.length; i++) {
      var s = all[i], k, a, b, alpha = 1;
      if (sc.fly && i < sc.stat.length) {
        // chaos to order: every line starts somewhere random and snaps home
        var sd = sc.seeds[i], u = Math.max(0, Math.min(1, (t - sd.d * 0.62) / 0.38)), e = 1 - Math.pow(1 - u, 3), w = 1 - e;
        var m = [(s[0] + s[3]) / 2, (s[1] + s[4]) / 2, (s[2] + s[5]) / 2], h = [(s[3] - s[0]) / 2, (s[4] - s[1]) / 2, (s[5] - s[2]) / 2];
        h = rotX(rotY(h, sd.r1 * w), sd.r2 * w);
        m = add(m, mul(sd.off, w));
        a = project(add(m, mul(h, -1))); b = project(add(m, h)); k = 1;
        alpha = Math.min(1, t * 6) * (0.3 + 0.7 * e);
      } else {
        var local = (sc.fly ? (t >= 1 ? 1 : 0) : t) * (last + 1) - s[7];
        if (local <= 0) continue;
        k = Math.min(1, local); a = project(s); b = project([s[3], s[4], s[5]]);
      }
      var st = STYLE[s[6]];
      var fade = Math.max(0.35, Math.min(1, 0.78 - (a[2] + b[2]) / 2 / 20));
      ctx.strokeStyle = "rgba(" + st.c + "," + (alpha * (st.a || 1) * (s[6] >= 3 ? 1 : fade)).toFixed(3) + ")";
      ctx.lineWidth = st.w;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k); ctx.stroke();
    }
    if (t >= 1) {
      for (var d = 0; d < fr.dots.length; d++) {
        var q = project(fr.dots[d][0]);
        ctx.fillStyle = "rgba(" + (fr.dots[d][2] || "11,11,12") + ",0.9)";
        ctx.beginPath(); ctx.arc(q[0], q[1], fr.dots[d][1], 0, Math.PI * 2); ctx.fill();
      }
    }
    return project;
  }

  var SCENES = { dig: digScene, phone: phoneScene, blueprint: blueprintScene, check: checkScene };

  if (typeof module !== "undefined" && module.exports) { module.exports = { SCENES: SCENES, render: render }; return; }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = window.matchMedia && window.matchMedia("(max-width: 760px)").matches;

  Array.prototype.forEach.call(document.querySelectorAll("canvas[data-scene]"), function (canvas) {
    var make = SCENES[canvas.getAttribute("data-scene")];
    if (!make || !canvas.getContext) return;
    var sc = make(), ctx = canvas.getContext("2d"), wrap = canvas.parentNode;
    var labels = Array.prototype.slice.call(wrap.querySelectorAll("[data-at]"));
    var W = 0, H = 0, dpr = 1;
    function size() {
      var r = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2); // full sharpness on phones too
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      var cw = Math.round(W * dpr), ch = Math.round(H * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    }
    var yaw = sc.yaw, pitch = sc.pitch, px = 0, py = 0, so = 0, start = 0, BUILD = sc.build || 2400;
    var running = false, visible = true, raf = 0, last = 0;
    function paint(now) {
      var t = reduce ? 1 : Math.min(1, (now - start) / BUILD);
      var T = reduce ? sc.still : Math.max(0, (now - start - BUILD) / 1000);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var project = render(ctx, sc, W, H, yaw, pitch, t, T);
      for (var l = 0; l < labels.length; l++) {
        var el = labels[l], p = sc.anchors[el.getAttribute("data-at")];
        if (!p) continue;
        var q = project(p);
        el.style.transform = "translate(" + q[0].toFixed(1) + "px," + q[1].toFixed(1) + "px)";
        if (t >= 1) el.classList.add("on");
      }
    }
    function frame(now) {
      if (!start) start = now;
      if (small && now - last < 30) { raf = requestAnimationFrame(frame); return; } // about 30 fps on phones
      last = now;
      var idle = Math.sin((now - start) / 5200) * sc.sway;
      if (sc.scroll) { var rs = wrap.getBoundingClientRect(); so = Math.max(-1, Math.min(1, -rs.top / Math.max(1, rs.height))) * 0.45; }
      yaw += (sc.yaw + idle + px * 0.35 + so - yaw) * 0.06;
      pitch += (sc.pitch + py * 0.1 - pitch) * 0.06;
      paint(now);
      if (running) raf = requestAnimationFrame(frame);
    }
    function play() { if (running || reduce || !visible || document.hidden) return; running = true; raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    size();
    if (reduce) paint(performance.now()); else play();
    window.addEventListener("resize", function () { size(); if (!running) paint(performance.now()); });
    if (!small) {
      wrap.addEventListener("pointermove", function (e) {
        var rc = wrap.getBoundingClientRect();
        px = ((e.clientX - rc.left) / rc.width - 0.5) * 2; py = ((e.clientY - rc.top) / rc.height - 0.5) * 2;
      });
      wrap.addEventListener("pointerleave", function () { px = 0; py = 0; });
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else play(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) play(); else stop(); }).observe(wrap);
    }
  });
})();
