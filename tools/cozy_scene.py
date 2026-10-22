# Usage (from the project root, with the alaraline-ai venv):
#   desktop: python tools/cozy_scene.py <photo> <cut-out png> assets/img/cozy/curls-sunday.webp 2880 1520 1.03 assets/img/cozy/linen-choc.webp 0
#   phone:   python tools/cozy_scene.py <photo> <cut-out png> assets/img/cozy/curls-sunday-phone.webp 780 1460 0.5 assets/img/cozy/linen-choc.webp -260
# The Cozy Edit hero: the user's own photo (a teddy bear in a towel turban and eye patches hugging the
# Curls On shampoo and conditioner, iced latte beside), regraded into a low-key brown scene and extended.
#   - the group (bear, bottles, coffee) is untouched apart from a slight warm grade
#   - the wall, the basket and the striped bag behind are regraded to a rich brown, keeping the photo's own
#     window light
#   - the sherpa blanket stays cream, warmed
#   - the shampoo, cut by the photo's left edge, is rebuilt (its left strip is plain pink)
#   - the canvas is extended left (and up on phones) with wall and blanket made from the photo's own tones
#     and texture, and the whole scene falls off into warm brown shadow away from the bear, like a pool of
#     window light in a dark room
import sys
import numpy as np
import cv2
from PIL import Image

SRC, CUT, OUT, W, H, S = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5]), float(sys.argv[6])   # argv[7]: brown linen texture
PW, PH = 901, 1600
rng = np.random.default_rng(7)
ph = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
G = np.asarray(Image.open(CUT).convert('RGBA').resize((PW, PH), Image.LANCZOS))[..., 3].astype(np.float32) / 255
G = cv2.GaussianBlur(G, (3, 3), 0)

def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)

# ---------- 1. rebuild the shampoo's left strip (photo coords, extended 80px to the left) ----------
PAD = 80
ext = np.zeros((PH, PW + PAD, 3), np.float32); ext[:, PAD:] = ph
Gx = np.zeros((PH, PW + PAD), np.float32); Gx[:, PAD:] = G
slope = .22                                            # the bottle's left side, measured at y 960-1040 (x 32 -> 8)
for y in range(1040, 1336):
    edge = 8 - (y - 1040) * slope
    xs = np.where(G[y, :12] > .5)[0]
    if not len(xs) or xs[0] > 0:                       # the bottle no longer touches the frame on this row
        continue
    src = np.median(ph[y, 2:9], axis=0)
    bottom = 1300 + .2 * np.arange(int(np.floor(edge)), 0)   # the base, square to the bottle's axis
    for n, x in enumerate(range(int(np.floor(edge)), 0)):
        cov = np.clip(x - edge + .5, 0, 1) * np.clip(bottom[n] - y + .5, 0, 1)
        if cov <= 0: continue
        k = 1 - .08 * np.clip(1 - (x - edge) / 10, 0, 1)   # the side turning away from the light
        X = x + PAD
        ext[y, X] = ext[y, X] * (1 - cov) + src * k * cov
        Gx[y, X] = max(Gx[y, X], cov)

# ---------- 2. regions and grade (photo coords) ----------
yy, xx = np.mgrid[0:PH, 0:PW + PAD].astype(np.float32); xp = xx - PAD
# the wall and the objects standing against it (basket, striped bag); everything else is blanket
wall_poly = np.array([[0, 0], [PW, 0], [PW, 805], [790, 805], [688, 795], [672, 560], [668, 432], [600, 445], [200, 458], [150, 470], [142, 738], [0, 742]], np.float32)
Wm = np.zeros((PH, PW), np.uint8); cv2.fillPoly(Wm, [wall_poly.astype(np.int32)], 255)
Wm = cv2.GaussianBlur(Wm.astype(np.float32) / 255, (0, 0), 3)
Wx = np.zeros((PH, PW + PAD), np.float32); Wx[:, PAD:] = Wm

lum = (ext @ np.array([.299, .587, .114], np.float32)) / 255
t = np.clip((lum - .58) / .42, 0, 1) ** 1.35
wall_dark, wall_light = np.array([58, 31, 17], np.float32), np.array([176, 104, 60], np.float32)
wall_col = wall_dark + (wall_light - wall_dark) * t[..., None]
blanket_col = ext * np.array([.97, .9, .8], np.float32) * .95
group_col = ext * np.array([1.0, .965, .925], np.float32)
graded = blanket_col * (1 - Wx[..., None]) + wall_col * Wx[..., None]
graded = graded * (1 - Gx[..., None]) + group_col * Gx[..., None]

# ---------- 3. scale the photo layer into the canvas ----------
sw, sh = int(round((PW + PAD) * S)), int(round(PH * S))
def rs(a, interp=cv2.INTER_AREA): return cv2.resize(a, (sw, sh), interpolation=interp)
g_s, G_s, W_s = rs(graded), rs(Gx), rs(Wx)
CROP = int(sys.argv[8]) if len(sys.argv) > 8 else 0   # photo rows cut off the bottom (phones)
X0, Y0 = W - sw, H - sh + int(CROP * S)    # bottom-right aligned
# how much of the photo to keep: fade its left edge (and the basket) into the rebuilt room; the group stays
keep = smooth(PAD + 10, PAD + 120, xx)                       # left edge
basket = ((yy > 380) & (yy < 748)).astype(np.float32)
keep = np.minimum(keep, 1 - basket * (1 - smooth(PAD + 150, PAD + 215, xx)))
keep = np.minimum(keep, smooth(130, 230, yy) if Y0 > 0 else 1)   # top edge, when the canvas is taller than the photo
bag = ((yy > 380) & (yy < 815) & (xp > 652)).astype(np.float32)   # the striped bag behind the bear goes too
keep = np.minimum(keep, 1 - cv2.GaussianBlur(bag, (0, 0), 6))
keep = np.minimum(keep, 1 - Wx)
if len(sys.argv) > 8 and int(sys.argv[8]) < 0:          # lifted above the canvas bottom: its lower edge melts into the rebuilt throw
    keep = np.minimum(keep, smooth(PH, PH - 110, yy))                      # the wall is rebuilt everywhere, so it is one surface
keep = np.maximum(keep, Gx)
keep_s = rs(keep.astype(np.float32))

# ---------- 4. the rebuilt room (canvas coords) ----------
CY, CX = np.mgrid[0:H, 0:W].astype(np.float32)
horizon = Y0 + 470 * S
# wall: the photo's graded wall tone, continued; blanket: the photo's cream with its own texture
wall_tone = graded[140:380, PAD + 540:PAD + 880].reshape(-1, 3).mean(axis=0) * .9
blk_tone = graded[1300:1600, PAD + 600:PAD + 900].reshape(-1, 3).mean(axis=0)
patch = graded[1262:1600, PAD + 600:PAD + 901]
hf = patch - cv2.GaussianBlur(patch, (0, 0), 7)
hf = cv2.resize(hf, None, fx=S, fy=S, interpolation=cv2.INTER_AREA)
tile = np.concatenate([hf, hf[:, ::-1]], 1); tile = np.concatenate([tile, tile[::-1]], 0)
reps = (int(np.ceil(H / tile.shape[0])) + 1, int(np.ceil(W / tile.shape[1])) + 1, 1)
tex = np.tile(tile, reps)[:H, :W]
# the throw: patches of the photo's own clean sherpa (no mirroring), soft seams, re-lit to one tone
src_p = graded[1262:1600, PAD + 600:PAD + 901]
src_p = cv2.resize(src_p, None, fx=S, fy=S, interpolation=cv2.INTER_AREA)
lowp = cv2.GaussianBlur(src_p, (0, 0), 18)
flat = src_p / np.maximum(lowp, 1) * blk_tone
P = int(120 * S); OV = int(36 * S)
acc = np.zeros((H, W, 3), np.float32); wsum = np.zeros((H, W, 1), np.float32)
ramp = np.minimum(np.linspace(0, 1, P), np.linspace(1, 0, P)); ramp = np.clip(ramp * P / OV, .02, 1)
wpatch = (ramp[:, None] * ramp[None, :])[..., None]
for ty in range(-OV, H, P - OV):
    for tx in range(-OV, W, P - OV):
        sy = rng.integers(0, flat.shape[0] - P); sx = rng.integers(0, flat.shape[1] - P)
        y0, x0 = max(0, ty), max(0, tx); y1, x1 = min(H, ty + P), min(W, tx + P)
        acc[y0:y1, x0:x1] += flat[sy + y0 - ty:sy + y1 - ty, sx + x0 - tx:sx + x1 - tx] * wpatch[y0 - ty:y1 - ty, x0 - tx:x1 - tx]
        wsum[y0:y1, x0:x1] += wpatch[y0 - ty:y1 - ty, x0 - tx:x1 - tx]
sherpa = acc / np.maximum(wsum, 1e-3)
fold = cv2.GaussianBlur(rng.normal(0, 1, (H // 8 + 1, W // 8 + 1)).astype(np.float32), (0, 0), 6)
fold = cv2.resize(fold / (np.abs(fold).max() + 1e-6), (W, H))
sherpa = sherpa * (1 + .1 * fold[..., None])
# where the throw ends: a draped edge running down and to the left, rolled under, casting a shadow
Xp = X0 + PAD * S
v = np.clip((CY - horizon) / (H - horizon), 0, 1)
edge_x = Xp - (150 + 250 * v) * S + 30 * S * np.sin(CY / (95 * S)) + 12 * S * np.sin(CY / (33 * S) + 1)
edge_x = edge_x + 170 * S * (1 - smooth(0, 150 * S, CY - horizon)) ** 2      # the throw's back corner rounds away
inside = smooth(-7 * S, 7 * S, CX - edge_x)
roll = smooth(0, 40 * S, CX - edge_x)                     # the edge curving down out of the light
sherpa = sherpa * (.72 + .28 * roll)[..., None]
sherpa = sherpa * (.78 + .22 * smooth(horizon, horizon + 260 * S, CY))[..., None]   # the back of the bed, further from the light
bed_tone = np.array([70, 40, 23], np.float32)              # a deep brown linen bed under the throw
lin = np.asarray(Image.open(sys.argv[7]).convert('RGB').resize((int(600 * S), int(900 * S)))).astype(np.float32)
lin = np.tile(lin, (int(np.ceil(H / lin.shape[0])) + 1, int(np.ceil(W / lin.shape[1])) + 1, 1))[:H, :W]
bed = bed_tone * (lin / lin.reshape(-1, 3).mean(axis=0))
shadow_band = 1 - .4 * (1 - smooth(0, 110 * S, edge_x - CX)) * (CX < edge_x)
bed = bed * shadow_band[..., None]
below = smooth(horizon - 10 * S, horizon + 14 * S, CY)[..., None]
throw = inside[..., None] * below
# window light falling across the wall behind the bear: two soft panes, slanted
win = np.zeros((H, W), np.float32)
for k in range(2):
    x0 = X0 + (PAD - 260 + k * 200) * S
    pts = np.array([[x0, -10], [x0 + 160 * S, -10], [x0 + 60 * S, horizon], [x0 - 100 * S, horizon]], np.int32)
    cv2.fillPoly(win, [pts], 1.0)
win = cv2.GaussianBlur(win, (0, 0), 22 * S) * (1 - smooth(horizon - 40 * S, horizon, CY))
wall = wall_tone * (1 + 1.1 * win[..., None]) * (1 - .3 * smooth(horizon - 70 * S, horizon, CY))[..., None]
room = wall * (1 - below) + (bed * (1 - inside[..., None]) + sherpa * inside[..., None]) * below
grain = rng.normal(0, 2.2, (H, W, 1)).astype(np.float32)
room = room + grain

# the rebuilt sherpa sinks a little around the products standing in it
y0c, x0c = max(0, Y0), max(0, X0)
py0, px0 = y0c - Y0, x0c - X0
hh, ww = min(H - y0c, sh - py0), min(W - x0c, sw - px0)     # where the photo and the canvas overlap
Gc = np.zeros((H, W), np.float32)
Gc[y0c:y0c + hh, x0c:x0c + ww] = G_s[py0:py0 + hh, px0:px0 + ww]
ao = cv2.GaussianBlur(Gc, (0, 0), 9 * S)
room = room * (1 - .45 * np.clip(ao * 1.6, 0, 1) * (1 - Gc))[..., None]
canvas = room.copy()
k = keep_s[py0:py0 + hh, px0:px0 + ww, None]
canvas[y0c:y0c + hh, x0c:x0c + ww] = room[y0c:y0c + hh, x0c:x0c + ww] * (1 - k) + g_s[py0:py0 + hh, px0:px0 + ww] * k

# ---------- 5. light: a pool of window light on the bear, warm brown shadow everywhere else ----------
cx, cy = X0 + (PAD + 430) * S, Y0 + 950 * S
ax = np.where(CX < cx, 660 * S, 1000 * S); ay = 780 * S
d = np.sqrt(((CX - cx) / ax) ** 2 + ((CY - cy) / ay) ** 2)
m = .15 + .85 * (1 - smooth(.38, 1.3, d))
shadow = np.array([44, 23, 12], np.float32)
out = shadow + (canvas - shadow) * m[..., None]
out = out * (1 + .05 * (1 - smooth(0, .6, d)))[..., None]
out = np.clip(out + rng.normal(0, 1.4, (H, W, 1)), 0, 255).astype(np.uint8)
Image.fromarray(out).save(OUT, quality=88)
print(OUT, out.shape, 'photo at', X0, Y0, 'scale', S)
