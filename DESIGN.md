---
version: alpha
name: ÀLara Line — Christmas 2026
description: "ÀLara Line is a Lebanese, pharmacy-developed organic hair-care brand whose identity is a warm pearl canvas ({colors.canvas} #FCF8F8) carrying one chromatic voltage, the logo pink ({colors.primary} #E85C9C), used for the primary CTA, links, focus and the italic accent word in headlines. Display type is Butler (a high-contrast didone) over DM Sans body text, with PT Serif italic for the single emphasised word. The Christmas 2026 layer keeps every brand rule and adds a cool counter-material: brushed silver ({colors.silver} #C5CAD3), pearl and frosted rose, so the season reads as luxury packaging and winter light rather than red-and-green decoration. The unmistakable object is the real ÀLara gift box: pink board, gold-foil bee, honeycomb foil, a bee-wing lid lining."

colors:
  primary: "#E85C9C"
  primary-hover: "#C93F7F"
  primary-focus: "#E85C9C"
  on-primary: "#FFFFFF"
  ink: "#23171C"
  ink-muted: "#4A3A41"
  ink-subtle: "#7A6870"
  canvas: "#FCF8F8"
  surface-blush: "#FBEFF3"
  surface-frost: "#F6E4EA"
  surface-cream: "#F7E9E3"
  surface-velvet: "#3B1528"
  hairline: "#EDE3E6"
  hairline-silver: "#D9DDE4"
  silver: "#C5CAD3"
  silver-strong: "#8D94A1"
  silver-ink: "#5F6673"
  silver-soft: "#ECEEF2"
  pearl: "#FFFFFF"
  champagne: "#E3CFA8"
  accent-gold-foil: "#C9A06A"
  frost-glass: "rgba(255, 252, 252, 0.72)"
  snow: "#FFFFFF"
  snow-shadow: "rgba(96, 104, 132, 0.28)"
  semantic-overlay: "rgba(35, 23, 28, 0.42)"
  success: "#2F7D5B"
  error: "#C0392B"

typography:
  display-xl:
    fontFamily: "Butler, 'PT Serif', Georgia, serif"
    fontSize: 66px
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: -0.66px
  display-lg:
    fontFamily: "Butler, 'PT Serif', Georgia, serif"
    fontSize: 54px
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: -0.5px
  accent-italic:
    fontFamily: "'PT Serif', Georgia, serif"
    fontStyle: italic
    fontWeight: 400
  card-title:
    fontFamily: "Butler, 'PT Serif', Georgia, serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0px
  body-md:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: 0px
  body-sm:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  eyebrow:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 2.6px
  button:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 1.3px
  caption:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: 12.5px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.75px

rounded:
  sm: 14px
  lg: 22px
  pill: 9999px
  full: 9999px

spacing:
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 36px
  xxl: 64px
  section: 140px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 0 28px
    height: 52px
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
  button-pearl-sheen:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
  product-card:
    backgroundColor: "{colors.surface-frost}"
    textColor: "{colors.ink}"
    typography: "{typography.card-title}"
    rounded: "{rounded.lg}"
  header-frosted:
    backgroundColor: "{colors.frost-glass}"
    textColor: "{colors.ink}"
  announcement-velvet:
    backgroundColor: "{colors.surface-velvet}"
    textColor: "{colors.surface-blush}"
    typography: "{typography.caption}"
  ribbon-silver:
    backgroundColor: "{colors.silver-soft}"
    textColor: "{colors.ink}"
  drawer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  gift-stage:
    backgroundColor: "{colors.surface-frost}"
    textColor: "{colors.ink}"
---

## Overview

ÀLara Line sells organic, pharmacy-developed hair care from Lebanon. Its everyday identity is warm and
soft: a pearl canvas, the logo pink as the only loud colour, Butler display type with one italic word
in pink, and the brand's own photography (products on blush sets, honey, bees, a campaign model seen
from behind). Where most beauty brands at Christmas switch to red, green and gold confetti, ÀLara's
Christmas layer keeps its pink and adds **silver**: brushed-silver ribbons, pearl, frosted glass and
snow. The season is told through the real ÀLara gift box, not through generic holiday clip-art.

The Christmas layer is a theme, not a fork. It is switched on by `data-season="christmas"` on the
`<html>` element and lives entirely in `assets/christmas/`. Removing the attribute restores the
everyday brand exactly.

## Colors

- **Canvas** `{colors.canvas}`: pearl with the faintest warmth. Sections alternate with
  `{colors.surface-blush}` and `{colors.surface-frost}`; never a saturated pink section background.
- **Voltage** `{colors.primary}`: primary CTA, links on hover, focus ring, the italic accent word,
  price highlights. One pink element per view is the target, never more than three.
- **Silver** is the seasonal counter-material: `{colors.silver}` for ribbons and hairlines on dark,
  `{colors.hairline-silver}` for hairlines on pearl, `{colors.silver-ink}` whenever silver has to be
  read as text (it passes 4.5:1 on canvas; `{colors.silver}` does not).
- **Velvet** `{colors.surface-velvet}` replaces near-black for the announcement bar and the footer,
  a deep berry that keeps the pink family dark.
- **Champagne** `{colors.champagne}` and the box's own gold foil `{colors.accent-gold-foil}` appear only
  as small highlights (one ornament, a glint), because the packaging already carries gold.
- **Snow** `{colors.snow}` always carries a cool contour `{colors.snow-shadow}` so it reads on white.

## Typography

Butler for display and card titles, DM Sans for everything readable, PT Serif italic for the one
accented word in a headline. Christmas adds no new face. Eyebrows are 12px DM Sans 600, tracked
2.6px, uppercase. Headlines stay within two lines at every width; the hero headline is
"Unwrap your *Christmas glow*" (24 characters).

## Layout

Single page, max content width 1320px, gutters `clamp(16px, 4vw, 48px)`. Sections are
`clamp(72px, 10vw, 140px)` apart. The hero is a three-slide stage: the Gift (first, the signature
moment), Curls On, The Miracle Pro-Edition. Hero copy always sits left on desktop and top on phones;
pictures and the gift box sit right/bottom.

## Elevation & Depth

Depth is soft and warm: `0 30px 60px -30px rgba(160, 50, 100, .35)` for lifted cards, a contact
shadow under products. Christmas adds frosted glass (`{colors.frost-glass}` + 14px backdrop blur) for
the header, drawers' heads and the search panel, and a silver hairline (`{colors.hairline-silver}`)
under frosted surfaces. No neon glows, no outer glows on text.

## Shapes

Cards and panels 22px; small panels 14px; buttons, chips and tabs are pills. Snow edges are the only
irregular shape in the system: soft, lumpy, always on a top edge, never over text.

## Components

- **Gift stage (hero).** A CSS-3D model of the real box built from rectified photographs: base front
  with the gold-foil bee, honeycomb ledge, tray front wall, lid lining with the bee wing, and the
  products, unprojected from the photo onto the tray's opening so they physically sit inside the box.
  The closed lid's outer face is not photographed anywhere, so it is a designed face: pink board, the
  same gold-foil bee, a silver satin ribbon and a pearl seal. Sequence, under one continuous camera
  move (0–7.6s): the seal lifts (2.7–3.2s); the ribbon halves are drawn off both sides, their tails
  trailing (3.0–4.1s); the lid pops off its magnet (3.5–3.8s), is lifted open by hand (4.05–6.1s) and
  settles back on its hinge (to 6.8s); light reaches into the tray as it opens. Nothing fades in.
  The headline and CTA are readable from the first frame.
- **Product card.** Frosted-rose media, 22px radius. On hover: 6px lift, a single silver sheen sweeps
  across the media once, and if the card carries a snow edge, a few flakes fall from it.
- **Snow edge.** A soft drift resting exactly on the top edge of a surface: the trust ribbon, and the
  picture frame of each product that is inside the gift box (Full Treatment Set, The Miracle
  Pro-Edition, Leave In Your Dreams, Miracle Mask, the shampoos and conditioners). It covers the left
  two thirds of the edge, clear of the wishlist button, and grows in once when it enters the view.
- **Snow on the products (hero).** On the Curls On and Miracle slides a few flakes settle on the
  products' real top edges (jar rims, the bottle's shoulders) and melt away after 25–45 s.
- **Hanging ornaments (hero).** Mirror-glass and satin baubles and teardrops in silver, pearl, blush,
  rose and one champagne, on silver satin ribbons at staggered heights, clear of the headline. They
  sway with the snow's wind; now and then a glint crosses the glass.
- **The Christmas gift guide (red and burgundy).** The one section in true Christmas red: a red
  (#A01C31) to burgundy (#4A0A1C) ground with a faint gold-foil snowflake pattern, gold (#E3C37C)
  eyebrow and accent word, cream cards, burgundy "Add" buttons that turn gold on hover. Visitors
  choose who the gift is for (curls, longer and fuller hair, the one who has everything, under $20)
  and see four real products with real prices; sold-out products drop out. Red stays inside this
  section.
- **Bead garland.** A fine strand of gold and silver beads with a pearl every seventh bead, draped in
  shallow swags: across the full top of the hero, and over the two top corners of each section
  (clear of the centred heading; one corner on ≤900px).
- **Ornaments.** Gold, silver, pearl and champagne mirror-glass baubles and teardrops hang from the
  garland on thin gold threads, swaying 1.8°.
- **Product photos stay real.** Products always show their alaraline.co photos, in season too. No Santa hats or
  fairy lights on the products (removed at the owner's request; the old files remain in assets/christmas/hats/).
- **Snow caps on the category arches,** following the arch and only where it faces up.
- **Snow banks** along the bottom of the velvet sections (gift edit, ritual).
- **The Christmas gift edit.** A velvet section after Best Sellers: the gift box as the feature, the
  four other sets as pearl tiles with a silver corner ribbon; prices and savings from the catalogue.
- **Eyebrows** carry a small snowflake in place of the dot.
- **Bag.** Suggests the gift box (with its saving) until it is in the bag.
- **Pause snow.** A snowflake button in the hero controls and a "Pause snow" link in the footer stop
  all snow on the page (and the ornaments' sway); the choice is remembered.
- **Buttons.** Pink pill; on hover a pearl sheen passes once over the label, then the existing ink
  fill. Labels stay white and 13px/600.
- **Add to bag.** A six-point silver shimmer bursts from the button; the bag icon gets a frost ring and
  the count bumps. Nothing delays the cart update.
- **Announcement bar.** Velvet, pearl text, unchanged messages.
- **Footer.** Velvet, with silver hairlines; the "Pause snow" link sits in its base line.
- **Trust ribbon.** Brushed silver satin band with ink text and pink hexagons, snow on its top edge.

## Do's and Don'ts

Do:
- Keep it legible as Christmas at a glance: gold and silver must read, snowflakes must be visible as
  crystals, not just specks.
- Use the real packaging and real product photography for everything that shows a product.
- Keep pink scarce; let silver and pearl do the seasonal work.
- Keep every animation optional: content is complete and readable with motion off.
- Keep snow under 120 flakes on desktop, 50 on phones outside the hero, and pause it off screen.

Don't:
- Don't use red outside the gift guide, and never green. No pine garlands, cartoon bows, candy canes
  or Santa figures (rejected by the brand owner as childish). No Santa hats on the bottles either.
- Don't invent packaging that contradicts the photographs, and never redraw a product label.
- Don't put snow, ornaments or sparkles over prices, product names, labels or CTAs.
- Don't use glitter textures, rainbow foil, or gradients as decoration; gradients exist only as light
  (studio sweep, satin sheen).
- Don't add a second chromatic accent; silver is a material, not a colour.

## Responsive Behavior

- **> 900px:** hero copy left, gift box in the space to its right; the box is measured across its
  whole sequence and fitted so it never touches the copy or the slide controls. Eight hero ornaments.
- **≤ 900px:** hero copy on top; the box is fitted between the copy and the slide controls; five
  small ornaments that hang above the eyebrow.
- **≤ 760px:** site snow 40 flakes instead of 90.
- **Touch screens:** hover-only effects (button sheen, card sheen, flakes falling from a card, the
  box following the pointer) do not run.
- **prefers-reduced-motion:** the gift box shows its finished, open composition and its replay link is
  hidden; no site snow and no pause control (nothing moves); snow edges and the hero's still winter
  scene stay as static decoration.

## Iteration Guide

- "Add a Christmas treatment to a new section": use `{colors.surface-frost}` or `{colors.canvas}`,
  a silver hairline, and at most one snow edge on its top border. No new colours.
- "Add a seasonal badge": pill, `{colors.silver-soft}` background, `{colors.silver-ink}` text, 10px
  uppercase 700.
- "Turn Christmas off": remove `data-season="christmas"` from `<html>` in `index.html`. The scripts
  stop at their first line, the stylesheet's rules no longer match, and the hero shows the everyday
  Full Treatment Set slide. To remove the season completely, also delete the four `assets/christmas/`
  includes (one stylesheet, three scripts).

## Cozy Edit banner: Curls On, Sunday morning

The second hero slide (`.hero-cozy`, `assets/css/cozy.css`) runs all year. It is built from the brand's own photo: a teddy bear in a towel turban, bathrobe and eye patches hugging the Curls On shampoo and conditioner, with an iced latte. `tools/cozy_scene.py` turns it into one low-key image (`assets/img/cozy/curls-sunday.webp`, plus a phone framing):
- the group itself is untouched apart from a slight warm grade;
- the wall and bed are rebuilt in deep brown, with soft window light on the wall;
- the cream sherpa throw is rebuilt from the photo's own blanket and ends in a draped edge on the brown bed;
- the shampoo's cut-off edge is restored;
- light falls off from the bear into warm brown shadow, where the copy sits.

| Token | Value | Use |
|---|---|---|
| shadow brown | `#2C170C` | the dark side of the room, under the copy |
| wall brown | `#3A1F11` to `#B06838` in the window light | the wall |
| cream | `#F4E8DA` | headline and links |
| dusty rose | `#DBA6AA` | the italic word and the button |
| caramel | `#C69563` | eyebrow and its rule |

- **Copy:** Cormorant Garamond 500, always two lines ("Slow mornings, *softer curls*"). The supporting line uses the bottles' own claims (Hydrate · Define · Bounce, for wavy, curly and coily hair).
- **Motion:** only a slow 15s push-in on the photo and the copy's entrance. The scene is a photograph; nothing is animated inside it.
- **Don't:** float cut-outs over a flat colour, use light tan browns, or add props that are not in a real photograph.

## Known Gaps

- The closed lid's outer face, the box's sides and back are not in any photograph; they are plain
  pink board in the model. A true 360° model needs photographs of all six faces of the closed box
  (flat, evenly lit) plus the lid lining and an empty tray.
- The box photographs are 800px and 1200px wide, enough for the hero at 1x and soft at 2x. A
  2000px straight-on photo of the open box would make the gift stage crisp on Retina screens.
- Dark mode is not part of the brand.
