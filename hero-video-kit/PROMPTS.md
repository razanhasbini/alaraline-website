# ÀLara hero videos: image-to-video brief (v2)

## Free, no-watermark route
Free tiers of commercial tools (Luma, Kling, Runway, Veo in Gemini) usually add a watermark. The free route without one is **open-source models on Hugging Face Spaces**. They run in the browser on free GPU time and download a clean MP4.

1. Go to huggingface.co/spaces and search **"Wan 2.2 image to video"** (best quality). Alternatives: **"Wan2.1 I2V"**, **"LTX-Video"** (fastest), **"FramePack"** (good for longer, smooth shots).
2. Upload the image, paste a prompt below, choose 5 s and 720p, then generate.
3. Free GPU time is limited per day. If a Space is busy, try another one or come back later. Signing in to a free Hugging Face account raises the quota.
4. Check each model's license before commercial use. Wan is Apache 2.0, which allows commercial use. LTX-Video has its own license, so read its terms.
5. Optional: upscale 720p to 1080p with a free upscaler. 720p already looks good behind the hero text.

AI video invents what it can't see, so for every concept: **generate 3–5 takes and keep the one where the ÀLara logo stays sharp.**

---

## Bottle: `1-miracle-splash-16x9.png` (mobile: `1-miracle-splash-vertical.png`)

### A. Turntable reveal (the "360")
> Luxury cosmetic commercial. The pink glass ÀLara "The Miracle" serum bottle with a gold dropper cap levitates just above a still pool of rose-pink water and slowly rotates on its vertical axis, turning to show its glass sides, then returning to face the camera with the white ÀLara logo perfectly legible. Light refracts through the pink glass and sends moving caustics across the water below; tiny droplets orbit the bottle in slow motion. Soft pink studio light, glossy reflections, photorealistic, smooth and slow.

Tip: a full 360° makes the model invent the back of the bottle. A **half turn and back** usually looks cleaner. If a take shows a garbled back label, regenerate it.

### B. The golden drop
> Macro slow-motion beauty shot. The gold dropper cap of the pink ÀLara "The Miracle" bottle lifts slightly and releases a single glowing golden-pink drop. It falls in extreme slow motion and hits the rose-pink water, forming a perfect crown splash; rings of light ripple outward and the splash sparkles with golden particles. The bottle and its label stay sharp and unchanged. Dreamy pink lighting, ultra-detailed, premium.

### C. Silk & petals
> Elegant beauty commercial. Ribbons of blush-pink silk and soft rose petals swirl gracefully around the pink ÀLara "The Miracle" bottle in slow motion, wrapping around it and drifting away to reveal it glowing in soft light. Water shimmers below, fine golden dust sparkles in the air. The bottle and label stay sharp and unchanged. Soft focus background, luxurious, photorealistic, slow camera arc to the right.

### D. Honey & bee (brand story: honey is the hero ingredient)
> Magical beauty commercial. A glossy stream of golden honey slowly spirals down beside the pink ÀLara "The Miracle" bottle, catching the light, while a small honeybee circles gracefully around the bottle and lands on the gold cap. Glowing pollen particles drift through the pink haze. The bottle and label stay sharp and unchanged. Warm golden and pink lighting, slow motion, photorealistic.

**Negative prompt for all bottle shots** (if the tool has one):
> distorted text, changing logo, melting bottle, extra bottles, hands, people, fast motion, camera shake, flicker, low quality

---

## Gift box: `2-ritual-box-16x9.png` (mobile: `2-ritual-box-mobile.png`)

### E. The box comes alive
> Magical unboxing commercial. Warm sunlight streams through a window onto the open pink ÀLara gift box. Golden light glows from inside the box, the gold bee-wing print on the lid shimmers as if catching sunlight, and sparkling golden dust rises gently from the products. Soft window shadows drift slowly across the table. All products and labels stay perfectly still and unchanged. Very slow dolly-in, warm, serene, luxurious, photorealistic.

### F. Bee-wing flight
> Dreamy beauty film. The open pink ÀLara gift box sits in warm golden-hour light. The delicate bee-wing illustration inside the lid begins to glow softly; a few translucent golden butterflies of light lift off from it and flutter slowly across the frame, leaving faint sparkles. Floating dust in the sunbeam. Box and products stay still and unchanged. Slow camera push-in, photorealistic, premium.

**Negative prompt**
> products moving, box closing, changing text, distorted logo, hands, people, fast motion, flicker

---

## Bonus: model + product (`../assets/img/site/cat-haircare.jpg`)
> High-end hair commercial. The woman with long voluminous auburn curls leans gracefully beside the giant pink ÀLara "The Miracle" bottle; a soft breeze lifts her curls in slow motion so they bounce and shine, catching warm light, while she turns her head slightly towards the camera with a calm smile. The bottle and its label stay sharp and unchanged. Soft pink-peach studio backdrop, glossy healthy hair, photorealistic, slow motion.

---

## Delivering the files
Export MP4 (H.264), 5–8 s, no audio, under ~8 MB. Save in `assets/video/` with these exact names; the site plays them automatically and loops them:

| File | Used for |
|---|---|
| `hero-miracle.mp4` | Slide 1, desktop |
| `hero-miracle-mobile.mp4` | Slide 1, phones (optional) |
| `hero-box.mp4` | Slide 2, desktop |
| `hero-box-mobile.mp4` | Slide 2, phones (optional) |

If a clip doesn't loop seamlessly, that's fine: the site crossfades it with the photo underneath, so the restart is soft.
