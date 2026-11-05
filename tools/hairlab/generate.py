"""Generate a new hair type on the campaign model with Qwen-Image-Edit (Hugging Face, free tier).
Usage:  HF_TOKEN=<your token> python generate.py <key> [out_dir]
Set HAIRLAB_SRC=<photo> to edit a different starting photo, e.g. one already curly at the roots.
The token is read from the environment only and never written to disk; without one the Space runs anonymously (smaller quota).
Free accounts get roughly one image per day on this Space."""
import os, sys, shutil, time
from gradio_client import Client, handle_file

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = os.environ.get('HAIRLAB_SRC') or os.path.join(HERE, '..', '..', 'hair-types-kit', 'model.jpg')
KEEP = (" Keep everything else exactly the same: the same woman seen from behind in the same pose, the same white t-shirt, "
        "the same pink creamy background, the same soft lighting, framing and camera angle. Photorealistic professional hair-care campaign photo.")
PROMPTS = {
    'straight': "Change only her hair: make her long brown hair completely straight, sleek and smooth with a natural shine, falling straight down her back, same length and same brown color.",
    'curly': "Change only her hair: give her naturally curly hair with defined, bouncy spiral ringlet curls (type 3B), a bit more volume, reaching her mid-back, same brown color.",
    'ringlets': "Change only her hair texture: replace her waves with genuinely curly hair made of many small, tight, springy spiral ringlet curls (type 3B to 3C curls), each curl about the width of a finger, with natural curly volume and a rounder shape, ending at her mid-back, same brown color. Not waves, real tight curls.",
    'tight': "Replace her hair with short-to-medium, very tightly curled corkscrew hair (type 4A): hundreds of small, springy, separate spiral coils, each coil only as wide as a pencil, far tighter than ringlets, with no big waves or loose spirals. "
             "The hair is full and rounded with lots of volume and ends at her upper back, just below the shoulders, so most of the white t-shirt, the sleeves and her arms stay visible. It still has clear individual curls, so it is not a cottony afro. "
             "Keep her light skin tone exactly as it is. Medium brown color.",
    'fullcurl': "Change only her hair: loosen these tiny coils into bigger, longer, defined spiral curls (type 3C), each curl about as wide as a marker pen, and let the hair grow longer so it ends between her shoulder blades, covering her neck and the top of the t-shirt. "
                "Keep the hair curly right from the scalp: the crown and the parting stay fully curly with natural round volume, and there is no smooth, flat or straight section anywhere. The curls are even from top to bottom. Not waves, not a cottony afro, not tiny coils. "
                "Keep her light skin tone exactly as it is. Medium brown color.",
    'coily': "Replace her hair entirely with a natural shoulder-length afro: extremely tight, tiny kinky coils (type 4C), dense and cottony with a soft natural texture, "
             "no ringlets, no spirals, no long curls and no waves. The hair forms a full rounded shape and stops at her shoulders, so the white t-shirt on her upper back is visible. Dark brown color.",
}

def full_space(prompt):
    c = Client("Qwen/Qwen-Image-Edit", verbose=False, token=os.environ.get("HF_TOKEN"))
    r, _ = c.predict(image=handle_file(MODEL), prompt=prompt, seed=11, randomize_seed=False,
                     true_guidance_scale=4.0, num_inference_steps=28, rewrite_prompt=False, api_name="/infer")
    return r if isinstance(r, str) else r['path']

def fast_space(prompt):
    # 4-step version: uses far less of the free GPU allowance
    c = Client("linoyts/Qwen-Image-Edit-2511-Fast", verbose=False, token=os.environ.get("HF_TOKEN"))
    r, _ = c.predict(images=[{'image': handle_file(MODEL)}], prompt=prompt, seed=11, randomize_seed=False,
                     true_guidance_scale=1.0, num_inference_steps=4, height=1280, width=1024, rewrite_prompt=False, api_name="/infer")
    img = r[0]['image']
    return img if isinstance(img, str) else img['path']

def main():
    key = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'out')
    os.makedirs(out, exist_ok=True)
    t = time.time()
    try:
        src = full_space(PROMPTS[key] + KEEP)
    except Exception as e:
        print('main Space failed, trying the fast one:', e)
        src = fast_space(PROMPTS[key] + KEEP)
    dst = os.path.join(out, f'{key}{os.path.splitext(src)[1] or ".webp"}')
    shutil.copy(src, dst)
    print(key, 'ok', round(time.time() - t), 's ->', dst)

if __name__ == '__main__':
    main()
