You are a senior WordPress developer and a patient teacher. I run ÀLara Line, a haircare brand, and my website is on WordPress. I'm not a developer, so guide me one small step at a time. Tell me exactly where to click in the WordPress admin, and give me complete code to copy and paste, never fragments like "add this somewhere". After each step, stop and wait for me to say it worked or to send you a screenshot.

## What we're building

Two "before & after" sections for my homepage, showing how our products improved real clients' hair. I already designed both in a static HTML prototype, and they must look exactly like it. The design is described below, and the full HTML structure and CSS are included at the end.

I must be able to manage the photos myself from the WordPress admin, with no code: add a new client result, upload or replace the before and after photos, edit the text, reorder results, hide results, and choose which ones are featured.

### Section 1: "Real Hair, Real Results" (featured, on a pink background)

- Background: a rose-pink vertical gradient from #f9c8db to #f4b6cf.
- Header, centred: the small capitals eyebrow "THE ÀLARA EFFECT" in dark plum (#3b1528), then the title "Real Hair, Real Results" in the Butler serif font, with a small white wavy squiggle line under it.
- 3 results side by side. Each one has two tall arch-shaped photos (rounded top, square bottom, thin white border). The Before arch sits at the top left; the After arch is in front of it, lower and to the right, with a soft shadow, so they overlap. Each arch has a small white rectangular label at its bottom centre, "BEFORE" or "AFTER", in spaced-out small capitals.
- Under each pair: the product name(s) as links to the products (PT Serif, black; they turn white on hover), and a line in small plum capitals: "CURLY HAIR · 6 WEEKS" (hair type · time · optional client handle).
- On hover, the two arches move slightly apart.
- On tablets and phones (≤900px), the results become a horizontal swipe row, one at a time, snapping into place.
- It shows only results I mark as "Featured" (maximum 3).

### Section 2: "The Results Wall" (polaroids, on ivory, directly below Section 1)

- Background: ivory #fbf7f4.
- Header, centred: the pink small capitals eyebrow "OUR CLIENTS", the title "The Results Wall" (Butler, with a pink squiggle under it), and the subtitle "Before and after, shared with us by our clients."
- A grid of 4 per row (2 on tablets). Each client is two small square polaroids (white frame, a thicker white strip at the bottom).
  - The Before polaroid is tilted slightly, with a translucent pink piece of tape at its top centre. "Before" is handwritten-style on its white strip (PT Serif italic, black).
  - The After polaroid hangs lower and to the right, overlapping the Before's bottom-right corner, tilted the other way, hanging from a small gold clip on its top edge. "After" is written on its strip in pink (#E85C9C).
  - Every other pair tilts the opposite way and sits a little lower, so the wall feels hand-pinned.
  - On hover, the pair "settles" (the tilts reduce) with a little springy motion.
- Under each pair: product name link(s) (PT Serif), and a small grey capitals line "CURLY HAIR • 6 WEEKS" with tiny pink dots between items.
- On phones (≤760px), it becomes a horizontal swipe row.
- It shows all published results.

### Brand

- Pink #E85C9C, blush #F8BED6, plum #3B1528, gold #C9A06A, ivory #fbf7f4.
- Fonts: Butler for headings (not on Google Fonts; if my theme doesn't already load it, help me self-host it, or fall back to PT Serif), PT Serif (italic too), and DM Sans for small text (both on Google Fonts). Check first whether my theme already loads them, so we don't load them twice.

## How I want to edit it (the admin side)

A "Client Results" item in the WordPress admin menu, where each result is one entry with:

- Before photo (picked from or uploaded to the Media Library)
- After photo
- Hair type (text, e.g. "Curly hair")
- Time (text, e.g. "6 weeks")
- Products used (choose one or more of my WooCommerce products; the names and links on the site come from these, so they stay correct if a product is renamed)
- Client handle (optional, e.g. "@name")
- "Featured" checkbox (shows it in the pink arches section)
- Order (so I can control which result comes first)

Draft or unpublished results must not appear on the site.

## Preferred technical approach (adjust once you know my setup)

- Free tools only, unless I agree otherwise. My suggestion: the free **Advanced Custom Fields (ACF)** plugin to create the "Client Results" post type and its fields, plus a free code snippets plugin such as **WPCode** (or my child theme, if I have one) for the PHP and CSS. If you think a small custom plugin is cleaner for my setup, explain why in simple words first.
- Two shortcodes, `[alara_featured_results]` and `[alara_results_wall]`, that I place on my homepage (in the block editor, or with my page builder's shortcode widget), so I can move the sections around freely.
- Output photos with `wp_get_attachment_image()` so WordPress serves resized images with srcset and lazy loading. Use good alt text, e.g. "Curly hair before" and "Curly hair after 6 weeks with Curls On Collection".
- Escape everything (`esc_html`, `esc_url`, `esc_attr`). Never edit the parent theme's files directly.
- Load the CSS only on pages that use the shortcodes, if that's simple to do.
- If no results exist yet, the shortcodes should output nothing, not an empty section.
- Keep the markup and class names below so the CSS works as is. Fix any conflicts with my theme's styles, for example themes often add margins to `figure`, borders to `img`, or underlines to links.
- Respect "reduce motion" (already in the CSS).

## Before you start

1. Ask me these questions first: my WordPress version; my theme and whether it is a block theme or a classic theme; whether I use a page builder (Elementor, Divi, etc.); whether WooCommerce is installed; whether I have a child theme; whether I can install plugins; and whether my host offers a staging site or backups.
2. Make me take a full backup (or use staging) before we change anything.
3. Then give me the plan as a short numbered list, and start with step 1.

At the end, walk me through adding my first real result, checking the homepage on desktop, tablet and phone, and replacing a photo later. Also remind me to only use clients' photos with their written permission.

---

## Reference: HTML structure from my prototype

Section 1 (one `<article>` per featured result):

```html
<section class="arches" id="results" aria-labelledby="ar-title">
  <div class="lwrap">
    <header class="ar-head">
      <p class="ar-eyebrow">The ÀLara effect</p>
      <h2 class="ltitle squiggle" id="ar-title">Real Hair, Real Results</h2>
    </header>
    <div class="ar-grid" role="list">
      <article class="ar-pair" role="listitem">
        <div class="ar-stage">
          <figure class="ar-arch ar-before"><img src="BEFORE.jpg" alt="Curly hair before" loading="lazy"><span class="ar-tag">Before</span></figure>
          <figure class="ar-arch ar-after"><img src="AFTER.jpg" alt="Curly hair after 6 weeks with Curls On Collection" loading="lazy"><span class="ar-tag">After</span></figure>
        </div>
        <div class="ar-cap">
          <h3 class="ar-name"><a href="/product/curls-on-collection/">Curls On Collection</a></h3>
          <p class="ar-meta">Curly hair · 6 weeks · @client</p>
        </div>
      </article>
      <!-- …up to 3 -->
    </div>
  </div>
</section>
```

Section 2 (one `<article>` per result; several products are joined with " + "):

```html
<section class="clients" id="client-results" aria-labelledby="cr-title">
  <div class="lwrap">
    <header class="cr-head">
      <p class="cr-eyebrow">Our clients</p>
      <h2 class="ltitle squiggle" id="cr-title">The Results Wall</h2>
      <p class="cr-sub">Before and after, shared with us by our clients.</p>
    </header>
    <div class="cr-grid" role="list">
      <article class="cr-pair" role="listitem">
        <figure class="cr-pol cr-before">
          <span class="cr-tape" aria-hidden="true"></span>
          <img src="BEFORE.jpg" alt="Straight hair before" loading="lazy">
          <figcaption>Before</figcaption>
        </figure>
        <figure class="cr-pol cr-after">
          <span class="cr-clip" aria-hidden="true"></span>
          <img src="AFTER.jpg" alt="Straight hair after 3 weeks with Leave-In + Serum" loading="lazy">
          <figcaption>After</figcaption>
        </figure>
        <div class="cr-cap">
          <h3 class="cr-name"><a href="/product/leave-in/">Leave-In</a> + <a href="/product/serum/">Serum</a></h3>
          <p class="cr-meta">Straight hair <i></i> 3 weeks <i></i> @client</p>
        </div>
      </article>
      <!-- …one per result -->
    </div>
  </div>
</section>
```

## Reference: complete CSS from my prototype (use as is)

```css
/* shared: container, Butler title with the wavy squiggle under it */
.arches, .clients { --l-pink: #e85c9c; --l-text: #696969; font: 400 15px/1.65 'DM Sans', system-ui, sans-serif; color: var(--l-text);
  --l-squiggle: url("data:image/svg+xml,%3Csvg viewBox='0 0 42 6' xmlns='http://www.w3.org/2000/svg'%3E %3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0.29067 2.60873C1.30745 1.43136 2.72825 0.72982 4.24924 0.700808C5.77022 0.671796 7.21674 1.31864 8.27768 2.45638C8.97697 3.20628 9.88872 3.59378 10.8053 3.5763C11.7218 3.55882 12.6181 3.13683 13.2883 2.36081C14.3051 1.18344 15.7259 0.481897 17.2469 0.452885C18.7679 0.423873 20.2144 1.07072 21.2753 2.20846C21.9746 2.95836 22.8864 3.34586 23.8029 3.32838C24.7182 3.31092 25.6133 2.89009 26.2831 2.11613C26.2841 2.11505 26.285 2.11396 26.2859 2.11288C27.3027 0.935512 28.7235 0.233974 30.2445 0.204962C31.7655 0.17595 33.212 0.822796 34.2729 1.96053C34.9722 2.71044 35.884 3.09794 36.8005 3.08045C37.7171 3.06297 38.6134 2.64098 39.2836 1.86496C39.6445 1.44697 40.276 1.40075 40.694 1.76173C41.112 2.12271 41.1582 2.75418 40.7972 3.17217C39.7804 4.34954 38.3597 5.05108 36.8387 5.08009C35.3177 5.1091 33.8712 4.46226 32.8102 3.32452C32.1109 2.57462 31.1992 2.18712 30.2826 2.2046C29.3674 2.22206 28.4723 2.64289 27.8024 3.41684C27.8015 3.41793 27.8005 3.41901 27.7996 3.42009C26.7828 4.59746 25.362 5.299 23.841 5.32801C22.3201 5.35703 20.8735 4.71018 19.8126 3.57244C19.1133 2.82254 18.2016 2.43504 17.285 2.45252C16.3685 2.47 15.4722 2.89199 14.802 3.66802C13.7852 4.84539 12.3644 5.54693 10.8434 5.57594C9.32242 5.60495 7.8759 4.9581 6.81496 3.82037C6.11568 3.07046 5.20392 2.68296 4.28738 2.70044C3.37083 2.71793 2.47452 3.13992 1.80434 3.91594C1.44336 4.33393 0.811887 4.38015 0.393899 4.01917C-0.0240897 3.65819 -0.0703068 3.02672 0.29067 2.60873Z'/%3E %3C/svg%3E"); }
.arches .lwrap, .clients .lwrap { max-width: 1410px; margin: 0 auto; padding: 0 15px; }
.arches .ltitle, .clients .ltitle { margin: 0 0 60px; text-align: center; font: 400 48px/1.21 Butler, 'PT Serif', serif; color: #000; position: relative; padding-bottom: 18px; }
.arches .ltitle.squiggle::after, .clients .ltitle.squiggle::after { content: ''; position: absolute; left: 50%; bottom: 0; width: 40px; height: 5px; margin-left: -20px; background: var(--l-pink);
  -webkit-mask: var(--l-squiggle) center / contain no-repeat; mask: var(--l-squiggle) center / contain no-repeat; }
.arches img, .clients img { display: block; max-width: 100%; height: auto; }
.arches a, .clients a { color: inherit; text-decoration: none; }
@media (max-width: 760px) { .arches .ltitle, .clients .ltitle { font-size: 36px; margin-bottom: 40px; } }

/* ================= Section 2: The Results Wall (polaroids) ================= */
.clients { --cr-line: #eadfda; --cr-soft: #8b7b81; padding: 110px 0 100px; background: #fbf7f4; overflow: hidden; }
.cr-head { text-align: center; margin-bottom: 70px; }
.cr-eyebrow { margin: 0 0 18px; font: 600 12px/1 'DM Sans', sans-serif; letter-spacing: .28em; text-transform: uppercase; color: var(--l-pink); }
.cr-head .ltitle { margin-bottom: 22px; }
.cr-sub { margin: 0; font-size: 16px; }

.cr-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 28px; align-items: start; max-width: 1280px; margin: 0 auto; }

/* a pair: the polaroids are 58% of the pair's width; the After starts at 42%, so they overlap by a quarter */
.cr-pair { position: relative; width: min(100%, 320px); margin: 0 auto; }
.cr-pair:nth-child(even) { margin-top: 44px; }
.cr-pol { position: relative; width: 58%; margin: 0; padding: 9px 9px 0; background: #fff;
  box-shadow: 0 16px 26px -16px rgba(90, 40, 60, .45), 0 1px 2px rgba(0, 0, 0, .06);
  transition: transform .7s cubic-bezier(.34, 1.4, .5, 1); }
.cr-pol img { width: 100%; aspect-ratio: 1; object-fit: cover; background: #f3ebe7; }
.cr-pol figcaption { height: 46px; display: grid; place-items: center; font: italic 400 20px/1 'PT Serif', serif; color: #000; }

/* Before: taped at the top */
.cr-before { z-index: 1; transform: rotate(-3deg); transform-origin: 50% 0; }
.cr-before figcaption { padding-right: 30%; }   /* centred in the part of the strip the After leaves visible */
.cr-tape { position: absolute; top: -11px; left: 50%; z-index: 3; width: 58px; height: 20px; margin-left: -29px; background: rgba(248, 190, 214, .78);
  transform: rotate(-4deg); box-shadow: 0 1px 2px rgba(0, 0, 0, .05); }

/* After: lower right, in front, overlapping the Before's bottom-right corner */
.cr-after { z-index: 2; margin: calc(-24.9% - 16px) 0 0 42%; transform: rotate(3deg); transform-origin: 20% 0; }
.cr-after figcaption { color: var(--l-pink); }
/* the gold clip on the After's top edge that it hangs from */
.cr-clip { position: absolute; top: -21px; left: 14%; z-index: 3; width: 14px; height: 34px; border-radius: 3px 3px 7px 7px;
  background: linear-gradient(90deg, #a77f4c, #e3cfa8 45%, #c9a06a 70%, #9c7442); box-shadow: 0 3px 6px rgba(60, 30, 10, .3); }
.cr-clip::before { content: ''; position: absolute; left: 3px; right: 3px; top: 4px; height: 9px; border-radius: 2px; border: 1.5px solid rgba(90, 60, 25, .45); border-bottom: 0; }

/* every other pair tilts the other way */
.cr-pair:nth-child(even) .cr-before { transform: rotate(2.5deg); }
.cr-pair:nth-child(even) .cr-tape { transform: rotate(3deg); }
.cr-pair:nth-child(even) .cr-after { transform: rotate(-2deg); }

/* on hover the pair settles, as if the After just swung on its clip */
@media (hover: hover) {
  .cr-pair:hover .cr-before { transform: rotate(-1deg); }
  .cr-pair:hover .cr-after { transform: rotate(1deg); }
  .cr-pair:nth-child(even):hover .cr-before { transform: rotate(1deg); }
  .cr-pair:nth-child(even):hover .cr-after { transform: rotate(-.5deg); }
}

.cr-cap { margin-top: 26px; text-align: center; }
.cr-name { margin: 0 0 6px; font: 400 17px/1.45 'PT Serif', serif; color: #000; }
.cr-name a:hover { color: var(--l-pink); }
.cr-meta { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 4px 10px; margin: 0;
  font: 500 11px/1.4 'DM Sans', sans-serif; letter-spacing: .18em; text-transform: uppercase; color: var(--cr-soft); }
.cr-meta i { width: 4px; height: 4px; border-radius: 50%; background: var(--l-pink); opacity: .7; }

@media (max-width: 1080px) { .cr-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 50px 30px; max-width: 680px; } }
@media (max-width: 760px) {
  .clients { padding: 70px 0 60px; }
  .cr-head { margin-bottom: 30px; }
  /* phones: one pair at a time, swiped sideways */
  .cr-grid { grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: 80%; gap: 18px; overflow-x: auto; scroll-snap-type: x mandatory;
    scrollbar-width: none; padding: 20px 4px 24px; }
  .cr-grid::-webkit-scrollbar { display: none; }
  .cr-pair { scroll-snap-align: center; }
  .cr-pair:nth-child(even) { margin-top: 26px; }
  .cr-pol { padding: 7px 7px 0; }
  .cr-pol figcaption { height: 38px; font-size: 17px; }
  .cr-after { margin-top: calc(-24.9% - 13px); }
  .cr-tape { width: 48px; height: 17px; margin-left: -24px; top: -9px; }
  .cr-clip { width: 12px; height: 28px; top: -17px; }
  .cr-cap { margin-top: 20px; }
  .cr-name { font-size: 16px; }
  .cr-meta { font-size: 10px; letter-spacing: .14em; gap: 2px 8px; }
}
@media (prefers-reduced-motion: reduce) { .cr-pol { transition: none; } }

/* ================= Section 1: Real Hair, Real Results (arches on pink) ================= */
.arches { --ar-ink: #3b1528; padding: 110px 0 100px; background: linear-gradient(180deg, #f9c8db, #f4b6cf); }
.ar-head { text-align: center; margin-bottom: 64px; }
.ar-eyebrow { margin: 0 0 18px; font: 600 12px/1 'DM Sans', sans-serif; letter-spacing: .28em; text-transform: uppercase; color: var(--ar-ink); }
.arches .ltitle { margin: 0; }
.arches .ltitle.squiggle::after { background: #fff; }

.ar-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 50px; max-width: 1180px; margin: 0 auto; }
.ar-pair { min-width: 0; }
.ar-stage { position: relative; aspect-ratio: 1 / .98; }
.ar-arch { position: absolute; width: 58%; aspect-ratio: 3 / 4.3; margin: 0; border-radius: 999px 999px 4px 4px; overflow: hidden; border: 1px solid rgba(255, 255, 255, .75);
  transition: transform .6s cubic-bezier(.22, 1, .36, 1); }
.ar-arch img { width: 100%; height: 100%; object-fit: cover; }
.ar-before { left: 0; top: 0; }
.ar-after { right: 0; bottom: 0; box-shadow: -22px 30px 50px -24px rgba(90, 20, 50, .55); }
.ar-tag { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); padding: 8px 14px; background: rgba(255, 255, 255, .92); color: var(--ar-ink);
  font: 600 10.5px/1 'DM Sans', sans-serif; letter-spacing: .22em; text-transform: uppercase; white-space: nowrap; }
@media (hover: hover) {
  .ar-pair:hover .ar-before { transform: translate(-6px, -4px); }
  .ar-pair:hover .ar-after { transform: translate(4px, -6px); }
}
.ar-cap { margin-top: 30px; text-align: center; }
.ar-name { margin: 0 0 6px; font: 400 19px/1.4 'PT Serif', serif; color: #000; }
.ar-name a:hover { color: #fff; }
.ar-meta { margin: 0; font: 600 11px/1.4 'DM Sans', sans-serif; letter-spacing: .18em; text-transform: uppercase; color: #8a3a61; }

@media (max-width: 900px) {
  .arches { padding: 70px 0 60px; }
  .ar-head { margin-bottom: 40px; }
  .ar-grid { grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: 78%; gap: 20px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; padding-bottom: 6px; }
  .ar-grid::-webkit-scrollbar { display: none; }
  .ar-pair { scroll-snap-align: center; }
  .ar-tag { bottom: 10px; padding: 6px 10px; font-size: 9.5px; }
}
@media (prefers-reduced-motion: reduce) { .ar-arch { transition: none; } }
```
