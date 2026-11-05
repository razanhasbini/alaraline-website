"""Hair Lab build: turn an edited campaign photo (same model, new hair type) into a Hair Lab look.

  python build_look.py <photo> <key> [--align]

--align  scales/moves the model to match the reference look (waves) and restores the
         campaign's straight crop line, for AI edits that changed the framing.
Writes assets/img/lab/<key>/ (base, plate, mask and effect layers) and regenerates assets/js/lab-looks.js."""
import os, sys, json, glob
import numpy as np, cv2, mediapipe as mp
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from mediapipe.tasks.python import vision, BaseOptions

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'img', 'lab')
W, H = 1000, 1250
REF = 'waves'
NAMES = {'waves': ('wavy', 'Soft waves'), 'straight': ('straight', 'Straight'), 'curly': ('curly', 'Loose curls'),
         'ringlets': ('curly', 'Curly'), 'tight': ('curly', 'Tight curls'), 'fullcurl': ('curly', 'Full curls'), 'coily': ('coily', 'Coily')}
ORDER = ['waves', 'straight', 'curly', 'ringlets', 'tight', 'fullcurl', 'coily']
TEX = {'waves': dict(len=(26, 85), curl=.04, wob=.08, n=780, fuzz=.45), 'straight': dict(len=(24, 80), curl=.02, wob=0, n=650, fuzz=.4),
       'curly': dict(len=(18, 70), curl=.07, wob=.25, n=1000, fuzz=.6), 'ringlets': dict(len=(14, 55), curl=.1, wob=.35, n=1100, fuzz=.65),
       'tight': dict(len=(12, 46), curl=.11, wob=.42, n=1250, fuzz=.72),
       'fullcurl': dict(len=(12, 46), curl=.11, wob=.42, n=1300, fuzz=.72),
       'coily': dict(len=(10, 36), curl=.12, wob=.5, n=1400, fuzz=.8)}

seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path=os.path.join(HERE, 'seg.tflite')), output_confidence_masks=True))
rng = np.random.default_rng(11)

def masks(a):
    r = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray((np.clip(a, 0, 1) * 255).astype(np.uint8))))
    cm = [np.squeeze(m.numpy_view()).copy() for m in r.confidence_masks]  # the views point at memory the next call reuses
    return cm[1], 1 - cm[0]

def lum(a): return a[..., 0] * .299 + a[..., 1] * .587 + a[..., 2] * .114
def sat(a, s): L = lum(a)[..., None]; return L + (a - L) * s
def sstep(e0, e1, x): t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)
def rgba(rgb, alpha): return Image.fromarray(np.dstack([np.clip(rgb, 0, 1) * 255, np.clip(alpha, 0, 1) * 255]).astype('uint8'), 'RGBA')
def save(im, path): im.save(path, 'WEBP', quality=84, method=6)

def fit(im):
    s = max(W / im.width, H / im.height); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (im.width - W) // 2, (im.height - H) // 2
    return np.asarray(im.crop((l, t, l + W, t + H))).astype(np.float32) / 255.

def geometry(hair, pers):
    ys = np.where(hair.max(1) > .5)[0]; top = ys.min()
    # body width: edge to edge across the sleeves and arms, not counting hair, so full curls hanging past the body don't inflate it
    body = ndi.binary_opening((pers > .5) & (hair < .3), iterations=3)
    spans = [np.ptp(np.where(body[y])[0]) for y in range(top + 200, H) if body[y].sum() > 40]
    return top, np.percentile(spans, 95)

def align(a):
    ref = np.asarray(Image.open(os.path.join(OUT, REF, 'base.jpg')).convert('RGB')).astype(np.float32) / 255.
    rh, rp = masks(ref); h, p = masks(a)
    rtop, rw = geometry(rh, rp); top, w = geometry(h, p)
    s = rw / w
    M = np.float32([[s, 0, W / 2 - s * W / 2], [0, s, rtop - s * top]])
    out = cv2.warpAffine(a, M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
    # a zoomed-in edit shrinks and leaves margins: fill them with the reference's backdrop, because mirroring would repeat her arms and head
    cov = cv2.warpAffine(np.ones((H, W), np.uint8), M, (W, H), flags=cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    keep = sstep(0, 70, cv2.distanceTransform(cov, cv2.DIST_L2, 5))[..., None]
    out = out * keep + ref * (1 - keep)
    # campaign crop line: everything below the reference's straight cut is the reference background
    rws = (rp > .5).sum(1); yc = np.where(rws > W * .3)[0].max()
    bg_ref = ref.copy()
    # the reference's own hair tips reach that cut: use the clean pink just below them
    tips = ndi.binary_dilation(rh > .05, iterations=10); tips[:yc - 60] = False
    bg_ref[tips] = np.broadcast_to(ref[min(yc + 24, H - 1)][None], (H, W, 3))[tips]
    h2, p2 = masks(out)
    # never chop the hair: if it falls past the reference cut, cut just below the natural ends instead
    hb = np.where((h2 > .5).sum(1) > 6)[0].max()
    if hb + 8 > yc: yc = min(H - 60, hb + 14)
    body = ndi.binary_dilation(p2 > .3, iterations=6)
    blend = np.zeros((H, W), np.float32); blend[yc + 1:] = 1
    soft = sstep(yc - 40, yc + 2, np.arange(H)[:, None]) * (~body)  # soften the seam only across clear background
    blend = np.maximum(blend, soft)
    out = out * (1 - blend[..., None]) + bg_ref * blend[..., None]
    print(f'aligned: scale {s:.3f}, crop line {yc}')
    return out

def make_layers(a, m, d, opt):
    L = lum(a); hv = L[m > .5]; lo, hi = np.percentile(hv, 4), np.percentile(hv, 98); Ln = np.clip((L - lo) / (hi - lo + 1e-6), 0, 1)
    ys, xs = np.where(m > .5); y0, y1 = ys.min(), ys.max(); x0, x1 = xs.min(), xs.max()
    Y = np.arange(H)[:, None] * np.ones((1, W)); X = np.ones((H, 1)) * np.arange(W)[None, :]
    meanc = a[m > .5].mean(0)
    bl = ndi.gaussian_filter(a, (1.4, 1.4, 0))
    dd = sat(a * .3 + bl * .7, .42); dd = meanc + (dd - meanc) * .72; dd = dd + .05 + np.array([.02, .02, .025])
    dd = dd - (np.clip(Ln - .5, 0, 1) * .3)[..., None]
    save(rgba(dd, m), f'{d}/dry.webp')
    sf = ndi.gaussian_filter(a, (3.4, 3.4, 0)); save(rgba(sat(sf, .85), ndi.binary_erosion(m > .5, iterations=3) * 1.0 * m), f'{d}/soft.webp')
    make_rich(a, m, d)
    make_shine(a, m, d)
    save(rgba(np.ones_like(a) * np.array([1, .74, .42]), m * (.3 + .7 * Ln) * .8), f'{d}/glow.webp')
    ew = sstep(y0 + (y1 - y0) * .55, y1, Y)
    save(rgba(sat(bl, .45) + np.array([.1, .08, .05]), m * ew * .95), f'{d}/ends.webp')
    w = 1 - m; plate = ndi.gaussian_filter(a * w[..., None], (28, 28, 0)) / (ndi.gaussian_filter(w, 28)[..., None] + 1e-4)
    edge = 1 - sstep(.45, 1.0, ndi.gaussian_filter(m, 16))
    part = sstep(.5, 0, np.abs(X - (x0 + x1) / 2) / ((x1 - x0) * .5)) * sstep(y0 + (y1 - y0) * .35, y0, Y) * .5
    save(rgba(plate, m * np.clip(edge * .9 + ew * .55 + part, 0, 1) * .7), f'{d}/thin.webp')
    S = 2
    fl = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0)); dr = ImageDraw.Draw(fl)
    cand = np.argwhere((m > .75) & (Y < y0 + (y1 - y0) * .4) & (rng.random((H, W)) < sstep(y0 + (y1 - y0) * .4, y0, Y)))
    for i in rng.choice(len(cand), min(120, len(cand)), replace=False):
        yy, xx = cand[i]; r = (.6 + rng.random() * 1.3) * S; e = r * (.6 + rng.random() * .5)
        dr.ellipse([xx * S - r, yy * S - e + 1.5 * S, xx * S + r, yy * S + e + 1.5 * S], fill=(40, 25, 20, 55))
        dr.ellipse([xx * S - r, yy * S - e, xx * S + r, yy * S + e], fill=(250, 247, 240, int(150 + rng.random() * 80)))
    save(fl.resize((W, H), Image.LANCZOS), f'{d}/flakes.webp')
    fz = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0)); dr = ImageDraw.Draw(fz)
    outer = ndi.binary_fill_holes(m > .5)  # flyaways grow from the hair's outer edge, not from gaps between curls
    gy, gx = np.gradient(ndi.gaussian_filter(m, 3)); bnd = np.argwhere((m > .35) & (m < .75) & ~ndi.binary_erosion(outer, iterations=6))
    def strand(yy, xx, ang, Ln_, col, alpha, curl, wob):
        pts = [(xx * S, yy * S)]; k = (rng.random() - .5) * curl * 2; ph = rng.random() * 6.28
        for t in range(int(Ln_)):
            ang += k + np.sin(t * .45 + ph) * wob * .35; xx += np.cos(ang); yy += np.sin(ang); pts.append((xx * S, yy * S))
        for j in range(len(pts) - 1):
            dr.line([pts[j], pts[j + 1]], fill=col + (int(alpha * (1 - j / len(pts)) ** .7),), width=S)
    lo_l, hi_l = opt['len']
    for i in rng.choice(len(bnd), min(opt['n'], len(bnd)), replace=False):
        yy, xx = bnd[i]; nrm = np.array([-gx[yy, xx], -gy[yy, xx]])
        if np.hypot(*nrm) < 1e-4: continue
        c = np.clip(sat(a[yy, xx][None], .8)[0] + .12, 0, 1)
        strand(float(yy), float(xx), np.arctan2(nrm[1], nrm[0]) + (rng.random() - .5) * 1.1, lo_l + rng.random() * (hi_l - lo_l), tuple(int(v * 255) for v in c), 170 + rng.random() * 85, opt['curl'], opt['wob'])
    inn = np.argwhere(m > .9)
    for i in rng.choice(len(inn), int(opt['n'] * 1.3), replace=False):
        yy, xx = inn[i]; c = np.clip(a[yy, xx] + .14, 0, 1)
        strand(float(yy), float(xx), rng.random() * 6.28, 6 + rng.random() * 18, tuple(int(v * 255) for v in c), 95 + rng.random() * 70, opt['curl'] * 2, opt['wob'])
    fz = fz.resize((W, H), Image.LANCZOS)
    ring = np.clip(ndi.gaussian_filter(outer * 1.0, 7) - np.maximum(m, outer), 0, 1) * opt['fuzz'] * 1.6
    halo = rgba(np.ones_like(a) * np.clip(meanc + .1, 0, 1), ring); halo.alpha_composite(fz); save(halo, f'{d}/frizz.webp')

def make_rich(a, m, d):
    """Hydrated hair: fuller colour, without the darkening and extra contrast that read as wet or greasy."""
    meanc = a[m > .5].mean(0)
    rc = sat(a, 1.14); rc = meanc + (rc - meanc) * 1.02
    save(rgba(rc * 1.02, m), f'{d}/rich.webp')

def make_shine(a, m, d):
    """Healthy shine: broad, soft light on the crests of the hair, in its own colour. Thin white streaks and shine at the roots read as oily."""
    L = lum(a)
    ys = np.where(m.max(1) > .5)[0]; top, bot = ys.min(), ys.max()
    Y = np.arange(H)[:, None] * np.ones((1, W))
    inside = ndi.gaussian_filter(L * m, 30) / (ndi.gaussian_filter(m, 30) + 1e-4)
    crest = sstep(.0, .13, ndi.gaussian_filter(L, 5) - inside)
    strands = np.clip(.8 + (L - ndi.gaussian_filter(L, 3)) * 2.5, .65, 1)  # a little strand texture, so it isn't a plastic sheen
    core = ndi.gaussian_filter(ndi.binary_erosion(m > .6, iterations=8) * 1., 6)
    fade = sstep(top + (bot - top) * .06, top + (bot - top) * .26, Y) * (1 - .25 * sstep(top + (bot - top) * .7, bot, Y))  # clear of the scalp
    light = np.clip(np.median(a[m > .6], 0) * 1.3 + np.array([.15, .12, .08]), 0, 1)  # a lighter, warmer version of her hair colour
    save(rgba(np.ones_like(a) * light, ndi.gaussian_filter(crest, 1.5) * strands * core * fade * .65), f'{d}/shine.webp')

def make_plate(a, m, anchor, d):
    """Her back under the hair, revealed when the lengths are drawn shorter: a clean tee and arms, painted to fit the body visible around the hair."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    pink = (r - g > .06) & (b - g > .015)
    skin = (r - b > .13) & (g - b > .04) & (r > .5)
    hair = ndi.binary_dilation(m > .03, iterations=8)
    tee = (g > .88) & ~hair & ~pink
    # the crop line and the body's outer edges, row by row, wherever hair doesn't hide them
    rows = np.arange(H); cx = W // 2
    bottom = int(np.where((skin & ~hair)[:, :cx].sum(1) > 8)[0].max())
    lo, ro = np.full(H, np.nan), np.full(H, np.nan)
    for y in range(anchor - 40, bottom + 1):
        body = np.where(~pink[y, 100:W - 100] & (a[y, 100:W - 100].min(1) > .3))[0] + 100
        if not len(body): continue
        if not hair[y, max(body[0] - 3, 0)]: lo[y] = body[0]
        if not hair[y, min(body[-1] + 3, W - 1)]: ro[y] = body[-1]
    known = lambda v: np.interp(rows, rows[~np.isnan(v)], ndi.median_filter(v[~np.isnan(v)], 9))
    top_l, top_r = rows[~np.isnan(lo)].min(), rows[~np.isnan(ro)].min()  # the shoulders start here: above them it's only hair over the backdrop
    lo, ro = known(lo), known(ro)
    # the sleeve hem: where the outer edge turns from tee to skin
    side = np.array([(skin[y, int(lo[y]) + 2:int(lo[y]) + 22].mean() + skin[y, int(ro[y]) - 22:int(ro[y]) - 2].mean()) / 2 for y in rows])
    hem = int(rows[anchor:bottom][np.argmax(ndi.uniform_filter1d(side[anchor:bottom], 15) > .5)])
    width = ro - lo; arm = width * .178                                   # arm width, measured on the straight look where hair hides least
    X = np.ones((H, 1)) * np.arange(W)[None, :]; Y = rows[:, None] * np.ones((1, W))
    soft = lambda x: np.clip(x / 2.4 + .5, 0, 1)                          # 2-3 px antialiased edges
    in_l, in_r = (lo + arm)[:, None], (ro - arm)[:, None]; lo_, ro_ = lo[:, None], ro[:, None]
    # follow each sleeve's real hem where it can be seen, and carry it on under the hair
    hem_x = np.full(W, float(hem))
    for x in list(range(int(lo[hem]), int(lo[hem] + arm[hem]) + 1)) + list(range(int(ro[hem] - arm[hem]), int(ro[hem]) + 1)):
        col = np.where(skin[hem - 45:hem + 45, x] & ~hair[hem - 45:hem + 45, x])[0]
        hem_x[x] = hem - 45 + col[0] if len(col) else np.nan
    for x0, x1, outer in ((int(lo[hem]), int(lo[hem] + arm[hem]), 0), (int(ro[hem] - arm[hem]), int(ro[hem]), 1)):
        v = hem_x[x0:x1 + 1]; n = len(v); near = v[-n // 3:] if outer else v[:n // 3]; near = near[~np.isnan(near)]   # the outer third is rarely hidden
        h0 = np.median(near) if len(near) else float(hem)
        v = np.where(np.isnan(v) | (np.abs(v - h0) > 10), h0, v)
        hem_x[x0:x1 + 1] = ndi.gaussian_filter1d(v, 6)
    below = soft(Y - hem_x[None, :])
    body = soft(X - lo_) * soft(ro_ - X) * soft(bottom + .5 - Y) * soft(Y - np.where(X < W / 2, top_l, top_r))
    arm_a = np.maximum(soft(in_l - X), soft(X - in_r)) * below * body
    # tee: the photo's own white, a little deeper toward the sides, with long soft folds
    tc = np.percentile(a[tee & (Y > anchor)], 80, axis=0) if (tee & (Y > anchor)).sum() > 50 else np.array([.98, .96, .98])
    dist = np.abs(X - (lo_ + ro_) / 2) / (width[:, None] / 2 + 1)
    folds = 1 + ndi.gaussian_filter(rng.standard_normal((H, W)), (46, 12)) * .6
    crease = 1 - .09 * np.exp(-((X - in_l) / 13) ** 2) * below - .09 * np.exp(-((X - in_r) / 13) ** 2) * below  # shadow where arm meets tee
    tee_rgb = tc[None, None] * ((1 - .05 * np.clip(dist, 0, 1) ** 2) * folds * crease)[..., None]
    # arms: this row's visible skin tone, rounded with light shading
    sk = np.median(a[skin & ~hair & (Y > hem)], 0)
    across = np.minimum(np.abs(X - lo_), np.abs(ro_ - X)) / (arm[:, None] + 1)
    arm_rgb = sk[None, None] * (.9 + .12 * np.sin(np.clip(across, 0, 1) * np.pi) ** .7)[..., None]
    fill = tee_rgb * (1 - arm_a[..., None]) + arm_rgb * arm_a[..., None]
    # the pink backdrop where hair hangs past the body, grown in from the pink around it
    hole = hair | ndi.binary_dilation(body > .02, iterations=4)
    bg = cv2.inpaint((np.clip(a, 0, 1) * 255).astype(np.uint8), hole.astype(np.uint8) * 255, 5, cv2.INPAINT_TELEA).astype(np.float32) / 255.
    fill = bg * (1 - body[..., None]) + fill * body[..., None]
    # beyond the hair itself: its shadows and stray strands on the visible tee and arms, and gaps between arm and tee
    L = lum(a); arm_zone = arm_a > .5; inner = ndi.binary_erosion(body > .5, iterations=8)   # never touch the body's real outline
    tl, sl = lum(tc[None, None])[0, 0], lum(sk[None, None])[0, 0]
    torso = (X > in_l) & (X < in_r)
    dirty = inner & ~arm_zone & (L < tl - .2)                             # sleeves keep their real folds: only hair shadows go
    dirty |= inner & ~arm_zone & torso & (L < tl - .085)
    dirty |= inner & arm_zone & (L < sl - .075)
    dirty |= pink & torso & (body > .5) & (Y > hem_x[None, :])
    dirty |= torso & (body > .5) & (Y > bottom - 14)                                             # the last rows: leftover wisps at the crop line
    # match the painted tee to the real tee around it, so it doesn't show as stains where much of the tee is visible
    seen = (body > .5) & ~arm_zone & (Y > anchor) & ~ndi.binary_dilation((m > .03) | dirty, iterations=12)
    if seen.sum() > 500:
        real = a[seen].mean(0) / fill[seen].mean(0)
        G = lambda v: ndi.gaussian_filter(v * seen[..., None], (36, 36, 0))
        match = (G(a) + .02 * real * tc) / (G(fill) + .02 * tc)
        tee_a = (body * (1 - arm_a))[..., None]
        fill = fill * (1 - tee_a) + fill * match * tee_a
    keep = (Y > anchor - 60)
    w = ndi.gaussian_filter((ndi.binary_dilation(m > .03, iterations=10) & keep) * 1., 2.5)
    w = np.maximum(w, ndi.gaussian_filter((ndi.binary_dilation(dirty, iterations=5) & keep) * 1., 2))
    if seen.sum() > 500:  # hair tints the white around every curl tip: repaint the whole inner tee, keeping only the real outline
        w = np.maximum(w, ndi.gaussian_filter((inner & ~arm_zone & keep) * 1., 4))
    w = w[..., None]
    Image.fromarray((np.clip(a * (1 - w) + fill * w, 0, 1) * 255).astype(np.uint8)).save(f'{d}/plate.jpg', quality=90)
    print(os.path.basename(d), 'plate: hem', hem, 'crop', bottom, 'edges at crop', int(lo[bottom]), int(ro[bottom]), 'tee', np.round(tc, 3), 'skin', np.round(sk, 3))

def make_oily(a, m, d):
    """Oily roots: darker, clumped strands with a wet-looking sheen near the scalp, fading down the lengths."""
    ys = np.where(m.max(1) > .5)[0]
    top, bot = ys.min(), ys.max()
    Y = np.arange(H)[:, None] * np.ones((1, W))
    fade = 1 - sstep(top + (bot - top) * .12, top + (bot - top) * .5, Y)
    L = lum(a)
    clump = a + (a - ndi.gaussian_filter(a, (3, 3, 0))) * 1.4          # separated, stringy strands
    dark = sat(clump, 1.12) * .74                                       # oil darkens hair
    hp = L - ndi.gaussian_filter(L, 2.5)
    streak = ndi.gaussian_filter(np.clip(hp * 7, 0, 1) * (L > np.percentile(L[m > .5], 55)), .8)  # soft greasy sheen along strands
    tint = np.clip(np.median(a[m > .6], 0) * 1.9, 0, 1)  # sheen takes the hair's own colour, not white
    col = np.clip(dark + streak[..., None] * tint * .45, 0, 1)
    save(rgba(col, m * fade * .95), f'{d}/oily.webp')

def make_define(a, m, d):
    """Definition: lighter crests and deeper shadows along the hair's own waves and curls (blended over the photo, so colour and shape stay the same)."""
    L = lum(a)
    inside = ndi.gaussian_filter(L * m, 14) / (ndi.gaussian_filter(m, 14) + 1e-4)  # compare hair with hair, not with the bright background
    hp = ndi.gaussian_filter(L, 1.2) - inside
    grey = np.clip(.5 + hp * 2.3, .25, .75)
    edge = ndi.gaussian_filter(ndi.binary_erosion(m > .5, iterations=5) * 1., 3)
    ys = np.where(m.max(1) > .5)[0]; top, bot = ys.min(), ys.max()
    fade = sstep(top + (bot - top) * .1, top + (bot - top) * .34, np.arange(H)[:, None] * np.ones((1, W)))  # waves and curls start below the crown
    save(rgba(np.dstack([grey] * 3), m * edge * fade), f'{d}/define.webp')


def make_crisp(a, m, d):
    """Strong definition: deeper shadows in the gaps between curls, so each curl stands apart. Crests stay as they are: brighter crests read as oily."""
    L = lum(a)
    inside = ndi.gaussian_filter(L * m, 12) / (ndi.gaussian_filter(m, 12) + 1e-4)
    gain = 9 if os.path.basename(d) == 'coily' else 5.5  # tiny coils have shallow gaps, so they need more depth to read at this size
    gaps = np.clip((inside - ndi.gaussian_filter(L, 1.)) * gain, 0, 1) ** .85
    edge = ndi.gaussian_filter(ndi.binary_erosion(m > .5, iterations=6) * 1., 3)
    ys = np.where(m.max(1) > .5)[0]; top, bot = ys.min(), ys.max()
    fade = sstep(top + (bot - top) * .1, top + (bot - top) * .3, np.arange(H)[:, None] * np.ones((1, W)))
    dark = np.median(a[m > .6], 0) * .32  # her hair colour in deep shade, not black
    save(rgba(np.ones_like(a) * dark, gaps * edge * fade), f'{d}/crisp.webp')

def build_layer_only(key, layer):
    d = os.path.join(OUT, key)
    a = np.asarray(Image.open(f'{d}/base.jpg').convert('RGB')).astype(np.float32) / 255.
    m = np.asarray(Image.open(f'{d}/mask.webp').convert('RGBA'))[..., 3].astype(np.float32) / 255.
    {'oily': make_oily, 'define': make_define, 'crisp': make_crisp, 'rich': make_rich, 'shine': make_shine}[layer](a, m, d)
    print(key, layer, 'built')


def build(src, key, do_align):
    a = fit(Image.open(src).convert('RGB'))
    if do_align: a = align(a)
    hair, pers = masks(a)
    # the detector can lose confidence inside smooth hair: keep the interior solid, except gaps showing the light tee
    core = ndi.binary_erosion(ndi.binary_fill_holes(hair > .3), iterations=12) & (a.mean(2) < .55)
    hair = np.maximum(hair, ndi.gaussian_filter(core * 1., 2))
    m = np.clip((ndi.gaussian_filter(hair, 1.0) - .12) / .72, 0, 1)
    m *= 1 - ndi.gaussian_filter(sstep(.52, .72, a.min(2)), 1.2)  # tee showing between wisps isn't hair: keep the hair effects off it
    d = os.path.join(OUT, key); os.makedirs(d, exist_ok=True)
    if os.path.abspath(src) != os.path.abspath(f'{d}/base.jpg'):  # a rebuild keeps the base untouched
        Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(f'{d}/base.jpg', quality=88, optimize=True)
    mk = np.zeros((H, W, 4), np.uint8); mk[..., 3] = (m * 255).astype(np.uint8); Image.fromarray(mk, 'RGBA').save(f'{d}/mask.webp', quality=90)
    ys = np.where(m.max(1) > .5)[0]; top, bot = ys.min(), ys.max(); anchor = int(top + (bot - top) * .45)
    growth = bool(bot > H * .62)  # hair that ends above the shoulders isn't drawn shorter: there's no back under it to reveal, only her neck
    if growth: make_plate(a, m, anchor, d)
    else: Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(f'{d}/plate.jpg', quality=80)
    json.dump({'top': int(top), 'bottom': int(bot), 'anchor': anchor, 'growth': growth}, open(f'{d}/meta.json', 'w'))
    make_layers(a, m, d, TEX.get(key, TEX['waves']))
    make_oily(a, m, d)
    make_define(a, m, d)
    make_crisp(a, m, d)
    write_manifest()
    print(key, 'built ->', d)

def write_manifest():
    keys = sorted([os.path.basename(os.path.dirname(f)) for f in glob.glob(f'{OUT}/*/meta.json')], key=lambda k: (ORDER.index(k) if k in ORDER else 99, k))
    looks = []
    for k in keys:
        meta = json.load(open(f'{OUT}/{k}/meta.json'))
        fam, name = NAMES.get(k, ('wavy', k.replace('-', ' ').title()))
        looks.append(dict(key=k, family=fam, name=name, anchor=meta['anchor'] if meta.get('growth', True) else 0))  # no anchor: the page doesn't shorten this look
    with open(os.path.join(ROOT, 'assets', 'js', 'lab-looks.js'), 'w') as f:
        f.write('/* generated by tools/hairlab/build_look.py — one entry per hair-type photo in assets/img/lab */\nwindow.ALARA_LOOKS = ' + json.dumps(looks, indent=2) + ';\n')

if __name__ == '__main__':
    if sys.argv[1] == '--rebuild':  # python build_look.py --rebuild [look ...]: every layer again from the existing base photo
        for k in sys.argv[2:] or [os.path.basename(os.path.dirname(f)) for f in glob.glob(f'{OUT}/*/meta.json')]:
            build(f'{OUT}/{k}/base.jpg', k, False)
    elif sys.argv[1] == '--layer':  # python build_look.py --layer oily [look ...]
        for k in sys.argv[3:] or [os.path.basename(os.path.dirname(f)) for f in glob.glob(f'{OUT}/*/meta.json')]:
            build_layer_only(k, sys.argv[2])
    else:
        build(sys.argv[1], sys.argv[2], '--align' in sys.argv)
