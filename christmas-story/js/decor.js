/* The Christmas decorations, rendered in 3D with physically based materials so the glass, metal and
   satin catch real reflections. Everything is laid out in the Story's own pixels (1080 × 1920,
   origin top-left, y down) and rendered to a transparent canvas that the compositor draws over the
   customer's photo or video. */
import * as THREE from '../vendor/three.module.min.js';

export const W = 1080, H = 1920;
const TAU = Math.PI * 2;

// story pixels → world units (1 px = 1 unit at z = 0)
const P = (x, y, z = 0) => new THREE.Vector3(x - W / 2, H / 2 - y, z);

/* ---------------- seeded randomness, so the composition is identical every time ---------------- */
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/* ---------------- a bright warm studio to reflect, matching a gift photographed in daylight ----------------
   Built as a high-dynamic-range panorama: a warm beige room with a blush floor (the colour of the box),
   and softboxes and fairy lights brighter than white, so metal and glass get crisp highlights. */
function studioEnvironment(renderer) {
  const EW = 1024, EH = 512;
  const base = document.createElement('canvas'); base.width = EW; base.height = EH;
  const b = base.getContext('2d');
  const g = b.createLinearGradient(0, 0, 0, EH);
  g.addColorStop(0, '#efe3d8'); g.addColorStop(.42, '#e2cbbd'); g.addColorStop(.5, '#d9b6ae'); g.addColorStop(.62, '#e7b3c0'); g.addColorStop(1, '#cf98a6');
  b.fillStyle = g; b.fillRect(0, 0, EW, EH);
  // the room behind the camera is a little darker, so the glass has depth
  const d = b.createLinearGradient(EW * .55, 0, EW, 0);
  d.addColorStop(0, 'rgba(90,55,55,0)'); d.addColorStop(.5, 'rgba(90,55,55,.45)'); d.addColorStop(1, 'rgba(90,55,55,0)');
  b.fillStyle = d; b.fillRect(0, EH * .3, EW, EH * .4);
  const lights = document.createElement('canvas'); lights.width = EW; lights.height = EH;
  const l = lights.getContext('2d');
  const box = (cx, cy, w, h, a, blur) => {
    l.save(); l.filter = `blur(${blur}px)`; l.fillStyle = `rgba(255,255,255,${a})`;
    l.beginPath(); l.roundRect(cx - w / 2, cy - h / 2, w, h, Math.min(w, h) * .25); l.fill(); l.restore();
  };
  box(EW * .27, EH * .24, 260, 150, 1, 9);      // key softbox, upper left in front: the one highlight
  box(EW * .5, EH * .03, 700, 26, .45, 12);     // a soft overhead, high up
  box(EW * .93, EH * .24, 60, 230, .35, 14);    // a faint rim from the right, far round the side
  const bd = b.getImageData(0, 0, EW, EH).data, ld = l.getImageData(0, 0, EW, EH).data;
  const data = new Float32Array(EW * EH * 4);
  const lin = v => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
  const warm = [1, .93, .82];
  for (let i = 0; i < EW * EH; i++) {
    const k = ld[i * 4] / 255 * 9;              // the lights are up to ten times brighter than the walls
    for (let c = 0; c < 3; c++) data[i * 4 + c] = lin(bd[i * 4 + c]) * .9 + k * warm[c];
    data[i * 4 + 3] = 1;
  }
  const tex = new THREE.DataTexture(data, EW, EH, THREE.RGBAFormat, THREE.FloatType);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.LinearSRGBColorSpace;
  tex.flipY = true; tex.needsUpdate = true;
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromEquirectangular(tex).texture;
  tex.dispose(); pm.dispose();
  return env;
}

/* ---------------- materials ---------------- */
function noiseTexture(size, seed, amp) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d'), img = x.createImageData(size, size), r = rng(seed);
  for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (r() - .5) * amp; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function materials() {
  const glitter = noiseTexture(256, 3, 255); glitter.repeat.set(6, 3);
  const satinGrain = noiseTexture(128, 9, 60); satinGrain.repeat.set(40, 1);
  const M = {
    redGloss: new THREE.MeshPhysicalMaterial({ color: 0x5e0611, metalness: .5, roughness: .08, clearcoat: 1, clearcoatRoughness: .04 }),
    redVelvet: new THREE.MeshPhysicalMaterial({ color: 0x55060f, metalness: 0, roughness: .78, sheen: 1, sheenRoughness: .45, sheenColor: new THREE.Color(0xe0606e) }),
    gold: new THREE.MeshPhysicalMaterial({ color: 0xe0bd78, metalness: 1, roughness: .16 }),
    goldGlitter: new THREE.MeshPhysicalMaterial({ color: 0xd9b46c, metalness: 1, roughness: .32, bumpMap: glitter, bumpScale: 1.6 }),
    champagne: new THREE.MeshPhysicalMaterial({ color: 0xead6b0, metalness: 1, roughness: .22 }),
    silver: new THREE.MeshPhysicalMaterial({ color: 0xe6e8ec, metalness: 1, roughness: .06 }),
    blushPearl: new THREE.MeshPhysicalMaterial({ color: 0xf1c3d1, metalness: .15, roughness: .22, clearcoat: .8, clearcoatRoughness: .1, iridescence: .9, iridescenceIOR: 1.35, iridescenceThicknessRange: [180, 520] }),
    pinkGloss: new THREE.MeshPhysicalMaterial({ color: 0xd8467f, metalness: .35, roughness: .1, clearcoat: 1, clearcoatRoughness: .05 }),
    capGold: new THREE.MeshPhysicalMaterial({ color: 0xd2ae68, metalness: 1, roughness: .26 }),
    redSatin: new THREE.MeshPhysicalMaterial({ color: 0x6a0813, metalness: 0, roughness: .34, sheen: 1, sheenRoughness: .28, sheenColor: new THREE.Color(0xff8090), clearcoat: .35, clearcoatRoughness: .3, side: THREE.DoubleSide, bumpMap: satinGrain, bumpScale: .15 }),
    goldRibbon: new THREE.MeshPhysicalMaterial({ color: 0xe6c27a, metalness: 1, roughness: .2, side: THREE.DoubleSide }),
    silverRibbon: new THREE.MeshPhysicalMaterial({ color: 0xe4e6ea, metalness: 1, roughness: .14, side: THREE.DoubleSide }),
    twig: new THREE.MeshStandardMaterial({ color: 0x3b2618, roughness: .85 }),
    needle: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .55, metalness: 0 }),
    needleGold: new THREE.MeshPhysicalMaterial({ color: 0xe2c07a, metalness: 1, roughness: .25 })
  };
  return M;
}

/* ---------------- a bauble: glass sphere, fluted gold cap, hanger loop ---------------- */
function bauble(r, mat, M) {
  const g = new THREE.Group();
  const capH = r * .27, capR = r * .21, loopR = r * .1;
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(r, 96, 64), mat);
  sphere.position.y = -(loopR * 1.6 + capH + r * .93);
  g.add(sphere);
  const capGeo = new THREE.CylinderGeometry(capR * .92, capR, capH, 64, 1, true);
  const pos = capGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {        // fluting
    const a = Math.atan2(pos.getZ(i), pos.getX(i)), k = 1 + .045 * Math.cos(a * 20);
    pos.setX(i, pos.getX(i) * k); pos.setZ(i, pos.getZ(i) * k);
  }
  capGeo.computeVertexNormals();
  const cap = new THREE.Mesh(capGeo, M.capGold);
  cap.position.y = -(loopR * 1.6 + capH / 2);
  g.add(cap);
  const top = new THREE.Mesh(new THREE.CircleGeometry(capR * .92, 48), M.capGold);
  top.rotation.x = -Math.PI / 2; top.position.y = -(loopR * 1.6); g.add(top);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(capR * 1.01, r * .022, 12, 64), M.capGold);
  rim.rotation.x = Math.PI / 2; rim.position.y = -(loopR * 1.6 + capH); g.add(rim);
  const loop = new THREE.Mesh(new THREE.TorusGeometry(loopR, r * .018, 12, 40), M.capGold);
  loop.position.y = -loopR * .75; g.add(loop);
  g.userData.sphere = sphere;
  return g;
}

/* ---------------- a ribbon strip along points, with its width along given directions ---------------- */
function strip(points, dirs, width, widthAt) {
  const n = points.length, pos = new Float32Array(n * 6), uv = new Float32Array(n * 4), idx = [];
  let len = 0;
  for (let i = 0; i < n; i++) {
    if (i) len += points[i].distanceTo(points[i - 1]);
    const w = (widthAt ? widthAt(i / (n - 1)) : 1) * width / 2;
    const a = points[i].clone().addScaledVector(dirs[i], -w), b = points[i].clone().addScaledVector(dirs[i], w);
    pos.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
    uv.set([len / width, 0, len / width, 1], i * 4);
    if (i < n - 1) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}
function frames(curve, n) {
  const f = curve.computeFrenetFrames(n, false);
  return { T: f.tangents, N: f.normals, B: f.binormals };
}

/* a curling ribbon: a spring wound around a gently bending axis; its width runs along the axis */
function curlRibbon({ axis, turns, r0, r1, width, mat, seed = 1, phase = 0 }) {
  const n = Math.round(turns * 64);
  const curve = new THREE.CatmullRomCurve3(axis);
  const { T, N, B } = frames(curve, n);
  const pts = [], dirs = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, c = curve.getPointAt(t), th = phase + t * turns * TAU;
    const r = r0 + (r1 - r0) * t;
    const radial = N[i].clone().multiplyScalar(Math.cos(th)).addScaledVector(B[i], Math.sin(th));
    pts.push(c.clone().addScaledVector(radial, r));
    dirs.push(T[i].clone().addScaledVector(radial, -.12).normalize());   // a slight cone, like real curled ribbon
  }
  // flat ends: the ribbon narrows a touch where it was cut
  const geo = strip(pts, dirs, width, t => t > .985 ? .85 : 1);
  return new THREE.Mesh(geo, mat);
}

/* a satin ribbon falling in loose loops (the tail of a bow); width roughly perpendicular to the path */
function satinTail({ path, width, twist = .6, mat, flip = 1 }) {
  const curve = new THREE.CatmullRomCurve3(path);
  const n = 260, { T, N, B } = frames(curve, n);
  const pts = [], dirs = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push(curve.getPointAt(t));
    // lies mostly flat towards the viewer (width in the picture plane), twisting to show the curl
    const a = Math.sin(t * Math.PI * 1.3) * twist * flip;
    const inPlane = new THREE.Vector3(-T[i].y, T[i].x, 0).normalize();
    dirs.push(inPlane.multiplyScalar(Math.cos(a)).add(new THREE.Vector3(0, 0, Math.sin(a))).normalize());
  }
  // a dovetail cut at the end: the last few percent narrows to a point on one side
  return new THREE.Mesh(strip(pts, dirs, width, t => (t > .965 ? 1 - (t - .965) / .035 * .55 : 1)), mat);
}

/* a small satin bow: two loops and two tails, tied on the hanger */
function bow(size, M) {
  const g = new THREE.Group();
  for (const side of [-1, 1]) {
    // a loop: the ribbon goes out and comes back, its width towards the viewer, tilted to show the inside
    const pts = [], dirs = [], n = 80;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * TAU * .96 - Math.PI / 2;
      pts.push(new THREE.Vector3(side * (size * .55 + Math.sin(a + Math.PI / 2) * size * .55), Math.sin(a) * size * .32 + size * .05, 0));
      dirs.push(new THREE.Vector3(side * .25, .15, 1).normalize());
    }
    const loop = new THREE.Mesh(strip(pts, dirs, size * .42), M.redSatin);
    loop.rotation.y = side * .45; loop.rotation.z = side * -.18;
    g.add(loop);
    // a tail with a dovetail end
    const tp = [], td = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      tp.push(new THREE.Vector3(side * (size * .12 + t * size * .55 + Math.sin(t * 3) * size * .06), -t * size * 1.25, Math.sin(t * Math.PI) * size * .15));
      td.push(new THREE.Vector3(Math.cos(side * .9 + t), .25 * side, .35).normalize());
    }
    g.add(new THREE.Mesh(strip(tp, td, size * .36, t => (t > .9 ? 1 - (t - .9) * 4 : 1)), M.redSatin));
  }
  const knot = new THREE.Mesh(new THREE.SphereGeometry(size * .2, 32, 16), M.redSatin);
  knot.scale.set(1.15, .9, .6); g.add(knot);
  return g;
}

/* ---------------- a pine sprig: twig, spiralling needles, gold-foiled tips ---------------- */
function pineSprig({ path, needles = 520, len = [20, 30], seed = 1, M, goldShare = .38 }) {
  const g = new THREE.Group(), r = rng(seed);
  const curve = new THREE.CatmullRomCurve3(path);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 2.6, 8, false), M.twig));
  const needleGeo = new THREE.CylinderGeometry(.55, 1.25, 1, 5, 1); needleGeo.translate(0, .5, 0);
  const tipGeo = new THREE.CylinderGeometry(.35, .9, 1, 5, 1); tipGeo.translate(0, .5, 0);
  const nm = new THREE.InstancedMesh(needleGeo, M.needle, needles);
  const tips = new THREE.InstancedMesh(tipGeo, M.needleGold, needles);
  const greens = [0x1c3527, 0x234231, 0x2c4d38, 0x1a2f24, 0x33573f];
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  let tipCount = 0;
  const { T, N, B } = frames(curve, 200);
  for (let i = 0; i < needles; i++) {
    const t = Math.pow(i / needles, .9) * .97, k = Math.round(t * 200);
    const at = curve.getPointAt(t), tan = T[k], a = i * 2.39996 + r() * .4;
    const around = N[k].clone().multiplyScalar(Math.cos(a)).addScaledVector(B[k], Math.sin(a));
    const dir = around.clone().multiplyScalar(.82).addScaledVector(tan, .58 + r() * .2).normalize();   // swept towards the tip
    const L = (len[0] + r() * (len[1] - len[0])) * (t > .85 ? .7 + (1 - t) * 2 : 1);
    q.setFromUnitVectors(up, dir); s.set(1, L, 1);
    m.compose(at.clone().addScaledVector(around, 2), q, s);
    nm.setMatrixAt(i, m);
    nm.setColorAt(i, new THREE.Color(greens[(r() * greens.length) | 0]).multiplyScalar(.85 + r() * .35));
    if (r() < goldShare && t > .15) {
      const tipLen = L * (.22 + r() * .12);
      s.set(1, tipLen, 1);
      m.compose(at.clone().addScaledVector(around, 2).addScaledVector(dir, L - tipLen * .95), q, s);
      tips.setMatrixAt(tipCount++, m);
    }
  }
  tips.count = tipCount;
  g.add(nm, tips);
  return g;
}

/* ---------------- the composition ---------------- */
export function createDecor(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true, premultipliedAlpha: false });
  renderer.setPixelRatio(1.5);                 // supersampled: thin ribbon edges stay smooth after scaling down
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;

  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer);
  scene.environmentIntensity = 1;
  const key = new THREE.DirectionalLight(0xfff1e0, 1.6); key.position.set(-600, 900, 1200); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd9c0, .8); rim.position.set(800, 300, -400); scene.add(rim);

  const fov = 16, dist = (H / 2) / Math.tan(THREE.MathUtils.degToRad(fov / 2));
  const camera = new THREE.PerspectiveCamera(fov, W / H, 10, dist * 3);
  camera.position.set(0, 0, dist);

  const M = materials();
  const groups = { ornaments: new THREE.Group(), gold: new THREE.Group(), satin: new THREE.Group(), greenery: new THREE.Group() };
  Object.values(groups).forEach(g => scene.add(g));
  const swingers = [];

  /* hanging baubles: each hangs from a narrow satin or gold ribbon that comes from above the frame */
  const hang = (x, hookY, r, mat, ribbonMat, z = 0, seed = 1, withBow = false) => {
    const pivot = new THREE.Group();
    pivot.position.copy(P(x, -60, z));
    const len = hookY + 60;
    const rr = rng(seed);
    const pts = [], dirs = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      pts.push(new THREE.Vector3(Math.sin(t * Math.PI) * 3 * (rr() - .5), -t * len, Math.sin(t * Math.PI) * 6));
      const a = .35 + Math.sin(t * Math.PI * 1.5 + seed) * .9;                 // a gentle twist down its length
      dirs.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)));
    }
    pivot.add(new THREE.Mesh(strip(pts, dirs, ribbonMat === M.redSatin ? 14 : 6), ribbonMat));
    const b = bauble(r, mat, M);
    b.position.y = -len; b.rotation.y = rr() * TAU;
    pivot.add(b);
    if (withBow) { const bw = bow(r * .72, M); bw.position.set(0, -len + r * .02, r * .15); pivot.add(bw); }
    groups.ornaments.add(pivot);
    swingers.push({ obj: pivot, amp: THREE.MathUtils.degToRad(.55 + rr() * .5), w: TAU / (2.4 * Math.sqrt(len / 300) + rr() * .6), ph: rr() * TAU, spin: b, spinAmp: .25 });
  };
  // top left
  hang(168, 300, 92, M.redGloss, M.redSatin, 40, 11, true);
  hang(338, 150, 62, M.goldGlitter, M.goldRibbon, -60, 12);
  hang(58, 520, 40, M.blushPearl, M.redSatin, 80, 13);
  // top right
  hang(905, 205, 84, M.gold, M.redSatin, 0, 21, true);
  hang(1012, 440, 48, M.silver, M.goldRibbon, 60, 22);
  hang(760, 96, 36, M.pinkGloss, M.redSatin, -40, 23);

  /* resting baubles at the bottom corners, partly cut by the frame like a cropped still life */
  const rest = (x, y, r, mat, z = 120) => {
    const b = bauble(r, mat, M);
    b.position.copy(P(x, y, z)); b.position.y += (r * .1 * 1.6 + r * .27 + r * .93);   // place by the sphere's centre
    b.rotation.z = (x < W / 2 ? 1 : -1) * .5; b.rotation.y = x * .01;
    groups.ornaments.add(b);
    return b;
  };
  rest(118, 1770, 64, M.redGloss, 160);
  rest(268, 1858, 36, M.gold, 220);
  rest(990, 1800, 56, M.silver, 160);
  rest(866, 1872, 30, M.redGloss, 240);

  /* gold curling ribbons cascading from the top right corner, one in silver */
  const curls = [
    { axis: [P(1110, -40, 30), P(1050, 140, 60), P(1062, 330, 40), P(1028, 520, 80)], turns: 9, r0: 24, r1: 15, width: 10, mat: M.goldRibbon, phase: 0 },
    { axis: [P(1140, 60, -20), P(1090, 220, 20), P(1104, 380, 0)], turns: 6.5, r0: 20, r1: 13, width: 9, mat: M.goldRibbon, phase: 1.3 },
    { axis: [P(980, -60, 120), P(1000, 60, 140), P(968, 180, 160)], turns: 4.5, r0: 17, r1: 12, width: 8, mat: M.silverRibbon, phase: 2.2 },
    // bottom left, a couple of short gold tendrils among the satin
    { axis: [P(-30, 1690, 140), P(60, 1640, 180), P(150, 1660, 200)], turns: 4, r0: 15, r1: 11, width: 8, mat: M.goldRibbon, phase: .4 },
    { axis: [P(1110, 1700, 140), P(1040, 1660, 180), P(960, 1690, 200)], turns: 3.5, r0: 14, r1: 10, width: 8, mat: M.goldRibbon, phase: 1.9 }
  ];
  const curlMeshes = curls.map(c => { const m = curlRibbon(c); groups.gold.add(m); return m; });

  /* deep red satin ribbon tails in the bottom corners */
  const tails = [
    satinTail({ path: [P(-60, 1880, 60), P(70, 1830, 120), P(170, 1700, 90), P(110, 1640, 60), P(40, 1700, 90), P(140, 1790, 140), P(300, 1760, 120), P(380, 1690, 80)], width: 54, twist: 1.1, mat: M.redSatin }),
    satinTail({ path: [P(1140, 1900, 60), P(1010, 1880, 120), P(930, 1760, 90), P(980, 1700, 60), P(1050, 1750, 100), P(1000, 1840, 150), P(860, 1820, 120)], width: 46, twist: -1, mat: M.redSatin, flip: -1 })
  ];
  tails.forEach(t => groups.satin.add(t));

  /* gold-tipped pine sprigs from the bottom corners */
  groups.greenery.add(pineSprig({ path: [P(-40, 1905, -40), P(80, 1800, -20), P(200, 1705, 0), P(300, 1650, 10)], needles: 560, seed: 4, M }));
  groups.greenery.add(pineSprig({ path: [P(-30, 1760, -60), P(60, 1700, -40), P(130, 1610, -30)], needles: 300, len: [16, 24], seed: 5, M }));
  groups.greenery.add(pineSprig({ path: [P(1130, 1890, -40), P(1010, 1790, -20), P(900, 1725, 0), P(800, 1700, 10)], needles: 540, seed: 6, M }));

  /* ---------------- animation ---------------- */
  const visible = { ornaments: true, gold: true, satin: true, greenery: true };
  function setVisible(name, on) { visible[name] = on; groups[name].visible = on; }

  function render(t, motion = true) {
    const tm = motion ? t : 0;
    for (const s of swingers) {
      s.obj.rotation.z = s.amp * Math.sin(tm * s.w + s.ph);
      s.spin.rotation.y = s.spinAmp * Math.sin(tm * s.w * .37 + s.ph);
    }
    curlMeshes.forEach((m, i) => { m.rotation.z = .006 * Math.sin(tm * .9 + i); });
    // a slow glide of the studio light, so reflections travel across the gold and glass
    scene.environmentRotation.set(0, .35 * Math.sin(tm * .18), 0);
    renderer.render(scene, camera);
  }
  return { render, setVisible, renderer };
}
