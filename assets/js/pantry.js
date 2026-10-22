/* Ingredient banner, driven by real motion rather than keyframes:
   - every ingredient is a photograph with a spring attached to its resting place. On arrival it is
     tossed up from below the frame and the spring lets it overshoot a touch and settle, each with its
     own mass, so they land one after another like real objects; at rest they drift on a slow current.
   - leaving, the spring lets go and gravity takes over: they fall out of the frame, tumbling.
   - the bottles do the same, heavier and with less bounce.
   - the pointer moves the near layer more than the far one, so the depth is real parallax. */
(function () {
  'use strict';
  const slide = document.querySelector('.hero-pantry');
  if (!slide) return;
  const hero = slide.closest('.hero');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const I = 'assets/img/pantry/';

  /* [image, x, y (0..1 of the banner), width (share of banner height), layer, rotation] */
  const STATES = {
    honey: {
      word: 'HONEY', name: '<b>Oh Honey!</b> shampoo, conditioner and hair mist', quick: 'shampoo',
      items: [['honeycomb', .2, .28, .2, 'far', -12], ['honey-dipper', .78, .27, .3, 'far', -24], ['honeycomb', .83, .67, .14, 'far', 18],
              ['honeycomb', .3, .7, .1, 'far', 40], ['honey-dipper', .06, .82, .3, 'near', 28], ['honeycomb', .95, .2, .2, 'near', -30]]
    },
    curls: {
      word: 'CURLS', name: '<b>Curls On</b> shampoo, conditioner and curling cream', quick: 'curls-on-collection',
      items: [['blueberry-3', .2, .26, .1, 'far', 0], ['raspberry-2', .78, .26, .12, 'far', 20], ['blueberry-4', .3, .66, .08, 'far', 40],
              ['raspberry-1', .73, .68, .1, 'far', -16], ['blueberry-4', .86, .44, .06, 'far', -30], ['blueberry-3', .14, .52, .06, 'far', 70],
              ['raspberry-group', .06, .84, .26, 'near', 10], ['blueberry-3', .95, .22, .16, 'near', -20]]
    },
    tropical: {
      word: 'TROPICAL', name: '<b>Tropical Vanilla</b> shampoo, conditioner and hair mist', quick: 'intensive-repair-shampoo-tropical-vanilla',
      items: [['passion-half-2', .2, .27, .16, 'far', -14], ['passion-half-3', .8, .28, .14, 'far', 22], ['passion-half-1', .82, .7, .13, 'far', -8],
              ['passion-half-3', .26, .7, .1, 'far', 36], ['passion-half-1', .05, .84, .28, 'near', 20], ['passion-half-2', .96, .18, .2, 'near', -26]]
    }
  };
  const ORDER = ['honey', 'curls', 'tropical'];
  const far = slide.querySelector('.pn-far'), near = slide.querySelector('.pn-near');
  const wordEl = slide.querySelector('.pn-word'), nameEl = slide.querySelector('.pn-name'), btn = slide.querySelector('.pn-btn');

  /* a physical body: position, velocity, rotation; a spring towards a target, or free fall */
  const bodies = [];
  function body(el, opts) {
    const b = { el, x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, ry: 0, vry: 0, tx: 0, ty: 0, tr: 0, mode: 'off', delay: 0,
      k: opts.k || 120, c: opts.c || 13, m: opts.m || 1, drift: rnd(0, 6.28), layer: opts.layer || 'far', flip: 1 };
    bodies.push(b); return b;
  }
  const sets = {};
  for (const st of ORDER) {
    sets[st] = STATES[st].items.map(([img, x, y, w, layer, rot]) => {
      const el = document.createElement('span'); el.className = 'pn-i';
      el.innerHTML = `<img src="${I}${img}.webp" alt="" draggable="false">`;
      (layer === 'near' ? near : far).appendChild(el);
      const b = body(el, { k: rnd(70, 110), c: rnd(9, 12), m: rnd(.8, 1.3), layer });
      Object.assign(b, { fx: x, fy: y, fw: w, rot, flip: Math.random() < .5 ? -1 : 1 });
      el.style.opacity = 0;
      return b;
    });
  }
  const trios = {};
  slide.querySelectorAll('.pn-trio').forEach(t => {
    trios[t.dataset.state] = [...t.querySelectorAll('.pn-b')].map((el, i) => {
      const b = body(el, { k: 140, c: 17, m: 1.4 }); b.isBottle = true; b.i = i; return b;
    });
  });

  let W = 0, H = 0;
  function layout() {
    W = slide.clientWidth || hero.clientWidth; H = slide.clientHeight || hero.clientHeight;
    for (const st of ORDER) for (const b of sets[st]) {
      const phone = W < 760;
      // phones: smaller, pushed to the edges and clear of the word (top) and the caption (bottom)
      const fx = phone ? (b.fx < .5 ? b.fx * .55 : 1 - (1 - b.fx) * .55) : b.fx;
      const fy = phone ? (b.layer === 'near' ? (b.fy < .5 ? .08 : .14) : (b.fy < .5 ? .12 + b.fy * .2 : .44 + (b.fy - .5) * .3)) : b.fy;
      const w = b.fw * H * (phone ? .55 : 1); b.el.style.width = w + 'px';
      b.tx = fx * W - w / 2; b.ty = fy * H - w / 2; b.tr = b.rot;
    }
  }

  /* ---------------- the word ---------------- */
  function setWord(word, first) {
    const old = [...wordEl.children];
    old.forEach((s, i) => { s.style.transitionDelay = `${i * 30}ms`; s.classList.remove('in'); s.classList.add('out'); });
    setTimeout(() => {
      wordEl.innerHTML = [...word].map(c => `<span>${c}</span>`).join('');
      [...wordEl.children].forEach((s, i) => { s.style.transitionDelay = `${(first ? 250 : 80) + i * 55}ms`; requestAnimationFrame(() => requestAnimationFrame(() => s.classList.add('in'))); });
    }, old.length ? 380 : 0);
  }

  /* ---------------- switching ---------------- */
  let cur = null;
  function show(st, first = false, dir = 1) {
    const prev = cur; cur = st; slide.dataset.pantry = st;
    const S = STATES[st];
    setWord(S.word, first);
    nameEl.innerHTML = S.name; btn.dataset.quick = S.quick; btn.href = "product.html?p=" + S.quick;
    if (prev && prev !== st) {
      // the old set lets go: a little push, then gravity
      for (const b of sets[prev].concat(trios[prev])) {
        b.delay = 0;
        if (b.isBottle) { b.mode = 'turnout'; b.dir = dir; b.vry = dir * 60; continue; }   // the bottles turn away on their axis
        b.mode = 'fall'; b.vy = rnd(-260, -120);
        b.vx = rnd(-80, 80) + (b.fx - .5) * 300; b.vr = rnd(-120, 120);
      }
    }
    trios[st].concat(sets[st]).forEach((b, i) => {
      b.mode = 'spring';
      if (b.isBottle) { b.tx = 0; b.ty = 0; b.tr = 0; b.x = 0; b.y = first ? H * .7 : 0; b.r = 0; b.vx = 0; b.vy = first ? -1000 : 0; b.vr = 0; b.ry = first ? 0 : -dir * 95; b.vry = 0; b.delay = first ? .15 + b.i * .09 : .32 + b.i * .07; }
      else { b.x = b.tx + (b.fx - .5) * 120; b.y = H + 80 + rnd(0, 140); b.r = b.tr + rnd(-60, 60); b.vx = 0; b.vy = -rnd(1100, 1500); b.vr = rnd(-40, 40); b.delay = .3 + i * .07; }
      if (reduce) { b.x = b.tx; b.y = b.ty; b.r = b.tr; b.vx = b.vy = b.vr = 0; b.delay = 0; }
    });
    kick();
  }
  slide.querySelectorAll('[data-pantry-go]').forEach(el => el.addEventListener('click', () => {
    const d = +el.dataset.pantryGo; show(ORDER[(ORDER.indexOf(cur) + d + ORDER.length) % ORDER.length], false, d); restartAuto();
  }));
  let auto = 0;
  const restartAuto = () => { clearInterval(auto); if (!reduce) auto = setInterval(() => { if (slide.classList.contains('is-active')) show(ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length]); }, 7500); };

  /* ---------------- pointer parallax ---------------- */
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width * 2 - 1; tmy = (e.clientY - r.top) / r.height * 2 - 1; kick(); });
  hero.addEventListener('pointerleave', () => { tmx = tmy = 0; });

  /* ---------------- the simulation ---------------- */
  let raf = 0, last = 0, clock = 0, visible = true;
  function frame(now) {
    raf = 0;
    const dt = Math.min(1 / 30, last ? (now - last) / 1000 : 1 / 60); last = now; clock += dt;
    mx += (tmx - mx) * .06; my += (tmy - my) * .06;
    slide.style.setProperty('--mx', mx.toFixed(3)); slide.style.setProperty('--my', my.toFixed(3));
    let busy = false;
    for (const b of bodies) {
      if (b.mode === 'off') continue;
      if (b.delay > 0) { b.delay -= dt; b.el.style.opacity = 0; busy = true; continue; }
      if (b.mode === 'spring') {
        // a damped spring: overshoots a touch and settles; a slow current keeps it alive at rest
        const cx = b.isBottle || reduce ? 0 : Math.sin(clock * .45 + b.drift) * 6, cy = b.isBottle || reduce ? 0 : Math.cos(clock * .37 + b.drift) * 9;
        const cr = b.isBottle || reduce ? 0 : Math.sin(clock * .3 + b.drift) * 4;
        const ax = (-b.k * (b.x - b.tx - cx) - b.c * b.vx) / b.m, ay = (-b.k * (b.y - b.ty - cy) - b.c * b.vy) / b.m;
        const ar = (-b.k * .6 * (b.r - b.tr - cr) - b.c * .9 * b.vr) / b.m;
        b.vx += ax * dt; b.vy += ay * dt; b.vr += ar * dt;
        if (b.isBottle) { b.vry += (-150 * b.ry - 19 * b.vry) / b.m * dt; b.ry += b.vry * dt; if (Math.abs(b.ry) > .3) busy = true; }
        if (Math.abs(b.vy) + Math.abs(b.vx) > 4) busy = true;
      } else if (b.mode === 'turnout') {
        // a turntable spin away: it accelerates as it turns, fading as it goes edge-on
        b.vry += b.dir * 900 * dt; b.ry += b.vry * dt; busy = true;
        if (Math.abs(b.ry) > 92) { b.mode = 'off'; b.ry = 0; b.el.style.opacity = 0; continue; }
        b.el.style.opacity = Math.max(0, 1 - Math.abs(b.ry) / 92) ** .5;
        b.el.style.transform = `translate3d(0, ${b.y.toFixed(1)}px, 0) rotateY(${b.ry.toFixed(1)}deg)`;
        continue;
      } else if (b.mode === 'fall') {
        b.vy += 2600 * dt; busy = true;
        if (b.y > H + 300) { b.mode = 'off'; b.el.style.opacity = 0; continue; }
      }
      b.x += b.vx * dt; b.y += b.vy * dt; b.r += b.vr * dt;
      const par = b.isBottle ? 0 : b.layer === 'near' ? 34 : 12;
      b.el.style.opacity = 1;
      b.el.style.transform = b.isBottle
        ? `translate3d(0, ${b.y.toFixed(1)}px, 0) rotateY(${b.ry.toFixed(1)}deg) rotate(${b.r.toFixed(2)}deg)`
        : `translate3d(${(b.x + mx * par).toFixed(1)}px, ${(b.y + my * par * .6).toFixed(1)}px, 0) rotate(${b.r.toFixed(2)}deg) scaleX(${b.flip})`;
    }
    const alive = slide.classList.contains('is-active') && visible && !document.hidden;
    if ((alive && !reduce) || busy) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(slide);
  document.addEventListener('visibilitychange', kick);
  hero.addEventListener('slidechange', e => {
    if (e.detail.slide === slide) {
      const st = cur || 'honey'; cur = null;
      for (const b of bodies) { b.mode = 'off'; b.el.style.opacity = 0; }
      show(st, true); restartAuto();
    } else clearInterval(auto);
  });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); kick(); }, 150); });
  layout();
  show('honey', true);
})();
