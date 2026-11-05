"""Bring an AI-edited photo back to the campaign model: image editors sometimes change her skin tone or hair colour.

  python match_model.py <photo> <out.jpg> [reference look]

Matches the skin and the hair to the reference look (default: ringlets) and leaves the tee and background as they are.
Run it before build_look.py."""
import os, sys
import numpy as np, cv2, mediapipe as mp
from PIL import Image
from scipy import ndimage as ndi
from mediapipe.tasks.python import vision, BaseOptions

HERE = os.path.dirname(os.path.abspath(__file__))
LAB = os.path.join(HERE, '..', '..', 'assets', 'img', 'lab')
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path=os.path.join(HERE, 'seg.tflite')), output_confidence_masks=True))

W, H = 1000, 1250  # the segmenter misreads other widths, so work at the size of the other looks

def fit(im):
    k = max(W / im.width, H / im.height); im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    l, t = (im.width - W) // 2, (im.height - H) // 2
    return np.asarray(im.crop((l, t, l + W, t + H)))

def parts(a8):
    r = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(a8)))
    cm = [np.squeeze(m.numpy_view()).copy() for m in r.confidence_masks]  # the views point at memory the next call reuses
    return cm[1], 1 - cm[0]  # hair, person

def sstep(e0, e1, x): t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)

def to_lab(a8): return cv2.cvtColor(a8, cv2.COLOR_RGB2LAB).astype(np.float32)

def transfer(lab, mask, src, ref, solid):
    """Shift the masked area toward the reference's colour. Solid pixels also take its contrast; soft edge pixels, part backdrop, only the shift (no rim)."""
    s_m, s_d = src.mean(0), src.std(0) + 1e-3; r_m, r_d = ref.mean(0), ref.std(0)
    full = (lab - s_m) * (r_d / s_d) + r_m
    full[..., 0] = np.minimum(full[..., 0], np.percentile(ref[:, 0], 97))
    shift = lab + (r_m - s_m)
    out = shift * (1 - solid[..., None]) + full * solid[..., None]
    return lab * (1 - mask[..., None]) + out * mask[..., None]

src, dst = sys.argv[1], sys.argv[2]; ref_key = sys.argv[3] if len(sys.argv) > 3 else 'ringlets'
a8 = fit(Image.open(src).convert('RGB')); r8 = np.asarray(Image.open(os.path.join(LAB, ref_key, 'base.jpg')).convert('RGB'))
hair, person = parts(a8); r_hair, r_person = parts(r8)
lab, r_lab = to_lab(a8), to_lab(r8)
L = lab[..., 0] / 255.; rL = r_lab[..., 0] / 255.
# strength by brightness: dark skin and hair get the full change, the white tee and pink backdrop none, edge pixels in between (no halo)
dark = sstep(.8, .68, L)
hair_zone = ndi.gaussian_filter(ndi.binary_dilation(hair > .3, iterations=7) * 1., 1.5)
body_zone = ndi.gaussian_filter(ndi.binary_dilation((person > .3) & (hair < .3), iterations=3) * 1., 1.5)
# the neck: everything under the hair's lower outline is skin, repainted below because dark skin tones can't be stretched that far without turning grey
rows = np.arange(H)[:, None] * np.ones((1, W)); cols = np.ones((H, 1)) * np.arange(W)[None, :]
centre = np.abs(cols - W / 2) < 170
outline = np.array([(np.where(hair[:, x] > .5)[0].max() if (hair[:, x] > .5).any() else 0) for x in range(W)])
outline = ndi.gaussian_filter1d(ndi.median_filter(outline, 21).astype(np.float32), 5)
pinkish = (a8[..., 0].astype(int) - a8[..., 1] > 15) & (a8[..., 2].astype(int) - a8[..., 1] > 4) & (a8[..., 0] > 195)
below = rows > outline[None, :]
neck = below & centre & (L < .86) & ~pinkish & (rows < outline[None, :] + 170)
neck = ndi.binary_opening(neck, iterations=2)
hair_zone = hair_zone * (1 - ndi.gaussian_filter(neck * 1., 1.5)); body_zone = np.maximum(body_zone, ndi.gaussian_filter(neck * 1., 1.5))
skin_m = dark * body_zone * (1 - hair_zone); hair_m = sstep(.82, .3, L) * hair_zone  # the more backdrop in an edge pixel, the less it changes
# reference skin: warm and clearly not tee, backdrop or hair
rr, rg, rb = r8[..., 0] / 255., r8[..., 1] / 255., r8[..., 2] / 255.
r_skin = (rr - rb > .13) & (rg - rb > .04) & (rr > .5) & (r_hair < .1) & (r_person > .5)
src_skin = ndi.binary_erosion((skin_m > .9), iterations=4)
out = transfer(lab, skin_m, lab[src_skin], r_lab[r_skin], sstep(.72, .6, L))
out = transfer(out, hair_m, lab[(hair > .7) & (dark > .9)], r_lab[r_hair > .8], sstep(.38, .2, L))
# paint the neck: her skin tone, in soft shadow under the coils and rounding off toward the sides
tone = r_lab[r_skin].mean(0)
ncols = np.where(neck.sum(0) > 8)[0]; mid, half = (ncols.min() + ncols.max()) / 2, (ncols.max() - ncols.min()) / 2 + 1
depth = np.clip((rows - outline[None, :]) / 60, 0, 1); depth = depth * depth * (3 - 2 * depth)
shade = (.66 + .34 * depth) * (1 - .07 * np.clip(np.abs(cols - mid) / half, 0, 1) ** 2)
paint = np.dstack([tone[0] * shade, np.full((H, W), tone[1]), np.full((H, W), tone[2])])
neck_a = ndi.gaussian_filter(neck * 1., 1.1)[..., None]
out = out * (1 - neck_a) + paint * neck_a
Image.fromarray(cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB)).save(dst, quality=95)
print('matched ->', dst, 'skin px', int(src_skin.sum()), 'L', round(float(lab[src_skin][:, 0].mean()), 1), '->', round(float(r_lab[r_skin][:, 0].mean()), 1), '| hair L', round(float(lab[hair > .7][:, 0].mean()), 1), '->', round(float(r_lab[r_hair > .8][:, 0].mean()), 1))
