/* Luxury playing cards + mahjong tiles, vector-drawn into cached offscreen sprites. Web only (needs document); callers fall back to plain drawing when sprite() returns null. */
(function () {
  var cache = {}, GOLD = '#d9b04a', SERIF = '"Noto Serif CJK SC","Songti SC","STSong","SimSun","Noto Serif",Georgia,serif';
  function mk(w, h) { if (typeof document === 'undefined') return null; var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
  function rr(c, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function scaleOf(ctx) { var a = 1; try { a = ctx.getTransform().a; } catch (e) {} return Math.min(3, Math.max(1, Math.round(a * 2) / 2)); }
  function sprite(ctx, key, w, h, fn) {
    if (typeof document === 'undefined') return null;
    var s = scaleOf(ctx), W = Math.round(w * 2) / 2, H = Math.round(h * 2) / 2, k = key + '|' + W + 'x' + H + '@' + s, e = cache[k];
    if (e) return e;
    var cv = mk(Math.ceil(W * s), Math.ceil(H * s)); if (!cv) return null;
    var c = cv.getContext('2d'); c.scale(s, s); fn(c, W, H); return (cache[k] = cv);
  }
  /* ---------- suit vector paths (unit box, centered, ~[-1,1]) ---------- */
  function suitPath(c, su, x, y, r) {
    c.save(); c.translate(x, y); c.scale(r, r); c.beginPath();
    if (su === 1) { c.moveTo(0, 0.95); c.bezierCurveTo(-1.25, 0.1, -1.15, -0.95, -0.5, -0.9); c.bezierCurveTo(-0.2, -0.88, -0.05, -0.65, 0, -0.4); c.bezierCurveTo(0.05, -0.65, 0.2, -0.88, 0.5, -0.9); c.bezierCurveTo(1.15, -0.95, 1.25, 0.1, 0, 0.95); }
    else if (su === 3) { c.moveTo(0, -1); c.bezierCurveTo(0.18, -0.55, 0.5, -0.2, 0.72, 0); c.bezierCurveTo(0.5, 0.2, 0.18, 0.55, 0, 1); c.bezierCurveTo(-0.18, 0.55, -0.5, 0.2, -0.72, 0); c.bezierCurveTo(-0.5, -0.2, -0.18, -0.55, 0, -1); }
    else if (su === 0) { c.moveTo(0, -1); c.bezierCurveTo(0.25, -0.55, 1.05, -0.2, 1.0, 0.35); c.bezierCurveTo(0.97, 0.8, 0.35, 0.85, 0.12, 0.45); c.bezierCurveTo(0.14, 0.75, 0.25, 0.92, 0.45, 1); c.lineTo(-0.45, 1); c.bezierCurveTo(-0.25, 0.92, -0.14, 0.75, -0.12, 0.45); c.bezierCurveTo(-0.35, 0.85, -0.97, 0.8, -1.0, 0.35); c.bezierCurveTo(-1.05, -0.2, -0.25, -0.55, 0, -1); }
    else { c.arc(0, -0.5, 0.45, 0, 6.2832); c.moveTo(0.95, 0.2); c.arc(0.5, 0.25, 0.45, 0, 6.2832); c.moveTo(-0.05, 0.25); c.arc(-0.5, 0.25, 0.45, 0, 6.2832); c.moveTo(0, 0); c.bezierCurveTo(0, 0.5, 0.05, 0.8, 0.35, 1); c.lineTo(-0.35, 1); c.bezierCurveTo(-0.05, 0.8, 0, 0.5, 0, 0); }
    c.restore();
  }
  function suit(c, su, x, y, r, col) { c.save(); suitPath(c, su, x, y, r); c.fillStyle = col; c.fill(); c.restore(); }
  var RED = '#c01f2d', BLK = '#15171c', NAVY = '#1c3a78';
  function suitCol(su) { return (su === 1 || su === 3) ? RED : BLK; }
  var RK = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
  function rkName(r) { return RK[r] || String(r); }
  var PIPS = {
    2: [[0, 0], [0, 1]], 3: [[0, 0], [0, .5], [0, 1]], 4: [[-1, 0], [1, 0], [-1, 1], [1, 1]], 5: [[-1, 0], [1, 0], [0, .5], [-1, 1], [1, 1]],
    6: [[-1, 0], [1, 0], [-1, .5], [1, .5], [-1, 1], [1, 1]], 7: [[-1, 0], [1, 0], [0, .25], [-1, .5], [1, .5], [-1, 1], [1, 1]],
    8: [[-1, 0], [1, 0], [0, .25], [-1, .5], [1, .5], [0, .75], [-1, 1], [1, 1]],
    9: [[-1, 0], [1, 0], [-1, 1 / 3], [1, 1 / 3], [0, .5], [-1, 2 / 3], [1, 2 / 3], [-1, 1], [1, 1]],
    10: [[-1, 0], [1, 0], [0, 1 / 6], [-1, 1 / 3], [1, 1 / 3], [-1, 2 / 3], [1, 2 / 3], [0, 5 / 6], [-1, 1], [1, 1]]
  };
  function paper(c, w, h, r) {
    rr(c, 0.5, 0.5, w - 1, h - 1, r); var g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#fffefa'); g.addColorStop(.6, '#fbf6e8'); g.addColorStop(1, '#efe6cf'); c.fillStyle = g; c.fill();
    c.save(); rr(c, 0.5, 0.5, w - 1, h - 1, r); c.clip(); c.globalAlpha = .05; c.strokeStyle = '#7a6840'; c.lineWidth = .5; for (var i = -h; i < w; i += 3) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke(); } c.restore();
    rr(c, 0.5, 0.5, w - 1, h - 1, r); c.strokeStyle = 'rgba(70,55,25,.55)'; c.lineWidth = 1; c.stroke();
  }
  function ctext(c, s, x, y, size, col, w) { c.font = 'bold ' + size + 'px ' + SERIF; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col; if (w) c.fillText(s, x, y, w); else c.fillText(s, x, y); }
  function goldGrad(c, y0, y1) { var g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#f6dc86'); g.addColorStop(.5, '#c99a32'); g.addColorStop(1, '#8c6416'); return g; }
  /* ---------- court figures (drawn into top half box fw x fh at origin) ---------- */
  function figure(c, kind, su, fw, fh) {
    var red = suitCol(su) === RED, robe = red ? '#b3202a' : NAVY, trim = red ? NAVY : '#a8262f', gold = goldGrad(c, 0, fh), skin = '#f1cfa3', cx = fw / 2;
    // robe
    c.beginPath(); c.moveTo(fw * .08, fh); c.lineTo(fw * .16, fh * .66); c.quadraticCurveTo(cx, fh * .5, fw * .84, fh * .66); c.lineTo(fw * .92, fh); c.closePath(); c.fillStyle = robe; c.fill();
    c.beginPath(); c.moveTo(fw * .36, fh * .58); c.lineTo(cx, fh); c.lineTo(fw * .64, fh * .58); c.closePath(); c.fillStyle = trim; c.fill();
    c.strokeStyle = gold; c.lineWidth = Math.max(.7, fw * .03); c.beginPath(); c.moveTo(fw * .16, fh * .66); c.quadraticCurveTo(cx, fh * .5, fw * .84, fh * .66); c.stroke();
    c.fillStyle = gold; for (var i = 0; i < 3; i++) { c.beginPath(); c.arc(cx, fh * (.72 + i * .1), fw * .025, 0, 6.3); c.fill(); }
    // neck + head
    var hr = Math.min(fw * .17, fh * .17), hy = fh * .42;
    c.fillStyle = skin; c.fillRect(cx - hr * .4, hy + hr * .6, hr * .8, hr * .9);
    if (kind === 'Q') { c.fillStyle = '#5a3a1c'; c.beginPath(); c.ellipse(cx - hr * 1.05, hy + hr * .35, hr * .5, hr * 1.5, 0.12, 0, 6.3); c.fill(); c.beginPath(); c.ellipse(cx + hr * 1.05, hy + hr * .35, hr * .5, hr * 1.5, -0.12, 0, 6.3); c.fill(); }
    c.beginPath(); c.ellipse(cx, hy, hr * .82, hr, 0, 0, 6.3); c.fillStyle = skin; c.fill(); c.strokeStyle = 'rgba(80,50,20,.6)'; c.lineWidth = .5; c.stroke();
    c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(cx - hr * .3, hy - hr * .1, Math.max(.5, hr * .08), 0, 6.3); c.arc(cx + hr * .3, hy - hr * .1, Math.max(.5, hr * .08), 0, 6.3); c.fill();
    if (kind === 'K') { c.fillStyle = '#3a2412'; c.beginPath(); c.moveTo(cx - hr * .8, hy + hr * .1); c.quadraticCurveTo(cx, hy + hr * 1.9, cx + hr * .8, hy + hr * .1); c.quadraticCurveTo(cx, hy + hr * .55, cx - hr * .8, hy + hr * .1); c.fill(); }
    else { c.strokeStyle = '#a0402a'; c.lineWidth = .7; c.beginPath(); c.arc(cx, hy + hr * .35, hr * .3, .2, Math.PI - .2); c.stroke(); }
    // headwear
    if (kind === 'K' || kind === 'Q') {
      var cy0 = hy - hr * .85; c.beginPath(); c.moveTo(cx - hr * .9, cy0 + hr * .1); c.lineTo(cx - hr * .95, cy0 - hr * (kind === 'K' ? 1 : .7)); c.lineTo(cx - hr * .45, cy0 - hr * .3); c.lineTo(cx, cy0 - hr * (kind === 'K' ? 1.3 : 1.05)); c.lineTo(cx + hr * .45, cy0 - hr * .3); c.lineTo(cx + hr * .95, cy0 - hr * (kind === 'K' ? 1 : .7)); c.lineTo(cx + hr * .9, cy0 + hr * .1); c.closePath(); c.fillStyle = gold; c.fill(); c.strokeStyle = '#7a5410'; c.lineWidth = .5; c.stroke();
      c.fillStyle = red ? '#c01f2d' : '#1c3a78'; c.beginPath(); c.arc(cx, cy0 - hr * .05, hr * .14, 0, 6.3); c.fill();
    } else { c.fillStyle = trim; c.beginPath(); c.moveTo(cx - hr * .95, hy - hr * .5); c.quadraticCurveTo(cx, hy - hr * 1.7, cx + hr * 1.0, hy - hr * .55); c.lineTo(cx + hr * .8, hy - hr * .15); c.lineTo(cx - hr * .85, hy - hr * .15); c.closePath(); c.fill(); c.strokeStyle = '#e8d9a8'; c.lineWidth = Math.max(.6, hr * .12); c.beginPath(); c.moveTo(cx + hr * .5, hy - hr * 1.0); c.quadraticCurveTo(cx + hr * 1.4, hy - hr * 1.7, cx + hr * 1.5, hy - hr * .9); c.stroke(); }
    // held item
    c.strokeStyle = gold; c.lineWidth = Math.max(.8, fw * .035); c.beginPath(); c.moveTo(fw * .12, fh); c.lineTo(fw * .12, fh * .3); c.stroke();
    if (kind === 'K') { c.beginPath(); c.moveTo(fw * .04, fh * .52); c.lineTo(fw * .2, fh * .52); c.stroke(); } else if (kind === 'Q') { suit(c, su, fw * .12, fh * .24, fw * .07, red ? RED : BLK); } else { c.beginPath(); c.moveTo(fw * .12, fh * .3); c.lineTo(fw * .2, fh * .4); c.lineTo(fw * .12, fh * .5); c.stroke(); }
    suit(c, su, fw * .85, fh * .3, Math.min(fw, fh) * .1, suitCol(su));
  }
  function court(c, w, h, kind, su) {
    var px = w * .22, py = h * .12, pw = w * .56, ph = h * .76, g = goldGrad(c, py, py + ph);
    rr(c, px, py, pw, ph, 2); c.fillStyle = '#f3e6bf'; c.fill(); c.lineWidth = Math.max(.8, w * .018); c.strokeStyle = g; c.stroke();
    rr(c, px + w * .02, py + w * .02, pw - w * .04, ph - w * .04, 1.5); c.strokeStyle = 'rgba(140,100,22,.6)'; c.lineWidth = .5; c.stroke();
    var fw = pw - w * .06, fh = ph / 2 - w * .02;
    c.save(); c.beginPath(); c.rect(px + w * .03, py + w * .03, fw, fh); c.clip(); c.translate(px + w * .03, py + w * .03); figure(c, kind, su, fw, fh); c.restore();
    c.save(); c.translate(px + pw / 2, py + ph / 2); c.rotate(Math.PI); c.translate(-pw / 2 + w * .03, -ph / 2 + w * .03); c.beginPath(); c.rect(0, 0, fw, fh); c.clip(); figure(c, kind, su, fw, fh); c.restore();
    c.beginPath(); c.moveTo(px + w * .03, py + ph / 2); c.lineTo(px + pw - w * .03, py + ph / 2); c.strokeStyle = g; c.lineWidth = Math.max(.6, w * .012); c.stroke();
  }
  function ornateAce(c, w, h, su) {
    var cx = w / 2, cy = h / 2, R = Math.min(w, h) * .3, col = suitCol(su);
    c.strokeStyle = goldGrad(c, cy - R, cy + R); c.lineWidth = Math.max(.7, w * .015);
    c.beginPath(); c.arc(cx, cy, R * 1.45, 0, 6.3); c.stroke(); c.lineWidth *= .6; c.beginPath(); c.arc(cx, cy, R * 1.3, 0, 6.3); c.stroke();
    for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; c.beginPath(); c.arc(cx + Math.cos(a) * R * 1.45, cy + Math.sin(a) * R * 1.45, w * .014, 0, 6.3); c.fillStyle = '#c99a32'; c.fill(); }
    suit(c, su, cx, cy, R, col);
  }
  function joker(c, w, h, big) {
    var col = big ? RED : NAVY, cx = w / 2, g = goldGrad(c, 0, h);
    var px = w * .2, py = h * .1, pw = w * .6, ph = h * .8; rr(c, px, py, pw, ph, 3); c.fillStyle = big ? '#fbe9d6' : '#e4eaf6'; c.fill(); c.strokeStyle = g; c.lineWidth = Math.max(.8, w * .018); c.stroke();
    var hy = h * .5, hr = w * .13;
    // hat: three horns with bells
    [[-1, col], [0, '#d9b04a'], [1, col]].forEach(function (p, i) { var dx = p[0] * w * .17, tipx = cx + dx * 1.55, tipy = h * (i === 1 ? .2 : .27); c.beginPath(); c.moveTo(cx - hr * .9 + (p[0] + 1) * hr * .9, hy - hr * .6); c.quadraticCurveTo(cx + dx * 1.2, tipy + h * .08, tipx, tipy); c.quadraticCurveTo(cx + dx * .7, hy - hr * 1.6, cx + (p[0] + 1) * hr * .9 - hr * .9 + hr * .45 * (p[0] === 1 ? 1 : 0) , hy - hr * .6); c.closePath(); c.fillStyle = p[1]; c.fill(); c.beginPath(); c.arc(tipx, tipy, w * .03, 0, 6.3); c.fillStyle = g; c.fill(); });
    c.beginPath(); c.arc(cx, hy, hr, 0, 6.3); c.fillStyle = '#f5dcb8'; c.fill(); c.strokeStyle = 'rgba(80,50,20,.5)'; c.lineWidth = .5; c.stroke();
    c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(cx - hr * .35, hy - hr * .1, w * .012 + .3, 0, 6.3); c.arc(cx + hr * .35, hy - hr * .1, w * .012 + .3, 0, 6.3); c.fill(); c.strokeStyle = RED; c.lineWidth = Math.max(.6, w * .012); c.beginPath(); c.arc(cx, hy + hr * .15, hr * .5, .3, Math.PI - .3); c.stroke();
    // ruff collar
    c.fillStyle = '#fffdf2'; for (var k = -3; k <= 3; k++) { c.beginPath(); c.arc(cx + k * hr * .45, hy + hr * 1.05, hr * .3, 0, 6.3); c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = .4; c.stroke(); }
    c.beginPath(); c.moveTo(cx - hr * 1.5, h * .8); c.lineTo(cx - hr * .9, hy + hr * 1.3); c.lineTo(cx + hr * .9, hy + hr * 1.3); c.lineTo(cx + hr * 1.5, h * .8); c.closePath(); c.fillStyle = col; c.fill();
    // star
    c.save(); c.translate(cx, h * .74); c.beginPath(); for (var j = 0; j < 10; j++) { var rad = j % 2 ? w * .04 : w * .09, a2 = -Math.PI / 2 + j * Math.PI / 5; c.lineTo(Math.cos(a2) * rad, Math.sin(a2) * rad); } c.closePath(); c.fillStyle = g; c.fill(); c.restore();
    // index
    c.fillStyle = col; var fs = Math.max(5, w * .13); c.save(); c.translate(w * .1, h * .1); c.font = 'bold ' + fs + 'px ' + SERIF; c.textAlign = 'center'; c.textBaseline = 'top'; var s = 'JOKER'; for (var q = 0; q < s.length; q++) c.fillText(s[q], 0, q * fs * 1.0); c.restore();
    c.save(); c.translate(w * .9, h * .9); c.rotate(Math.PI); c.font = 'bold ' + fs + 'px ' + SERIF; c.textAlign = 'center'; c.textBaseline = 'top'; for (q = 0; q < s.length; q++) c.fillText(s[q], 0, q * fs); c.restore();
  }
  function faceCard(c, w, h, r, su, jk) {
    var rad = Math.max(2, w * .09); paper(c, w, h, rad);
    if (jk) { joker(c, w, h, jk === 2); return; }
    var col = suitCol(su), name = rkName(r);
    if (w < 34) { // compact: big rank + suit
      ctext(c, name, w * .5, h * .27, Math.min(w * (name.length > 1 ? .5 : .62), h * .36), col); suit(c, su, w * .5, h * .67, Math.min(w * .3, h * .2), col); return;
    }
    var fs = w * (name.length > 1 ? .2 : .25); ctext(c, name, w * .115, h * .095, fs, col, w * .18); suit(c, su, w * .115, h * .095 + fs * .85, w * .07, col);
    c.save(); c.translate(w, h); c.rotate(Math.PI); ctext(c, name, w * .115, h * .095, fs, col, w * .18); suit(c, su, w * .115, h * .095 + fs * .85, w * .07, col); c.restore();
    if (r === 14) { ornateAce(c, w, h, su); return; }
    if (r >= 11) { court(c, w, h, name, su); return; }
    var L = PIPS[r], ps = w * (r >= 9 ? .088 : .098), x0 = w * .5, dx = w * .17, y0 = h * .22, y1 = h * .78;
    if (r <= 3) ps = w * .115;
    L.forEach(function (p) { var x = x0 + p[0] * dx, y = y0 + p[1] * (y1 - y0); if (p[1] > .5) { c.save(); c.translate(x, y); c.rotate(Math.PI); suit(c, su, 0, 0, ps, col); c.restore(); } else suit(c, su, x, y, ps, col); });
  }
  var logo = null, logoOk = false;
  function cardBack(c, w, h) {
    var r = Math.max(2, w * .09); rr(c, 0, 0, w, h, r); c.fillStyle = '#f4ead0'; c.fill();
    var m = Math.max(1.5, w * .06); rr(c, m, m, w - 2 * m, h - 2 * m, r * .6); var g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#16213f'); g.addColorStop(1, '#070a14'); c.fillStyle = g; c.fill();
    c.save(); rr(c, m, m, w - 2 * m, h - 2 * m, r * .6); c.clip(); c.strokeStyle = 'rgba(217,176,74,.5)'; c.lineWidth = Math.max(.4, w * .008); var st = Math.max(4, w * .16);
    for (var i = -h; i < w + h; i += st) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke(); c.beginPath(); c.moveTo(i + h, 0); c.lineTo(i, h); c.stroke(); }
    c.fillStyle = 'rgba(217,176,74,.8)'; for (var xx = 0; xx < w; xx += st) for (var yy = 0; yy < h; yy += st) { }
    c.restore();
    rr(c, m * 1.7, m * 1.7, w - 3.4 * m, h - 3.4 * m, r * .4); c.strokeStyle = goldGrad(c, 0, h); c.lineWidth = Math.max(.6, w * .014); c.stroke();
    var cx = w / 2, cy = h / 2, R = Math.min(w * .3, h * .2);
    c.beginPath(); c.arc(cx, cy, R * 1.15, 0, 6.3); c.fillStyle = '#0a0e1c'; c.fill(); c.strokeStyle = goldGrad(c, cy - R, cy + R); c.lineWidth = Math.max(.8, w * .03); c.stroke();
    c.beginPath(); c.arc(cx, cy, R * .92, 0, 6.3); c.lineWidth = Math.max(.4, w * .01); c.stroke();
    if (logo && logoOk) { c.save(); c.beginPath(); c.arc(cx, cy, R * .86, 0, 6.3); c.clip(); c.drawImage(logo, cx - R * .86, cy - R * .86, R * 1.72, R * 1.72); c.restore(); }
    else { suit(c, 1, cx, cy, R * .5, goldGrad(c, cy - R, cy + R)); }
  }
  /* ---------- mahjong ---------- */
  var DOT = { g: ['#1b7f4a', '#0d4d2b'], b: ['#1f5fb4', '#0f3a7a'], r: ['#c4272f', '#7d1218'] };
  function coin(c, x, y, r, col, big) {
    var d = DOT[col], g = c.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); g.addColorStop(0, d[0]); g.addColorStop(1, d[1]);
    c.beginPath(); c.arc(x, y, r, 0, 6.3); c.fillStyle = g; c.fill();
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = Math.max(.5, r * .1); c.beginPath(); c.arc(x, y, r * .72, 0, 6.3); c.stroke();
    c.beginPath(); c.arc(x, y, r * .45, 0, 6.3); c.fillStyle = d[1]; c.fill(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = Math.max(.4, r * .07); c.stroke();
    c.beginPath(); c.arc(x, y, r * .2, 0, 6.3); c.fillStyle = 'rgba(255,248,230,.9)'; c.fill();
    c.beginPath(); c.arc(x, y, r, 0, 6.3); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = Math.max(.4, r * .06); c.stroke();
    if (big) { for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; c.beginPath(); c.arc(x + Math.cos(a) * r * .86, y + Math.sin(a) * r * .86, r * .06, 0, 6.3); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); } }
  }
  var DOTL = {
    1: [[.5, .5, 'r']], 2: [[.5, .27, 'g'], [.5, .73, 'b']], 3: [[.25, .2, 'b'], [.5, .5, 'r'], [.75, .8, 'g']],
    4: [[.3, .27, 'b'], [.7, .27, 'g'], [.3, .73, 'g'], [.7, .73, 'b']], 5: [[.3, .24, 'b'], [.7, .24, 'g'], [.5, .5, 'r'], [.3, .76, 'g'], [.7, .76, 'b']],
    6: [[.3, .2, 'g'], [.7, .2, 'g'], [.3, .5, 'r'], [.7, .5, 'r'], [.3, .8, 'r'], [.7, .8, 'r']],
    7: [[.2, .15, 'g'], [.5, .25, 'g'], [.8, .35, 'g'], [.3, .62, 'r'], [.7, .62, 'r'], [.3, .86, 'r'], [.7, .86, 'r']],
    8: [[.3, .14, 'b'], [.7, .14, 'b'], [.3, .38, 'b'], [.7, .38, 'b'], [.3, .62, 'b'], [.7, .62, 'b'], [.3, .86, 'b'], [.7, .86, 'b']],
    9: [[.2, .2, 'g'], [.5, .2, 'g'], [.8, .2, 'g'], [.2, .5, 'r'], [.5, .5, 'r'], [.8, .5, 'r'], [.2, .8, 'b'], [.5, .8, 'b'], [.8, .8, 'b']]
  };
  function dots(c, n, fx, fy, fw, fh) {
    var pad = fw * .1, aw = fw - 2 * pad, ah = fh - 2 * pad, r = n === 1 ? aw * .4 : n <= 3 ? aw * .24 : n <= 5 ? aw * .2 : n === 7 ? aw * .15 : aw * .16;
    if (n === 6 || n === 8) r = aw * .19; if (n === 9) r = aw * .15;
    DOTL[n].forEach(function (p) { coin(c, fx + pad + p[0] * aw, fy + pad + p[1] * ah, r, p[2], n === 1); });
  }
  function stalk(c, x, y, len, wd, col) {
    var top = y - len / 2, nodes = len > wd * 3.2 ? 2 : 1, g = c.createLinearGradient(x - wd / 2, 0, x + wd / 2, 0), D = col === 'r' ? ['#7d1218', '#d8353d', '#7d1218'] : ['#0b4a28', '#2fb06a', '#0b4a28'];
    g.addColorStop(0, D[0]); g.addColorStop(.45, D[1]); g.addColorStop(1, D[2]);
    var seg = len / nodes;
    for (var i = 0; i < nodes; i++) { rr(c, x - wd / 2, top + i * seg + .3, wd, seg - .6, wd * .35); c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = Math.max(.4, wd * .06); c.stroke(); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - wd * .28, top + i * seg + seg * .15, wd * .1, seg * .7); }
    for (i = 1; i < nodes; i++) { c.fillStyle = col === 'r' ? '#f6c9a0' : '#e8f3c8'; c.fillRect(x - wd * .6, top + i * seg - wd * .12, wd * 1.2, wd * .24); }
  }
  var BAML = {
    2: [[.5, .27], [.5, .73]], 3: [[.5, .27], [.3, .73], [.7, .73]], 4: [[.3, .27], [.7, .27], [.3, .73], [.7, .73]], 5: [[.3, .27], [.7, .27], [.5, .5, 'r'], [.3, .73], [.7, .73]],
    6: [[.2, .27], [.5, .27], [.8, .27], [.2, .73], [.5, .73], [.8, .73]], 7: [[.5, .2, 'r'], [.2, .55], [.5, .55], [.8, .55], [.2, .85], [.5, .85], [.8, .85]],
    8: [[.14, .27], [.38, .27], [.62, .27], [.86, .27], [.14, .73], [.38, .73], [.62, .73], [.86, .73]],
    9: [[.2, .2], [.5, .2, 'r'], [.8, .2], [.2, .5], [.5, .5, 'r'], [.8, .5], [.2, .8], [.5, .8, 'r'], [.8, .8]]
  };
  function bird(c, fx, fy, fw, fh) {
    var cx = fx + fw / 2, cy = fy + fh / 2, s = fw;
    // tail fan
    var cols = ['#0e6b3a', '#c4272f', '#1f5fb4', '#c4272f', '#0e6b3a'];
    for (var i = 0; i < 5; i++) { var a = -Math.PI / 2 + (i - 2) * .38 + 0; c.save(); c.translate(cx, cy + fh * .08); c.rotate((i - 2) * .38 + Math.PI); c.beginPath(); c.ellipse(0, -fh * .2, s * .09, fh * .21, 0, 0, 6.3); c.fillStyle = cols[i]; c.fill(); c.beginPath(); c.arc(0, -fh * .36, s * .045, 0, 6.3); c.fillStyle = '#f6dc86'; c.fill(); c.restore(); }
    c.beginPath(); c.ellipse(cx, cy - fh * .05, s * .17, fh * .15, 0, 0, 6.3); var g = c.createLinearGradient(cx, cy - fh * .2, cx, cy + fh * .1); g.addColorStop(0, '#2fb06a'); g.addColorStop(1, '#0b4a28'); c.fillStyle = g; c.fill();
    c.beginPath(); c.arc(cx, cy - fh * .22, s * .09, 0, 6.3); c.fillStyle = '#1f5fb4'; c.fill();
    c.beginPath(); c.moveTo(cx + s * .08, cy - fh * .23); c.lineTo(cx + s * .2, cy - fh * .19); c.lineTo(cx + s * .08, cy - fh * .17); c.fillStyle = '#e0a020'; c.fill();
    c.beginPath(); c.arc(cx + s * .02, cy - fh * .24, s * .018, 0, 6.3); c.fillStyle = '#fff'; c.fill();
    c.strokeStyle = '#c4272f'; c.lineWidth = Math.max(.7, s * .03); c.beginPath(); c.moveTo(cx - s * .05, cy + fh * .1); c.lineTo(cx - s * .08, cy + fh * .22); c.moveTo(cx + s * .05, cy + fh * .1); c.lineTo(cx + s * .08, cy + fh * .22); c.stroke();
  }
  function bamboo(c, n, fx, fy, fw, fh) {
    if (n === 1) { bird(c, fx, fy, fw, fh); return; }
    var pad = fw * .1, aw = fw - 2 * pad, ah = fh - 2 * pad, L = BAML[n], rows = {}; L.forEach(function (p) { rows[p[1]] = 1; });
    var nr = Object.keys(rows).length, cols = {}; L.forEach(function (p) { cols[p[0]] = 1; }); var nc = Object.keys(cols).length;
    var len = nr === 2 ? ah * .4 : ah * .27, wd = Math.min(aw * (nc >= 4 ? .13 : .17), len * .42);
    if (nr === 2 && nc === 1) len = ah * .38; if (n === 7) len = ah * .26;
    L.forEach(function (p) { stalk(c, fx + pad + p[0] * aw, fy + pad + p[1] * ah, len, wd, p[2] || 'g'); });
  }
  var CN = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  function glyphTile(c, k, fx, fy, fw, fh) {
    var cx = fx + fw / 2, cy = fy + fh / 2;
    if (k < 9) { ctext(c, CN[k], cx, fy + fh * .3, fw * .6, '#b3202a', fw * .8); ctext(c, '萬', cx, fy + fh * .72, fw * .62, '#15171c', fw * .85); return; }
    if (k >= 27 && k <= 30) { ctext(c, ['東', '南', '西', '北'][k - 27], cx, cy, fw * .74, '#15171c', fw * .85); return; }
    if (k === 31) { ctext(c, '中', cx, cy, fw * .8, '#c4272f', fw * .88); return; }
    if (k === 32) { ctext(c, '發', cx, cy, fw * .74, '#0e7a3e', fw * .88); return; }
    // white dragon: blue double frame
    var m = fw * .12; rr(c, fx + m, fy + m * 1.2, fw - 2 * m, fh - 2.4 * m, fw * .08); c.strokeStyle = '#1f5fb4'; c.lineWidth = Math.max(1, fw * .08); c.stroke();
    rr(c, fx + m * 2, fy + m * 2.4, fw - 4 * m, fh - 4.8 * m, fw * .05); c.lineWidth = Math.max(.5, fw * .03); c.stroke();
  }
  function tileBody(c, w, h, back) {
    var t = Math.max(1.5, w * .1), r = Math.max(2, w * .14);
    rr(c, 0, 0, w, h, r); var g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#34a06e'); g.addColorStop(1, '#0f5a38'); c.fillStyle = g; c.fill();
    if (back) {
      rr(c, 0, 0, w, h, r); var bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#2fa575'); bg.addColorStop(1, '#10603c'); c.fillStyle = bg; c.fill();
      c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = .8; c.stroke();
      rr(c, w * .12, h * .1, w * .76, h * .8, r * .6); c.strokeStyle = 'rgba(240,215,130,.8)'; c.lineWidth = Math.max(.5, w * .035); c.stroke();
      var cx = w / 2, cy = h / 2, d = w * .26; c.beginPath(); c.moveTo(cx, cy - d * 1.35); c.lineTo(cx + d, cy); c.lineTo(cx, cy + d * 1.35); c.lineTo(cx - d, cy); c.closePath(); c.fillStyle = goldGrad(c, cy - d, cy + d); c.fill(); c.strokeStyle = 'rgba(80,50,10,.6)'; c.lineWidth = .5; c.stroke();
      c.beginPath(); c.moveTo(cx, cy - d * .65); c.lineTo(cx + d * .5, cy); c.lineTo(cx, cy + d * .65); c.lineTo(cx - d * .5, cy); c.closePath(); c.fillStyle = '#0f5a38'; c.fill();
      return null;
    }
    var fw = w - t * .8, fh = h - t * 1.3; rr(c, 0, 0, fw, fh, r); var fg = c.createLinearGradient(0, 0, fw * .6, fh); fg.addColorStop(0, '#fffef6'); fg.addColorStop(.7, '#f6efd6'); fg.addColorStop(1, '#e6dcba'); c.fillStyle = fg; c.fill();
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = Math.max(.6, w * .03); rr(c, .6, .6, fw - 1.2, fh - 1.2, r * .8); c.stroke();
    rr(c, 0, 0, fw, fh, r); c.strokeStyle = 'rgba(80,100,70,.65)'; c.lineWidth = .7; c.stroke();
    rr(c, 0, 0, w, h, r); c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = .7; c.stroke();
    return { fx: 0, fy: 0, fw: fw, fh: fh };
  }
  function tileFace(c, w, h, k) {
    var f = tileBody(c, w, h, false), px = f.fw * .08;
    if (k >= 9 && k < 18) dots(c, k - 8, f.fx + px, f.fy + px, f.fw - 2 * px, f.fh - 2 * px);
    else if (k >= 18 && k < 27) bamboo(c, k - 17, f.fx + px, f.fy + px, f.fw - 2 * px, f.fh - 2 * px);
    else glyphTile(c, k, f.fx + px, f.fy + px, f.fw - 2 * px, f.fh - 2 * px);
  }
  /* ---------- public draw ---------- */
  function drawCardSprite(ctx, x, y, w, h, kind, a, b) { // kind: 'f' face(rank a, suit b), 'j' joker(a:1 small 2 big), 'b' back
    var key = kind + (kind === 'b' ? (logoOk ? 'L' : '') : a + '.' + (b || 0));
    var sp = sprite(ctx, 'c' + key, w, h, function (c, W, H) { if (kind === 'b') cardBack(c, W, H); else faceCard(c, W, H, kind === 'j' ? 0 : a, b, kind === 'j' ? a : 0); });
    if (!sp) return false;
    var r = Math.max(2, w * .09); rr(ctx, x + .5, y + 2.5, w, h, r); ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fill(); rr(ctx, x + 1, y + 3.5, w, h, r); ctx.fillStyle = 'rgba(0,0,0,.1)'; ctx.fill();
    ctx.drawImage(sp, x, y, w, h); return true;
  }
  function drawTileSprite(ctx, x, y, w, h, k, back) {
    var sp = sprite(ctx, 't' + (back ? 'b' : k), w, h, function (c, W, H) { if (back) tileBody(c, W, H, true); else tileFace(c, W, H, k); });
    if (!sp) return false;
    var r = Math.max(2, w * .14); rr(ctx, x + 1, y + 2.5, w, h, r); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fill();
    ctx.drawImage(sp, x, y, w, h); return true;
  }
  function overlay(ctx, x, y, w, h, r, o) {
    if (o.dim) { rr(ctx, x, y, w, h, r); ctx.fillStyle = 'rgba(30,30,30,.45)'; ctx.fill(); }
    if (o.hl) { rr(ctx, x, y, w, h, r); ctx.fillStyle = 'rgba(255,225,80,.32)'; ctx.fill(); rr(ctx, x, y, w, h, r); ctx.strokeStyle = '#ffd600'; ctx.lineWidth = 2.5; ctx.stroke(); }
    if (o.sel) { rr(ctx, x, y, w, h, r); ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 3; ctx.stroke(); rr(ctx, x - 1, y - 1, w + 2, h + 2, r + 1); ctx.strokeStyle = 'rgba(255,214,0,.35)'; ctx.lineWidth = 2; ctx.stroke(); }
  }
  /* card: kind 'rank' standard rank 2..14 (A=14), su 0..3; joker: rank 0 with big flag */
  function card(ctx, x, y, w, h, rank, su, o) {
    o = o || {}; var ok;
    if (o.back || rank === null) ok = drawCardSprite(ctx, x, y, w, h, 'b'); else if (o.joker) ok = drawCardSprite(ctx, x, y, w, h, 'j', o.joker === 2 ? 2 : 1); else ok = drawCardSprite(ctx, x, y, w, h, 'f', rank, su);
    if (ok) overlay(ctx, x, y, w, h, Math.max(2, w * .09), o); return ok;
  }
  function tile(ctx, x, y, w, h, k, o) { o = o || {}; var ok = drawTileSprite(ctx, x, y, w, h, k, !!o.back); if (ok) overlay(ctx, x, y, w - w * .08, h - h * .09, Math.max(2, w * .14), o); return ok; }
  /* debug sheets */
  function sheet(kind) {
    var cv = mk(1, 1), c, i; if (!cv) return null;
    if (kind === 'tiles') { var tw = 80, th = 112; cv.width = 9 * (tw + 10) + 10; cv.height = 4 * (th + 10) + 10 + th + 10; c = cv.getContext('2d'); c.fillStyle = '#0b3a26'; c.fillRect(0, 0, cv.width, cv.height); for (i = 0; i < 34; i++) tile(c, 10 + (i % 9) * (tw + 10), 10 + Math.floor(i / 9) * (th + 10), tw, th, i, {}); tile(c, 10 + 7 * (tw + 10), 10 + 3 * (th + 10), tw, th, 0, { back: true }); tile(c, 10 + 8 * (tw + 10), 10 + 3 * (th + 10), 40, 56, 0, { back: true }); return cv; }
    var cw = 100, ch = 144; cv.width = 14 * (cw + 8) + 8; cv.height = 4 * (ch + 8) + 8 + ch + 8; c = cv.getContext('2d'); c.fillStyle = '#0b3a26'; c.fillRect(0, 0, cv.width, cv.height);
    for (var s = 0; s < 4; s++) for (var r = 2; r <= 14; r++) card(c, 8 + (r - 2) * (cw + 8), 8 + s * (ch + 8), cw, ch, r, s, {});
    card(c, 8, 8 + 4 * (ch + 8), cw, ch, 0, 0, { joker: 1 }); card(c, 16 + cw, 8 + 4 * (ch + 8), cw, ch, 0, 0, { joker: 2 }); card(c, 24 + 2 * cw, 8 + 4 * (ch + 8), cw, ch, 0, 0, { back: true });
    card(c, 32 + 3 * cw, 8 + 4 * (ch + 8), 46, 66, 12, 1, {}); card(c, 90 + 3 * cw, 8 + 4 * (ch + 8), 26, 36, 10, 3, {}); card(c, 130 + 3 * cw, 8 + 4 * (ch + 8), 22, 30, 14, 0, {});
    return cv;
  }
  function init() { if (typeof Image !== 'undefined' && !logo) { logo = new Image(); logo.onload = function () { logoOk = true; var k; for (k in cache) if (k.indexOf('cb') === 0) delete cache[k]; }; logo.src = 'logo96.png'; } }
  init();
  var API = { card: card, tile: tile, sheet: sheet };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else (self.GH = self.GH || {}).LuxCards = API;
})();
