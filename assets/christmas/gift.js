/* ÀLara Christmas gift box: the hero's signature moment.
   A CSS-3D model of the real ÀLara box, built from rectified photographs of it (assets/christmas/box):
   the base front with the gold-foil bee, the honeycomb ledge, the tray's front wall, the bee-wing lid
   lining, and the products themselves, unprojected from the photo onto the tray's opening so they sit
   inside the box (the lid covers them; nothing fades in). Faces no photograph shows (sides, back, the
   closed lid's outer face) are plain pink board; the closed lid carries the box's own foil bee, a
   silver satin ribbon and a pearl seal.
   Sequence, as one continuous camera move: the seal lifts and the ribbon is untied and slides off
   both sides; the lid pops off its magnet, is lifted open by hand and settles on its hinge; light
   falls into the tray as it opens. After that the box follows the pointer a little. No libraries;
   one rAF loop that only runs while the gift slide is on screen. Reduced motion shows the open box. */
(function () {
  'use strict';
  const THEMES = {
    christmas: { lights: ['255,214,150', '255,170,200'], warm: .78 }
  };
  const xmas = document.documentElement.dataset.season === 'christmas';
  document.querySelectorAll('[data-gift]').forEach(root => {
    const theme = root.dataset.giftTheme || 'christmas';
    if (THEMES[theme] && (theme !== 'christmas' || xmas)) build(root, THEMES[theme]);
  });

function build(root, TH) {
  const slide = root.closest('.hero-slide');
  const hero = root.closest('.hero');
  const replayBtn = slide.querySelector('[data-gift-replay]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the box, measured from the photographs (px at a 440px-wide box) ----------
     Hexagons on the honeycomb ledge appear 0.566× as tall as they are wide, so the straight-on photo
     was taken from about 34.5° above; every height and depth below is that photo's measurement
     corrected for this angle. */
  const W = 440;            // width
  const HB = 96;            // base front
  const HT = 63;            // tray front wall
  const L = 58;             // ledge of the base in front of the tray (honeycomb)
  const DT = 362;           // tray depth
  const D = DT + L;         // base depth
  const T = 12;             // lid board
  const PITCH = 34.5;

  const el = (cls, parent, style) => {
    const d = document.createElement('div');
    d.className = cls;
    if (style) Object.assign(d.style, style);
    parent.appendChild(d);
    return d;
  };
  // a face of size w×h, centred on (x, y, z), then turned
  const face = (parent, cls, w, h, x, y, z, turn = '') => el('gb-face ' + cls, parent, {
    width: w + 'px', height: h + 'px', marginLeft: -w / 2 + 'px', marginTop: -h / 2 + 'px',
    transform: `translate3d(${x}px, ${y}px, ${z}px) ${turn}`
  });

  root.innerHTML = '';
  // gold fairy lights far behind, out of focus: two layers that twinkle out of step
  for (const cls of ['a', 'b']) {
    const g = el('gift-bokeh ' + cls, root), spots = [];
    for (let i = 0; i < 26; i++) {
      const x = (Math.random() * 100).toFixed(1), y = (Math.random() * 92).toFixed(1), r = (6 + Math.random() * 26).toFixed(0);
      const warm = Math.random() < TH.warm ? TH.lights[0] : TH.lights[1], a = (.12 + Math.random() * .3).toFixed(2);
      spots.push(`radial-gradient(${r}px ${r}px at ${x}% ${y}%, rgba(${warm},${a}), rgba(${warm},${(a * .55).toFixed(2)}) 55%, rgba(${warm},0) 100%)`);
    }
    g.style.background = spots.join(',');
  }
  const stage = el('gift-stage', root);
  const fit = el('gift-fit', stage);
  const cam = el('gift-cam', fit);

  // floor: soft contact shadow and a pool of light
  el('gift-floor', cam, { transform: 'translate3d(0, 0, 0) rotateX(90deg)' });
  el('gift-shadow', cam, { transform: `translate3d(0, -1px, ${-L / 2}px) rotateX(90deg)` });

  // base box
  const zf = D / 2, zb = -D / 2;
  face(cam, 'gb-base-front', W, HB, 0, -HB / 2, zf);
  face(cam, 'gb-side gb-r', D, HB, W / 2, -HB / 2, 0, 'rotateY(90deg)');
  face(cam, 'gb-side gb-l', D, HB, -W / 2, -HB / 2, 0, 'rotateY(-90deg)');
  face(cam, 'gb-back', W, HB, 0, -HB / 2, zb, 'rotateY(180deg)');
  face(cam, 'gb-ledge', W, L, 0, -HB, zf - L / 2, 'rotateX(90deg)');

  // tray (sits on the base, flush at the back)
  const tz = zf - L, tzc = (zb + tz) / 2, ty = -HB - HT / 2;
  face(cam, 'gb-tray-front', W, HT, 0, ty, tz);
  face(cam, 'gb-side gb-r gb-tray', DT, HT, W / 2, ty, tzc, 'rotateY(90deg)');
  face(cam, 'gb-side gb-l gb-tray', DT, HT, -W / 2, ty, tzc, 'rotateY(-90deg)');
  face(cam, 'gb-back', W, HT, 0, ty, zb, 'rotateY(180deg)');
  // the products as they sit in the tray: the photo unprojected onto the tray's opening, just below
  // the rim, so the closing lid covers them and the opening lid reveals them
  const opening = face(cam, 'gb-opening', W, DT, 0, -HB - HT + 1.5, tzc, 'rotateX(90deg)');

  // soft light above the open box
  const glow = el('gb-glow', cam);

  // lid on its hinge (the tray's back top edge)
  const lid = el('gb-lid', cam);
  face(lid, 'gb-lid-top', W, DT, 0, -T, DT / 2, 'rotateX(90deg)');
  const lidIn = face(lid, 'gb-lid-in', W, DT, 0, 0, DT / 2, 'rotateX(-90deg)');
  face(lid, 'gb-lid-edge', W, T, 0, -T / 2, DT);
  face(lid, 'gb-lid-side gb-r', DT, T, W / 2, -T / 2, DT / 2, 'rotateY(90deg)');
  face(lid, 'gb-lid-side gb-l', DT, T, -W / 2, -T / 2, DT / 2, 'rotateY(-90deg)');
  face(lid, 'gb-lid-back', W, T, 0, -T / 2, 0, 'rotateY(180deg)');
  // silver satin ribbon across the lid and down its side edges, in two halves joined under a pearl seal
  const ZR = DT * 0.58;
  const halves = [-1, 1].map(side => {
    const g = el('gb-ribbon', lid);                                     // pivots on the lid's side edge
    face(g, 'gb-rib gb-rib-top', W / 2 + 1, 30, -side * (W / 4), -0.6, 0, 'rotateX(90deg)');
    face(g, 'gb-rib gb-rib-side', 30, T + 1, side * 0.6, T / 2, 0, `rotateY(${side * 90}deg)`);
    return { g, side, faces: g.querySelectorAll('.gb-face') };
  });
  const sealG = el('gb-ribbon', lid);
  const seal = face(sealG, 'gb-rib gb-seal', 58, 58, 0, 0, 0, 'rotateX(90deg)');
  el('gb-seal-bee', seal);

  /* ---------- light: shade each side by how it faces a soft key light (upper left, front) ---------- */
  const shades = cam.querySelectorAll('.gb-side, .gb-lid-side');
  function shade(yaw) {
    const a = yaw * Math.PI / 180;
    const right = .2 + .2 * Math.sin(Math.max(0, -a) + .1);   // turned left, the right side catches less
    const left = .32 - .25 * Math.sin(Math.max(0, a + .5));
    for (const s of shades) s.style.setProperty('--shade', s.classList.contains('gb-r') ? right.toFixed(3) : left.toFixed(3));
  }

  /* ---------- timeline ---------- */
  const ease = {
    out: t => 1 - Math.pow(1 - t, 3),
    expo: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
    inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    in: t => t * t,
    lin: t => t
  };
  // [start ms, end ms, from, to, easing]
  const TRACKS = {
    yaw:    [[0, 7600, -34, -9, 'inOut']],          // one continuous dolly and turn
    pitch:  [[0, 7600, 22, PITCH, 'inOut']],
    scale:  [[0, 7600, .86, 1, 'inOut']],
    fade:   [[0, 700, 0, 1, 'out']],
    untie:  [[2700, 3200, 0, 1, 'inOut']],          // the seal lifts away
    slide:  [[3000, 4100, 0, 1, 'in']],             // the ribbon halves are drawn off both sides
    lid:    [[3500, 3800, 0, 4.5, 'inOut'],         // the magnet lets go
             [3800, 4050, 4.5, 4.5, 'lin'],
             [4050, 6100, 4.5, 104, 'inOut'],       // lifted open by hand
             [6100, 6800, 104, 100, 'inOut']],      // and it settles back on the hinge
    glow:   [[4600, 5800, 0, .55, 'out'], [5800, 7600, .55, .2, 'inOut']],
    dust:   [[0, 3400, .15, .85, 'lin']]
  };
  const END = 7600, OPEN_AT = 2700;
  const FINAL = { yaw: -9, pitch: PITCH, scale: 1, fade: 1, untie: 1, slide: 1, lid: 100, glow: .2, dust: .85 };
  function sample(name, t) {
    const tr = TRACKS[name];
    let v = tr[0][2];
    for (const [a, b, from, to, e] of tr) {
      if (t >= b) v = to;
      else if (t > a) { v = from + (to - from) * ease[e]((t - a) / (b - a)); break; }
      else break;
    }
    return v;
  }

  let t0 = 0, raf = 0, active = slide.classList.contains('is-active'), visible = true, done = false;
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  let fitScale = 1;

  const clamp01 = v => Math.max(0, Math.min(1, v));
  function apply(s) {
    const yaw = s.yaw + tilt.x, pitch = s.pitch + tilt.y;
    cam.style.transform = `scale(${s.scale}) rotateX(${-pitch}deg) rotateY(${yaw}deg)`;
    stage.style.opacity = s.fade;
    lid.style.transform = `translate3d(0, ${-HB - HT}px, ${zb}px) rotateX(${s.lid}deg)`;
    // the seal lifts off the ribbon
    sealG.style.transform = `translate3d(0, ${-T - 1.4 - s.untie * 14}px, ${ZR}px) scale(${1 - s.untie * .25})`;
    seal.style.opacity = 1 - s.untie;
    // each half is drawn outwards off its edge, droops over it and falls
    for (const h of halves) {
      const k = s.slide;
      // drawn off by its outer end: the loose inner end trails and hangs down
      h.g.style.transform = `translate3d(${h.side * (W / 2 + k * (W * .55))}px, ${-T + k * k * 26}px, ${ZR}px) rotateZ(${-h.side * Math.pow(k, 1.3) * 62}deg)`;
      const a = 1 - clamp01((k - .55) / .45);
      for (const f of h.faces) f.style.opacity = a;
    }
    // light reaches into the tray as the lid lifts; the lining is lit once it faces the room
    opening.style.setProperty('--dark', (.66 * Math.pow(1 - clamp01(s.lid / 85), 1.4)).toFixed(3));
    lidIn.style.setProperty('--dark', (.45 * clamp01((96 - s.lid) / 60)).toFixed(3));
    glow.style.transform = `translate3d(0, ${-HB - HT - 10}px, ${tzc}px) rotateY(${-yaw}deg) rotateX(${pitch}deg)`;
    glow.style.opacity = s.glow;
    root.style.setProperty('--dust', s.dust.toFixed(3));
    shade(yaw);
  }
  function state(t) {
    const s = {};
    for (const k in TRACKS) s[k] = sample(k, t);
    return s;
  }

  function frame(now) {
    raf = 0;
    if (!t0) t0 = now;
    const t = now - t0;
    tilt.x += (tilt.tx - tilt.x) * .06; tilt.y += (tilt.ty - tilt.y) * .06;
    const s = t >= END ? FINAL : state(t);
    apply(s);
    if (t >= OPEN_AT && !root.classList.contains('is-opening')) { root.classList.add('is-opening'); sparkle(); }
    if (t >= END && !done) { done = true; root.classList.add('is-open'); if (replayBtn) replayBtn.firstChild.textContent = 'Unwrap it again '; }
    const settling = Math.abs(tilt.tx - tilt.x) + Math.abs(tilt.ty - tilt.y) > .01;
    if (active && visible && (t < END || settling)) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && active && visible && !reduce) raf = requestAnimationFrame(frame); }
  function play(from = 0) {
    done = false; root.classList.remove('is-open', 'is-opening');
    if (replayBtn) replayBtn.firstChild.textContent = 'Unwrap it now ';
    t0 = performance.now() - from;
    kick();
  }
  function finish() {
    done = true; root.classList.add('is-open', 'is-opening');
    t0 = performance.now() - END - 1;
    apply(FINAL);
    if (replayBtn) replayBtn.firstChild.textContent = 'Unwrap it again ';
  }

  /* ---------- silver shimmer rising from the open box ---------- */
  function sparkle() {
    if (reduce) return;
    const r = opening.getBoundingClientRect(), hr = root.getBoundingClientRect();
    if (!r.width) return;
    for (let i = 0; i < 9; i++) {
      const s = document.createElement('i');
      s.className = 'gb-spark';
      const x = r.left - hr.left + r.width * (.15 + Math.random() * .7);
      const y = r.top - hr.top + r.height * (.3 + Math.random() * .5);
      s.style.left = x + 'px'; s.style.top = y + 'px';
      const size = 6 + Math.random() * 9;
      s.style.width = s.style.height = size + 'px';
      root.appendChild(s);
      const rise = 60 + Math.random() * 120, drift = (Math.random() - .5) * 60;
      s.animate([
        { transform: 'translate(-50%, -50%) scale(.2) rotate(0deg)', opacity: 0 },
        { transform: `translate(calc(-50% + ${drift * .4}px), calc(-50% - ${rise * .4}px)) scale(1) rotate(25deg)`, opacity: 1, offset: .3 },
        { transform: `translate(calc(-50% + ${drift}px), calc(-50% - ${rise}px)) scale(.4) rotate(70deg)`, opacity: 0 }
      ], { duration: 1600 + Math.random() * 1400, delay: 2200 + Math.random() * 1600, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' })
        .onfinish = () => s.remove();
    }
  }

  /* ---------- fit the box to the space beside the copy ---------- */
  /* the box's projected outline over the whole sequence, at scale 1, relative to its floor point */
  let extent = null;
  function measure() {
    const saved = cam.style.transform;
    fit.style.setProperty('--fit', 1);
    const o = fit.getBoundingClientRect();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const t of [0, 1800, 3600, END + 1]) {
      apply(t > END ? FINAL : state(t));
      for (const f of cam.querySelectorAll('.gb-face:not(.gb-rib)')) {
        const r = f.getBoundingClientRect();
        if (!r.width) continue;
        x0 = Math.min(x0, r.left - o.left); x1 = Math.max(x1, r.right - o.left);
        y0 = Math.min(y0, r.top - o.top); y1 = Math.max(y1, r.bottom - o.top);
      }
    }
    cam.style.transform = saved;
    return { x0, y0, x1, y1 };
  }

  /* ---------- fit the box between the copy and the slide controls ---------- */
  function layout() {
    const r = root.getBoundingClientRect();
    if (!r.width) return;
    const phone = r.width <= 900;   // the copy stacks on top up to 900px (style.css), so the box goes below it
    if (!extent) extent = measure();
    const copy = [...slide.querySelectorAll('.hero-copy')].find(c => c.offsetParent);
    const inner = copy && [...copy.children].reduce((a, c) => {
      const b = c.getBoundingClientRect(); return { right: Math.max(a.right, b.right), bottom: Math.max(a.bottom, b.bottom) };
    }, { right: 0, bottom: 0 });
    const ui = hero.querySelector('.hero-ui')?.getBoundingClientRect();
    const box = phone
      ? { left: 10, right: r.width - 10, top: (inner ? inner.bottom - r.top : r.height * .5) + 18, bottom: (ui ? ui.top - r.top : r.height) - 6 }
      : { left: Math.max((inner ? inner.right - r.left : 0) + 48, r.width * .42), right: r.width - 48, top: r.height * .17, bottom: r.height - 34 };
    const ew = extent.x1 - extent.x0, eh = extent.y1 - extent.y0;
    fitScale = Math.max(.3, Math.min(phone ? .9 : 1.08, (box.right - box.left) / ew, (box.bottom - box.top) / eh));
    // centre it horizontally in its space, rest it on the bottom of that space
    const ox = box.left + ((box.right - box.left) - ew * fitScale) / 2 - extent.x0 * fitScale;
    const oy = box.bottom - extent.y1 * fitScale;
    fit.style.left = ox + 'px'; fit.style.top = oy + 'px';
    placeTrinkets(ox, oy, ew * fitScale);
    fit.style.setProperty('--fit', fitScale.toFixed(3));
    if (reduce || done) apply(FINAL);
  }

  /* ---------- glass baubles resting on the table beside the box ---------- */
  let trinkets = null;
  function placeTrinkets(ox, oy, boxW) {
    const X = window.AlaraXmas;
    if (!X || !X.ornament) return;
    if (!trinkets) {
      trinkets = [[-.66, 34, 'gold', -70], [-.53, 21, 'blush', 24], [.64, 30, 'rose', 64], [.76, 19, 'champagne', -30], [-.79, 15, 'pearl', 80]].map(([dx, r, fin, rot]) => {
        const spr = X.ornament(r, 'sphere', fin);
        const w = document.createElement('div'); w.className = 'gift-trinket'; w.appendChild(spr.c);
        w.style.setProperty('--refl', `url(${spr.c.toDataURL()})`);
        stage.appendChild(w);
        return { w, dx, r, rot, sw: spr.w, sh: spr.h };
      });
    }
    const phone = root.clientWidth <= 900, k = Math.max(.6, Math.min(1.1, fitScale * 1.05)) * (phone ? .8 : 1);
    for (const t of trinkets) {
      const w = t.sw * k, h = t.sh * k;
      t.w.style.width = w + 'px';
      // the sphere's centre sits on the table, so it is placed by its lower part
      t.w.style.left = (ox + t.dx * boxW - w / 2) + 'px';
      t.w.style.top = (oy - h + t.r * k * .55) + 'px';
      t.w.style.transform = `rotate(${t.rot}deg)`;
      t.w.style.transformOrigin = '50% 78%';
    }
  }

  /* ---------- interaction ---------- */
  if (replayBtn) replayBtn.addEventListener('click', () => {
    if (reduce) return;
    const t = performance.now() - t0;
    if (!done && t < OPEN_AT) play(OPEN_AT - 200);   // skip straight to the unwrapping
    else play(0);
  });
  root.addEventListener('click', () => { if (!reduce && !done && performance.now() - t0 < OPEN_AT) play(OPEN_AT - 200); });
  if (!reduce && matchMedia('(hover: hover)').matches) {
    hero.addEventListener('pointermove', e => {
      if (!done || !active) return;
      const r = root.getBoundingClientRect();
      tilt.tx = ((e.clientX - r.left) / r.width - .5) * 9;
      tilt.ty = ((e.clientY - r.top) / r.height - .5) * -4;
      kick();
    });
    hero.addEventListener('pointerleave', () => { tilt.tx = tilt.ty = 0; kick(); });
  }
  hero.addEventListener('slidechange', e => {
    const was = active;
    active = e.detail.slide === slide;
    if (active && !was) { if (reduce) finish(); else play(0); }
    if (!active && raf) { cancelAnimationFrame(raf); raf = 0; }
  });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); else if (raf) { cancelAnimationFrame(raf); raf = 0; } }, { threshold: .05 }).observe(root);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); });

  root.classList.add('is-built');
  layout();
  if (reduce) finish();
  else if (active) { apply(state(0)); play(0); }
  else apply(state(0));
}
})();
