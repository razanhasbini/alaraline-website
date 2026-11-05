import { useEffect, useState } from 'react';
import { reviews } from '../../data/site';

// "Customer Love": three reviews at a time on desktop (two on tablets, one on phones), sliding one step every 5 seconds.
function perView() {
  return innerWidth <= 760 ? 1 : innerWidth <= 1080 ? 2 : 3;
}

export default function CustomerLove() {
  const [view, setView] = useState(perView);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const stops = reviews.length - view + 1;
  const at = Math.min(i, stops - 1);

  useEffect(() => {
    const on = () => setView(perView());
    addEventListener('resize', on);
    return () => removeEventListener('resize', on);
  }, []);

  useEffect(() => {
    if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setI((at + 1) % stops), 5000);
    return () => clearTimeout(t);
  }, [at, stops, paused]);

  return (
    <section className="love" aria-labelledby="love-title">
      <div className="lwrap">
        <img className="love-ic" src="/live/icons/love.svg" alt="" width={60} height={54} />
        <h2 className="love-title" id="love-title">Customer Love</h2>
        <p className="love-sub">Over 79K Positive Reviews</p>
        <div className="love-slider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <div className="love-track" style={{ transform: `translateX(${-at * (100 / view)}%)` }}>
            {reviews.map((r, n) => (
              <article className="love-card" key={r.who} dir={r.rtl ? 'rtl' : undefined} aria-hidden={n < at || n >= at + view}>
                <div className="love-stars" aria-label="5 out of 5 stars">★★★★★</div>
                <p>{r.text}</p>
                <footer>
                  <img src={r.avatar} alt="" loading="lazy" width={80} height={80} />
                  <h3>{r.who}</h3>
                </footer>
              </article>
            ))}
          </div>
        </div>
        <div className="love-dots" role="tablist" aria-label="Reviews">
          {Array.from({ length: stops }, (_, n) => (
            <button key={n} role="tab" aria-selected={n === at} aria-label={`Show review ${n + 1}`} onClick={() => setI(n)} />
          ))}
        </div>
      </div>
    </section>
  );
}
