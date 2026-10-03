/* Moteur d'animation : silhouette articulée en SVG (vue de profil ou de face).
   Chaque geste = quelques poses clés ; les membres sont résolus par cinématique inverse. */
(function (root) {
'use strict';

var G = 156, VW = 240, VH = 170;
var LEN = { torso: 38, ua: 21, fa: 21, th: 30, sh: 30, ft: 10, hr: 9, neck: 7 };

var rad = function (d) { return d * Math.PI / 180; };
var deg = function (r) { return r * 180 / Math.PI; };
var dir = function (a, d) { return [Math.cos(rad(a)) * d, Math.sin(rad(a)) * d]; };
var add = function (p, v) { return [p[0] + v[0], p[1] + v[1]]; };
var clamp = function (n, a, b) { return Math.min(b, Math.max(a, n)); };
var ang = function (a, b) { return deg(Math.atan2(b[1] - a[1], b[0] - a[0])); };

/* point à distance ra de A et rb de B ; side = ±1 choisit le côté */
function tri(A, B, ra, rb, side) {
  var dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy);
  d = clamp(d, Math.abs(ra - rb) + 0.01, ra + rb - 0.01);
  var a = (ra * ra - rb * rb + d * d) / (2 * d);
  var h = Math.sqrt(Math.max(0, ra * ra - a * a));
  var ux = dx / Math.hypot(dx, dy), uy = dy / Math.hypot(dx, dy);
  var bx = A[0] + ux * a, by = A[1] + uy * a;
  return [bx - uy * h * side, by + ux * h * side];
}
/* cinématique inverse à deux segments */
function ik(root, target, l1, l2, s) {
  var dx = target[0] - root[0], dy = target[1] - root[1];
  var d = Math.hypot(dx, dy);
  var dd = clamp(d, Math.abs(l1 - l2) + 0.01, l1 + l2 - 0.01);
  var a = Math.atan2(dy, dx);
  var A = Math.acos(clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1));
  var t = a + s * A;
  return {
    mid: [root[0] + Math.cos(t) * l1, root[1] + Math.sin(t) * l1],
    end: [root[0] + Math.cos(a) * dd, root[1] + Math.sin(a) * dd]
  };
}
/* corps rectiligne : cheville au sol, épaule à la hauteur shY (gainage, pompes, rowing) */
function bodyLine(ankle, shY) {
  var tot = LEN.torso + LEN.th + LEN.sh;
  var dy = ankle[1] - shY;
  var sx = ankle[0] + Math.sqrt(Math.max(0, tot * tot - dy * dy));
  var S = [sx, shY];
  var k = (LEN.th + LEN.sh) / tot;
  var P = [ankle[0] + (S[0] - ankle[0]) * k, ankle[1] + (S[1] - ankle[1]) * k];
  return { p: P, t: ang(P, S), S: S };
}
function fromPts(P, S) { return { p: P, t: ang(P, S) }; }
function mix(base, o) { var r = {}, k; for (k in base) r[k] = base[k]; for (k in o) r[k] = o[k]; return r; }

/* ---------- résolution d'une pose ---------- */
function fkPoint(Q, name, front) {
  var hip = Q.p, sh = add(hip, dir(Q.t, LEN.torso * (Q.tl || 1)));
  var hipA = front ? [hip[0] - 7, hip[1]] : hip, hipB = front ? [hip[0] + 7, hip[1]] : hip;
  var shA = front ? [sh[0] - 12, sh[1]] : sh, shB = front ? [sh[0] + 12, sh[1]] : sh;
  var n = name.replace('2', ''), two = name.indexOf('2') > -1;
  var h = two ? hipB : hipA, s = two ? shB : shA;
  var LF = two ? Q.LF2 : Q.LF, AF = two ? Q.AF2 : Q.AF, ft = two ? Q.ft2 : Q.ft;
  if (n === 'hip') return h;
  if (n === 'sh') return s;
  if (n === 'knee') return add(h, dir(LF[0], LEN.th));
  if (n === 'ankle') return add(add(h, dir(LF[0], LEN.th)), dir(LF[1], LEN.sh));
  if (n === 'toe') return add(add(add(h, dir(LF[0], LEN.th)), dir(LF[1], LEN.sh)), dir(ft || 0, LEN.ft));
  if (n === 'wrist') return add(add(s, dir(AF[0], LEN.ua)), dir(AF[1], LEN.fa));
  return h;
}
function solve(Q0, front) {
  var Q = Q0;
  if (Q.pin) {
    var cur = fkPoint(Q, Q.pin[0], front);
    Q = mix(Q, { p: [Q.p[0] + Q.pin[1] - cur[0], Q.p[1] + Q.pin[2] - cur[1]] });
  }
  var hip = Q.p, tl = Q.tl || 1;
  var sh = add(hip, dir(Q.t, LEN.torso * tl));
  var hipA = hip, hipB = hip, shA = sh, shB = sh;
  if (front) {
    hipA = [hip[0] - 7, hip[1]]; hipB = [hip[0] + 7, hip[1]];
    shA = [sh[0] - 12, sh[1]]; shB = [sh[0] + 12, sh[1]];
  }
  function arm(root, T, F, s) {
    if (F) { var e = add(root, dir(F[0], LEN.ua)); return [root, e, add(e, dir(F[1], LEN.fa))]; }
    var r = ik(root, T || add(root, [1, 41]), LEN.ua, LEN.fa, s);
    return [root, r.mid, r.end];
  }
  function leg(root, T, F, s, ft) {
    var k, a;
    if (F) { k = add(root, dir(F[0], LEN.th)); a = add(k, dir(F[1], LEN.sh)); }
    else { var r = ik(root, T, LEN.th, LEN.sh, s); k = r.mid; a = r.end; }
    return [root, k, a, add(a, dir(ft || 0, LEN.ft))];
  }
  var armN = arm(shA, Q.A, Q.AF, Q.es == null ? 1 : Q.es);
  var armF = arm(shB, Q.A2 || Q.A, ('AF2' in Q) ? Q.AF2 : Q.AF, Q.es2 == null ? (Q.es == null ? 1 : Q.es) : Q.es2);
  var legN = leg(hipA, Q.L, Q.LF, Q.ks == null ? -1 : Q.ks, Q.ft);
  var l2 = Q.L2 || (Q.L ? [Q.L[0] + 5, Q.L[1]] : null);
  var legF = leg(hipB, l2, ('LF2' in Q) ? Q.LF2 : Q.LF, Q.ks2 == null ? (Q.ks == null ? -1 : Q.ks) : Q.ks2, Q.ft2 == null ? Q.ft : Q.ft2);
  var hd = add(sh, dir(Q.t + (Q.hd || 0), LEN.neck + LEN.hr));
  var nrm = dir(Q.t - 90, 1);
  var mid = [(hip[0] + sh[0]) / 2 + nrm[0] * (Q.cv || 0) * 2, (hip[1] + sh[1]) / 2 + nrm[1] * (Q.cv || 0) * 2];
  return { front: !!front, hip: hip, sh: sh, shA: shA, shB: shB, hipA: hipA, hipB: hipB, head: hd, ctrl: mid,
           armN: armN, armF: armF, legN: legN, legF: legF, wt: Q.wt || 0 };
}

/* ---------- dessin ---------- */
var f1 = function (n) { return Math.round(n * 10) / 10; };
var pts = function (a) { return a.map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join(' '); };

function partsSVG(geo, C, props) {
  var o = '';
  o += '<line x1="6" y1="' + (G + 1) + '" x2="234" y2="' + (G + 1) + '" style="stroke:' + C.ground + ';stroke-width:3;stroke-linecap:round"/>';
  (props || []).forEach(function (p) {
    var st = 'stroke:' + C.prop + ';stroke-width:' + (p.w || 3) + ';stroke-linecap:round;stroke-linejoin:round;fill:' + (p.fill ? C.prop : 'none');
    if (p.k === 'l') o += '<line x1="' + p.a + '" y1="' + p.b + '" x2="' + p.c + '" y2="' + p.d + '" style="' + st + '"/>';
    else if (p.k === 'r') o += '<rect x="' + p.a + '" y="' + p.b + '" width="' + p.c + '" height="' + p.d + '" rx="2" style="' + st + '"/>';
    else if (p.k === 'c') o += '<circle cx="' + p.a + '" cy="' + p.b + '" r="' + p.c + '" style="' + st + '"/>';
  });
  var limb = function (poly, col, w) {
    return '<polyline points="' + pts(poly) + '" style="fill:none;stroke:' + col + ';stroke-width:' + w + ';stroke-linecap:round;stroke-linejoin:round"/>';
  };
  var farC = geo.front ? C.near : C.far;
  o += limb(geo.legF, farC, 6);
  o += limb(geo.armF, farC, 5);
  var tp = 'M' + f1(geo.hip[0]) + ',' + f1(geo.hip[1]) + ' Q' + f1(geo.ctrl[0]) + ',' + f1(geo.ctrl[1]) + ' ' + f1(geo.sh[0]) + ',' + f1(geo.sh[1]);
  o += '<path d="' + tp + '" style="fill:none;stroke:' + C.near + ';stroke-width:9;stroke-linecap:round"/>';
  if (geo.front) {
    o += limb([geo.shA, geo.shB], C.near, 6);
    o += limb([geo.hipA, geo.hipB], C.near, 6);
  }
  o += limb(geo.legN, C.near, 6);
  o += limb(geo.armN, C.near, 5);
  o += '<circle cx="' + f1(geo.head[0]) + '" cy="' + f1(geo.head[1]) + '" r="' + LEN.hr + '" style="fill:' + C.bg + ';stroke:' + C.near + ';stroke-width:4"/>';
  if (geo.wt) {
    o += '<circle cx="' + f1(geo.armN[2][0]) + '" cy="' + f1(geo.armN[2][1]) + '" r="5" style="fill:' + C.accent + '"/>';
    if (geo.wt > 1) o += '<circle cx="' + f1(geo.armF[2][0]) + '" cy="' + f1(geo.armF[2][1]) + '" r="5" style="fill:' + C.accent + '"/>';
  }
  return o;
}

/* ---------- interpolation ---------- */
var smooth = function (u) { return u * u * (3 - 2 * u); };
function lerpVal(a, b, u) {
  if (typeof a === 'number') return a + (b - a) * u;
  if (Array.isArray(a)) return a.map(function (x, i) { return lerpVal(x, b[i], u); });
  return u < 0.5 ? a : b;
}
function lerpPose(A, B, u) {
  var r = {}, k;
  for (k in A) r[k] = (B[k] === undefined) ? A[k] : lerpVal(A[k], B[k], u);
  for (k in B) if (r[k] === undefined) r[k] = B[k];
  if (A.pin && B.pin) r.pin = [A.pin[0], lerpVal(A.pin[1], B.pin[1], u), lerpVal(A.pin[2], B.pin[2], u)];
  return r;
}
function poseAt(def, time) {
  var kf = def.kf, T = kf[kf.length - 1].t;
  var t = T ? ((time % T) + T) % T : 0;
  for (var i = 0; i < kf.length - 1; i++) {
    if (t >= kf[i].t && t <= kf[i + 1].t) {
      var span = kf[i + 1].t - kf[i].t;
      var u = span ? smooth((t - kf[i].t) / span) : 0;
      return lerpPose(kf[i].q, kf[i + 1].q, u);
    }
  }
  return kf[0].q;
}

/* ---------- données des gestes ---------- */
var M = {};
var K = function (t, q) { return { t: t, q: q }; };
var STAND = { p: [120, 92], t: -90, L: [118, 152], L2: [124, 152], ft: 0, ft2: 0, ks: -1, ks2: -1 };
var HANG = [121, 96];

/* --- force --- */
(function () {
  function hsPose(a) {
    var q = { p: [120, 80], t: 90 + a, AF: [90 + a, 90 + a], AF2: [92 + a, 92 + a],
              LF: [-90 + a, -90 + a], LF2: [-87 + a, -87 + a], ft: -90 + a, ft2: -87 + a, hd: -8,
              pin: ['wrist', 120, G - 2] };
    return q;
  }
  M.hs = { name: 'Handstand contre le mur', kf: [K(0, hsPose(13)), K(1.6, hsPose(16)), K(3.2, hsPose(13))],
           props: [{ k: 'l', a: 163, b: 4, c: 163, d: G, w: 4 }] };

  var pu = function (h) { var b = bodyLine([57.4, G - 10], G - h); return { p: b.p, t: b.t, hd: 22, A: [150, G - 2], A2: [150, G - 2], es: 1, L: [57.4, G - 10], L2: [60, G - 10], ft: 90, ft2: 90 }; };
  M.pompes = { name: 'Pompes', kf: [K(0, pu(42)), K(1.1, pu(15)), K(1.35, pu(15)), K(2.5, pu(42))], props: [] };

  var F = [70, G - 10], H = [150, G - 2];
  var pikeTop = (function () { var P = [F[0] + dir(-58, 60)[0], F[1] + dir(-58, 60)[1]]; var S = tri(P, H, 38, 42, -1); return mix(fromPts(P, S), { hd: 10, A: H, A2: H, es: 1, L: F, L2: [F[0] + 3, F[1]], ft: 90, ft2: 90 }); })();
  var pikeBot = (function () { var S = [142, 138]; var P = tri(F, S, 60, 38, -1); return mix(fromPts(P, S), { hd: 10, A: H, A2: H, es: 1, L: F, L2: [F[0] + 3, F[1]], ft: 90, ft2: 90 }); })();
  M.pike = { name: 'Pike push-ups', kf: [K(0, pikeTop), K(1.2, pikeBot), K(1.45, pikeBot), K(2.7, pikeTop)], props: [] };

  var dip = function (sy) {
    var S = [112, sy], P = [101, sy + 38], Hd = [112, 72];
    return mix(fromPts(P, S), { A: Hd, A2: Hd, es: 1, L: [78, 122 + (sy - 30) * 0.15], L2: [86, 126 + (sy - 30) * 0.15], ks: -1, ft: 60, ft2: 60 });
  };
  M.dips = { name: 'Dips', kf: [K(0, dip(30)), K(1.1, dip(58)), K(1.35, dip(58)), K(2.5, dip(30))],
             props: [{ k: 'l', a: 98, b: 74, c: 126, d: 74, w: 5 }, { k: 'l', a: 98, b: 74, c: 98, d: G, w: 3 }, { k: 'l', a: 126, b: 74, c: 126, d: G, w: 3 }] };

  var tri0 = mix(STAND, { A: [121, 12], A2: [121, 12], es: 1, wt: 1, hd: 0 });
  var tri1 = mix(STAND, { A: [108, 48], A2: [108, 48], es: 1, wt: 1, hd: 0 });
  M.tri = { name: 'Extensions triceps', kf: [K(0, tri0), K(1.3, tri1), K(1.6, tri1), K(2.9, tri0)], props: [] };

  var pl = function (sx, sy, px, py) { var S = [sx, sy], P = [px, py]; return fromPts(P, S); };
  var tracDown = mix(pl(118, 56, 118, 94), { A: [127, 14], A2: [129, 14], es: -1, L: [104, 132], L2: [110, 136], ks: -1, ft: 70, ft2: 70 });
  var tracUp = mix(pl(114, 33, 116, 71), { A: [127, 14], A2: [129, 14], es: -1, L: [102, 112], L2: [108, 116], ks: -1, ft: 70, ft2: 70, hd: -10 });
  M.trac = { name: 'Tractions', kf: [K(0, tracDown), K(1.4, tracUp), K(1.7, tracUp), K(3.1, tracDown)],
             props: [{ k: 'l', a: 70, b: 14, c: 170, d: 14, w: 5 }, { k: 'l', a: 70, b: 14, c: 70, d: 40, w: 3 }, { k: 'l', a: 170, b: 14, c: 170, d: 40, w: 3 }] };

  var row = function (shY) { var b = bodyLine([58, G - 8], shY); return { p: b.p, t: b.t, hd: -22, A: [150, 84], A2: [150, 84], es: -1, L: [58, G - 8], L2: [62, G - 8], ft: -70, ft2: -70 }; };
  M.rowing = { name: 'Rowing inversé', kf: [K(0, row(126)), K(1.2, row(100)), K(1.5, row(100)), K(2.8, row(126))],
               props: [{ k: 'c', a: 150, b: 84, c: 4, w: 4 }, { k: 'l', a: 178, b: 84, c: 178, d: G, w: 3 }, { k: 'l', a: 150, b: 84, c: 178, d: 84, w: 3 }] };

  var ls = function (leg1, leg2) {
    var P = [99, 132], S = [110, 94];
    return mix(fromPts(P, S), { A: [110, G - 20], A2: [110, G - 20], es: 1, L: leg1, L2: leg2, ks: -1, ft: 0, ft2: 0 });
  };
  var tuck = [114, 146], full = [159, 132], fullF = [156, 129];
  M.lsit = { name: 'L-sit (progression)', kf: [K(0, ls(tuck, [116, 148])), K(1.0, ls(tuck, [116, 148])), K(2.2, ls(full, [122, 148])), K(3.2, ls(full, [122, 148])), K(4.4, ls(full, fullF)), K(5.8, ls(full, fullF)), K(7.0, ls(tuck, [116, 148]))],
             props: [{ k: 'r', a: 98, b: G - 20, c: 24, d: 20, w: 3 }] };

  var hol = function (t, la, hd) { return { p: [120, G - 8], t: t, hd: hd, A: add([120, G - 8], add(dir(t, LEN.torso), dir(t + 2, 40))), ks: -1, L: add([120, G - 8], dir(la, 56)), L2: add([120, G - 8], dir(la - 3, 56)), ft: la, ft2: la, es: 1 }; };
  M.hollow = { name: 'Hollow body', kf: [K(0, hol(-18, 200, 6)), K(1.6, hol(-23, 204, 6)), K(3.2, hol(-18, 200, 6))], props: [] };

  var cur0 = mix(STAND, { A: HANG, A2: [123, 96], es: 1, wt: 2 });
  var cur1 = mix(STAND, { A: [129, 58], A2: [131, 60], es: 1, wt: 2 });
  M.curl = { name: 'Curl biceps', kf: [K(0, cur0), K(1.2, cur1), K(1.5, cur1), K(2.8, cur0)], props: [] };

  var bg = function (py, ty) {
    var P = [136, py], S = add(P, dir(ty, LEN.torso));
    return { p: P, t: ty, A: [S[0] + 1, S[1] + 41], A2: [S[0] + 3, S[1] + 41], es: 1, wt: 2, L: [152, 152], ft: 0, L2: [88, 111], ft2: 170, ks: -1, ks2: -1 };
  };
  M.bulg = { name: 'Squat bulgare', kf: [K(0, bg(96, -86)), K(1.3, bg(124, -78)), K(1.6, bg(124, -78)), K(2.9, bg(96, -86))],
             props: [{ k: 'r', a: 62, b: 116, c: 36, d: 7, w: 3 }, { k: 'l', a: 68, b: 123, c: 68, d: G, w: 3 }, { k: 'l', a: 92, b: 123, c: 92, d: G, w: 3 }] };

  var pis = function (py, px, ty, farLeg, hand) {
    return { p: [px, py], t: ty, A: hand, A2: hand, es: 1, L: [120, 152], ft: 0, L2: farLeg, ft2: 0, ks: -1, ks2: -1 };
  };
  M.pistol = { name: 'Pistol squat assisté', kf: [K(0, pis(92, 124, -88, [182, 98], [160, 80])), K(1.6, pis(128, 100, -62, [156, 130], [160, 96])), K(2.0, pis(128, 100, -62, [156, 130], [160, 96])), K(3.6, pis(92, 124, -88, [182, 98], [160, 80]))],
               props: [{ k: 'l', a: 163, b: 30, c: 163, d: G, w: 4 }] };

  var rd0 = mix(STAND, { p: [118, 92], L: [118, 152], L2: [114, 150], A: [121, 96], A2: [123, 96], es: 1, wt: 2 });
  var rd1 = (function () { var P = [108, 98], t = -16, S = add(P, dir(t, LEN.torso)); return { p: P, t: t, hd: -10, L: [118, 152], L2: add(P, dir(t + 176, 59)), ft: 0, ft2: t + 178, ks: -1, ks2: -1, A: [S[0] + 1, S[1] + 41], A2: [S[0] + 3, S[1] + 41], es: 1, wt: 2 }; })();
  M.rdl = { name: 'Soulevé de terre une jambe', kf: [K(0, rd0), K(1.5, rd1), K(1.8, rd1), K(3.3, rd0)], props: [] };

  var cf0 = mix(STAND, { A: HANG, A2: HANG, es: 1 });
  var cf1 = mix(STAND, { p: [121, 80], L: [122, 140], L2: [128, 140], ft: 65, ft2: 65, A: [122, 84], A2: [122, 84], es: 1 });
  M.mollets = { name: 'Mollets', kf: [K(0, cf0), K(0.7, cf1), K(1.0, cf1), K(1.8, cf0)], props: [] };

  var pk = function (h) { var b = bodyLine([42.7, G - 10], G - h); return { p: b.p, t: b.t, hd: 20, A: [b.S[0] + 21, G - 3], A2: [b.S[0] + 22, G - 3], es: 1, L: [42.7, G - 10], L2: [46, G - 10], ft: 90, ft2: 90 }; };
  M.planche = { name: 'Planche', kf: [K(0, pk(22)), K(1.8, pk(24.5)), K(3.6, pk(22))], props: [] };
})();

/* --- mobilité --- */
(function () {
  var quad = function (cv, hd, tt) {
    return { p: [113, 123], t: tt, cv: cv, hd: hd, AF: [90, 90], AF2: [90, 90], LF: [90, 180], LF2: [92, 180], ft: 180, ft2: 180 };
  };
  M.chatvache = { name: 'Chat-vache', kf: [K(0, quad(-9, -32, -10)), K(1.8, quad(15, 38, -16)), K(3.6, quad(-9, -32, -10))], props: [] };

  var lunge = function (extra) {
    return mix({ p: [120, 123], t: -90, LF: [-2, 90], LF2: [95, 180], ft: 0, ft2: 180, pin: ['ankle', 150, G - 4] }, extra);
  };
  M.fente = { name: 'Fente basse', kf: [K(0, lunge({ t: -72, A: [152, 118], A2: [152, 118], es: 1 })), K(2.0, lunge({ t: -92, A: [124, 12], A2: [127, 14], es: -1 })), K(4.0, lunge({ t: -72, A: [152, 118], A2: [152, 118], es: 1 }))], props: [] };
  M.fenteLift = { name: 'Fente basse, jambe arrière levée', kf: [K(0, lunge({ t: -85, A: [150, 118], A2: [150, 118], es: 1 })), K(1.4, lunge({ t: -85, A: [150, 118], A2: [150, 118], es: 1, LF2: [168, 172], ft2: 170 })), K(2.8, lunge({ t: -85, A: [150, 118], A2: [150, 118], es: 1, LF2: [168, 172], ft2: 170 })), K(4.2, lunge({ t: -85, A: [150, 118], A2: [150, 118], es: 1 }))], props: [] };

  var couch = function (extra) {
    return mix({ p: [75, 123], t: -90, LF: [0, 80], LF2: [95, -90], ft: 0, ft2: -90, pin: ['knee2', 72, G - 3], A: [106, 120], A2: [106, 120], es: 1 }, extra);
  };
  M.couch = { name: 'Couch stretch', kf: [K(0, couch({ t: -84 })), K(2.0, couch({ t: -97, A: [90, 42], A2: [92, 44], es: -1 })), K(4.0, couch({ t: -84 }))],
              props: [{ k: 'l', a: 60, b: 50, c: 60, d: G, w: 4 }] };

  var isch = function (ty, hand) {
    return { p: [114, 96], t: ty, L: [110, 152], L2: [170, 114], ft: 0, ft2: -70, ks: -1, ks2: -1, A: hand, A2: hand, es: 1, hd: ty > -60 ? -15 : 0 };
  };
  M.ischios = { name: 'Ischios, jambe tendue', kf: [K(0, isch(-88, [145, 96])), K(2.2, isch(-38, [162, 106])), K(4.4, isch(-88, [145, 96]))],
                props: [{ k: 'r', a: 158, b: 116, c: 30, d: 6, w: 3 }, { k: 'l', a: 162, b: 122, c: 162, d: G, w: 3 }, { k: 'l', a: 184, b: 122, c: 184, d: G, w: 3 }] };

  var comp = function (lift) {
    return { p: [96, G - 4], t: -90, A: [108, G - 2], A2: [112, G - 2], es: 1, L: [156, G - 7 - lift], L2: [154, G - 9 - lift], ft: 0, ft2: 0, ks: -1 };
  };
  M.compress = { name: 'Compression assise', kf: [K(0, comp(0)), K(1.0, comp(0)), K(2.0, comp(15)), K(3.2, comp(15)), K(4.2, comp(0))], props: [] };

  var pig = function (ty, hand, hd) {
    return { p: [105, G - 5], t: ty, hd: hd, A: hand, A2: hand, es: 1, LF: [-5, 150], LF2: [180, 180], ft: 0, ft2: 180 };
  };
  M.pigeon = { name: 'Pigeon', kf: [K(0, pig(-86, [114, G - 2], 0)), K(2.4, pig(-28, [152, G - 2], 20)), K(4.8, pig(-86, [114, G - 2], 0))], props: [] };

  var pk = function (ty, hand) {
    return { p: [84, G - 4], t: ty, A: hand, A2: hand, es: 1, L: [144, G - 7], L2: [142, G - 9], ft: 0, ft2: 0, ks: -1, hd: ty > -50 ? 20 : 0 };
  };
  M.pikeSit = { name: 'Pike assis', kf: [K(0, pk(-90, [96, G - 2])), K(2.6, pk(-16, [140, G - 12])), K(5.2, pk(-90, [96, G - 2]))], props: [] };

  /* vues de face */
  var fr = function (o) { return mix({ front: 1 }, o); };
  /* sur les avant-bras, on recule les hanches vers les talons (l'écart des genoux ne se voit pas de profil) */
  var frog = function (th, tt) {
    return { p: [100, 123], t: tt, hd: -22, AF: [90, 0], AF2: [90, 0], LF: [th, 180], LF2: [th + 2, 180], ft: 180, ft2: 180, pin: ['knee', 100, G - 3] };
  };
  M.frog = { name: 'Grenouille', kf: [K(0, frog(90, 13.7)), K(2.4, frog(25, -12.6)), K(4.0, frog(25, -12.6)), K(6.0, frog(90, 13.7))], props: [] };

  var bfly = function (th, sh, tl) {
    return fr({ p: [120, G - 8], t: -90, tl: tl, LF: [th, sh], LF2: [180 - th, 180 - sh], ft: 0, ft2: 180, A: [110, G - 6], A2: [130, G - 6], es: 1, es2: -1 });
  };
  M.papillon = { name: 'Papillon (vue de face)', front: 1, kf: [K(0, bfly(220, 40, 1)), K(2.4, bfly(195, 19.5, 0.78)), K(4.8, bfly(220, 40, 1))], props: [] };

  var pan = function (tl) {
    return fr({ p: [120, G - 6], t: -90, tl: tl, L: [54, G - 7], L2: [186, G - 7], ks: 1, ks2: -1, ft: -80, ft2: -100, A: [104, G - 3], A2: [136, G - 3], es: 1, es2: -1 });
  };
  M.pancake = { name: 'Pancake (vue de face)', front: 1, kf: [K(0, pan(1)), K(2.6, pan(0.45)), K(5.2, pan(1))], props: [] };

  var cos = function (px, py, la, ra, lk) {
    return fr({ p: [px, py], t: -90, tl: 1, L: la, L2: ra, ks: 1, ks2: -1, ft: -80, ft2: -80, A: [px - 15, py - 25], A2: [px + 15, py - 25], es: 1, es2: -1 });
  };
  M.cossack = { name: 'Cossack squat (vue de face)', front: 1, kf: [K(0, cos(80, 124, [66, G - 4], [134, G - 4])), K(2.2, cos(160, 124, [106, G - 4], [174, G - 4])), K(4.4, cos(80, 124, [66, G - 4], [134, G - 4]))], props: [] };

  var hs = function (ty, hand, hd) {
    return { p: [92, 124], t: ty, hd: hd, A: hand, A2: hand, es: 1, LF: [95, 180], LF2: null, L2: [150, G - 6], ft: 180, ft2: -70, ks2: -1 };
  };
  M.halfsplit = { name: 'Demi-grand écart facial', kf: [K(0, hs(-88, [112, 122], 0)), K(2.6, hs(-24, [140, G - 2], 20)), K(5.2, hs(-88, [112, 122], 0))], props: [] };
})();

/* correspondance exercice / position -> geste */
var ALIAS = {
  'Chat-vache + cercles de hanches': 'chatvache',
  'Fente basse (psoas)': 'fente', 'Fente basse + élévation de la jambe arrière': 'fenteLift',
  'Couch stretch': 'couch', 'Ischios, jambe tendue': 'ischios', 'Ischios en contract-relax': 'ischios',
  'Grenouille (frog)': 'frog', 'Grenouille en contract-relax': 'frog', 'Papillon': 'papillon',
  'Compression assise': 'compress', 'Pigeon': 'pigeon', 'Pike assis': 'pikeSit', 'Pancake': 'pancake',
  'Cossack squats lents': 'cossack', 'Demi-grand écart facial': 'halfsplit'
};
M.compress = M.compress;

/* ---------- API ---------- */
var COLORS_CSS = { near: 'var(--ink)', far: 'var(--muted)', prop: 'var(--muted)', ground: 'var(--line)', bg: 'var(--surface)', accent: 'var(--accent)' };

function frameSVG(key, time, C) {
  var def = M[key]; if (!def) return '';
  var q = poseAt(def, time);
  var geo = solve(q, !!(def.front || q.front));
  return partsSVG(geo, C || COLORS_CSS, def.props);
}
function duration(key) { var kf = M[key].kf; return kf[kf.length - 1].t; }

function mount(host, key) {
  var def = M[key];
  host.innerHTML = '';
  if (!def) return { stop: function () {} };
  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + VH);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Animation : ' + def.name);
  svg.style.width = '100%'; svg.style.height = 'auto'; svg.style.display = 'block';
  host.appendChild(svg);
  var running = true, t0 = performance.now(), raf = 0;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw(now) {
    if (!running) return;
    if (!svg.isConnected) { running = false; return; }
    svg.innerHTML = frameSVG(key, reduce ? duration(key) * 0.4 : (now - t0) / 1000);
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
  return { stop: function () { running = false; cancelAnimationFrame(raf); } };
}

root.Anim = { mount: mount, frameSVG: frameSVG, duration: duration, keys: function () { return Object.keys(M); },
              name: function (k) { return M[k] && M[k].name; }, alias: ALIAS, has: function (k) { return !!M[k]; },
              VW: VW, VH: VH };
if (typeof module !== 'undefined') module.exports = root.Anim;
})(typeof window !== 'undefined' ? window : globalThis);
