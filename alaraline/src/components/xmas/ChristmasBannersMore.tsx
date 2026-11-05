import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import '../../styles/xmas-banners.css';
import '../../styles/xmas-banners-more.css';
import { LIVE, productUrl } from '../../data/site';

// Three Christmas banners using the wider ÀLara range: names and lines come from alaraline.co and the product catalogue.
const C = '/live/xmas/banners/cat/';
const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const pic = (file: string) => `${C}${file}.webp`;

/* ---------- The Turning Tree: three rings of products spin against each other; drag to turn them ---------- */
type Ringed = { file: string; slug: string; name: string; h: number };
const TIERS: { y: number; r: number; speed: number; items: Ringed[] }[] = [
  { y: 640, r: 292, speed: .2, items: [
    { file: 'miracle-mask', slug: 'miracle-mask', name: 'Miracle Mask', h: 118 },
    { file: 'shampoo', slug: 'shampoo', name: 'Intensive Repair Shampoo, Oh Honey', h: 178 },
    { file: 'curl-boosting-cream', slug: 'curl-boosting-cream', name: 'Curl Boosting Cream', h: 124 },
    { file: 'leave-in', slug: 'leave-in', name: 'Leave In Your Dreams', h: 176 },
    { file: 'detox-scalp-scrub', slug: 'detox-scalp-scrub', name: 'Detox Scalp Scrub', h: 128 },
    { file: 'conditioner', slug: 'conditioner', name: 'Hydrating Conditioner, Oh Honey', h: 178 },
    { file: 'anti-dandruff-shampoo', slug: 'anti-dandruff-shampoo', name: 'Anti-Dandruff Shampoo', h: 178 },
  ] },
  { y: 462, r: 200, speed: -.27, items: [
    { file: 'deep-repair-capsules', slug: 'deep-repair-capsules', name: 'Deep Repair Capsules', h: 124 },
    { file: 'curl-defining-shampoo', slug: 'curl-defining-shampoo', name: 'Curl Defining Shampoo', h: 152 },
    { file: 'hair-mist-tropical-vanilla', slug: 'hair-mist-tropical-vanilla', name: 'Hair Mist, Tropical Vanilla', h: 112 },
    { file: 'heat-protectant', slug: 'heat-protectant', name: 'Heat Protectant', h: 152 },
    { file: 'wax-stick-styling-hair-wax', slug: 'wax-stick-styling-hair-wax', name: 'Edge Control Wax Stick', h: 116 },
  ] },
  { y: 300, r: 104, speed: .36, items: [
    { file: 'miracle-pro-edition', slug: 'miracle-pro-edition', name: 'The Miracle Pro-Edition', h: 136 },
    { file: 'hair-mist-oh-honey', slug: 'hair-mist-oh-honey', name: 'Hair Mist, Oh Honey!', h: 98 },
    { file: 'hydrating-curl-conditioner', slug: 'hydrating-curl-conditioner', name: 'Hydrating Curl Conditioner', h: 128 },
  ] },
];
const SQUASH = .2;
const CX = 410;
const arc = (y: number, r: number, front: boolean) => `M${CX - r} ${y}A${r} ${r * SQUASH} 0 0 ${front ? 0 : 1} ${CX + r} ${y}`;

export function BannerTurningTree() {
  const stage = useRef<HTMLDivElement>(null);
  const [front, setFront] = useState(TIERS[0].items[0].name);
  const [hot, setHot] = useState<string | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    const st = stage.current!;
    const els = [...st.querySelectorAll<HTMLElement>('.tt-item')];
    const reduced = still();
    const angles = TIERS.map(() => 0);
    let drag = 0, dragV = 0, dragging = false, lastX = 0, startX = 0, raf = 0, last = performance.now(), slow = 1, shown = '';
    const hovering = { on: false };
    const place = () => {
      let k = 0, best = -2, bestName = '';
      TIERS.forEach((t, ti) => {
        const tn = t.items.length;
        t.items.forEach((it, i) => {
          const a = angles[ti] + drag * (ti % 2 ? -1 : 1) + i / tn * Math.PI * 2;
          const d = Math.cos(a), f = (d + 1) / 2;
          const x = CX + Math.sin(a) * t.r, y = t.y + d * t.r * SQUASH;
          const s = .7 + .3 * f;
          const el = els[k++];
          el.style.transform = `translate(calc(${x.toFixed(1)} * var(--u) - 50%), calc(${y.toFixed(1)} * var(--u) - 100%)) scale(${s.toFixed(3)})`;
          el.style.zIndex = String(100 + Math.round(d * 40) + ti * 90);
          el.style.filter = `brightness(${(.72 + .28 * f).toFixed(2)})`;
          if (ti === 0 && d > best) { best = d; bestName = it.name; }
        });
      });
      if (bestName !== shown) { shown = bestName; setFront(bestName); }
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, .05); last = now;
      slow += ((hovering.on || dragging ? 0 : 1) - slow) * Math.min(1, dt * 4);
      TIERS.forEach((t, i) => { angles[i] += t.speed * dt * slow; });
      if (!dragging) { drag += dragV * dt; dragV *= Math.pow(.05, dt); }
      place();
    };
    const down = (e: PointerEvent) => { dragging = true; moved.current = false; lastX = startX = e.clientX; dragV = 0; st.setPointerCapture(e.pointerId); st.classList.add('is-grabbing'); };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX;
      drag += dx * .007; dragV = dx * .4;
      if (Math.abs(e.clientX - startX) > 6) moved.current = true;
      if (reduced) place();
    };
    const up = () => { dragging = false; st.classList.remove('is-grabbing'); };
    const over = (e: PointerEvent) => { const on = !!(e.target as HTMLElement).closest('.tt-item'); hovering.on = on; };
    st.addEventListener('pointerdown', down); st.addEventListener('pointermove', move); st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up); st.addEventListener('pointerover', over);
    place();
    if (!reduced) raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); st.removeEventListener('pointerdown', down); st.removeEventListener('pointermove', move); st.removeEventListener('pointerup', up); st.removeEventListener('pointercancel', up); st.removeEventListener('pointerover', over); };
  }, []);

  // a drag that ends on a product must not open it
  const click = (e: ReactMouseEvent) => { if (moved.current) e.preventDefault(); };

  return (
    <section className="xb xb-tt" aria-labelledby="tt-t">
      <div className="xb-copy">
        <h1 id="tt-t">Trim the tree, <em>treat your hair</em></h1>
        <p>A Christmas tree made entirely of ÀLara. Drag it around, every branch is something from our shelf.</p>
        <a className="xb-btn" href={`${LIVE}/shop/`}>Shop the tree <span aria-hidden="true">→</span></a>
        <p className="tt-name" aria-live="off">{hot ?? front}</p>
      </div>
      <div className="tt-stage" ref={stage}>
        <span className="tt-floor" aria-hidden="true" />
        <svg className="tt-g tt-g-back" viewBox="0 0 820 760" aria-hidden="true">
          {TIERS.map(t => <g key={t.y}><path d={arc(t.y, t.r + 30, false)} className="tt-wire" /><path d={arc(t.y, t.r + 30, false)} className="tt-bulbs" /></g>)}
        </svg>
        {TIERS.map(t => t.items.map(it => (
          <a key={it.slug} className="tt-item" href={productUrl(it.slug)} draggable={false} onClick={click} onPointerEnter={() => setHot(it.name)} onPointerLeave={() => setHot(null)} aria-label={it.name} style={{ '--h': it.h } as CSSProperties}>
            <img src={pic(it.file)} alt="" draggable={false} />
          </a>
        )))}
        <svg className="tt-g tt-g-front" viewBox="0 0 820 760" aria-hidden="true">
          {TIERS.map(t => <g key={t.y}><path d={arc(t.y, t.r + 30, true)} className="tt-wire" /><path d={arc(t.y, t.r + 30, true)} className="tt-bulbs" /></g>)}
        </svg>
        <svg className="tt-star" viewBox="0 0 100 100" aria-hidden="true">
          <defs><linearGradient id="ttStar" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#fff0c4" /><stop offset=".45" stopColor="#e6c078" /><stop offset="1" stopColor="#a87a3f" /></linearGradient></defs>
          <path d="M50 3l13.6 30.4 33 3.5-24.700 22.200 7 32.500L50 75 21.100 91.600l7-32.500L3.400 36.900l33-3.500Z" fill="url(#ttStar)" />
        </svg>
      </div>
    </section>
  );
}

/* ---------- Light Up the Hive: a dark comb; a warm light moves over it and each cell it reaches shows its product ---------- */
const WALL: { file: string; slug: string; name: string }[] = [
  { file: 'miracle-pro-edition', slug: 'miracle-pro-edition', name: 'The Miracle Pro-Edition' },
  { file: 'curl-boosting-cream', slug: 'curl-boosting-cream', name: 'Curl Boosting Cream' },
  { file: 'shampoo', slug: 'shampoo', name: 'Intensive Repair Shampoo, Oh Honey' },
  { file: 'deep-repair-capsules', slug: 'deep-repair-capsules', name: 'Deep Repair Capsules' },
  { file: 'hair-mist-oh-honey', slug: 'hair-mist-oh-honey', name: 'Hair Mist, Oh Honey!' },
  { file: 'miracle-mask', slug: 'miracle-mask', name: 'Miracle Mask' },
  { file: 'leave-in', slug: 'leave-in', name: 'Leave In Your Dreams' },
  { file: 'curl-defining-shampoo', slug: 'curl-defining-shampoo', name: 'Curl Defining Shampoo' },
  { file: 'detox-scalp-scrub', slug: 'detox-scalp-scrub', name: 'Detox Scalp Scrub' },
  { file: 'heat-protectant', slug: 'heat-protectant', name: 'Heat Protectant' },
  { file: 'scalp-massager', slug: 'scalp-massager', name: 'Scalp Massager' },
  { file: 'conditioner', slug: 'conditioner', name: 'Hydrating Conditioner, Oh Honey' },
  { file: 'hair-mist-tropical-vanilla', slug: 'hair-mist-tropical-vanilla', name: 'Hair Mist, Tropical Vanilla' },
  { file: 'anti-dandruff-shampoo', slug: 'anti-dandruff-shampoo', name: 'Anti-Dandruff Shampoo' },
  { file: 'wax-stick-styling-hair-wax', slug: 'wax-stick-styling-hair-wax', name: 'Edge Control Wax Stick' },
  { file: 'hydrating-curl-conditioner', slug: 'hydrating-curl-conditioner', name: 'Hydrating Curl Conditioner' },
  { file: 'curly-hair-brush', slug: 'curly-hair-brush', name: 'Curly Hair Brush' },
];
const LW = 204, LH = 236;
const CELLS = Array.from({ length: 5 }, (_, r) => Array.from({ length: 6 }, (_, c) => ({
  x: 470 + c * LW + (r % 2 ? LW / 2 : 0), y: -66 + r * LH * .75,
}))).flat().map((p, i) => ({ ...p, item: WALL[(i * 7) % WALL.length] }));
const hexPoints = (x: number, y: number) => [[.5, 0], [1, .25], [1, .75], [.5, 1], [0, .75], [0, .25]].map(([a, b]) => `${x + a * LW},${y + b * LH}`).join(' ');

function Comb({ lit }: { lit?: boolean }) {
  return (
    <div className="lh-board">
      <svg viewBox="0 0 1440 760" aria-hidden="true">
        {CELLS.map(c => <polygon key={`${c.x}-${c.y}`} points={hexPoints(c.x, c.y)} />)}
      </svg>
      {CELLS.map(c => (
        <img key={`${c.x}-${c.y}`} className={lit ? undefined : 'is-dim'} src={pic(c.item.file)} alt="" draggable={false}
          style={{ '--cx': c.x + LW / 2, '--cy': c.y + LH / 2 } as CSSProperties} />
      ))}
    </div>
  );
}

export function BannerLightHive() {
  const sec = useRef<HTMLElement>(null);
  const [found, setFound] = useState(CELLS[8].item);
  useEffect(() => {
    const el = sec.current!;
    const board = el.querySelector<HTMLElement>('.lh-board')!;
    let tx: number | null = null, ty = 0, x = 0, y = 0, raf = 0, shown = '';
    const reduced = still();
    const step = (now: number) => {
      const r = el.getBoundingClientRect(), b = board.getBoundingClientRect();
      const u = b.width / 1440, ox = b.left - r.left, oy = b.top - r.top;
      // left alone, the light wanders over the comb by itself
      const narrow = r.width <= 760;   // on a phone only part of the comb is on screen
      const wx = ox + ((narrow ? 780 : 1030) + Math.sin(now / 2900) * (narrow ? 210 : 300)) * u, wy = oy + (370 + Math.sin(now / 1900 + 1) * 210) * u;
      const gx = tx ?? wx, gy = tx === null ? wy : ty;
      x += (gx - x) * .07; y += (gy - y) * .07;
      el.style.setProperty('--mx', `${x.toFixed(1)}px`); el.style.setProperty('--my', `${y.toFixed(1)}px`);
      let best = CELLS[0], bd = 1e12;
      for (const c of CELLS) { const d = ((c.x + LW / 2) * u + ox - x) ** 2 + ((c.y + LH / 2) * u + oy - y) ** 2; if (d < bd) { bd = d; best = c; } }
      if (best.item.slug !== shown) { shown = best.item.slug; setFound(best.item); }
    };
    const frame = (now: number) => { raf = requestAnimationFrame(frame); step(now); };
    const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; };
    const leave = () => { tx = null; };
    el.addEventListener('pointermove', move); el.addEventListener('pointerdown', move); el.addEventListener('pointerleave', leave);
    if (reduced) { x = 900; y = 380; for (let i = 0; i < 80; i++) step(0); } else { const r = el.getBoundingClientRect(); x = r.width * .7; y = r.height * .5; raf = requestAnimationFrame(frame); }
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointermove', move); el.removeEventListener('pointerdown', move); el.removeEventListener('pointerleave', leave); };
  }, []);
  return (
    <section className="xb xb-lh" ref={sec} aria-labelledby="lh-t">
      <div className="lh-wall"><Comb /></div>
      <div className="lh-wall lh-lit"><Comb lit /></div>
      <span className="lh-glow" aria-hidden="true" />
      <div className="xb-copy">
        <h1 id="lh-t">Light up <em>the hive</em></h1>
        <p>This Christmas, every cell is hiding something. Move your light across the comb to find it.</p>
        <p className="lh-found" aria-live="off"><span>You found</span> <b>{found.name}</b></p>
        <a className="xb-btn" href={productUrl(found.slug)}>See it <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}

/* ---------- The 12 Days of ÀLara: the old song, one hero product a day, the whole field changing colour to suit it ---------- */
const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
const DAYS: { file: string; slug: string; name: string; line: string; f: string; i: string; h: number }[] = [
  { file: 'miracle-pro-edition', slug: 'miracle-pro-edition', name: 'The Miracle Pro-Edition', line: 'Scalp treatment for hair growth', f: '#fbeef1', i: '#b0145f', h: 580 },
  { file: 'shampoo', slug: 'shampoo', name: 'Intensive Repair Shampoo', line: 'Sulfate and silicone free, scented with honey', f: '#f6d79a', i: '#5b2d0e', h: 590 },
  { file: 'miracle-mask', slug: 'miracle-mask', name: 'Miracle Mask', line: 'Intense deep hydration', f: '#a81d5c', i: '#fff3f7', h: 330 },
  { file: 'curl-boosting-cream', slug: 'curl-boosting-cream', name: 'Curl Boosting Cream', line: 'Definition and bounce, from the Curls On Collection', f: '#cdbcf0', i: '#35246f', h: 370 },
  { file: 'leave-in', slug: 'leave-in', name: 'Leave In Your Dreams', line: 'A lightweight leave-in cream', f: '#f8bed6', i: '#7f1349', h: 590 },
  { file: 'heat-protectant', slug: 'heat-protectant', name: 'Heat Protectant', line: 'Up to 450°F, with a UV shield', f: '#2c1f1a', i: '#f8bed6', h: 580 },
  { file: 'deep-repair-capsules', slug: 'deep-repair-capsules', name: 'Deep Repair Capsules', line: 'A keratin-effect gloss', f: '#fde3ee', i: '#a81d5c', h: 470 },
  { file: 'anti-dandruff-shampoo', slug: 'anti-dandruff-shampoo', name: 'Anti-Dandruff Shampoo', line: 'With piroctone olamine, niacinamide and caffeine', f: '#6b3f26', i: '#fbeec2', h: 590 },
  { file: 'detox-scalp-scrub', slug: 'detox-scalp-scrub', name: 'Detox Scalp Scrub', line: 'An exfoliating scalp detox', f: '#4c2a1e', i: '#fbdfe9', h: 440 },
  { file: 'curl-defining-shampoo', slug: 'curl-defining-shampoo', name: 'Curl Defining Shampoo', line: 'From the Curls On Collection, with wild berries', f: '#efe7ff', i: '#5a3fb0', h: 590 },
  { file: 'hair-mist-oh-honey', slug: 'hair-mist-oh-honey', name: 'Hair Mist, Oh Honey!', line: 'Alcohol-free, with vitamin E', f: '#f3c98a', i: '#5b2d0e', h: 430 },
  { file: 'wax-stick-styling-hair-wax', slug: 'wax-stick-styling-hair-wax', name: 'Edge Control Wax Stick', line: 'Honey and coconut hold', f: '#c2185f', i: '#fff3f7', h: 440 },
];

export function BannerTwelveDays() {
  const [day, setDay] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (held || still()) return;
    const t = setTimeout(() => setDay(d => (d + 1) % DAYS.length), 3200);
    return () => clearTimeout(t);
  }, [day, held]);
  const d = DAYS[day];
  return (
    <section className="xb xb-td" style={{ '--f': d.f, '--i': d.i } as CSSProperties} aria-labelledby="td-t" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
      <h1 id="td-t" className="td-title">The 12 Days of ÀLara</h1>
      <span className="td-num" key={`n${day}`} aria-hidden="true">{day + 1}</span>
      <img className="td-p" key={`p${day}`} src={pic(d.file)} alt={d.name} style={{ '--h': d.h } as CSSProperties} draggable={false} />
      <div className="xb-copy td-copy" key={`c${day}`} aria-live="off">
        <p className="td-song">On the {ORD[day]} day of Christmas, ÀLara gave to me</p>
        <h2>{d.name}</h2>
        <p className="td-line">{d.line}</p>
        <a className="xb-btn" href={productUrl(d.slug)}>See it <span aria-hidden="true">→</span></a>
      </div>
      <div className="td-days" role="group" aria-label="Choose a day">
        {DAYS.map((x, n) => <button key={x.slug} type="button" aria-pressed={n === day} aria-label={`Day ${n + 1}: ${x.name}`} onClick={() => setDay(n)}>{n + 1}</button>)}
      </div>
    </section>
  );
}
