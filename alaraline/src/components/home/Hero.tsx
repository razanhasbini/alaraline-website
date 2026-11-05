import { useEffect, useState } from 'react';
import { LIVE, heroFloat } from '../../data/site';
import { Arrow } from '../Icons';

// The live hero: three slides that change every 6 seconds (pouch with the whole line, The Miracle, Curls On).
const SLIDES = 3;

export default function Hero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setI(n => (n + 1) % SLIDES), 6000);
    return () => clearTimeout(t);
  }, [i, paused]);

  return (
    <section className="hero" aria-roledescription="carousel" aria-label="Featured"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className={`slide slide-pouch${i === 0 ? ' is-active' : ''}`} aria-hidden={i !== 0}>
        <div className="slide-copy">
          <h1 className="pouch-title">All your haircare solutions <em>in one place</em></h1>
          <div className="pouch-actions">
            <a className="btn-blush" href={`${LIVE}/product/full-treatment-set/`} tabIndex={i === 0 ? 0 : -1}>Shop the full set <Arrow /></a>
            <a className="link-under" href={`${LIVE}/shop/`} tabIndex={i === 0 ? 0 : -1}>Build your gift <Arrow /></a>
          </div>
        </div>
        <div className="float-stage" aria-hidden="true">
          {heroFloat.map(f => (
            <img key={f.file} src={`/live/hero/float/${f.file}`} alt="" style={{ left: `${f.x}%`, top: `${f.y}%`, height: `calc(${f.h} / 760 * 100%)`, animationDelay: `${f.d * 70}ms`, rotate: `${f.r}deg` }} />
          ))}
        </div>
      </div>

      <div className={`slide slide-photo slide-miracle${i === 1 ? ' is-active' : ''}`} aria-hidden={i !== 1}>
        <img className="slide-bg" src="/live/hero/bg-miracle.jpg" alt="" />
        <div className="slide-copy">
          <p className="stars-line">★★★★★ 79,000+ Satisfied Customers</p>
          <h2>Awaken The Magic of Hair Growth</h2>
          <p className="slide-text">Powered by advanced vitamins, peptides and caffeine for healthier, fuller-looking hair.</p>
          <a className="btn-white" href={`${LIVE}/product/miracle-pro-edition/`} tabIndex={i === 1 ? 0 : -1}>Shop now</a>
        </div>
      </div>

      <div className={`slide slide-photo slide-curls${i === 2 ? ' is-active' : ''}`} aria-hidden={i !== 2}>
        <img className="slide-bg" src="/live/hero/bg-curls.jpg" alt="" />
        <div className="slide-copy">
          <h2>#1 Best Seller Curls On Collection</h2>
          <a className="btn-white" href={`${LIVE}/product/curls-on-collection/`} tabIndex={i === 2 ? 0 : -1}>Shop now</a>
        </div>
      </div>

      <div className="hero-dots" role="tablist" aria-label="Slides">
        {Array.from({ length: SLIDES }, (_, n) => (
          <button key={n} role="tab" aria-selected={i === n} aria-label={`Slide ${n + 1}`} onClick={() => setI(n)} />
        ))}
      </div>
    </section>
  );
}
