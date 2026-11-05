import { useState } from 'react';
import { LIVE, bestSellers, categories, offers, tabs } from '../../data/site';
import ProductCard from './ProductCard';

export function BestSellers() {
  return (
    <section className="lsec">
      <div className="lwrap">
        <h2 className="ltitle squiggle">Best Sellers</h2>
        <div className="lgrid">{bestSellers.map(p => <ProductCard key={p.slug} product={p} />)}</div>
      </div>
    </section>
  );
}

export function ChristmasBundles() {
  return (
    <section className="bundles">
      <div className="lwrap">
        <h2 className="bundles-title">Christmas Bundles <em>Coming Soon</em></h2>
        <a className="bundles-grid" href="/christmas-pr-box" aria-label="See the ÀLara Christmas PR box">
          {[0, 1, 2, 3].map(n => <img key={n} src="/live/christmas/satin.webp" alt="" loading="lazy" width={266} height={333} />)}
        </a>
      </div>
    </section>
  );
}

export function Categories() {
  return (
    <section className="lsec">
      <div className="lwrap">
        <h2 className="ltitle">Your Hair Essentials</h2>
        <div className="lcats">
          {categories.map(c => (
            <a key={c.name} className="lcat" href={c.href}>
              <span className="lcat-img"><img src={c.img} alt="" loading="lazy" width={300} height={300} /></span>
              <h3>{c.name}</h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Elevate() {
  return (
    <section className="lelevate">
      <div className="lelevate-copy">
        <img className="lelevate-bee" src="/live/brand/bee-live.png" alt="" width={100} height={100} loading="lazy" />
        <h2 className="ltitle">Elevate Your Haircare Routine with ÀLara Line</h2>
        <p>ÀLara Line Exclusive Lineup of Dreamy Hair Essentials!</p>
        <a className="lbtn" href={`${LIVE}/shop/`}>Explore more</a>
      </div>
      <img className="lelevate-img" src="/live/elevate/collage.jpg" alt="A jar of Miracle Mask held up to a honeycomb frame, and a beekeeper at a pink ÀLara hive" loading="lazy" width={1000} height={1414} />
    </section>
  );
}

export function CategoryTabs() {
  const [tab, setTab] = useState(0);
  return (
    <section className="lsec">
      <div className="lwrap">
        <div className="ltabs" role="tablist" aria-label="Shop by category">
          {tabs.map((t, n) => (
            <button key={t.label} role="tab" id={`tab-${n}`} aria-controls="tab-panel" aria-selected={tab === n} onClick={() => setTab(n)}>{t.label}</button>
          ))}
        </div>
        <div id="tab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="lgrid" key={tab}>
          {tabs[tab].products.map(p => <ProductCard key={p.slug} product={p} />)}
        </div>
        <div className="lcenter"><a className="lbtn" href={`${LIVE}/shop/`}>View all</a></div>
      </div>
    </section>
  );
}

export function Offers() {
  return (
    <section className="lsec">
      <div className="lwrap">
        <h2 className="ltitle squiggle">Offers</h2>
        <div className="lgrid">{offers.map(p => <ProductCard key={p.slug} product={p} />)}</div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: 'delivery', title: 'Available Delivery', text: 'We deliver all over Lebanon' },
  { icon: 'natural', title: 'Naturally derived', text: 'Natural & organic hair products' },
  { icon: 'cod', title: 'Cash On Delivery', text: 'Different payment options available' },
];

export function Features() {
  return (
    <section className="features">
      <div className="lwrap features-row">
        {FEATURES.map(f => (
          <div key={f.icon} className="feature">
            <img src={`/live/icons/${f.icon}.svg`} alt="" width={64} height={64} />
            <div><h3>{f.title}</h3><p>{f.text}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}
