// 飞机大战坦克 — 游戏结束界面 Figma Plugin Script
// 使用方法: Figma → Plugins → Development → Open Console → 粘贴运行

(async () => {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  const W = 375, H = 812;

  // ── 工具函数 ──────────────────────────────────────────

  function hex(h) {
    h = h.replace('#', '');
    return {
      r: parseInt(h.slice(0,2),16)/255,
      g: parseInt(h.slice(2,4),16)/255,
      b: parseInt(h.slice(4,6),16)/255
    };
  }

  function rgba(h, a) {
    return { ...hex(h), a: a ?? 1 };
  }

  function rect(parent, x, y, w, h, opts = {}) {
    const r = figma.createRectangle();
    r.x = x; r.y = y; r.resize(w, h);
    r.name = opts.name || 'rect';
    if (opts.fill) r.fills = [{ type: 'SOLID', color: hex(opts.fill), opacity: opts.fillOpacity ?? 1 }];
    else if (opts.fills) r.fills = opts.fills;
    else r.fills = [];
    if (opts.radius !== undefined) r.cornerRadius = opts.radius;
    if (opts.stroke) {
      r.strokes = [{ type: 'SOLID', color: hex(opts.stroke), opacity: opts.strokeOpacity ?? 1 }];
      r.strokeWeight = opts.strokeWeight ?? 1;
    }
    if (opts.effect) r.effects = opts.effect;
    parent.appendChild(r);
    return r;
  }

  function text(parent, content, x, y, opts = {}) {
    const t = figma.createText();
    t.fontName = { family: "Inter", style: opts.bold ? "Bold" : "Regular" };
    t.characters = content;
    t.fontSize = opts.size || 14;
    t.x = x; t.y = y;
    t.name = opts.name || content;
    if (opts.color) t.fills = [{ type: 'SOLID', color: hex(opts.color) }];
    if (opts.opacity !== undefined) t.opacity = opts.opacity;
    if (opts.align) t.textAlignHorizontal = opts.align;
    if (opts.letterSpacing) t.letterSpacing = { value: opts.letterSpacing, unit: 'PIXELS' };
    if (opts.width) { t.textAutoResize = 'HEIGHT'; t.resize(opts.width, 100); }
    parent.appendChild(t);
    return t;
  }

  function ellipseGlow(parent, cx, cy, w, h, colorHex, opacity, blur) {
    const e = figma.createEllipse();
    e.resize(w, h);
    e.x = cx - w/2; e.y = cy - h/2;
    e.fills = [{ type: 'SOLID', color: hex(colorHex) }];
    e.opacity = opacity;
    e.effects = [{ type: 'LAYER_BLUR', radius: blur, visible: true }];
    e.name = 'glow';
    parent.appendChild(e);
    return e;
  }

  // ── 主 Frame ──────────────────────────────────────────

  const frame = figma.createFrame();
  frame.name = 'game-over / ideal';
  frame.resize(W, H);
  frame.fills = [{ type: 'SOLID', color: hex('#0a0a15') }];
  figma.currentPage.appendChild(frame);

  let curY = 72;

  // ── 背景光晕（标题后方）──────────────────────────────

  ellipseGlow(frame, W/2, curY + 18, 320, 200, '#ff6b6b', 0.12, 60);

  // ── 标题 ─────────────────────────────────────────────

  const titleGrad = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  titleGrad.fontName = { family: "Inter", style: "Bold" };
  titleGrad.characters = '战斗结束';
  titleGrad.fontSize = 36;
  titleGrad.letterSpacing = { value: 4, unit: 'PIXELS' };
  titleGrad.fills = [{
    type: 'GRADIENT_LINEAR',
    gradientTransform: [[0,1,0],[-1,0,1]],
    gradientStops: [
      { position: 0, color: rgba('#ff6b6b') },
      { position: 1, color: rgba('#ff9ff3') }
    ]
  }];
  titleGrad.textAutoResize = 'WIDTH_AND_HEIGHT';
  frame.appendChild(titleGrad);
  titleGrad.x = (W - titleGrad.width) / 2;
  titleGrad.y = curY;
  titleGrad.name = 'title';
  curY += titleGrad.height + 28;

  // ── 三颗星 ───────────────────────────────────────────

  const starSize = 52;
  const starGap  = 16;
  const starTotalW = starSize * 3 + starGap * 2;
  const starColors = ['#ffd93d', '#ffd93d', '#ffd93d'];
  const starX0 = (W - starTotalW) / 2;

  for (let i = 0; i < 3; i++) {
    const starGroup = figma.createFrame();
    starGroup.name = `star-${i+1}`;
    starGroup.resize(starSize, starSize);
    starGroup.fills = [];
    starGroup.x = starX0 + i * (starSize + starGap);
    starGroup.y = curY;
    frame.appendChild(starGroup);

    // 发光底
    const glow = figma.createEllipse();
    glow.resize(starSize, starSize);
    glow.x = 0; glow.y = 0;
    glow.fills = [{ type: 'SOLID', color: hex('#ffd93d') }];
    glow.opacity = 0.18;
    glow.effects = [{ type: 'LAYER_BLUR', radius: 12, visible: true }];
    starGroup.appendChild(glow);

    // 星星文字
    const st = figma.createText();
    st.fontName = { family: "Inter", style: "Bold" };
    st.characters = '★';
    st.fontSize = starSize - 6;
    st.fills = [{ type: 'SOLID', color: hex(starColors[i]) }];
    st.textAutoResize = 'WIDTH_AND_HEIGHT';
    starGroup.appendChild(st);
    st.x = (starSize - st.width) / 2;
    st.y = (starSize - st.height) / 2;
  }

  curY += starSize + 24;

  // ── 新纪录 Badge ─────────────────────────────────────

  const badgeW = 130, badgeH = 32;
  const badgeX = (W - badgeW) / 2;
  rect(frame, badgeX, curY, badgeW, badgeH, {
    name: 'badge-bg',
    fills: [{ type: 'SOLID', color: hex('#ffd93d'), opacity: 0.1 }],
    stroke: '#ffd93d',
    strokeOpacity: 0.7,
    strokeWeight: 1,
    radius: 16
  });
  const badgeText = text(frame, '🏆 新纪录!', 0, curY + 7, {
    name: 'badge-text',
    size: 13,
    bold: true,
    color: '#ffd93d',
    align: 'CENTER',
    width: W
  });
  curY += badgeH + 28;

  // ── 大分数 ───────────────────────────────────────────

  ellipseGlow(frame, W/2, curY + 30, 220, 70, '#4ecdc4', 0.2, 28);

  const scoreVal = text(frame, '88,850', 0, curY, {
    name: 'score-value',
    size: 56,
    bold: true,
    color: '#4ecdc4',
    align: 'CENTER',
    width: W
  });
  curY += scoreVal.height + 6;

  text(frame, '本局得分', 0, curY, {
    name: 'score-label',
    size: 11,
    color: '#666666',
    align: 'CENTER',
    width: W,
    letterSpacing: 2
  });
  curY += 20 + 36;

  // ── 统计卡片（2格）───────────────────────────────────

  const cardW = 150, cardH = 80, cardGap = 12;
  const cardX0 = (W - cardW * 2 - cardGap) / 2;
  const cards = [
    { value: 'W7',  label: '到达波次', valueColor: '#4ecdc4' },
    { value: '23',  label: '最大连击', valueColor: '#ff9ff3' }
  ];

  for (let i = 0; i < 2; i++) {
    const cx = cardX0 + i * (cardW + cardGap);

    rect(frame, cx, curY, cardW, cardH, {
      name: `card-${i}`,
      fills: [{ type: 'SOLID', color: hex('#ffffff'), opacity: 0.05 }],
      stroke: '#ffffff',
      strokeOpacity: 0.08,
      strokeWeight: 1,
      radius: 12
    });

    text(frame, cards[i].value, cx, curY + 16, {
      name: `card-value-${i}`,
      size: 28,
      bold: true,
      color: cards[i].valueColor,
      align: 'CENTER',
      width: cardW
    });

    text(frame, cards[i].label, cx, curY + 52, {
      name: `card-label-${i}`,
      size: 11,
      color: '#666666',
      align: 'CENTER',
      width: cardW,
      letterSpacing: 1
    });
  }

  curY += cardH + 36;

  // ── 主按钮：再战一次 ─────────────────────────────────

  const btnW = 220, btnH = 48;
  const btnX = (W - btnW) / 2;

  const btnRetry = figma.createRectangle();
  btnRetry.name = 'btn-retry';
  btnRetry.resize(btnW, btnH);
  btnRetry.x = btnX; btnRetry.y = curY;
  btnRetry.cornerRadius = 30;
  btnRetry.fills = [{
    type: 'GRADIENT_LINEAR',
    gradientTransform: [[1,0,0],[0,1,0]],
    gradientStops: [
      { position: 0, color: rgba('#4ecdc4') },
      { position: 1, color: rgba('#44a08d') }
    ]
  }];
  frame.appendChild(btnRetry);

  text(frame, '再战一次', btnX, curY + 14, {
    name: 'btn-retry-text',
    size: 16,
    bold: true,
    color: '#ffffff',
    align: 'CENTER',
    width: btnW
  });
  curY += btnH + 10;

  // ── 次要按钮：返回首页 ───────────────────────────────

  rect(frame, btnX, curY, btnW, btnH, {
    name: 'btn-home',
    fills: [{ type: 'SOLID', color: hex('#ffffff'), opacity: 0.08 }],
    stroke: '#ffffff',
    strokeOpacity: 0.15,
    strokeWeight: 1,
    radius: 30
  });

  text(frame, '返回首页', btnX, curY + 14, {
    name: 'btn-home-text',
    size: 16,
    bold: true,
    color: '#ffffff',
    align: 'CENTER',
    width: btnW
  });

  // ── 版本号 ───────────────────────────────────────────

  text(frame, '飞机大战坦克 v2.0', 0, H - 30, {
    name: 'version',
    size: 10,
    color: '#ffffff',
    opacity: 0.2,
    align: 'CENTER',
    width: W
  });

  // ── 收尾 ─────────────────────────────────────────────

  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);
  figma.closePlugin('✅ 游戏结束界面已生成！');

})();
