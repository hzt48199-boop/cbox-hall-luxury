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
  var FONT_FACE = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif';
  var doudizhu = {
    /* Claude 风格: 深色背景 + 绿绒桌 + 金色点缀 (支持真人对战) */
    draw: function (ctx, rect, g, app) {
      var s = g.vs, me = g.seat, W = app.W, H = app.H, names = g.names || {};
      var self = this;
      var top = rect.y, tableH = rect.h;
      var cx = W / 2, cy = top + tableH * 0.42;

      /* ---------- 深色背景 ---------- */
      var bg = ctx.createLinearGradient(0, top, 0, top + tableH);
      bg.addColorStop(0, '#1a0f0a'); bg.addColorStop(0.5, '#12060a'); bg.addColorStop(1, '#0d0508');
      ctx.fillStyle = bg; ctx.fillRect(0, top, W, tableH);

      /* ---------- 绿绒牌桌 (金边) ---------- */
      var tx = 40, ty = top + 90, tw = W - 80, th = tableH - 280;
      // 金色外框
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 15; ctx.shadowOffsetY = 5;
      rrect(ctx, tx - 6, ty - 6, tw + 12, th + 12, 18);
      var gold = ctx.createLinearGradient(tx, ty, tx + tw, ty + th);
      gold.addColorStop(0, '#8a6a2a'); gold.addColorStop(0.5, '#c9a227'); gold.addColorStop(1, '#6b4a1a');
      ctx.fillStyle = gold; ctx.fill();
      ctx.restore();
      // 绿绒面
      var fg = ctx.createRadialGradient(cx, cy, 30, cx, cy, Math.max(tw, th) * 0.7);
      fg.addColorStop(0, '#1e6b4a'); fg.addColorStop(0.6, '#145a3a'); fg.addColorStop(1, '#0d3d28');
      rrect(ctx, tx, ty, tw, th, 14);
      ctx.fillStyle = fg; ctx.fill();

      var pR = me % 3 + 1, pL = (me + 1) % 3 + 1; // 右家, 左家

      /* ---------- 顶栏: 底分 + 底牌 + 金币 ---------- */
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, top, W, 44);
      // 底分
      ctx.fillStyle = '#f5cf6a'; ctx.font = 'bold 15px ' + FONT_FACE; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('底分 ' + (s.base || 100), 50, top + 22);
      // 返回
      ctx.beginPath(); ctx.arc(24, top + 22, 16, 0, 6.3);
      ctx.fillStyle = '#5a3a22'; ctx.fill();
      ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#f5cf6a'; ctx.font = 'bold 16px ' + FONT_FACE; ctx.textAlign = 'center';
      ctx.fillText('‹', 24, top + 23);
      app.hits.push({ x: 8, y: top + 6, w: 32, h: 32, label: 'back', cb: function () { if (app.leaveGame) app.leaveGame(); } });
      // 底牌 (3张牌背)
      var bottom = s.bottom || [];
      for (var bi = 0; bi < 3; bi++) {
        var bx = cx - 45 + bi * 32;
        if (bottom[bi] !== undefined && (s.phase === 'play' || s.over)) {
          drawPoker(ctx, bx, top + 8, 28, 40, bottom[bi], {});
        } else {
          // 牌背
          ctx.save();
          rrect(ctx, bx, top + 8, 28, 40, 4);
          var bbg = ctx.createLinearGradient(bx, top + 8, bx + 28, top + 48);
          bbg.addColorStop(0, '#2f6fd0'); bbg.addColorStop(1, '#1a3a7a');
          ctx.fillStyle = bbg; ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();
          ctx.restore();
        }
      }
      // 金币
      ctx.fillStyle = '#ffd23c'; ctx.font = 'bold 14px ' + FONT_FACE; ctx.textAlign = 'right';
      ctx.fillText('🪙' + (s.coins !== undefined ? s.coins : 2000), W - 16, top + 22);

      /* ---------- 倍数 ---------- */
      if (s.mult) {
        ctx.save();
        rrect(ctx, cx - 50, ty - 24, 100, 28, 14);
        ctx.fillStyle = 'rgba(60,20,20,0.85)'; ctx.fill();
        ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = '#ffd23c'; ctx.font = 'bold 14px ' + FONT_FACE; ctx.textAlign = 'center';
        ctx.fillText('倍数×' + s.mult, cx, ty - 9);
        ctx.restore();
      }

      /* ---------- 玩家头像 (圆形金框) ---------- */
      function avatar(px, py, p, isMe) {
        var nm = names[p] || ('Player' + p);
        var isLord = s.landlord === p;
        var isTurn = s.turn === p && !s.over;
        // 金框
        ctx.save();
        if (isTurn) { ctx.shadowColor = '#ffd23c'; ctx.shadowBlur = 14; }
        ctx.beginPath(); ctx.arc(px, py, 32, 0, 6.3);
        var ag = ctx.createLinearGradient(px - 32, py - 32, px + 32, py + 32);
        ag.addColorStop(0, '#f5cf6a'); ag.addColorStop(1, '#8a6a1a');
        ctx.fillStyle = ag; ctx.fill();
        ctx.restore();
        // 头像底
        ctx.beginPath(); ctx.arc(px, py, 27, 0, 6.3);
        var cols = ['#e02b2b', '#2f6fd0', '#1f9a25'];
        ctx.fillStyle = cols[(p - 1) % 3]; ctx.fill();
        // 身份
        ctx.fillStyle = '#fff'; ctx.font = 'bold 13px ' + FONT_FACE; ctx.textAlign = 'center';
        var role = s.over ? '' : (s.landlord ? (isLord ? '地主' : '农民') : '未定');
        // 简化人脸
        ctx.fillStyle = '#ffdbac'; ctx.beginPath(); ctx.arc(px, py - 4, 12, 0, 6.3); ctx.fill();
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(px - 8, py + 8, 10, 0, 6.3); ctx.arc(px + 8, py + 8, 10, 0, 6.3); ctx.fill();
        // 名字
        ctx.fillStyle = '#fff'; ctx.font = '12px ' + FONT_FACE;
        var dnm = String(nm); if (dnm.length > 6) dnm = dnm.slice(0, 5) + '…';
        ctx.fillText(dnm, px, py + 48);
        // 身份牌
        if (role) {
          ctx.save();
          rrect(ctx, px - 24, py + 56, 48, 20, 10);
          ctx.fillStyle = isLord ? '#c01818' : 'rgba(0,0,0,0.6)'; ctx.fill();
          ctx.fillStyle = '#ffd23c'; ctx.font = 'bold 11px ' + FONT_FACE;
          ctx.fillText(role, px, py + 67);
          ctx.restore();
        }
        // 牌数
        var cnt = s.counts ? s.counts[p] : 0;
        if (cnt > 0 && !isMe) {
          ctx.fillStyle = '#2f6fd0';
          ctx.beginPath(); ctx.arc(px + 26, py - 26, 12, 0, 6.3); ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.font = 'bold 11px ' + FONT_FACE;
          ctx.fillText(cnt, px + 26, py - 25);
        }
      }
      avatar(70, top + 170, pL, false);
      avatar(W - 70, top + 170, pR, false);

      /* ---------- 出牌区 ---------- */
      function showPlays(p, sx, sy, maxW) {
        var plays = s.lastBy && s.lastBy[p];
        if (!plays || !plays.length) return;
        var cw = 44, ch = 62, gap = 28;
        var tw2 = (plays.length - 1) * gap + cw;
        var x0 = sx - tw2 / 2;
        plays.forEach(function (c, i) {
          drawPoker(ctx, x0 + i * gap, sy, cw, ch, c, {});
        });
      }
      // 左家出牌 (桌左)
      showPlays(pL, tx + 90, cy - 30, 160);
      // 右家出牌 (桌右)
      showPlays(pR, tx + tw - 90, cy - 30, 160);
      // 我出牌 (桌中下)
      if (s.lastBy && s.lastBy[me] && s.lastBy[me].length) {
        showPlays(me, cx, cy + 40, 200);
      }

      /* ---------- 我的手牌 ---------- */
      var hand = (s.hands && s.hands[me]) || [];
      // 排序
      hand = hand.slice().sort(function (a, b) { return self.cardVal(b) - self.cardVal(a); });
      var n = hand.length;
      var cw2 = 56, ch2 = 78;
      var hy = top + tableH - ch2 - 30;
      var step = n > 1 ? Math.min(40, (W - 120 - cw2) / (n - 1)) : 0;
      var sx2 = (W - ((n - 1) * step + cw2)) / 2;
      var sel = g.sel || [];
      for (var i = 0; i < n; i++) {
        (function (i) {
          var c = hand[i];
          var isSel = sel.indexOf(c) >= 0;
          var x = sx2 + i * step, y = hy - (isSel ? 22 : 0);
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2;
          drawPoker(ctx, x, y, cw2, ch2, c, { sel: isSel });
          ctx.restore();
          if (isSel) {
            rrect(ctx, x - 2, y - 2, cw2 + 4, ch2 + 4, 6);
            ctx.strokeStyle = '#ffd23c'; ctx.lineWidth = 2.5; ctx.stroke();
          }
          app.hits.push({
            x: x, y: hy - 22, w: i === n - 1 ? cw2 : step, h: ch2 + 22,
            label: 'card', cb: function () { self.toggleSel(g, c, app); }
          });
        })(i);
      }

      /* ---------- 右侧按钮 (不出/提示/出牌) ---------- */
      function btn(bx, by, bw, bh, label, cb, enabled, primary) {
        ctx.save();
        if (enabled && primary) { ctx.shadowColor = 'rgba(255,180,40,0.5)'; ctx.shadowBlur = 10; }
        rrect(ctx, bx, by, bw, bh, bh / 2);
        if (!enabled) {
          ctx.fillStyle = '#4a4a4a';
        } else if (primary) {
          var pg = ctx.createLinearGradient(bx, by, bx, by + bh);
          pg.addColorStop(0, '#ffb43c'); pg.addColorStop(1, '#e08800');
          ctx.fillStyle = pg;
        } else {
          ctx.fillStyle = '#5a3a22';
        }
        ctx.fill();
        if (enabled) { ctx.strokeStyle = primary ? '#ffeaa4' : '#c9a227'; ctx.lineWidth = 1.5; ctx.stroke(); }
        ctx.restore();
        ctx.fillStyle = enabled ? (primary ? '#5a2a00' : '#ffd23c') : '#888';
        ctx.font = 'bold 16px ' + FONT_FACE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(label, bx + bw / 2, by + bh / 2 + 1);
        if (enabled && cb) app.hits.push({ x: bx, y: by, w: bw, h: bh, label: 'btn_' + label, cb: cb });
      }
      var btnX = W - 110, btnW = 92, btnH = 44;
      var myTurn = s.turn === me && !s.over;
      var canPlay = myTurn && s.phase === 'play';
      var canBid = myTurn && s.phase === 'bid';

      if (canBid) {
        // 叫分按钮
        ['不叫', '1分', '2分', '3分'].forEach(function (lb, bi) {
          btn(btnX, top + tableH - 320 + bi * 56, btnW, btnH, lb, function () { self.doBid(g, bi, app); }, true, bi > 0);
        });
      } else if (canPlay) {
        var hasLast = s.lastBy && s.lastBy[(me + 1) % 3 + 1] && s.lastBy[(me + 1) % 3 + 1].length;
        btn(btnX, top + tableH - 280, btnW, btnH, '不出', function () { self.doPass(g, app); }, !!hasLast, false);
        btn(btnX, top + tableH - 220, btnW, btnH, '提示', function () { self.doHint(g, app); }, true, false);
        btn(btnX, top + tableH - 160, btnW, btnH, '出牌', function () { self.doPlay(g, app); }, sel.length > 0, true);
      }

      /* ---------- 状态 ---------- */
      if (s.over) {
        ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, top, W, tableH);
        ctx.fillStyle = '#ffd23c'; ctx.font = 'bold 36px ' + FONT_FACE; ctx.textAlign = 'center';
        var win = s.winners && s.winners.indexOf(me) >= 0;
        ctx.fillText(win ? '胜利!' : '失败', cx, cy);
        if (s.scores) {
          ctx.fillStyle = '#fff'; ctx.font = '16px ' + FONT_FACE;
          ctx.fillText('得分: ' + (s.scores[me] || 0), cx, cy + 40);
        }
      } else if (myTurn) {
        ctx.fillStyle = '#7CFC00'; ctx.font = 'bold 14px ' + FONT_FACE; ctx.textAlign = 'center';
        ctx.fillText(s.phase === 'bid' ? '请叫分' : '轮到你出牌', cx, top + tableH - 14);
      }
    },

    cardVal: function (c) {
      // 牌值: 3=3 ... K=13, A=14, 2=15, 小王=16, 大王=17
      var r = c % 13;
      if (c >= 52) return c === 52 ? 16 : 17;
      return r === 0 ? 13 : (r === 1 ? 14 : (r === 2 ? 15 : r + 2));
    },

    toggleSel: function (g, c, app) {
      g.sel = g.sel || [];
      var i = g.sel.indexOf(c);
      if (i >= 0) g.sel.splice(i, 1); else g.sel.push(c);
      app.dirty = true;
    },

    doBid: function (g, bid, app) {
      if (app.sendMulti) app.sendMulti({ a: 'bid', bid: bid });
      app.dirty = true;
    },

    doPlay: function (g, app) {
      var sel = g.sel || [];
      if (!sel.length) return;
      if (app.sendMulti) app.sendMulti({ a: 'play', cards: sel.slice() });
      g.sel = [];
      app.dirty = true;
    },

    doPass: function (g, app) {
      if (app.sendMulti) app.sendMulti({ a: 'pass' });
      g.sel = [];
      app.dirty = true;
    },

    doHint: function (g, app) {
      // 简单提示: 选最小的单张
      var s = g.vs, hand = (s.hands && s.hands[g.seat]) || [];
      if (hand.length) {
        var sorted = hand.slice().sort(function (a, b) { return this.cardVal(a) - this.cardVal(b); }.bind(this));
        g.sel = [sorted[0]];
      }
      app.dirty = true;
    }
  };

  /* ================= 麻将 ================= */
  var NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九'], SUITCH = ['万', '筒', '条'], NUM_EN = ['1', '2', '3', '4', '5', '6', '7', '8', '9'], SUITCH_EN = ['CHR', 'DOT', 'BAM'], HON_EN = ['E', 'S', 'W', 'N', 'RD', 'GD'], SUITCOL = ['#b71c1c', '#1565c0', '#2e7d32'];
  /* 筒: 图形圆点布局 (传统点位) */
  function drawDots(ctx, cx, cy, w, h, n) {
    var r = Math.min(w, h) * 0.11;
    function dot(px, py, color, rr) {
      rr = rr || r;
      ctx.beginPath(); ctx.arc(px, py, rr, 0, 6.3);
      ctx.fillStyle = color; ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, rr * 0.55, 0, 6.3);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
    }
    var blue = '#1a5fb4', red = '#d32f2f', green = '#2e8b57';
    var ux = w * 0.28, uy = h * 0.26;
    if (n === 1) {
      // 大同心圆: 蓝外圈红内圈
      ctx.beginPath(); ctx.arc(cx, cy, r * 2.2, 0, 6.3); ctx.fillStyle = blue; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, r * 1.4, 0, 6.3); ctx.fillStyle = red; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.7, 0, 6.3); ctx.fillStyle = '#fff'; ctx.fill();
    } else if (n === 2) { dot(cx, cy - uy, blue); dot(cx, cy + uy, green); }
    else if (n === 3) { dot(cx - ux, cy - uy, blue); dot(cx, cy, red); dot(cx + ux, cy + uy, blue); }
    else if (n === 4) { dot(cx - ux, cy - uy, blue); dot(cx + ux, cy - uy, blue); dot(cx - ux, cy + uy, green); dot(cx + ux, cy + uy, green); }
    else if (n === 5) { dot(cx - ux, cy - uy, blue); dot(cx + ux, cy - uy, blue); dot(cx, cy, red); dot(cx - ux, cy + uy, green); dot(cx + ux, cy + uy, green); }
    else if (n === 6) { dot(cx - ux, cy - uy, red); dot(cx + ux, cy - uy, blue); dot(cx - ux, cy, blue); dot(cx + ux, cy, blue); dot(cx - ux, cy + uy, green); dot(cx + ux, cy + uy, green); }
    else if (n === 7) { dot(cx - ux, cy - uy, red); dot(cx + ux, cy - uy, blue); dot(cx, cy - uy * 0.3, blue); dot(cx - ux, cy + uy * 0.4, blue); dot(cx + ux, cy + uy * 0.4, green); dot(cx - ux * 0.4, cy + uy, green); dot(cx + ux * 0.7, cy + uy, green); }
    else if (n === 8) { var yy = [-uy, -uy * 0.33, uy * 0.33, uy]; yy.forEach(function (dy, i) { dot(cx - ux, cy + dy, i < 2 ? blue : green); dot(cx + ux, cy + dy, i < 2 ? blue : green); }); }
    else if (n === 9) { for (var ix = -1; ix <= 1; ix++) for (var iy = -1; iy <= 1; iy++) dot(cx + ix * ux, cy + iy * uy * 0.9, (ix === 0 && iy === 0) ? red : (iy < 0 ? blue : green)); }
  }
  /* 条: 图形竹节布局 */
  function drawBams(ctx, cx, cy, w, h, n) {
    var bw = Math.min(w, h) * 0.13, bh = bh_ = Math.min(w, h) * 0.30;
    function bam(px, py, color) {
      ctx.fillStyle = color;
      rrect(ctx, px - bw / 2, py - bh / 2, bw, bh, bw * 0.4); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      rrect(ctx, px - bw / 2 + 1, py - bh / 2 + 1, bw * 0.35, bh - 2, bw * 0.2); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px - bw / 2, py); ctx.lineTo(px + bw / 2, py); ctx.stroke();
    }
    var green = '#2e8b57', red = '#d32f2f', blue = '#1a5fb4';
    var ux = w * 0.28, uy = h * 0.24;
    if (n === 1) {
      // 大竹: 单根粗竹节 (简化版, 不画鸟)
      ctx.fillStyle = green; rrect(ctx, cx - bw, cy - bh * 1.2, bw * 2, bh * 2.4, bw * 0.5); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; rrect(ctx, cx - bw + 2, cy - bh * 1.2 + 2, bw * 0.6, bh * 2.4 - 4, bw * 0.3); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.5;
      for (var s = -1; s <= 1; s++) { ctx.beginPath(); ctx.moveTo(cx - bw, cy + s * bh * 0.7); ctx.lineTo(cx + bw, cy + s * bh * 0.7); ctx.stroke(); }
    }
    else if (n === 2) { bam(cx, cy - uy, green); bam(cx, cy + uy, blue); }
    else if (n === 3) { bam(cx - ux, cy - uy, green); bam(cx, cy, red); bam(cx + ux, cy + uy, green); }
    else if (n === 4) { bam(cx - ux, cy - uy, green); bam(cx + ux, cy - uy, green); bam(cx - ux, cy + uy, blue); bam(cx + ux, cy + uy, blue); }
    else if (n === 5) { bam(cx - ux, cy - uy, green); bam(cx + ux, cy - uy, green); bam(cx, cy, red); bam(cx - ux, cy + uy, blue); bam(cx + ux, cy + uy, blue); }
    else if (n === 6) { bam(cx - ux, cy - uy, green); bam(cx + ux, cy - uy, green); bam(cx - ux, cy, green); bam(cx + ux, cy, red); bam(cx - ux, cy + uy, blue); bam(cx + ux, cy + uy, blue); }
    else if (n === 7) { bam(cx - ux, cy - uy, green); bam(cx + ux, cy - uy, green); bam(cx, cy - uy * 0.3, red); bam(cx - ux, cy + uy * 0.4, green); bam(cx + ux, cy + uy * 0.4, blue); bam(cx - ux * 0.4, cy + uy, blue); bam(cx + ux * 0.7, cy + uy, blue); }
    else if (n === 8) { var yy2 = [-uy, -uy * 0.33, uy * 0.33, uy]; yy2.forEach(function (dy, i) { bam(cx - ux, cy + dy, i === 1 ? red : green); bam(cx + ux, cy + dy, i === 1 ? red : blue); }); }
    else if (n === 9) { for (var jx = -1; jx <= 1; jx++) for (var jy = -1; jy <= 1; jy++) bam(cx + jx * ux, cy + jy * uy * 0.9, (jx === 0 && jy === 0) ? red : green); }
  }
  function drawTile(ctx, x, y, w, h, k, o) {
    o = o || {};
    // 腾讯风格 3D 麻将牌: 厚度边 + 暖白牌面
    var dep = Math.max(2, Math.min(4, w * 0.12)); // 厚度
    var r = Math.max(2, w * 0.14);
    // 阴影
    rrect(ctx, x + 1, y + 2 + dep, w, h, r); ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fill();
    // 厚度边 (底部 + 右侧, 深象牙色)
    rrect(ctx, x, y + dep, w, h, r); ctx.fillStyle = '#d8cfae'; ctx.fill();
    rrect(ctx, x + dep * 0.5, y + dep, w - dep * 0.5, h - dep * 0.5, r);
    ctx.fillStyle = '#e8e0c4'; ctx.fill();
    // 牌面
    rrect(ctx, x, y, w, h - dep * 0.3, r);
    if (o.back) {
      // 腾讯绿牌背: 亮绿 + 菱形暗纹
      var bg = ctx.createLinearGradient(x, y, x, y + h);
      bg.addColorStop(0, '#35d06a'); bg.addColorStop(0.5, '#25b456'); bg.addColorStop(1, '#1a8a40');
      ctx.fillStyle = bg; ctx.fill();
      ctx.save(); rrect(ctx, x, y, w, h - dep * 0.3, r); ctx.clip(); ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
      for (var di = -h; di < w + h; di += 8) { ctx.beginPath(); ctx.moveTo(x + di, y); ctx.lineTo(x + di + h, y + h); ctx.stroke(); }
      ctx.restore();
    } else {
      // 暖白牌面
      var fg = ctx.createLinearGradient(x, y, x, y + h);
      if (o.hl) { fg.addColorStop(0, '#fff8c8'); fg.addColorStop(1, '#ffe98a'); }
      else { fg.addColorStop(0, '#fffdf6'); fg.addColorStop(0.6, '#fff9ec'); fg.addColorStop(1, '#f5edd8'); }
      ctx.fillStyle = fg; ctx.fill();
    }
    // 描边
    rrect(ctx, x, y, w, h - dep * 0.3, r);
    ctx.strokeStyle = o.sel ? '#1e88e5' : o.hl ? '#e6a800' : '#b8ab8a'; ctx.lineWidth = o.sel || o.hl ? 2.5 : 1.2; ctx.stroke();
    // 牌面内高光
    rrect(ctx, x + 1.5, y + 1.5, w - 3, (h - dep * 0.3) * 0.4, r * 0.6);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1; ctx.stroke();
    if (o.back) return;
    // 牌面字符
    var faceH = h - dep * 0.3, cy = y + faceH / 2, cxx = x + w / 2;
    var fs = Math.max(8, w * 0.52);
    var en = typeof I !== 'undefined' && I.lang !== 'zh';
    if (k < 9) {
      // 万: 数字 + 萬 (传统文字牌)
      text(ctx, (en ? NUM_EN : NUM)[k % 9], cxx, y + faceH * 0.32, fs, '#1a1a1a', true);
      text(ctx, en ? 'WAN' : '萬', cxx, y + faceH * 0.70, fs * 0.88, '#d32f2f', true);
    } else if (k < 18) {
      // 筒: 图形圆点
      drawDots(ctx, cxx, cy, w * 0.86, faceH * 0.86, k - 9 + 1);
    } else if (k < 27) {
      // 条: 图形竹节
      drawBams(ctx, cxx, cy, w * 0.86, faceH * 0.86, k - 18 + 1);
    }
    else if (k === 33) { rrect(ctx, x + w * 0.22, y + faceH * 0.2, w * 0.56, faceH * 0.6, 2); ctx.strokeStyle = '#1565c0'; ctx.lineWidth = Math.max(1.5, w * 0.08); ctx.stroke(); }
    else text(ctx, en ? HON_EN[k - 27] : T(M.KN[k]), cxx, cy, en ? fs * 0.9 : fs * 1.15, k === 31 ? '#d32f2f' : k === 32 ? '#2e8b47' : '#1a1a1a', true);
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

      /* ---------- 腾讯风格: 青蓝绒面铺满全屏 (无木框无缝) ---------- */
      var fx = 0, fy = top, fw = W, fh = tableH;
      var fg = ctx.createRadialGradient(W/2, fy + fh*0.45, 20, W/2, fy + fh*0.5, Math.max(fw, fh)*0.75);
      fg.addColorStop(0, '#1a7a3c'); fg.addColorStop(0.55, '#146631'); fg.addColorStop(1, '#0d4d26');
      ctx.fillStyle = fg; ctx.fillRect(fx, fy, fw, fh); // 直角铺满, 无圆角露底
      // 绒面暗纹
      ctx.save(); ctx.rect(fx, fy, fw, fh); ctx.clip(); ctx.globalAlpha = 0.06;
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
