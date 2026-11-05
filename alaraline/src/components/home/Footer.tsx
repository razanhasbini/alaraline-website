import { useState, type FormEvent } from 'react';
import { LIVE } from '../../data/site';

const SHOP = [
  ['Hair Care', `${LIVE}/product-category/hair-care/`],
  ['Limited Offers', `${LIVE}/product-category/offers/`],
  ['Hair Accessories', `${LIVE}/product-category/hair-accessories/`],
  ['Body Care', `${LIVE}/product-category/body-care/`],
];
const QUICK = [
  ['FAQ', `${LIVE}/faq/`],
  ['Contact', `${LIVE}/contact/`],
  ['Shipping Policy', `${LIVE}/shipping-policy/`],
  ['Our Story', `${LIVE}/our-story/`],
  ['Ingredients', `${LIVE}/ingredients/`],
  ['Hair Scan', `${LIVE}/features/#hair-scan`],
];

export default function Footer() {
  const [sent, setSent] = useState(false);
  // The live form posts to the WordPress newsletter plugin; here it only confirms.
  const subscribe = (e: FormEvent) => { e.preventDefault(); setSent(true); };

  return (
    <footer className="site-footer">
      <svg className="footer-wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
        <path fill="#ffffff" d="M0 0 H1440 V24 C1310 51 1240 48 1110 28 C985 9 875 10 740 36 C607 57 505 52 377 28 C237 3 127 10 0 36 Z" />
      </svg>
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/live/brand/logo.png" alt="ÀLara Line" width={120} height={68} loading="lazy" />
          <p>Made using clean, non-toxic ingredients, our products are designed for everyone.</p>
          <p className="footer-wish">Merry Christmas from the hive.</p>
          <div className="socials">
            <a href="https://www.facebook.com/Alaralineofficial" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-2.2 0-4 1.8-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5Z" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg></a>
            <a href="https://www.instagram.com/alaraline_lb/" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.3" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.3" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" /></svg></a>
            <a href="https://www.tiktok.com/search?q=alaraline" aria-label="TikTok"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v11.5a3.5 3.5 0 1 1-3-3.46M14 3c.4 2.6 2 4.2 4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg></a>
          </div>
        </div>
        <div>
          <h2>Get In Touch</h2>
          <ul className="contact-list">
            <li><span aria-hidden="true">✉</span><a href="mailto:Info@alaraline.co">Info@alaraline.co</a></li>
            <li><span aria-hidden="true">☏</span><a href="tel:+96181624204">+961 81 624 204</a></li>
            <li><span aria-hidden="true">⌖</span>Baabda, Lebanon</li>
          </ul>
        </div>
        <div>
          <h2>Shop</h2>
          <ul>{SHOP.map(([l, h]) => <li key={l}><a href={h}>{l}</a></li>)}</ul>
        </div>
        <div>
          <h2>Quick Links</h2>
          <ul>{QUICK.map(([l, h]) => <li key={l}><a href={h}>{l}</a></li>)}</ul>
        </div>
        <div className="footer-news">
          <h2>Join the hive</h2>
          <p>Hair rituals, new launches and offers — straight to your inbox.</p>
          {sent
            ? <p className="news-done" role="status">Thank you! You’re on the list.</p>
            : (
              <form onSubmit={subscribe}>
                <label className="sr-only" htmlFor="news-email">Your email</label>
                <input id="news-email" type="email" required placeholder="Your email" autoComplete="email" />
                <button type="submit">Subscribe</button>
              </form>
            )}
        </div>
      </div>
      <div className="footer-bottom">
        <span>ÀLara Line | 2026</span>
        <span>Website By Blue Boost Agency</span>
      </div>
    </footer>
  );
}
