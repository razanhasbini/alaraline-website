import { useEffect, useRef, useState } from 'react';
import '../../styles/xmas-hero.css';
import { LIVE } from '../../data/site';
import type { BoxProduct, BoxScene, Phase } from './boxScene';

// The Christmas hero: a short film of the ÀLara PR box on burgundy that plays by itself. The box is in place
// as the page loads, the satin ribbon pulls away at once, the lid opens in a burst of gold, and the products rise out with their names.
// It plays once and ends with the products back in the open box. The words beside it follow the film;
// drag the box to turn it, hover a product to bring it forward, Replay to watch again.

const PRODUCTS: BoxProduct[] = [
  { id: 'shampoo', name: 'Hydra Gloss Repair Shampoo' },
  { id: 'conditioner', name: 'Intense Hydration Conditioner' },
  { id: 'tube', name: 'Leave-in Hair Cream' },
  { id: 'miracle', name: 'The Miracle Pro-Edition' },
  { id: 'jar', name: 'Buttered Up Mask' },
];
const SHOP = `${LIVE}/shop/`; // the box's own product page, once it exists

export default function ChristmasBoxHero() {
  const stage = useRef<HTMLDivElement>(null);
  const tags = useRef<HTMLDivElement>(null);
  const scene = useRef<BoxScene | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [phase, setPhase] = useState<Phase>('turn');
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    // a fresh canvas for every mount, so a remount never shares a WebGL context with a scene being torn down
    const canvas = document.createElement('canvas');
    canvas.className = 'xh-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    stage.current!.prepend(canvas);
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    import('./boxScene')
      .then(m => m.createBoxScene(canvas, { reducedMotion, products: PRODUCTS, tagLayer: tags.current!, onPhase: setPhase, onActive: setActive }))
      .then(s => { if (!alive) { s.dispose(); return; } scene.current = s; setReady(true); })
      .catch(() => alive && setFailed(true));
    return () => { alive = false; scene.current?.dispose(); scene.current = null; canvas.remove(); };
  }, []);

  const inside = phase === 'open' || phase === 'reveal' || phase === 'settle' || phase === 'rest';

  return (
    <section className={`xh${inside ? ' is-inside' : ''}${ready ? ' is-ready' : ''}`} aria-labelledby="xh-title">
      <div className="xh-stage" ref={stage}>
        {failed && <img className="xh-fallback" src="/live/xmas/lid-bee.png" alt="" width={1104} height={738} />}
        <div className="xh-tags" ref={tags} aria-hidden="true" />
      </div>

      <div className="xh-copy">
        <h2 id="xh-title" className="sr-only">The ÀLara Christmas Box</h2>
        <div className="xh-words-wrap">
        <div className="xh-words" aria-hidden={inside}>
          <p className="xh-head">The ÀLara <em>Christmas</em> Box</p>
          <p className="xh-text">Pure Honey haircare in pink and gold, wrapped for the season.</p>
        </div>
        <div className="xh-words xh-words-inside" aria-hidden={!inside}>
          <p className="xh-head">Your bee-autiful hair journey <em>begins here</em></p>
          <ul className="xh-list" aria-label="In the box">
            {PRODUCTS.filter(p => p.name).map(p => <li key={p.id} className={active === p.id ? 'is-active' : undefined}>{p.name}</li>)}
          </ul>
        </div>
        </div>
        <div className="xh-actions">
          <a className="xh-btn" href={SHOP}>Discover the box <span aria-hidden="true">→</span></a>
          <button type="button" className="xh-link" onClick={() => scene.current?.replay()} disabled={!ready}>Replay</button>
        </div>
      </div>
    </section>
  );
}
