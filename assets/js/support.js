/* ÀLara Care — floating support assistant (guided, runs fully in the browser; can be connected to a live AI or agent later) */
(function () {
  'use strict';
  const A = window.ALARA;
  const root = document.getElementById('support');
  if (!A || !root) return;
  const $ = s => root.querySelector(s);
  const log = $('.sp-log'), chips = $('.sp-chips'), form = $('.sp-form'), input = $('.sp-input'), fab = $('.sp-fab'), panel = $('.sp-panel');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = 'https://wa.me/96181624204';
  const usable = p => p && !p.oos && p.cats.some(c => c !== 'Body Care') && p.slug !== 'alaras-pouch';
  const HAIR = A.products.filter(p => (p.usage || p.combo) && p.slug !== 'alaras-pouch');

  /* ---------- open / close ---------- */
  let started = false;
  function open() {
    root.classList.add('is-open'); fab.setAttribute('aria-expanded', 'true'); panel.hidden = false;
    if (!started) { started = true; home(true); }
    setTimeout(() => input.focus({ preventScroll: true }), 80);
  }
  function close() { root.classList.remove('is-open'); fab.setAttribute('aria-expanded', 'false'); setTimeout(() => { if (!root.classList.contains('is-open')) panel.hidden = true; }, 250); fab.focus({ preventScroll: true }); }
  fab.addEventListener('click', () => (root.classList.contains('is-open') ? close() : open()));
  $('.sp-close').addEventListener('click', close);
  root.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('is-open')) close(); });
  window.AlaraSupport = { open, routineFor: r => routineFor(r), card: p => productCard(p) };
  document.querySelectorAll('[data-support-open]').forEach(b => b.addEventListener('click', open));   // the New Features page's "Chat with ÀLara Care" button

  /* ---------- messages ---------- */
  function scroll() { log.scrollTo({ top: log.scrollHeight, behavior: reduce ? 'auto' : 'smooth' }); }
  function user(text) { log.insertAdjacentHTML('beforeend', `<div class="sp-msg me"><p>${esc(text)}</p></div>`); scroll(); }
  function bot(html, delay = 450) {
    return new Promise(res => {
      const t = document.createElement('div'); t.className = 'sp-msg bot typing'; t.innerHTML = '<p><i></i><i></i><i></i></p>';
      log.appendChild(t); scroll();
      setTimeout(() => { t.classList.remove('typing'); t.innerHTML = `<p>${html}</p>`; scroll(); res(); }, reduce ? 0 : delay);
    });
  }
  function options(list, onPick) {
    chips.innerHTML = list.map((o, i) => `<button type="button" class="sp-chip" data-i="${i}">${esc(o.label || o)}</button>`).join('');
    chips.onclick = e => {
      const b = e.target.closest('.sp-chip'); if (!b) return;
      const o = list[+b.dataset.i]; chips.innerHTML = '';
      user(o.label || o); onPick(o);
    };
  }
  const productCard = p => `<span class="sp-card"><img src="${p.img}" alt=""><span><b>${esc(p.name)}</b><em>$${p.price}${p.oos ? ' · Sold out' : ''}</em></span>
    <span class="sp-card-actions">${p.oos ? '' : `<button type="button" class="sp-mini" data-add="${p.slug}">Add</button>`}${p.fx || p.combo ? `<button type="button" class="sp-mini ghost" data-try="${p.slug}">See it</button>` : ''}</span></span>`;

  /* ---------- flows ---------- */
  const MENU = [
    { label: 'How do I use a product?', go: () => askProduct('Which product would you like to know about?', howTo) },
    { label: 'I’m not seeing results', go: () => askProduct('Sorry to hear that. Let’s fix it together. Which product are you using?', troubleshoot) },
    { label: 'Recommend products for me', go: recommend },
    { label: 'Orders & delivery', go: delivery },
    { label: 'Talk to the team', go: human }
  ];
  async function home(first) {
    if (first) await bot('Hi, I’m <b>ÀLara Care</b> 💕 I can explain how to use any product, help if you’re not seeing results, or build a routine for your hair and budget.', 300);
    else await bot('Anything else I can help with?', 350);
    options(MENU, o => o.go());
  }

  function askProduct(q, next) {
    bot(q).then(() => {
      const top = ['miracle-pro-edition', 'leave-in', 'miracle-mask', 'shampoo', 'conditioner', 'serum', 'anti-dandruff-shampoo', 'detox-scalp-scrub', 'heat-protectant', 'deep-repair-capsules', 'scalp-massager', 'dermaroller']
        .map(s => A.bySlug[s]).filter(Boolean);
      options(top.map(p => ({ label: p.name, p })).concat([{ label: 'Something else (type it below)', other: true }]), o => {
        if (o.other) { pending = next; bot('Type the product name and I’ll find it.'); return; }
        next(o.p);
      });
    });
  }

  async function howTo(p) {
    if (p.combo) {
      await bot(`<b>${esc(p.name)}</b> is a full routine. Use the products in this order:`);
      for (const s of p.combo) { const q = A.bySlug[s]; if (q.usage) await bot(`<b>${esc(q.name)}</b> · ${esc(q.usage.often)}<br>${q.usage.steps.map(x => '• ' + esc(x)).join('<br>')}`, 500); }
    } else if (p.usage) {
      const u = p.usage;
      await bot(`<b>${esc(p.name)}</b><br><span class="sp-tag">${esc(u.often)}</span><br>${u.steps.map((x, i) => `${i + 1}. ${esc(x)}`).join('<br>')}`);
      await bot(`<b>When you’ll see it:</b> ${u.start <= 1 ? 'from the first use' : `from about ${u.start} days`}${u.full > u.start ? `, with the full result after ${u.full >= 28 ? Math.round(u.full / 7) + ' weeks' : u.full + ' days'} of regular use` : ''}.`, 500);
    } else {
      await bot(`${esc(p.desc)}`);
    }
    home();
  }

  /* troubleshooting: frequency, duration, method */
  async function troubleshoot(p) {
    if (p.combo) { await bot('Which product from the set are you least happy with?'); options(p.combo.map(s => ({ label: A.bySlug[s].name, p: A.bySlug[s] })), o => troubleshoot(o.p)); return; }
    const u = p.usage; if (!u) { await bot('I don’t have usage details for that one yet. The team will help you directly.'); return human(); }
    const ans = {};
    await bot(`How often are you using the <b>${esc(p.name)}</b>?`);
    options([{ label: 'Every day', v: 7 }, { label: '3–4 times a week', v: 3.5 }, { label: '1–2 times a week', v: 1.5 }, { label: 'Less than once a week', v: .5 }], async o => {
      ans.freq = o.v;
      await bot('And for how long have you been using it?');
      options([{ label: 'Less than a week', v: 4 }, { label: '1–2 weeks', v: 10 }, { label: '2–4 weeks', v: 21 }, { label: '1–2 months', v: 45 }, { label: 'More than 2 months', v: 75 }], async o2 => {
        ans.days = o2.v;
        await bot('How are you applying it?');
        const methods = [
          { label: 'On the scalp', v: 'scalp' }, { label: 'On the lengths & ends', v: 'lengths' }, { label: 'All over', v: 'all' }
        ];
        if (u.rinse === false) methods.push({ label: 'I rinse it out after', v: 'rinsed' });
        if (u.rinse === true) methods.push({ label: 'I leave it in', v: 'leftin' });
        options(methods, async o3 => { ans.how = o3.v; diagnose(p, ans); });
      });
    });
  }
  async function diagnose(p, a) {
    const u = p.usage, fixes = [];
    if (a.freq < u.freq * .6) fixes.push(`<b>Use it more often.</b> For the best result it’s <b>${esc(u.often.toLowerCase())}</b>. Consistency matters more than quantity.`);
    if (u.freq <= 2 && a.freq >= 5) fixes.push(`<b>Use it a little less.</b> ${esc(u.often)} is enough; more often can weigh hair down.`);
    if (a.how === 'rinsed') fixes.push('<b>Don’t rinse it out.</b> It’s a leave-in formula and needs time on the hair to work.');
    if (a.how === 'leftin') fixes.push('<b>Rinse it out.</b> It’s designed to be rinsed. Leaving it on can cause buildup and make hair look heavy.');
    if (u.place === 'scalp' && a.how === 'lengths') fixes.push('<b>Apply it to the scalp, not the lengths.</b> It works at the roots, where hair grows.');
    if ((u.place === 'lengths' || u.place === 'ends') && a.how === 'scalp') fixes.push('<b>Keep it on the mid-lengths and ends.</b> On the scalp it can weigh roots down without helping the lengths.');
    const tooEarly = a.days < u.start;
    if (tooEarly) fixes.push(`<b>Give it a little more time.</b> Visible results usually start from about <b>${u.start} days</b>, so you’re right on track.`);
    else if (a.days < u.full && !fixes.length) fixes.push(`Results build gradually. The full effect shows after about <b>${u.full >= 28 ? Math.round(u.full / 7) + ' weeks' : u.full + ' days'}</b> of regular use.`);
    await bot(fixes.length ? `Thanks! Here’s what I’d change:<br>${fixes.map(f => '• ' + f).join('<br>')}` : 'You’re using it exactly right 👏');
    await bot(`<b>The right way:</b><br>${u.steps.map((x, i) => `${i + 1}. ${esc(x)}`).join('<br>')}`, 600);
    const boost = { 'miracle-pro-edition': ['scalp-massager', 'dermaroller'], 'leave-in': ['conditioner', 'curly-hair-brush'], 'anti-dandruff-shampoo': ['detox-scalp-scrub'], 'miracle-mask': ['leave-in'], 'shampoo': ['conditioner'], 'conditioner': ['leave-in'] }[p.slug];
    if (boost) await bot(`To boost results, pair it with:<br>${boost.map(s => productCard(A.bySlug[s])).join('')}`, 500);
    if (!fixes.length && a.days >= u.full) await bot('If you’ve been consistent for this long, the team would love to look at your routine personally.', 500).then(human);
    else home();
  }

  /* recommendations: hair type, concern, budget */
  const RANK = {
    frizz: ['leave-in', 'miracle-mask', 'conditioner', 'shampoo', 'serum', 'satin-pillow-cover', 'diffuser-top', 'curly-hair-brush'],
    damage: ['miracle-mask', 'deep-repair-capsules', 'heat-protectant', 'conditioner', 'serum', 'shampoo'],
    thin: ['miracle-pro-edition', 'scalp-massager', 'detox-scalp-scrub', 'dermaroller', 'shampoo'],
    flakes: ['anti-dandruff-shampoo', 'detox-scalp-scrub', 'scalp-massager', 'conditioner'],
    define: ['leave-in', 'conditioner', 'curly-hair-brush', 'diffuser-top', 'shampoo', 'miracle-mask']
  };
  const SETS = [['deep-repair-duo', ['miracle-mask', 'miracle-pro-edition']]];
  async function recommend() {
    const r = {};
    await bot('Let’s build your routine. What’s your hair type?');
    options(['Straight', 'Wavy', 'Curly', 'Coily'], async t => {
      r.type = t.toLowerCase();
      await bot('What would you most like to improve?');
      options([{ label: 'Frizz & dryness', v: 'frizz' }, { label: 'Damage & dullness', v: 'damage' }, { label: 'Hair growth & thinning', v: 'thin' }, { label: 'Flakes & oily scalp', v: 'flakes' }, { label: 'Curl definition', v: 'define' }], async c => {
        r.concern = c.v;
        await bot('And your budget?');
        options([{ label: 'Under $25', v: 25 }, { label: '$25 – $50', v: 50 }, { label: '$50 – $80', v: 80 }, { label: 'No limit', v: 1e9 }], async b => { r.budget = b.v; buildRoutine(r); });
      });
    });
  }
  function routineFor(r) {
    let list = RANK[r.concern].filter(s => usable(A.bySlug[s]));
    if (r.type === 'straight') list = list.filter(s => !['curly-hair-brush', 'diffuser-top'].includes(s));
    if ((r.type === 'curly' || r.type === 'coily') && r.concern === 'frizz' && !list.includes('curly-hair-brush')) list.push('curly-hair-brush');
    const pick = []; let total = 0;
    for (const s of list) { const p = A.bySlug[s]; if (total + p.price <= r.budget && pick.length < 5) { pick.push(s); total += p.price; } }
    if (!pick.length) { const cheapest = list.map(s => A.bySlug[s]).sort((a, b) => a.price - b.price)[0]; pick.push(cheapest.slug); total = cheapest.price; }
    // swap in a set when it covers the same products for less
    for (const [set, items] of SETS) {
      const sp = A.bySlug[set];
      if (sp && !sp.oos && items.every(i => pick.includes(i))) {
        const sum = items.reduce((a, i) => a + A.bySlug[i].price, 0);
        if (sp.price < sum) { items.forEach(i => pick.splice(pick.indexOf(i), 1)); pick.unshift(set); total += sp.price - sum; }
      }
    }
    return { pick, total };
  }
  async function buildRoutine(r) {
    const { pick, total } = routineFor(r);
    const why = { frizz: 'to hydrate, smooth and keep frizz down', damage: 'to repair, protect and bring back shine', thin: 'to support growth and fuller-looking hair', flakes: 'to clear flakes and rebalance the scalp', define: 'to clean, hydrate and lock in your pattern' }[r.concern];
    await bot(`For <b>${r.type}</b> hair, ${why}${r.budget < 1e9 ? ` within your budget` : ''}:<br>${pick.map(s => productCard(A.bySlug[s])).join('')}<span class="sp-total">Total <b>$${total}</b></span>`, 700);
    await bot(`<button type="button" class="sp-mini" data-add-all="${pick.join(',')}">Add all to bag</button> <button type="button" class="sp-mini ghost" data-try="${pick.find(s => A.bySlug[s].fx || A.bySlug[s].combo) || ''}">See it in the Hair Lab</button>`, 300);
    home();
  }

  async function delivery() {
    await bot('We deliver all over Lebanon and ship to many international destinations. Orders are processed within <b>2–5 business days</b>, and you’ll get a tracking number by email once your order ships. <b>Cash on delivery</b> is available.');
    await bot('Shipping cost is shown at checkout. Customs fees for international orders are paid by the customer. <button type="button" class="sp-link" data-open="shipping">Read the full shipping policy</button>', 400);
    home();
  }
  async function human() {
    await bot(`Our team is happy to help personally:<br>💬 <a class="sp-link" href="${WA}" target="_blank" rel="noopener">WhatsApp +961 81 624 204</a><br>📧 <a class="sp-link" href="mailto:Info@alaraline.co">Info@alaraline.co</a>`);
    home();
  }

  /* ---------- free text ---------- */
  let pending = null;
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9$ ]/g, ' ');
  function findProduct(text) {
    const t = norm(text);
    const alias = { 'miracle': 'miracle-pro-edition', 'pro edition': 'miracle-pro-edition', 'oil': 'miracle-pro-edition', 'mask': 'miracle-mask', 'leave': 'leave-in', 'leave in': 'leave-in', 'shampoo': 'shampoo', 'conditioner': 'conditioner', 'serum': 'serum', 'dandruff': 'anti-dandruff-shampoo', 'scrub': 'detox-scalp-scrub', 'heat': 'heat-protectant', 'capsule': 'deep-repair-capsules', 'massager': 'scalp-massager', 'derma': 'dermaroller', 'roller': 'dermaroller', 'wax': 'wax-stick-styling-hair-wax', 'mist': 'hair-mist-oh-honey', 'brush': 'curly-hair-brush', 'diffuser': 'diffuser-top', 'pillow': 'satin-pillow-cover', 'towel': 'microfiber-towel' };
    let best = null, bl = 0;
    HAIR.forEach(p => { const n = norm(p.name); if (t.includes(n) && n.length > bl) { best = p; bl = n.length; } });
    if (best) return best;
    for (const k in alias) if (t.includes(k)) return A.bySlug[alias[k]];
    return null;
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const text = input.value.trim(); if (!text) return;
    input.value = ''; chips.innerHTML = ''; user(text);
    const t = norm(text), p = findProduct(text);
    if (pending && p) { const f = pending; pending = null; return f(p); }
    pending = null;
    if (/(not (seeing|working)|no (result|difference|change)|doesn t work|didn t work|nothing happen|still )/.test(t)) return p ? troubleshoot(p) : askProduct('Sorry to hear that. Which product are you using?', troubleshoot);
    if (/(recommend|suggest|which (product|one)|what should|routine|budget|\$|best for)/.test(t)) return recommend();
    if (/(ship|deliver|order|track|cash|payment|arrive)/.test(t)) return delivery();
    if (/(human|agent|person|team|whatsapp|call|talk)/.test(t)) return human();
    if (p) return howTo(p);
    if (/(how|use|apply)/.test(t)) return askProduct('Happy to explain. Which product?', howTo);
    await bot('I’m not sure I understood. Here’s what I can help with, or you can reach the team directly.');
    options(MENU, o => o.go());
  });

  /* card actions inside the chat */
  log.addEventListener('click', e => {
    const all = e.target.closest('[data-add-all]');
    if (all) { e.stopPropagation(); all.dataset.addAll.split(',').forEach(s => window.AlaraShop && window.AlaraShop.add(s, 1, true)); all.textContent = 'Added ✓'; all.disabled = true; window.AlaraShop && window.AlaraShop.toast('Your routine was added to the bag'); }
    const tr = e.target.closest('[data-try]'); if (tr && tr.dataset.try) close();
  });
})();
