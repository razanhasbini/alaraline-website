"""Renders the Christmas banners' satin and glass to transparent PNGs in public/live/xmas/banners/.
Satin: long streaks along the ribbon, with a highlight that follows its curve (anisotropic shading).
Glass: a sphere's Fresnel rim and the mirrored softboxes of a photo studio.
Run: python tools/render_banner_art.py [stands bow ...]  (needs numpy, pillow)"""
import numpy as np
from PIL import Image
OUT = 'public/live/xmas/banners/'
rng = np.random.default_rng(11)

def ramp(l, stops):
    xs = [s[0] for s in stops]
    return np.stack([np.interp(l, xs, [s[1][c] for s in stops]) for c in range(3)], -1)
SATIN = [(0, (146, 42, 88)), (.3, (214, 92, 146)), (.55, (243, 150, 190)), (.8, (251, 200, 222)), (1, (255, 244, 249))]

def bezier(pts, n):
    """Catmull-Rom through pts."""
    p = np.array([pts[0]] + list(pts) + [pts[-1]], float)
    out = []
    seg = len(p) - 3
    for i in range(seg):
        t = np.linspace(0, 1, n // seg, endpoint=i == seg - 1)[:, None]
        a, b, c, d = p[i], p[i + 1], p[i + 2], p[i + 3]
        out.append(.5 * ((2 * b) + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t ** 2 + (3 * b - a - 3 * c + d) * t ** 3))
    return np.concatenate(out)

class Canvas:
    def __init__(s, w, h, ss=2, off=(0, 0), pal=None):
        s.pal = pal or SATIN
        s.off = np.array(off, float); s.ss = ss; s.w, s.h = w * ss, h * ss
        s.rgb = np.zeros((s.h, s.w, 3), np.float32); s.a = np.zeros((s.h, s.w), np.float32)
    def strip(s, pts, width, inner=False, seed=0, n=9000, m=1000, sheen=.35, pleat=0, gather=0):
        """pts: centre line; width(t) in px, t in 0..1; pleat: creases near t=0; gather: narrow near t=0."""
        r = np.random.default_rng(seed)
        c = (bezier(pts, n) + s.off) * s.ss
        n = len(c)
        d = np.gradient(c, axis=0); L = np.hypot(d[:, 0], d[:, 1]) + 1e-6; tan = d / L[:, None]
        nor = np.stack([-tan[:, 1], tan[:, 0]], 1)
        ang = np.unwrap(np.arctan2(tan[:, 1], tan[:, 0]))
        t = np.linspace(0, 1, n)
        wid = np.array([width(x) for x in t]) * s.ss
        q = np.linspace(-1, 1, m)
        T, Q = np.meshgrid(t, q, indexing='ij')
        # long streaks that wander slowly along the length, like light in woven satin
        streak = np.zeros_like(T)
        for f in [2.5, 5, 9, 17, 31]:
            streak += np.sin(Q * f + r.uniform(0, 6) + np.sin(T * r.uniform(2, 7) + r.uniform(0, 6)) * 1.3) / f ** .6
        streak /= 2.2
        # the broad highlight depends on the ribbon's direction, so it slides as the ribbon curves
        h = np.zeros_like(T)
        for a0, sw, amp in [(r.uniform(0, 3), .5, 1), (r.uniform(0, 3), .28, .7)]:
            h += amp * np.exp(-(np.sin(ang[:, None] + Q * .28 - a0) / sw) ** 2)
        cup = 1 - .22 * Q ** 2
        l = (.47 + sheen * h + .11 * streak) * cup
        if pleat:
            l += pleat * np.exp(-T / .16) * np.sin(Q * 11 + r.uniform(0, 6)) 
        l += .012 * r.normal(size=(1, m))                                  # the fine weave
        edge = np.abs(Q) > .965; l = np.where(edge, l * .86, l)             # the woven edge
        if inner: l = l * .72 + .02
        col = ramp(np.clip(l, 0, 1), s.pal)
        X = (c[:, 0, None] + nor[:, 0, None] * Q * wid[:, None] / 2).astype(int)
        Y = (c[:, 1, None] + nor[:, 1, None] * Q * wid[:, None] / 2).astype(int)
        ok = (X >= 0) & (X < s.w) & (Y >= 0) & (Y < s.h)
        s.rgb[Y[ok], X[ok]] = col[ok]; s.a[Y[ok], X[ok]] = 1
    def shade(s, pts, width, amount=.35, blur=26):
        """A soft contact shadow painted on what is already there."""
        from PIL import ImageDraw, ImageFilter
        im = Image.new('L', (s.w, s.h), 0); dr = ImageDraw.Draw(im)
        c = bezier(pts, 400) * s.ss
        dr.line([tuple(p) for p in c], fill=255, width=int(width * s.ss))
        m = np.asarray(im.filter(ImageFilter.GaussianBlur(blur * s.ss))).astype(np.float32) / 255
        s.rgb *= (1 - m * amount)[..., None]
    def save(s, name):
        rgba = np.dstack([s.rgb, s.a * 255]).clip(0, 255).astype(np.uint8)
        im = Image.fromarray(rgba, 'RGBA')
        # average only the covered pixels, so the edge stays clean
        pre = np.dstack([s.rgb * s.a[..., None], s.a])
        pim = Image.fromarray((pre * [1, 1, 1, 255]).clip(0, 255).astype(np.uint8), 'RGBA').resize((s.w // s.ss, s.h // s.ss), Image.BOX)
        p = np.asarray(pim).astype(np.float32); al = p[..., 3:] / 255 + 1e-5
        out = np.dstack([(p[..., :3] / al).clip(0, 255), p[..., 3]]).astype(np.uint8)
        out = Image.fromarray(out, 'RGBA'); out = out.crop(out.getbbox())
        if name == 'satin-bow': out = out.resize((out.width // 2, out.height // 2), Image.LANCZOS)
        out.save(OUT + name + '.webp', quality=90, method=6); print(name, out.size)

def bow():
    c = Canvas(1640, 1280, off=(120, 100))
    K = (700, 330)      # the knot
    wide = lambda g, W: (lambda t: W * (g + (1 - g) * min(1, t / .2) ** .7))
    # tails, behind everything, with cut ends
    c.strip([(K[0] - 20, K[1] + 8), (520, 450), (340, 590), (210, 790), (150, 960), (170, 1080)], wide(.35, 150), seed=1, sheen=.42)
    c.strip([(K[0] + 20, K[1] + 8), (890, 430), (1060, 540), (1190, 720), (1270, 860), (1340, 980)], wide(.35, 165), seed=2, sheen=.42)
    # each loop runs out along its far side (inner face) and back along its near side, in one curve round the tip
    c.strip([K, (510, 170), (280, 60), (110, 90), (50, 210), (70, 300)], wide(.18, 235), inner=True, seed=3)
    c.strip([K, (890, 190), (1110, 120), (1290, 140), (1350, 260), (1340, 350)], wide(.18, 235), inner=True, seed=4)
    near = lambda t: 225 * (.18 + .82 * min(1, (1 - t) / .28) ** .6)
    c.strip([(50, 210), (80, 320), (250, 410), (500, 400), K], near, seed=5, sheen=.5)
    c.strip([(1350, 260), (1330, 370), (1120, 450), (880, 420), K], near, seed=6, sheen=.5)
    # the knot: a short band wrapped round the gathered ribbon
    c.strip([(K[0] - 10, K[1] - 82), (K[0] + 10, K[1] - 12), (K[0] + 2, K[1] + 82)], lambda t: 124 - 30 * abs(t - .5), seed=7, n=2400, sheen=.3, pleat=.08)
    c.save('satin-bow')

def hanging():
    c = Canvas(90, 1500)
    c.strip([(45, -20), (45, 500), (45, 1000), (45, 1520)], lambda t: 66, seed=9, n=9000, m=300, sheen=.05)
    c.save('satin-ribbon')

def glass():
    N = 1000; R = N / 2 - 4
    y, x = np.mgrid[0:N, 0:N].astype(np.float32); x = (x - N / 2 + .5) / R; y = (N / 2 - y - .5) / R
    r2 = x * x + y * y; inside = r2 < 1
    z = np.sqrt(np.clip(1 - r2, 0, 1)); r = np.sqrt(r2)
    # the mirror direction of the camera in the sphere
    rx, ry, rz = 2 * z * x, 2 * z * y, 2 * z * z - 1
    def softbox(cx, cy, w, h, soft=.05):
        u = np.clip(1 - (np.abs(rx - cx) - w) / soft, 0, 1) * np.clip(1 - (np.abs(ry - cy) - h) / soft, 0, 1)
        return u * u * (3 - 2 * u)
    aa = np.clip((1 - r) * R / 1.5, 0, 1)
    fres = np.clip(r, 0, 1) ** 7
    front = np.zeros((N, N, 4), np.float32); front[..., :3] = 255
    ang = np.arctan2(y, x)
    def crescent(r0, width, a0, spread, amp):
        """A soft band of light following the sphere's edge, fading toward both ends."""
        d = np.arctan2(np.sin(ang - a0), np.cos(ang - a0))
        return amp * np.exp(-((r - r0) / width) ** 2) * np.exp(-(d / spread) ** 2)
    a = (.14 * fres
         + crescent(.80, .075, 2.3, .52, .86)        # the long reflection, top left
         + crescent(.66, .030, 2.25, .34, .34)       # a thin second line inside it
         + crescent(.90, .035, -.95, .50, .55)       # the light gathered low on the right
         + crescent(.86, .05, .52, .22, .26))        # a small reflection, upper right
    u = (x + .40) * .82 + (y - .47) * .57; v = -(x + .40) * .57 + (y - .47) * .82
    a += .16 * np.clip(1 - (np.abs(u) - .05) / .05, 0, 1) * np.clip(1 - (np.abs(v) - .09) / .05, 0, 1)   # a small soft window
    a += .55 * np.exp(-(((r - .988) / .012) ** 2))   # the crisp rim of the glass
    front[..., 3] = np.clip(a, 0, 1) * aa * 255
    Image.fromarray(front.astype(np.uint8), 'RGBA').save(OUT + 'bauble-front.webp', quality=90, method=6)
    # behind the products: a faint tint of the glass, stronger at the edge, with a little reflected rose light
    back = np.zeros((N, N, 4), np.float32); back[..., 0] = 255; back[..., 1] = 196; back[..., 2] = 220
    back[..., 3] = (np.clip(.08 + .55 * r ** 5, 0, 1)) * aa * 255
    Image.fromarray(back.astype(np.uint8), 'RGBA').save(OUT + 'bauble-back.webp', quality=90, method=6)
    print('bauble', N)

def curls():
    for i, (loops, r, seed) in enumerate([(5, 34, 21), (4, 42, 22), (6, 28, 23)]):
        c = Canvas(560, 200, off=(0, 0))
        t = np.linspace(0, 1, 90)
        pts = np.stack([40 + t * 470 + r * np.sin(t * loops * 6.283), 100 + r * 1.5 * np.cos(t * loops * 6.283)], 1)
        c.strip([tuple(p) for p in pts], lambda u: 19, seed=seed, n=9000, m=70, sheen=.55)
        c.save(f'curl-{i}')

def shreds():
    """A heap of shredded pink paper, for the box to burst out of."""
    c = Canvas(900, 300); r = np.random.default_rng(5)
    for i in range(520):
        d = r.uniform(0, 1) ** .6; a = r.uniform(0, 6.283)
        x, y = 450 + np.cos(a) * d * 410, 190 + np.sin(a) * d * 100 - (1 - d) * 40
        ang = r.uniform(0, 6.283); L = r.uniform(26, 62); w = r.uniform(4, 8); k = r.uniform(.5, 1.5)
        pts = [(x + np.cos(ang) * L * q + np.sin(q * 5 + i) * 7 * k, y + np.sin(ang) * L * q + np.cos(q * 5 + i) * 7 * k) for q in np.linspace(-1, 1, 7)]
        c.strip(pts, lambda u: w, seed=100 + i, n=300, m=16, sheen=.4)
    c.save('shreds')

def baubles():
    N = 460; R = N / 2 - 30
    for name, base, metal in [('rose', (214, 84, 140), .75), ('pearl', (252, 240, 243), .25), ('gold', (216, 170, 104), .9)]:
        y, x = np.mgrid[0:N, 0:N].astype(np.float32); cy = N / 2 + 22
        x = (x - N / 2) / R; y = (cy - y) / R
        r2 = x * x + y * y; r = np.sqrt(r2); z = np.sqrt(np.clip(1 - r2, 0, 1))
        rx, ry = 2 * z * x, 2 * z * y
        col = np.array(base, np.float32) / 255
        diff = np.clip(x * -.45 + y * .6 + z * .66, 0, 1)
        room = np.clip(.5 + .5 * ry, 0, 1) ** 1.4                                  # floor dark, ceiling light
        shade = (1 - metal) * (.42 + .62 * diff) + metal * (.3 + .85 * room)
        rgb = col[None, None] * shade[..., None]
        def box(cx, cy2, w, h, sf=.1):
            u = np.clip(1 - (np.abs(rx - cx) - w) / sf, 0, 1) * np.clip(1 - (np.abs(ry - cy2) - h) / sf, 0, 1)
            return u * u * (3 - 2 * u)
        spec = (box(-.62, .6, .2, .22) * (.95 if metal > .5 else .6) + box(.7, .1, .05, .3) * .35 * metal + box(.1, -.8, .4, .06) * .28 * metal)
        rgb = rgb + spec[..., None] * (1 - rgb)
        rgb = rgb * (1 - .32 * r2[..., None] ** 4)                                  # the edge turns away from the light
        a = np.clip((1 - r) * R / 1.4, 0, 1)
        # the gold cap and its ring
        cw, top, bot = .2, 1.17, .95
        cap = (np.abs(x) < cw) & (y < top) & (y > bot - (1 - (x / cw) ** 2) * .03)
        band = .5 + .5 * np.cos(x / cw * 2.3 + 1.0)
        capc = np.stack([.45 + .55 * band, .32 + .5 * band, .16 + .34 * band], -1)
        capc = capc * (1 - .25 * (np.sin(y * 70) > .6)[..., None])
        rgb = np.where(cap[..., None], capc, rgb); a = np.where(cap, 1, a)
        ring = np.abs(np.hypot(x, (y - 1.24) * 1.0) - .075) < .018
        rgb = np.where(ring[..., None], np.array((.85, .68, .4), np.float32), rgb); a = np.where(ring, 1, a)
        out = np.dstack([np.clip(rgb, 0, 1) * 255, a * 255]).astype(np.uint8)
        Image.fromarray(out, 'RGBA').resize((N // 2 * 1, N // 2 * 1), Image.LANCZOS).save(OUT + f'bauble-{name}.webp', quality=90, method=6)
    print('baubles')

def noise(w, h, size, r):
    from PIL import ImageFilter
    a = r.random((h // size + 2, w // size + 2))
    im = Image.fromarray((a * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return np.asarray(im).astype(np.float32) / 255 - .5

def crumple(w, h, seed=3):
    """Crumpled paper: ridged folds at several scales, lit from the top left."""
    r = np.random.default_rng(seed)
    z = sum(np.abs(noise(w, h, s, r)) * k for s, k in [(260, 26), (120, 15), (60, 7), (24, 2.4)])
    z = z + noise(w, h, 3, r) * .55
    dy, dx = np.gradient(z)
    return np.clip(1 - .012 * 1 + (dx * .62 + dy * .78) * .34, .72, 1.08)

def paper():
    light = crumple(1600, 840)
    v = np.clip(light * 246, 0, 255)
    Image.fromarray(np.dstack([v, v, v]).astype(np.uint8)).save(OUT + 'paper.jpg', quality=78)
    print('paper')

def flake(d, cx, cy, s, fill, w):
    import math
    for k in range(6):
        a = k * math.pi / 3 + .26
        ex, ey = cx + math.cos(a) * s, cy + math.sin(a) * s
        d.line((cx, cy, ex, ey), fill=fill, width=w)
        for q, b in [(.42, .3), (.7, .24)]:
            px, py = cx + math.cos(a) * s * q, cy + math.sin(a) * s * q
            for sgn in (-1, 1):
                d.line((px, py, px + math.cos(a + sgn * 1.0) * s * b, py + math.sin(a + sgn * 1.0) * s * b), fill=fill, width=w)

def torn():
    """A band of torn wine-red paper with printed snowflakes and the white fibres a real tear leaves."""
    from PIL import ImageDraw, ImageFilter
    W, H = 1800, 520
    r = np.random.default_rng(8)
    def edge(base, amp):
        n = np.zeros(W)
        for s, k in [(220, 1), (90, .55), (34, .3), (12, .16), (4, .08)]:
            n += np.interp(np.arange(W), np.arange(0, W + s, s), r.uniform(-1, 1, W // s + 2)[:len(np.arange(0, W + s, s))]) * k
        return base + n * amp
    top, bot = edge(46, 20), edge(H - 46, 20)
    fib_t, fib_b = 7 + np.abs(edge(0, 8)), 7 + np.abs(edge(0, 8))
    art = Image.new('RGB', (W, H), (150, 28, 78)); d = ImageDraw.Draw(art)
    for i in range(46):
        x, y, sz = r.uniform(0, W), r.uniform(50, H - 50), r.uniform(20, 58)
        flake(d, x, y, sz, (250, 214, 228), 3)
    for i in range(170):
        x, y, q = r.uniform(0, W), r.uniform(50, H - 50), r.uniform(1.5, 4.2)
        d.ellipse((x - q, y - q, x + q, y + q), fill=(250, 214, 228))
    a = np.asarray(art).astype(np.float32) * crumple(W, H, 9)[..., None]
    yy = np.arange(H)[:, None]
    inside = (yy > top[None, :]) & (yy < bot[None, :])
    fibre = ((yy > top[None, :] - fib_t[None, :]) & (yy <= top[None, :])) | ((yy < bot[None, :] + fib_b[None, :]) & (yy >= bot[None, :]))
    wh = np.full((H, W, 3), 250, np.float32) * crumple(W, H, 12)[..., None]
    rgb = np.where(fibre[..., None], wh, a)
    alpha = (inside | fibre).astype(np.float32) * 255
    im = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha]).astype(np.uint8), 'RGBA')
    im.save(OUT + 'torn-band.webp', quality=86, method=6)
    print('torn')

STANDS = {
    'blush': [(0, (178, 92, 124)), (.35, (226, 146, 174)), (.7, (246, 188, 208)), (1, (255, 232, 240))],
    'white': [(0, (176, 150, 156)), (.35, (222, 208, 208)), (.7, (246, 240, 239)), (1, (255, 254, 253))],
    'rose': [(0, (142, 44, 88)), (.35, (204, 96, 142)), (.7, (234, 142, 178)), (1, (252, 196, 216))],
}

def pedestal(name, colour, R=300, H=640, e=.12, n=0, a=0., power=.7):
    """A column seen slightly from above: its outline r(angle) can be fluted (many small ridges) or a flower (a few petals).
    Every point of the side is lit from its own surface direction, by a soft key light and two studio strips."""
    ss = 2; pad = 6
    W, Ht = int(2 * R * 1.02) + pad * 2, int(H + 2 * R * e * 1.02) + pad * 2
    cw, ch = W * ss, Ht * ss
    cx, cy = W * ss / 2, (pad + R * e * 1.02) * ss
    def radius(phi):
        if not n: return np.full_like(phi, R, dtype=np.float64)
        return R * (1 - a * (1 - np.abs(np.sin(n * phi / 2)) ** power))
    rgb = np.zeros((ch, cw, 3), np.float32); al = np.zeros((ch, cw), np.float32)
    ramp_ = STANDS[colour]
    # the side, front half only, far points first
    phi = np.linspace(-.12, np.pi + .12, 14000)
    r = radius(phi); dr = np.gradient(r, phi)
    x, z = r * np.cos(phi), r * np.sin(phi)
    tx, tz = dr * np.cos(phi) - r * np.sin(phi), dr * np.sin(phi) + r * np.cos(phi)
    nx, nz = tz, -tx; L = np.hypot(nx, nz); nx, nz = nx / L, nz / L
    order = np.argsort(z)
    v = np.linspace(0, 1, int(H * ss * 1.3))
    for i in order:
        if nz[i] < -.05: continue
        px = int(cx + x[i] * ss)
        py = (cy + (z[i] * e + v * H) * ss).astype(int)
        ok = (py >= 0) & (py < ch) & (px >= 0) & (px < cw)
        diff = max(0., nx[i] * -.42 + nz[i] * .9)
        strip = .3 * np.exp(-((nx[i] + .55) / .1) ** 2) + .16 * np.exp(-((nx[i] - .72) / .07) ** 2)
        groove = (r[i] / r.max()) ** (10 if a else 1)                       # the valleys of the ridges fall into shade
        s_ = (.14 + .72 * diff ** .8) * (.62 + .38 * groove) + strip
        l = s_ * (1 - .1 * v) + .14 * np.exp(-v * H / 8)                    # a little lighter at the rim
        col = ramp(np.clip(l, 0, 1), ramp_)
        rgb[py[ok], px] = col[ok]; al[py[ok], px] = 1
    # the top: smooth and bright, a touch darker toward the back
    yy, xx = np.mgrid[0:ch, 0:cw].astype(np.float32)
    dx, dy = (xx - cx) / ss, (yy - cy) / ss / e
    rho = np.hypot(dx, dy); ang = np.arctan2(dy, dx)
    rt = radius(ang.astype(np.float64))
    top = rho <= rt
    l = .8 + .12 * (dy / R) - .1 * (dx / R)
    l = l + .1 * np.exp(-((rt - rho) / 5) ** 2)                               # the rounded edge catches light
    col = ramp(np.clip(l, 0, 1), ramp_)
    rgb[top] = col[top]; al[top] = 1
    p = np.dstack([rgb * al[..., None], al])
    pim = Image.fromarray((p * [1, 1, 1, 255]).clip(0, 255).astype(np.uint8), 'RGBA').resize((W, Ht), Image.BOX)
    q = np.asarray(pim).astype(np.float32); aa = q[..., 3:] / 255 + 1e-5
    out = Image.fromarray(np.dstack([(q[..., :3] / aa).clip(0, 255), q[..., 3]]).astype(np.uint8), 'RGBA')
    out.crop(out.getbbox()).save(OUT + name + '.webp', quality=92, method=6); print(name, out.size)

def stands():
    pedestal('stand-fluted-blush', 'blush', R=300, H=700, e=.1, n=64, a=.02)
    pedestal('stand-fluted-rose', 'rose', R=300, H=700, e=.1, n=64, a=.02)
    pedestal('stand-flower-white', 'white', R=330, H=400, e=.17, n=8, a=.13)
    pedestal('stand-flower-blush', 'blush', R=330, H=400, e=.17, n=8, a=.13)
    pedestal('stand-flower-rose', 'rose', R=330, H=400, e=.17, n=8, a=.13)

CREAM = [(0, (150, 128, 108)), (.3, (205, 188, 168)), (.55, (232, 220, 204)), (.8, (248, 242, 232)), (1, (255, 252, 246))]

def swoops():
    """Long ribbons that fall and twist, for the bundle scenes: pink satin and cream grosgrain."""
    for name, pal, seed in [('swoop-pink', None, 31), ('swoop-cream', CREAM, 32)]:
        c = Canvas(760, 1500, pal=pal)
        pts = [(560, -40), (590, 200), (470, 420), (230, 560), (140, 790), (300, 980), (560, 1090), (520, 1290), (330, 1400), (200, 1540)]
        c.strip(pts, lambda t: 56 + 74 * abs(np.sin(t * 8.5 + .6)), seed=seed, n=9000, m=500, sheen=.45)
        c.save(name)

import sys
jobs = dict(swoops=swoops, bow=bow, hanging=hanging, glass=glass, curls=curls, shreds=shreds, baubles=baubles, paper=paper, torn=torn, stands=stands)
for name in (sys.argv[1:] or jobs):
    jobs[name]()
