import { useEffect, useState } from 'react';
import { LIVE, nav } from '../../data/site';
import { useStore } from '../useStore';
import { BagIcon, Caret, HeartIcon, SearchIcon } from '../Icons';

export function AnnouncementBar() {
  return (
    <div className="announce">
      <a href="/christmas-pr-box">Happy Holidays ✨</a>
    </div>
  );
}

export function Header() {
  const { bag, wish } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(scrollY > 40);
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <button className="menu-btn" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(o => !o)}>
        <span /><span /><span /><span className="sr-only">Menu</span>
      </button>
      <nav id="main-nav" className={`nav${open ? ' is-open' : ''}`} aria-label="Main">
        {nav.map(item => (
          <div key={item.label} className={item.children ? 'has-sub' : undefined}>
            <a href={item.href} className={item.href === '/' ? 'is-current' : undefined}>
              <span>{item.label}</span>{item.children && <Caret />}
            </a>
            {item.children && (
              <div className="sub">
                {item.children.map(c => <a key={c.label} href={c.href}>{c.label}</a>)}
              </div>
            )}
          </div>
        ))}
      </nav>
      <a className="logo" href="/" aria-label="ÀLara Line home">
        <img src="/live/brand/logo.png" alt="ÀLara Line" width={120} height={68} />
      </a>
      <div className="header-actions">
        <a className="icon-btn" href={`${LIVE}/?s=`} aria-label="Search"><SearchIcon /></a>
        <a className="icon-btn" href={`${LIVE}/wishlist/`} aria-label={`Wishlist, ${wish.length} items`}><HeartIcon /><span className="count">{wish.length}</span></a>
        <a className="icon-btn" href={`${LIVE}/cart/`} aria-label={`Bag, ${bag} items`}><BagIcon /><span className="count">{bag}</span></a>
        <a className="login-link" href={`${LIVE}/my-account/`}>Log in</a>
      </div>
    </header>
  );
}
