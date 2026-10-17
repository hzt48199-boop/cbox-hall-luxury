/* 麻将经典界面覆盖 (1:1 参考图) */
(function () {
  var GH = window.GH || self.GH;
  if (!GH || !GH.CardBoards) return;
  var drawTile = GH.CardBoards.drawTile;
  var B = GH.Boards;

  var newMahjong = {
    draw: function (ctx, rect, g, app) {
      var s = g.vs, me = g.seat, W = app.W;
      var names = g.names || {};
      var top = rect.y, tableH = rect.h;
      var cx = W / 2, cy = top + tableH * 0.40;

      // === 绿绒桌面 ===
      var fg = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(W, tableH) * 0.75);
      fg.addColorStop(0, '#1a7a3c');
      fg.addColorStop(0.6, '#146631');
      fg.addColorStop(1, '#0d4d26');
      ctx.fillStyle = fg;
      ctx.fillRect(0, top, W, tableH);

      // === 木框 (四边) ===
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(0, top, W, 12);
      ctx.fillRect(0, top + tableH - 12, W, 12);
      ctx.fillRect(0, top, 12, tableH);
      ctx.fillRect(W - 12, top, 12, tableH);
      ctx.strokeStyle = '#c9a227';
      ctx.lineWidth = 2;
      ctx.strokeRect(12, top + 12, W - 24, tableH - 24);

      var pRight = me % 4 + 1, pAcross = (me + 1) % 4 + 1, pLeft = (me + 2) % 4 + 1;

      // === 顶部栏 ===
      ctx.fillStyle = 'rgba(0,0,0,0.30)';
      ctx.fillRect(0, top, W, 40);
      ctx.fillStyle = '#ffe9a8';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Room ' + (s.room || '108'), 44, top + 13);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#d4c48a';
      ctx.fillText('Level: ' + (s.level || 'Expert'), 44, top + 28);
      // 返回
      ctx.beginPath(); ctx.arc(22, top + 20, 14, 0, 6.3);
      ctx.fillStyle = '#5a3d12'; ctx.fill();
      ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('<', 22, top + 21);
      app.hits.push({ x: 8, y: top + 6, w: 28, h: 28, label: 'back', cb: function () { if (app.leaveGame) app.leaveGame(); } });
      // 金币
      ctx.fillStyle = '#ffd600'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText('50000', W - 14, top + 20);

      // === 头像 (金框圆) ===
      function avatar(px, py, p) {
        var act = s.turn === p && !s.over;
        ctx.save();
        if (act) { ctx.shadowColor = '#ffd600'; ctx.shadowBlur = 12; }
        ctx.beginPath(); ctx.arc(px, py, 28, 0, 6.3);
        ctx.fillStyle = '#c9a227'; ctx.fill();
        ctx.restore();
        ctx.beginPath(); ctx.arc(px, py, 23, 0, 6.3);
        var cc = ['#ff9a3c', '#4db8ff', '#ff6b9d', '#9d7bff'][(p - 1) % 4];
        ctx.fillStyle = cc; ctx.fill();
        var wm = {};
        wm[me] = '东'; wm[pRight] = '南'; wm[pAcross] = '西'; wm[pLeft] = '北';
        ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(wm[p] || '', px, py + 1);
        var nm = names[p] || ('P' + p);
        ctx.fillStyle = '#fff'; ctx.font = '11px sans-serif';
        ctx.fillText(String(nm).slice(0, 8), px, py + 40);
      }
      avatar(54, top + 190, pLeft);
      avatar(W - 54, top + 190, pRight);
      avatar(W - 54, top + 88, pAcross);

      // === 中央罗盘 ===
      var cr = 48;
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, 6.3);
      ctx.fillStyle = '#0d1f36'; ctx.fill();
      ctx.restore();
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, 6.3);
      ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 3; ctx.stroke();
      ctx.textAlign = 'center';
      var tw = '';
      if (s.turn === me) tw = '东';
      else if (s.turn === pRight) tw = '南';
      else if (s.turn === pAcross) tw = '西';
      else if (s.turn === pLeft) tw = '北';
      var dirs = [[cx, cy - 28, '南'], [cx + 28, cy, '西'], [cx, cy + 28, '北'], [cx - 28, cy, '东']];
      dirs.forEach(function (d) {
        ctx.fillStyle = d[2] === tw ? '#7CFC00' : '#5eb8f0';
        ctx.font = '16px sans-serif';
        ctx.fillText(d[2], d[0], d[1]);
      });
      ctx.fillStyle = '#ffd600'; ctx.font = 'bold 20px sans-serif';
      ctx.fillText(s.timer !== undefined ? s.timer : (s.wallCount || ''), cx, cy + 1);

      // === 牌墙 (三边) ===
      function back(bx, by, bw, bh) {
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);
      }
      var wn = 10;
      for (var i = 0; i < wn; i++) back(cx - wn * 11 + i * 22, top + 52, 20, 28);
      for (var j = 0; j < 8; j++) back(24, top + 250 + j * 24, 28, 18);
      for (var k = 0; k < 8; k++) back(W - 52, top + 250 + k * 24, 28, 18);

      // === 牌河 ===
      function river(cards, rx, ry) {
        for (var i = 0; i < cards.length; i++) {
          var r = Math.floor(i / 6), c2 = i % 6;
          drawTile(ctx, rx + c2 * 32, ry + r * 44, 30, 40, cards[i]);
        }
      }
      if (s.discards) {
        if (s.discards[me]) river(s.discards[me], cx - 90, cy + cr + 14);
        if (s.discards[pAcross]) river(s.discards[pAcross], cx - 90, cy - cr - 14 - 88);
      }

      // === 手牌 ===
      var hand = (s.hands && s.hands[me]) || [];
      var n = hand.length, cw = 50, ch = 70;
      var hy = top + tableH - ch - 40;
      var stp = n > 1 ? Math.min(36, (W - 200 - cw) / (n - 1)) : 0;
      var sx = 40 + (W - 240 - ((n - 1) * stp + cw)) / 2;
      for (var hi = 0; hi < n; hi++) {
        (function (hi) {
          var id = hand[hi];
          var x = sx + hi * stp, y = hy;
          drawTile(ctx, x, y, cw, ch, id);
          app.hits.push({ x: x, y: y, w: hi === n - 1 ? cw : stp, h: ch, label: 'tile' + id, cb: function () { if (app.sendMulti) app.sendMulti({ a: 'discard', tile: id }); } });
        })(hi);
      }

      // === 按钮 (碰/杠/过/胡) ===
      function btn(bx, by, br, label, en, cb) {
        ctx.beginPath(); ctx.arc(bx, by, br, 0, 6.3);
        ctx.fillStyle = en ? '#c62828' : '#616161';
        ctx.fill();
        ctx.strokeStyle = en ? '#f6d56b' : '#999';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold ' + Math.round(br * 0.6) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, bx, by + 1);
        if (en) app.hits.push({ x: bx - br, y: by - br, w: br * 2, h: br * 2, label: 'btn_' + label, cb: cb });
      }
      var ax = s.actions || {};
      var bx0 = W - 60, by0 = top + tableH - 320;
      btn(bx0, by0, 24, '过', true, function () { if (app.sendMulti) app.sendMulti({ a: 'pass' }); });
      btn(bx0 - 58, by0 + 6, 30, '碰', !!ax.pong, function () { if (app.sendMulti) app.sendMulti({ a: 'pong' }); });
      btn(bx0, by0 + 58, 30, '杠', !!ax.kong, function () { if (app.sendMulti) app.sendMulti({ a: 'kong' }); });
      btn(bx0 - 28, by0 + 120, 40, '胡', !!ax.hu, function () { if (app.sendMulti) app.sendMulti({ a: 'hu' }); });

      if (s.turn === me && !s.over) {
        ctx.fillStyle = '#7CFC00'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('轮到你出牌', cx, top + tableH - 20);
      }
    }
  };


  // 覆盖原麻将绘制
  GH.CardBoards.mahjong = newMahjong;
})();
