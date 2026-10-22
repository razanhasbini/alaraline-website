"""Generate a new hair type on the campaign model with Qwen-Image-Edit (Hugging Face, free tier).
Usage:  HF_TOKEN=<your token> python generate.py <key> [out_dir]
The token is read from the environment only and never written to disk; without one the Space runs anonymously (smaller quota).
Free accounts get roughly one image per day on this Space."""
import os, sys, shutil, time
from gradio_client import Client, handle_file

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = os.path.join(HERE, '..', '..', 'hair-types-kit', 'model.jpg')
KEEP = (" Keep everything else exactly the same: the same woman seen from behind in the same pose, the same white t-shirt, "
        "the same pink creamy background, the same soft lighting, framing and camera angle. Photorealistic professional hair-care campaign photo.")
PROMPTS = {
    'straight': "Change only her hair: make her long brown hair completely straight, sleek and smooth with a natural shine, falling straight down her back, same length and same brown color.",
    'curly': "Change only her hair: give her naturally curly hair with defined, bouncy spiral ringlet curls (type 3B), a bit more volume, reaching her mid-back, same brown color.",
    'ringlets': "Change only her hair texture: replace her waves with genuinely curly hair made of many small, tight, springy spiral ringlet curls (type 3B to 3C curls), each curl about the width of a finger, with natural curly volume and a rounder shape, ending at her mid-back, same brown color. Not waves, real tight curls.",
    'coily': "Change only her hair: give her very coily, natural afro-textured hair (type 4C): dense, tightly packed small coils and zig-zag strands with no loose waves, "
             "a soft matte natural sheen, full rounded volume, reaching just past her shoulders, dark brown color.",
}

def main():
    key = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'out')
    os.makedirs(out, exist_ok=True)
    c = Client("Qwen/Qwen-Image-Edit", verbose=False, token=os.environ.get("HF_TOKEN"))
    t = time.time()
    r, _ = c.predict(image=handle_file(MODEL), prompt=PROMPTS[key] + KEEP, seed=11, randomize_seed=False,
                     true_guidance_scale=4.0, num_inference_steps=28, rewrite_prompt=False, api_name="/infer")
    dst = os.path.join(out, f'{key}.webp')
    shutil.copy(r if isinstance(r, str) else r['path'], dst)
    print(key, 'ok', round(time.time() - t), 's ->', dst)

if __name__ == '__main__':
    main()
