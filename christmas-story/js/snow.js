/* Very soft snowfall: a few dozen flakes at three depths. The nearest are large and out of focus. */
const TAU = Math.PI * 2;
function sprite(r, blur) {
  const s = Math.ceil(r * 2 + blur * 4 + 4), c = document.createElement('canvas');
  c.width = c.height = s;
  const x = c.getContext('2d'), g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, r + blur);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(r / (r + blur) * .7, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.beginPath(); x.arc(s / 2, s / 2, r + blur, 0, TAU); x.fill();
  return c;
}
export function createSnow(W, H, count = 46) {
  let seed = 11; const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const sprites = [sprite(2.2, 1), sprite(3.6, 2), sprite(9, 9)];
  const flakes = Array.from({ length: count }, () => {
    const u = r(), k = u < .55 ? 0 : u < .9 ? 1 : 2;
    return { k, x: r() * W, y: r() * H, vy: [26, 42, 70][k] * (.8 + r() * .4), sway: [10, 16, 24][k], f: .3 + r() * .7, ph: r() * TAU, a: [.55, .8, .45][k] };
  });
  return function draw(ctx, t, motion) {
    for (const f of flakes) {
      const y = motion ? (f.y + t * f.vy) % (H + 40) - 20 : f.y;
      const x = f.x + (motion ? Math.sin(t * f.f + f.ph) * f.sway + t * 6 : 0);
      const s = sprites[f.k];
      ctx.globalAlpha = f.a;
      ctx.drawImage(s, ((x % W) + W) % W - s.width / 2, y - s.height / 2);
    }
    ctx.globalAlpha = 1;
  };
}
