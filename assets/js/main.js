/* ÀLara Line — site interactions, shared by every page.
   Each block only runs when its markup is on the page, so one script serves the home page, the shop and
   category pages, product pages, the wishlist, the cart, and the info pages. Products link to
   product.html?p=<slug>, categories to shop.html?cat=<slug>, as on alaraline.co. */
(function () {
  'use strict';
  const A = window.ALARA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = n => 'US$' + (Math.round(n * 100) / 100).toFixed(2);   // as alaraline.co writes prices
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  const params = new URLSearchParams(location.search);
  const productUrl = slug => 'product.html?p=' + encodeURIComponent(slug);
  const catBySlug = Object.fromEntries(A.categories.map(c => [c.slug, c]));
  const catByName = Object.fromEntries(A.categories.map(c => [c.name, c]));
  const catUrl = name => 'shop.html?cat=' + (catByName[name] ? catByName[name].slug : '');
  const byNewest = (a, b) => b.id - a.id;
  const stars = n => `<span class="stars-0" aria-label="Rated ${n} out of 5">${'<svg class="ic"><use href="#i-star"/></svg>'.repeat(5)}</span>`;

  /* ---------------- state ---------------- */
  let cart = store.get('alara-cart', {});
  let wish = store.get('alara-wish', []);
  Object.keys(cart).forEach(k => { if (!A.bySlug[k]) delete cart[k]; });
  wish = wish.filter(k => A.bySlug[k]);

  /* ---------------- product card (as on alaraline.co) ---------------- */
  const priceHtml = p => p.was ? `<del>${money(p.was)}</del> <ins>${money(p.price)}</ins>` : `<span>${money(p.price)}</span>`;
  function card(p) {
    const sale = p.was ? Math.round((1 - p.price / p.was) * 100) : 0;
    const url = productUrl(p.slug);
    return `
    <article class="pcard" role="listitem" data-slug="${p.slug}">
      <div class="pcard-media">
        <a class="pcard-img" href="${url}" aria-label="${esc(p.name)}"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy"></a>
        <div class="pcard-badges">
          ${sale ? `<span class="onsale">-${sale}%</span>` : ''}
          ${p.badge === 'New' ? '<span class="new">New</span>' : ''}
          ${p.oos ? '<span class="out-of-stock">Sold Out</span>' : ''}
        </div>
        <div class="pcard-icons">
          <button type="button" data-wish="${p.slug}" aria-pressed="${wish.includes(p.slug)}" aria-label="Add ${esc(p.name)} to wishlist"><svg class="ic sm"><use href="#i-heart"/></svg></button>
          <button type="button" data-compare="${p.slug}" aria-label="Compare ${esc(p.name)}"><svg class="ic sm"><use href="#i-compare"/></svg></button>
          <a href="${url}" aria-label="View ${esc(p.name)}"><svg class="ic sm"><use href="#i-eye"/></svg></a>
        </div>
        ${p.oos ? `<a class="pcard-cart" href="${url}">Read more</a>` : `<button class="pcard-cart" type="button" data-add="${p.slug}">Add to cart</button>`}
      </div>
      <div class="pcard-price">${priceHtml(p)}</div>
      <h3 class="pcard-title"><a href="${url}">${esc(p.name)}</a></h3>
    </article>`;
  }
  const cards = list => list.map(card).join('');
  window.AlaraCard = card;

  /* ---------------- Shop menu (header and mobile menu) ---------------- */
  $$('[data-shop-menu]').forEach(m => {
    const mega = !!m.closest('.mega');
    m.innerHTML = A.categories.map(c => `<a href="shop.html?cat=${c.slug}">${c.name}${mega ? ` <em>${String(c.count).padStart(2, '0')}</em>` : ''}</a>`).join('') +
      `<a href="shop.html" class="mega-all">${mega ? 'View all products <svg class="ic sm"><use href="#i-arrow"/></svg>' : 'View all'}</a>`;
  });

  /* ================= HOME ================= */
  const best = $('[data-best]');
  if (best) best.innerHTML = cards(A.bestSellers.map(s => A.bySlug[s]).filter(Boolean));

  const catsEl = $('[data-cats]');
  if (catsEl) catsEl.innerHTML = A.categories.filter(c => c.essential).sort((a, b) => a.essential - b.essential).map(c => `
    <a class="lcat" href="shop.html?cat=${c.slug}"><span class="lcat-img"><img src="${c.img}" alt="" loading="lazy"></span><h3>${c.name}</h3></a>`).join('');

  // the tabbed products: the ten newest in each category, as on alaraline.co
  const tabGrid = $('[data-tab-grid]');
  if (tabGrid) {
    const show = t => {
      $$('[data-tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === t));
      tabGrid.innerHTML = cards(A.products.filter(p => p.cats.includes(t)).sort(byNewest).slice(0, 10));
    };
    $$('[data-tab]').forEach(b => b.addEventListener('click', () => show(b.dataset.tab)));
    show('Hair Care');
  }

  const offers = $('[data-offers]');
  if (offers) offers.innerHTML = cards(A.products.filter(p => p.cats.includes('Offers')).sort(byNewest).slice(0, 4));

  /* ---------------- reviews ("Customer Love"): three cards at a time, dots, autoplay ---------------- */
  const revEl = $('[data-reviews]');
  if (revEl) {
    const avatar = who => 'assets/img/reviews/av/' + who.toLowerCase().replace(/[^a-z0-9]/g, '') + '.jpg';
    revEl.innerHTML = `<div class="love-track">${A.reviews.map(r => `
      <article class="love-card"${r.rtl ? ' dir="rtl" lang="ar"' : ''}>
        <div class="love-stars" aria-label="5 out of 5">★★★★★</div>
        <p>${esc(r.text)}</p>
        <footer><img src="${avatar(r.who)}" alt="" loading="lazy"><h4>${esc(r.who)}</h4></footer>
      </article>`).join('')}</div>
      <div class="love-dots" role="tablist" aria-label="Reviews">${A.reviews.map((r, i) => `<button type="button" role="tab" aria-label="Review ${i + 1}" data-dot="${i}"></button>`).join('')}</div>`;
    const track = $('.love-track', revEl), dots = $$('[data-dot]', revEl);
    let at = 0, rt;
    const per = () => (innerWidth <= 760 ? 1 : innerWidth <= 1080 ? 2 : 3);
    const show = i => {
      const n = A.reviews.length, max = n - per();
      at = ((i % (max + 1)) + max + 1) % (max + 1);
      track.style.transform = `translateX(${-at * (100 / per())}%)`;
      dots.forEach((d, k) => d.setAttribute('aria-selected', k === at));
      clearTimeout(rt); if (!reduce) rt = setTimeout(() => show(at + 1), 6000);
    };
    revEl.addEventListener('click', e => { const d = e.target.closest('[data-dot]'); if (d) show(+d.dataset.dot); });
    addEventListener('resize', () => show(at));
    show(0);
  }

  /* ================= SHOP and CATEGORY pages ================= */
  const shop = $('[data-shop]');
  if (shop) {
    const cat = catBySlug[params.get('cat')];
    const crumbs = $('[data-crumbs]');
    if (!cat) {
      // /shop/: every product, oldest first, no filters (as on alaraline.co)
      document.title = 'Shop - ÀLara Line';
      crumbs.innerHTML = '<a href="index.html">Home</a><i></i><span>Shop</span>';
      shop.innerHTML = `<div class="grid grid-5" role="list">${cards(A.products.slice().sort((a, b) => a.id - b.id))}</div>`;
    } else {
      document.title = cat.name + ' - ÀLara Line';
      $('[data-band-title]').textContent = cat.name;
      crumbs.innerHTML = `<a href="index.html">Home</a><i></i><a href="shop.html">Products</a><i></i><span>${esc(cat.name)}</span>`;
      document.body.classList.add('is-category');
      const PRICES = [['all', 'All'], ['0-10', '$0.00 - $10.00'], ['10-20', '$10.00 - $20.00'], ['20-30', '$20.00 - $30.00'], ['30-', '$30.00 +']];
      const PER = 12;
      let price = 'all', sort = 'popularity', view = 'grid', page = 1;
      shop.innerHTML = `
        <aside class="shop-side">
          <h2>Price Filter</h2>
          <div class="price-filter" role="radiogroup" aria-label="Price">${PRICES.map(([v, l], i) => `<label><input type="radio" name="price" value="${v}" ${i ? '' : 'checked'}><i></i>${l}</label>`).join('')}</div>
        </aside>
        <div class="shop-main">
          <div class="shop-toolbar">
            <p class="shop-count" data-count-text></p>
            <div class="shop-tools">
              <span class="view-tg"><span>See</span>
                <button type="button" data-view="grid" aria-pressed="true" aria-label="Grid view"><svg class="ic sm"><use href="#i-grid"/></svg></button>
                <button type="button" data-view="list" aria-pressed="false" aria-label="List view"><svg class="ic sm"><use href="#i-list"/></svg></button>
              </span>
              <label class="sort"><span class="sr">Sort products</span>
                <select data-sort>
                  <option value="popularity">Sort by: Popularity</option>
                  <option value="rating">Sort by: Average rating</option>
                  <option value="latest">Sort by: Latest</option>
                  <option value="low">Sort by: Price: low to high</option>
                  <option value="high">Sort by: Price: high to low</option>
                </select>
              </label>
            </div>
          </div>
          <div class="grid grid-3" data-cat-grid role="list"></div>
          <nav class="pager" data-pager aria-label="Pages"></nav>
        </div>`;
      const grid = $('[data-cat-grid]'), pager = $('[data-pager]');
      const render = () => {
        let list = A.products.filter(p => p.cats.includes(cat.name));
        if (price !== 'all') { const [lo, hi] = price.split('-').map(Number); list = list.filter(p => p.price >= lo && (!hi || p.price <= hi)); }
        if (sort === 'latest') list.sort(byNewest);
        else if (sort === 'low') list.sort((a, b) => a.price - b.price);
        else if (sort === 'high') list.sort((a, b) => b.price - a.price);
        else list.sort((a, b) => (A.bestSellers.includes(b.slug) - A.bestSellers.includes(a.slug)) || a.id - b.id);
        const pages = Math.max(1, Math.ceil(list.length / PER)); page = Math.min(page, pages);
        const from = (page - 1) * PER;
        $('[data-count-text]').textContent = list.length ? `Showing ${from + 1}–${Math.min(list.length, from + PER)} of ${list.length} result${list.length === 1 ? '' : 's'}` : 'No products were found matching your selection.';
        grid.classList.toggle('is-list', view === 'list');
        grid.innerHTML = cards(list.slice(from, from + PER));
        pager.innerHTML = pages > 1 ? Array.from({ length: pages }, (_, i) => `<button type="button" data-page="${i + 1}" ${i + 1 === page ? 'aria-current="page"' : ''}>${i + 1}</button>`).join('') + (page < pages ? `<button type="button" data-page="${page + 1}" aria-label="Next page">»</button>` : '') : '';
      };
      shop.addEventListener('change', e => {
        if (e.target.name === 'price') { price = e.target.value; page = 1; render(); }
        if (e.target.matches('[data-sort]')) { sort = e.target.value; render(); }
      });
      shop.addEventListener('click', e => {
        const v = e.target.closest('[data-view]');
        if (v) { view = v.dataset.view; $$('[data-view]').forEach(b => b.setAttribute('aria-pressed', b === v)); render(); }
        const pg = e.target.closest('[data-page]');
        if (pg) { page = +pg.dataset.page; render(); shop.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
      });
      render();
    }
  }

  /* ================= PRODUCT page ================= */
  // four related products: the same category first, then best sellers
  const related = p => {
    const same = A.products.filter(x => x.slug !== p.slug && x.cats.some(c => p.cats.includes(c) && c !== 'Best Sellers')).sort(byNewest);
    return [...new Set([...same, ...A.bestSellers.map(s => A.bySlug[s])])].filter(x => x && x.slug !== p.slug).slice(0, 4);
  };
  const prodEl = $('[data-product]');
  if (prodEl) {
    const p = A.bySlug[params.get('p')];
    if (!p) {
      prodEl.innerHTML = `<div class="empty-state"><h1>Product not found</h1><p>It may have moved. Have a look around the shop.</p><a class="btn btn-primary" href="shop.html">Return to shop</a></div>`;
    } else {
      document.title = p.name + ' - ÀLara Line';
      const main = p.cats.filter(c => c !== 'Best Sellers')[0] || p.cats[0];
      const lead = p.cats[0];
      $('[data-crumbs]').innerHTML = `<a href="index.html">Home</a><i></i><a href="shop.html">Products</a><i></i><a href="${catUrl(lead)}">${esc(lead)}</a><i></i><span>${esc(p.name)}</span>`;
      const imgs = [...new Set([p.img, p.imgPlain, p.img2].filter(Boolean))];
      const sale = p.was ? Math.round((1 - p.price / p.was) * 100) : 0;
      const opts = p.options ? Object.entries(p.options) : [];
      const shareUrl = encodeURIComponent('https://alaraline.co/product/' + p.slug + '/');
      prodEl.innerHTML = `
        <div class="pd">
          <div class="pd-gallery">
            <div class="pd-main">${sale ? `<span class="badge sale">−${sale}%</span>` : ''}<img src="${imgs[0]}" alt="${esc(p.name)}" data-pd-main></div>
            ${imgs.length > 1 ? `<div class="pd-thumbs">${imgs.map((m, i) => `<button type="button" data-pd-img="${m}" aria-pressed="${!i}" aria-label="Image ${i + 1}"><img src="${m}" alt=""></button>`).join('')}</div>` : ''}
          </div>
          <div class="pd-info">
            <div class="price pd-price">${p.was ? `<s>${money(p.was)}</s>` : ''}<span>${money(p.price)}</span></div>
            <h1 class="pd-title">${esc(p.name)}</h1>
            <div class="pd-rating">${stars(0)}<a href="#pd-reviews">0 reviews</a></div>
            ${opts.map(([name, vals]) => `<label class="pd-opt"><span>${esc(name)}</span><select data-opt required><option value="">Choose an option</option>${vals.map(v => `<option>${esc(v)}</option>`).join('')}</select></label>`).join('')}
            <div class="pd-qty"><span>Quantity</span>
              <span class="qty"><button type="button" data-q="-1" aria-label="Decrease"><svg class="ic sm"><use href="#i-minus"/></svg></button><span data-qn>1</span><button type="button" data-q="1" aria-label="Increase"><svg class="ic sm"><use href="#i-plus"/></svg></button></span>
            </div>
            ${p.oos ? '<p class="pd-oos">Out of stock</p>' : ''}
            <button class="btn btn-dark full" type="button" data-pd-add ${p.oos ? 'disabled' : ''}>Add to cart</button>
            <button class="btn btn-dark full" type="button" data-pd-buy ${p.oos ? 'disabled' : ''}>Buy now</button>
            <p class="pd-msg" role="status"></p>
            <div class="pd-links">
              <button type="button" class="link-btn" data-compare="${p.slug}"><svg class="ic sm"><use href="#i-compare"/></svg> Compare</button>
              <button type="button" class="link-btn" data-wish="${p.slug}" aria-pressed="${wish.includes(p.slug)}"><svg class="ic sm"><use href="#i-heart"/></svg> <span data-wish-label>${wish.includes(p.slug) ? 'In your wishlist' : 'Add to wishlist'}</span></button>
            </div>
            <dl class="pd-meta">
              <dt>Sku:</dt><dd>N/A</dd>
              <dt>Categories:</dt><dd>${p.cats.map(c => catByName[c] ? `<a href="${catUrl(c)}">${esc(c)}</a>` : esc(c)).join(', ')}</dd>
              <dt>Share:</dt><dd class="pd-share">
                <a href="https://wa.me/?text=${shareUrl}" target="_blank" rel="noopener" aria-label="Share on WhatsApp"><svg class="ic sm"><use href="#i-wa"/></svg></a>
                <a href="mailto:?subject=${encodeURIComponent(p.name)}&body=${shareUrl}" aria-label="Share by email"><svg class="ic sm"><use href="#i-mail"/></svg></a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener" aria-label="Share on Facebook"><svg class="ic sm"><use href="#i-fb"/></svg></a>
              </dd>
            </dl>
            <details class="pd-desc" open><summary>Description <svg class="ic sm"><use href="#i-plus"/></svg></summary>
              <div><p>${esc(p.desc)}</p>
                ${p.combo ? `<p><b>Includes:</b> ${p.combo.map(s => A.bySlug[s] ? `<a href="${productUrl(s)}">${esc(A.bySlug[s].name)}</a>` : '').join(' · ')}</p>` : ''}
              </div>
            </details>
          </div>
        </div>
        <section class="pd-tabs" id="pd-reviews">
          <div class="pd-tablist" role="tablist">
            <button type="button" role="tab" aria-selected="true" data-pd-tab="reviews">Customer Reviews</button>
            <button type="button" role="tab" aria-selected="false" data-pd-tab="questions">Questions</button>
          </div>
          <div class="pd-panel" data-pd-panel="reviews">
            <div class="rv-summary">
              <b class="rv-score">0</b>${stars(0)}<span>0 Reviews, 0 Q&amp;As</span>
              <ul class="rv-bars">${[5, 4, 3, 2, 1].map(n => `<li><span>${n} star${n > 1 ? 's' : ''}</span><i></i><span>0%</span></li>`).join('')}</ul>
              <a class="btn btn-soft full" href="https://alaraline.co/my-account/" target="_blank" rel="noopener">Write a review</a>
              <button class="btn btn-soft full" type="button" data-pd-tab="questions">Ask a question</button>
            </div>
            <div class="rv-list"><p>Only logged in customers who have purchased this product may leave a review.</p><p>There are no reviews yet.</p></div>
          </div>
          <div class="pd-panel" data-pd-panel="questions" hidden>
            <div class="rv-list"><p>There are no questions yet.</p>
              <form class="pd-ask" data-ask novalidate><label class="sr" for="pd-q">Your question</label><textarea id="pd-q" rows="3" placeholder="Ask a question about this product"></textarea><button class="btn btn-dark" type="submit">Submit question</button><p class="form-msg" role="status"></p></form>
            </div>
          </div>
        </section>
        <section class="pd-related">
          <h2 class="sec-title center">Related products</h2>
          <div class="grid grid-4" role="list">${cards(related(p))}</div>
        </section>`;
      const qn = $('[data-qn]', prodEl), msg = $('.pd-msg', prodEl);
      const chosen = () => {
        const sel = $$('[data-opt]', prodEl);
        const miss = sel.find(s => !s.value);
        if (miss) { msg.textContent = 'Please choose a ' + miss.previousElementSibling.textContent.toLowerCase() + ' first.'; miss.focus(); return false; }
        msg.textContent = ''; return true;
      };
      prodEl.addEventListener('click', e => {
        const q = e.target.closest('[data-q]'); if (q) qn.textContent = Math.max(1, +qn.textContent + +q.dataset.q);
        const im = e.target.closest('[data-pd-img]');
        if (im) { $('[data-pd-main]').src = im.dataset.pdImg; $$('[data-pd-img]').forEach(b => b.setAttribute('aria-pressed', b === im)); }
        if (e.target.closest('[data-pd-add]') && chosen()) addToCart(p.slug, +qn.textContent);
        if (e.target.closest('[data-pd-buy]') && chosen()) { addToCart(p.slug, +qn.textContent, true); location.href = 'cart.html'; }
        const cmp = e.target.closest('[data-compare]');
        if (cmp) { const list = store.get('alara-compare', []); if (!list.includes(p.slug)) store.set('alara-compare', [...list, p.slug].slice(-4)); toast(p, `<b>${esc(p.name)}</b> added to compare`, null); }
        const tb = e.target.closest('[data-pd-tab]');
        if (tb) {
          $$('[role="tab"][data-pd-tab]', prodEl).forEach(b => b.setAttribute('aria-selected', b.dataset.pdTab === tb.dataset.pdTab));
          $$('[data-pd-panel]', prodEl).forEach(x => (x.hidden = x.dataset.pdPanel !== tb.dataset.pdTab));
        }
      });
      $('[data-ask]', prodEl).addEventListener('submit', e => {
        e.preventDefault();
        const t = $('textarea', e.target), m = $('.form-msg', e.target);
        if (!t.value.trim()) { m.textContent = 'Please write your question.'; t.focus(); return; }
        m.textContent = 'Thank you, your question has been sent. We’ll answer it here soon.'; t.value = '';
      });
    }
  }

  /* ================= INGREDIENTS page ================= */
  const ingEl = $('[data-ing-page]');
  if (ingEl) ingEl.innerHTML = A.ingredients.map(g => `
    <article class="ing-row reveal">
      <img src="${g.img}" alt="${esc(g.name)}" loading="lazy">
      <div><h2>${esc(g.name)}</h2><p>${esc(g.text)}</p></div>
    </article>`).join('');

  /* ---------------- FAQ ---------------- */
  const faqEl = $('[data-faq]');
  if (faqEl) {
    faqEl.innerHTML = A.faqs.map(([q, a], i) => `
      <div class="faq-item${i ? '' : ' is-open'}">
        <button type="button" aria-expanded="${!i}" aria-controls="faq-${i}" id="faq-q-${i}">${esc(q)}<span class="pm"><svg class="ic sm"><use href="#i-plus"/></svg></span></button>
        <div class="faq-a" id="faq-${i}" role="region" aria-labelledby="faq-q-${i}"><div><p>${esc(a)}</p></div></div>
      </div>`).join('');
    faqEl.addEventListener('click', e => {
      const b = e.target.closest('.faq-item > button'); if (!b) return;
      const item = b.parentElement, open = !item.classList.contains('is-open');
      $$('.faq-item', item.parentElement).forEach(it => { it.classList.remove('is-open'); it.firstElementChild.setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  }

  /* ---------------- overlays (drawers / modals) ---------------- */
  let lastFocus = null;
  function openLayer(id) {
    const el = document.getElementById(id); if (!el) return;
    $$('.drawer.is-open, .modal.is-open').forEach(o => o !== el && closeLayer(o, true));
    lastFocus = document.activeElement;
    el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (id === 'mobile-nav') $('.menu-btn').setAttribute('aria-expanded', 'true');
    setTimeout(() => { const f = el.querySelector('input, [data-close], button, a'); f && f.focus({ preventScroll: true }); }, 60);
  }
  function closeLayer(el, keepScroll) {
    el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true');
    if (el.id === 'mobile-nav') $('.menu-btn').setAttribute('aria-expanded', 'false');
    if (!keepScroll && !$('.drawer.is-open, .modal.is-open')) {
      document.body.style.overflow = '';
      lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
    }
  }
  const closeAll = () => $$('.drawer.is-open, .modal.is-open').forEach(o => closeLayer(o));
  $$('.drawer, .modal').forEach(el => {
    el.addEventListener('click', e => { if (e.target === el || e.target.closest('[data-close]')) closeLayer(el); });
    el.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const f = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', el).filter(x => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAll();
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openLayer('search'); }
  });
  $('.menu-btn').addEventListener('click', () => openLayer('mobile-nav'));

  /* ---------------- cart ---------------- */
  const cartCountEls = $$('[data-cart-count]');
  function saveCart() { store.set('alara-cart', cart); renderCart(); }
  function addToCart(slug, qty = 1, quiet) {
    const p = A.bySlug[slug]; if (!p || p.oos) return;
    cart[slug] = (cart[slug] || 0) + qty; saveCart();
    cartCountEls.forEach(c => { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); });
    if (!quiet) toast(p, `<b>${esc(p.name)}</b> added to your bag`);
  }
  const cartLine = ([s, q]) => {
    const p = A.bySlug[s];
    return `<div class="c-item"><a href="${productUrl(s)}"><img src="${p.img}" alt=""></a><div><b><a href="${productUrl(s)}">${esc(p.name)}</a></b><span class="p">${money(p.price)}</span><br>
      <span class="qty"><button type="button" data-dec="${s}" aria-label="Decrease quantity"><svg class="ic sm"><use href="#i-minus"/></svg></button><span>${q}</span><button type="button" data-inc="${s}" aria-label="Increase quantity"><svg class="ic sm"><use href="#i-plus"/></svg></button></span></div>
      <button class="c-rm" type="button" data-rm="${s}">Remove</button></div>`;
  };
  function renderCart() {
    const items = Object.entries(cart).filter(([, q]) => q > 0);
    const n = items.reduce((a, [, q]) => a + q, 0);
    const total = items.reduce((a, [s, q]) => a + A.bySlug[s].price * q, 0);
    cartCountEls.forEach(c => { c.textContent = n; c.hidden = !n; });
    $('[data-cart-count-text]').textContent = n ? `(${n})` : '';
    $('[data-ship-meter]').innerHTML = `<span style="display:flex;gap:8px;align-items:center"><svg class="ic sm"><use href="#i-truck"/></svg> We deliver all over Lebanon · Cash on delivery available</span>`;
    $('[data-cart-items]').innerHTML = items.length ? items.map(cartLine).join('')
      : `<div class="c-empty"><img src="assets/img/site/bee.png" alt=""><p>Your bag is empty — let’s find something dreamy.</p><a href="shop.html" class="btn btn-outline">Shop now</a></div>`;
    $('[data-cart-foot]').innerHTML = items.length ? `
      <div class="row"><span>Subtotal</span><b>${money(total)}</b></div>
      <a class="btn btn-outline full" href="cart.html">View cart</a>
      <a class="btn btn-primary full" href="https://alaraline.co/checkout/" target="_blank" rel="noopener">Checkout <svg class="ic sm"><use href="#i-arrow"/></svg></a>
      <small>Shipping calculated at checkout · Orders processed within 2–5 business days</small>` : '';
    renderCartPage(items, total);
  }
  /* the Cart page */
  const cartPage = $('[data-cart-page]');
  function renderCartPage(items, total) {
    if (!cartPage) return;
    cartPage.innerHTML = items.length ? `
      <div class="cart-table">
        <div class="ct-head"><span></span><span>Product</span><span>Price</span><span>Quantity</span><span>Subtotal</span></div>
        ${items.map(([s, q]) => { const p = A.bySlug[s]; return `
        <div class="ct-row">
          <button class="ct-rm" type="button" data-rm="${s}" aria-label="Remove ${esc(p.name)}"><svg class="ic sm"><use href="#i-close"/></svg></button>
          <a class="ct-prod" href="${productUrl(s)}"><img src="${p.img}" alt=""><b>${esc(p.name)}</b></a>
          <span data-label="Price">${money(p.price)}</span>
          <span data-label="Quantity" class="qty"><button type="button" data-dec="${s}" aria-label="Decrease quantity"><svg class="ic sm"><use href="#i-minus"/></svg></button><span>${q}</span><button type="button" data-inc="${s}" aria-label="Increase quantity"><svg class="ic sm"><use href="#i-plus"/></svg></button></span>
          <b data-label="Subtotal">${money(p.price * q)}</b>
        </div>`; }).join('')}
        <form class="ct-coupon" data-coupon novalidate><label class="sr" for="coupon">Coupon code</label><input id="coupon" placeholder="Coupon code"><button class="btn btn-outline" type="submit">Apply coupon</button><p class="form-msg" role="status"></p></form>
      </div>
      <aside class="cart-totals">
        <h2>Cart totals</h2>
        <div class="row"><span>Subtotal</span><b>${money(total)}</b></div>
        <div class="row"><span>Shipping</span><span>Calculated at checkout</span></div>
        <div class="row total"><span>Total</span><b>${money(total)}</b></div>
        <a class="btn btn-dark full" href="https://alaraline.co/checkout/" target="_blank" rel="noopener">Proceed to checkout</a>
      </aside>` : `
      <div class="empty-state">
        <svg class="empty-cart" viewBox="0 0 120 100" aria-hidden="true"><path d="M8 14h14l12 52h58l10-38H30" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="44" cy="82" r="7" fill="currentColor"/><circle cx="84" cy="82" r="7" fill="currentColor"/></svg>
        <h2>Your cart is currently empty.</h2>
        <p>You may check out all the available products and buy some in the shop.</p>
        <a class="btn btn-dark" href="shop.html">Return to shop</a>
      </div>`;
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-inc],[data-dec],[data-rm]'); if (!t) return;
    const s = t.dataset.inc || t.dataset.dec || t.dataset.rm;
    if (t.dataset.inc) cart[s]++;
    if (t.dataset.dec) cart[s] = Math.max(0, cart[s] - 1);
    if (t.dataset.rm || !cart[s]) delete cart[s];
    saveCart();
  });
  document.addEventListener('submit', e => {
    if (!e.target.matches('[data-coupon]')) return;
    e.preventDefault();
    $('.form-msg', e.target).textContent = $('input', e.target).value.trim() ? 'This coupon code is not valid.' : 'Please enter a coupon code.';
  });
  renderCart();

  /* ---------------- wishlist ---------------- */
  const wishPage = $('[data-wish-page]');
  function renderWish() {
    store.set('alara-wish', wish);
    $$('[data-wish-count]').forEach(c => { c.textContent = wish.length; c.hidden = !wish.length; });
    $$('[data-wish]').forEach(b => { const on = wish.includes(b.dataset.wish); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    $$('[data-wish-label]').forEach(l => (l.textContent = wish.includes(l.closest('[data-wish]').dataset.wish) ? 'In your wishlist' : 'Add to wishlist'));
    if (wishPage) wishPage.innerHTML = wish.length ? `
      <div class="cart-table wish-table">
        <div class="ct-head"><span></span><span>Product name</span><span>Unit price</span><span>Stock status</span><span></span></div>
        ${wish.map(s => { const p = A.bySlug[s]; return `
        <div class="ct-row">
          <button class="ct-rm" type="button" data-wish="${s}" aria-label="Remove ${esc(p.name)}"><svg class="ic sm"><use href="#i-close"/></svg></button>
          <a class="ct-prod" href="${productUrl(s)}"><img src="${p.img}" alt=""><b>${esc(p.name)}</b></a>
          <span data-label="Unit price">${p.was ? `<s>${money(p.was)}</s> ` : ''}${money(p.price)}</span>
          <span data-label="Stock status" class="${p.oos ? 'oos' : 'instock'}">${p.oos ? 'Out of stock' : 'In stock'}</span>
          <button class="btn btn-dark" type="button" data-add="${s}" ${p.oos ? 'disabled' : ''}>Add to cart</button>
        </div>`; }).join('')}
      </div>` : `<div class="empty-state"><h2>No products added to the wishlist</h2><a class="btn btn-dark" href="shop.html">Return to shop</a></div>`;
  }
  renderWish();

  /* ---------------- search ---------------- */
  const sIn = $('#search-input'), sOut = $('[data-search-results]');
  function runSearch() {
    const q = sIn.value.trim().toLowerCase();
    const rank = p => p.name.toLowerCase().includes(q) ? 0 : (p.tag || '').toLowerCase().includes(q) ? 1 : 2;
    const list = q ? A.products.filter(p => (p.name + ' ' + (p.tag || '') + ' ' + p.cats.join(' ') + ' ' + p.desc).toLowerCase().includes(q)).sort((x, y) => rank(x) - rank(y)) : A.bestSellers.map(s => A.bySlug[s]);
    sOut.innerHTML = (q ? '' : '<p class="empty" style="padding:6px 10px 2px">Popular right now</p>') + (list.length
      ? list.slice(0, 12).map(p => `<a class="s-item" href="${productUrl(p.slug)}"><img src="${p.img}" alt=""><span><b>${esc(p.name)}</b><span>${money(p.price)}</span></span></a>`).join('')
      : `<p class="empty">No products match “${esc(q)}”. Try “mask”, “mist” or “growth”.</p>`);
  }
  sIn.addEventListener('input', runSearch); runSearch();
  sIn.addEventListener('keydown', e => { if (e.key === 'Enter') { const a = $('.s-item', sOut); if (a) location.href = a.href; } });

  /* ---------------- global click delegation ---------------- */
  let lab = null;
  document.addEventListener('click', e => {
    const t = e.target;
    const add = t.closest('[data-add]'); if (add) { e.preventDefault(); addToCart(add.dataset.add); return; }
    const w = t.closest('[data-wish]');
    if (w) {
      e.preventDefault(); const s = w.dataset.wish;
      wish = wish.includes(s) ? wish.filter(x => x !== s) : [...wish, s];
      renderWish();
      if (wish.includes(s)) toast(A.bySlug[s], `<b>${esc(A.bySlug[s].name)}</b> saved to wishlist`, 'wishlist');
      return;
    }
    const tr = t.closest('[data-try]');
    if (tr) {
      e.preventDefault(); closeAll();
      if (lab) { $('#hair-lab').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); setTimeout(() => lab.select(tr.dataset.try), reduce ? 0 : 700); }
      else location.href = 'features.html?try=' + encodeURIComponent(tr.dataset.try) + '#hair-lab';
      return;
    }
    const cmp = t.closest('.pcard [data-compare]');
    if (cmp) { e.preventDefault(); const p = A.bySlug[cmp.dataset.compare], list = store.get('alara-compare', []); if (!list.includes(p.slug)) store.set('alara-compare', [...list, p.slug].slice(-4)); toast(p, `<b>${esc(p.name)}</b> added to compare`, null); return; }
    const qv = t.closest('[data-qv], [data-quick]');
    if (qv) { e.preventDefault(); location.href = productUrl(qv.dataset.qv || qv.dataset.quick); return; }
    const cat = t.closest('[data-cat]');
    if (cat) { e.preventDefault(); const c = catByName[cat.dataset.cat]; location.href = c ? 'shop.html?cat=' + c.slug : 'shop.html'; return; }
    const op = t.closest('[data-open]'); if (op) { e.preventDefault(); openLayer(op.dataset.open); return; }
  });

  /* ---------------- toast ---------------- */
  const toastEl = $('.toast'); let toastT;
  function toast(p, html, open = 'cart') {
    const view = open === 'wishlist' ? '<a href="wishlist.html">View</a>' : open ? `<button type="button" data-open="${open}">View</button>` : '';
    toastEl.innerHTML = `${p ? `<img src="${p.img}" alt="">` : ''}<span>${html}</span>${view}`;
    toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3200);
  }

  /* ---------------- header ---------------- */
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------------- announcement (one message at a time) ---------------- */
  const msgs = $$('.announce-msg').filter(m => getComputedStyle(m).display !== 'none'); let mi = 0;   // season-only messages drop out when the season is off
  msgs.forEach((m, i) => m.classList.toggle('is-on', i === 0));
  if (msgs.length > 1 && !reduce) setInterval(() => { msgs[mi].classList.remove('is-on'); mi = (mi + 1) % msgs.length; msgs[mi].classList.add('is-on'); }, 4500);

  /* ---------------- hero (home page) ---------------- */
  const hero = $('.hero');
  if (hero) {
    const slides = $$('.hero-slide').filter(s => getComputedStyle(s).display !== 'none'), count = $('.hero-count b');   // season-only slides drop out when the season is off
    const total = $('[data-hero-total]'); if (total) total.textContent = String(slides.length).padStart(2, '0');
    let cur = 0, timer = null; const SLIDE_MS = 8000;
    /* hero videos: used automatically once assets/video/*.mp4 exist; the photo stays as fallback */
    const vids = $$('.hero-video');
    if (!reduce) vids.forEach(v => {
      const src = innerWidth <= 760 ? v.dataset.srcMobile : v.dataset.src;
      v.addEventListener('canplay', () => v.classList.add('is-ready'), { once: true });
      // soften the loop point: fade to the photo just before the end, back in after the restart
      v.addEventListener('timeupdate', () => {
        if (!v.duration) return;
        v.classList.toggle('is-ready', v.currentTime > .35 && v.currentTime < v.duration - .6);
      });
      v.addEventListener('error', () => v.remove(), { once: true });
      const s = document.createElement('source'); s.src = src; s.type = 'video/mp4';
      s.addEventListener('error', () => {
        if (src !== v.dataset.src && !v.dataset.retry) { v.dataset.retry = 1; s.src = v.dataset.src; v.load(); } else v.remove();
      });
      v.appendChild(s); v.load();
    });
    const playActive = () => $$('.hero-video').forEach(v => { const on = v.closest('.hero-slide').classList.contains('is-active'); if (on) { const p = v.play(); p && p.catch(() => {}); } else v.pause(); });
    const go = i => {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('is-active', k === cur); s.setAttribute('aria-hidden', k !== cur); s.querySelectorAll('a,button').forEach(a => (a.tabIndex = k === cur ? 0 : -1)); });
      count.textContent = String(cur + 1).padStart(2, '0');
      playActive();
      clearTimeout(timer); if (!reduce) timer = setTimeout(() => go(cur + 1), +slides[cur].dataset.duration || SLIDE_MS);
      hero.dataset.slide = slides[cur].dataset.slide;
      hero.dispatchEvent(new CustomEvent('slidechange', { detail: { slide: slides[cur] } }));
    };
    $$('[data-hero]').forEach(b => b.addEventListener('click', () => go(cur + +b.dataset.hero)));
    hero.addEventListener('mouseenter', () => clearTimeout(timer));
    hero.addEventListener('mouseleave', () => go(cur));
    let tx = null;
    hero.addEventListener('touchstart', e => (tx = e.touches[0].clientX), { passive: true });
    hero.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1)); tx = null; });
    go(0);
  }

  /* ---------------- reveal & counters ---------------- */
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; cio.unobserve(en.target);
    const el = en.target, to = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = to + suf; return; }
    const t0 = performance.now();
    const f = now => { const k = Math.min(1, (now - t0) / 1600), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e) + suf; if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------------- forms ---------------- */
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const contact = $('[data-contact]');
  if (contact) contact.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, msg = $('.form-msg', f);
    const name = f.name.value.trim(), email = f.email.value.trim();
    f.querySelectorAll('.field').forEach(x => x.classList.remove('err'));
    if (!name) { f.name.parentElement.classList.add('err'); msg.textContent = 'Please tell us your name.'; f.name.focus(); return; }
    if (!emailOk(email)) { f.email.parentElement.classList.add('err'); msg.textContent = 'Please enter a valid email address.'; f.email.focus(); return; }
    const body = `${f.message.value.trim()}\n\n— ${name} (${email})`;
    window.location.href = `mailto:Info@alaraline.co?subject=${encodeURIComponent(f.subject.value.trim() || 'Message from alaraline.co')}&body=${encodeURIComponent(body)}`;
    msg.textContent = 'Opening your email app — thank you, we’ll get back to you ASAP 💕';
  });
  const news = $('[data-news]');
  if (news) news.addEventListener('submit', e => {
    e.preventDefault();
    const inp = e.target.querySelector('input'), msg = $('.form-msg', e.target);
    if (!emailOk(inp.value.trim())) { msg.textContent = 'Please enter a valid email address.'; inp.focus(); return; }
    store.set('alara-news', inp.value.trim());
    msg.textContent = 'Welcome to the hive 🐝 — check your inbox soon.'; inp.value = '';
  });

  /* ---------------- Hair Lab (the New Features page) ---------------- */
  const labRoot = $('#hair-lab');
  window.AlaraShop = { add: addToCart, toast: html => toast(null, html) };
  if (labRoot && window.HairLab) {
    lab = window.HairLab.init(labRoot, { onAdd: slug => addToCart(slug) });
    const want = params.get('try');
    if (want && A.bySlug[want]) setTimeout(() => lab.select(want), reduce ? 0 : 900);
  }
})();
