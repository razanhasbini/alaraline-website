/* ÀLara holiday hero, drawn on one canvas over all three slides.
   - Snow in three depths (far, mid, near). Wind gusts move them together; near flakes are soft and
     out of focus, crystal flakes tumble.
   - A light dusting of ground snow builds only where flakes land, then slumps at a natural angle.
     It persists across slides. A few flakes also settle on the products' top edges and melt away.
   - A restrained set of mirror-glass baubles and teardrops (champagne gold, pearl, blush, deep rose)
     hangs on satin ribbons at staggered heights, away from the headline and the products. They sway
     with the wind and now and then catch a glint of light. Warm out-of-focus lights sit far behind.
   Runs only while the hero is on screen; with reduced motion it draws one still winter scene. */
(function () {
  'use strict';
  const hero = document.querySelector('.hero');
  const canvas = hero && hero.querySelector('.festive-canvas');
  if (document.documentElement.dataset.season !== 'christmas') return;
  const g = canvas && canvas.getContext('2d');   // pages without the hero still get the ornament library (window.AlaraXmas)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;
  const pick = a => a[(Math.random() * a.length) | 0];

  let W = 0, H = 0, dpr = 1, mobile = false;
  let ornaments = [], bokeh = [], perches = [];
  let flakes = [], heights = new Float32Array(0), caps = new Float32Array(0), sparkles = [], smooth = new Float32Array(0);
  const KERNEL = [.05, .09, .12, .15, .18, .15, .12, .09, .05];
  const COL = 2;                       // ground resolution in css px
  let onLight = false;   // the gift slide (first) is burgundy now; the Curls On slide is white                  // the white Curls On photo needs more contrast on flakes
  let running = false, raf = 0, last = 0, clock = 0;

  /* ---------- wind: a slow drift with gusts ---------- */
  const wind = t => 10 * Math.sin(t * .11) + 7 * Math.sin(t * .29 + 1.3) + 4 * Math.sin(t * .83 + 2.1);

  /* ======================= sprites ======================= */
  function sprite(size, draw) {
    const c = document.createElement('canvas');
    c.width = c.height = Math.ceil(size * dpr);
    const x = c.getContext('2d');
    x.scale(dpr, dpr);
    draw(x, size);
    return { c, size };
  }
  function softDisc(x, cx, cy, r, col, a) {
    const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.55, `rgba(${col},${a * .85})`); gr.addColorStop(1, `rgba(${col},0)`);
    x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
  }
  let SPR = null;
  function buildSprites() {
    const make = (shadow, body) => {
      // fluffy aggregates: several soft lobes, a faint cool shadow underneath for depth
      const clumps = Array.from({ length: 8 }, () => {
        const lobes = Array.from({ length: (rnd(4, 8)) | 0 }, () => [rnd(-.2, .2), rnd(-.2, .2), rnd(.16, .3)]);
        return sprite(32, (x, s) => {
          for (const [ox, oy, r] of lobes) softDisc(x, s / 2 + ox * s, s / 2 + oy * s + 1.2, r * s * 1.1, '70,78,112', shadow);
          for (const [ox, oy, r] of lobes) softDisc(x, s / 2 + ox * s, s / 2 + oy * s, r * s, body, .95);
        });
      });
      const dot = sprite(12, (x, s) => { softDisc(x, s / 2, s / 2 + .6, s * .42, '70,78,112', shadow * .9); softDisc(x, s / 2, s / 2, s * .36, body, 1); });
      // out-of-focus flakes close to the lens
      const bokeh = sprite(48, (x, s) => {
        softDisc(x, s / 2, s / 2 + 1.5, s * .46, '70,78,112', shadow * .55);
        const gr = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s * .44);
        gr.addColorStop(0, `rgba(${body},.8)`); gr.addColorStop(.7, `rgba(${body},.62)`); gr.addColorStop(1, `rgba(${body},0)`);
        x.fillStyle = gr; x.beginPath(); x.arc(s / 2, s / 2, s * .44, 0, TAU); x.fill();
      });
      // stellar dendrite crystals (6-fold, side branches)
      const crystals = Array.from({ length: 3 }, (_, v) => sprite(48, (x, s) => {
        const R = s * .42, branches = [[.35, .38], [.55, .3], [.75, .2]].slice(0, 2 + (v > 0)), w = s / 64;
        const arms = (col, lw, oy) => {
          x.strokeStyle = col; x.lineWidth = lw; x.lineCap = 'round';
          x.save(); x.translate(s / 2, s / 2 + oy);
          for (let k = 0; k < 6; k++) {
            x.rotate(TAU / 6);
            x.beginPath(); x.moveTo(0, 0); x.lineTo(R, 0);
            for (const [p, l] of branches) {
              x.moveTo(R * p, 0); x.lineTo(R * p + R * l * .7, -R * l * .62);
              x.moveTo(R * p, 0); x.lineTo(R * p + R * l * .7, R * l * .62);
            }
            x.stroke();
          }
          x.beginPath(); x.arc(0, 0, R * .1, 0, TAU); x.stroke();
          x.restore();
        };
        arms(`rgba(70,78,112,${shadow * 1.1})`, 3.4 * w, 1);
        arms('rgba(255,255,255,.97)', 2 * w, 0);
      }));
      return { clumps, dot, bokeh, crystals };
    };
    SPR = { light: make(.62, '242,244,250'), color: make(.24, '255,255,255') };
  }

  /* ======================= hanging ornaments ======================= */
  const FINISH = {
    gold:      { base: '#d9b25f', light: '#fff5d6', dark: '#7a5518', rim: '#3d2a08', mirror: true },
    silver:    { base: '#c3c8d1', light: '#ffffff', dark: '#5d6470', rim: '#2e333b', mirror: true },
    champagne: { base: '#e2cca2', light: '#fffaf0', dark: '#8c7148', rim: '#4a3a22', mirror: true },
    rose:      { base: '#d8789d', light: '#ffe0eb', dark: '#7a2a4b', rim: '#3a0f22', mirror: true },
    blush:     { base: '#efc3d2', light: '#fff6f9', dark: '#ae7086', rim: '#6a3a4b', mirror: false },
    pearl:     { base: '#f1eeee', light: '#ffffff', dark: '#a5a0a3', rim: '#6e6a6c', mirror: false }
  };
  /* [x as a share of the width, ribbon length, radius, shape, finish]: asymmetric clusters that stay
     clear of the headline (left) and of each product's top (right) */
  const HANG = [
    [.05, 52, 28, 'sphere', 'gold'], [.098, 104, 18, 'drop', 'silver'], [.44, 34, 19, 'sphere', 'pearl'],
    [.655, 44, 25, 'sphere', 'silver'], [.70, 24, 17, 'drop', 'gold'],
    [.895, 92, 20, 'drop', 'champagne'], [.94, 38, 34, 'sphere', 'gold'], [.978, 116, 18, 'sphere', 'silver']
  ];
  const HANG_PHONE = [
    [.07, 18, 13, 'sphere', 'gold'], [.15, 40, 9, 'drop', 'silver'],
    [.74, 26, 13, 'sphere', 'silver'], [.85, 12, 10, 'sphere', 'pearl'], [.93, 34, 10, 'drop', 'gold']
  ];

  function canvasOf(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr);
    const x = c.getContext('2d'); x.scale(dpr, dpr); draw(x);
    return { c, w, h };
  }
  function ornamentSprite(r, kind, f) {
    const drop = kind === 'drop', ch = Math.max(2.5, r * .3), cw = r * (drop ? .38 : .52);
    const cy = ch + (drop ? r * 1.9 : r * .96), w = r * 2 + 8, h = cy + r + 6;
    const spr = canvasOf(w, h, x => {
      x.translate(w / 2, 0);
      // gold cap with fine ridges and a lip
      const cg = x.createLinearGradient(-cw / 2, 0, cw / 2, 0);
      cg.addColorStop(0, '#6f7682'); cg.addColorStop(.42, '#f4f5f8'); cg.addColorStop(.6, '#c2c7d0'); cg.addColorStop(1, '#5f6672');
      x.fillStyle = cg; x.fillRect(-cw / 2, 0, cw, ch);
      x.strokeStyle = 'rgba(60,66,78,.35)'; x.lineWidth = .5;
      for (let i = 1; i < 5; i++) { const xx = -cw / 2 + cw * i / 5; x.beginPath(); x.moveTo(xx, .5); x.lineTo(xx, ch - .5); x.stroke(); }
      x.fillStyle = '#e3e6eb'; x.fillRect(-cw / 2 - .4, ch - .9, cw + .8, .9);

      const body = new Path2D();
      if (drop) {
        body.moveTo(0, cy - r * 1.9);
        body.bezierCurveTo(r * .22, cy - r * 1.3, r, cy - r * .92, r, cy);
        body.arc(0, cy, r, 0, Math.PI);
        body.bezierCurveTo(-r, cy - r * .92, -r * .22, cy - r * 1.3, 0, cy - r * 1.9);
      } else body.arc(0, cy, r, 0, TAU);
      x.save(); x.clip(body);
      const top = drop ? cy - r * 1.9 : cy - r;
      // body: lit from the upper left, deepening to the rim
      const bg = x.createRadialGradient(-r * .36, cy - r * .42, r * .04, 0, cy, r * 1.12);
      bg.addColorStop(0, f.light); bg.addColorStop(f.mirror ? .3 : .45, f.base); bg.addColorStop(.86, f.dark); bg.addColorStop(1, f.rim);
      x.fillStyle = bg; x.fillRect(-r, top, r * 2, cy + r - top);
      if (f.mirror) {
        // a mirror reflects the room: a dark band above the equator, a pale floor below
        const rg = x.createLinearGradient(0, cy - r, 0, cy + r);
        rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(.38, 'rgba(0,0,0,.07)'); rg.addColorStop(.6, 'rgba(0,0,0,0)');
        rg.addColorStop(.8, 'rgba(255,255,255,.13)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = rg; x.fillRect(-r, top, r * 2, cy + r - top);
      } else {
        // satin: a broad soft sheen
        const sg = x.createRadialGradient(-r * .25, cy - r * .3, 0, -r * .25, cy - r * .3, r * .9);
        sg.addColorStop(0, 'rgba(255,255,255,.5)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = sg; x.fillRect(-r, top, r * 2, cy + r - top);
      }
      // fresnel: the rim picks up light from behind
      const fr = x.createRadialGradient(0, cy, r * .78, 0, cy, r * 1.02);
      fr.addColorStop(0, 'rgba(255,255,255,0)'); fr.addColorStop(1, 'rgba(255,255,255,.2)');
      x.fillStyle = fr; x.fillRect(-r, top, r * 2, cy + r - top);
      x.restore();
      if (f.mirror) {
        // window reflection: a soft pane and a sharp catch-light
        x.save(); x.translate(-r * .38, cy - r * .42); x.rotate(-.62); x.scale(1, .55);
        const hg = x.createRadialGradient(0, 0, 0, 0, 0, r * .34);
        hg.addColorStop(0, 'rgba(255,255,255,.95)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = hg; x.beginPath(); x.arc(0, 0, r * .34, 0, TAU); x.fill(); x.restore();
        x.fillStyle = 'rgba(255,255,255,.95)'; x.beginPath(); x.arc(-r * .44, cy - r * .5, Math.max(.6, r * .055), 0, TAU); x.fill();
        x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = Math.max(.6, r * .07);
        x.beginPath(); x.arc(0, cy, r * .8, .2 * Math.PI, .42 * Math.PI); x.stroke();
      }
    });
    spr.gx = -r * .44; spr.gy = cy - r * .5;   // where a glint appears
    return spr;
  }

  /* ---------- a fine bead garland: gold and silver beads with a pearl now and then ---------- */
  const BEAD = { gold: ['#fff6d8', '#d8b263', '#6f4d17'], silver: ['#ffffff', '#c6cbd4', '#575e6a'], pearl: ['#ffffff', '#f3efec', '#a49e9a'] };
  const swagY = (x0, x1, sag, x) => { const t = (x - x0) / (x1 - x0); return sag * 4 * t * (1 - t); };
  function drawSwag(x, x0, y0, x1, sag, r) {
    // the thread, then beads spaced along the curve
    x.strokeStyle = 'rgba(140,120,90,.55)'; x.lineWidth = .7;
    x.beginPath();
    for (let i = 0; i <= 60; i++) { const px = x0 + (x1 - x0) * i / 60; const py = y0 + swagY(x0, x1, sag, px); i ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke();
    const pts = [];
    let prev = [x0, y0], acc = 0;
    const step = r * 2.25;
    for (let i = 1; i <= 400; i++) {
      const px = x0 + (x1 - x0) * i / 400, py = y0 + swagY(x0, x1, sag, px);
      acc += Math.hypot(px - prev[0], py - prev[1]); prev = [px, py];
      if (acc >= step) { pts.push([px, py]); acc = 0; }
    }
    pts.forEach(([px, py], i) => {
      const kind = i % 7 === 3 ? 'pearl' : i % 3 === 2 ? 'silver' : 'gold';
      const rr = kind === 'pearl' ? r * 1.35 : r;
      const [hi, mid, lo] = BEAD[kind];
      const gr = x.createRadialGradient(px - rr * .35, py - rr * .4, rr * .05, px, py, rr);
      gr.addColorStop(0, hi); gr.addColorStop(.45, mid); gr.addColorStop(1, lo);
      x.fillStyle = gr; x.beginPath(); x.arc(px, py, rr, 0, TAU); x.fill();
    });
  }
  function garlandCanvas(w, h, swags, r) {
    return canvasOf(w, h, x => { for (const [x0, x1, sag] of swags) drawSwag(x, x0, 0, x1, sag, r); });
  }
  // the rest of the site hangs the same ornaments and garland (assets/christmas/season.js)
  window.AlaraXmas = { ornament: (r, kind, fin) => ornamentSprite(r, kind, FINISH[fin]), garland: garlandCanvas, swagY };
  if (!canvas) { dpr = Math.min(devicePixelRatio || 1, 2); return; }

  let swagSet = [], swagImg = null;
  function hangY(x) {
    for (const [x0, x1, sag] of swagSet) if (x >= x0 && x <= x1) return swagY(x0, x1, sag, x);
    return 0;
  }

  function layoutOrnaments() {
    const narrow = W <= 900;
    const anchors = narrow ? [-.02, .5, 1.02] : [-.02, .25, .5, .75, 1.02];
    swagSet = anchors.slice(1).map((a, i) => [anchors[i] * W, a * W, (narrow ? 20 : 34) + (i % 2) * (narrow ? 6 : 12)]);
    swagImg = garlandCanvas(W, narrow ? 40 : 60, swagSet, narrow ? 2.1 : 2.8);
    ornaments = (narrow ? HANG_PHONE : HANG).map(([fx, len, r, kind, fin]) => {
      const f = FINISH[fin];
      return { x: fx * W, y0: hangY(fx * W) - 1, len, r, spr: ornamentSprite(r, kind, f), glint: f.mirror,
        phase: rnd(0, TAU), w: rnd(.7, 1.1) * Math.sqrt(40 / (len + 20)), amp: rnd(.012, .026), resp: rnd(.5, 1), gs: rnd(.18, .35) };
    });
  }
  function drawOrnament(o, t, w) {
    const sway = reduce ? 0 : o.amp * Math.sin(t * o.w + o.phase) + w * .0016 * o.resp;
    g.save(); g.translate(o.x, o.y0); g.rotate(sway);
    // satin ribbon with a soft sheen down one edge, tied in a small loop at the cap
    g.strokeStyle = '#aab0bb'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, o.len); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = .55; g.beginPath(); g.moveTo(-.4, 0); g.lineTo(-.4, o.len - 2); g.stroke();
    g.strokeStyle = '#b9bec8'; g.lineWidth = .9; g.beginPath(); g.ellipse(0, o.len - 2.2, 2, 3, 0, 0, TAU); g.stroke();
    const s = o.spr;
    g.drawImage(s.c, -s.w / 2, o.len, s.w, s.h);
    if (o.glint && !reduce) {                       // now and then the light catches it
      const k = Math.pow(Math.max(0, Math.sin(t * o.gs + o.phase * 3)), 30);
      if (k > .04) {
        const L = o.r * .75 * k, gx = s.gx, gy = o.len + s.gy;
        g.globalAlpha = k; g.fillStyle = '#fff';
        g.beginPath(); g.moveTo(gx, gy - L); g.lineTo(gx + L * .12, gy); g.lineTo(gx, gy + L); g.lineTo(gx - L * .12, gy); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(gx - L, gy); g.lineTo(gx, gy + L * .12); g.lineTo(gx + L, gy); g.lineTo(gx, gy - L * .12); g.closePath(); g.fill();
        g.globalAlpha = 1;
      }
    }
    g.restore();
  }

  /* ---------- warm lights far behind, out of focus ---------- */
  let BOKEH = null;
  function layoutBokeh() {
    const disc = col => canvasOf(64, 64, x => {
      const gr = x.createRadialGradient(32, 32, 0, 32, 32, 30);
      gr.addColorStop(0, `rgba(${col},.55)`); gr.addColorStop(.72, `rgba(${col},.62)`); gr.addColorStop(.9, `rgba(${col},.75)`); gr.addColorStop(1, `rgba(${col},0)`);
      x.fillStyle = gr; x.beginPath(); x.arc(32, 32, 30, 0, TAU); x.fill();
    });
    BOKEH = [disc('255,214,150'), disc('255,226,190'), disc('250,190,205')];
    bokeh = [];
    const n = mobile ? 7 : 16;
    while (bokeh.length < n) {
      const x = rnd(0, W), y = rnd(0, H * .78);
      if (x < W * (mobile ? 1 : .5) && y > H * (mobile ? .14 : .2)) continue;   // keep the headline clean
      bokeh.push({ x, y, r: rnd(8, mobile ? 18 : 30), a: rnd(.08, .2), s: (Math.random() * 3) | 0, ph: rnd(0, TAU), sp: rnd(.15, .4) });
    }
  }
  function drawBokeh(t) {
    const boost = onLight ? 1.25 : 1;
    for (const b of bokeh) {
      g.globalAlpha = Math.min(1, b.a * boost * (reduce ? .8 : .65 + .35 * Math.sin(t * b.sp + b.ph)));
      g.drawImage(BOKEH[b.s].c, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }
    g.globalAlpha = 1;
  }

  /* ======================= a little snow on the products ======================= */
  /* upward-facing edges in each photo's own coordinates (0..1), so they stay locked to the product at
     any screen size, crop and zoom */
  const PRODUCTS = {
    'hero-curls.jpg': {
      ledges: [[[.737, .323], [.765, .312], [.8, .309], [.83, .323], [.853, .376]], [[.684, .578], [.724, .573]],
               [[.607, .7], [.625, .692], [.645, .7]], [[.652, .707], [.666, .699], [.68, .707]],
               [[.856, .688], [.868, .68], [.881, .688]], [[.843, .737], [.862, .728], [.88, .737]]]
    },
    'hero-miracle.jpg': { stick: .75, ledges: [[[.433, .364], [.491, .365]], [[.556, .373], [.608, .391]], [[.515, .21], [.525, .199], [.538, .21]]] },
    'hero-box.jpg': { stick: .2, ledges: [[[.546, .196], [.686, .205], [.828, .214]], [[.49, .639], [.63, .677], [.768, .715]]] },
    // the phone photos
    'hero-portrait.jpg': { stick: .75, ledges: [[[.28, .367], [.445, .372]], [[.622, .383], [.79, .405]], [[.49, .212], [.535, .197], [.585, .212]]] },
    'cat-offers.jpg': { stick: .2, ledges: [[[.336, .045], [.57, .09], [.812, .135]], [[.26, .63], [.46, .705], [.66, .78]]] }
  };
  function imageBox(img) {  // where the photo's pixels sit inside the hero (object-fit: cover)
    const pic = img.parentElement, hr = hero.getBoundingClientRect(), pr = pic.getBoundingClientRect();
    const nw = img.naturalWidth, nh = img.naturalHeight;
    if (!nw || !pr.width) return null;
    const sc = Math.max(pr.width / nw, pr.height / nh), dw = nw * sc, dh = nh * sc;
    const [px, py] = getComputedStyle(img).objectPosition.split(' ').map(v => parseFloat(v) / 100);
    return { x: pr.left - hr.left + (pr.width - dw) * px, y: pr.top - hr.top + (pr.height - dh) * py, w: dw, h: dh,
             cx: pr.left - hr.left + pr.width / 2, cy: pr.top - hr.top + pr.height / 2 };
  }
  function buildPerches() {
    perches = [];
    hero.querySelectorAll('.hero-slide').forEach(slide => {
      const img = slide.querySelector('.hero-media img');
      const file = img && (img.currentSrc || img.src).split('/').pop().split('?')[0];
      const prod = PRODUCTS[file];
      if (!prod) return;
      if (!img.complete || !img.naturalWidth) {   // lazy photo: map it once it arrives
        if (!img.dataset.perchWait) { img.dataset.perchWait = 1; img.addEventListener('load', () => { delete img.dataset.perchWait; buildPerches(); if (reduce) frame(performance.now()); }, { once: true }); }
        return;
      }
      const ib = imageBox(img); if (!ib) return;
      const P = ([u, v]) => [ib.x + u * ib.w, ib.y + v * ib.h];
      const k = Math.max(.55, Math.min(1.05, ib.w / 1500));
      const ledges = prod.ledges.flatMap(l => l.map(P).slice(1).map((q, i) => {
        const p = P(l[i]); return p[0] < q[0] ? [p[0], p[1], q[0], q[1]] : [q[0], q[1], p[0], p[1]];
      }));
      const w = { slide, img, ib, ledges, stick: prod.stick || .3, specks: [] };
      if (reduce) for (let i = 0; i < 6; i++) {   // a still scene: a light dusting already there
        const [x0, y0, x1, y1] = pick(ledges), f = Math.random();
        w.specks.push({ x: lerp(x0, x1, f), y: lerp(y0, y1, f), r: rnd(1.4, 2.6) * k, born: -1, life: Infinity });
      }
      perches.push(w);
    });
  }
  function settleOnProduct(f, py, w) {  // a falling flake meets an upward edge of the product
    for (const [x0, y0, x1, y1] of w.ledges) {
      if (f.x < x0 || f.x > x1) continue;
      const ly = y0 + (y1 - y0) * (f.x - x0) / (x1 - x0);
      if (py < ly && f.y >= ly) {
        if (Math.random() > w.stick * .35) return false;     // most slide off or miss
        w.specks.push({ x: f.x, y: ly - .4, r: Math.min(3.4, f.r * .75 + .9), born: clock, life: rnd(10, 18) });
        if (w.specks.length > 10) w.specks.shift();
        return true;
      }
    }
    return false;
  }
  function drawSpecks(t, set) {
    for (const w of perches) {
      if (!w.specks.length) continue;
      const a = +getComputedStyle(w.slide).opacity;
      if (a < .01) continue;
      const m = getComputedStyle(w.img).transform, s = m && m !== 'none' ? new DOMMatrix(m).a : 1;  // follow the photo's slow zoom
      g.save();
      g.translate(w.ib.cx, w.ib.cy); g.scale(s, s); g.translate(-w.ib.cx, -w.ib.cy);
      w.specks = w.specks.filter(p => t - p.born < p.life);   // it melts away slowly
      for (const p of w.specks) {
        const age = t - p.born, fade = p.life === Infinity ? 1 : Math.min(1, age / .35) * Math.min(1, (p.life - age) / 5), d = p.r * 3;
        g.globalAlpha = a * .95 * fade; g.drawImage(set.dot.c, p.x - d / 2, p.y - d * .36, d, d * .72);  // lying flat
      }
      g.restore();
    }
    g.globalAlpha = 1;
  }

  /* ======================= snow ======================= */
  function newFlake(anywhere) {
    const u = Math.random(), z = u < .56 ? rnd(0, .3) : u < .91 ? rnd(.3, .74) : rnd(.74, 1);
    const near = z > .74, far = z < .3;
    const crystal = !far && Math.random() < (near ? .45 : .24);
    const f = {
      z, near, far, crystal,
      r: lerp(1, near ? 9 : 5, Math.pow(z, 1.3)) * rnd(.85, 1.2) * (mobile ? .9 : 1),
      vy: lerp(15, 105, z) * rnd(.85, 1.15),
      sway: lerp(4, 22, z) * rnd(.6, 1.2), freq: rnd(.35, 1.1), phase: rnd(0, TAU),
      rot: rnd(0, TAU), spin: rnd(-.9, .9), tumble: rnd(0, TAU), tsp: rnd(.6, 1.6),
      alpha: far ? rnd(.45, .75) : near ? rnd(.45, .7) : rnd(.8, 1),
      clump: (Math.random() * 8) | 0, crys: (Math.random() * 3) | 0,
      x: rnd(-20, W + 20), y: anywhere ? rnd(-H * .2, H) : rnd(-80, -10),
      fadeAt: far ? H * rnd(.62, .96) : 0
    };
    return f;
  }
  function drawFlake(f, set) {
    g.globalAlpha = f.alpha;
    if (f.crystal) {
      const s = set.crystals[f.crys], d = f.r * (f.near ? 4.2 : 3.4);
      g.save(); g.translate(f.x, f.y); g.rotate(f.rot); g.scale(1, .55 + .45 * Math.abs(Math.cos(f.tumble)));
      g.drawImage(s.c, -d / 2, -d / 2, d, d); g.restore();
    } else if (f.near) {
      const d = f.r * 3.4; g.drawImage(set.bokeh.c, f.x - d / 2, f.y - d / 2, d, d);
    } else if (f.far || f.r < 1.6) {
      const d = f.r * 3; g.drawImage(set.dot.c, f.x - d / 2, f.y - d / 2, d, d);
    } else {
      const d = f.r * 3.3; g.drawImage(set.clumps[f.clump].c, f.x - d / 2, f.y - d / 2, d, d);
    }
    g.globalAlpha = 1;
  }

  /* ---------- the ground: snow piles up where flakes land ---------- */
  function deposit(x, r) {
    const n = heights.length, sigma = (7 + r * 2.4) / COL, vol = Math.PI * r * r * (mobile ? 1.2 : 1.5) / COL;
    const c = Math.round(x / COL), span = Math.ceil(sigma * 2.6), norm = 1 / (sigma * Math.sqrt(TAU));
    for (let k = -span; k <= span; k++) {
      const j = c + k; if (j < 0 || j >= n) continue;
      heights[j] += vol * norm * Math.exp(-(k * k) / (2 * sigma * sigma));
      if (heights[j] > caps[j]) heights[j] = caps[j];
    }
  }
  function slump() {  // angle of repose: steep spots shed snow onto their neighbours, locally only
    const n = heights.length, lim = .55;
    for (let pass = 0; pass < 3; pass++) for (let i = 0; i < n - 1; i++) {
      const d = heights[i] - heights[i + 1];
      if (d > lim) { const m = (d - lim) * .45; heights[i] -= m; heights[i + 1] += m; }
      else if (d < -lim) { const m = (-d - lim) * .45; heights[i] += m; heights[i + 1] -= m; }
    }
  }
  function drawGround(t) {
    const n = heights.length;
    let any = false;
    for (let i = 0; i < n; i++) if (heights[i] > .25) { any = true; break; }
    if (!any) return;
    if (smooth.length !== n) smooth = new Float32Array(n);
    for (let i = 0; i < n; i++) {             // gaussian-ish 9-tap smoothing for a soft, pillowy surface
      let a = 0, wsum = 0;
      for (let k = -4; k <= 4; k++) { const j = Math.min(n - 1, Math.max(0, i + k)), w = KERNEL[k + 4]; a += heights[j] * w; wsum += w; }
      const v = a / wsum; smooth[i] = v > .35 ? v : 0;
    }
    const path = new Path2D();
    path.moveTo(0, H + 2); path.lineTo(0, H - smooth[0]);
    for (let i = 1; i < n - 1; i += 2) {
      const x = i * COL, xn = (i + 1) * COL;
      path.quadraticCurveTo(x, H - smooth[i], xn, H - (smooth[i] + smooth[i + 1]) / 2);
    }
    path.lineTo(W, H - smooth[n - 1]); path.lineTo(W, H + 2); path.closePath();
    g.save();
    // soft contour so white snow reads on a white photo; also gives volume on pink
    g.shadowColor = onLight ? 'rgba(62,72,112,.26)' : 'rgba(110,40,75,.2)'; g.shadowBlur = 6; g.shadowOffsetY = 1;
    const top = H - 18;
    const gr = g.createLinearGradient(0, top, 0, H);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, '#f8f9fc'); gr.addColorStop(1, '#dfe3ef');
    g.fillStyle = gr; g.fill(path);
    g.shadowColor = 'transparent';
    g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 1.3; g.stroke(path);
    g.restore();
    // sparkle where snow is deep enough to catch the light
    for (const s of sparkles) {
      const h = smooth[s.i] || 0; if (h < 3) continue;
      const a = reduce ? .5 : Math.pow(Math.max(0, Math.sin(t * s.sp + s.ph)), 8);
      if (a < .06) continue;
      const x = s.i * COL, y = H - h + s.dy * Math.min(h, 14);
      g.globalAlpha = a; g.fillStyle = '#ffffff';
      g.fillRect(x - .5, y - 2.5, 1, 5); g.fillRect(x - 2.5, y - .5, 5, 1);
      g.globalAlpha = 1;
    }
  }

  /* ======================= layout & loop ======================= */
  function layout() {
    const r = hero.getBoundingClientRect();
    if (!r.width) return false;
    const oldW = W, oldH = heights;
    W = r.width; H = r.height; mobile = W < 760; dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    buildSprites(); layoutOrnaments(); layoutBokeh(); buildPerches();

    const cols = Math.ceil(W / COL) + 2, maxH = mobile ? 7 : 10;   // a light drift on the ground
    heights = new Float32Array(cols); caps = new Float32Array(cols);
    const p1 = rnd(0, TAU), p2 = rnd(0, TAU);
    for (let i = 0; i < cols; i++) {
      caps[i] = maxH * (.62 + .28 * (Math.sin(i * COL * .004 + p1) * .5 + .5) + .1 * Math.sin(i * COL * .017 + p2));
      if (oldH.length && oldW) heights[i] = Math.min(caps[i], oldH[Math.min(oldH.length - 1, Math.round((i * COL / W) * oldW / COL))] || 0);  // keep settled snow on resize
    }
    sparkles = [];
    for (let i = 3; i < cols; i += (rnd(5, 13)) | 0) sparkles.push({ i, sp: rnd(.5, 1.4), ph: rnd(0, TAU), dy: rnd(.1, .6) });

    const target = Math.round((mobile ? 80 : 170) * Math.min(1.35, W / 1440 + .25));
    while (flakes.length < target) flakes.push(newFlake(true));
    flakes.length = target;
    return true;
  }

  function frame(now) {
    raf = 0;
    const dt = Math.min(.05, last ? (now - last) / 1000 : .016);
    last = now; clock += dt;
    const t = clock, w = wind(t), set = onLight ? SPR.light : SPR.color;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);

    const act = perches.find(p => p.slide.classList.contains('is-active'));
    for (const f of flakes) {
      const py = f.y;
      f.y += f.vy * dt;
      f.x += (w * (.35 + .9 * f.z) + Math.sin(t * f.freq + f.phase) * f.sway) * dt;
      f.rot += f.spin * dt; f.tumble += f.tsp * dt;
      if (f.x < -30) f.x += W + 60; else if (f.x > W + 30) f.x -= W + 60;
      if (f.far) {
        if (f.y > f.fadeAt + 40) Object.assign(f, newFlake(false));
      } else if (act && !f.near && settleOnProduct(f, py, act)) {
        Object.assign(f, newFlake(false));
      } else {
        const i = Math.max(0, Math.min(heights.length - 1, Math.round(f.x / COL)));
        if (f.y >= H - heights[i] - f.r * .3) { deposit(f.x, f.r * (f.near ? .7 : 1)); Object.assign(f, newFlake(false)); }
      }
    }
    slump();

    drawBokeh(t);
    for (const f of flakes) if (f.far) {             // far flakes fade before the ground, into the distance
      const a = f.alpha; f.alpha = a * Math.max(0, Math.min(1, (f.fadeAt + 40 - f.y) / 40)); drawFlake(f, set); f.alpha = a;
    }
    drawGround(t);
    drawSpecks(t, set);
    for (const f of flakes) if (!f.far && !f.near) drawFlake(f, set);
    if (swagImg) g.drawImage(swagImg.c, 0, -1, swagImg.w, swagImg.h);
    for (const o of ornaments) drawOrnament(o, t, w);
    for (const f of flakes) if (f.near) drawFlake(f, set);  // close to the lens, in front of everything

    if (running) raf = requestAnimationFrame(frame);
  }

  function stillScene() {  // reduced motion: a winter scene that has already settled
    for (let i = 0; i < 300; i++) deposit(rnd(0, W), rnd(1.4, 4));
    for (let i = 0; i < 30; i++) slump();
    for (const f of flakes) if (f.near) f.alpha *= .6;
    running = false; frame(performance.now());
  }

  let visible = true;
  function update() {
    const want = visible && !document.hidden && !reduce && document.documentElement.dataset.snow !== 'off';
    if (want && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
    if (!want && running) { running = false; cancelAnimationFrame(raf); raf = 0; }
  }
  if (!layout()) return;
  if (reduce) stillScene();
  new IntersectionObserver(es => { visible = es[0].isIntersecting; update(); }, { threshold: .01 }).observe(hero);
  document.addEventListener('visibilitychange', update);
  document.addEventListener('alara:snow', update);   // paused: the scene holds still where it is
  hero.addEventListener('slidechange', e => { onLight = e.detail.slide.matches('.hero-festive'); if (reduce) { frame(performance.now()); setTimeout(() => frame(performance.now()), 1300); } });  // again once the slide has faded in
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (layout() && reduce) stillScene(); }, 180); });
  update();
})();
