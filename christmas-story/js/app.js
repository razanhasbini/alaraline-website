/* ÀLara Christmas Story: the editor, the compositor and the exporters.
   Every frame is composed on one 1080 × 1920 canvas — media, decoration shadows, decorations, snow,
   logo, card — so what you see is exactly what the image and video exports contain. */
import { createDecor, W, H } from './decor.js';
import { layoutCard, drawCard } from './card.js';
import { createSnow } from './snow.js';

const $ = s => document.querySelector(s);
const story = $('#story'), ctx = story.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const savedState = $('#saved-state');

const PRODUCTS = ['Full Treatment Set', 'The Miracle Pro-Edition', 'Curls On Collection', 'Curl Boosting Cream', 'Curl Defining Shampoo',
  'Hydrating Curl Conditioner', 'Deep Repair Duo', 'Hydrate & Repair Trio', '4 Hair Mists', 'Miracle Mask', 'Leave In Your Dreams',
  'Deep Repair Capsules', 'Detox Scalp Scrub', 'Intensive Repair Shampoo – Oh Honey', 'Hydrating Conditioner – Oh Honey',
  'Intensive Repair Shampoo – Tropical Vanilla', 'Hydrating Conditioner – Tropical Vanilla', 'Crystal Glow Hair Serum', 'Heat Protectant',
  'Satin Pillow Cover', 'Scalp Massager', 'ÀLara’s Pouch'];
$('#products').innerHTML = PRODUCTS.map(p => `<option value="${p}">`).join('');

const S = {
  media: null,            // { kind, el, w, h }
  zoom: 1, ox: 0, oy: 0, pushIn: true, videoSound: false,
  name: 'Maya K.', product: 'Full Treatment Set',
  message: 'Opened it on Christmas morning. The box alone made me emotional, and my hair has never felt this soft.',
  mode: 'text', audio: null,
  cardStyle: 'paper', cardPos: 'low',
  decor: { ornaments: true, gold: true, satin: true, greenery: true, snow: true, logo: true },
  logoTone: 'pink'
};

/* ---------------- layers ---------------- */
const decorCanvas = document.createElement('canvas');
const decor = createDecor(decorCanvas);
const decorShade = document.createElement('canvas'); decorShade.width = W / 4; decorShade.height = H / 4;
const sctx = decorShade.getContext('2d');
const snow = createSnow(W, H);
const snap = document.createElement('canvas'); snap.width = W; snap.height = H;
const logo = new Image(); logo.src = 'assets/brand/logo.png';
const tinted = document.createElement('canvas');

/* ---------------- media ---------------- */
function setMedia(el, kind) {
  if (S.media && S.media.kind === 'video' && S.media.el !== el) S.media.el.pause();
  const w = kind === 'video' ? el.videoWidth : el.naturalWidth, h = kind === 'video' ? el.videoHeight : el.naturalHeight;
  S.media = { kind, el, w, h };
  S.zoom = 1; S.ox = S.oy = 0; $('#zoom').value = 1; $('#zoom-out').textContent = '100%';
  $('#sound-row').hidden = kind !== 'video';
  $('#video-play').hidden = kind !== 'video';
  if (kind === 'video') {
    el.loop = true; el.muted = !S.videoSound;
    if (!reduce) el.play().catch(() => {});
    el.addEventListener('play', syncVideoButton);
    el.addEventListener('pause', syncVideoButton);
  }
  syncVideoButton();
  $('#media-info').textContent = kind === 'video' ? 'Video loaded. The preview loops while you edit.' : 'Photo loaded at full Story resolution.';
  replayCard();
}
function syncVideoButton() {
  const button = $('#video-play');
  const playing = !!(S.media && S.media.kind === 'video' && !S.media.el.paused);
  button.textContent = playing ? 'Pause Video Preview' : 'Play Video Preview';
  button.setAttribute('aria-pressed', String(playing));
}
function loadImage(src) {
  const img = new Image();
  img.onload = () => setMedia(img, 'image');
  img.src = src;
}
function loadVideo(src) {
  const v = document.createElement('video');
  v.playsInline = true; v.muted = true; v.preload = 'auto'; v.crossOrigin = 'anonymous';
  v.onloadeddata = () => setMedia(v, 'video');
  v.src = src;
}
function mediaRect(t) {
  const m = S.media; if (!m) return null;
  const push = S.pushIn && m.kind === 'image' ? 1 + .03 * (.5 - .5 * Math.cos(Math.min(t, 24) / 24 * Math.PI * 2)) : 1;
  const sc = Math.max(W / m.w, H / m.h) * S.zoom * push;
  const dw = m.w * sc, dh = m.h * sc;
  const mx = (dw - W) / 2, my = (dh - H) / 2;
  S.ox = Math.max(-mx, Math.min(mx, S.ox)); S.oy = Math.max(-my, Math.min(my, S.oy));
  return { x: (W - dw) / 2 + S.ox, y: (H - dh) / 2 + S.oy, w: dw, h: dh };
}

/* ---------------- audio ---------------- */
let actx = null, analyser = null, levelBuf = null, recDest = null;
const sources = new Map();
function audioGraph() {
  if (actx) return actx;
  actx = new AudioContext();
  analyser = actx.createAnalyser(); analyser.fftSize = 1024; levelBuf = new Float32Array(analyser.fftSize);
  analyser.connect(actx.destination);
  recDest = actx.createMediaStreamDestination();
  return actx;
}
function routed(el, toAnalyser) {
  audioGraph();
  if (!sources.has(el)) {
    const src = actx.createMediaElementSource(el);
    const out = actx.createGain();
    src.connect(out);
    out.connect(toAnalyser ? analyser : actx.destination);
    out.connect(recDest);
    sources.set(el, out);
  }
  return sources.get(el);
}
async function setAudio(blobOrUrl, label) {
  try {
    const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Audio file could not be read');
    const buf = await response.arrayBuffer();
    const tmp = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100, 44100);
    const data = await tmp.decodeAudioData(buf.slice(0));
  // the waveform: loudness in 44 slices, softened so quiet words still show
    const ch = data.getChannelData(0), n = 44, step = Math.max(1, Math.floor(ch.length / n)), peaks = [];
    for (let i = 0; i < n; i++) {
      let sum = 0, samples = 0;
      for (let j = i * step; j < Math.min(ch.length, (i + 1) * step); j += 16) { sum += ch[j] * ch[j]; samples++; }
      peaks.push(Math.sqrt(sum / Math.max(1, samples)));
    }
    const max = Math.max(...peaks) || 1;
    const el = new Audio(url); el.preload = 'auto'; el.crossOrigin = 'anonymous';
    el.addEventListener('ended', () => { S.audio && (S.audio.playing = false); syncAudioButton(); });
    el.addEventListener('pause', syncAudioButton);
    el.addEventListener('play', syncAudioButton);
    if (S.audio) S.audio.el.pause();
    S.audio = { el, url, duration: data.duration, peaks: peaks.map(p => Math.pow(p / max, .7)), playing: false, label };
    $('#audio-info').textContent = `${label} · ${data.duration.toFixed(1)} s. Use the Story control or Play Voice Note.`;
    syncAudioButton();
    relayout();
  } catch (err) {
    $('#audio-info').textContent = 'This audio file could not be decoded. Try MP3, M4A, WAV, or WebM audio.';
  }
}
function syncAudioButton() {
  const button = $('#audio-preview');
  const playing = !!(S.audio && !S.audio.el.paused);
  button.textContent = playing ? 'Pause Voice Note' : 'Play Voice Note';
  button.setAttribute('aria-pressed', String(playing));
  button.disabled = !S.audio;
}
function toggleAudio() {
  const a = S.audio; if (!a) return;
  routed(a.el, true); actx.resume();
  if (a.el.paused) { if (a.el.ended || a.el.currentTime >= a.duration - .05) a.el.currentTime = 0; a.el.play(); a.playing = true; }
  else { a.el.pause(); a.playing = false; }
  syncAudioButton();
}
function audioLevel() {
  if (!analyser || !S.audio || S.audio.el.paused) return 0;
  analyser.getFloatTimeDomainData(levelBuf);
  let s = 0; for (const v of levelBuf) s += v * v;
  return Math.min(1, Math.sqrt(s / levelBuf.length) * 5);
}

/* ---------------- the card's layout, measured when its content changes ---------------- */
let L = null, enterAt = 0;
function relayout() {
  ctx.save(); L = layoutCard(ctx, S); ctx.restore();
  $('#msg-warn').hidden = !(L.msg && L.msg.overflow);
}
function replayCard() { enterAt = clock + .25; }

/* ---------------- logo, tinted ---------------- */
let tintKey = '';
function logoLayer(t) {
  const lw = 236, lh = Math.round(lw * logo.naturalHeight / logo.naturalWidth);
  if (S.logoTone === 'pink') return { img: logo, lw, lh };
  if (tinted.width !== lw * 2) { tinted.width = lw * 2; tinted.height = lh * 2; tintKey = ''; }
  const key = S.logoTone + (S.logoTone === 'gold' ? Math.round(t * 20) : '');
  if (key !== tintKey) {
    tintKey = key;
    const x = tinted.getContext('2d');
    x.clearRect(0, 0, tinted.width, tinted.height);
    x.globalCompositeOperation = 'source-over'; x.drawImage(logo, 0, 0, tinted.width, tinted.height);
    x.globalCompositeOperation = 'source-in';
    if (S.logoTone === 'white') x.fillStyle = '#fffaf6';
    else {
      // gold foil, with a slow glint travelling across it
      const sh = ((t * .12) % 1.6) - .3;
      const g = x.createLinearGradient(0, 0, tinted.width, tinted.height * .6);
      g.addColorStop(0, '#a77d34'); g.addColorStop(Math.max(0, sh - .12), '#d4ae62'); g.addColorStop(Math.min(1, Math.max(0, sh)), '#fff1c8');
      g.addColorStop(Math.min(1, sh + .12), '#d4ae62'); g.addColorStop(1, '#b89048');
      x.fillStyle = g;
    }
    x.fillRect(0, 0, tinted.width, tinted.height);
  }
  return { img: tinted, lw, lh };
}

/* ---------------- one frame ---------------- */
let clock = 0, hit = {};
function compose(t, motion) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#e9d9d2'; ctx.fillRect(0, 0, W, H);
  const r = mediaRect(motion ? t : 0);
  if (r) ctx.drawImage(S.media.el, r.x, r.y, r.w, r.h);

  // Decorations retain the soft contact depth they would cast on the photograph.
  const anyDecor = S.decor.ornaments || S.decor.gold || S.decor.satin || S.decor.greenery;
  if (anyDecor) {
    decor.render(t, motion);
    sctx.clearRect(0, 0, decorShade.width, decorShade.height);
    sctx.globalCompositeOperation = 'source-over';
    sctx.filter = 'blur(3px)'; sctx.drawImage(decorCanvas, 0, 0, decorShade.width, decorShade.height); sctx.filter = 'none';
    sctx.globalCompositeOperation = 'source-in'; sctx.fillStyle = 'rgba(58,16,24,.42)'; sctx.fillRect(0, 0, decorShade.width, decorShade.height);
    ctx.drawImage(decorShade, 12, 22, W, H);
    ctx.drawImage(decorCanvas, 0, 0, W, H);
  }
  if (S.decor.snow) snow(ctx, t, motion);

  if (S.decor.logo && logo.complete && logo.naturalWidth) {
    const { img, lw, lh } = logoLayer(t);
    ctx.save(); ctx.shadowColor = 'rgba(60,20,25,.25)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 4;
    ctx.drawImage(img, (W - lw) / 2, 262, lw, lh); ctx.restore();
  }

  hit = {};
  if (L && (L.hasText || L.hasAudio || S.name.trim())) {
    if (S.cardStyle === 'glass') snap.getContext('2d').drawImage(story, 0, 0);
    const a = S.audio;
    const progress = a ? (a.el.currentTime / (a.duration || 1)) : 0;
    hit = drawCard(ctx, S, L, { t, enter: motion ? (t - enterAt) / .9 : 1, playing: !!(a && !a.el.paused), progress, level: audioLevel(), snapshot: snap });
  }
}

/* ---------------- the loop ---------------- */
let t0 = performance.now(), exporting = false;
function frame(now) {
  clock = (now - t0) / 1000;
  compose(clock, !reduce || exporting);
  requestAnimationFrame(frame);
}

/* ---------------- editor wiring ---------------- */
function changed() { savedState.textContent = 'Live preview'; }
const bind = (sel, key, after) => { const el = $(sel); el.value = S[key]; el.addEventListener('input', () => { S[key] = el.value; after && after(); changed(); }); };
bind('#name', 'name', relayout);
bind('#product', 'product', relayout);
bind('#message', 'message', () => { relayout(); countChars(); });
function countChars() { $('#msg-count').textContent = `${S.message.length} / 400`; }
document.querySelectorAll('input[name=mode]').forEach(r => r.addEventListener('change', () => {
  S.mode = r.value;
  $('#msg-field').hidden = S.mode === 'audio';
  $('#audio-field').hidden = S.mode === 'text';
  if (S.mode !== 'text' && !S.audio) setAudio('assets/sample/voice.m4a', 'Sample voice note');
  relayout(); replayCard(); changed();
}));
document.querySelectorAll('input[name=style]').forEach(r => r.addEventListener('change', () => { S.cardStyle = r.value; replayCard(); changed(); }));
document.querySelectorAll('input[name=pos]').forEach(r => r.addEventListener('change', () => { S.cardPos = r.value; replayCard(); changed(); }));
document.querySelectorAll('[data-decor]').forEach(c => c.addEventListener('change', () => {
  S.decor[c.dataset.decor] = c.checked;
  if (c.dataset.decor in { ornaments: 1, gold: 1, satin: 1, greenery: 1 }) decor.setVisible(c.dataset.decor, c.checked);
  changed();
}));
$('#logo-tone').addEventListener('change', e => { S.logoTone = e.target.value; tintKey = ''; changed(); });
$('#guides').addEventListener('change', e => { $('#guide-layer').hidden = !e.target.checked; });
$('#push-in').addEventListener('change', e => { S.pushIn = e.target.checked; changed(); });
$('#video-sound').addEventListener('change', e => {
  S.videoSound = e.target.checked;
  if (S.media && S.media.kind === 'video') { S.media.el.muted = !S.videoSound; if (S.videoSound) { routed(S.media.el, false); actx.resume(); } }
});
$('#zoom').addEventListener('input', e => { S.zoom = +e.target.value; $('#zoom-out').textContent = Math.round(S.zoom * 100) + '%'; changed(); });
$('#reset-pos').addEventListener('click', () => { S.zoom = 1; S.ox = S.oy = 0; $('#zoom').value = 1; $('#zoom-out').textContent = '100%'; changed(); });
function nudge(direction, amount = 24) {
  if (direction === 'left') S.ox -= amount;
  if (direction === 'right') S.ox += amount;
  if (direction === 'up') S.oy -= amount;
  if (direction === 'down') S.oy += amount;
  changed();
}
document.querySelectorAll('[data-nudge]').forEach(button => button.addEventListener('click', () => nudge(button.dataset.nudge)));
$('#media-file').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const url = URL.createObjectURL(f);
  f.type.startsWith('video') ? loadVideo(url) : loadImage(url);
});
document.querySelectorAll('[data-sample-media]').forEach(b => b.addEventListener('click', () =>
  b.dataset.sampleMedia === 'video' ? loadVideo('assets/sample/unboxing.mp4') : loadImage('assets/sample/bundle.jpg')));
$('#audio-file').addEventListener('change', e => { const f = e.target.files[0]; if (f) setAudio(f, f.name); });
$('#sample-voice').addEventListener('click', () => setAudio('assets/sample/voice.m4a', 'Sample voice note'));
$('#audio-preview').addEventListener('click', toggleAudio);
$('#video-play').addEventListener('click', () => {
  if (!S.media || S.media.kind !== 'video') return;
  if (S.media.el.paused) S.media.el.play().catch(() => {}); else S.media.el.pause();
  syncVideoButton();
});
$('#jump-export').addEventListener('click', () => { $('#export').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); $('#export').focus({ preventScroll: true }); });

// record a voice note straight from the microphone
let mic = null;
$('#record').addEventListener('click', async () => {
  const btn = $('#record');
  if (mic) { mic.stop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    mic = new MediaRecorder(stream);
    mic.ondataavailable = e => chunks.push(e.data);
    mic.onstop = () => { stream.getTracks().forEach(t => t.stop()); mic = null; btn.textContent = 'Record'; btn.setAttribute('aria-pressed', 'false'); setAudio(new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' }), 'Your recording'); };
    mic.start(); btn.textContent = 'Stop recording'; btn.setAttribute('aria-pressed', 'true');
  } catch (err) { $('#audio-info').textContent = 'The microphone isn’t available here. Upload a voice note instead.'; }
});

// preview: drag to reposition the photo, scroll to zoom, tap the gold button to listen
const toStory = e => { const r = story.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height, k: W / r.width }; };
let drag = null;
story.addEventListener('pointerdown', e => {
  const p = toStory(e);
  if (hit.play && Math.hypot(p.x - hit.play.x, p.y - hit.play.y) < hit.play.r + 8) { toggleAudio(); return; }
  drag = { x: p.x, y: p.y, ox: S.ox, oy: S.oy }; story.setPointerCapture(e.pointerId); story.classList.add('dragging');
});
story.addEventListener('pointermove', e => {
  if (!drag) return;
  const p = toStory(e); S.ox = drag.ox + (p.x - drag.x); S.oy = drag.oy + (p.y - drag.y);
});
const endDrag = () => { drag = null; story.classList.remove('dragging'); };
story.addEventListener('pointerup', endDrag); story.addEventListener('pointercancel', endDrag);
story.addEventListener('wheel', e => {
  e.preventDefault();
  S.zoom = Math.max(1, Math.min(3, S.zoom * (1 - e.deltaY * .0015)));
  $('#zoom').value = S.zoom; $('#zoom-out').textContent = Math.round(S.zoom * 100) + '%';
}, { passive: false });
story.addEventListener('keydown', e => {
  const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
  if (!map[e.key]) return;
  e.preventDefault(); nudge(map[e.key], e.shiftKey ? 60 : 18);
});

/* ---------------- exports ---------------- */
const info = $('#export-info');
function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const fileBase = () => 'alara-christmas-story-' + (S.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'customer');

$('#export-png').addEventListener('click', () => {
  compose(clock, false);          // the settled frame: card fully in, decorations at rest
  story.toBlob(b => { download(b, fileBase() + '.png'); info.textContent = 'Image saved: 1080 × 1920 PNG.'; savedState.textContent = 'Image exported'; }, 'image/png');
});

function pickMime() {
  const list = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  return list.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
}
$('#export-video').addEventListener('click', async () => {
  const mime = pickMime();
  if (!mime) { info.textContent = 'This browser can’t record video. Use Chrome or Safari on a computer.'; return; }
  const useAudio = S.mode !== 'text' && S.audio;
  const isVideo = S.media && S.media.kind === 'video';
  const length = Math.min(60, Math.max(8, isVideo ? S.media.el.duration : 0, useAudio ? S.audio.duration + 2.2 : 0));
  audioGraph(); await actx.resume();
  const stream = story.captureStream(30);
  let audioTracks = 0;
  if (useAudio) { routed(S.audio.el, true); audioTracks++; }
  if (isVideo && S.videoSound) { routed(S.media.el, false); audioTracks++; }
  if (audioTracks) recDest.stream.getAudioTracks().forEach(tr => stream.addTrack(tr));
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 16e6, audioBitsPerSecond: 192e3 });
  const chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  const done = new Promise(res => rec.onstop = res);

  // start everything from the beginning: the card arrives, the voice starts a moment later
  exporting = !reduce; t0 = performance.now(); clock = 0; enterAt = .35;
  if (isVideo) { S.media.el.currentTime = 0; S.media.el.muted = !S.videoSound; S.media.el.play(); }
  if (S.audio) { S.audio.el.pause(); S.audio.el.currentTime = 0; }
  ['#export-video', '#export-png'].forEach(s => $(s).disabled = true);
  $('#progress').hidden = false;
  info.textContent = reduce ? 'Recording a reduced-motion Story in real time. Keep this tab open and visible.' : 'Recording the Story in real time. Keep this tab open and visible.';
  rec.start(250);
  if (useAudio) setTimeout(() => { S.audio.el.play(); S.audio.playing = true; }, 1100);
  const start = performance.now();
  const tick = setInterval(() => { $('#progress i').style.width = Math.min(100, (performance.now() - start) / (length * 10)) + '%'; }, 100);
  await new Promise(r => setTimeout(r, length * 1000));
  rec.stop(); await done; clearInterval(tick);
  if (useAudio) S.audio.el.pause();
  exporting = false;
  ['#export-video', '#export-png'].forEach(s => $(s).disabled = false);
  $('#progress').hidden = true;
  const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
  download(new Blob(chunks, { type: mime.split(';')[0] }), fileBase() + '.' + ext);
  info.textContent = ext === 'mp4'
    ? `Video saved: 1080 × 1920 MP4, ${length.toFixed(1)} s, ready for Instagram.`
    : `Video saved as WebM (this browser can’t record MP4). Instagram needs MP4: open it in Chrome and export again, or convert it.`;
  savedState.textContent = 'Video exported';
});

/* ---------------- start ---------------- */
$('#stage-note').textContent = reduce ? 'Motion is paused here because your system asks for reduced motion. Exported videos still move.' : '';
countChars();
syncAudioButton();
Promise.all([
  document.fonts.load('italic 40px "PT Serif"'), document.fonts.load('600 18px "DM Sans"'), document.fonts.load('400 36px Butler')
]).catch(() => {}).then(() => {
  relayout();
  loadImage('assets/sample/bundle.jpg');
  requestAnimationFrame(frame);
});
window.__story = { S, relayout, setAudio, toggleAudio };   // for automated checks
