# ÀLara Line: React

A React + Vite copy of the alaraline.co homepage, plus the Christmas PR box page.

## Run it

```sh
npm install      # once
npm run dev      # http://localhost:5173
npm run build    # production files in dist/
```

## Pages

| URL | What it is |
| --- | --- |
| `/` | The alaraline.co homepage, section for section, as published on 30 Oct 2026. |
| `/christmas-banner` | The homepage with the Christmas hero: a short 3D film of the PR box on burgundy that plays once by itself. The box is in place as the page loads, the satin ribbon pulls away at once, the lid opens in a burst of gold, the products rise out and are presented one by one with their names, then settle back into the open box. Drag to turn it, hover a product to bring it forward. |
| `/christmas-banners` | Every Christmas banner option on the homepage, with a switcher strip under the banner (the left and right arrow keys work too): The Christmas Issue, Happy Holidays, The Advent Hive, The Turning Tree, Light Up the Hive, The 12 Days, Dear Santa, Torn & Pinned, and the burgundy box. |
| `/christmas-pr-box` | The ÀLara Christmas Box: a burgundy page where visitors break the gold seal and the box opens. The "Happy Holidays" bar and the "Christmas Bundles" pictures on the homepage link to it. |

## Where things live

- `src/data/site.ts`: everything the homepage shows (products, prices, badges, categories, Results Wall photos, reviews, hero products).
- `src/data/prBox.ts`: what is inside the PR box, the text for each item, and where each one lands when the box opens.
- `src/components/home/`: one file per homepage area (header, hero, product card, sections, Results Wall, Customer Love, footer).
- `src/pages/Home.tsx`, `src/pages/PrBox.tsx`: the two pages.
- `src/styles/`: `base.css` (fonts and reset), `home.css` (the live site's look), `prbox.css` (the Christmas box).
- `src/components/xmas/`: the 3D Christmas hero. `ChristmasBoxHero.tsx` (words and buttons), `boxScene.ts` (the box, lid, tray, glitter, sparks, light, and the film's timeline, with three.js), `products.ts` (the five products: a 3D version for the tray, and the studio photo itself for when they stand facing the viewer), `ribbon.ts` (the satin ribbon and bow, and how they untie), `textures.ts` (the lid print, gold foil, bee wing and labels, drawn in the browser).
- `src/components/xmas/ChristmasBanners.tsx`, `ChristmasBannersMore.tsx`, `src/styles/xmas-banners.css`, `xmas-banners-more.css`: the Christmas banner options. `tools/render_banner_art.py` renders their satin, glass, baubles, stands, shredded and torn paper into `public/live/xmas/banners/`.
- `public/live/`: images downloaded from alaraline.co, plus the Butler font, the bee and the product cut-outs.
- `public/live/xmas/`: the inside of the lid, flattened from a photo of the open box with its lettering removed and redrawn crisp in `textures.ts` (`inside-lid.jpg`), the crowned bee taken from the box lid (`lid-bee.png`), the ÀLara wordmark as a mask (`logo-mask.png`), and in `products/` the studio photos cut out (`photo-*.png`) plus the label faces used on the 3D versions.

## Before the PR box page goes live

- **The box contents are a sample.** `items` in `src/data/prBox.ts` is an "Oh Honey" ritual chosen from the catalogue. Replace it with what the real box holds. The descriptions come from the product pages; keep them that way.
- **The box is drawn in code, not photographed.** When there is a photo of the real box, it can replace the satin picture at the top of the page.
- **"Request a box"** opens an email to Info@alaraline.co with a short template. Change it if requests should go somewhere else.

## Notes

- Products link to their pages on alaraline.co. "Add to cart" only counts up in the header; there is no checkout in this copy.
- The newsletter form only shows a thank-you message; it is not connected to anything.
