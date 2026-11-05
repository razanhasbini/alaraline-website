import { useEffect, useRef } from 'react';

// The live site's light snowfall: soft white dots drifting over the page. Held still under reduced motion.
export default function Snow({ count = 70, color = '255,255,255' }: { count?: number; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, raf = 0;
    const flakes = Array.from({ length: count }, () => ({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 3.2, v: .15 + Math.random() * .45, s: Math.random() * 6, a: .25 + Math.random() * .5 }));
    const size = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      w = innerWidth; h = innerHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        if (!still) { f.y += f.v / h * 1.6; if (f.y > 1.02) { f.y = -.02; f.x = Math.random(); } }
        const x = f.x * w + Math.sin(t / 1800 + f.s) * 14;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${color},${f.a})`;
        ctx.arc(x, f.y * h, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!still) raf = requestAnimationFrame(draw);
    };
    size(); draw(0);
    addEventListener('resize', size);
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden && !still) raf = requestAnimationFrame(draw); };
    document.addEventListener('visibilitychange', vis);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); document.removeEventListener('visibilitychange', vis); };
  }, [count, color]);

  return <canvas ref={ref} className="snow" aria-hidden="true" />;
}
