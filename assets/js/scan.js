/* ÀLara Hair Scan — photo/camera capture + hair analysis + product suggestions.
   ─────────────────────────────────────────────────────────────────────────────
   MODEL PLUG-IN: when the ÀLara hair model is ready, define before this file loads:
     window.AlaraHairModel = { analyze: async (canvas) => ({
       type: 'straight'|'wavy'|'curly'|'coily', pattern: '3B', porosity: 'low'|'medium'|'high',
       density: 'fine'|'medium'|'thick', concern: 'frizz'|'damage'|'thin'|'flakes'|'define',
       scores: { hydration, shine, frizz, definition, scalp } (0–100), confidence: 0–1 }) };
   Until then a simulated analysis runs (clearly labelled as a demo on the page). */
(function () {
  'use strict';
  const A = window.ALARA, root = document.getElementById('hair-scan');
  if (!A || !root) return;
  const $ = s => root.querySelector(s);
  const els = {
    stage: $('.scan-stage'), video: $('.scan-video'), canvas: $('.scan-canvas'), empty: $('.scan-empty'),
    file: $('.scan-file'), cam: $('.scan-cam'), shoot: $('.scan-shoot'), retake: $('.scan-retake'),
    analyze: $('.scan-analyze'), controls: $('.scan-controls'), steps: $('.scan-steps'), out: $('.scan-result'), budget: $('.scan-budget')
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stream = null, hasImage = false, last = null;

  function setMode(m) { root.dataset.mode = m; }
  function stopCam() { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } els.video.srcObject = null; }

  /* ---------- capture ---------- */
  els.file.addEventListener('change', () => {
    const f = els.file.files && els.file.files[0]; if (!f) return;
    if (!/^image\//.test(f.type)) return note('Please choose a photo (JPG, PNG or HEIC).');
    const img = new Image();
    img.onload = () => { drawToCanvas(img, img.naturalWidth, img.naturalHeight); URL.revokeObjectURL(img.src); };
    img.onerror = () => note('That photo could not be opened. Try a JPG or PNG.');
    img.src = URL.createObjectURL(f);
    els.file.value = '';
  });
  els.cam.addEventListener('click', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return note('Your browser does not support the camera here. Upload a photo instead.');
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1600 } }, audio: false });
      els.video.srcObject = stream; await els.video.play();
      setMode('live');
    } catch (e) {
      note(e && e.name === 'NotAllowedError' ? 'Camera access was blocked. Allow it in your browser settings, or upload a photo instead.' : 'No camera was found. Upload a photo instead.');
    }
  });
  els.shoot.addEventListener('click', () => {
    const v = els.video; if (!v.videoWidth) return;
    drawToCanvas(v, v.videoWidth, v.videoHeight, true); stopCam();
  });
  els.retake.addEventListener('click', () => { hasImage = false; stopCam(); setMode('empty'); els.out.innerHTML = intro(); els.steps.innerHTML = ''; });
  function drawToCanvas(src, w, h, mirror) {
    const max = 1200, s = Math.min(1, max / Math.max(w, h));
    const c = els.canvas; c.width = Math.round(w * s); c.height = Math.round(h * s);
    const g = c.getContext('2d');
    g.save(); if (mirror) { g.translate(c.width, 0); g.scale(-1, 1); } g.drawImage(src, 0, 0, c.width, c.height); g.restore();
    hasImage = true; setMode('photo');
  }
  function note(t) { els.steps.innerHTML = `<p class="scan-note">${t}</p>`; }

  /* ---------- analysis ---------- */
  const STEPS = ['Finding your hair', 'Reading the curl pattern', 'Checking shine, frizz & dryness', 'Looking at density & scalp', 'Matching ÀLara products'];
  els.analyze.addEventListener('click', run);
  async function run() {
    if (!hasImage) return;
    setMode('scanning'); els.out.innerHTML = '';
    els.steps.innerHTML = STEPS.map(s => `<li>${s}</li>`).join('');
    const items = [...els.steps.children];
    const model = window.AlaraHairModel && typeof window.AlaraHairModel.analyze === 'function';
    const work = model ? window.AlaraHairModel.analyze(els.canvas) : Promise.resolve(simulate(els.canvas));
    for (let i = 0; i < items.length; i++) { items[i].classList.add('on'); await wait(reduce ? 0 : 650); items[i].classList.add('done'); }
    try { last = await work; } catch (e) { setMode('photo'); return note('Sorry, the analysis failed. Please try another photo with your hair clearly visible.'); }
    setMode('done'); render(last, !model);
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* demo: lightweight image statistics + seeded variation (NOT a real diagnosis) */
  function simulate(c) {
    const g = c.getContext('2d'), w = c.width, h = c.height;
    const x0 = Math.round(w * .15), y0 = Math.round(h * .1), cw = Math.round(w * .7), ch = Math.round(h * .8);
    const d = g.getImageData(x0, y0, cw, ch).data;
    let sum = 0, edge = 0, n = 0, bright = 0, seed = 0;
    for (let y = 1; y < ch; y += 3) for (let x = 1; x < cw; x += 3) {
      const i = (y * cw + x) * 4, L = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11;
      const Lx = d[i - 4] * .3 + d[i - 3] * .59 + d[i - 2] * .11, Ly = d[i - cw * 4] * .3 + d[i - cw * 4 + 1] * .59 + d[i - cw * 4 + 2] * .11;
      sum += L; bright += L > 200 ? 1 : 0; edge += Math.abs(L - Lx) + Math.abs(L - Ly); n++; seed = (seed * 31 + (L | 0)) % 1e9;
    }
    const tex = edge / n, rnd = k => ((Math.sin(seed * (k + 1) * 12.9898) * 43758.5453) % 1 + 1) % 1;
    const type = tex > 13 ? 'curly' : tex > 9.5 ? 'wavy' : 'straight';
    const pattern = { straight: '1', wavy: '2', curly: '3', coily: '4' }[type] + 'ABC'[Math.floor(rnd(1) * 3)];
    const frizz = Math.round(30 + rnd(2) * 45 + (type === 'curly' || type === 'coily' ? 10 : 0));
    const hydration = Math.round(35 + rnd(3) * 40), shine = Math.round(25 + (bright / n) * 120 + rnd(4) * 25), definition = Math.round(30 + rnd(5) * 50), scalp = Math.round(55 + rnd(6) * 40);
    const scores = { hydration, shine: Math.min(95, shine), frizz: 100 - Math.min(95, frizz), definition, scalp };
    const worst = Object.entries({ frizz: scores.frizz, damage: Math.min(hydration, scores.shine), define: type === 'straight' ? 101 : definition, flakes: scalp }).sort((a, b) => a[1] - b[1])[0][0];
    return { type, pattern, porosity: ['low', 'medium', 'high'][Math.floor(rnd(7) * 3)], density: ['fine', 'medium', 'thick'][Math.floor(rnd(8) * 3)], concern: worst, scores, confidence: .72 + rnd(9) * .2 };
  }

  /* ---------- results ---------- */
  const NAMES = { straight: 'Straight', wavy: 'Wavy', curly: 'Curly', coily: 'Coily' };
  const CONCERN = { frizz: 'Frizz & dryness', damage: 'Damage & dullness', thin: 'Thinning', flakes: 'Flakes & buildup', define: 'Curl definition' };
  const SCORE_LABEL = { hydration: 'Hydration', shine: 'Shine', frizz: 'Frizz control', definition: 'Definition', scalp: 'Scalp' };
  function render(r, demo) {
    const budget = +els.budget.value || 1e9;
    const routine = window.AlaraSupport && window.AlaraSupport.routineFor ? window.AlaraSupport.routineFor({ type: r.type, concern: r.concern, budget }) : { pick: [], total: 0 };
    els.out.innerHTML = `
      ${demo ? '<p class="scan-demo">Demo preview: results are simulated until the ÀLara hair model launches.</p>' : ''}
      <div class="scan-facts">
        <div class="scan-type"><small>Hair type</small><b>${NAMES[r.type]}${r.pattern ? ` · ${r.pattern}` : ''}</b>
          <label class="scan-fix">Not right?<select data-scan-type aria-label="Correct my hair type">${Object.entries(NAMES).map(([k, v]) => `<option value="${k}"${k === r.type ? ' selected' : ''}>${v}</option>`).join('')}</select></label></div>
        <div><small>Porosity</small><b>${cap(r.porosity)}</b></div>
        <div><small>Density</small><b>${cap(r.density)}</b></div>
        <div><small>Focus</small><b>${CONCERN[r.concern]}</b></div>
      </div>
      <ul class="scan-scores">${Object.entries(r.scores).map(([k, v]) => `<li><span>${SCORE_LABEL[k]}</span><i><b style="width:${v}%"></b></i><em>${v}</em></li>`).join('')}</ul>
      <h4>Your ÀLara routine</h4>
      <div class="scan-picks">${routine.pick.map(s => card(A.bySlug[s])).join('')}</div>
      <div class="scan-total"><span>Total <b>$${routine.total}</b></span>
        <button type="button" class="btn btn-primary" data-scan-add="${routine.pick.join(',')}">Add routine to bag</button></div>
      <p class="scan-help">Questions about your routine? <button type="button" class="link-btn" data-scan-help>Ask ÀLara Care</button></p>`;
  }
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : '';
  const card = p => `<div class="scan-card"><img src="${p.img}" alt=""><div><b>${p.name}</b><span>${p.tag || ''}</span></div>
      <div class="scan-card-r"><em>$${p.price}</em><button type="button" class="sp-mini" data-add="${p.slug}">Add</button>${p.fx || p.combo ? `<button type="button" class="sp-mini ghost" data-try="${p.slug}">See it</button>` : ''}</div></div>`;
  els.budget.addEventListener('change', () => { if (last) render(last, !(window.AlaraHairModel && window.AlaraHairModel.analyze)); });
  els.out.addEventListener('change', e => {
    const t = e.target.closest('[data-scan-type]'); if (!t || !last) return;
    last = Object.assign({}, last, { type: t.value, pattern: { straight: '1', wavy: '2', curly: '3', coily: '4' }[t.value] + (last.pattern ? last.pattern.slice(1) : 'B') });
    if (t.value === 'straight' && last.concern === 'define') last.concern = 'frizz';
    render(last, !(window.AlaraHairModel && window.AlaraHairModel.analyze));
  });
  els.out.addEventListener('click', e => {
    const a = e.target.closest('[data-scan-add]');
    if (a) { a.dataset.scanAdd.split(',').forEach(s => window.AlaraShop && window.AlaraShop.add(s, 1, true)); window.AlaraShop && window.AlaraShop.toast('Your scan routine was added to the bag'); a.textContent = 'Added ✓'; a.disabled = true; }
    if (e.target.closest('[data-scan-help]') && window.AlaraSupport) window.AlaraSupport.open();
  });

  function intro() {
    return `<ol class="scan-how">
      <li><b>Show us your hair</b><span>Upload a photo or use your camera. Natural light, hair down, no filters.</span></li>
      <li><b>We analyse it</b><span>Type and pattern, porosity, density, frizz, shine and scalp.</span></li>
      <li><b>Get your routine</b><span>ÀLara products matched to your hair and budget.</span></li>
    </ol><p class="scan-privacy">🔒 Your photo stays on your device. It is never uploaded or saved.</p>`;
  }
  els.out.innerHTML = intro();
  setMode('empty');
  addEventListener('pagehide', stopCam);
})();
