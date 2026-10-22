# ÀLara Christmas Story Studio

A browser-based, reusable 1080 × 1920 Instagram Story editor for ÀLara Line's Christmas campaign. Customer photography or video stays full bleed while rendered satin, glass, metal, pearl, ribbon and pine details create the festive frame.

## Open the editor

From the repository root, run:

```sh
python3 -m http.server 8080
```

Then open `http://127.0.0.1:8080/christmas-story/` in a current Chromium-based browser. Serving the folder over HTTP is recommended because browsers restrict some media features on local `file://` pages.

## Build a Story

1. Upload a photo or video, or load the included sample photo.
2. Drag directly over the preview to reposition the crop. Use the zoom and nudge controls for fine adjustment.
3. Enter the customer name, product name, and review.
4. Choose Text, Voice, or Both. Upload an audio file or record one in the browser when voice is enabled.
5. Choose the card position and finish, then hide any decoration that conflicts with the product.
6. Enable safe guides while composing; guides are never included in exports.
7. Export a high-resolution PNG or a motion Story.

All uploaded media remains in the browser; this editor does not send customer files to a server. The included customer quote and name are fictional sample content and should be replaced before publishing.

## Export notes

- PNG export is always 1080 × 1920.
- Motion export records the rendered canvas in real time and includes the uploaded/recorded voice note when present.
- Keep the export tab visible until recording finishes. The duration follows the longest active media track, with a practical 60-second ceiling.
- Chromium can emit H.264/AAC MP4 where supported. Browsers without MP4 `MediaRecorder` support download WebM instead.
- If a publishing workflow requires MP4, convert a WebM fallback with FFmpeg:

```sh
ffmpeg -i alara-story.webm -c:v libx264 -pix_fmt yuv420p -c:a aac alara-story.mp4
```

## Files

- `index.html` — editor interface
- `css/app.css` — responsive editor shell
- `js/app.js` — editor state, media loading, crop, playback, and export
- `js/decor.js` — physically rendered festive decorations
- `js/card.js` — adaptive text and voice-note card
- `js/snow.js` — restrained snow atmosphere
- `DESIGN.md` — reusable visual system and implementation rules
- `design-showcase.html` — standalone design-system reference

## Browser and motion behavior

The editor respects `prefers-reduced-motion`: decorative motion is held still, transitions are minimized, and uploaded video does not autoplay. Audio playback remains user controlled. Microphone recording requires browser permission and a secure context; localhost is treated as secure by current browsers.
