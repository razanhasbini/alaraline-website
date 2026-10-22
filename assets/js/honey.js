/* "Oh, Honey." banner: real 3D honey running down from the top edge of the banner.
   Rendered with physically based glass-like material (transmission, refraction, amber absorption),
   over a backdrop drawn into the same scene so the honey refracts the warm light behind it.
   Each drip slowly stretches and swells, lets go of a drop, and pulls back up. The scene only
   renders while the banner is on screen; with reduced motion it draws one still frame. */
import * as THREE from '../vendor/three.module.min.js';

const slide = document.querySelector('.hero-honey');
const canvas = slide && slide.querySelector('.hb-honey');
if (canvas) init();

function init() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = slide.closest('.hero');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (e) { slide.classList.add('hb-no-webgl'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -2000, 2000);
  camera.position.z = 1000;

  /* a warm studio for the honey to reflect: two soft windows and a pink bounce */
  const env = (() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#3a2414'); g.addColorStop(.5, '#1c0f08'); g.addColorStop(1, '#2a160a');
    x.fillStyle = g; x.fillRect(0, 0, 512, 256);
    const glow = (cx, cy, rx, ry, col) => { x.save(); x.translate(cx, cy); x.scale(rx, ry); const r = x.createRadialGradient(0, 0, 0, 0, 0, 1); r.addColorStop(0, col); r.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = r; x.beginPath(); x.arc(0, 0, 1, 0, 6.283); x.fill(); x.restore(); };
    glow(150, 70, 70, 34, 'rgba(255,240,215,1)');
    glow(380, 90, 40, 26, 'rgba(255,214,170,.9)');
    glow(260, 210, 160, 30, 'rgba(240,140,170,.5)');
    const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
    const pm = new THREE.PMREMGenerator(renderer); const e = pm.fromEquirectangular(t).texture; t.dispose(); pm.dispose(); return e;
  })();
  scene.environment = env;
  const key = new THREE.DirectionalLight(0xfff6e8, 3.2); key.position.set(-400, 500, 900); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffb070, 1.2); rim.position.set(500, 200, -300); scene.add(rim);

  /* the backdrop: espresso to amber, a faint honeycomb, a pink glow where the products stand */
  const backTex = new THREE.CanvasTexture(document.createElement('canvas'));
  const back = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: backTex, toneMapped: false }));
  back.position.z = -600; scene.add(back);
  function paintBackdrop(W, H) {
    const c = backTex.image; c.width = Math.round(W); c.height = Math.round(H);
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#170b05'); g.addColorStop(.38, '#2e170a'); g.addColorStop(.74, '#5a3013'); g.addColorStop(1, '#3b1e0b');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    const spot = (cx, cy, r, col) => { const s = x.createRadialGradient(cx, cy, 0, cx, cy, r); s.addColorStop(0, col); s.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = s; x.fillRect(0, 0, W, H); };
    spot(W * .72, H * .72, Math.max(W, H) * .42, 'rgba(255,160,70,.42)');   // warm light behind the products
    spot(W * .74, H * .82, Math.max(W, H) * .22, 'rgba(242,120,170,.30)');  // a pink bounce from the bottles
    spot(W * .2, H * .1, Math.max(W, H) * .4, 'rgba(255,190,110,.12)');
    // warm light behind the honey, so it glows amber as real honey does when backlit
    const top = x.createLinearGradient(0, 0, 0, H * .5);
    top.addColorStop(0, 'rgba(255,176,64,.75)'); top.addColorStop(.35, 'rgba(230,130,40,.32)'); top.addColorStop(1, 'rgba(230,130,40,0)');
    x.fillStyle = top; x.fillRect(0, 0, W, H * .5);
    // a faint honeycomb, lit only where the warm light falls
    const R = Math.max(26, W / 44), hw = R * Math.sqrt(3);
    x.lineWidth = 1.2;
    for (let row = -1; row * R * 1.5 < H + R; row++) for (let col = -1; col * hw < W + hw; col++) {
      const cx = col * hw + (row % 2 ? hw / 2 : 0), cy = row * R * 1.5;
      const d = Math.hypot((cx - W * .7) / W, (cy - H * .7) / H);
      const a = Math.max(0, .16 - d * .22);
      if (a < .01) continue;
      x.strokeStyle = `rgba(255,200,120,${a})`; x.beginPath();
      for (let k = 0; k < 6; k++) { const an = Math.PI / 6 + k * Math.PI / 3; const px = cx + Math.cos(an) * R * .96, py = cy + Math.sin(an) * R * .96; k ? x.lineTo(px, py) : x.moveTo(px, py); }
      x.closePath(); x.stroke();
    }
    // the glossy floor the products stand on
    const fy = H * .9, f = x.createLinearGradient(0, fy, 0, H);
    f.addColorStop(0, 'rgba(255,190,120,.16)'); f.addColorStop(.06, 'rgba(30,14,5,.55)'); f.addColorStop(1, 'rgba(12,5,2,.85)');
    x.fillStyle = f; x.fillRect(0, fy, W, H - fy);
    backTex.colorSpace = THREE.SRGBColorSpace; backTex.needsUpdate = true;
  }

  /* honey */
  const honey = new THREE.MeshPhysicalMaterial({
    color: 0xffd27a, metalness: 0, roughness: .04, transmission: 1, thickness: 22, ior: 1.49,
    attenuationColor: new THREE.Color(0xf0a83a), attenuationDistance: 210,     // golden amber, not red
    emissive: new THREE.Color(0x7a4300), emissiveIntensity: .18,             // a little of the glow of light passing through honey
    clearcoat: 1, clearcoatRoughness: .02, specularIntensity: 1, envMapIntensity: 1.8
  });
  const group = new THREE.Group(); scene.add(group);
  let band = null, drips = [], drops = [], W = 0, H = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);

  // the sheet of honey along the top edge, its lower edge rippling into the drips
  function buildBand() {
    if (band) { group.remove(band); band.geometry.dispose(); }
    const s = new THREE.Shape(), base = Math.max(22, H * .034);
    s.moveTo(-20, 40); s.lineTo(W + 20, 40); s.lineTo(W + 20, -base);
    for (let i = 60; i >= 0; i--) {
      const x = (W + 40) * i / 60 - 20;
      const y = -base - 10 * Math.sin(x * .011 + 1) - 7 * Math.sin(x * .027 + 2) - 4 * Math.sin(x * .061);
      s.lineTo(x, y);
    }
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 18, bevelEnabled: true, bevelThickness: 16, bevelSize: 14, bevelSegments: 10, curveSegments: 6 });
    band = new THREE.Mesh(geo, honey); band.position.z = -20; group.add(band);
    return base;
  }
  // one drip: a wide root that tapers smoothly, then swells into a heavy teardrop, like real honey
  const sstep = v => v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v);
  function dripGeometry(len, bulb, neck) {
    const pts = [], n = 48, root = bulb * 1.5;
    for (let i = 0; i <= n; i++) {
      const t = i / n, y = -t * len;
      let r = neck + (root - neck) * Math.pow(1 - t, 3.2);          // the root flows out of the sheet
      r += (bulb - neck) * sstep((t - .55) / .45);                   // the drop gathering at the end
      pts.push(new THREE.Vector2(r, y));
    }
    for (let i = 1; i <= 18; i++) {                                  // the rounded underside, slightly pointed
      const a = i / 18 * Math.PI / 2;
      pts.push(new THREE.Vector2(Math.max(.01, Math.cos(a) * bulb), -len - Math.sin(a) * bulb * 1.12));
    }
    return new THREE.LatheGeometry(pts, 32);
  }
  function buildDrips(base) {
    for (const d of drips) { group.remove(d.mesh); d.mesh.geometry.dispose(); }
    drips = [];
    const count = Math.max(6, Math.round(W / 110));
    for (let i = 0; i < count; i++) {
      const x = (i + .5 + rnd(-.3, .3)) * W / count;
      const leftSide = x < W * .5;                             // keep the drips short over the headline
      const maxLen = leftSide ? rnd(H * .05, H * .14) : rnd(H * .12, H * .34);
      const d = { x, y: -base - 10 * Math.sin(x * .011 + 1) - 7 * Math.sin(x * .027 + 2) - 4 * Math.sin(x * .061) + 6,
        neck: rnd(3.5, 6), bulb: rnd(11, 18), min: rnd(8, 20), max: maxLen, period: rnd(7, 15), t0: rnd(0, 15), mesh: null, lastLen: -1 };
      d.mesh = new THREE.Mesh(dripGeometry(d.min, d.bulb, d.neck), honey);
      d.mesh.position.set(d.x, d.y, 0); group.add(d.mesh); drips.push(d);
    }
  }
  const dropGeo = new THREE.SphereGeometry(1, 24, 18);
  function release(d, len) {
    const m = new THREE.Mesh(dropGeo, honey); m.scale.set(d.bulb * .9, d.bulb * 1.15, d.bulb * .9);
    m.position.set(d.x, d.y - len - d.bulb, 0); group.add(m);
    drops.push({ m, vy: 0 });
  }

  function layout() {
    W = slide.clientWidth || hero.clientWidth; H = slide.clientHeight || hero.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H, false);
    camera.left = 0; camera.right = W; camera.top = 0; camera.bottom = -H; camera.updateProjectionMatrix();
    back.scale.set(W, H, 1); back.position.set(W / 2, -H / 2, -600);
    paintBackdrop(W, H);
    buildDrips(buildBand());
  }

  // a drip's length over its cycle: a slow stretch, a quick release, a springy pull back
  const ease = u => u < .82 ? Math.pow(u / .82, 1.6) : 1 - (u - .82) / .18;
  let raf = 0, last = 0, clock = 0;
  function frame(now) {
    raf = 0;
    const dt = Math.min(.05, last ? (now - last) / 1000 : .016); last = now; clock += dt;
    for (const d of drips) {
      const u = ((clock + d.t0) % d.period) / d.period;
      const len = reduce ? (d.min + d.max) / 2 : d.min + (d.max - d.min) * ease(u);
      if (!reduce && d.lastLen > d.max * .95 && len < d.lastLen - 4) release(d, d.lastLen);
      if (Math.abs(len - d.lastLen) > .4) {
        d.mesh.geometry.dispose();
        const swell = d.bulb * (.75 + .35 * Math.min(1, len / d.max));
        d.mesh.geometry = dripGeometry(len, swell, d.neck * (1 - .35 * Math.min(1, len / d.max)));
        d.lastLen = len;
      }
    }
    for (let i = drops.length - 1; i >= 0; i--) {         // falling drops stretch as they speed up
      const p = drops[i]; p.vy += 1400 * dt; p.m.position.y -= p.vy * dt;
      p.m.scale.y = p.m.scale.x * (1.15 + Math.min(1.2, p.vy / 900));
      if (-p.m.position.y > H * .92) { group.remove(p.m); drops.splice(i, 1); }
    }
    renderer.render(scene, camera);
    if (!reduce && slide.classList.contains('is-active') && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  let visible = true;
  const kick = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && slide.classList.contains('is-active')) kick(); }).observe(slide);
  hero.addEventListener('slidechange', e => { if (e.detail.slide === slide) kick(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && slide.classList.contains('is-active')) kick(); });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); kick(); }, 150); });
  layout();
  requestAnimationFrame(frame);       // always paint once, so the banner is ready before it is shown
}
