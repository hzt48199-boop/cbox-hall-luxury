/* Luxury theme helpers (code-drawn): gold bevel, walnut wood, felt, damask. Shared by web + minigame. */
(function () {
  var cache = {};
  var GOLD = '#e6c35c', GOLD_HI = '#fff1b8', GOLD_LO = '#8a6420', BROWN = '#2a170b';
  function rr(c, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function mk(w, h) { if (typeof document !== 'undefined') { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; } return null; }
  function goldGrad(c, y, h, dark) { var g = c.createLinearGradient(0, y, 0, y + h); if (dark) { g.addColorStop(0, '#f0d27a'); g.addColorStop(.5, '#b48a2e'); g.addColorStop(1, '#6e4c14'); } else { g.addColorStop(0, GOLD_HI); g.addColorStop(.38, '#e8c45a'); g.addColorStop(.7, '#b78b2c'); g.addColorStop(1, '#7c5516'); } return g; }
  /* small tiling damask pattern on deep green */
  function damask(c) {
    if (cache.dm !== undefined) return cache.dm;
    var cv = mk(64, 64); if (!cv) return (cache.dm = null);
    var t = cv.getContext('2d'); t.fillStyle = '#0a2216'; t.fillRect(0, 0, 64, 64);
    t.strokeStyle = 'rgba(214,176,80,0.13)'; t.fillStyle = 'rgba(214,176,80,0.07)'; t.lineWidth = 1.2;
    [[16, 16], [48, 48]].forEach(function (p) {
      t.beginPath(); t.moveTo(p[0], p[1] - 13); t.quadraticCurveTo(p[0] + 12, p[1] - 3, p[0], p[1] + 13); t.quadraticCurveTo(p[0] - 12, p[1] - 3, p[0], p[1] - 13); t.fill(); t.stroke();
      t.beginPath(); t.arc(p[0], p[1], 3, 0, 6.3); t.stroke();
    });
    t.beginPath(); t.moveTo(32, 0); t.quadraticCurveTo(48, 16, 32, 32); t.quadraticCurveTo(16, 48, 32, 64); t.stroke();
    try { return (cache.dm = c.createPattern(cv, 'repeat')); } catch (e) { return (cache.dm = null); }
  }
  function velvet(c, W, H) {
    var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0f3322'); g.addColorStop(1, '#06160e'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    var p = damask(c); if (p) { c.fillStyle = p; c.fillRect(0, 0, W, H); }
    var v = c.createRadialGradient(W / 2, H * 0.4, Math.min(W, H) * 0.3, W / 2, H * 0.5, Math.max(W, H) * 0.8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
  }
  /* walnut wood tile (grain via seeded streaks) */
  function woodTile() {
    if (cache.wd !== undefined) return cache.wd;
    var cv = mk(128, 128); if (!cv) return (cache.wd = null);
    var t = cv.getContext('2d'), g = t.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, '#4a2c16'); g.addColorStop(.5, '#5e3a1e'); g.addColorStop(1, '#3f2411'); t.fillStyle = g; t.fillRect(0, 0, 128, 128);
    var s = 7; function rnd() { s = (s * 16807) % 2147483647; return s / 2147483647; }
    for (var i = 0; i < 70; i++) { var y = rnd() * 128, a = rnd() * .16; t.strokeStyle = rnd() > .5 ? 'rgba(20,8,0,' + a + ')' : 'rgba(210,150,80,' + a * .6 + ')'; t.lineWidth = .5 + rnd() * 1.6; t.beginPath(); t.moveTo(0, y); t.bezierCurveTo(40, y + (rnd() - .5) * 8, 90, y + (rnd() - .5) * 8, 128, y + (rnd() - .5) * 3); t.stroke(); }
    return (cache.wd = tv(t, cv));
  }
  function tv(t, cv) { try { return t.createPattern(cv, 'repeat'); } catch (e) { return null; } }
  function wood(c, x, y, w, h, r, light) {
    rr(c, x, y, w, h, r); var p = woodTile(); c.fillStyle = p || '#5a3a20'; c.fill();
    if (light) { rr(c, x, y, w, h, r); c.fillStyle = 'rgba(255,200,120,0.28)'; c.fill(); }
    var g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(255,220,160,0.18)'); g.addColorStop(.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.35)'); rr(c, x, y, w, h, r); c.fillStyle = g; c.fill();
  }
  function goldRing(c, x, y, w, h, r, lw) { rr(c, x, y, w, h, r); c.strokeStyle = goldGrad(c, y, h, true); c.lineWidth = lw || 2; c.stroke(); }
  /* ornate frame: gold double border + corner notches */
  function frame(c, x, y, w, h, r) {
    goldRing(c, x, y, w, h, r, 3); goldRing(c, x + 5, y + 5, w - 10, h - 10, Math.max(2, r - 4), 1);
    c.fillStyle = GOLD; [[x + 5, y + 5], [x + w - 5, y + 5], [x + 5, y + h - 5], [x + w - 5, y + h - 5]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], 3, 0, 6.3); c.fill(); });
  }
  /* table: walnut rim + gold line + green felt; returns inner rect */
  function table(c, x, y, w, h, r) {
    c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 18; c.shadowOffsetY = 6; wood(c, x, y, w, h, r); c.restore();
    goldRing(c, x + 3, y + 3, w - 6, h - 6, r - 2, 1.5);
    var b = Math.max(10, Math.min(w, h) * 0.035), ix = x + b, iy = y + b, iw = w - 2 * b, ih = h - 2 * b;
    rr(c, ix, iy, iw, ih, Math.max(4, r - b)); var g = c.createRadialGradient(x + w / 2, y + h * 0.45, 10, x + w / 2, y + h * 0.5, Math.max(w, h) * 0.7); g.addColorStop(0, '#2a7a4e'); g.addColorStop(.6, '#1b5a38'); g.addColorStop(1, '#0f3a24'); c.fillStyle = g; c.fill();
    c.save(); rr(c, ix, iy, iw, ih, Math.max(4, r - b)); c.clip(); c.shadowColor = 'rgba(0,0,0,0.7)'; c.shadowBlur = 16; c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 6; rr(c, ix - 3, iy - 3, iw + 6, ih + 6, r); c.stroke(); c.restore();
    return { x: ix, y: iy, w: iw, h: ih };
  }
  var STY = {
    gold: { hi: 0, fg: '#2a170b' }, dark: { fg: '#f3e2a6' }, crimson: { fg: '#ffe9e0' }, blue: { fg: '#e6f0ff' }, green: { fg: '#eaffee' }, off: { fg: '#6d6a60' }
  };
  function fillFor(c, st, y, h) {
    var g = c.createLinearGradient(0, y, 0, y + h);
    if (st === 'gold') return goldGrad(c, y, h);
    if (st === 'crimson') { g.addColorStop(0, '#d8453b'); g.addColorStop(.5, '#a01c1c'); g.addColorStop(1, '#5e0e10'); }
    else if (st === 'blue') { g.addColorStop(0, '#3c58b8'); g.addColorStop(.5, '#1e2f78'); g.addColorStop(1, '#0f1842'); }
    else if (st === 'green') { g.addColorStop(0, '#2f8a55'); g.addColorStop(.5, '#17583a'); g.addColorStop(1, '#0b3322'); }
    else if (st === 'off') { g.addColorStop(0, '#2a2a28'); g.addColorStop(1, '#161615'); }
    else { g.addColorStop(0, '#3a3a36'); g.addColorStop(.5, '#1f1f1d'); g.addColorStop(1, '#0d0d0c'); }
    return g;
  }
  /* bevelled button (gold rim + glossy body). st: gold|dark|crimson|blue|green|off */
  function button(c, x, y, w, h, r, st, sel) {
    c.save(); c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 8; c.shadowOffsetY = 3; rr(c, x, y, w, h, r); c.fillStyle = st === 'off' ? '#3a3320' : goldGrad(c, y, h, true); c.fill(); c.restore();
    var i = Math.max(1.5, Math.min(3, h * 0.07)); rr(c, x + i, y + i, w - 2 * i, h - 2 * i, Math.max(2, r - i)); c.fillStyle = fillFor(c, st, y, h); c.fill();
    if (st !== 'gold') { rr(c, x + i, y + i, w - 2 * i, h - 2 * i, Math.max(2, r - i)); c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 1; c.stroke(); }
    c.save(); rr(c, x + i, y + i, w - 2 * i, h - 2 * i, Math.max(2, r - i)); c.clip(); var gl = c.createLinearGradient(0, y, 0, y + h * 0.55); gl.addColorStop(0, 'rgba(255,255,255,0.28)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gl; c.fillRect(x, y, w, h * 0.55); c.restore();
    if (sel) { rr(c, x - 2, y - 2, w + 4, h + 4, r + 2); c.strokeStyle = '#fff3c0'; c.lineWidth = 1.5; c.stroke(); }
  }
  /* pill toggle with knob */
  function pill(c, x, y, w, h, on) {
    rr(c, x, y, w, h, h / 2); var g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, on ? '#8a5a22' : '#2a2a28'); g.addColorStop(1, on ? '#4a2c10' : '#111'); c.fillStyle = g; c.fill();
    goldRing(c, x, y, w, h, h / 2, 1.5);
    var kr = h / 2 - 3, kx = on ? x + w - kr - 3 : x + kr + 3, ky = y + h / 2;
    var kg = c.createRadialGradient(kx - kr * .3, ky - kr * .3, 1, kx, ky, kr); kg.addColorStop(0, on ? '#fff0b0' : '#9a9a92'); kg.addColorStop(1, on ? '#a47a22' : '#44443f'); c.beginPath(); c.arc(kx, ky, kr, 0, 6.3); c.fillStyle = kg; c.fill();
  }
  function boardFrame(c, x, y, w, h) { // walnut rim + gold bevel + corner studs around a board face
    var p = Math.max(5, Math.min(w, h) * 0.02); c.save(); c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 14; c.shadowOffsetY = 4; wood(c, x - p, y - p, w + 2 * p, h + 2 * p, 8); c.restore();
    goldRing(c, x - p + 2, y - p + 2, w + 2 * p - 4, h + 2 * p - 4, 6, 1.5); goldRing(c, x - 1, y - 1, w + 2, h + 2, 1, 1.5);
    c.fillStyle = GOLD; [[x - p / 2, y - p / 2], [x + w + p / 2, y - p / 2], [x - p / 2, y + h + p / 2], [x + w + p / 2, y + h + p / 2]].forEach(function (q) { c.beginPath(); c.arc(q[0], q[1], Math.max(2, p * .22), 0, 6.3); c.fill(); });
  }
  function boardGrain(c, x, y, w, h) { var p = woodTile(); if (!p) return; c.save(); c.globalAlpha = 0.16; c.fillStyle = p; c.fillRect(x, y, w, h); c.restore(); }
  function guess(col) { return 'dark'; }
  function plate(c, x, y, w, h, r) { // dark-glass panel with gold hairline
    rr(c, x, y, w, h, r); var g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(8,26,17,0.92)'); g.addColorStop(1, 'rgba(3,12,8,0.92)'); c.fillStyle = g; c.fill();
    goldRing(c, x, y, w, h, r, 1.3);
  }
  /* CB chip */
  function chip(c, x, y, r, col) {
    c.beginPath(); c.arc(x, y + 1.5, r, 0, 6.3); c.fillStyle = 'rgba(0,0,0,.4)'; c.fill();
    c.beginPath(); c.arc(x, y, r, 0, 6.3); c.fillStyle = col || '#16130f'; c.fill(); c.strokeStyle = goldGrad(c, y - r, r * 2, true); c.lineWidth = Math.max(1.5, r * .16); c.stroke();
    c.save(); c.setLineDash([r * .5, r * .5]); c.beginPath(); c.arc(x, y, r * .78, 0, 6.3); c.strokeStyle = 'rgba(240,220,160,.7)'; c.lineWidth = Math.max(1, r * .14); c.stroke(); c.restore();
  }
  function cardBack(c, x, y, w, h, r) {
    rr(c, x, y, w, h, r); c.fillStyle = '#f2e7c6'; c.fill();
    rr(c, x + 2, y + 2, w - 4, h - 4, r); c.fillStyle = '#16120d'; c.fill(); goldRing(c, x + 3.5, y + 3.5, w - 7, h - 7, r, 1);
    var cx = x + w / 2, cy = y + h / 2, d = Math.min(w, h * .6) * .32; c.strokeStyle = GOLD; c.lineWidth = Math.max(1, w * .03);
    c.beginPath(); c.moveTo(cx, cy - d * 1.6); c.lineTo(cx + d, cy); c.lineTo(cx, cy + d * 1.6); c.lineTo(cx - d, cy); c.closePath(); c.stroke();
    c.beginPath(); c.arc(cx, cy, d * .45, 0, 6.3); c.stroke();
  }
  var API = { GOLD: GOLD, GOLD_HI: GOLD_HI, GOLD_LO: GOLD_LO, BROWN: BROWN, rr: rr, goldGrad: goldGrad, velvet: velvet, wood: wood, goldRing: goldRing, frame: frame, table: table, button: button, pill: pill, plate: plate, chip: chip, cardBack: cardBack, STY: STY, boardFrame: boardFrame, boardGrain: boardGrain, guess: guess };
  if (typeof module !== "undefined" && module.exports) module.exports = API; else (self.GH = self.GH || {}).Lux = API;
})();
