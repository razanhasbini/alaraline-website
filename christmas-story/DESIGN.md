---
version: alpha
name: ÀLara Line — Christmas Story Studio
description: "ÀLara's Christmas Story Studio is a media-first campaign tool — a restrained blush editor around a cinematic 9:16 composition. The editor canvas is warm pearl blush ({colors.canvas} #F5EDEF); the single interface voltage is ÀLara pink ({colors.primary} #E85C9C), reserved for the logo, focus, and small live-state cues. DM Sans makes the editor quiet and operational, while the Story pairs PT Serif italic with Butler for a gift-card voice. What makes the system unmistakable is the contrast between nearly achromatic controls and a full-bleed customer image edged by physically rendered oxblood satin, champagne gold, polished silver, pearl glass, and sparse gold-tipped pine."

colors:
  primary: "#E85C9C"
  primary-focus: "#E85C9C"
  on-primary: "#FFFFFF"
  campaign-red: "#9B1B30"
  campaign-gold: "#C9A35A"
  campaign-silver: "#D8DBE1"
  ink: "#2A1418"
  ink-muted: "#6F5A5F"
  canvas: "#F5EDEF"
  surface-1: "#FFFFFF"
  surface-story-paper: "#FBF6F0"
  surface-stage: "#241519"
  hairline: "#E3D7DA"
  hairline-strong: "#CFC0C4"
  success: "#247B50"
  error: "#9B1B30"

typography:
  display-md:
    fontFamily: "Butler, PT Serif, Georgia, serif"
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -0.3px
  headline:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 0px
  title-sm:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0px
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  body-sm:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  caption:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0px
  story-review:
    fontFamily: "PT Serif, Georgia, serif"
    fontSize: 34px
    fontWeight: 400
    lineHeight: 1.42
    letterSpacing: 0px
  story-name:
    fontFamily: "Butler, PT Serif, Georgia, serif"
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: 0px
  story-product:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 4px
  button:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0px

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 16px
  story-paper: 10px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 36px
  section: 52px

components:
  top-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    height: 52px
  button-primary:
    backgroundColor: "{colors.campaign-red}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 9px 18px
    height: 36px
  button-secondary:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 9px 13px
  text-input:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 9px 11px
    height: 40px
  story-stage:
    backgroundColor: "{colors.surface-stage}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: 20px
  testimonial-card:
    backgroundColor: "{colors.surface-story-paper}"
    textColor: "{colors.ink}"
    typography: "{typography.story-review}"
    rounded: "{rounded.story-paper}"
    padding: 38px 50px
  audio-note:
    backgroundColor: "{colors.surface-story-paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.story-paper}"
    padding: 18px 0
---

## Overview

The editor is a quiet frame, not a second campaign. Its warm blush `{colors.canvas}` surrounds a 9:16 well in `{colors.surface-stage}`; controls are white, compact, and nearly colourless. ÀLara pink `{colors.primary}` appears only in the brand mark, focus rings, and the logo inside the Story. The single filled action uses `{colors.campaign-red}` so export reads as the job of the screen without turning every control into campaign decoration.

Inside the Story, restraint changes meaning. Pink comes from the customer's media and packaging. Christmas red, champagne gold, silver, pearl, and green are treated as materials with reflections, texture, and cast shadow—not as flat UI colours. The centre remains customer media; decoration crops against the edges. The testimonial is a small gift enclosure, not a chat bubble.

**Key Characteristics:**

- Warm pearl-blush `{colors.canvas}` is the editor floor; it never competes with the Story.
- ÀLara pink `{colors.primary}` is scarce: logo, focus, and Story wordmark only.
- Oxblood, gold, and silver belong to physical Christmas materials, not app chrome.
- The customer photo or video always fills the entire 1080 × 1920 canvas.
- PT Serif italic carries the customer's voice; Butler signs the name; DM Sans runs the tool.
- Depth in the editor comes from one tinted frame and a dark preview well; the Story alone receives photographic shadows.
- The bee-wing gift-box image is the visual anchor and must remain unobstructed through deliberate cropping.

## Colors

> Source: existing ÀLara website prototype, supplied brand assets, Full Treatment Set campaign photograph, and the implemented Story compositor.

### Brand & Accent

- **ÀLara Pink** (`{colors.primary}` — #E85C9C): brand mark, focus ring, and Story wordmark.
- **Christmas Oxblood** (`{colors.campaign-red}` — #9B1B30): one editor action plus satin, glossy ornaments, product label, and played waveform.
- **Champagne Gold** (`{colors.campaign-gold}` — #C9A35A): foil line, voice-note play control, metallic ribbon, and warm ornament reflections.
- **Polished Silver** (`{colors.campaign-silver}` — #D8DBE1): a cool counter-material used on selected ornaments and ribbon only.

### Surface

- **Canvas** (`{colors.canvas}` — #F5EDEF): editor frame and mobile control area.
- **Surface 1** (`{colors.surface-1}` — #FFFFFF): inputs and secondary controls.
- **Story Paper** (`{colors.surface-story-paper}` — #FBF6F0): compact testimonial enclosure.
- **Stage** (`{colors.surface-stage}` — #241519): neutral dark well that makes the full-bleed Story legible.
- **Hairline** (`{colors.hairline}` — #E3D7DA): quiet group separators.
- **Strong Hairline** (`{colors.hairline-strong}` — #CFC0C4): input and upload boundaries.

### Text & Semantic

- **Ink** (`{colors.ink}` — #2A1418): primary editor copy and testimonial text.
- **Muted Ink** (`{colors.ink-muted}` — #6F5A5F): helper text and state notes.
- **Success** (`{colors.success}` — #247B50): confirmed output states only.
- **Error** (`{colors.error}` — #9B1B30): inline errors and overlength warning.

## Typography

### Font Family

- **Butler** — locally bundled editorial display serif; names and rare brand moments.
- **PT Serif** — the customer's written voice, always italic in the Story.
- **DM Sans** — operational editor copy, buttons, metadata, product names, and durations.

The app and campaign do not share a typographic hierarchy. The app is compact and neutral. The Story is larger because its source canvas is 1080 × 1920 and will be viewed on a phone after export.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---:|---:|---:|---:|---|
| `{typography.display-md}` | 30px | 400 | 1.1 | -0.3px | Editorial specimen and Story-adjacent display |
| `{typography.headline}` | 15px | 600 | 1.1 | 0 | App title |
| `{typography.title-sm}` | 14px | 600 | 1.2 | 0 | Editor group headings |
| `{typography.body}` | 14px | 400 | 1.5 | 0 | Inputs and default UI text |
| `{typography.body-sm}` | 13px | 400 | 1.5 | Helper text |
| `{typography.caption}` | 12px | 400 | 1.4 | Resolution and export status |
| `{typography.story-review}` | 34px | 400 | 1.42 | Written testimonial; reduces to 26px for long copy |
| `{typography.story-name}` | 30px | 400 | 1.1 | Customer name |
| `{typography.story-product}` | 15px | 600 | 1.2 | Product name in spaced capitals |
| `{typography.button}` | 14px | 600 | 1.2 | Controls and export actions |

### Principles

- Never set the review in DM Sans; it should read like an enclosure card, not UI.
- Never use Butler for dense editor controls.
- Product names may track out; editor section labels stay sentence case without tracking.
- Durations and resolution read with tabular figures.

## Layout

### Spacing System

- Base unit: 4px.
- Tokens: `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 20px · `{spacing.xl}` 24px · `{spacing.xxl}` 36px · `{spacing.section}` 52px.
- Desktop uses a 352px tool column, 12px gutter, and one flexible preview well.
- The internal Story safe zones are optional guides, never exported decoration.

### Grid & Container

The desktop frame is a 52px bar over a `352px / 1fr` split. The preview is centred and uses the largest height that preserves 9:16. Below 860px the preview becomes a sticky first region and controls stack under it. At 480px the preview stays 58vh so the first editor heading is visible without hiding the composition.

### Whitespace Philosophy

Whitespace belongs in the app, not around customer media. The editor uses consistent 12–20px gaps. The exported Story has no empty border: apparent breathing room must come from the customer's photograph itself.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 | `{colors.canvas}`, no shadow | App bar and tool rail |
| 1 | `{colors.surface-1}` with `{colors.hairline}` | Fields and secondary buttons |
| 2 | `{colors.surface-stage}` | Preview well |
| 3 | One soft, dark cast shadow | Story preview floating above the well |
| 4 | 2px `{colors.primary-focus}` outline | Keyboard focus |

The editor never uses decorative glow or glass. The Story compositor may use gradients, environment maps, clearcoat, sheen, and cast shadow because these describe real foil, glass, paper, or satin.

### Decorative Depth

- Baubles use physically based metalness, roughness, clearcoat, or pearl iridescence.
- Satin uses sheen and fine grain; ribbon width and twist are three-dimensional.
- Greenery is built from individual needles with restrained gold tips.
- Snow is sparse and depth-separated; it never becomes a pattern.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---:|---|
| `{rounded.xs}` | 4px | Foil inset line |
| `{rounded.sm}` | 6px | Nudge controls |
| `{rounded.md}` | 8px | Buttons, inputs, segmented controls |
| `{rounded.story-paper}` | 10px | Paper testimonial |
| `{rounded.lg}` | 16px | Stage and mobile sheet |
| `{rounded.pill}` | 9999px | Waveform bars only |
| `{rounded.full}` | 9999px | Audio play disc |

### Photography & Illustration Geometry

Customer media is edge-to-edge and uses cover cropping. No frame, mat, border, overlay wash, or blur sits over the photograph. Decorative objects may cross the outermost 12–15% only. The centre 70% is the media's protected field.

## Components

### Top Bar

**`top-bar`** — 52px blush frame naming the product and resolution; one Export Story action at the right.

### Buttons

**`button-primary`** — one oxblood action per screen. Background `{colors.campaign-red}`, white label, 8px radius.

**`button-secondary`** — white control with a quiet hairline. It never becomes pink at rest.

### Cards & Containers

**`story-stage`** — dark, flat editing well around the exact 9:16 canvas.

**`testimonial-card`** — cream paper with subtle grain, a 1.6px champagne foil inset, PT Serif italic review, Butler signature, and tracked DM Sans product name. It remains compact; text beyond the readable cap ends in a visible ellipsis and triggers an inline editor warning.

**`audio-note`** — gold play disc, waveform sampled from the real recording, played progress in oxblood, and tabular duration. It is part of the testimonial card, never a standalone chat bubble.

### Inputs & Forms

**`text-input`** — white 40px field, 8px radius, quiet border, visible ÀLara-pink focus ring. Every field has a persistent label and browser-appropriate autocomplete behavior.

## Do's and Don'ts

### Do

- Keep customer photo or video as the full 1080 × 1920 background.
- Reserve `{colors.primary}` for the brand mark and focus; let packaging provide most pink.
- Crop ornaments and ribbon at the physical edges so they feel photographed with the gift.
- Keep the message card below one third of the Story height; shorten long testimonials when warned.
- Use the real audio waveform and duration from the uploaded recording.
- Offer toggles for every decoration group so product visibility wins.
- Respect reduced motion in preview and exported recording.

### Don't

- Do not draw baubles as CSS circles or ribbons as flat rectangles.
- Do not add generic campaign slogans, recipient labels, or descriptive headings above the review.
- Do not place the customer media in a smaller framed window.
- Do not wash the Story in an opaque pink overlay or blur the product.
- Do not scatter sparkles, emoji, or snowflake icons over the product.
- Do not use app-style glass panels or WhatsApp-like audio bubbles.
- Do not fill every editor control with campaign red or ÀLara pink.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---:|---|
| Desktop | 861px+ | 352px editor beside flexible Story stage |
| Tablet | 481–860px | Sticky preview first, full-width editor below |
| Mobile | ≤480px | Compact 52px bar, 58vh preview, stacked position controls |

### Touch Targets

- Primary and export actions are at least 44px tall in the editor body.
- Nudge controls are 32px visual controls with clear labels; the zoom range and direct canvas drag provide larger alternatives.
- The canvas is keyboard focusable; arrow keys nudge, Shift+arrow moves farther.

### Collapsing Strategy

The left tool rail never remains beside the Story below 860px. It moves below the sticky preview in source order. The Stage stays at the top so every edit remains visible in real time.

### Image Behavior

The source crop always uses cover scaling. Zoom ranges from 100–300%; offsets clamp so no empty band can enter the Story.

## Iteration Guide

1. Change one named component at a time and preserve its token roles.
2. Keep UI changes out of the canvas compositor unless they affect the exported Story.
3. Test text, audio, and combined modes after every card change.
4. Test one 100-character review and one 300-character review before shipping.
5. Verify image export at exactly 1080 × 1920 after compositor changes.
6. Verify the video container, codec, duration, and audio stream in the target browser.
7. Keep `{colors.primary}` scarce; never promote it to a general section fill.
8. Look at desktop, tablet, mobile, the exported still, and at least one exported video.

## Known Gaps

- No separate Christmas inspiration images were present in the accessible workspace; the direction was extracted from the written brief and supplied Alara assets.
- The customer name and review are clearly sample editor content, not published customer proof.
- MP4 recording depends on the browser's `MediaRecorder` implementation; the app falls back to WebM and explains conversion when MP4 is unavailable.
- DM Sans and PT Serif load from Google Fonts; Butler is bundled locally. Offline use falls back to system sans and Georgia for the two remote families.
- Browser microphone permission is required for in-app recording; file upload remains available without it.
