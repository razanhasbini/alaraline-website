# Handoff: ÀLara Line rebrand and before/after module

You're picking up an ongoing project for ÀLara Line (alaraline.co), a Lebanese organic hair-care brand. The user is redesigning their website to impress the CEO and adding AI features. Read this fully before touching anything.

## The two folders
- `~/Desktop/alaraline`: the redesigned website. It's static HTML, CSS and JS (open `index.html` or serve the folder; no build step). It's a prototype; the live site is WordPress.
- `~/Desktop/alaraline-ai`: three Python (FastAPI) services, plus the shared product and ingredient knowledge. **These services are paused.** The user said to focus only on the before/after module for now.
- `~/Desktop/alaraline/alaraline/` is an untouched Vite + React starter the user created. The user asked why we didn't use React. A port was offered but never confirmed, so don't start it without asking.

## The live site
alaraline.co runs WordPress 7.1 with WooCommerce 11.2, PHP 8.2, the Makeaholic theme and Elementor, hosted on Hostinger.
- **Plan:** later, a WordPress plugin (PHP) will embed our widgets. "Add to bag" will go into the real WooCommerce cart, and we never touch the database or existing settings.
- **Access:** the user doesn't have wp-admin access yet.
- **Architecture doc:** https://claude.ai/code/artifact/ecdaeca7-19b2-4e05-981e-ed36ddf9c637 (also summarised in the website README).

## Christmas 2026 season (live in the prototype)
See the "Christmas 2026 season" section in `README.md`, plus `DESIGN.md` and `design-showcase.html`. All the code is in `assets/christmas/`; turn it off by removing `data-season="christmas"` from `<html>`. The user rejected pine garlands and cartoon bows as childish, so keep to pink, silver and pearl.

## Current focus: the before/after module (Hair Lab, section `#hair-lab`)
**What the user wants:**
- **One real model, seen from behind,** on the pink cream background from ÀLara's Instagram post "Your Beautiful Hair Journey". Only her hair type changes.
- **Arrows outside the photo** (‹ ›) switch the hair type. There's no swipe and no list of hair types.
- **A white before/after line** inside the photo that the user can drag.
- **A products panel on the right.** Pressing a product selects it and shows its effect on the photo. Details open only from the arrow on its row (the user's request): "What's inside", "Why your hair looks like this", "When you'll see it", the full ingredient list, and Add to bag.
- **"Combine products"** stacks several products at once.
- **Curl Boosting Cream defines hardest on the tightest curls** (the user's request): `CURL_BOOST` in `hairlab.js` sets it per look (Tight curls, Full curls and Coily full, other curly and wavy looks about half, Straight none). It drives the `crisp` layer, which only deepens the gaps between curls, because brighter crests read as oily. Sets containing the cream inherit it.
- **No results card:** the user removed the card under the photo (product name, Add to bag, percentages) as useless. Add to bag lives in the expanded details.
- **A results timeline:** First use, 1 week, 15 days, 1 month, 2 months.
- **A main-concern selector:** Dry & frizzy, Damaged & dull, Thinning & shedding, Flakes & oily roots.
- **No hair score.** The user removed it on purpose.

**Hair types so far** (each in `assets/img/lab/<key>/`, listed in `assets/js/lab-looks.js`): `waves`, `straight`, `curly` (shown as "Loose curls") and `ringlets` (shown as "Curly"), `tight` (shown as "Tight curls", between Curly and Coily), `fullcurl` (shown as "Full curls", curly from the roots; generated from the Coily photo with `HAIRLAB_SRC`, because edits of the campaign photo keep its smooth crown) and `coily` (shown as "Coily"). Coily's hair ends above the shoulders, so it isn't drawn shorter: `anchor` is 0 in `lab-looks.js`, and growth products show fullness but no extra length.

### How it works (no AI model, no server: it all runs in the browser)
1. `alaraline-ai/knowledge/ingredients.json` lists 77 ingredients. Each has a role, visible-effect strengths from 0 to 1 (hydrate, smooth, frizz, define, hold, shine, glow, strength, density, length, scalp, flakes, oil, cleanse, protect, scent) and an evidence level.
2. `alaraline-ai/knowledge/source/formulas.json` holds the ÀLara team's real ingredient lists in label order, the product format, the team's claims (light, moderate, strong, very strong) and timing (for example, the Miracle Pro-Edition reduces shedding from about day 10 and shows new growth from day 15).
3. `python scripts/build_effects.py` (run from `alaraline-ai`, using `.venv`) builds each product's effect profile:
   - ingredients higher on the label count more;
   - the product format (rinse-off vs leave-in) scales delivery;
   - the team's claims set a minimum for the effects they promise.
   It writes `alaraline-ai/knowledge/catalog.json` and the generated website file `alaraline/assets/js/hairlab-data.js` (never hand-edit that file). It also lists any ingredient name it doesn't recognise.
4. On the website, `assets/js/data.js` merges `window.ALARA_FX` into each product. `assets/js/hairlab.js` then turns the concern's starting state plus each product's timed effects into opacities for the photo layers.
5. **Photo layers per look** (pre-rendered, hair-masked): `rich`, `soft`, `dry`, `ends`, `thin`, `oily`, `define`, `frizz`, `flakes`, `shine` and `glow` as `.webp`, plus `base.jpg`, `plate.jpg` (a clean tee and arms painted to fit the body visible around the hair, used for growth), `mask.webp` and `meta.json`. Growth works by redrawing the lengths shorter before treatment and at full length after. Shine is broad, soft light in the hair's own colour, kept clear of the scalp; the user rejected thin white streaks and darker, contrasty "hydrated" hair because they read as oily.

### Adding a hair type (same model, only the hair changes)
- **Generate:** `tools/hairlab/generate.py <key>` calls Qwen-Image-Edit on Hugging Face. It reads the `HF_TOKEN` environment variable, so ask the user for it; never write it to a file. A free account gets about one image per day; when the quota is used, ask the user to wait or use ChatGPT image editing with `hair-types-kit/model.jpg` and the prompts in `hair-types-kit/HOW-TO.md`.
- **Build:** `tools/hairlab/build_look.py <photo> <key> --align` aligns the model to the `waves` look, keeps the campaign crop line, segments the hair with MediaPipe, builds every layer and regenerates `lab-looks.js`. Add new keys to `NAMES` and `ORDER` in that script.
- **Rebuild one layer** on every look with `build_look.py --layer oily`.
- **Python:** these scripts need numpy, scipy, opencv, mediapipe, pillow and gradio_client. The `alaraline-ai/.venv` environment has most of them; `seg.tflite` lives in `tools/hairlab/`.
- **Match the model:** `tools/hairlab/match_model.py <photo> <out.jpg>` restores her skin tone and a brown hair colour when the AI changes them, as it did on Coily. Build from its output.
- **Rebuild:** `tools/hairlab/build_look.py --rebuild [key ...]` regenerates a look's mask, plate and layers from its existing `base.jpg`.
- **Check the result:** always review generated images visually, for the same face/back, the same tee and background, and no chopped hair.

### Testing
- Serve the site with `cd ~/Desktop/alaraline && python3 -m http.server 8080` and open `http://127.0.0.1:8080/#hair-lab`.
- Earlier sessions used headless Chrome (`puppeteer-core` driving `/Applications/Google Chrome.app`) to click products and timeline days and screenshot `.lab-stage`. Those scripts lived in a temporary scratchpad and are gone, so recreate them if needed.
- Expected 404s for `assets/video/hero-*.mp4` are normal; those videos haven't been made yet.

## Open items for the before/after
- [x] Generate and build the **Coily** look (awaiting the user's review).
- [ ] Ask the ÀLara team for the missing **ingredient lists**: Heat Protectant, Detox Scalp Scrub, and the full list for the Edge Control Wax Stick (only key ingredients are known).
- [ ] Ask the team to confirm two formulas:
  - whether the **Tropical Vanilla** shampoo and conditioner share formulas with the Oh Honey versions;
  - which scent the conditioner's "Coconut Fragrance, Vanilla Extract" belongs to.
- [ ] **4 Hair Mists, ÀLara's Pouch and the tanning oil** have no formula; that's fine, since they're not hair treatments.
- [x] **Outdated README:** updated to the current design (one model, arrows, panel, five-step timeline, ingredient-based effects, photo credits).
- [ ] The user wants a "professional panel" feel. Keep polishing the layout, but the structure above is approved. (Oct 15: products panel is now a fixed-height panel beside the photo with a 2×2 concern selector, tabs, a scrolling product list and a selection footer; awaiting the user's review.)

## User preferences (important)
- **Keep the ÀLara brand:** colours (#E85C9C pink, #F8BED6 blush, #F7E9E3 cream, #C26431 honey), Butler, PT Serif and DM Sans fonts, the photos and the bee.
- **Realistic, not overdone:** the user rejected cartoonish drawings and "too perfect" results. Effects must be clearly visible but believable, and a fragrance mist must not look like a transformation.
- **Clean, uncrowded UI.** The user rejected cramped layouts and messy sliders.
- **Free tools only, with no watermarks.**
- **The user is learning the stack:** explain things simply, and teach when asked.
- **Product facts come only from the user/ÀLara team or alaraline.co.** Never invent claims.

## Rules
- **No secrets in files.** A Hugging Face token exists but was shared in chat; tell the user to delete and rotate it when generation is done.
- **Verify the user's changes first.** Files may have been edited outside your session, so read before editing.
- **SEO** was audited on the live site (missing meta descriptions, weak titles, a homepage H1 of "Home", missing alt text, no review or brand data, about 1.7 s to first byte). Those fixes need wp-admin access, so they're not part of the current work.
