/* ÀLara Christmas season: the site-wide layer.
   - Snow over the whole page on one fixed canvas: three depths, wind gusts, now and then a flurry,
     and depth parallax as you scroll. A little lighter over the shop, none over the hero (it has its
     own), paused when the tab is hidden, off for reduced motion. Never takes clicks.
   - The Christmas gift edit on the home page: five real gift bundles, each presented as its own
     editorial still-life using the transparent product cut-outs (never AI-redrawn packaging).
   - Add to bag: a silver shimmer from the button and a frost ring on the bag.
   Everything else on the page matches alaraline.co. The cart and product logic are untouched: everything
   here uses data-add / data-qv, which main.js already handles. */
(function () {
  'use strict';
  if (document.documentElement.dataset.season !== 'christmas') return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ================= pause snow (all snow on the page; remembered) ================= */
  const html = document.documentElement;
  let snowOff = false;
  try { snowOff = localStorage.getItem('alara-snow') === 'off'; } catch (e) {}
  function setSnow(off) {
    snowOff = off;
    html.dataset.snow = off ? 'off' : 'on';
    try { localStorage.setItem('alara-snow', off ? 'off' : 'on'); } catch (e) {}
    document.querySelectorAll('[data-snow-toggle]').forEach(b => {
      b.setAttribute('aria-pressed', off);
      if (b.classList.contains('snow-link')) b.textContent = off ? 'Let it snow' : 'Pause snow';
      else b.setAttribute('aria-label', off ? 'Let it snow' : 'Pause snow');
    });
    document.dispatchEvent(new CustomEvent('alara:snow', { detail: { off } }));
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-snow-toggle]')) setSnow(!snowOff); });
  setSnow(snowOff);

  const A = window.ALARA || {};
  /* ================= snow that settles: a light drift on the tops of cards ================= */
  function driftPath(w, h, seed) {
    let s = seed;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const lumps = Array.from({ length: 5 }, () => [r() * TAU, .8 + r() * 3.2, .3 + r() * .6]);
    let d = `M0 ${h}`;
    const n = Math.max(12, Math.round(w / 6));
    for (let i = 0; i <= n; i++) {
      const u = i / n; let v = .5;
      for (const [ph, f, a] of lumps) v += a * .28 * Math.sin(u * f * TAU + ph);
      const y = h - Math.max(0, Math.min(1, v)) * h * Math.pow(Math.sin(Math.PI * u), .8);   // thins to nothing at both ends
      d += ` L${(u * w).toFixed(1)} ${y.toFixed(1)}`;
    }
    return d + ` L${w} ${h} Z`;
  }
  const edgeIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); edgeIO.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  function addEdge(host, style) {
    if (host.querySelector(':scope > .snow-edge')) return;
    const edge = document.createElement('div');
    edge.className = 'snow-edge'; edge.setAttribute('aria-hidden', 'true');
    Object.assign(edge.style, style);
    host.appendChild(edge);
    requestAnimationFrame(() => {
      const w = edge.clientWidth, h = edge.clientHeight; if (!w || !h) return;
      const id = 'sd' + ((Math.random() * 1e6) | 0);
      edge.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#fbfbfd"/><stop offset="1" stop-color="#e3e6ee"/></linearGradient></defs><path d="${driftPath(w, h, (Math.random() * 1e5) | 0)}" fill="url(#${id})"/></svg>`;
      edgeIO.observe(edge);
    });
  }
  // only where white snow shows: the white review cards on pink and the services strip
  const DRIFTS = [['.love-card', { left: '10%', width: '46%', top: '-7px', height: '9px' }],
    ['.services', { left: '0', right: '0', width: 'auto', top: '-7px', height: '9px' }]];
  const settle = root => DRIFTS.forEach(([sel, st]) => root.querySelectorAll(sel).forEach(el => addEdge(el, st)));
  settle(document);
  new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) settle(n.parentNode || n); })
    .observe(document.querySelector('main') || document.body, { childList: true, subtree: true });

  const money = v => '$' + (Math.round(v * 100) / 100);
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  /* ================= the Christmas gift edit ================= */
  const sec = document.querySelector('.gift-edit');
  const xb = sec && sec.querySelector('[data-christmas-bundles]');
  if (sec && xb) {
    const price = p => `<span class="ge-price"><b>${money(p.price)}</b>${p.was ? `<s>${money(p.was)}</s><em>Save ${money(p.was - p.price)}</em>` : ''}</span>`;
    const studies = [
      ['deep-repair-duo', 'duo', true, 'Satin plinth'],
      ['deep-repair-duo', 'orbit', false, 'Ribbon orbit'],
      ['deep-repair-duo', 'steps', false, 'Burgundy blush'],
      ['deep-repair-duo', 'ornaments', false, 'Ornament glow'],
      ['deep-repair-duo', 'winter', false, 'Winter ribbon'],
      ['deep-repair-duo', 'steps-light', true, 'Pink ivory']
    ].map(([slug, art, featured, template]) => {
      const p = A.bySlug[slug];
      return p && !p.oos ? Object.assign({}, p, {
        art,
        featured: !!featured,
        template,
        tag: slug === 'deep-repair-duo' ? 'Buttered Up Mask · Miracle Pro-Edition' : p.tag
      }) : null;
    }).filter(Boolean);
    const cuts = () => '';
    xb.innerHTML = studies.length ? `<div class="xb-grid">${studies.map(p => `
          <article class="xb-card xb-card--${p.art}${p.featured ? ' xb-card--featured' : ''}">
            <button class="ge-open" type="button" data-qv="${p.slug}" aria-label="Quick view ${esc(p.name)}"></button>
            <div class="xb-media xb-art xb-art--${p.art}" role="img" aria-label="${esc(p.name)} Christmas gift set: ${esc(p.tag)}">
              <div class="xb-still" aria-hidden="true">${cuts(p)}</div>
            </div>
            <div class="xb-copy">
              <p class="xb-kicker">Christmas bundle · ${esc(p.template)}</p>
              <h3>${esc(p.name)}</h3>
              <p class="xb-in">${esc(p.tag)}</p>
              <div class="ge-row">${price(p)}<button class="ge-add" type="button" data-add="${p.slug}" aria-label="Add ${esc(p.name)} to bag">Add</button></div>
            </div>
          </article>`).join('')}
        </div>` : '';
  }

  /* ================= add to bag: silver shimmer ================= */
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-add], [data-qv-add]');
    if (!btn || btn.disabled) return;
    const bag = document.querySelector('.icon-btn [data-cart-count]')?.closest('.icon-btn') || document.querySelector('[data-open="cart"]');
    if (bag) { bag.classList.remove('is-frosted'); void bag.offsetWidth; bag.classList.add('is-frosted'); setTimeout(() => bag.classList.remove('is-frosted'), 950); }
    if (reduce) return;
    const r = btn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('i');
      s.className = 'xm-burst';
      s.style.left = cx + 'px'; s.style.top = cy + 'px';
      document.body.appendChild(s);
      const a = (i / 8) * TAU + rnd(-.2, .2), dist = rnd(26, 48), sc = rnd(.8, 1.5);
      s.animate([
        { transform: 'translate(0,0) scale(.3) rotate(0deg)', opacity: 1 },
        { transform: `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist}px) scale(${sc}) rotate(60deg)`, opacity: 0 }
      ], { duration: rnd(600, 850), easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = () => s.remove();
    }
  }, true);

  /* ================= site-wide snowfall ================= */
  if (reduce) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'site-snow';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const g = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1, flakes = [], spr = [], running = false, raf = 0, last = 0, clock = 0;
  let density = 0, target = 0, flurry = 0, nextFlurry = rnd(18, 32);
  let lastScroll = scrollY;

  function sprite(r, a, shadow) {
    const s = Math.ceil(r * 2 + 4), c = document.createElement('canvas');
    c.width = c.height = Math.ceil(s * dpr);
    const x = c.getContext('2d'); x.scale(dpr, dpr);
    const disc = (cy, col, al) => {
      const gr = x.createRadialGradient(s / 2, cy, 0, s / 2, cy, r);
      gr.addColorStop(0, `rgba(${col},${al})`); gr.addColorStop(.55, `rgba(${col},${al * .85})`); gr.addColorStop(1, `rgba(${col},0)`);
      x.fillStyle = gr; x.beginPath(); x.arc(s / 2, cy, r, 0, TAU); x.fill();
    };
    disc(s / 2 + r * .18, '96,104,132', shadow);   // a cool contour so white snow reads on pearl
    disc(s / 2, '255,255,255', a);
    return { c, s };
  }
  // a six-armed crystal, white over a silver outline so it reads on pearl
  let crystals = [];
  function crystal(size, v) {
    const c = document.createElement('canvas');
    c.width = c.height = Math.ceil(size * dpr);
    const x = c.getContext('2d'); x.scale(dpr, dpr);
    const R = size * .44, br = [[.38, .36], [.62, .26], [.8, .16]].slice(0, 2 + (v > 0));
    const arms = (col, lw) => {
      x.save(); x.translate(size / 2, size / 2); x.strokeStyle = col; x.lineWidth = lw; x.lineCap = 'round';
      for (let k = 0; k < 6; k++) {
        x.rotate(TAU / 6); x.beginPath(); x.moveTo(0, 0); x.lineTo(R, 0);
        for (const [p, l] of br) { x.moveTo(R * p, 0); x.lineTo(R * p + R * l * .7, -R * l * .62); x.moveTo(R * p, 0); x.lineTo(R * p + R * l * .7, R * l * .62); }
        x.stroke();
      }
      x.restore();
    };
    arms('rgba(120,128,146,.55)', 2.4); arms('rgba(255,255,255,.98)', 1.2);
    return { c, s: size };
  }
  function layout() {
    W = innerWidth; H = innerHeight; dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    spr = [sprite(1.8, .95, .55), sprite(3.1, .98, .5), sprite(7, .6, .2)];
    crystals = [0, 1, 2].map(v => crystal(22, v));
    const n = W < 760 ? 70 : 150;
    while (flakes.length < n) flakes.push(newFlake(true));
    flakes.length = n;
  }
  function newFlake(anywhere) {
    const u = Math.random(), z = u < .6 ? rnd(0, .35) : u < .94 ? rnd(.35, .8) : rnd(.8, 1);
    return {
      z, k: z < .35 ? 0 : z < .8 ? 1 : 2, x: rnd(-20, W + 20), y: anywhere ? rnd(-H * .1, H) : rnd(-60, -10),
      r: z < .35 ? rnd(.6, 1) : z < .8 ? rnd(.75, 1.2) : rnd(.8, 1.25),
      vy: 14 + 70 * z * rnd(.85, 1.15), sway: 4 + 16 * z, f: rnd(.3, 1), ph: rnd(0, TAU), a: z < .35 ? rnd(.45, .8) : z < .8 ? rnd(.75, 1) : rnd(.35, .6),
      idx: Math.random(), crys: z > .35 && Math.random() < .28 ? (Math.random() * 3) | 0 : -1,
      rot: rnd(0, TAU), spin: rnd(-.6, .6), cs: rnd(.55, 1)
    };
  }
  const wind = t => 9 * Math.sin(t * .1) + 6 * Math.sin(t * .27 + 1.3) + 3 * Math.sin(t * .8 + 2.1);

  // one snowfall over the whole site, banners included; a little lighter over the product grids
  const hero = document.querySelector('.hero');
  const shop = ['#best-sellers', '#collection', '#essentials'].map(s => document.querySelector(s)).filter(Boolean);
  function zone() {
    const mid = H * .5;
    for (const s of shop) { const r = s.getBoundingClientRect(); if (r.top < mid && r.bottom > mid) return .8; }
    return 1;
  }
  let zt = 0;
  function frame(now) {
    raf = 0;
    const dt = Math.min(.05, last ? (now - last) / 1000 : .016); last = now; clock += dt;
    if ((zt += dt) > .25) { zt = 0; target = zone(); }
    density += (target - density) * Math.min(1, dt * 1.6);
    // now and then a flurry: a gust and a little more snow for a few seconds
    if ((nextFlurry -= dt) < 0) { flurry = 1; nextFlurry = rnd(22, 40); }
    flurry = Math.max(0, flurry - dt / 4);
    const gust = wind(clock) + flurry * 38, show = Math.min(1, density * (1 + flurry * .5));
    const ds = scrollY - lastScroll; lastScroll = scrollY;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    for (const f of flakes) {
      f.y += f.vy * dt - ds * (.15 + f.z * .55);          // nearer flakes slide more with the scroll: depth
      f.x += (gust * (.3 + .9 * f.z) + Math.sin(clock * f.f + f.ph) * f.sway) * dt;
      if (f.y > H + 12) Object.assign(f, newFlake(false));
      else if (f.y < -70) f.y += H + 70;
      if (f.x < -30) f.x += W + 60; else if (f.x > W + 30) f.x -= W + 60;
      if (f.idx > show) continue;
      g.globalAlpha = f.a * Math.min(1, (show - f.idx) * 6);
      if (f.crys >= 0) {
        const c = crystals[f.crys], d = c.s * f.cs * (f.k === 2 ? 1.25 : .8);
        f.rot += f.spin * dt;
        g.save(); g.translate(f.x, f.y); g.rotate(f.rot); g.drawImage(c.c, -d / 2, -d / 2, d, d); g.restore();
      } else {
        const s = spr[f.k], d = s.s * f.r;
        g.drawImage(s.c, f.x - d / 2, f.y - d / 2, d, d);
      }
    }
    g.globalAlpha = 1;
    canvas.classList.toggle('is-on', density > .02);
    if (running) raf = requestAnimationFrame(frame);
  }
  function update() {
    const want = !snowOff && !document.hidden && (zone() > 0 || density > .01);
    if (want && !running) { running = true; last = 0; target = zone(); raf = requestAnimationFrame(frame); }
    if (!want && running) { running = false; cancelAnimationFrame(raf); raf = 0; }
  }
  layout();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 150); });
  document.addEventListener('visibilitychange', update);
  document.addEventListener('alara:snow', () => { canvas.classList.toggle('is-off', snowOff); update(); });
  canvas.classList.toggle('is-off', snowOff);
  addEventListener('scroll', () => { if (!running) { target = zone(); update(); } }, { passive: true });
  update();
})();
