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
         'ringlets': ('curly', 'Curly'), 'coily': ('coily', 'Coily')}
ORDER = ['waves', 'straight', 'curly', 'ringlets', 'coily']
TEX = {'waves': dict(len=(26, 85), curl=.04, wob=.08, n=780, fuzz=.45), 'straight': dict(len=(24, 80), curl=.02, wob=0, n=650, fuzz=.4),
       'curly': dict(len=(18, 70), curl=.07, wob=.25, n=1000, fuzz=.6), 'ringlets': dict(len=(14, 55), curl=.1, wob=.35, n=1100, fuzz=.65),
       'coily': dict(len=(10, 36), curl=.12, wob=.5, n=1400, fuzz=.8)}

seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path=os.path.join(HERE, 'seg.tflite')), output_confidence_masks=True))
rng = np.random.default_rng(11)

def masks(a):
    r = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray((np.clip(a, 0, 1) * 255).astype(np.uint8))))
    cm = [np.squeeze(m.numpy_view()) for m in r.confidence_masks]
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
    # shoulder width: widest person row in the upper-middle band below the hair top
    band = range(top + 200, min(H, top + 420))
    widths = [(pers[y] > .5).sum() for y in band]
    return top, max(widths)

def align(a):
    ref = np.asarray(Image.open(os.path.join(OUT, REF, 'base.jpg')).convert('RGB')).astype(np.float32) / 255.
    rh, rp = masks(ref); h, p = masks(a)
    rtop, rw = geometry(rh, rp); top, w = geometry(h, p)
    s = rw / w
    M = np.float32([[s, 0, W / 2 - s * W / 2], [0, s, rtop - s * top]])
    out = cv2.warpAffine(a, M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
    # campaign crop line: everything below the reference's straight cut is the reference background
    rws = (rp > .5).sum(1); yc = np.where(rws > W * .3)[0].max()
    bg_ref = ref.copy()
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
    rc = sat(a, 1.4); rc = meanc + (rc - meanc) * 1.18; rc = rc * .93; save(rgba(rc, m), f'{d}/rich.webp')
    core = ndi.gaussian_filter(ndi.binary_erosion(m > .6, iterations=8) * 1.0, 4); hp = L - ndi.gaussian_filter(L, 7)
    sp = ndi.gaussian_filter(np.clip(hp * 6, 0, 1) * (.35 + .65 * sstep(.3, .85, Ln)) * core, .9)
    save(rgba(np.ones_like(a) * np.array([1, .95, .9]), sp * .85), f'{d}/shine.webp')
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
    gy, gx = np.gradient(ndi.gaussian_filter(m, 3)); bnd = np.argwhere((m > .35) & (m < .75))
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
    ring = np.clip(ndi.gaussian_filter((m > .5) * 1.0, 7) - m, 0, 1) * opt['fuzz'] * 1.6
    halo = rgba(np.ones_like(a) * np.clip(meanc + .1, 0, 1), ring); halo.alpha_composite(fz); save(halo, f'{d}/frizz.webp')

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


def build_layer_only(key, layer):
    d = os.path.join(OUT, key)
    a = np.asarray(Image.open(f'{d}/base.jpg').convert('RGB')).astype(np.float32) / 255.
    m = np.asarray(Image.open(f'{d}/mask.webp').convert('RGBA'))[..., 3].astype(np.float32) / 255.
    {'oily': make_oily}[layer](a, m, d)
    print(key, layer, 'built')


def build(src, key, do_align):
    a = fit(Image.open(src).convert('RGB'))
    if do_align: a = align(a)
    hair, pers = masks(a)
    m = np.clip((ndi.gaussian_filter(hair, 1.0) - .12) / .72, 0, 1)
    d = os.path.join(OUT, key); os.makedirs(d, exist_ok=True)
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(f'{d}/base.jpg', quality=88, optimize=True)
    mk = np.zeros((H, W, 4), np.uint8); mk[..., 3] = (m * 255).astype(np.uint8); Image.fromarray(mk, 'RGBA').save(f'{d}/mask.webp', quality=90)
    # body plate: hair below the shoulders replaced by the white tee (only a thin band is revealed by the growth effect)
    ys = np.where(m.max(1) > .5)[0]; top, bot = ys.min(), ys.max(); anchor = int(top + (bot - top) * .45)
    Y = np.arange(H)[:, None]; xs = np.arange(W)[None, :]
    region = (m > .05) & (Y > anchor)
    teepx = a[(pers > .5) & (m < .1) & (a.mean(2) > .8) & (Y < bot)]
    tee = np.median(teepx, 0) if len(teepx) > 50 else np.array([.94, .93, .93])
    cols = np.where(m[bot - 30] > .5)[0]; cx, hw = (cols.min() + cols.max()) / 2, (cols.max() - cols.min()) / 2 + 1
    shade = (1 - .1 * np.clip(np.abs(xs - cx) / hw, 0, 1) ** 2) * (1 + ndi.gaussian_filter(rng.standard_normal((H, W)), (50, 8)) * .04)
    plate = a.copy(); plate[region] = (tee[None, None] * shade[..., None])[region]
    pl8 = cv2.inpaint((np.clip(plate, 0, 1) * 255).astype(np.uint8), (region & (np.abs(xs - cx) > hw * .93)).astype(np.uint8) * 255, 6, cv2.INPAINT_TELEA)
    Image.fromarray(pl8).save(f'{d}/plate.jpg', quality=88)
    json.dump({'top': int(top), 'bottom': int(bot), 'anchor': anchor}, open(f'{d}/meta.json', 'w'))
    make_layers(a, m, d, TEX.get(key, TEX['waves']))
    make_oily(a, m, d)
    write_manifest()
    print(key, 'built ->', d)

def write_manifest():
    keys = sorted([os.path.basename(os.path.dirname(f)) for f in glob.glob(f'{OUT}/*/meta.json')], key=lambda k: (ORDER.index(k) if k in ORDER else 99, k))
    looks = []
    for k in keys:
        meta = json.load(open(f'{OUT}/{k}/meta.json'))
        fam, name = NAMES.get(k, ('wavy', k.replace('-', ' ').title()))
        looks.append(dict(key=k, family=fam, name=name, anchor=meta['anchor']))
    with open(os.path.join(ROOT, 'assets', 'js', 'lab-looks.js'), 'w') as f:
        f.write('/* generated by tools/hairlab/build_look.py — one entry per hair-type photo in assets/img/lab */\nwindow.ALARA_LOOKS = ' + json.dumps(looks, indent=2) + ';\n')

if __name__ == '__main__':
    if sys.argv[1] == '--layer':  # python build_look.py --layer oily [look ...]
        for k in sys.argv[3:] or [os.path.basename(os.path.dirname(f)) for f in glob.glob(f'{OUT}/*/meta.json')]:
            build_layer_only(k, sys.argv[2])
    else:
        build(sys.argv[1], sys.argv[2], '--align' in sys.argv)
