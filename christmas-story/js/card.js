/* The customer's message card: a small cream gift card (or frosted glass) near the bottom of the
   Story, holding a written message, a voice note, or both, with the customer's name and product.
   Drawn straight into the Story canvas so the preview and the exports are identical. */

export const T = {
  ink: '#3b151c',            // deep burgundy ink
  name: '#2a1015',
  red: '#9b1b30',            // Christmas red, for the product line and the played waveform
  gold: ['#f6e6b4', '#d4ae62', '#a77d34', '#e9cd8c'],
  paper: '#fbf6f0'
};
const F = {
  message: (s) => `italic 400 ${s}px "PT Serif", Georgia, serif`,
  name: '400 30px Butler, "PT Serif", Georgia, serif',
  product: '600 15px "DM Sans", system-ui, sans-serif',
  time: '500 19px "DM Sans", system-ui, sans-serif',
  quote: 'italic 400 76px "PT Serif", Georgia, serif'
};

const CARD_W = 720, PAD_X = 50, PAD_Y = 38;
// the message first tries to fit a compact card; a long message gets a taller card rather than tiny type
const MSG_MAX = { text: [230, 340], both: [150, 250] };
const SIZE = { max: 34, compact: 30, min: 26 };

function goldGradient(ctx, x0, y0, x1, y1, shift = 0) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  const s = T.gold;
  g.addColorStop(0, s[2]); g.addColorStop(Math.min(.95, Math.max(.05, .35 + shift)), s[0]);
  g.addColorStop(Math.min(.97, Math.max(.1, .55 + shift)), s[1]); g.addColorStop(1, s[3]);
  return g;
}

/* ---------- text fitting ---------- */
export function wrap(ctx, text, maxW) {
  const out = [];
  for (const para of text.split(/\n+/)) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width <= maxW || !line) line = test;
      else { out.push(line); line = w; }
    }
    if (line) out.push(line);
  }
  return out;
}
export function fitMessage(ctx, text, maxH, maxW) {
  const [compactH, tallH] = maxH;
  const tries = [];
  for (let s = SIZE.max; s >= SIZE.compact; s--) tries.push([s, compactH]);
  for (let s = SIZE.compact; s >= SIZE.min; s--) tries.push([s, tallH]);
  for (const [s, h] of tries) {
    ctx.font = F.message(s);
    const lines = wrap(ctx, text, maxW), lh = Math.round(s * 1.42);
    if (lines.length * lh <= h) return { size: s, lh, lines, overflow: false };
  }
  maxH = tallH;
  // still too long at the smallest readable size: keep what fits, end with an ellipsis
  const s = SIZE.min, lh = Math.round(s * 1.42);
  ctx.font = F.message(s);
  const lines = wrap(ctx, text, maxW), keep = Math.max(1, Math.floor(maxH / lh));
  const cut = lines.slice(0, keep);
  let last = cut[keep - 1] + '…';
  while (ctx.measureText(last).width > maxW && last.length > 2) last = last.replace(/\s*\S+…$/, '…');
  cut[keep - 1] = last;
  return { size: s, lh, lines: cut, overflow: true };
}

/* ---------- paper grain, made once ---------- */
let grain = null;
function grainPattern(ctx) {
  if (grain) return grain;
  const c = document.createElement('canvas'); c.width = c.height = 220;
  const x = c.getContext('2d'), img = x.createImageData(220, 220);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 10 + Math.random() * 10;
  }
  x.putImageData(img, 0, 0);
  grain = ctx.createPattern(c, 'repeat');
  return grain;
}

/* ---------- layout (measured once per content change) ---------- */
export function layoutCard(ctx, s) {
  const mode = s.mode;                  // 'text' | 'audio' | 'both'
  const hasText = mode !== 'audio' && s.message.trim();
  const hasAudio = mode !== 'text' && s.audio && s.audio.peaks;
  const innerW = CARD_W - PAD_X * 2;
  let h = PAD_Y, msg = null;
  if (hasText) {
    msg = fitMessage(ctx, s.message.trim(), MSG_MAX[hasAudio ? 'both' : 'text'], innerW);
    h += 30 + msg.lines.length * msg.lh;        // the quote mark sits above the first line
  }
  const audioY = h + (hasText ? 20 : 2);
  if (hasAudio) h = audioY + 84;
  const footY = h + (hasText || hasAudio ? 30 : 0);
  const hasName = !!s.name.trim();
  h = footY + (hasName ? 30 + 10 : 0) + 15 + PAD_Y;
  return { msg, hasText, hasAudio, audioY, footY, hasName, w: CARD_W, h };
}

/* ---------- drawing ---------- */
export function drawCard(ctx, s, L, opts) {
  const { t, enter, playing, progress, level, snapshot } = opts;
  const w = L.w, h = L.h;
  const x = (1080 - w) / 2;
  const y = s.cardPos === 'high' ? 560 : 1700 - h;    // upper: below the logo and the hanging ornaments
  const e = 1 - Math.pow(1 - Math.min(1, Math.max(0, enter)), 4);   // ease-out
  const tilt = s.cardStyle === 'paper' ? -.012 : 0;
  ctx.save();
  ctx.globalAlpha = e;
  ctx.translate(x + w / 2, y + h / 2 + (1 - e) * 28);
  ctx.rotate(tilt);
  ctx.translate(-w / 2, -h / 2);
  const r = s.cardStyle === 'paper' ? 10 : 26;
  const shape = new Path2D(); shape.roundRect(0, 0, w, h, r);

  if (s.cardStyle === 'glass') {
    // frosted glass: the Story behind it, blurred, under a pearl tint
    ctx.save();
    ctx.shadowColor = 'rgba(40,10,20,.22)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
    ctx.fillStyle = 'rgba(255,255,255,.01)'; ctx.fill(shape);
    ctx.restore();
    ctx.save(); ctx.clip(shape);
    if (snapshot) { ctx.filter = 'blur(22px) saturate(1.15)'; ctx.drawImage(snapshot, x - 40, y - 40, w + 80, h + 80, -40, -40, w + 80, h + 80); ctx.filter = 'none'; }
    ctx.fillStyle = 'rgba(255,250,248,.58)'; ctx.fillRect(0, 0, w, h);
    ctx.restore();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.stroke(shape);
  } else {
    ctx.save();
    ctx.shadowColor = 'rgba(60,18,26,.30)'; ctx.shadowBlur = 46; ctx.shadowOffsetY = 20;
    const pg = ctx.createLinearGradient(0, 0, w, h); pg.addColorStop(0, '#fdf9f4'); pg.addColorStop(1, '#f6eee6');
    ctx.fillStyle = pg; ctx.fill(shape);
    ctx.restore();
    ctx.save(); ctx.clip(shape); ctx.fillStyle = grainPattern(ctx); ctx.fillRect(0, 0, w, h); ctx.restore();
    // gold-foil hairline, inset
    const inset = new Path2D(); inset.roundRect(14, 14, w - 28, h - 28, 4);
    ctx.lineWidth = 1.6; ctx.strokeStyle = goldGradient(ctx, 0, 0, w, h, .25 * Math.sin(t * .5)); ctx.stroke(inset);
  }

  let cy = PAD_Y;
  if (L.hasText) {
    // an opening quote mark in gold, then the message
    ctx.font = F.quote; ctx.fillStyle = goldGradient(ctx, PAD_X, cy, PAD_X + 60, cy + 70);
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('“', PAD_X - 5, cy + 58);
    cy += 30;
    ctx.font = F.message(L.msg.size); ctx.fillStyle = T.ink;
    L.msg.lines.forEach((ln, i) => ctx.fillText(ln, PAD_X, cy + L.msg.size + i * L.msg.lh - (L.msg.lh - L.msg.size) * .15));
  }
  let play = null;
  if (L.hasAudio) play = drawVoice(ctx, s.audio, PAD_X, L.audioY, w - PAD_X * 2, { t, playing, progress, level });
  // footer: a short gold rule, the name, the product
  const fy = L.footY;
  ctx.fillStyle = goldGradient(ctx, PAD_X, fy, PAD_X + 56, fy); ctx.fillRect(PAD_X, fy - 14, 56, 1.6);
  if (L.hasName) { ctx.font = F.name; ctx.fillStyle = T.name; ctx.fillText(s.name.trim(), PAD_X, fy + 26); }
  ctx.font = F.product; ctx.fillStyle = T.red;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
  ctx.fillText((s.product.trim() || ' ').toUpperCase(), PAD_X, fy + (L.hasName ? 28 + 10 : 0) + 18);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.restore();

  // where the play button ended up on the Story, for clicks in the preview
  if (play) {
    const cx = x + w / 2, cyy = y + h / 2 + (1 - e) * 28, ang = tilt;
    const px = play.x - w / 2, py = play.y - h / 2;
    return { play: { x: cx + px * Math.cos(ang) - py * Math.sin(ang), y: cyy + px * Math.sin(ang) + py * Math.cos(ang), r: play.r } };
  }
  return {};
}

/* a voice note: gold play button, the recording's own waveform, its length */
function drawVoice(ctx, a, x, y, w, { t, playing, progress, level }) {
  const R = 36, bx = x + R, by = y + 42;
  // the button: a gold disc with a soft bevel
  ctx.save();
  ctx.shadowColor = 'rgba(90,50,10,.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
  const g = ctx.createLinearGradient(bx - R, by - R, bx + R, by + R);
  g.addColorStop(0, '#f8e9bd'); g.addColorStop(.45, '#d8b469'); g.addColorStop(.7, '#b48a3f'); g.addColorStop(1, '#ecd296');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, R, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  const hl = ctx.createRadialGradient(bx - R * .35, by - R * .45, 1, bx, by, R);
  hl.addColorStop(0, 'rgba(255,255,255,.55)'); hl.addColorStop(.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl; ctx.beginPath(); ctx.arc(bx, by, R, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5a0d1c';
  if (playing) { ctx.fillRect(bx - 11, by - 14, 7, 28); ctx.fillRect(bx + 4, by - 14, 7, 28); }
  else { ctx.beginPath(); ctx.moveTo(bx - 9, by - 15); ctx.lineTo(bx + 15, by); ctx.lineTo(bx - 9, by + 15); ctx.closePath(); ctx.fill(); }

  // waveform
  const wx = bx + R + 24, ww = w - (wx - x) - 78, n = a.peaks.length;
  const gap = ww / n, bw = Math.max(3, gap * .52);
  for (let i = 0; i < n; i++) {
    const p = i / n, played = p < progress;
    let v = a.peaks[i];
    if (playing && Math.abs(p - progress) < .08) v = Math.min(1, v * (.75 + level * 1.4));   // the bars around the playhead breathe with the voice
    else if (!playing) v *= .92 + .08 * Math.sin(t * 1.6 + i * .5);
    const bh = 5 + v * 52;
    ctx.fillStyle = played ? T.red : 'rgba(155,27,48,.26)';
    ctx.beginPath(); ctx.roundRect(wx + i * gap, by - bh / 2, bw, bh, bw / 2); ctx.fill();
  }
  // duration
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; // taste-skill-ignore — clock duration
  ctx.font = F.time; ctx.fillStyle = T.ink; ctx.textAlign = 'right';
  if ('fontVariantNumeric' in ctx) ctx.fontVariantNumeric = 'tabular-nums';
  ctx.fillText(playing || progress > 0 ? fmt(progress * a.duration) : fmt(a.duration), x + w, by + 8);
  ctx.textAlign = 'left';
  return { x: bx, y: by, r: R };
}
