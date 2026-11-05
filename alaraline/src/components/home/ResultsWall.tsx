import { useEffect, useRef, useState } from 'react';
import { results } from '../../data/site';

// "The Results Wall": a client's Before polaroid taped to the wall, the After hanging lower right from a gold clip.
// Four pairs show at a time on desktop; the arrows page through all of them.
export default function ResultsWall() {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const t = track.current!;
    setEdge({ start: t.scrollLeft < 8, end: t.scrollLeft + t.clientWidth > t.scrollWidth - 8 });
  };
  useEffect(update, []);

  const page = (dir: number) => {
    const t = track.current!;
    const pair = t.querySelector<HTMLElement>('.cr-pair')!;
    t.scrollBy({ left: dir * (pair.offsetWidth + 28), behavior: 'smooth' });
  };

  return (
    <section className="clients" aria-labelledby="cr-title">
      <div className="lwrap">
        <header className="cr-head">
          <p className="cr-eyebrow">Our clients</p>
          <h2 className="ltitle squiggle" id="cr-title">The Results Wall</h2>
          <p className="cr-sub">Before and after, shared with us by our clients.</p>
        </header>
        <div className="cr-carousel">
          <button className="cr-arrow prev" aria-label="Previous results" onClick={() => page(-1)} disabled={edge.start}>‹</button>
          <div className="cr-grid" ref={track} onScroll={update} role="list">
            {results.map((r, n) => (
              <article className="cr-pair" role="listitem" key={r.before} aria-label={`Client result ${n + 1}`}>
                <figure className="cr-pol cr-before">
                  <span className="cr-tape" aria-hidden="true" />
                  <img src={r.before} alt="Client's hair before" loading="lazy" />
                  <figcaption>Before</figcaption>
                </figure>
                <figure className="cr-pol cr-after">
                  <span className="cr-clip" aria-hidden="true" />
                  <img src={r.after} alt="Client's hair after using ÀLara Line" loading="lazy" />
                  <figcaption>After</figcaption>
                </figure>
              </article>
            ))}
          </div>
          <button className="cr-arrow next" aria-label="More results" onClick={() => page(1)} disabled={edge.end}>›</button>
        </div>
      </div>
    </section>
  );
}
