/* Hero banners: the products bursting out of the pouch and the gold glitter for the Christmas banner
   (the honey banner's 3D honey lives in honey.js), and a gentle pointer parallax for both. Everything pauses
   while its slide is not on screen; reduced motion shows the finished composition. */
(function () {
  'use strict';
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---------------- Christmas: the ritual bursting out of the pouch, gold glitter ---------------- */
  const noel = hero.querySelector('.hero-noel');
  if (noel && getComputedStyle(noel).display !== 'none') {
    const stage = noel.querySelector('.nb-stage');
    // each product: bobbing, slowly turning, with a sheen; depth from how high it floats (higher = further back)
    noel.querySelectorAll('.nb-p').forEach(p => {
      const img = p.querySelector('img'), src = img.getAttribute('src');
      const bob = document.createElement('span'); bob.className = 'nb-bobber';
      const turn = document.createElement('span'); turn.className = 'nb-turn';
      const sheen = document.createElement('i'); sheen.className = 'nb-sheen'; sheen.style.setProperty('--src', `url("${new URL(src, location.href).href}")`);   // absolute: a url() in a custom property resolves against the stylesheet
      p.replaceChild(bob, img); bob.appendChild(turn); turn.append(img, sheen);
      const z = Math.max(0, Math.min(1, parseFloat(p.style.getPropertyValue('--y')) / 52));
      p.style.setProperty('--sc', (.86 + .24 * z).toFixed(3));
      p.style.setProperty('--blur', ((1 - z) * .45).toFixed(2) + 'px');
      p.style.setProperty('--lit', (.93 + .1 * z).toFixed(3));
      p.style.zIndex = 1 + Math.round(z * 3);
      p.style.setProperty('--bob', rnd(5.5, 8).toFixed(1) + 's'); p.style.setProperty('--turn', rnd(8, 12).toFixed(1) + 's');
      p.style.setProperty('--bd', (-rnd(0, 8)).toFixed(1) + 's');
    });
    const burst = () => {
      if (reduce) return;
      const pouch = stage.querySelector('.nb-pouch').getBoundingClientRect();
      const px = pouch.left + pouch.width / 2, py = pouch.top + pouch.height * .35;
      stage.querySelectorAll('.nb-p').forEach((p, i) => {
        const r = p.getBoundingClientRect(), dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
        const base = getComputedStyle(p).transform, b = base === 'none' ? '' : base;
        p.animate([
          { transform: `translate(${dx}px, ${dy}px) ${b} scale(.15)`, opacity: 0 },
          { opacity: 1, offset: .25 },
          { transform: b || 'none', opacity: 1 }
        ], { duration: 1900, delay: 400 + i * 120, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });   // unhurried: one after another
      });
      stage.querySelector('.nb-pouch').animate([{ transform: 'translateX(-50%) scale(1)' }, { transform: 'translateX(-50%) scale(1.06, .94)' }, { transform: 'translateX(-50%) scale(1)' }],
        { duration: 850, delay: 250, easing: 'cubic-bezier(.33,1,.68,1)' });
    };
    // gold glitter gathered at both edges, like a curtain of fairy lights out of focus
    const cv = noel.querySelector('.nb-glitter'), g = cv.getContext('2d');
    let W = 0, H = 0, dots = [], raf = 0;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2); W = noel.clientWidth || hero.clientWidth; H = noel.clientHeight || hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = Array.from({ length: Math.round(W / 6) }, () => {
        const edge = Math.random() < .5 ? rnd(0, .16) : rnd(.86, 1), near = Math.random() < .15;
        return { x: edge * W + rnd(-20, 20), y: rnd(0, H), r: near ? rnd(5, 11) : rnd(.8, 2.6), a: near ? rnd(.12, .3) : rnd(.35, .9), ph: rnd(0, 6.28), sp: rnd(.6, 2), vy: rnd(4, 14) };
      });
    };
    const draw = now => {
      const t = now / 1000;
      g.clearRect(0, 0, W, H);
      for (const d of dots) {
        const tw = reduce ? .8 : .55 + .45 * Math.sin(t * d.sp + d.ph);
        const y = reduce ? d.y : (d.y + t * d.vy) % (H + 20) - 10;
        const gr = g.createRadialGradient(d.x, y, 0, d.x, y, d.r * 2.2);
        gr.addColorStop(0, `rgba(255,236,190,${d.a * tw})`); gr.addColorStop(.4, `rgba(232,201,140,${d.a * tw * .55})`); gr.addColorStop(1, 'rgba(232,201,140,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(d.x, y, d.r * 2.2, 0, 6.283); g.fill();
      }
      raf = !reduce && noel.classList.contains('is-active') ? requestAnimationFrame(draw) : 0;
    };
    size(); addEventListener('resize', size);
    hero.addEventListener('slidechange', e => { if (e.detail.slide === noel) { if (!raf) raf = requestAnimationFrame(draw); burst(); } });
    requestAnimationFrame(draw);
  }

  /* ---------------- a gentle parallax under the pointer ---------------- */
  if (!reduce && matchMedia('(hover: hover)').matches) {
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const step = () => {
      x += (tx - x) * .08; y += (ty - y) * .08;
      const b = hero.querySelector('.hero-banner.is-active');
      if (b) { b.style.setProperty('--mx', x.toFixed(3)); b.style.setProperty('--my', y.toFixed(3)); }
      raf = Math.abs(tx - x) + Math.abs(ty - y) > .002 ? requestAnimationFrame(step) : 0;
    };
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width * 2 - 1; ty = (e.clientY - r.top) / r.height * 2 - 1;
      if (!raf) raf = requestAnimationFrame(step);
    });
    hero.addEventListener('pointerleave', () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(step); });
  }
})();
