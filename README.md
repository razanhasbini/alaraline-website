# ÀLara Line — 2026 rebrand prototype

Open `index.html` in Chrome or Safari. No build step or server needed. Butler is bundled locally; DM Sans and PT Serif load from Google Fonts, so an internet connection keeps the typography exact.

## Pages (mirrors alaraline.co)
The prototype now has the live site's pages, with the same components on each:
- `index.html`: Home (our hero banners, Best Sellers, the Christmas gift edit and bundles, Your Hair Essentials, Elevate, the Hair Care / Body Care / Hair Accessories tabs, Offers, Customer Love and the delivery strip);
- `shop.html`: the Shop, and each category via `shop.html?cat=offers|hair-care|curls-on-collection|hair-accessories|body-care` (price filter, sort, grid/list, pages);
- `product.html?p=<slug>`: product pages;
- `about.html` (Our Story), `ingredients.html`, `faq.html`, `contact.html` and `shipping-policy.html`;
- `wishlist.html` and `cart.html`;
- `features.html`: the new features (Hair Lab before/after, Hair Scan, ÀLara Care assistant).

**The pages are generated.** The shared head, header, footer, bag and search live in `src/partials/`, and each page's content lives in `src/pages/`. Edit those, then run `python3 tools/build_pages.py`. Don't edit the generated `.html` files at the root.

## What's in it
- **Same brand, elevated:** logo pink `#E85C9C`, blush `#F8BED6`, cream `#F7E9E3`, honey `#C26431`, orange `#F58448`; Butler, PT Serif and DM Sans; every product photo from alaraline.co (`assets/img/products/<slug>.jpg`, downloaded Nov 2026; `products/cut/` holds transparent versions for the banners), the bee illustration, the honeycomb motif, and all copy from alaraline.co (story, ingredients, FAQ, shipping policy, all 11 customer reviews, contact details).
- **All 29 live products** with real prices, sale prices, sold-out states and descriptions (`assets/js/data.js`).
- **ÀLara Hair Lab** (`assets/js/hairlab.js`, section `#hair-lab`): a before/after preview on real photography with hair-only effect layers. Everything runs in the browser; there's no AI model or server.
  - **One model, seen from behind,** on the pink cream set from the "Your Beautiful Hair Journey" campaign. Only her hair type changes. The ‹ › arrows outside the photo switch hair types; there's no swipe and no list of types.
  - **A white before/after line** inside the photo that you drag to compare.
  - **A products panel** beside the photo, the same height as the photo column, with a "Main concern" selector (Dry & frizzy, Damaged & dull, Thinning & shedding, Flakes & oily roots), tabs (All, Hair care, Accessories, Sets) and a product list that scrolls inside the panel. Pressing a product selects it and shows its effect on the photo. The arrow on its row opens the details under it: "What's inside", "Why your hair looks like this", "When you'll see it", the full ingredient list and Add to bag. "Combine products" stacks several products; the panel footer shows how many are selected.
  - **Best match** products move to the top of the list. Soft waves, Loose curls and Curly get the Curls On Collection plus the best product for the chosen concern. Coily gets Curls On, plus The Miracle Pro-Edition for "Thinning & shedding". Straight gets the top three for the concern. Curl products add hydration and shine on any hair and define the pattern on waves and curls (waves look wavier), but they don't make purely straight hair curlier.
  - **A results timeline:** First use, 1 week, 15 days, 1 month, 2 months. Masks and serums show most of their effect right away; growth and scalp products build up over weeks.
  - **Effects come from the ÀLara team's real ingredient lists.** `alaraline-ai/scripts/build_effects.py` scores each formula (ingredients higher on the label count more, rinse-off vs leave-in changes delivery, and the team's claims and timings set minimums) and writes `assets/js/hairlab-data.js`. Never hand-edit that file. The effects are capped so results stay believable, and there's deliberately no hair score.
  - Layer files (dryness, frizz, flakes, thinning, damaged ends, oily roots, hydration, definition, shine, golden glow) live in `assets/img/lab/<type>/`, masked to the hair with MediaPipe segmentation.
- A working bag, wishlist, search (⌘K), quick view, category tabs and sorting, a 5-step ritual, an interactive ingredient honeycomb, a reviews marquee, FAQ, and a shipping-policy modal. The layout is responsive from 360px up and respects reduced-motion settings.

## Christmas 2026 season
The whole site has a seasonal layer: pink × silver × winter light. `DESIGN.md` documents it and `design-showcase.html` shows it.

- **Hero, the gift box:** the first slide is a CSS-3D model of the real ÀLara gift box, built from rectified photographs of it (`assets/christmas/box/`). It arrives and turns, its silver ribbon slips off, the lid opens on its hinge and the real products are revealed. Afterwards it follows the pointer slightly. "Unwrap it again" replays it. No libraries.
- **Snow:**
  - The hero has its own snow, hanging silver, pearl and rose ornaments, and a little snow settling on the products.
  - A light snowfall covers the rest of the page, with less over the shop.
  - Soft drifts rest on the silver ribbon and on the cards of the products that are inside the gift box; a few flakes fall when you hover one.
  - A "Pause snow" control sits in the hero and in the footer.
- **Shopping:** a silver shimmer and a frost ring on the bag when you add a product, and the bag suggests the gift box until it's in it. The cart logic is unchanged.
- **Every section:**
  - a red and burgundy Christmas gift guide (before the reviews): pick who the gift is for and see four real products with Add to bag;
  - a velvet "Christmas gift edit" with every ÀLara set, linked as "Gifts" in the menu;
  - a fine gold and silver bead garland across the top of the hero and the section headers, with gold, silver and pearl ornaments hanging from it;
  - Product photos are the same all year: the Santa-hat and fairy-light photos in `assets/christmas/hats/` and `assets/christmas/products/` are no longer used;
  - visible six-armed snowflake crystals in the snowfall;
  - snow caps on the category arches;
  - snow on the Hair Lab photo, the scan and contact panels and the reviews;
  - snow banks along the velvet sections;
  - snowflake markers on the eyebrows;
  - "In the gift box" badges;
  - a seasonal announcement line and a greeting in the footer.
- **Surfaces:** a velvet announcement bar, ritual section and footer; a frosted header; a brushed-silver trust ribbon; frosted-rose cards with a silver sheen on hover.
- **Turning it off:** remove `data-season="christmas"` from `<html>` in `index.html`. The hero then shows the everyday Full Treatment Set slide. To remove it completely, also delete the four `assets/christmas/` includes.
- **Reduced motion:** the box is shown open and still, with no snowfall.
- **For a true 360° box:** the sides, back and closed lid are not in any photograph, so they are plain pink board in the model. A real 360° view needs flat, evenly lit photos of all six faces of the closed box, plus the lid lining and the empty tray, ideally 2000px wide.

## Hair Lab: adding hair types
The Lab shows one campaign model and changes only her hair. Each hair type is a folder in `assets/img/lab/<type>/` plus an entry in `assets/js/lab-looks.js`, both generated by the Hair Lab build from an edited photo of the same model (see `hair-types-kit/HOW-TO.md`). The ‹ › arrows appear active as soon as there's more than one type.

The build tools live in `tools/hairlab/`:
- `generate.py` creates a new hair type with Qwen Image Edit on Hugging Face. The token is read from the `HF_TOKEN` environment variable and never stored. A free account allows about one image a day. Without a token the script tries anonymously, but the Space currently refuses anonymous requests (not enough GPU time), so in practice a token is needed. Fallback: ChatGPT image editing with the prompts in `hair-types-kit/HOW-TO.md`.
- `match_model.py <photo> <out.jpg>` brings an edit back to the campaign model when the AI changed her skin tone or hair colour (it did on Coily): it matches both to an existing look and repaints the neck. Run it before `build_look.py`.
- `build_look.py --rebuild [key ...]` regenerates a look's mask, painted back and layers from its existing `base.jpg`.
- `build_look.py <photo> <key> --align` turns the result into a Lab look. It matches the model's size and position to the other looks, keeps the campaign crop line, and builds the masks and effect layers.

Current types: Soft waves, Straight, Loose curls, Curly, Tight curls, Full curls and Coily. Coily's hair ends above the shoulders, so growth products show fullness but no extra length.

## ÀLara Care (support assistant)
`assets/js/support.js` is the floating "Need help?" assistant. It's guided and runs in the browser:
- **How to use** any product, with the steps, frequency and when results show.
- **Not seeing results:** it asks how often, for how long and how the product is applied, then gives fixes and pairings.
- **Recommendations** by hair type, concern and budget; it swaps in sets when they cost less.
- **Orders and delivery.**
- **Handoff to the team** on WhatsApp or by email.
Usage instructions live in `assets/js/data.js` (`USAGE`) and are a **draft for the ÀLara team to confirm**. It can later be connected to a live AI or a human agent.

## Hair Scan (demo)
`assets/js/scan.js` lets users upload a photo or use their camera, then shows hair type, porosity, density, scores and a routine within their budget. The photo never leaves the device. **Results are simulated** (labelled on the page) until the real model is plugged in: define `window.AlaraHairModel.analyze(canvas)` returning the shape documented at the top of `scan.js`, and the section uses it automatically.

## AI features: architecture and plan

Full plan with diagrams: [ÀLara Line: AI Features Architecture & Plan](https://claude.ai/code/artifact/ecdaeca7-19b2-4e05-981e-ed36ddf9c637). The three AI services live in a separate repository, `alaraline-ai` (see its README).

### How alaraline.co is built
| Layer | What it is | Version |
| --- | --- | --- |
| Backend language | PHP | 8.2.34 |
| System (CMS) | WordPress (written in PHP) | 7.1.x |
| Shop | WooCommerce | 11.2 |
| Theme | Makeaholic by ThemeMove | 2.1.4 |
| Page builder | Elementor | 4.3.4 |
| Hosting | Hostinger, with its CDN | |

Plugins visible on public pages:
- **Shop extras:** Price Based on Countries (+ Pro), Woo Advanced Discounts, Woo Brand, Smart Wishlist, Smart Compare, Insight Swatches
- **Shipping and payments:** Aramex Shipping, Visa Acceptance Solutions
- **Marketing:** Facebook for WooCommerce, Creative Mail, Yoast SEO
- **Other:** Jetpack (forms, stats), Profile Builder, Real-Time Auto Find and Replace

To check it yourself: DevTools → Network → the page's own request → Response Headers (`x-powered-by`, `server`, `platform`); page source → search `/wp-content/plugins/` and `/themes/`; the API list at alaraline.co/wp-json/.

### How the back end works
- **Contact form:** Jetpack Forms saves each message (wp-admin → Feedback) and emails it to Info@alaraline.co.
- **Orders:** cart → checkout (country pricing, discounts, Aramex shipping rate) → payment (Cash on Delivery or card via Visa Acceptance Solutions) → order saved (emails to customer and shop, sale reported to Meta) → Aramex shipment (tracking number and label, usually created with one click) → courier delivers, order completed.
- **Background:** Creative Mail sends newsletters, Jetpack runs stats and security, Facebook for WooCommerce syncs the catalogue.

### Target architecture
One WordPress plugin (PHP) puts the three widgets (HTML, CSS, JS) on the site and is the only thing that talks to three Python services:
- **Hair Analyzer:** a vision model that reads a hair photo.
- **Care Assistant:** Claude plus ÀLara's product knowledge.
- **Recommendation engine:** product scoring that starts from rules and learns from orders.

The customer's browser only calls alaraline.co. The plugin keeps the API keys and reads products and the real cart from WooCommerce.

### Integration rules
1. Add to bag goes into the **real WooCommerce cart** (Store API), so pricing, discounts, Aramex, payment, emails and Facebook keep working.
2. Hand-offs to the team go through the contact-form channel or WhatsApp. Order lookups are read-only, after order number and email.
3. Never touch the database directly, and never change existing settings.
4. Test only on a **staging** copy, with Aramex in test mode and outgoing email off.
5. Deactivating the plugin removes everything.

### Access and setup
- [ ] WordPress Administrator account in your own name
- [ ] Hostinger hPanel access (backups and one-click staging)
- [ ] Full backup, then a staging site
- [ ] Check Aramex settings (automatic or manual shipments)
- [ ] Local copy on the development laptop: PHP 8.2, WordPress 7.1, WooCommerce 11.2
- [ ] Private GitHub repository; secrets in `.env` only

### Roadmap
0. **Access and setup.** Gate: the plugin installs on staging.
1. **Assistant first:** plugin skeleton, Care Assistant, recommendations v1, real cart. Gate: the 100-question eval set passes.
2. **Hair Analyzer:** licensed and generated data, labelling, training, evaluation. Gate: the accuracy goal is met for every hair type.
3. **Launch and learn:** live behind a switch, monitoring, opt-in feedback, recommender v2.

## Hero videos
The hero automatically plays `assets/video/hero-miracle.mp4` (plus an optional `-mobile` version) once it exists; until then it shows the photo. The box slide's video slot was removed when the Christmas gift box took its place; restore it in `index.html` after the season if you make `hero-box.mp4`. The source images and AI video prompts are in `hero-video-kit/`.

## Needs wiring before launch
- **Checkout** hands off to `alaraline.co/cart/`. Connect the bag to WooCommerce (Store API `/wp-json/wc/store/v1/cart/add-item`) during theme integration.
- **Newsletter** stores the email locally only. Connect it to the real mailing tool.
- **Contact form** opens the visitor's email app addressed to Info@alaraline.co. Swap in the Jetpack form endpoint if preferred.
- **TikTok** has no link on the live site, so it points to a TikTok search for now. Add the official profile URL.
- The live site's off-canvas "About us" panel still shows Lorem ipsum placeholder text. This redesign drops it.
- The Hair Lab is an illustrative simulation (it says so on the page), not a clinical prediction.

## Hair Lab photo credits
Every hair type starts from the brand's own model photo from ÀLara's "Your Beautiful Hair Journey" Instagram post (`hair-types-kit/model.jpg`). The other hair types are edits of that same photo made with Qwen Image Edit (Apache 2.0 license, which allows commercial use; no watermark). No stock photos are used.

For launch, the strongest version is an ÀLara shoot: the same model, or several models with different hair, photographed from behind in a white tee like the campaign post. Re-run the layer build on those photos.
