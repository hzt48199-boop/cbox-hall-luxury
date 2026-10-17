/* 斗地主与麻将的 Canvas 2D 绘制(扑克牌 / 麻将牌)。交互区域通过 app.hits 注册(点牌、按钮)。 */
(function () {
  var req = typeof require === 'function';
  var B = req ? require('./boards.js') : GH.Boards;
  var Lux = req ? require('./lux.js') : GH.Lux;
  var LC = req ? (function () { try { return require('./luxcards.js'); } catch (e) { return null; } })() : GH.LuxCards;
  var D = req ? require('./doudizhu.js') : GH.Doudizhu;
  var M = req ? require('./mahjong.js') : GH.Mahjong;
  var Z = req ? require('./zhajinhua.js') : GH.Zhajinhua;
  var HE = req ? require('./holdem.js') : GH.Holdem;
  var I = req ? require('./i18n.js') : GH.I18n, T = I.t;
  function stripYou(n) { return String(n).replace(' (you)', '').replace('(你)', ''); }
  var text = B.text, rrect = B.rrect, circle = B.circle;
  var SUITS = ['♠', '♥', '♣', '♦'], SUIT_RED = [false, true, false, true];

  function drawCard(ctx, x, y, w, h, id, o) {
    o = o || {};
    if (LC) { var r0 = D.rankOf(id); if (o.back ? LC.card(ctx, x, y, w, h, null, 0, o) : r0 >= 16 ? LC.card(ctx, x, y, w, h, 0, 0, { joker: r0 === 17 ? 2 : 1, sel: o.sel, dim: o.dim }) : LC.card(ctx, x, y, w, h, r0 === 15 ? 2 : r0, D.suitOf(id), o)) return; }
    rrect(ctx, x + 1, y + 2, w, h, 5); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
    rrect(ctx, x, y, w, h, 5);
    if (o.back) { Lux.cardBack(ctx, x, y, w, h, 5); return; }
    ctx.fillStyle = o.dim ? '#d9d9d9' : '#fffdf5'; ctx.fill(); ctx.strokeStyle = o.sel ? '#1e88e5' : '#888'; ctx.lineWidth = o.sel ? 3 : 1; ctx.stroke();
    var r = D.rankOf(id), joker = r >= 16, suit = D.suitOf(id), red = joker ? r === 17 : SUIT_RED[suit], col = red ? '#c62828' : '#212121';
    if (joker) { var fs = Math.max(8, w * 0.28); text(ctx, r === 17 ? 'BIG' : 'SMALL', x + w * 0.5, y + h * 0.22, fs * 0.8, col, true); text(ctx, 'JOKER', x + w * 0.5, y + h * 0.42, fs * 0.62, col, true); text(ctx, '★', x + w * 0.5, y + h * 0.72, w * 0.5, col, true); return; }
    text(ctx, D.NAMES[r], x + w * 0.3, y + h * 0.2, Math.max(9, w * 0.4), col, true);
    text(ctx, SUITS[suit], x + w * 0.3, y + h * 0.42, Math.max(8, w * 0.3), col, false);
    text(ctx, SUITS[suit], x + w * 0.62, y + h * 0.7, Math.max(10, w * 0.5), col, false);
  }
  function drawCards(ctx, cards, x, y, cw, ch, step, o) { for (var i = 0; i < cards.length; i++) drawCard(ctx, x + i * step, y, cw, ch, cards[i], o); }

  /* ================= 斗地主 ================= */
  var doudizhu = {
    // g.vs 为"我"的视角状态;g.sel 为选中牌集合(对象 id→true)
    draw: function (ctx, rect, g, app) {
      var s = g.vs, me = g.seat, W = app.W, right = me % 3 + 1, left = (me + 1) % 3 + 1, names = g.names || {};
      var self = this, hand = s.hands[me] || [], n = hand.length;
      // 对手信息框
      [[left, 8, false], [right, W - 8 - 118, true]].forEach(function (q) {
        var p = q[0], x = q[1], y = rect.y + 6, act = s.turn === p && !s.over;
        rrect(ctx, x, y, 118, 66, 10); ctx.fillStyle = act ? 'rgba(255,214,0,0.25)' : 'rgba(0,0,0,0.3)'; ctx.fill(); ctx.strokeStyle = act ? '#ffd600' : 'rgba(255,255,255,0.3)'; ctx.lineWidth = act ? 3 : 1; ctx.stroke();
        text(ctx, T(names[p] || T('Player {0}', p)), x + 59, y + 14, 13, '#fff', true);
        var role = s.landlord ? (p === s.landlord ? 'Landlord' : 'Farmer') : (s.bid && s.bid.bids[p] !== null && s.bid.bids[p] !== undefined ? (s.bid.bids[p] ? T('Bid {0}', s.bid.bids[p]) : 'No Bid') : '');
        text(ctx, role, x + 59, y + 32, 13, s.landlord && p === s.landlord ? '#ffd54f' : '#cfe8d5', true);
        drawCard(ctx, x + 14, y + 40, 18, 22, 0, { back: true }); text(ctx, '× ' + (s.counts[p] === undefined ? 0 : s.counts[p]), x + 62, y + 52, 15, '#fff', true);
        // 最近一手
        var lp = g.lastBy && g.lastBy[p], cx = q[2] ? W - 8 : 8;
        if (lp) {
          var cwid = 22, chei = 30, stp = Math.min(13, (W / 2 - 24) / Math.max(1, lp.cards ? lp.cards.length : 1));
          if (lp.pass) text(ctx, 'Pass', q[2] ? W - 8 - 30 : 8 + 30, y + 92, 16, '#ffcc80', true);
          else { var total = (lp.cards.length - 1) * stp + cwid, sx = q[2] ? W - 8 - total : 8; drawCards(ctx, lp.cards, sx, y + 76, cwid, chei, stp); if (lp.type === 'bomb' || lp.type === 'rocket') text(ctx, lp.type === 'bomb' ? 'Bomb!' : 'Rocket!', q[2] ? W - 40 : 40, y + 120, 14, '#ff8a65', true); }
        }
      });
      // 底牌
      if (s.bottom && s.bottom.length) { text(ctx, 'Kitty', W / 2, rect.y + 14, 12, '#cfe8d5', false); drawCards(ctx, s.bottom, W / 2 - 40, rect.y + 24, 24, 32, 28 * 0.9, {}); }
      // 倍数与底分
      if (s.phase !== 'bid') text(ctx, T('Multiplier ×{0}', s.bid.high * s.mult), W / 2, rect.y + 70, 13, '#ffeb99', true);
      // 手牌
      var wd = W >= 700 && !!LC, cw = wd ? 60 : 46, ch = wd ? 86 : 66, hy = rect.y + rect.h - ch - 10, step = n > 1 ? Math.min(cw * 0.62, (W - 16 - cw) / (n - 1)) : 0, sx = (W - ((n - 1) * step + cw)) / 2;
      for (var i = 0; i < n; i++) {
        (function (i) {
          var id = hand[i], sel = g.sel && g.sel[id], x = sx + i * step, y = hy - (sel ? 16 : 0);
          drawCard(ctx, x, y, cw, ch, id, { sel: sel });
          app.hits.push({ x: x, y: hy - 16, w: i === n - 1 ? cw : step, h: ch + 16, click: false, label: 'card' + id, cb: function () { self.toggle(g, id, app); } });
        })(i);
      }
      // 我最近一手
      var mine = g.lastBy && g.lastBy[me];
      if (mine) { if (mine.pass) text(ctx, 'Pass', W / 2, hy - 74, 18, '#ffcc80', true); else { var st2 = Math.min(18, (W - 60) / Math.max(1, mine.cards.length)), tw = (mine.cards.length - 1) * st2 + 26; drawCards(ctx, mine.cards, (W - tw) / 2, hy - 112, 26, 36, st2); } }
      // 我的身份
      var myRole = s.landlord ? T(me === s.landlord ? 'Landlord' : 'Farmer') : '';
      text(ctx, T(names[me] || 'Me') + (myRole ? ' · ' + myRole : ''), 12, hy - 24 - 36 + 20, 13, s.turn === me && !s.over ? '#ffd600' : '#cfe8d5', true, 'left', 220);
    },
    toggle: function (g, id, app) { g.sel = g.sel || {}; if (g.sel[id]) delete g.sel[id]; else g.sel[id] = true; app.dirty = true; },
    selected: function (g) { return Object.keys(g.sel || {}).map(Number).filter(function (id) { return g.sel[id]; }); }
  };

  /* ================= 麻将 ================= */
  var NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九'], SUITCH = ['万', '筒', '条'], NUM_EN = ['1', '2', '3', '4', '5', '6', '7', '8', '9'], SUITCH_EN = ['CHR', 'DOT', 'BAM'], HON_EN = ['E', 'S', 'W', 'N', 'RD', 'GD'], SUITCOL = ['#b71c1c', '#1565c0', '#2e7d32'];
  function drawTile(ctx, x, y, w, h, k, o) {
    o = o || {};
    if (LC && LC.tile(ctx, x, y, w, h, k, o)) return;
    rrect(ctx, x + 1, y + 2, w, h, 3); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
    rrect(ctx, x, y, w, h, 3);
    if (o.back) { ctx.fillStyle = '#1b7a4b'; ctx.fill(); ctx.strokeStyle = '#d6efe0'; ctx.lineWidth = 1; ctx.stroke(); return; }
    ctx.fillStyle = o.hl ? '#fff3b0' : '#f7f3e3'; ctx.fill(); ctx.strokeStyle = o.sel ? '#1e88e5' : '#9a9a8a'; ctx.lineWidth = o.sel ? 2.5 : 1; ctx.stroke();
    var fs = Math.max(8, w * 0.52);
    var en = I.lang !== 'zh';
    if (k < 27) { var su = Math.floor(k / 9); text(ctx, (en ? NUM_EN : NUM)[k % 9], x + w / 2, y + h * 0.33, fs, '#222', true); text(ctx, (en ? SUITCH_EN : SUITCH)[su], x + w / 2, y + h * 0.7, en ? fs * 0.5 : fs * 0.9, SUITCOL[su], true); }
    else if (k === 33) { rrect(ctx, x + w * 0.2, y + h * 0.2, w * 0.6, h * 0.6, 2); ctx.strokeStyle = '#1565c0'; ctx.lineWidth = 2; ctx.stroke(); }
    else text(ctx, en ? HON_EN[k - 27] : T(M.KN[k]), x + w / 2, y + h * 0.5, en ? fs * 0.9 : fs * 1.2, k === 31 ? '#c62828' : k === 32 ? '#2e7d32' : '#222', true);
  }
  function drawMeld(ctx, m, x, y, w, h) { // 返回占用宽度
    var tiles = m.tiles.slice(0, 4), i;
    for (i = 0; i < tiles.length; i++) drawTile(ctx, x + i * (w + 1), y, w, h, tiles[i], { back: m.type === 'ankong' && (i === 0 || i === 3) });
    return tiles.length * (w + 1) + 4;
  }
  /* 豪华座位面板 v2: 胡桃木外框 + 金色饰边 + 绿绒内衬; 行动回合加金色光晕 */
  function luxPanel(ctx, x, y, w, h, r, active) {
    var hasLux = typeof Lux !== 'undefined';
    // 木框
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 3;
    if (hasLux && Lux.wood) Lux.wood(ctx, x, y, w, h, r);
    else { rrect(ctx, x, y, w, h, r); ctx.fillStyle = '#4a2c16'; ctx.fill(); }
    ctx.restore();
    // 金色饰边
    if (hasLux && Lux.goldRing) Lux.goldRing(ctx, x + 2.5, y + 2.5, w - 5, h - 5, Math.max(2, r - 2), 2);
    else { rrect(ctx, x + 2.5, y + 2.5, w - 5, h - 5, Math.max(2, r - 2)); ctx.strokeStyle = '#e6c35c'; ctx.lineWidth = 2; ctx.stroke(); }
    // 绿绒内衬
    var ix = x + 8, iy = y + 8, iw = w - 16, ih = h - 16, ir = Math.max(2, r - 6);
    rrect(ctx, ix, iy, iw, ih, ir);
    var g = ctx.createLinearGradient(0, iy, 0, iy + ih);
    g.addColorStop(0, '#16452c'); g.addColorStop(0.55, '#0e3320'); g.addColorStop(1, '#072015');
    ctx.fillStyle = g; ctx.fill();
    // 内衬上缘高光
    rrect(ctx, ix, iy, iw, ih, ir); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
    if (active) {
      ctx.save(); ctx.shadowColor = 'rgba(255,200,60,0.8)'; ctx.shadowBlur = 20;
      if (hasLux && Lux.goldRing) Lux.goldRing(ctx, x, y, w, h, r, 3);
      else { rrect(ctx, x, y, w, h, r); ctx.strokeStyle = '#ffd600'; ctx.lineWidth = 3; ctx.stroke(); }
      ctx.restore();
      rrect(ctx, ix, iy, iw, ih, ir); ctx.fillStyle = 'rgba(255,214,0,0.12)'; ctx.fill();
    }
  }

  var FONT_FACE = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif';
  /* 玩家头像圈: 金色圆环 + 深色底 + 单字 */
  function avatar(ctx, cx, cy, r, ch, active) {
    ctx.save();
    if (active) { ctx.shadowColor = 'rgba(255,200,60,0.7)'; ctx.shadowBlur = 10; }
    var g = ctx.createRadialGradient(cx - r * .3, cy - r * .3, 1, cx, cy, r);
    g.addColorStop(0, '#3a4a3f'); g.addColorStop(1, '#16211b');
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.3); ctx.fillStyle = g; ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.3);
    ctx.strokeStyle = active ? '#ffd600' : '#c9a84c'; ctx.lineWidth = active ? 2.5 : 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r - 3, 0, 6.3); ctx.strokeStyle = 'rgba(201,168,76,0.35)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = active ? '#ffd600' : '#e8d48a'; ctx.font = 'bold ' + Math.round(r * 1.1) + 'px ' + FONT_FACE;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, cx, cy + 1);
  }

  /* 中央金色徽标: 双圆环 + 麻将字符 */
  function centerEmblem(ctx, cx, cy, r) {
    ctx.save(); ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.3); ctx.strokeStyle = '#c9a84c'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r - 6, 0, 6.3); ctx.strokeStyle = 'rgba(201,168,76,0.6)'; ctx.lineWidth = 1; ctx.stroke();
    // 四角小饰
    for (var i = 0; i < 4; i++) {
      var a = i * Math.PI / 2 + Math.PI / 4, sx = cx + Math.cos(a) * r, sy = cy + Math.sin(a) * r;
      ctx.beginPath(); ctx.arc(sx, sy, 3, 0, 6.3); ctx.fillStyle = '#c9a84c'; ctx.fill();
    }
    ctx.fillStyle = '#d4b86a'; ctx.font = 'bold ' + Math.round(r * 0.9) + 'px ' + FONT_FACE;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('麻', cx, cy + 2);
    ctx.restore();
  }
  var mahjong = {
    wind: function (s, p) { return T(['East', 'South', 'West', 'North'][(p - s.dealer + 4) % 4]); },
    windChar: function (s, p) { return ['东', '南', '西', '北'][(p - s.dealer + 4) % 4]; },
    draw: function (ctx, rect, g, app) {
      var s = g.vs, me = g.seat, W = app.W, H = app.H, names = g.names || {}, self = this;
      var top = rect.y, tableH = rect.h;

      /* ---------- 腾讯风格: 青蓝色绒面牌桌 ---------- */
      // 木框
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 15; ctx.shadowOffsetY = 5;
      if (typeof Lux !== 'undefined' && Lux.wood) Lux.wood(ctx, 4, top + 4, W - 8, tableH - 8, 18);
      ctx.restore();
      // 青蓝绒面 (腾讯欢乐麻将标志性颜色)
      var fx = 18, fy = top + 18, fw = W - 36, fh = tableH - 36;
      rrect(ctx, fx, fy, fw, fh, 12);
      var fg = ctx.createRadialGradient(W/2, fy + fh*0.45, 20, W/2, fy + fh*0.5, Math.max(fw, fh)*0.75);
      fg.addColorStop(0, '#2eb5a0'); fg.addColorStop(0.55, '#1e9a88'); fg.addColorStop(1, '#147a6c');
      ctx.fillStyle = fg; ctx.fill();
      // 绒面暗纹
      ctx.save(); rrect(ctx, fx, fy, fw, fh, 12); ctx.clip(); ctx.globalAlpha = 0.06;
      for (var pi = 0; pi < 40; pi++) {
        ctx.beginPath(); ctx.arc(fx + (pi*97 % fw), fy + (pi*57 % fh), 30 + (pi*13 % 40), 0, 6.3);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.restore();

      /* ---------- 座位布局 (相对视角) ---------- */
      // 下家在我右手, 对家在对面, 上家在我左手
      var pRight = me % 4 + 1, pAcross = (me + 1) % 4 + 1, pLeft = (me + 2) % 4 + 1;
      var cx = W / 2, cy = fy + fh * 0.42;

      /* ---------- 中央骰子盒 (腾讯标志性) ---------- */
      var boxS = 86, bx = cx - boxS/2, by = cy - boxS/2;
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
      rrect(ctx, bx, by, boxS, boxS, 8); ctx.fillStyle = '#1a1a1a'; ctx.fill(); ctx.restore();
      rrect(ctx, bx, by, boxS, boxS, 8); ctx.strokeStyle = '#c9a84c'; ctx.lineWidth = 2.5; ctx.stroke();
      // 四角风向
      var winds = ['东', '南', '西', '北'], wpos = [[cx, by+12], [bx+boxS-12, cy], [cx, by+boxS-12], [bx+12, cy]];
      // 当前行动玩家方位高亮
      var actWind = (s.turn - s.dealer + 4) % 4;
      winds.forEach(function (wc, i) {
        var isAct = !s.over && i === actWind;
        ctx.fillStyle = isAct ? '#ffd600' : '#8a8a8a';
        ctx.font = 'bold 13px ' + FONT_FACE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(wc, wpos[i][0], wpos[i][1]);
      });
      // 中央倒计时/牌墙数
      ctx.fillStyle = '#ffd600'; ctx.font = 'bold 30px ' + FONT_FACE;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(Math.max(0, s.wallCount || 0)), cx, cy + 2);

      /* ---------- 四角头像 ---------- */
      function cornerAvatar(px, py, p, isMe) {
        var nm = names[p] || (isMe ? '我' : T('Player {0}', p));
        var act = s.turn === p && !s.over;
        // 头像圆
        ctx.save();
        if (act) { ctx.shadowColor = 'rgba(255,214,0,0.8)'; ctx.shadowBlur = 12; }
        ctx.beginPath(); ctx.arc(px, py, 22, 0, 6.3);
        var ag = ctx.createLinearGradient(px-22, py-22, px+22, py+22);
        // 腾讯风格: 明亮的头像底色
        var cols = ['#ff9a3c', '#4db8ff', '#ff6b9d', '#7ed321'];
        ag.addColorStop(0, cols[(p-1) % 4]); ag.addColorStop(1, cols[(p-1) % 4] + 'aa');
        ctx.fillStyle = ag; ctx.fill(); ctx.restore();
        ctx.beginPath(); ctx.arc(px, py, 22, 0, 6.3);
        ctx.strokeStyle = act ? '#ffd600' : '#fff'; ctx.lineWidth = act ? 3 : 2; ctx.stroke();
        // 风位字
        ctx.fillStyle = '#fff'; ctx.font = 'bold 18px ' + FONT_FACE;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(self.windChar(s, p), px, py + 1);
        // 名字
        ctx.fillStyle = act ? '#ffd600' : '#fff'; ctx.font = '12px ' + FONT_FACE;
        ctx.textAlign = 'center';
        var dnm = T(nm); if (dnm.length > 6) dnm = dnm.slice(0, 5) + '…';
        ctx.fillText(dnm + (p === s.dealer ? ' ·庄' : ''), px, py + 36);
      }
      cornerAvatar(fx + 40, fy + 40, pLeft, false);
      cornerAvatar(fx + fw - 40, fy + 40, pAcross, false);
      cornerAvatar(fx + fw - 40, fy + fh - 64, pRight, false);
      cornerAvatar(fx + 40, fy + fh - 64, me, true);

      /* ---------- 牌墙 (绿色牌背, 沿桌边) ---------- */
      function tileBack(x, y, w, h, vertical) {
        rrect(ctx, x, y, w, h, 3);
        var bg = ctx.createLinearGradient(x, y, x, y + h);
        bg.addColorStop(0, '#3ec46a'); bg.addColorStop(0.5, '#27a552'); bg.addColorStop(1, '#1a7d3e');
        ctx.fillStyle = bg; ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.stroke();
        // 高光
        rrect(ctx, x+2, y+2, w-4, h-4, 2); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke();
      }
      // 上家牌墙 (顶部横排)
      var wallN = Math.min(14, Math.floor((s.wallCount || 0) / 4));
      for (var i = 0; i < 14; i++) {
        if (i < wallN) tileBack(cx - 7*17 + i*17, fy + 52, 15, 22, false);
      }
      // 左右牌墙 (竖排)
      for (var j = 0; j < 14; j++) {
        if (j < wallN) {
          tileBack(fx + 52, cy - 7*24 + j*24, 22, 15, true);
          tileBack(fx + fw - 74, cy - 7*24 + j*24, 22, 15, true);
        }
      }

      /* ---------- 牌河 (中央区域, 围绕骰子盒) ---------- */
      function drawDiscards(p, dx, dy, cols, tscale) {
        var ds = s.discards[p] || [], tw2 = 20 * tscale, th2 = 28 * tscale;
        ds.forEach(function (t, idx) {
          var col = idx % cols, row = Math.floor(idx / cols);
          var hl = s.lastDiscard && s.lastDiscard.seat === p && idx === ds.length - 1 && !s.over;
          drawTile(ctx, dx + col * (tw2 + 1), dy + row * (th2 - 1), tw2, th2 - 2, t, { hl: hl });
        });
      }
      // 各家牌河位置 (骰子盒四周)
      drawDiscards(pAcross, cx - 63, by - 68, 6, 0.85);      // 对家 (骰子盒上方)
      drawDiscards(pLeft, bx - 88, cy - 42, 4, 0.85);        // 上家 (骰子盒左方)
      drawDiscards(pRight, bx + boxS + 22, cy - 42, 4, 0.85); // 下家 (骰子盒右方)
      drawDiscards(me, cx - 63, by + boxS + 14, 6, 0.85);    // 我 (骰子盒下方)

      /* ---------- 副露 (各家旁边) ---------- */
      function drawMelds(p, mx, my, tscale) {
        var melds = s.melds[p] || [], mtw = 13 * tscale, mth = 18 * tscale;
        melds.forEach(function (m) { mx += drawMeld(ctx, m, mx, my, mtw, mth); });
        return mx;
      }
      drawMelds(pAcross, cx + 80, by - 44, 0.9);
      drawMelds(pLeft, fx + 80, fy + 70, 0.9);
      drawMelds(pRight, fx + fw - 180, fy + 70, 0.9);

      /* ---------- 我的手牌 (底部大牌) ---------- */
      var hand = s.hands[me] || [], n = hand.length;
      var hw = Math.min(42, (W - 24) / 15), hh2 = hw * 1.42;
      var hy = fy + fh - hh2 - 52;
      var melds = s.melds[me], mw = hw * 0.62, meldW = 0;
      melds.forEach(function (m) { meldW += m.tiles.length * (mw + 1) + 6; });
      var gap = s.drawn >= 0 && s.turn === me && s.phase === 'discard' ? 10 : 0;
      var total = n * (hw + 1) + gap + meldW, sx = Math.max(8, (W - total) / 2);
      var mxx = sx;
      melds.forEach(function (m) { mxx += drawMeld(ctx, m, mxx, hy + hh2 * 0.3, mw, hh2 * 0.7); });
      var drawnIdx = -1;
      if (gap) { for (var q = n - 1; q >= 0; q--) if (hand[q] === s.drawn) { drawnIdx = q; break; } }
      var arr = hand.map(function (t, i) { return { t: t, i: i }; });
      if (drawnIdx >= 0) { var dd = arr.splice(drawnIdx, 1)[0]; arr.push(dd); }
      arr.forEach(function (e, j) {
        var x = mxx + j * (hw + 1) + (gap && j === arr.length - 1 ? gap : 0);
        var sel = g.selTile === e.t, yy = hy - (sel ? 14 : 0);
        // 腾讯风格: 手牌加阴影更有立体感
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
        drawTile(ctx, x, yy, hw, hh2, e.t, { sel: sel });
        ctx.restore();
        app.hits.push({ x: x, y: hy - 14, w: hw + 1, h: hh2 + 14, click: false, label: 'tile' + e.t, cb: function () { self.tapTile(g, e.t, app); } });
      });
      g.handBottom = hy + hh2;

      /* ---------- 顶部信息条 ---------- */
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.font = '12px ' + FONT_FACE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(T('Wall {0}', Math.max(0, s.wallCount || 0)), cx, fy + 18);
    },
    tapTile: function (g, t, app) {
      var s = g.vs; if (s.over) return;
      var canAct = s.phase === 'discard' && s.turn === g.seat;
      if (g.selTile === t && canAct) { g.selTile = null; app.sendMulti({ a: 'discard', tile: t }); return; }
      g.selTile = t; app.dirty = true;
    }
  };

  /* ================= 炸金花(纯虚拟积分,仅供娱乐)================= */
  function drawPoker(ctx, x, y, w, h, id, o) {
    o = o || {};
    if (LC && LC.card(ctx, x, y, w, h, id === null || id === undefined ? null : Z.rankOf(id), id === null || id === undefined ? 0 : Z.suitOf(id), o)) return;
    rrect(ctx, x + 1, y + 2, w, h, 5); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
    rrect(ctx, x, y, w, h, 5);
    if (id === null || id === undefined || o.back) { Lux.cardBack(ctx, x, y, w, h, 5); if (o.dim) { rrect(ctx, x, y, w, h, 5); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fill(); } return; }
    ctx.fillStyle = '#fffdf5'; ctx.fill(); ctx.strokeStyle = o.hl ? '#ffd600' : '#888'; ctx.lineWidth = o.hl ? 3 : 1; ctx.stroke();
    var su = Z.suitOf(id), red = su === 1 || su === 3, col = red ? '#c62828' : '#212121';
    text(ctx, Z.rankName(Z.rankOf(id)), x + w * 0.3, y + h * 0.22, Math.max(9, w * 0.42), col, true);
    text(ctx, SUITS[su], x + w * 0.3, y + h * 0.45, Math.max(8, w * 0.3), col, false);
    text(ctx, SUITS[su], x + w * 0.6, y + h * 0.72, Math.max(10, w * 0.5), col, false);
  }
  function lastAct(s, p) {
    for (var i = s.log.length - 1; i >= 0; i--) { var e = s.log[i]; if (e.seat === p && e.a !== 'look') return e; }
    return null;
  }
  function actText(e) {
    if (!e) return ''; if (e.a === 'call') return T('Call {0}', e.amt); if (e.a === 'raise') return T('Raise to {0}', e.unit); if (e.a === 'fold') return T('Fold'); if (e.a === 'compare') return T('Compare {0}', e.amt); return '';
  }
  var zhajinhua = {
    draw: function (ctx, rect, g, app) {
      var s = g.vs, me = g.seat, W = app.W, names = g.names || {}, self = this, n = s.n, i, p;
      text(ctx, 'For entertainment only, virtual chips, no cash value, not redeemable', W / 2, rect.y + 8, 11, '#ffcc80', true, 'center', W - 12);
      var others = []; for (i = 1; i < n; i++) others.push(((me - 1 + i) % n) + 1);
      var cols = Math.min(3, others.length), cw = (W - 16 - (cols - 1) * 6) / cols, ch = 92, y0 = rect.y + 20;
      var o = g.pick ? Z.options(s, me) : null;
      others.forEach(function (q, idx) {
        var col = idx % cols, row = Math.floor(idx / cols), x = 8 + col * (cw + 6), y = y0 + row * (ch + 6);
        var act = s.turn === q && !s.over, out = s.status[q] !== 'active', tgt = !!(o && o.compare.some(function (c) { return c.target === q; }));
        rrect(ctx, x, y, cw, ch, 10); ctx.fillStyle = out ? 'rgba(0,0,0,0.5)' : act ? 'rgba(255,214,0,0.25)' : 'rgba(0,0,0,0.3)'; ctx.fill();
        ctx.strokeStyle = tgt ? '#00e676' : act ? '#ffd600' : 'rgba(255,255,255,0.3)'; ctx.lineWidth = tgt || act ? 3 : 1; ctx.stroke();
        var nm = T(stripYou(names[q] || T('Player {0}', q))); if (nm.length > 10) nm = nm.slice(0, 9) + '…';
        text(ctx, nm + (q === s.dealer ? T(' · dealer') : ''), x + cw / 2, y + 12, 12, out ? '#90a4ae' : '#fff', true);
        text(ctx, T('Beans {0}', s.stacks[q]), x + cw / 2, y + 27, 12, '#ffeb99', false);
        var st = T(s.status[q] === 'folded' ? 'Folded' : s.status[q] === 'lost' ? 'Lost compare' : (s.seen[q] ? 'Seen' : 'Unseen')), at = actText(lastAct(s, q));
        text(ctx, st + (at && !out ? ' · ' + at : ''), x + cw / 2, y + 42, 11, out ? '#b0bec5' : (s.seen[q] ? '#a5d6a7' : '#cfe8d5'), false);
        var hs = s.hands[q], w2 = 22, h2 = 30, tot = 3 * w2 + 2 * 4, sx = x + (cw - tot) / 2;
        for (var c = 0; c < 3; c++) drawPoker(ctx, sx + c * (w2 + 4), y + 50, w2, h2, hs ? hs[c] : null, { back: !hs, dim: out });
        if (hs && s.handNames[q]) text(ctx, T(s.handNames[q]), x + cw / 2, y + ch - 5, 10, '#ffd54f', true);
        if (tgt) app.hits.push({ x: x, y: y, w: cw, h: ch, label: 'target' + q, cb: function () { g.pick = false; app.sendMulti({ a: 'compare', target: q }); } });
      });
      var rows = Math.ceil(others.length / cols), cy = y0 + rows * (ch + 6) + 6;
      text(ctx, T('Total pot {0}', s.pot), W / 2, cy + 14, 22, '#ffeb99', true);
      text(ctx, T('Round {0}/{1} · Ante {2} · Current unit {3} (seen players pay {4})', Math.min(s.round, s.maxRounds), s.maxRounds, s.ante, s.unit, 2 * s.unit), W / 2, cy + 36, 12, '#cfe8d5', false);
      // 我的牌与状态
      var wd = W >= 700 && !!LC, hand = s.hands[me], cw2 = wd ? 72 : 54, chh = wd ? 100 : 76, gap = 8, tw = 3 * cw2 + 2 * gap, sx2 = (W - tw) / 2, botY = rect.y + rect.h, hy = botY - 98 - 8 - chh, act2 = s.turn === me && !s.over, out2 = s.status[me] !== 'active';
      var myst = T(out2 ? (s.status[me] === 'folded' ? 'Folded' : 'Lost compare') : (s.seen[me] ? 'Seen' : 'Unseen (tap Look to see your cards)'));
      text(ctx, T(stripYou(names[me] || 'Me')) + (me === s.dealer ? T(' · dealer') : '') + ' · ' + T('Beans {0}', s.stacks[me]) + ' · ' + myst, W / 2, hy - 12, 13, act2 ? '#ffd600' : '#cfe8d5', true);
      for (i = 0; i < 3; i++) drawPoker(ctx, sx2 + i * (cw2 + gap), hy, cw2, chh, hand ? hand[i] : null, { back: !hand, dim: out2 });
      if (hand && s.handNames[me]) text(ctx, T(s.handNames[me]), W / 2, hy + chh + 11, 14, '#ffd54f', true);
    }
  };

  /* ================= Texas Hold'em (virtual chips, entertainment only) ================= */
  var HD_ACT = { check: 'Check', call: 'Call', bet: 'Bet', raise: 'Raise', allin: 'All-in', fold: 'Fold' };
  var PHASE = { preflop: 'Pre-flop', flop: 'Flop', turn: 'Turn', river: 'River', over: 'Showdown' };
  function hdLast(s, p) { // last action of seat p on the current street
    for (var i = s.log.length - 1; i >= 0; i--) { var e = s.log[i]; if (e.seat === p) return e.street === s.phase || s.over ? e : (e.a === 'fold' || e.a === 'allin' ? e : null); }
    return null;
  }
  var holdem = {
    draw: function (ctx, rect, g, app) {
      var s = g.vs, me = g.seat, W = app.W, names = g.names || {}, n = s.n, i, others = [];
      for (i = 1; i < n; i++) others.push(((me - 1 + i) % n) + 1);
      text(ctx, 'For entertainment only, virtual chips, no cash value, not redeemable', W / 2, rect.y + 8, 11, '#ffcc80', true, 'center', W - 12);
      var cols = Math.min(3, others.length), cw = (W - 16 - (cols - 1) * 6) / cols, ch = 84, y0 = rect.y + 20, botY = rect.y + rect.h;
      var wd = W >= 700 && !!LC, chh = wd ? 100 : 76, cw2 = wd ? 72 : 54, hy = botY - 98 - 8 - chh;
      others.forEach(function (q, idx) {
        var col = idx % cols, row = Math.floor(idx / cols), x = 8 + col * (cw + 6), y = y0 + row * (ch + 5);
        var act = s.turn === q && !s.over, out = s.status[q] === 'folded' || s.status[q] === 'out', win = s.over && s.winners.indexOf(q) >= 0;
        rrect(ctx, x, y, cw, ch, 10); ctx.fillStyle = out ? 'rgba(0,0,0,0.5)' : act ? 'rgba(255,214,0,0.25)' : 'rgba(0,0,0,0.3)'; ctx.fill();
        ctx.strokeStyle = win ? '#ffd54f' : act ? '#ffd600' : 'rgba(255,255,255,0.3)'; ctx.lineWidth = win || act ? 3 : 1; ctx.stroke();
        var nm = T(stripYou(names[q] || T('Player {0}', q))); if (nm.length > 10) nm = nm.slice(0, 9) + '…';
        text(ctx, nm, x + cw / 2 - 6, y + 11, 12, out ? '#90a4ae' : '#fff', true);
        if (q === s.dealer) { circle(ctx, x + cw - 11, y + 11, 8); ctx.fillStyle = '#ffd54f'; ctx.fill(); text(ctx, 'D', x + cw - 11, y + 11, 10, '#333', true); }
        else if (q === s.sbSeat || q === s.bbSeat) text(ctx, q === s.sbSeat ? 'SB' : 'BB', x + cw - 14, y + 11, 10, '#90caf9', true);
        text(ctx, T('Chips {0}', s.stacks[q]), x + cw / 2, y + 25, 12, '#ffeb99', false);
        var la = hdLast(s, q), st = s.status[q] === 'folded' ? T('Folded') : s.status[q] === 'allin' ? T('All-in') : (la ? T(HD_ACT[la.a] || '') : '');
        if (s.bets[q] > 0 && !s.over) st = (st ? st + ' · ' : '') + T('Bet {0}', s.bets[q]);
        text(ctx, st, x + cw / 2, y + 39, 11, out ? '#b0bec5' : '#cfe8d5', false, 'center', cw - 6);
        var hs = s.hands[q], w2 = 22, h2 = 30, sx = x + (cw - (2 * w2 + 4)) / 2;
        if (!out || (hs && s.over)) for (var c = 0; c < 2; c++) drawPoker(ctx, sx + c * (w2 + 4), y + 46, w2, h2, hs ? hs[c] : null, { back: !hs, dim: out });
        if (hs && s.hnames[q]) text(ctx, T(s.hnames[q]), x + cw / 2, y + ch - 4, 9, '#ffd54f', true, 'center', cw - 4);
        if (s.over && s.scores[q] !== 0) text(ctx, (s.scores[q] > 0 ? '+' : '') + s.scores[q], x + cw - 24, y + 56, 13, s.scores[q] > 0 ? '#ffd54f' : '#ef9a9a', true);
      });
      var rows = Math.ceil(others.length / cols), cy = y0 + rows * (ch + 5) + 2;
      // community cards + pot
      var avail = hy - cy - 30, bh = Math.max(34, Math.min(wd ? 96 : 58, avail)), bw = bh * 0.72, gap = 5, tw = 5 * bw + 4 * gap, sx0 = (W - tw) / 2, by = cy + 22;
      text(ctx, T('Pot {0}', s.pot) + ' · ' + T(PHASE[s.phase] || '') + ' · ' + T('Hand #{0} · Blinds {1}/{2}', s.handNo, s.sb, s.bb), W / 2, cy + 9, 13, '#ffeb99', true, 'center', W - 10);
      for (i = 0; i < 5; i++) { if (i < s.board.length) drawPoker(ctx, sx0 + i * (bw + gap), by, bw, bh, s.board[i], {}); else { rrect(ctx, sx0 + i * (bw + gap), by, bw, bh, 5); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; ctx.stroke(); } }
      // my cards
      var hand = s.hands[me], act2 = s.turn === me && !s.over, out2 = s.status[me] === 'folded', sx2 = (W - (2 * cw2 + 8)) / 2, wonMe = s.over && s.winners.indexOf(me) >= 0;
      text(ctx, T(stripYou(names[me] || 'Me')) + (me === s.dealer ? ' (D)' : me === s.sbSeat ? ' (SB)' : me === s.bbSeat ? ' (BB)' : '') + ' · ' + T('Chips {0}', s.stacks[me]) + (s.bets[me] > 0 && !s.over ? ' · ' + T('Bet {0}', s.bets[me]) : '') + (out2 ? ' · ' + T('Folded') : s.status[me] === 'allin' ? ' · ' + T('All-in') : ''), W / 2, hy - 12, 13, act2 ? '#ffd600' : '#cfe8d5', true, 'center', W - 10);
      for (i = 0; i < 2; i++) drawPoker(ctx, sx2 + i * (cw2 + 8), hy, cw2, chh, hand ? hand[i] : null, { back: !hand, dim: out2, hl: wonMe });
      var desc = s.over ? s.hnames[me] : (s.myHand || '');
      if (hand && desc && !out2) text(ctx, T(desc), W / 2, hy + chh + 11, 13, '#ffd54f', true, 'center', W - 10);
    }
  };
  var API = { doudizhu: doudizhu, mahjong: mahjong, zhajinhua: zhajinhua, holdem: holdem, drawPoker: drawPoker, drawCard: drawCard, drawTile: drawTile, drawCards: drawCards };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else (self.GH = self.GH || {}).CardBoards = API;
})();
