/* ÀLara Christmas season: catalogue touches, applied before the page renders its products.
   The bottles that have a Christmas photo wear a Santa hat everywhere they appear (cards, quick view,
   search, bag, ritual). The everyday photo is kept as p.imgPlain. */
(function () {
  'use strict';
  if (document.documentElement.dataset.season !== 'christmas' || !window.ALARA) return;
  const HATS = ['shampoo', 'conditioner', 'hydrating-conditioner-tropical-vanilla', 'curl-defining-shampoo', 'hydrating-curl-conditioner'];
  // the brand's own Christmas photographs (fairy lights, plush Santa hats), cropped and set on white
  const PHOTOS = ['intensive-repair-shampoo-tropical-vanilla', 'serum', 'leave-in', 'curl-boosting-cream', 'miracle-mask', 'miracle-pro-edition', 'deep-repair-capsules', 'wax-stick-styling-hair-wax', 'alaras-pouch'];
  HATS.concat(PHOTOS).forEach(slug => {
    const p = window.ALARA.bySlug[slug];
    if (!p) return;
    p.imgPlain = p.img;
    p.img = 'assets/christmas/hats/' + slug + (PHOTOS.includes(slug) ? '.webp' : '.jpg');
  });
})();
