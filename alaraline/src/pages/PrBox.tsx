import { useEffect, useRef, useState, type CSSProperties } from 'react';
import '../styles/prbox.css';
import { items, madeFor, madeWith } from '../data/prBox';
import { productUrl } from '../data/site';

// The ÀLara Christmas PR box: a dark burgundy room where the box is the one lit thing.
// The visitor breaks the gold bee seal, the lid lifts and each piece of the box rises out of it.

const COUNT = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][items.length] ?? String(items.length);
const MAIL = `mailto:Info@alaraline.co?subject=${encodeURIComponent('Christmas PR box request')}&body=${encodeURIComponent('Hello ÀLara team,\n\nI would love to receive the Christmas PR box.\n\nName:\nInstagram / TikTok:\nCity:\n\nThank you!')}`;

// Sections fade up once as they enter (heading, then text, then picture: data-reveal="0|1|2")
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -12% 0px' });
    els.forEach(el => { el.style.setProperty('--d', `${Number(el.dataset.reveal) * 80}ms`); io.observe(el); });
    return () => io.disconnect();
  }, []);
}

function Rail({ onOpen }: { onOpen: () => void }) {
  const [docked, setDocked] = useState(false);
  useEffect(() => {
    const on = () => setDocked(scrollY > innerHeight / 2 - 40);
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);

  return (
    <header className={`pb-rail${docked ? ' is-docked' : ''}`}>
      <h1>The ÀLara Christmas Box</h1>
      <p className="pb-rail-line">{COUNT} hive favourites, wrapped in burgundy and gold.</p>
      <nav className="pb-rail-nav" aria-label="Page">
        <a href="#inside">Inside</a>
        <a href="#story">Our story</a>
        <a href="/">Shop</a>
        <button type="button" className="pb-btn" onClick={onOpen}>Open the box</button>
      </nav>
    </header>
  );
}

function Seal() {
  return (
    <span className="bx-seal" aria-hidden="true">
      <span className="bx-seal-bee" />
    </span>
  );
}

function OpenBox({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [pick, setPick] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const picked = pick === null ? null : items[pick];

  // the stage is drawn at 620×560 and scaled to its column
  useEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(() => el.style.setProperty('--s', String(Math.min(1, el.clientWidth / 620))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section className={`pb-open${open ? ' is-open' : ''}`} id="open" aria-labelledby="open-title">
      <div className="pb-open-copy">
        <h2 id="open-title" data-reveal="0">{open ? 'Everything inside' : 'Untie the ribbon'}</h2>
        {picked ? (
          <div className="pb-picked" key={picked.slug} aria-live="polite">
            <h3>{picked.name}</h3>
            <p>{picked.text}</p>
            <a href={productUrl(picked.slug)} className="pb-link">See it on alaraline.co <span aria-hidden="true">→</span></a>
          </div>
        ) : (
          <p data-reveal="1" aria-live="polite">
            {open
              ? 'Pick any piece to read what it does.'
              : 'Press the gold seal. The lid lifts and everything inside rises to meet you.'}
          </p>
        )}
        {open && <button type="button" className="pb-quiet" onClick={() => { setPick(null); setOpen(false); }}>Close the box</button>}
      </div>

      <div className="bx-wrap" ref={wrap} data-reveal="2">
        <div className="bx">
          <div className="bx-inside" />
          <div className="bx-items">
            {items.map((it, n) => (
              <button
                key={it.slug}
                type="button"
                className={`bx-item${pick === n ? ' is-picked' : ''}${pick !== null && pick !== n ? ' is-dim' : ''}`}
                style={{ '--x': `${it.at.x}px`, '--y': `${it.at.y}px`, '--h': `${it.at.h}px`, '--r': `${it.at.r}deg`, '--n': n } as CSSProperties}
                onClick={() => setPick(pick === n ? null : n)}
                aria-pressed={pick === n}
                tabIndex={open ? 0 : -1}
                aria-hidden={!open}
              >
                <img src={it.img} alt={it.name} />
              </button>
            ))}
          </div>
          <div className="bx-front">
            <span className="bx-band-v" />
            <span className="bx-band-h left" />
            <span className="bx-band-h right" />
            <span className="bx-mark" aria-hidden="true">ÀLara</span>
          </div>
          <div className="bx-lid">
            <span className="bx-lid-top" />
            <span className="bx-lid-front" />
            <span className="bx-lid-band" />
          </div>
          <button type="button" className="bx-seal-btn" onClick={() => setOpen(true)} aria-label="Break the seal and open the box" tabIndex={open ? -1 : 0} aria-hidden={open}>
            <Seal />
          </button>
        </div>
      </div>
    </section>
  );
}

function Inside() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [late, setLate] = useState(false);

  // While the stage is pinned, the cards travel right to left with the scroll
  useEffect(() => {
    const w = wrap.current!, t = track.current!;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (innerWidth <= 760) { t.style.transform = ''; return; }
        const r = w.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
        const travel = t.scrollWidth - innerWidth + 2 * 32;
        t.style.transform = `translate3d(${-p * travel}px,0,0)`;
        setLate(p > .5);
      });
    };
    on();
    addEventListener('scroll', on, { passive: true });
    addEventListener('resize', on);
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on); };
  }, []);

  return (
    <section className="pb-inside" id="inside" ref={wrap} aria-labelledby="inside-title">
      <div className="pb-inside-stage">
        <img className={`pb-held${late ? '' : ' is-on'}`} src="/live/christmas/satin.webp" alt="Burgundy satin ribbon folded on a dark lacquered table" />
        <img className={`pb-held${late ? ' is-on' : ''}`} src="/live/elevate/collage.jpg" alt="An ÀLara beekeeper lifting a honeycomb frame from a pink hive" />
        <h2 id="inside-title">Inside, one by one</h2>
        <div className="pb-track" ref={track}>
          {items.map(it => (
            <article className="pb-card" key={it.slug}>
              <div className="pb-card-pic"><img src={it.img} alt={it.name} loading="lazy" /></div>
              <div className="pb-card-panel" style={{ background: it.field }}>
                <h3>{it.name}</h3>
                <p>{it.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Holds() {
  const [note, setNote] = useState('Hover a name to see where it comes from.');
  const col = (title: string, rows: [string, string][], sum: string) => (
    <div className="pb-col" data-reveal="1">
      <h3>{title}</h3>
      <ul>
        {rows.map(([name, line]) => (
          <li key={name} tabIndex={0} onMouseEnter={() => setNote(line)} onFocus={() => setNote(line)}>{name}</li>
        ))}
      </ul>
      <p className="pb-col-sum">{sum}</p>
    </div>
  );
  return (
    <section className="pb-holds" aria-labelledby="holds-title">
      <h2 id="holds-title" data-reveal="0">What it holds</h2>
      <div className="pb-cols">
        {col('In the box', items.map(i => [i.name, i.line]), 'A full honey ritual, from wash to scent.')}
        {col('Made with', madeWith, 'Butters, honey and caffeine, each traced to its product.')}
        {col('Made for', madeFor, 'Every hair type, and the scalp underneath.')}
        <p className="pb-note" aria-live="polite">{note}</p>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="pb-story" id="story" aria-labelledby="story-title">
      <h2 id="story-title" className="sr-only">From the hive</h2>
      <ul className="pb-facts" data-reveal="0">
        <li>Baabda, Lebanon</li>
        <li>79,000+ satisfied customers</li>
        <li><a href="mailto:Info@alaraline.co">Info@alaraline.co</a></li>
      </ul>
      <div className="pb-story-text" data-reveal="1">
        <p>
          <img src="/live/brand/founder.jpg" alt="Lara Ammar, founder of ÀLara Line" width={1200} height={1599} loading="lazy" />
          <strong>Lara Ammar</strong> grew up in South Lebanon, where her mother blended herbs, flowers and oils into hair
          remedies. She studied Pharmacy and Nutrition, and built ÀLara Line on both.
        </p>
        <p className="pb-story-more">
          The rituals of the women in her family, and the science of how each ingredient works. Every product is 100% organic
          and safe for all ages; this box is the Christmas edition of that promise.
        </p>
      </div>
    </section>
  );
}

export default function PrBox() {
  const [open, setOpen] = useState(false);
  useReveal();
  useEffect(() => { document.title = 'The ÀLara Christmas Box - ÀLara Line'; }, []);

  const openBox = () => {
    document.getElementById('open')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => setOpen(true), 450);
  };

  return (
    <div className="prbox">
      <img className="pb-hero-pic" src="/live/christmas/satin.webp" alt="Burgundy satin ribbon on a dark lacquered table" />
      <div className="pb-hero-top" />
      <Rail onOpen={openBox} />
      <div className="pb-hero-foot">
        <p>{COUNT} hive favourites, wrapped in burgundy and gold.</p>
        <button type="button" className="pb-btn" onClick={openBox}>Open the box</button>
      </div>
      <main>
        <OpenBox open={open} setOpen={setOpen} />
        <Inside />
        <Holds />
        <Story />
        <section className="pb-cta" aria-labelledby="cta-title">
          <h2 id="cta-title" className="sr-only">Request a box</h2>
          <p data-reveal="0">Creating something for the holidays? Write to us and we’ll send you a box.</p>
          <div className="pb-cta-actions" data-reveal="1">
            <a className="pb-btn" href={MAIL}>Request a box</a>
            <a className="pb-link" href="/">Shop the line</a>
          </div>
        </section>
      </main>
      <footer className="pb-foot">
        <span>ÀLara Line, Baabda</span>
        <span className="pb-foot-links">
          <a href="/">Home</a>
          <a href="https://www.instagram.com/alaraline_lb/">Instagram</a>
          <a href="mailto:Info@alaraline.co">Contact</a>
        </span>
        <span>2026 · <a href="https://alaraline.co/shipping-policy/">Shipping policy</a></span>
      </footer>
    </div>
  );
}
