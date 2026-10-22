/* ÀLara Hair Lab — real photography + hair-masked effect layers */
(function () {
  'use strict';

  const W = 1000, H = 1250;
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;

  /* hair types on the same campaign model (same pose, same set); only the hair changes.
     A look is shown only if its photo exists in assets/img/lab/<key>/ */
  const LOOKS = [
    { key: 'waves', family: 'wavy', name: 'Soft waves' },
    { key: 'straight', family: 'straight', name: 'Straight' },
    { key: 'curly', family: 'curly', name: 'Curly' },
    { key: 'coily', family: 'coily', name: 'Coily' }
  ];
  const LAYERS = ['rich', 'soft', 'dry', 'ends', 'thin', 'oily', 'frizz', 'flakes', 'shine', 'glow'];
  const OPTIONAL_LAYERS = ['oily'];

  /* starting condition per concern — moderate, like real life, not a caricature */
  const CONCERNS = {
    frizz:  { label: 'Dry & frizzy',        hydrate: .25, shine: .25, frizz: .75, define: .35, density: .95, flakes: 0,   oil: .05, smooth: .2,  edges: .5,  volume: .1,  damage: .25, scalp: .65 },
    damage: { label: 'Damaged & dull',      hydrate: .32, shine: .12, frizz: .45, define: .4,  density: .92, flakes: 0,   oil: .05, smooth: .15, edges: .3,  volume: 0,   damage: .85, scalp: .65 },
    thin:   { label: 'Thinning & shedding', hydrate: .55, shine: .35, frizz: .25, define: .6,  density: .4,  flakes: .1,  oil: .3,  smooth: .35, edges: .2,  volume: -.1, damage: .2,  scalp: .45 },
    flakes: { label: 'Flakes & oily roots', hydrate: .45, shine: .2,  frizz: .3,  define: .55, density: .9,  flakes: .85, oil: .7,  smooth: .3,  edges: .25, volume: -.2, damage: .15, scalp: .2 }
  };
  const NUMERIC = ['hydrate', 'shine', 'frizz', 'define', 'density', 'length', 'flakes', 'oil', 'smooth', 'edges', 'volume', 'damage', 'glow', 'scalp', 'shield'];

  function baseState(concern) {
    const c = CONCERNS[concern], s = { length: 0, glow: 0, shield: 0, scent: [] };
    NUMERIC.forEach(k => { if (k in c) s[k] = c[k]; });
    return s;
  }
  /* products move hair towards healthy — never to "perfect" (k caps each effect) */
  function applyFx(state, fx, family) {
    const s = Object.assign({}, state, { scent: state.scent.slice() }), k = .85;
    const up = (key, a) => { if (a) s[key] = s[key] + (1 - s[key]) * clamp(a * k); };
    const down = (key, a) => { if (a) s[key] = s[key] * (1 - clamp(a * k)); };
    let define = fx.define || 0, smooth = fx.smooth || 0;
    if (fx.curlOnly && family === 'straight') { smooth += define * .6; define = 0; }
    up('hydrate', fx.hydrate); up('shine', fx.shine); down('frizz', fx.frizz);
    up('define', define); up('density', fx.density); up('smooth', smooth);
    s.length = Math.min(1, s.length + (fx.length || 0));
    down('flakes', fx.flakes); down('edges', fx.edges); down('edges', (fx.frizz || 0) * .3);
    if (fx.volume) s.volume = Math.min(.5, s.volume + fx.volume);
    up('glow', fx.glow); up('scalp', fx.scalp); if (fx.flakes) up('scalp', fx.flakes * .5);
    down('damage', (fx.hydrate || 0) * .55 + smooth * .45 + (fx.shine || 0) * .2 + (fx.strength || 0) * .6);
    // effects derived from ingredients
    const cleanse = fx.cleanse || 0;
    down('oil', (fx.oil || 0) + cleanse * .5);
    down('flakes', cleanse * .3);
    if (cleanse) s.volume = Math.min(.5, s.volume + cleanse * .2);
    down('edges', fx.hold); down('frizz', (fx.hold || 0) * .3);
    if (fx.shield || (fx.protect || 0) >= .5) s.shield = 1;
    if (fx.scent) fx.scent === 'multi' ? s.scent.push('honey', 'vanilla', 'green tea', 'amber musk') : s.scent.push(fx.scentName || 'fresh');
    return s;
  }
  function lerpState(a, b, t) { const s = { scent: b.scent }; NUMERIC.forEach(k => (s[k] = lerp(a[k], b[k], t))); return s; }

  function metrics(s, family) {
    return {
      hydration: clamp(s.hydrate * .85 + (1 - s.damage) * .15),
      shine: clamp(s.shine * .85 + s.glow * .15),
      frizz: clamp(1 - s.frizz * .9 - s.edges * .1),
      define: family === 'straight' ? clamp(s.smooth * .55 + s.define * .25 + (1 - s.frizz) * .2) : clamp(s.define * .8 + (1 - s.frizz) * .2),
      fullness: clamp(s.density * .82 + s.length * .18),
      scalp: clamp((1 - s.flakes) * .5 + s.scalp * .3 + (1 - s.oil) * .2)
    };
  }
  const WEIGHTS = {
    frizz: { frizz: 1, hydration: .8, define: .6, shine: .3, fullness: .1, scalp: .1 },
    damage: { shine: 1, hydration: .9, frizz: .5, define: .3, fullness: .2, scalp: .1 },
    thin: { fullness: 1.2, scalp: .7, hydration: .2, shine: .2, frizz: .1, define: .1 },
    flakes: { scalp: 1.2, shine: .4, fullness: .3, hydration: .2, frizz: .1, define: .1 }
  };
  function score(m, concern) { const w = WEIGHTS[concern]; let a = 0, t = 0; for (const k in w) { a += m[k] * w[k]; t += w[k]; } return Math.round(100 * a / t); }

  /* hair state → opacity of each photographic layer */
  function alphas(s) {
    return {
      rich: clamp((s.hydrate - .45) / .5) * .85,
      soft: clamp(1 - s.define) * .75 * (1 - s.smooth * .4),
      dry: clamp((1 - s.hydrate) * 1.15 + s.damage * .1) * .85,
      ends: clamp(s.damage) * .9,
      thin: clamp(1 - s.density) * .9,
      oily: clamp((s.oil - .15) / .55) * .9,
      // curved so a strong anti-frizz product clears most of the halo, leaving a few strays
      frizz: clamp(Math.pow(clamp((s.frizz - .12) / .58), 1.4) * .95 + s.edges * .08),
      flakes: Math.pow(clamp((s.flakes - .15) / .7), 1.3),
      shine: clamp((s.shine - .25) / .6) * .9,
      glow: clamp(s.glow) * .4
    };
  }

  /* results over time: fast products peak on first use, growth/scalp products build over weeks */
  const TIMELINE = [[1, 'First use'], [7, '1 week'], [15, '15 days'], [30, '1 month'], [60, '2 months']];
  function daysToFull(when) {
    const w = /(\d+)(?:–(\d+))?\s*weeks?/.exec(when || ''), x = /(\d+)(?:–(\d+))?\s*washes/.exec(when || '');
    if (w) return +(w[2] || w[1]) * 7;
    if (x) return +(x[2] || x[1]) * 3;
    return 1;
  }
  function progress(T, day, onset) {
    if (onset) return day < onset ? .04 : clamp(.35 + .65 * (day - onset) / Math.max(1, T - onset));
    if (T <= 1) return day >= 30 ? 1 : day >= 7 ? .93 : .82;
    return clamp(.12 + .88 * Math.min(1, day / T));
  }
  function scaleFx(fx, p) {
    const o = {};
    for (const k in fx) o[k] = typeof fx[k] === 'number' ? fx[k] * p : fx[k];
    return o;
  }
  /* products built from ingredients carry a timeline per kind of effect (see knowledge/build_effects) */
  const EFFECT_CLASS = { hydrate: 'cosmetic', smooth: 'cosmetic', frizz: 'cosmetic', define: 'cosmetic', hold: 'cosmetic', shine: 'cosmetic',
    glow: 'cosmetic', protect: 'cosmetic', strength: 'repair', scalp: 'scalp', flakes: 'scalp', oil: 'scalp', cleanse: 'scalp',
    density: 'growth', length: 'length' };
  function timedFx(fx, timing, day, boost) {
    const o = {};
    for (const k in fx) {
      const v = fx[k];
      if (typeof v !== 'number') { o[k] = v; continue; }
      const cls = EFFECT_CLASS[k], t = cls && timing[cls];
      if (!t) { o[k] = v; continue; }
      const [start, full] = t;
      const p = start > 1 ? progress(full, day, start) : progress(full, day);
      o[k] = Math.min(.95, v * p * ((cls === 'growth' || cls === 'length') ? boost : 1));
    }
    return o;
  }

  const cache = {};
  function loadFamily(look) {
    const key = look.key;
    if (cache[key]) return cache[key];
    const load = src => new Promise((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
    const opt = src => load(src).catch(() => null);
    const dir = `assets/img/lab/${key}/`;
    cache[key] = Promise.all([load(dir + 'base.jpg'), opt(dir + 'plate.jpg'), opt(dir + 'mask.webp'), ...LAYERS.map(n => (OPTIONAL_LAYERS.includes(n) ? opt : load)(dir + n + '.webp'))])
      .then(([base, plate, mask, ...ls]) => ({ base, plate, mask, meta: look.anchor ? { anchor: look.anchor } : null, layers: Object.fromEntries(LAYERS.map((n, i) => [n, ls[i]])) }));
    return cache[key];
  }

  /* growth: without growth products the lengths sit a little higher (SHORT); growth brings them down to the real length */
  const SHORT = .86;
  const growthOf = s => clamp(s.length / .4);
  const off = { c: document.createElement('canvas'), m: document.createElement('canvas') };

  function render(canvas, imgs, st) {
    const w = canvas.width, h = canvas.height, al = alphas(st);
    const useGrowth = imgs.plate && imgs.mask && imgs.meta;
    const C = useGrowth ? off.c : canvas;
    if (C.width !== w || C.height !== h) { C.width = w; C.height = h; }
    const g = C.getContext('2d');
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.drawImage(imgs.base, 0, 0, w, h);
    for (const n of LAYERS) {
      const a = al[n]; if (a < .01 || !imgs.layers[n]) continue;
      g.globalAlpha = a;
      g.globalCompositeOperation = n === 'shine' ? 'screen' : n === 'glow' ? 'soft-light' : 'source-over';
      g.drawImage(imgs.layers[n], 0, 0, w, h);
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    if (!useGrowth) return;

    const out = canvas.getContext('2d'), k = h / H, ay = Math.round(imgs.meta.anchor * k);
    const sc = SHORT + (1 - SHORT) * growthOf(st);
    out.globalCompositeOperation = 'source-over'; out.globalAlpha = 1;
    out.drawImage(C, 0, 0);
    if (sc >= .999) return;
    // tee/arms under the lengths, then the real hair lengths, scaled from the shoulders down
    out.drawImage(imgs.plate, 0, imgs.meta.anchor, W, H - imgs.meta.anchor, 0, ay, w, h - ay);
    const M = off.m; if (M.width !== w || M.height !== h) { M.width = w; M.height = h; }
    const mg = M.getContext('2d');
    mg.globalCompositeOperation = 'source-over'; mg.clearRect(0, 0, w, h);
    mg.drawImage(C, 0, 0);
    mg.globalCompositeOperation = 'destination-in'; mg.drawImage(imgs.mask, 0, 0, w, h);
    mg.globalCompositeOperation = 'source-over';
    out.drawImage(M, 0, ay, w, h - ay, 0, ay, w, (h - ay) * sc);
  }

  /* ---------- UI ---------- */
  function init(root, opts) {
    const A = window.ALARA, $ = s => root.querySelector(s);
    const els = {
      stage: $('.lab-stage'), before: $('.lab-canvas-before'), after: $('.lab-canvas-after'),
      afterWrap: $('.lab-after'), handle: $('.lab-handle'), afterLabel: $('.lab-after-label'), count: $('.lab-count'),
      dots: $('.lab-dots'), prev: root.querySelector('.lab-prev'), next: root.querySelector('.lab-next'), typeName: root.querySelector('.lab-type-name'), timeline: $('.lab-timeline'),
      concerns: $('.lab-concerns'), filters: $('.lab-filters'), rail: $('.lab-rail'), routine: $('.lab-routine'),
      result: $('.lab-result'), reset: $('.lab-reset'), selCount: $('.lab-sel-count')
    };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const S = { look: 0, family: 'wavy', concern: 'frizz', selected: [], routine: false, split: .5, filter: 'all', day: 30, open: null };
    let looks = [LOOKS[0]], imgs = null, beforeState, afterState, shown = null, anim = null, token = 0;
    const SCENTS = { 'hair-mist-oh-honey': 'honey', 'hair-mist-tropical-vanilla': 'vanilla', 'hair-mist-green-tea': 'green tea', 'hair-mist-amber-musk': 'amber musk', 'shampoo': 'honey', 'conditioner': 'honey', 'intensive-repair-shampoo-tropical-vanilla': 'vanilla', 'hydrating-conditioner-tropical-vanilla': 'vanilla' };
    const labProducts = A.products.filter(p => p.fx || p.combo);
    const fxFor = slug => { const p = A.bySlug[slug]; return (p.combo || [slug]).map(s => ({ fx: Object.assign({}, A.bySlug[s].fx, { scentName: SCENTS[s] }), p: A.bySlug[s] })); };
    const stateFor = (slugs, day = S.day) => {
      let s = baseState(S.concern);
      const items = slugs.flatMap(fxFor);
      // tools like the scalp massager and derma roller boost how well growth products absorb
      const boost = Math.max(1, ...items.map(it => (it.p.boosts && it.p.boosts.growth) || 1));
      items.forEach(({ fx, p }) => {
        const f = p.timing ? timedFx(fx, p.timing, day, p.boosts ? 1 : boost)
          : scaleFx(fx, progress(daysToFull(fx.when), day, fx.onset));
        s = applyFx(s, f, S.family);
      });
      return s;
    };

    function size() {
      const r = els.stage.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.max(200, Math.round(Math.min(W, r.width * dpr))), h = Math.round(w * H / W);
      [els.before, els.after].forEach(c => { if (c.width !== w) { c.width = w; c.height = h; } });
    }
    function draw() { if (!imgs) return; render(els.before, imgs, beforeState); render(els.after, imgs, shown); }

    /* ---- hair type carousel (same model) ---- */
    function syncCarousel() {
      els.count.textContent = `${S.look + 1}/${looks.length}`;
      els.dots.innerHTML = looks.map((l, i) => `<i class="${i === S.look ? 'on' : ''}"></i>`).join('');
      const many = looks.length > 1;
      [els.dots, els.count].forEach(e => (e.hidden = !many));
      els.prev.setAttribute('aria-disabled', !many); els.next.setAttribute('aria-disabled', !many);
      els.typeName.textContent = looks[S.look].name + ' hair';
      const sub = els.stage.querySelector('.lab-stage-title small'); if (sub) sub.textContent = 'Shared with us';
      els.stage.setAttribute('aria-label', `${looks[S.look].name} hair. Drag the line to compare before and after.`);
    }
    async function setLook(i, dir) {
      S.look = (i + looks.length) % looks.length;
      const L = looks[S.look]; S.family = L.family;
      syncCarousel();
      const my = ++token;
      if (dir && !reduce) { els.stage.classList.remove('slide-l', 'slide-r'); void els.stage.offsetWidth; els.stage.classList.add(dir > 0 ? 'slide-l' : 'slide-r'); }
      els.stage.classList.add('is-loading');
      const data = await loadFamily(L);
      if (my !== token) return;
      imgs = data; els.stage.classList.remove('is-loading');
      recompute(true);
      if (S.open) renderDetail();
    }
    function recompute(instant) {
      beforeState = baseState(S.concern);
      const next = stateFor(S.selected);
      if (instant || reduce || !shown || !imgs) { if (anim) cancelAnimationFrame(anim); anim = null; afterState = shown = next; size(); draw(); }
      else { render(els.before, imgs, beforeState); tweenTo(next); }
      updateResult(); updateBadges();
    }
    function tweenTo(next) {
      const from = shown; afterState = next;
      if (anim) cancelAnimationFrame(anim);
      const t0 = performance.now(), dur = 900;
      const step = now => {
        const k = clamp((now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        shown = lerpState(from, next, e); render(els.after, imgs, shown);
        anim = k < 1 ? requestAnimationFrame(step) : null;
      };
      anim = requestAnimationFrame(step);
    }

    /* ---- before/after line vs. swipe ---- */
    function setSplit(v) {
      S.split = clamp(v, .02, .98);
      els.afterWrap.style.clipPath = `inset(0 0 0 ${(S.split * 100).toFixed(2)}%)`;
      els.handle.style.left = S.split * 100 + '%';
      els.handle.setAttribute('aria-valuenow', Math.round(S.split * 100));
      els.stage.style.setProperty('--split', S.split * 100 + '%');
      els.stage.style.setProperty('--split-r', (100 - S.split * 100) + '%');
      els.stage.querySelector('.lab-tag-before').style.opacity = S.split < .2 ? 0 : 1;
      els.afterLabel.style.opacity = S.split > .72 ? 0 : 1;
    }
    let mode = null, sx = 0;
    els.stage.addEventListener('pointerdown', e => {
      if (e.target.closest('.lab-nav')) return;
      const r = els.stage.getBoundingClientRect();
      mode = 'slide'; sx = e.clientX;
      els.stage.setPointerCapture(e.pointerId);
      if (mode === 'slide') setSplit((e.clientX - r.left) / r.width);
    });
    els.stage.addEventListener('pointermove', e => { if (mode === 'slide') { const r = els.stage.getBoundingClientRect(); setSplit((e.clientX - r.left) / r.width); } });
    els.stage.addEventListener('pointerup', e => {
      mode = null;
    });
    els.stage.addEventListener('pointercancel', () => (mode = null));
    function step(d) {
      if (looks.length < 2) { els.typeName.classList.remove('nudge'); void els.typeName.offsetWidth; els.typeName.classList.add('nudge'); els.typeName.dataset.hint = 'More hair types coming soon'; return; }
      setLook(S.look + d, d);
    }
    els.prev.addEventListener('click', () => step(-1));
    els.next.addEventListener('click', () => step(1));
    els.handle.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { setSplit(S.split - .05); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setSplit(S.split + .05); e.preventDefault(); }
    });

    /* ---- timeline ---- */
    els.timeline.innerHTML = '<span class="tl-label">Results after</span>' + TIMELINE.map(([d, l]) => `<button type="button" data-day="${d}" aria-pressed="${d === S.day}">${l}</button>`).join('');
    els.timeline.addEventListener('click', e => {
      const b = e.target.closest('[data-day]'); if (!b) return;
      S.day = +b.dataset.day; els.timeline.querySelectorAll('[data-day]').forEach(x => x.setAttribute('aria-pressed', x === b));
      recompute(false);
    });

    /* ---- concern ---- */
    els.concerns.innerHTML = Object.entries(CONCERNS).map(([k, c]) => `<button type="button" class="lab-seg" data-concern="${k}" aria-pressed="${k === S.concern}">${c.label}</button>`).join('');
    els.concerns.addEventListener('click', e => {
      const b = e.target.closest('[data-concern]'); if (!b) return;
      S.concern = b.dataset.concern; els.concerns.querySelectorAll('[data-concern]').forEach(c => c.setAttribute('aria-pressed', c === b));
      recompute(true);
    });

    /* ---- products + inline detail ---- */
    const FILTERS = [['all', 'All'], ['Hair Care', 'Hair care'], ['Hair Accessories', 'Accessories'], ['Offers', 'Sets']];
    const inFilter = (p, k) => k === 'all' || p.cats.includes(k);
    els.filters.innerHTML = FILTERS.map(([k, l]) => `<button type="button" class="lab-tab" data-filter="${k}" aria-pressed="${k === 'all'}">${l}<small>${labProducts.filter(p => inFilter(p, k)).length}</small></button>`).join('');
    els.filters.addEventListener('click', e => {
      const b = e.target.closest('[data-filter]'); if (!b) return;
      S.filter = b.dataset.filter; els.filters.querySelectorAll('[data-filter]').forEach(c => c.setAttribute('aria-pressed', c === b));
      els.rail.querySelectorAll('.lab-prod').forEach(c => (c.hidden = !inFilter(A.bySlug[c.dataset.slug], S.filter)));
      els.rail.scrollTop = 0;
      placeDetail();
    });
    els.rail.innerHTML = labProducts.map(p => `
      <button type="button" class="lab-prod" data-slug="${p.slug}" aria-pressed="false" aria-expanded="false" aria-controls="lab-detail">
        <span class="lab-prod-img"><img src="${p.img}" alt="" loading="lazy"></span>
        <span class="lab-prod-txt"><b>${p.name}</b><small>${p.tag || ''}</small></span>
        <span class="lab-prod-side"><i class="lab-prod-match">Best match</i><span class="lab-prod-price">${p.oos ? 'Sold out' : '$' + p.price}</span></span>
        <i class="lab-prod-check" aria-hidden="true"></i>
      </button>`).join('') + '<div class="lab-detail" id="lab-detail" role="region" aria-live="polite" hidden></div>';
    const detail = els.rail.querySelector('.lab-detail');

    els.rail.addEventListener('click', e => {
      if (e.target.closest('.lab-detail-close')) { S.open = null; placeDetail(); return; }
      const add = e.target.closest('.lab-detail-add'); if (add) { opts.onAdd && opts.onAdd(add.dataset.slug); return; }
      const b = e.target.closest('.lab-prod'); if (!b || !imgs) return;
      const slug = b.dataset.slug, on = S.selected.includes(slug);
      if (S.routine) S.selected = on ? S.selected.filter(s => s !== slug) : [...S.selected, slug];
      else S.selected = on ? [] : [slug];
      S.open = S.selected.includes(slug) ? slug : (S.selected.length ? S.selected[S.selected.length - 1] : null);
      syncRail(); recompute(false); placeDetail();
    });
    function syncRail() {
      els.rail.querySelectorAll('.lab-prod').forEach(c => { const on = S.selected.includes(c.dataset.slug); c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on); c.setAttribute('aria-expanded', c.dataset.slug === S.open); });
      const n = S.selected.length;
      els.selCount.textContent = n ? `${n} product${n > 1 ? 's' : ''} selected` : (S.routine ? 'Choose several products to combine' : 'No product selected');
      els.reset.disabled = !n;
    }

    function hairNote(p) {
      const fxs = (p.combo || [p.slug]).map(s => A.bySlug[s].fx || {});
      const max = k => Math.max(0, ...fxs.map(f => +f[k] || 0));
      const def = max('define') >= .3, sm = max('smooth') >= .3, grow = max('density') >= .3;
      const notes = {
        curly: def ? 'Curls look rounder, more defined and bouncier.' : sm ? 'Curls look smoother and less frizzy.' : '',
        wavy: def ? 'Waves keep a clearer, more even S-shape.' : sm ? 'Waves look smoother and glossier.' : '',
        straight: def || sm ? 'Lengths lie flatter, sleeker and smoother.' : '',
        coily: def ? 'Coils clump together and look defined, not fuzzy.' : sm ? 'Coils look softer and more moisturised.' : ''
      };
      const extra = [];
      if (max('flakes') >= .3) extra.push('Flakes clear from the roots.');
      if (max('oil') >= .3 && S.concern === 'flakes') extra.push('Roots look cleaner and less greasy.');
      if (max('strength') >= .3) extra.push('Ends look healthier, with less breakage.');
      if (grow) extra.push('Over time the hair looks thicker and fuller.');
      return [notes[S.family] || '', ...extra].filter(Boolean).join(' ');
    }
    function whenText(p) {
      if (!p.combo) return p.whenText || (p.fx && p.fx.when) || '';
      const parts = p.combo.map(s => A.bySlug[s]);
      const growth = parts.filter(q => q.timing && (q.fx.density || 0) >= .3).map(q => q.timing.growth[0]);
      return 'From the first use' + (growth.length ? `, fuller hair from about ${Math.min(...growth)} days` : ', building over 2–4 weeks');
    }
    function renderDetail() {
      const p = A.bySlug[S.open]; if (!p) return;
      const look = looks[S.look].name.toLowerCase();
      const note = hairNote(p);
      const inci = p.combo ? null : p.inciList;
      detail.innerHTML = `
        <button type="button" class="lab-detail-close" aria-label="Close details"><svg class="ic sm"><use href="#i-close"/></svg></button>
        <h4>${p.name}</h4>
        <dl>
          <dt>What’s inside</dt><dd>${p.inside || p.tag}</dd>
          <dt>Why your hair looks like this</dt><dd>${p.why || p.desc}${note ? ` <span class="lab-note-hair">On ${look} hair: ${note}</span>` : ''}</dd>
          <dt>When you’ll see it</dt><dd>${whenText(p)}</dd>
        </dl>
        ${inci && inci.length ? `<details class="lab-inci"><summary>Full ingredient list</summary><p>${inci.join(', ')}</p></details>` : ''}
        <div class="lab-detail-foot"><b>$${p.price}${p.was ? ` <s>$${p.was}</s>` : ''}</b>
          <button type="button" class="btn btn-primary lab-detail-add" data-slug="${p.slug}"${p.oos ? ' disabled' : ''}>${p.oos ? 'Sold out' : 'Add to bag'}</button></div>`;
    }
    function placeDetail() {
      syncRail();
      if (!S.open) { detail.hidden = true; return; }
      const items = [...els.rail.querySelectorAll('.lab-prod')].filter(c => !c.hidden);
      const idx = items.findIndex(c => c.dataset.slug === S.open);
      if (idx < 0) { detail.hidden = true; return; }
      const row = items[idx];
      if (row.nextElementSibling !== detail) row.after(detail);
      renderDetail(); detail.hidden = false;
      // the list scrolls inside the panel: bring the chosen row and its details into view
      const r = els.rail;
      if (r.scrollHeight > r.clientHeight + 1) {
        const top = row.offsetTop - 6, bottom = detail.offsetTop + detail.offsetHeight + 6;
        const target = bottom - top > r.clientHeight ? top : Math.min(top, Math.max(r.scrollTop, bottom - r.clientHeight));
        if (target !== r.scrollTop) r.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    els.routine.addEventListener('change', () => {
      S.routine = els.routine.checked;
      if (!S.routine && S.selected.length > 1) { S.selected = [S.selected[S.selected.length - 1]]; S.open = S.selected[0]; recompute(false); placeDetail(); }
      else syncRail();
    });
    els.reset.addEventListener('click', () => { S.selected = []; S.open = null; recompute(false); placeDetail(); });

    // wavy and curly hair types: the Curls On Collection is always the best match
    const CURL_FAMILIES = ['wavy', 'curly'], CURL_LINE = 'Curls On Collection';
    function updateBadges() {
      const base = score(metrics(baseState(S.concern), S.family), S.concern);
      const top = CURL_FAMILIES.includes(S.family) ? labProducts.filter(p => p.cats.includes(CURL_LINE)).map(p => p.slug) : labProducts.filter(p => !p.oos && !p.combo)
        .map(p => ({ s: p.slug, d: score(metrics(stateFor([p.slug], 60), S.family), S.concern) - base }))
        .sort((a, b) => b.d - a.d).slice(0, 3).map(x => x.s);
      els.rail.querySelectorAll('.lab-prod').forEach(c => c.classList.toggle('is-match', top.includes(c.dataset.slug)));
    }

    const LABELS = { hydration: 'Hydration', shine: 'Shine', frizz: 'Frizz control', define: 'Definition', fullness: 'Fullness', scalp: 'Scalp health' };
    function updateResult() {
      const mb = metrics(beforeState, S.family), ma = metrics(afterState, S.family);
      const sel = S.selected.map(s => A.bySlug[s]);
      const dayLabel = TIMELINE.find(t => t[0] === S.day)[1];
      els.afterLabel.textContent = sel.length ? (S.day === 1 ? 'After first use' : 'After ' + dayLabel) : 'After';
      if (!sel.length) { els.result.innerHTML = '<p class="res-empty">Choose a product to see how it changes this hair.</p>'; return; }
      const title = sel.map(p => p.name).join(' + ');
      const deltas = Object.keys(LABELS).map(k => [k, Math.round((ma[k] - mb[k]) * 100)]).filter(([, d]) => d > 2).sort((a, b) => b[1] - a[1]).slice(0, 4);
      const total = sel.reduce((a, p) => a + p.price, 0);
      els.result.innerHTML = `
        <div class="res-top">
          <div class="res-title"><h4>${title}</h4><small>${S.day === 1 ? 'After first use' : `After ${dayLabel} of regular use`}</small></div>
          <button type="button" class="btn btn-primary res-add"${sel.every(p => p.oos) ? ' disabled' : ''}>Add ${sel.length > 1 ? 'all' : 'to bag'} · $${total}</button>
        </div>
        ${deltas.length ? `<ul class="res-deltas">${deltas.map(([k, d]) => `<li><span>${k === 'define' && S.family === 'straight' ? 'Sleekness' : LABELS[k]}</span><b>+${d}%</b></li>`).join('')}</ul>` : '<p class="res-note">Not visible yet at this point — move the timeline forward.</p>'}`;
      els.result.querySelector('.res-add').addEventListener('click', () => sel.forEach(p => !p.oos && opts.onAdd && opts.onAdd(p.slug)));
    }

    new ResizeObserver(() => { const w0 = els.before.width; size(); if (els.before.width !== w0) draw(); if (S.open) placeDetail(); }).observe(els.stage);
    setSplit(.5);

    looks = (window.ALARA_LOOKS && window.ALARA_LOOKS.length) ? window.ALARA_LOOKS : [LOOKS[0]];
    setLook(0);
    looks.slice(1).forEach(L => loadFamily(L));

    return { select(slug) { S.selected = [slug]; S.open = slug; if (imgs) recompute(false); placeDetail(); setSplit(.5); } };
  }

  window.HairLab = { init, LOOKS, CONCERNS };
})();
