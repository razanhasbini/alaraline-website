import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import '../../styles/xmas-banners.css';
import { LIVE } from '../../data/site';

// Christmas hero banners in pink and white, or brown and pink, built from the real studio photos of the products.
// Each one has its own idea and one live thing: the bauble sways, the issue stacks, the type follows the pointer,
// the hive's tree opens its doors, the box bursts, the gift draws itself, the letter writes itself, the polaroids move. The satin and glass are rendered by tools/render_banner_art.py.

const A = '/live/xmas/banners/';
const SHOP = `${LIVE}/shop/`;

const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const PRODUCTS = [
  { id: 'shampoo', name: 'Hydra Gloss Repair Shampoo', w: 423, h: 981 },
  { id: 'conditioner', name: 'Intense Hydration Conditioner', w: 424, h: 981 },
  { id: 'tube', name: 'Leave-in Hair Cream', w: 292, h: 733 },
  { id: 'miracle', name: 'The Miracle Pro-Edition', w: 440, h: 921 },
  { id: 'jar', name: 'Buttered Up Mask', w: 730, h: 629 },
] as const;
type Id = (typeof PRODUCTS)[number]['id'];
const P = (id: Id) => PRODUCTS.find(p => p.id === id)!;

function Photo({ id, className, style, decorative }: { id: Id; className?: string; style?: CSSProperties; decorative?: boolean }) {
  const p = P(id);
  return <img className={className} style={style} src={`${A}${id}.webp`} alt={decorative ? '' : p.name} width={p.w} height={p.h} draggable={false} />;
}

function Cta({ label = 'Discover the box' }: { label?: string }) {
  return <a className="xb-btn" href={SHOP}>{label} <span aria-hidden="true">→</span></a>;
}

/* Things hanging from a point: a spring, stirred by the pointer's movement and, faintly, by the air. */
function useSway(section: RefObject<HTMLElement | null>, energy?: RefObject<number>) {
  const items = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    if (still()) return;
    const sec = section.current!;
    const state = items.current.map((_, i) => ({ a: 0, v: 0, k: 9 + i * 1.3 }));
    let wind = 0, lastX: number | null = null, raf = 0, last = performance.now();
    const move = (e: PointerEvent) => {
      if (lastX !== null) wind += (e.clientX - lastX) * .55;
      lastX = e.clientX;
    };
    const leave = () => { lastX = null; };
    sec.addEventListener('pointermove', move);
    sec.addEventListener('pointerleave', leave);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, .04); last = now;
      wind *= Math.pow(.02, dt);
      let e = 0;
      state.forEach((s, i) => {
        const air = Math.sin(now / 1500 + i * 1.9) * 1.5;
        s.v += (-s.k * s.a - 1.1 * s.v + wind * (.8 + (i % 3) * .2) + air) * dt;
        s.a += s.v * dt;
        s.a = Math.max(-11, Math.min(11, s.a));
        const el = items.current[i];
        if (el) el.style.rotate = `${s.a.toFixed(3)}deg`;
        e = Math.max(e, Math.abs(s.v));
      });
      if (energy) energy.current = e;
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); sec.removeEventListener('pointermove', move); sec.removeEventListener('pointerleave', leave); };
  }, [section, energy]);
  return (i: number) => (el: HTMLElement | null) => { items.current[i] = el; };
}

/* Glitter inside the glass: it settles when the bauble is still and swirls when it swings. */
function GlobeGlitter({ energy }: { energy: RefObject<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!, x = cv.getContext('2d')!;
    const S = 520; cv.width = cv.height = S;
    const pts = Array.from({ length: 130 }, () => {
      const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * .9;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: .6 + Math.random() * 1.9, p: Math.random() * 6.28, gold: Math.random() < .4 };
    });
    const draw = (now: number) => {
      x.clearRect(0, 0, S, S);
      const e = energy.current;
      for (const p of pts) {
        p.y += (.0006 + Math.min(e, 25) * .00016) * (still() ? 0 : 1);
        p.x += Math.sin(now / 900 + p.p) * .0004 + Math.sin(p.y * 6 + p.p) * Math.min(e, 25) * .00022;
        if (p.x * p.x + p.y * p.y > .85) { const a = Math.random() * 6.28, r = Math.random() * .5; p.x = Math.cos(a) * r; p.y = -.75 + Math.sin(a) * r * .3; }
        const twinkle = .45 + .55 * Math.abs(Math.sin(now / 500 + p.p));
        x.fillStyle = p.gold ? `rgba(226,186,120,${twinkle})` : `rgba(255,255,255,${twinkle})`;
        x.beginPath(); x.arc(S / 2 + p.x * S / 2, S / 2 + p.y * S / 2, p.s, 0, 6.3); x.fill();
      }
    };
    if (still()) { draw(0); return; }
    let raf = 0;
    const frame = (now: number) => { raf = requestAnimationFrame(frame); draw(now); };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [energy]);
  return <canvas ref={ref} className="bb-glitter" aria-hidden="true" />;
}

// the gold cap of the ornament: a collar with a scalloped, pierced edge and a wire ring
function BaubleCap() {
  const teeth = Array.from({ length: 9 }, (_, i) => 8 + i * 13.5);
  return (
    <svg className="bb-cap" viewBox="0 0 136 92" aria-hidden="true">
      <defs>
        <linearGradient id="bbGold" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#8f6431" /><stop offset=".16" stopColor="#d9b172" /><stop offset=".34" stopColor="#fbeac2" />
          <stop offset=".52" stopColor="#c99a58" /><stop offset=".72" stopColor="#eccf97" /><stop offset="1" stopColor="#80592b" />
        </linearGradient>
      </defs>
      <path d="M68 2c-10 0-14 6-14 11s5 10 14 10 14-5 14-10S78 2 68 2Z" fill="none" stroke="url(#bbGold)" strokeWidth="3.4" />
      <path d="M14 26c0-5 22-7 54-7s54 2 54 7v24H14Z" fill="url(#bbGold)" />
      <path d="M14 34c20 4 88 4 108 0M14 40c20 4 88 4 108 0" fill="none" stroke="#7a5426" strokeOpacity=".45" />
      {teeth.map(x => (
        <g key={x}>
          <path d={`M${x + 2} 48h13l-6.5 26Z`} fill="url(#bbGold)" />
          <path d={`M${x + 8.5} 54l2.5 7-2.5 6-2.5-6Z`} fill="#6e4a22" fillOpacity=".55" />
        </g>
      ))}
    </svg>
  );
}

/* ---------- The Bauble: pink and white ---------- */
export function BannerBauble() {
  const sec = useRef<HTMLElement>(null);
  const energy = useRef(0);
  const hang = useSway(sec, energy);
  return (
    <section className="xb xb-bauble" ref={sec} aria-labelledby="bb-t">
      <div className="xb-copy">
        <h1 id="bb-t">All your hair wishes,<br /><em>in one place</em></h1>
        <p>Your Christmas ritual, tied with a bow.</p>
        <Cta />
      </div>
      <div className="bb-orn" ref={hang(0)}>
        <img className="bb-ribbon" src={`${A}satin-ribbon.webp`} alt="" />
        <BaubleCap />
        <div className="bb-globe">
          <img className="bb-glass" src={`${A}bauble-back.webp`} alt="" />
          <Photo id="shampoo" className="bb-p bb-shampoo" />
          <Photo id="miracle" className="bb-p bb-miracle" />
          <Photo id="jar" className="bb-p bb-jar" />
          <GlobeGlitter energy={energy} />
          <img className="bb-glass" src={`${A}bauble-front.webp`} alt="" />
        </div>
        <img className="bb-bow" src={`${A}satin-bow.webp`} alt="" />
      </div>
    </section>
  );
}

/* ---------- The Christmas Issue: white and pink, a magazine cover; the products drop onto their stands ---------- */
export function BannerIssue() {
  return (
    <section className="xb xb-issue" aria-labelledby="is-t">
      <h1 id="is-t" className="is-xmas" aria-label="Xmas, the ÀLara Christmas issue">XMAS</h1>
      <p className="is-date" aria-hidden="true">12.2026</p>
      <p className="is-tag">hair and ritual<br />edition</p>
      <div className="xb-copy is-copy">
        <p>The ÀLara Christmas box: hive favourites, ready to unwrap.</p>
        <Cta />
      </div>
      <p className="is-hello" aria-label="Hello 2027"><span>Hello</span><b>2027</b></p>
      <div className="is-stage">
        <img className="is-stand is-s-mid" src={`${A}stand-fluted-blush.webp`} alt="" />
        <i className="st-cast is-c-mid" />
        <Photo id="shampoo" className="is-part is-shampoo" />
        <img className="is-stand is-s-right" src={`${A}stand-fluted-rose.webp`} alt="" />
        <i className="st-cast is-c-right" />
        <Photo id="miracle" className="is-part is-miracle" />
        <img className="is-stand is-s-left" src={`${A}stand-flower-white.webp`} alt="" />
        <i className="st-cast is-c-left" />
        <Photo id="jar" className="is-part is-jar" />
      </div>
    </section>
  );
}

/* ---------- Happy Holidays: brown and pink; giant type, Santa and the model leaning on a giant Miracle ---------- */
export function BannerMerry() {
  const sec = useRef<HTMLElement>(null);
  useEffect(() => {
    if (still()) return;
    const el = sec.current!;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
      el.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
    };
    el.addEventListener('pointermove', move);
    return () => el.removeEventListener('pointermove', move);
  }, []);
  return (
    <section className="xb xb-merry" ref={sec} aria-labelledby="mc-t">
      <h1 id="mc-t" className="mc-type"><span>Happy</span> <span>Holidays</span></h1>
      <div className="mc-group">
        <i className="mc-floor" />
        <img className="mc-santa" src={`${A}santa-group.webp`} alt="Santa in rose pink, carrying ÀLara shopping bags, leaning on a giant bottle of The Miracle Pro Edition, with a model in a blush suit leaning on its other side" width={1700} height={1657} draggable={false} />
      </div>
      <p className="mc-line">Enjoy the season,<br />and your best hair in it.</p>
      <div className="mc-cta"><Cta label="Build your gift" /></div>
    </section>
  );
}

/* ---------- The Advent Hive: the honeycomb is a Christmas tree; its numbered doors open on the products ---------- */
const HEX = '50,0 100,25 100,75 50,100 0,75 0,25';
function Hex({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points={HEX} /></svg>;
}
type TreeCell = { id?: Id; bee?: boolean };
// no filler cells: the bee on top, then only the products
const TREE: TreeCell[][] = [
  [{ bee: true }],
  [{ id: 'shampoo' }, { id: 'miracle' }],
  [{ id: 'conditioner' }, { id: 'jar' }, { id: 'tube' }],
];
const COLS = 3;
const ORDER: Id[] = ['shampoo', 'miracle', 'jar', 'conditioner', 'tube'];
const DOOR: Record<Id, number> = { shampoo: 20, miracle: 21, jar: 22, conditioner: 23, tube: 24 };
const CW = 190, CH = 220;   // one cell, in the banner's design pixels
// fairy lights: one on every corner of the comb
const LIGHTS = (() => {
  const seen = new Map<string, [number, number]>();
  TREE.forEach((row, r) => row.forEach((_, i) => {
    const cx = ((COLS - row.length) / 2 + i + .5) * CW, cy = r * .75 * CH + CH / 2;
    [[0, -.5], [.5, -.25], [.5, .25], [0, .5], [-.5, .25], [-.5, -.25]].forEach(([dx, dy]) => {
      const x = cx + dx * CW, y = cy + dy * CH;
      seen.set(`${Math.round(x)}:${Math.round(y)}`, [x, y]);
    });
  }));
  return [...seen.values()];
})();

// the bee's flight from the headline up to the star, with one lazy loop on the way
const TRAIL = 'M262 182C352 104 470 66 590 98c72 20 96 76 54 98-42 20-64-36-24-66 62-46 190-66 306-58';
const hexAt = (x: number, y: number, r: number) => [0, 1, 2, 3, 4, 5].map(k => { const a = Math.PI / 3 * k - Math.PI / 2; return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`; }).join(' ');
const LOOSE: [number, number, number][] = [[1372, 300, 34], [1404, 378, 19], [1362, 438, 12], [612, 478, 28], [574, 548, 16]];
const SPARKS: [number, number, number][] = [[1110, 92, 11], [1140, 190, 7], [1300, 230, 9], [1396, 214, 6], [720, 262, 9], [640, 356, 6], [1385, 560, 8], [600, 640, 7]];

export function BannerHive() {
  const [open, setOpen] = useState<Id[]>(() => (still() ? ORDER : []));
  useEffect(() => {
    if (still()) return;
    const timers = ORDER.map((id, i) => setTimeout(() => setOpen(o => (o.includes(id) ? o : [...o, id])), 700 + i * 480));
    return () => timers.forEach(clearTimeout);
  }, []);
  const toggle = (id: Id) => setOpen(o => (o.includes(id) ? o.filter(x => x !== id) : [...o, id]));
  return (
    <section className="xb xb-hive" aria-labelledby="hv-t">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="hvGold" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0" stopColor="#a87a3f" /><stop offset=".35" stopColor="#efd59f" /><stop offset=".6" stopColor="#b98a4a" /><stop offset="1" stopColor="#e6c78f" />
          </linearGradient>
          <radialGradient id="hvNiche" cx=".5" cy=".42" r=".66">
            <stop offset="0" stopColor="#64392a" /><stop offset=".6" stopColor="#442417" /><stop offset="1" stopColor="#2a150c" />
          </radialGradient>
          <radialGradient id="hvHalo"><stop offset="0" stopColor="#fff0bf" stopOpacity=".7" /><stop offset="1" stopColor="#fff0bf" stopOpacity="0" /></radialGradient>
          <mask id="hvTrailMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1440" height="760">
            <path pathLength={1} className="hv-trail-mask" d={TRAIL} />
          </mask>
        </defs>
      </svg>
      <svg className="hv-decor" viewBox="0 0 1440 760" aria-hidden="true">
        <path className="hv-trail" d={TRAIL} mask="url(#hvTrailMask)" />
        <g className="hv-loose">
          {LOOSE.map(([x, y, r], i) => <g key={i} style={{ '--i': i } as CSSProperties}><polygon points={hexAt(x, y, r)} /></g>)}
        </g>
        <g className="hv-spark">
          {SPARKS.map(([x, y, r], i) => <g key={i} style={{ '--i': i } as CSSProperties}><path transform={`translate(${x} ${y}) scale(${r})`} d="M0-1C.08-.08.08-.08 1 0 .08.08.08.08 0 1-.08.08-.08.08-1 0-.08-.08-.08-.08 0-1Z" /></g>)}
        </g>
      </svg>
      <p className="hv-line">From our hive<br />to yours</p>
      <div className="xb-copy">
        <img className="hv-bee" src="/live/xmas/lid-bee.png" alt="" width={1104} height={738} />
        <h1 id="hv-t">Happy Holidays<br /><em>from the hive</em></h1>
        <p>Our honeycomb dressed as a Christmas tree. Open its numbered doors to find what’s inside.</p>
        <Cta />
      </div>
      <div className="hv-tree">
        <span className="hv-glow" aria-hidden="true" />
        <span className="hv-trunk" aria-hidden="true" />
        {TREE.map((row, r) => row.map((cell, i) => {
          const style = { '--x': (COLS - row.length) / 2 + i, '--r': r } as CSSProperties;
          if (cell.bee) return <span key="bee" className="hv-cell hv-top" style={style}><Hex className="hv-back" /><img src="/live/xmas/lid-bee.png" alt="" /></span>;
          const id = cell.id!;
          const isOpen = open.includes(id);
          return (
            <button key={id} type="button" className={`hv-cell hv-door-cell hv-${id}${isOpen ? ' is-open' : ''}`} style={style} aria-pressed={isOpen} aria-label={`${P(id).name}: ${isOpen ? 'close' : 'open'} this door`} onClick={() => toggle(id)}>
              <Hex className="hv-back" />
              <Photo id={id} className="hv-p" decorative />
              <span className="hv-door"><Hex className="hv-door-hex" /><b>{DOOR[id]}</b></span>
              <span className="hv-name">{P(id).name}</span>
            </button>
          );
        }))}
        <svg className="hv-lights" viewBox={`-6 -6 ${CW * COLS + 12} ${CH * 2.5 + 12}`} aria-hidden="true">
          {LIGHTS.map(([x, y], n) => <g key={n} style={{ '--i': n } as CSSProperties}><circle cx={x} cy={y} r="11" className="hv-halo" /><circle cx={x} cy={y} r="3.6" className="hv-bulb" /></g>)}
        </svg>
        <svg className="hv-star" viewBox="0 0 100 100" aria-hidden="true">
          <defs><linearGradient id="hvStar" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#fff0c4" /><stop offset=".45" stopColor="#e6c078" /><stop offset="1" stopColor="#a87a3f" /></linearGradient></defs>
          <path d="M50 3l13.6 30.4 33 3.5-24.7 22.2 7 32.5L50 75 21.100 91.600l7-32.500L3.400 36.900l33-3.500Z" fill="url(#hvStar)" stroke="#fff4d6" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      </div>
      <svg className="hv-snow" viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 62C160 22 300 70 470 52s250-44 420-28 230 62 330 40 150-42 220-30v76H0Z" fill="#f9dfe9" />
        <path d="M0 84C190 50 330 96 520 80s270-34 430-18 240 50 490 14v34H0Z" fill="#fff" />
      </svg>
    </section>
  );
}

/* ---------- Hung With Care: brown and pink; each product hangs in a papercut ring, on a satin ribbon, and swings ---------- */
// a ring of white paper, its edge scalloped, cut through with ÀLara's own honeycomb cells and four-point stars
function papercutPath() {
  const C = 100, poly = (pts: number[][]) => `M${pts.map(p => p.map(v => v.toFixed(2)).join(' ')).join('L')}Z`;
  const circle = (fn: (a: number) => number, n = 240) => poly(Array.from({ length: n }, (_, i) => { const a = i / n * 6.2832, r = fn(a); return [C + Math.cos(a) * r, C + Math.sin(a) * r]; }));
  let d = circle(a => 97 + 2.6 * Math.cos(a * 24)) + circle(a => 72 + 1.4 * Math.cos(a * 24));
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * 6.2832, cx = C + Math.cos(a) * 85, cy = C + Math.sin(a) * 85;
    d += poly(Array.from({ length: 6 }, (_, k) => { const b = a + k * 1.0472; return [cx + Math.cos(b) * 7.4, cy + Math.sin(b) * 7.4]; }));
    const a2 = a + .2618, sx = C + Math.cos(a2) * 85, sy = C + Math.sin(a2) * 85;
    d += poly(Array.from({ length: 8 }, (_, k) => { const b = a2 + k * .7854, r = k % 2 ? 1.3 : 5; return [sx + Math.cos(b) * r, sy + Math.sin(b) * r]; }));
  }
  return d;
}
const PAPERCUT = papercutPath();
const Ring = () => <svg className="hg-ring" viewBox="0 0 200 200" aria-hidden="true"><path d={PAPERCUT} fillRule="evenodd" /></svg>;

const HUNG: { id?: Id; x: number; len: number; r: number; h?: number }[] = [
  { id: 'shampoo', x: 50, len: 130, r: 185, h: 340 },
  { id: 'miracle', x: 67.5, len: 365, r: 132, h: 236 },
  { id: 'jar', x: 85, len: 170, r: 142, h: 168 },
  { x: 74, len: 50, r: 66 },
];

export function BannerHung() {
  const sec = useRef<HTMLElement>(null);
  const hang = useSway(sec);
  return (
    <section className="xb xb-hung" ref={sec} aria-labelledby="hg-t">
      <div className="xb-copy">
        <h1 id="hg-t">Hung with care, <em>for Christmas</em></h1>
        <p>Hive favourites for your Christmas ritual, each tied with a satin bow.</p>
        <Cta />
      </div>
      {HUNG.map((it, i) => {
        const p = it.id ? P(it.id) : null;
        return (
          <div key={i} className="hg-item" ref={hang(i)} style={{ '--x': it.x, '--len': it.len, '--R': it.r, '--h': it.h ?? 0, '--ar': p ? p.w / p.h : 1 } as CSSProperties}>
            <img className="hg-ribbon" src={`${A}satin-ribbon.webp`} alt="" />
            <Ring />
            {it.id && <Photo id={it.id} className="hg-p" />}
            <img className="hg-bow" src={`${A}satin-bow.webp`} alt="" />
            {p && <span className="hg-name">{p.name}</span>}
          </div>
        );
      })}
    </section>
  );
}

/* ---------- The Burst: the box flies open and everything leaps out; press the box to do it again ---------- */
const FLY: { id: Id; x: number; y: number; h: number; r: number }[] = [
  { id: 'conditioner', x: 305, y: 16, h: 362, r: 5 },
  { id: 'miracle', x: 545, y: 112, h: 280, r: 20 },
  { id: 'jar', x: 112, y: 196, h: 172, r: -14 },
];
const BITS: { src: string; x: number; y: number; w: number; r: number; d: number }[] = [
  { src: 'curl-1', x: 610, y: 16, w: 180, r: 22, d: .9 },
  { src: 'curl-2', x: 16, y: 400, w: 120, r: 28, d: .8 },
  { src: 'bauble-pearl', x: 505, y: 8, w: 84, r: -14, d: 1 },
  { src: 'bauble-gold', x: 725, y: 250, w: 78, r: 16, d: 1.6 },
];

export function BannerBurst() {
  const sec = useRef<HTMLElement>(null);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (still()) return;
    const el = sec.current!;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
      el.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
    };
    el.addEventListener('pointermove', move);
    return () => el.removeEventListener('pointermove', move);
  }, []);
  return (
    <section className="xb xb-burst" ref={sec} aria-labelledby="bt-t">
      <div className="xb-copy">
        <h1 id="bt-t">Open it,<br /><em>and it’s Christmas</em></h1>
        <p>The ÀLara box, bursting with hive favourites.</p>
        <Cta />
      </div>
      <div className="bt-art" key={run}>
        <svg className="bt-lid" viewBox="0 0 440 300" aria-hidden="true">
          <polygon points="12,132 262,8 430,132 186,276" fill="#f7c6d8" />
          <polygon points="12,132 186,276 186,296 12,152" fill="#dd8fae" />
          <polygon points="186,276 430,132 430,152 186,296" fill="#cf7e9f" />
          <image href="/live/xmas/lid-bee.png" width="190" height="127" transform="matrix(.93 -.37 .62 .62 68 130)" />
        </svg>
        <svg className="bt-box bt-box-back" viewBox="0 0 620 470" aria-hidden="true">
          <polygon points="40,110 330,30 590,110 300,200" fill="#a9446f" />
          <polygon points="40,110 330,30 335,90 70,160" fill="#c56a8f" />
          <polygon points="330,30 590,110 555,170 335,90" fill="#b95d84" />
        </svg>
        {BITS.map((b, i) => (
          <span key={i} className="bt-fly bt-bit" style={{ '--x': b.x, '--y': b.y, '--r': `${b.r}deg`, '--d': b.d, '--w': b.w, '--i': i } as CSSProperties}>
            <img src={`${A}${b.src}.webp`} alt="" />
          </span>
        ))}
        {FLY.map((f, i) => (
          <span key={f.id} className="bt-fly bt-prod" style={{ '--x': f.x, '--y': f.y, '--r': `${f.r}deg`, '--d': 1.1 + i * .16, '--h': f.h, '--i': i } as CSSProperties}>
            <Photo id={f.id} />
          </span>
        ))}
        <img className="bt-shreds" src={`${A}shreds.webp`} alt="" />
        <button type="button" className="bt-press" onClick={() => setRun(n => n + 1)} aria-label="Burst the box open again">
          <svg className="bt-box" viewBox="0 0 620 470" aria-hidden="true">
            <defs>
              <linearGradient id="btL" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#fbd3e1" /><stop offset="1" stopColor="#efa9c5" /></linearGradient>
              <linearGradient id="btR" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#e596b6" /><stop offset="1" stopColor="#cf7ca0" /></linearGradient>
            </defs>
            <polygon points="40,110 300,200 318,462 72,362" fill="url(#btL)" />
            <polygon points="300,200 590,110 556,356 318,462" fill="url(#btR)" />
            <image href="/live/xmas/lid-bee.png" width="166" height="111" transform="matrix(.93 .33 -.02 1 98 188)" />
          </svg>
        </button>
      </div>
    </section>
  );
}

/* ---------- Anatomy of a Christmas Box: a white line drawing of a gift draws itself round the real products ---------- */
const PARTS: { id: Id; x: number; h: number; ax: number; ay: number; title: string; line: string }[] = [
  { id: 'shampoo', x: 62, h: 340, ax: 156, ay: 336, title: 'Hydra Gloss', line: 'Hydration, repair, gloss' },
  { id: 'miracle', x: 262, h: 260, ax: 346, ay: 416, title: 'The Miracle', line: 'Awaken the magic of hair growth' },
  { id: 'jar', x: 420, h: 170, ax: 540, ay: 506, title: 'Buttered Up Mask', line: 'Infused with butters and honey' },
];
const LISTY = [170, 320, 470];

export function BannerAnatomy() {
  const [on, setOn] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (still() || held) return;
    const t = setInterval(() => setOn(n => (n + 1) % PARTS.length), 2300);
    return () => clearInterval(t);
  }, [held]);
  const a = PARTS[on], y0 = LISTY[on] + 26;
  return (
    <section className="xb xb-anatomy" aria-labelledby="an-t" onPointerLeave={() => setHeld(false)}>
      <div className="xb-copy">
        <h1 id="an-t">Anatomy of a <em>Christmas box</em></h1>
        <p>A peek inside, and what each one does.</p>
        <Cta />
      </div>
      <div className="an-art">
        <img className="an-ball an-b1" src={`${A}bauble-rose.webp`} alt="" />
        <img className="an-ball an-b2" src={`${A}bauble-pearl.webp`} alt="" />
        <img className="an-ball an-b3" src={`${A}bauble-gold.webp`} alt="" />
        <svg className="an-lines" viewBox="0 0 900 760" fill="none" aria-hidden="true">
          <path pathLength={1} className="an-draw" d="M6 232c120-5 460-6 668 1 2 22 1 46-2 67-180 4-510 5-664-1-3-22-4-44-2-67Z" />
          <path pathLength={1} className="an-draw d2" d="M24 300c-1 120 3 280 8 392 150 6 460 7 620-1 6-120 8-280 6-390" />
          <path pathLength={1} className="an-draw d3" d="M306 232c-2 18-2 44 0 66M386 232c2 22 1 44 0 66M306 300c-2 120 0 280 3 390M386 300c3 120 2 280 0 390" />
          <path pathLength={1} className="an-draw d4" d="M346 226c-40-36-120-104-196-122-44-10-74 22-44 58 34 42 150 62 240 64Zm0 0c44-40 130-110 206-120 44-6 66 28 34 60-40 40-152 58-240 60Z" />
          <path pathLength={1} className="an-draw d5" d="M322 212c-6 14-4 30 8 34 14 6 34 2 38-12 4-14-6-30-20-30-12 0-22 2-26 8ZM330 246c-30 22-66 50-98 62M362 244c34 18 72 44 104 56" />
          <path key={on} pathLength={1} className="an-arrow" d={`M${706} ${y0}C${640} ${y0 - 54} ${a.ax + 90} ${a.ay - 92} ${a.ax + 4} ${a.ay - 6}M${a.ax + 24} ${a.ay - 26}L${a.ax + 4} ${a.ay - 6}L${a.ax + 32} ${a.ay - 2}`} />
        </svg>
        {PARTS.map((p, i) => (
          <Photo key={p.id} id={p.id} className={`an-p${i === on ? ' is-on' : ''}`} style={{ '--x': p.x, '--h': p.h, '--i': i } as CSSProperties} />
        ))}
        <ul className="an-list">
          {PARTS.map((p, i) => (
            <li key={p.id} style={{ '--y': LISTY[i] } as CSSProperties} className={i === on ? 'is-on' : undefined} onPointerEnter={() => { setHeld(true); setOn(i); }}>
              <b>{p.title}</b><span>{p.line}</span>
            </li>
          ))}
        </ul>
        <p className="an-now" aria-live="polite"><b>{a.title}</b> {a.line}</p>
      </div>
    </section>
  );
}

/* ---------- Dear Santa: the whole banner is the letter; it writes itself, stickers slap on, Santa stamps it ---------- */
const WISHES: { id: Id; label: string }[] = [
  { id: 'shampoo', label: 'Hydra Gloss Repair Shampoo' },
  { id: 'miracle', label: 'The Miracle Pro-Edition' },
  { id: 'jar', label: 'Buttered Up Mask' },
];
const pen = (t: number, dur: number) => ({ '--t': `${t}s`, '--dur': `${dur}s` }) as CSSProperties;

// a postage stamp's edge: a rectangle with little round bites all the way round
function stampEdge(w: number, h: number, r: number) {
  const side = (from: [number, number], to: [number, number], n: number) => {
    let d = '';
    for (let i = 1; i <= n; i++) {
      const x = from[0] + (to[0] - from[0]) * (i - .5) / n, y = from[1] + (to[1] - from[1]) * (i - .5) / n;
      const ux = (to[0] - from[0]) / Math.hypot(to[0] - from[0], to[1] - from[1]), uy = (to[1] - from[1]) / Math.hypot(to[0] - from[0], to[1] - from[1]);
      const ex = from[0] + (to[0] - from[0]) * i / n, ey = from[1] + (to[1] - from[1]) * i / n;
      d += `L${(x - ux * r).toFixed(1)} ${(y - uy * r).toFixed(1)}A${r} ${r} 0 0 1 ${(x + ux * r).toFixed(1)} ${(y + uy * r).toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`;
    }
    return d;
  };
  return `M0 0${side([0, 0], [w, 0], 9)}${side([w, 0], [w, h], 11)}${side([w, h], [0, h], 9)}${side([0, h], [0, 0], 11)}Z`;
}
const STAMP_EDGE = stampEdge(180, 220, 5);

function CandyCane() {
  return (
    <svg className="ds-cane" viewBox="0 0 120 300" fill="none" aria-hidden="true">
      <path d="M38 288V80c0-62 66-62 66-14" stroke="#b9607f" strokeOpacity=".3" strokeWidth="30" strokeLinecap="round" transform="translate(3 5)" />
      <path d="M38 288V80c0-62 66-62 66-14" stroke="#f0b3c9" strokeWidth="32" strokeLinecap="round" />
      <path d="M38 288V80c0-62 66-62 66-14" stroke="#fffafb" strokeWidth="28" strokeLinecap="round" />
      <path d="M38 288V80c0-62 66-62 66-14" stroke="#d22f73" strokeWidth="28" strokeDasharray="15 21" />
    </svg>
  );
}

export function BannerSanta() {
  const [ticks, setTicks] = useState<Id[]>(() => (still() ? WISHES.map(w => w.id) : []));
  const [stamped, setStamped] = useState(still);
  useEffect(() => {
    if (still()) return;
    const timers = WISHES.map((w, i) => setTimeout(() => setTicks(t => (t.includes(w.id) ? t : [...t, w.id])), 3500 + i * 800));
    timers.push(setTimeout(() => setStamped(true), 6500));
    return () => timers.forEach(clearTimeout);
  }, []);
  const toggle = (id: Id) => setTicks(t => (t.includes(id) ? t.filter(x => x !== id) : [...t, id]));
  return (
    <section className="xb xb-santa" aria-labelledby="ds-t">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          {/* rubber-stamp ink: the print breaks up a little, as real ink does */}
          <filter id="dsInk" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="4" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -6 4.4" />
            <feComposite in="SourceGraphic" operator="in" />
          </filter>
          <path id="dsArc" d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0" />
          <path id="dsArc2" d="M90 90m-66 0a66 66 0 1 1 132 0a66 66 0 1 1-132 0" />
        </defs>
      </svg>
      <div className="ds-note">
        <h1 id="ds-t" className="ds-write" style={pen(.2, 1.1)}>Dear Santa,</h1>
        <p className="ds-write" style={pen(1.3, 1.5)}>I’ve been very good, so please send:</p>
        <ul>
          {WISHES.map((w, i) => {
            const on = ticks.includes(w.id);
            return (
              <li key={w.id}>
                <button type="button" aria-pressed={on} onClick={() => toggle(w.id)}>
                  <svg className={`ds-box${on ? ' is-on' : ''}`} viewBox="0 0 40 40" aria-hidden="true">
                    <path className="ds-sq" d="M6 8c9-2 19-2 28-1 1 8 1 18 0 27-9 1-19 1-28 0-1-9-1-18 0-26Z" />
                    <path className="ds-tick" pathLength={1} d="M10 21c3 3 6 7 8 11 5-11 11-20 20-27" />
                  </svg>
                  <span className="ds-write" style={pen(2.8 + i * .8, .75)}>{w.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="ds-ps ds-write" style={pen(5.2, 1.1)}>P.S. My hair has been very good too.</p>
        <Cta />
      </div>
      <div className="ds-board">
        <svg className="ds-doodles" viewBox="0 0 1440 760" fill="none" aria-hidden="true">
          <path pathLength={1} style={pen(1.2, .6)} d="M738 42l8 22 24 2-19 15 6 23-19-13-20 13 7-23-19-15 24-2Z" />
          <path pathLength={1} style={pen(1.6, .6)} d="M716 142c-13-13-28 5-13 18 5 5 10 8 13 12 3-4 8-7 13-12 15-13 0-31-13-18Z" />
          <path pathLength={1} style={pen(5.6, .8)} d="M530 452c70 26 150 14 225-28M731 414l24 10-9 25" />
        </svg>
        <span className="ds-stamp">
          <svg viewBox="-6 -6 192 232" aria-hidden="true"><path d={STAMP_EDGE} /></svg>
          <span className="ds-stamp-in">
            <img src="/live/xmas/lid-bee.png" alt="" />
            <b>ÀLara post</b>
          </span>
        </span>
        <svg className="ds-postmark" viewBox="0 0 280 180" aria-hidden="true">
          <g filter="url(#dsInk)">
            <circle cx="90" cy="90" r="84" /><circle cx="90" cy="90" r="50" />
            <text className="ds-mark-t"><textPath href="#dsArc2" startOffset="2%">NORTH POLE • THE HIVE • NORTH POLE • THE HIVE •</textPath></text>
            <text x="90" y="86" textAnchor="middle" className="ds-mark-d">24 DEC</text>
            <text x="90" y="110" textAnchor="middle" className="ds-mark-d">2026</text>
            <path d="M172 58c17-15 33 15 50 0s33 15 50 0M172 90c17-15 33 15 50 0s33 15 50 0M172 122c17-15 33 15 50 0s33 15 50 0" />
          </g>
        </svg>
        <Photo id="shampoo" className={`ds-st ds-s-shampoo${ticks.includes('shampoo') ? ' is-on' : ''}`} />
        <Photo id="miracle" className={`ds-st ds-s-miracle${ticks.includes('miracle') ? ' is-on' : ''}`} />
        <Photo id="jar" className={`ds-st ds-s-jar${ticks.includes('jar') ? ' is-on' : ''}`} />
        <span className="ds-tape" aria-hidden="true" />
        <CandyCane />
        <svg className={`ds-approved${stamped && ticks.length ? ' is-on' : ''}`} viewBox="0 0 200 200" role="img" aria-label="Approved by Santa’s workshop">
          <g filter="url(#dsInk)">
            <circle cx="100" cy="100" r="94" /><circle cx="100" cy="100" r="62" />
            <text className="ds-ok-t"><textPath href="#dsArc" startOffset="1%">SANTA’S WORKSHOP • NICE LIST • SANTA’S WORKSHOP •</textPath></text>
            <rect x="-4" y="72" width="208" height="56" rx="3" className="ds-ok-band" />
            <text x="100" y="111" textAnchor="middle" className="ds-ok-w">APPROVED</text>
          </g>
        </svg>
      </div>
    </section>
  );
}

/* ---------- Torn & Pinned: a scrapbook page; torn wine paper, washi tape, and polaroids you can move around ---------- */
const SNAPS: { id: Id; x: number; y: number; r: number; cap: string; tape: 'tape' | 'clip' }[] = [
  { id: 'shampoo', x: 122, y: 268, r: -5, cap: 'Hydra Gloss', tape: 'tape' },
  { id: 'miracle', x: 372, y: 292, r: 3, cap: 'The Miracle', tape: 'clip' },
  { id: 'jar', x: 622, y: 262, r: -2.5, cap: 'Buttered Up Mask', tape: 'tape' },
  { id: 'tube', x: 872, y: 294, r: 4, cap: 'Leave-in Cream', tape: 'clip' },
  { id: 'conditioner', x: 1122, y: 268, r: -4, cap: 'Intense Hydration', tape: 'tape' },
];

function Snap({ s, i }: { s: (typeof SNAPS)[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const pos = useRef({ x: 0, y: 0 });
  const down = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    drag.current = { x: e.clientX, y: e.clientY, ox: pos.current.x, oy: pos.current.y };
    ref.current!.setPointerCapture(e.pointerId);
    ref.current!.classList.add('is-held');
  };
  const move = (e: ReactPointerEvent) => {
    const d = drag.current; if (!d) return;
    pos.current = { x: d.ox + e.clientX - d.x, y: d.oy + e.clientY - d.y };
    ref.current!.style.translate = `${pos.current.x}px ${pos.current.y}px`;
  };
  const up = () => { drag.current = null; ref.current?.classList.remove('is-held'); };
  return (
    <div ref={ref} className="tp-snap" style={{ '--x': s.x, '--y': s.y, '--r': `${s.r}deg`, '--i': i } as CSSProperties} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      {s.tape === 'tape' && <span className="tp-tape" aria-hidden="true" />}
      {s.tape === 'clip' && <span className="tp-clip" aria-hidden="true" />}
      <span className="tp-pic"><Photo id={s.id} /></span>
      <span className="tp-cap">{s.cap}</span>
    </div>
  );
}

export function BannerTorn() {
  return (
    <section className="xb xb-torn" aria-labelledby="tp-t">
      <h1 id="tp-t" className="tp-type">Happy Holidays</h1>
      <img className="tp-band" src={`${A}torn-band.webp`} alt="" />
      <div className="tp-board">{SNAPS.map((s, i) => <Snap key={s.id} s={s} i={i} />)}</div>
      <div className="tp-foot">
        <p>Five hive favourites, pinned up for the season. <em>Move them around, they’re yours.</em></p>
        <Cta />
      </div>
    </section>
  );
}
