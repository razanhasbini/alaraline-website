/* ÀLara Line — catalogue & content (mirrors alaraline.co, Oct 2026) */
window.ALARA = (function () {
  const IMG = 'assets/img/products/';

  /* fx = simulated effect on the Hair Lab model (0..1 strength per dimension)
     hydrate · shine · frizz (reduction) · define · density · length · flakes (removal)
     smooth · edges · volume · scent (colour) · shield · glow · when (time to visible result) */
  const products = [
    { id: 3808, slug: 'miracle-pro-edition', name: 'The Miracle Pro-Edition', price: 36, cats: ['Best Sellers', 'Hair Care'], badge: 'Top Rated',
      tag: 'Scalp treatment · Hair growth',
      desc: 'A powerful water-based scalp treatment infused with vitamins, caffeine, peptides, and botanical extracts to support healthier-looking, fuller hair while energizing the scalp and supporting the daily hair growth cycle.',
      fx: { density: .55, length: .35, shine: .15, scalp: .4, when: '6–8 weeks of nightly use' } },
    { id: 3947, slug: 'full-treatment-set', name: 'Full Treatment Set', price: 75, was: 107, cats: ['Best Sellers', 'Offers'], img2: true,
      tag: 'Shampoo · Conditioner · Leave-in · Mask · Miracle',
      desc: 'The complete ÀLara ritual: Intensive Repair Shampoo, Hydrating Conditioner, Leave In Your Dreams, Miracle Mask and The Miracle Pro-Edition — in our signature honeycomb box.',
      combo: ['shampoo', 'conditioner', 'leave-in', 'miracle-mask', 'miracle-pro-edition'], options: { Scent: ['Tropical Vanilla', 'Oh Honey'] } },
    { id: 5573, slug: 'detox-scalp-scrub', name: 'Detox Scalp Scrub', price: 24, cats: ['Best Sellers', 'Hair Care'],
      tag: 'Exfoliating scalp detox',
      desc: 'Goes beyond regular cleansing to help remove years of buildup, excess oils, impurities, and flakes. This refreshing exfoliating treatment helps rebalance scalp pH, purify the scalp surface, and promote a healthier environment for hair growth.',
      fx: { flakes: .85, volume: .25, scalp: .6, shine: .1, when: 'First use' } },
    { id: 4903, slug: 'deep-repair-capsules', name: 'Deep Repair Capsules', price: 30, cats: ['Best Sellers', 'Hair Care'],
      tag: 'Keratin-effect gloss',
      desc: 'Gives a glossy keratin-effect, enriched with natural oils, vitamins & peptides to smooth, repair & add shine.',
      fx: { smooth: .6, shine: .6, frizz: .6, hydrate: .3, when: 'First use' } },
    { id: 3789, slug: 'shampoo', name: 'Intensive Repair Shampoo – Oh Honey', price: 15, cats: ['Best Sellers', 'Hair Care'],
      tag: 'Sulfate & silicone free · Honey',
      desc: 'Hydrate. Revive. Strengthen. A gentle, sulfate- and silicone-free shampoo infused with organic botanicals, provitamins, and peptides — softness and shine from the very first wash. Scented with Honey.',
      fx: { hydrate: .25, shine: .2, frizz: .2, flakes: .35, scent: '#f2b84b', when: 'First wash' } },
    { id: 4159, slug: 'intensive-repair-shampoo-tropical-vanilla', name: 'Intensive Repair Shampoo – Tropical Vanilla', price: 15, cats: ['Hair Care'],
      tag: 'Sulfate & silicone free · Vanilla',
      desc: 'Hydrate. Revive. Strengthen. A gentle, sulfate- and silicone-free shampoo infused with organic botanicals, provitamins, and peptides. Scented with Tropical Vanilla.',
      fx: { hydrate: .25, shine: .2, frizz: .2, flakes: .35, scent: '#f6d9a8', when: 'First wash' } },
    { id: 3791, slug: 'conditioner', name: 'Hydrating Conditioner – Oh Honey', price: 15, cats: ['Hair Care'],
      tag: 'Deep hydration · Detangling',
      desc: 'Ultimate Hydration & Silky Smoothness. A rich, sulfate- and silicone-free conditioner with organic botanicals, provitamins and peptides — effortless detangling and a radiant, silky finish. Scented with Honey.',
      fx: { hydrate: .4, frizz: .35, shine: .25, define: .2, smooth: .15, scent: '#f2b84b', when: 'First wash' } },
    { id: 4150, slug: 'hydrating-conditioner-tropical-vanilla', name: 'Hydrating Conditioner – Tropical Vanilla', price: 15, cats: ['Hair Care'],
      tag: 'Deep hydration · Detangling',
      desc: 'Ultimate Hydration & Silky Smoothness — deep hydration, effortless detangling, and a radiant, silky finish. Scented with Tropical Vanilla.',
      fx: { hydrate: .4, frizz: .35, shine: .25, define: .2, smooth: .15, scent: '#f6d9a8', when: 'First wash' } },
    { id: 3799, slug: 'leave-in', name: 'Leave In Your Dreams', price: 17, cats: ['Hair Care'],
      tag: 'Lightweight leave-in cream',
      desc: 'Fresh. Defined. Hydrated. Nourished. A lightweight leave-in cream that smooths frizz and enhances your natural shape — curly, wavy, or straight.',
      fx: { define: .6, frizz: .45, hydrate: .35, shine: .15, when: 'Instantly' } },
    { id: 3803, slug: 'miracle-mask', name: 'Miracle Mask', price: 24, cats: ['Hair Care'],
      tag: 'Intense deep hydration',
      desc: 'A rich blend of Shea, Mango, and Cocoa butters with honey penetrates deeply to saturate dry hair with moisture. Restores softness, elasticity, and shine — results visible from the very first use.',
      fx: { hydrate: .7, shine: .4, frizz: .5, define: .35, smooth: .2, when: 'First use' } },
    { id: 3820, slug: 'serum', name: 'Crystal Glow Hair Serum', price: 22, cats: ['Hair Care'], oos: true,
      tag: 'Golden glow · Anti-frizz',
      desc: 'Unlock dazzling shine and smoothness with provitamins and peptides. This lightweight formula reduces frizz, nourishes strands, and leaves a luminous, golden glow that catches every ray of light.',
      fx: { shine: .75, glow: .8, frizz: .4, smooth: .2, when: 'Instantly' } },
    { id: 3837, slug: 'heat-protectant', name: 'Heat Protectant', price: 25, cats: ['Hair Care'],
      tag: 'Up to 450°F · UV shield',
      desc: 'An invisible shield that defends against heat up to 450°F, UV rays, chlorine, and sun exposure — locking in moisture and shine.',
      fx: { shield: 1, shine: .25, hydrate: .15, frizz: .15, when: 'Every styling session' } },
    { id: 4578, slug: 'anti-dandruff-shampoo', name: 'Anti-Dandruff Shampoo', price: 20, cats: ['Hair Care'],
      tag: 'Piroctone Olamine · Niacinamide · Caffeine',
      desc: 'Gently cleanses while helping reduce visible flakes, balance the scalp, and refresh the hair. Helps soothe the scalp and control excess oil with every wash.',
      fx: { flakes: .95, scalp: .5, volume: .15, when: '2–3 washes' } },
    { id: 4165, slug: 'wax-stick-styling-hair-wax', name: 'Edge Control Wax Stick', price: 22, cats: ['Hair Care'],
      tag: 'Honey & coconut hold',
      desc: 'Tames flyaways and nourishes while it holds. Infused with honey and coconut oil — perfect for baby hairs, smoothing edges, and sleek styles without flaking.',
      fx: { edges: 1, frizz: .25, smooth: .2, when: 'Instantly' } },
    { id: 4137, slug: 'hair-mist-oh-honey', name: 'Hair Mist – Pure Honey', price: 20, cats: ['Hair Care'],
      tag: 'Alcohol-free · Vitamin E',
      desc: 'Sweet Honey. Pure Delight. Lasts All Day. The warm, sweet scent of a jar of honey — alcohol-free and enriched with vitamin E.',
      fx: { scent: '#f2b84b', shine: .12, hydrate: .08, when: 'All day' } },
    { id: 4198, slug: 'hair-mist-tropical-vanilla', name: 'Hair Mist – Tropical Vanilla', price: 20, cats: ['Hair Care'], oos: true,
      tag: 'Alcohol-free · Vitamin E',
      desc: 'Creamy Vanilla. Exotic Touch. Lasts All Day. Creamy vanilla with exotic tropical fruits — alcohol-free and infused with vitamin E.',
      fx: { scent: '#f6d9a8', shine: .12, hydrate: .08, when: 'All day' } },
    { id: 4214, slug: 'deep-repair-duo', name: 'Deep Repair Duo', price: 53, was: 60, cats: ['Offers'], img2: true,
      tag: 'Miracle Mask · Miracle Pro-Edition',
      desc: 'A power duo for deep repair and hydration! Our Miracle Mask and oil together restore strength, reduce damage and leave your hair silky smooth and healthy.',
      combo: ['miracle-mask', 'miracle-pro-edition'] },
    { id: 4906, slug: 'curly-hair-brush', name: 'Curly Hair Brush', price: 13, cats: ['Hair Accessories', 'Curls On Collection'],
      tag: 'Define · Detangle',
      desc: 'Bring your curls to life — specially designed to define, detangle, and enhance your natural curl pattern without frizz or breakage.',
      fx: { define: .55, frizz: .2, curlOnly: true, when: 'Every styling' } },
    { id: 3852, slug: 'diffuser-top', name: 'Diffuser Top for Hair Dryers', price: 16, cats: ['Hair Accessories'],
      tag: 'Fits all hair dryers',
      desc: 'Spreads the airflow gently to reduce frizz and help define curls and waves, giving your hair more volume and bounce.',
      fx: { volume: .35, define: .35, frizz: .3, when: 'Every blow-dry' } },
    { id: 3850, slug: 'satin-pillow-cover', name: 'Satin Pillow Cover', price: 14, cats: ['Hair Accessories'],
      tag: 'Sleep smooth',
      desc: 'Sleep Smooth. Wake Beautiful. Reduces friction on your hair and skin while you sleep, helping prevent frizz, breakage, and creases.',
      fx: { frizz: .4, smooth: .2, hydrate: .1, when: 'Overnight' } },
    { id: 3815, slug: 'microfiber-towel', name: 'Microfiber Hair Towel', price: 10, cats: ['Hair Accessories'], oos: true,
      tag: 'Frizz-free drying',
      desc: 'Soft, absorbent microfiber dries hair quickly without friction, reducing frizz, breakage, and heat damage.',
      fx: { frizz: .4, define: .15, when: 'Every wash' } },
    { id: 3846, slug: 'scalp-massager', name: 'Scalp Massager', price: 14, cats: ['Hair Accessories'], img2: true,
      tag: 'Stimulate · Relax · Strengthen',
      desc: 'Soft silicone massager that boosts circulation, encourages healthy hair growth, and delivers a calming, spa-like experience. Pair with The Miracle Pro-Edition to enhance absorption.',
      fx: { density: .2, scalp: .45, flakes: .25, when: '4–6 weeks' } },
    { id: 3842, slug: 'dermaroller', name: 'Derma Roller 0.25mm', price: 16, cats: ['Hair Accessories'],
      tag: 'Boosts absorption',
      desc: 'Gently stimulates the scalp, improving circulation and enhancing the absorption of hair growth oils through fine titanium micro-channels.',
      fx: { density: .25, length: .1, scalp: .35, when: '6–8 weeks' } },
    { id: 6125, slug: 'curl-defining-shampoo', name: 'Curl Defining Shampoo', price: 16, cats: ['Curls On Collection', 'Hair Care'], badge: 'New',
      tag: 'Curls On Collection · wild berries',
      desc: 'A hydrating shampoo designed to enhance definition, boost bounce, and leave curls soft, smooth, and beautifully defined. Infused with antioxidant-rich berries, without weighing curls down.',
      fx: { define: .3 } },
    { id: 6128, slug: 'hydrating-curl-conditioner', name: 'Hydrating Curl Conditioner', price: 14, cats: ['Curls On Collection', 'Hair Care'], badge: 'New',
      tag: 'Curls On Collection · wild berries',
      desc: 'A nourishing conditioner that softens, detangles, enhances definition and helps control frizz, leaving curls smooth, shiny and defined without weighing them down.',
      fx: { hydrate: .4 } },
    { id: 6131, slug: 'curl-boosting-cream', name: 'Curl Boosting Cream', price: 26, cats: ['Curls On Collection', 'Hair Care'], badge: 'New',
      tag: 'Curls On Collection · definition & bounce',
      desc: 'A rich curling cream that enhances definition, shape and bounce while helping control frizz. Brings out your natural curl pattern, soft, smooth and beautifully defined.',
      fx: { define: .7 } },
    { id: 6133, slug: 'curls-on-collection', name: 'Curls On Collection', price: 49, was: 56, cats: ['Curls On Collection', 'Offers'], badge: 'New',
      tag: 'Curl Defining Shampoo · Hydrating Curl Conditioner · Curl Boosting Cream',
      desc: 'The full curl routine: Curl Defining Shampoo, Hydrating Curl Conditioner and Curl Boosting Cream.',
      combo: ['curl-defining-shampoo', 'hydrating-curl-conditioner', 'curl-boosting-cream'] },
    { id: 6166, slug: 'curls-on-care-kit', name: 'Curls On Care Kit', price: 85, was: 116, cats: ['Best Sellers', 'Curls On Collection', 'Offers'], badge: 'New',
      tag: 'Curls On Collection · Miracle Mask · Miracle Pro-Edition',
      desc: 'Including: Curl Defining Shampoo, Hydrating Curl Conditioner, Curl Boosting Cream, Miracle Mask and The Miracle Pro-Edition.',
      combo: ['curl-defining-shampoo', 'hydrating-curl-conditioner', 'curl-boosting-cream', 'miracle-mask', 'miracle-pro-edition'] },
    { id: 5477, slug: 'alaras-pouch', name: 'ÀLara’s Pouch', price: 18, cats: ['Hair Accessories', 'Hair Care'],
      tag: 'Plush signature pouch',
      desc: 'Our dreamy plush pouch, embroidered with the ÀLara Line signature — the perfect home for your hair essentials.' },
    { id: 3860, slug: 'golden-dusky-tanning-oil', name: 'Golden Dusky Tanning Oil', price: 16, cats: ['Body Care'], img2: true,
      tag: 'Glow fast · Tan deep',
      desc: 'A fast-absorbing tanning oil designed to accelerate your natural tan while keeping your skin nourished — a golden glow without dryness. Lightweight and non-greasy.' }
  ];

  // products with a clean transparent cut-out (the brand's current packaging, including the new hair mists)
  const CUT = ['alaras-pouch', 'anti-dandruff-shampoo', 'conditioner', 'curl-boosting-cream', 'curl-defining-shampoo', 'curly-hair-brush', 'deep-repair-capsules', 'detox-scalp-scrub', 'diffuser-top', 'hair-mist-oh-honey', 'hair-mist-tropical-vanilla', 'heat-protectant', 'hydrating-conditioner-tropical-vanilla', 'hydrating-curl-conditioner', 'intensive-repair-shampoo-tropical-vanilla', 'leave-in', 'miracle-mask', 'miracle-pro-edition', 'scalp-massager', 'serum', 'shampoo', 'wax-stick-styling-hair-wax'];
  products.forEach(p => {
    p.img = (CUT.includes(p.slug) ? IMG + 'cut/' + p.slug + '.webp' : IMG + p.slug + '.jpg');
    if (p.img2) p.img2 = IMG + p.slug + '-2.jpg';
    p.url = 'https://alaraline.co/product/' + p.slug + '/';
  });

  /* Hair Lab copy: what's inside + why hair looks this way (from alaraline.co product & ingredient pages) */
  const INFO = {
    'miracle-pro-edition': ['Caffeine, peptides, vitamins and botanical extracts in a light, water-based scalp treatment.', 'Caffeine and peptides energise the follicles while vitamins support the daily growth cycle, so new baby hairs appear and the lengths look thicker and fuller. Growth becomes visible from about 15 days of nightly use.', 15],
    'shampoo': ['Organic botanicals, pro-vitamins and peptides. Sulfate- and silicone-free, scented with honey.', 'It lifts away oil and buildup without stripping moisture, so each strand is clean and light. Clean hair clumps into its natural pattern: curls and waves look better shaped, straight hair looks fresher and shinier.'],
    'intensive-repair-shampoo-tropical-vanilla': ['Organic botanicals, pro-vitamins and peptides. Sulfate- and silicone-free, scented with tropical vanilla.', 'It lifts away oil and buildup without stripping moisture, so each strand is clean and light. Clean hair clumps into its natural pattern: curls and waves look better shaped, straight hair looks fresher and shinier.'],
    'conditioner': ['Organic botanicals, pro-vitamins and peptides. Sulfate- and silicone-free, scented with honey.', 'It smooths and seals the cuticle and detangles, so strands slide together instead of puffing apart: less frizz, a silkier feel, and curls that hold a cleaner shape.'],
    'hydrating-conditioner-tropical-vanilla': ['Organic botanicals, pro-vitamins and peptides. Sulfate- and silicone-free, scented with tropical vanilla.', 'It smooths and seals the cuticle and detangles, so strands slide together instead of puffing apart: less frizz, a silkier feel, and curls that hold a cleaner shape.'],
    'leave-in': ['A lightweight leave-in cream with deep-hydrating and nourishing actives.', 'Hydration plumps every strand and the cream holds strands together as they dry, so curls form well-defined, bouncy ringlets, waves keep their S-shape and straight hair lies smooth, with frizz tamed all day.'],
    'miracle-mask': ['Shea, mango and cocoa butters with honey.', 'The butters saturate dry strands with moisture and honey draws it deep inside, restoring softness, elasticity and shine. Hair looks deeply hydrated and silky from the very first use.'],
    'serum': ['Pro-vitamins and peptides in a lightweight serum.', 'It coats the surface of each strand so it reflects light evenly and stops frizz, giving dull hair a luminous golden glow.'],
    'heat-protectant': ['An invisible shield that protects against heat up to 450°F, UV rays, chlorine and sun.', 'It locks moisture in while you style, so hair keeps its shine and strength instead of drying out and breaking.'],
    'deep-repair-capsules': ['Natural oils, vitamins and peptides in single-use capsules.', 'They smooth the cuticle flat for a glossy, keratin-like finish, so hair looks sleeker and reflects more light.'],
    'detox-scalp-scrub': ['An exfoliating scalp scrub that rebalances scalp pH.', 'It clears years of buildup, excess oil and flakes from the scalp, so roots lift, hair looks lighter and fresher, and the scalp becomes a healthier place for hair to grow.'],
    'anti-dandruff-shampoo': ['Piroctone Olamine, Niacinamide and Caffeine.', 'It gently reduces visible flakes, controls excess oil and soothes the scalp, so hair looks clean at the roots after 2 to 3 washes.'],
    'wax-stick-styling-hair-wax': ['Honey and coconut oil in a smooth-glide wax stick.', 'It tames flyaways and baby hairs with a light, non-greasy hold, so edges and partings look sleek and polished.'],
    'hair-mist-oh-honey': ['Alcohol-free mist with vitamin E, scented with honey.', 'It leaves hair softly fragranced all day and adds a light touch of softness and shine.'],
    'hair-mist-tropical-vanilla': ['Alcohol-free mist with vitamin E, scented with tropical vanilla.', 'It leaves hair softly fragranced all day and adds a light touch of softness and shine.'],
    'curly-hair-brush': ['A brush designed to detangle and define your natural pattern.', 'It separates hair into clumps along its natural curl, so curls look defined and bouncy without frizz or breakage.'],
    'diffuser-top': ['A diffuser top that fits all hair dryers.', 'It spreads the airflow gently so curls and waves dry in their shape, with more volume and bounce and less frizz.'],
    'satin-pillow-cover': ['A smooth, breathable satin pillow cover.', 'Less friction while you sleep means less frizz, breakage and creases, so hair keeps its moisture and shape overnight.'],
    'microfiber-towel': ['Soft, absorbent microfiber.', 'It dries hair quickly without rubbing, so the cuticle stays smooth: less frizz and less breakage.'],
    'scalp-massager': ['Soft silicone bristles.', 'It boosts circulation at the roots and helps scalp treatments absorb, supporting thicker-looking growth over 4 to 6 weeks.'],
    'dermaroller': ['0.25 mm titanium micro-needles.', 'It creates tiny channels that help growth treatments reach the follicles, supporting fuller hair over 6 to 8 weeks.'],
    'full-treatment-set': ['Intensive Repair Shampoo, Hydrating Conditioner, Leave In Your Dreams, Miracle Mask and The Miracle Pro-Edition.', 'The complete ritual: clean, smooth, define, deeply hydrate and grow. Every step builds on the last for the biggest visible change.'],
    'deep-repair-duo': ['Miracle Mask and The Miracle Pro-Edition.', 'The mask hydrates and restores the lengths while the Pro-Edition energises the scalp, for hair that looks silkier now and fuller over time.'],
    'curls-on-care-kit': ['Curl Defining Shampoo, Hydrating Curl Conditioner, Curl Boosting Cream, Miracle Mask and The Miracle Pro-Edition.', 'The full curl routine plus deep hydration and the scalp treatment: defined, bouncy curls now, fuller hair over time.']
  };
  products.forEach(p => { const i = INFO[p.slug]; if (i) { p.inside = i[0]; p.why = i[1]; if (i[2] && p.fx) p.fx.onset = i[2]; } });
  if (products.find(p => p.slug === 'miracle-pro-edition')) Object.assign(products.find(p => p.slug === 'miracle-pro-edition').fx, { density: .6, length: .4, when: '15 days to 2 months' });
  /* Ingredient-based effects, generated by alaraline-ai/scripts/build_effects.py (assets/js/hairlab-data.js).
     They replace the hand-written effects above wherever a product has a formula. */
  const GEN = window.ALARA_FX || {};
  products.forEach(p => {
    const g = GEN[p.slug];
    if (!g) return;
    const scent = p.fx && p.fx.scent;
    p.fx = Object.assign({}, g.effect_profile, { curlOnly: g.curl_only, when: g.when, scent: g.scented ? (scent || 'fresh') : undefined });
    p.timing = g.timing;
    p.boosts = g.boosts || null;
    p.explain = g.explain;
    p.inciList = g.ingredients;
    p.teamText = g.team_description;
    p.whenText = g.when;
    if (g.key_actives.length) p.inside = g.key_actives.join(', ') + (g.ingredients.length > g.key_actives.length ? ', and more' : '') + '.';
    else if (g.ingredients_note) p.inside = g.ingredients_note;
    if (g.why) p.why = g.why;
  });

  /* Christmas bundles, wrapped in red satin (images composed from the cut-outs in products/bundles).
     PLACEHOLDERS: the products inside are real, but the bundle names, prices and copy are invented for
     the team to edit. Kept out of `products`, so they appear only in the gift edit, not the shop grid or search. */
  const bundles = [
    { id: 9101, slug: 'xmas-curl-kit', img: 'curl-kit', name: 'The Curl Kit', price: 34, was: 39, combo: ['curl-boosting-cream', 'curly-hair-brush'],
      tag: 'Curl Boosting Cream · Curly Hair Brush', desc: 'Define and shape: the Curl Boosting Cream and the Curly Hair Brush, tied up in red satin.' },
    { id: 9102, slug: 'xmas-scalp-reset', img: 'scalp-reset', name: 'Scalp Reset', price: 33, was: 38, combo: ['detox-scalp-scrub', 'scalp-massager'],
      tag: 'Detox Scalp Scrub · Scalp Massager', desc: 'A fresh start at the roots: the Detox Scalp Scrub with the Scalp Massager to work it in.' },
    { id: 9103, slug: 'xmas-sleek-edit', img: 'sleek-edit', name: 'The Sleek Edit', price: 55, was: 64, combo: ['leave-in', 'heat-protectant', 'wax-stick-styling-hair-wax'],
      tag: 'Leave In Your Dreams · Heat Protectant · Edge Control Wax Stick', desc: 'Smooth, protected and polished, from the lengths to the edges.' },
    { id: 9104, slug: 'xmas-honey-glow', img: 'honey-glow', name: 'Honey Glow', price: 32, was: 37, combo: ['leave-in', 'hair-mist-oh-honey'],
      tag: 'Leave In Your Dreams · Hair Mist – Pure Honey', desc: 'Soft, defined hair that smells of warm honey all day.' }
  ];
  bundles.forEach(b => Object.assign(b, { cats: ['Christmas Bundles'], img: IMG + 'bundles/' + b.img + '.webp', bundle: true, url: '' }));

  const bySlug = Object.fromEntries(products.concat(bundles).map(p => [p.slug, p]));

  // as on alaraline.co
  const bestSellers = ['curls-on-care-kit', 'detox-scalp-scrub', 'full-treatment-set', 'miracle-pro-edition'];

  // in the Shop menu's order on alaraline.co; `essential` marks the four shown under "Your Hair Essentials"
  const categories = [
    { name: 'Offers', slug: 'offers', img: 'assets/img/site/cat-offers.jpg', essential: 2 },
    { name: 'Hair Care', slug: 'hair-care', img: 'assets/img/site/cat-haircare.jpg', essential: 1 },
    { name: 'Curls On Collection', slug: 'curls-on-collection', img: 'assets/img/site/cat-curls.jpg', essential: 4 },
    { name: 'Hair Accessories', slug: 'hair-accessories', img: 'assets/img/site/cat-accessories.jpg', essential: 3 },
    { name: 'Body Care', slug: 'body-care', img: 'assets/img/site/cat-bodycare.jpg' }
  ];
  categories.forEach(c => (c.count = products.filter(p => p.cats.includes(c.name)).length));

  const ingredients = [
    { key: 'honey', name: 'Honey', note: 'Humectant · Shine', text: 'Nature’s golden nectar, rich in vitamins, minerals, and antioxidants. Honey acts as a natural humectant, drawing moisture deep into the hair to keep it soft, smooth, and hydrated. It helps repair damage, adds luminous shine, tames frizz, and protects strands from dryness.' },
    { key: 'coconut', name: 'Coconut Butter', note: 'Long-lasting hydration', text: 'A creamy, indulgent moisturizer that seeps deep into every strand, saturating hair with intense, long-lasting hydration. As it smooths the cuticle and locks in hydration, frizz is tamed, texture becomes silky, and hair regains its natural movement and luminous shine.' },
    { key: 'shea', name: 'African Shea Butter', note: 'Elasticity · Anti-breakage', text: 'A rich, velvety emollient treasured for its unmatched ability to deeply hydrate and protect the hair. By smoothing the cuticle and sealing in hydration, shea butter tames frizz, reduces breakage, and enhances elasticity.' },
    { key: 'mango', name: 'Mango Butter', note: 'Vitamins A & E', text: 'A luxurious, creamy ingredient packed with vitamins A and E. It strengthens strands from within, repairs damage, and restores elasticity — smoothing the cuticle, enhancing shine, and shielding hair from heat and environmental stress.' },
    { key: 'rosemary', name: 'Rosemary Oil', note: 'Follicle awakening', text: 'A powerful botanical known for awakening hair follicles and stimulating healthy growth. By boosting circulation to the scalp it delivers nutrients directly to the roots, encouraging thicker, stronger strands and helping reduce hair fall.' },
    { key: 'argan', name: 'Argan Oil', note: 'Liquid gold', text: 'Nature’s liquid gold for the hair. It feeds the scalp with rich vitamins and fatty acids, helping hair grow stronger and healthier, reducing breakage so hair can grow longer and fuller.' },
    { key: 'biotin', name: 'Biotin', note: 'The beauty vitamin', text: 'Known as the beauty vitamin, biotin is essential for strong, healthy hair growth. It works from the root, helping hair grow thicker and more resilient while reducing breakage and shedding.' }
  ];
  ingredients.forEach(i => (i.img = 'assets/img/ingredients/' + i.key + '.jpg'));

  const reviews = [
    { who: 'Sabah_abouaycha', text: 'Stafadet ktir 3layon aktar chi st3mlt shampoo conditioner w leave in\nNow excited la est3mel l oil aktar w l serum\nW towel cha3re w sar ytla3le baby hair' },
    { who: 'Sylvana_omar', text: 'Thank you kteer 3n jadd men awal est3mel hasseyet el fare2\nNchallah bass hadda ysefer la 3nd khayi badi eb3at la 3aylto men 3ndkoun' },
    { who: 'Rawano_adib', text: 'Bdii elkk thank you 3ala ha products le b janenoo\nSarli 1 month 3m est3mlo w sh3rii sar b janen' },
    { who: '_rama_nahas', text: 'sorry aam ehkikon b hal waet bas I got the products a month ago w I wanted to show you ade ana mabsouta b my healthy curls!!\nthe magical mask b kel maana l kelme magical everyone was asking about my hair routine w i told them about uuu, so happy eno i found such beautiful and life changing products 💕' },
    { who: 'J.o.u.r.y._.a.i', text: 'Aanjddd aanjd what can i sayyy msh 3erfa🤷🏻‍♀️ can’t be more thankful ❤️kil shi bl products perfect mn reeha lal package lal results kil shiii, sarle shi 6 months aam besta3mloun w shi b jannen wow!!!❤️❤️❤️' },
    { who: 'Makdissijessika', text: 'Y3neee saraha sarahaaa shiii fe5errr 3alll e5errrr btbydoooo wejjjjj shiii ktirrr 7eloo cha3reee mastfedd 8errr 3ndikk w cha3er rfi2te w e5te kmnn jerbnaa ktirrr zyoutttt ablikkk bs kelon fechlin ma elonnn 3aze bs 3ndik 3njadd shi byst7e2 eno yenbe3 w ykonn bl sou2 wel 3alam 3m techtriiii good luck hbibteeee 🌸🌸🌸❤️❤️❤️❤️' },
    { who: 'elissa_challita', text: 'First of all, I want to thank you for your amazing products.\nI have naturally curly hair that can be frizzy and dry. I tried A lara Shampoo,Conditioner, mask, leave in for the second time and I’m obsessed! My curls are now defined and bouncy, and my hair feels so soft and hydrated. This is definitely my new go-to hair care line!"🤩 👩‍🦱I am addicted to A lara line products 😅' },
    { who: '@lara_gemayel', text: 'Cha3re ken bl marra mnachaf w echre w mayet bala hayet la 7adiyet ma sta3malet | products taba3kol kel l set t8ayar cha3re sar fi hayet w lama3ye w towel bs birou7 mch bi to2ssif wel echre 5affet mn awal este3mel lal shampoo. Ri/et | shampoo wl conditioner betsatel wel mask ktirrr bi rattebb wel leave in wel miracle oil bi satlo wel serum ktir mnih wel mist kamenn.' },
    { who: '@b.a.t.o.u.l.313', rtl: true, text: 'هاي كيفك، والله كنت ناطرا لكذا استعمال حتى اتأكد من النتيجة لان شعري كان كتير تعبان وفي نفشة بشعة بس لما ستعملت الشامبو وكل شي اخدتو من عندكم صرت لاحظ الفرق عن قبل والله مش مجاملة كتير تحسن وانشالله مع الايام رح يتحسر اكتر بفضل منتجاتكم الرائعة 😍❤️\nاللّٰه يقويكم يارب ويرزقكم عنجد بتستاهلو كنت رايحة بدي قص شعري وزعلانة لان صار كتير طويل بس اول اسبوع ستعملت المنتجات فرق كتير كبير الحمدلله وشلت فكرة القص كلها 😍😍' },
    { who: '@sawanasala', text: 'Helloo it is really the best products i’ve used in a while ken eli fatra bjareb ktr products w wala shi ken mneeh and then i started using ur products w kteer stafadet mn el oils wl mask. I love your products w hata i told all my friends and family about it' },
    { who: '@_may_sam_sh', text: 'Hello dear, the products are wonderful. They moisturize the hair wonderfully and for a longer time.\nThey helped me reduce hair loss from the third use, and I hope that these products will help me treat all the problems I was facing with my hair. Thank you very much.\nThanks a lot ana tazabt ktr la la2yt shy ynasb sharii bhl2d fatra 2aseraa w3njd msh mojamlii bsss 3am la2ee far2 bjann lhamdela' }
  ];

  const faqs = [
    ['Are ÀLara Line products really 100% organic?', 'Yes 🤍 all our formulas are crafted with organic ingredients, pro-vitamins, peptides, and natural oils.'],
    ['Are your products safe for kids and pregnant women?', 'Absolutely! Our products are designed to be gentle, sulfate-free, paraben-free, and safe for both kids and moms-to-be.'],
    ['Do your products work for curly hair?', 'Yes, ÀLara Line is made for all hair types, including curly hair, to enhance natural texture and shine.'],
    ['What makes ÀLara Line different from other brands?', 'Our products are pharmacy-developed, enriched with pro-vitamins and peptides, and specially created to solve real hair concerns with dreamy, effective formulas.'],
    ['Are your products cruelty-free?', 'Yes 💕 ÀLara Line never tests on animals.'],
    ['How can I choose the right product for my hair type?', 'You can check our product descriptions, try the ÀLara Hair Lab above, or contact our support team to help you find the perfect match for your hair goals.']
  ];


  /* How to use — DRAFT based on each product's description; confirm with the ÀLara team.
     freq: recommended frequency (per week, 7 = daily); start/full: days until first/full visible results;
     place: where it goes; rinse: true if it should be rinsed out */
  const USAGE = {
    'miracle-pro-edition': { freq: 7, start: 15, full: 60, place: 'scalp', rinse: false, often: 'Every night',
      steps: ['On dry or towel-dried hair, part your hair into sections.', 'Apply a few drops directly onto the scalp along each parting.', 'Massage for 1–2 minutes with your fingertips or the Scalp Massager.', 'Leave it in overnight. Don’t rinse; wash as usual the next day.'] },
    'shampoo': { freq: 3, start: 1, full: 14, place: 'scalp', rinse: true, often: '2–3 times a week',
      steps: ['Wet your hair well.', 'Massage a small amount into the scalp (not the lengths) for about a minute.', 'Rinse; repeat once if your hair was very oily or had product.', 'Follow with the Hydrating Conditioner.'] },
    'conditioner': { freq: 3, start: 1, full: 14, place: 'lengths', rinse: true, often: 'After every wash',
      steps: ['After shampoo, squeeze out excess water.', 'Apply from mid-lengths to ends, avoiding the roots.', 'Detangle with your fingers or the Curly Hair Brush and leave 2–3 minutes.', 'Rinse with cool water to seal the cuticle.'] },
    'leave-in': { freq: 3, start: 1, full: 14, place: 'lengths', rinse: false, often: 'After every wash',
      steps: ['On damp (not dripping) hair, take a small amount.', 'Rake it through the lengths section by section.', 'For waves and curls, scrunch upward so the pattern clumps.', 'Don’t rinse. Air-dry or use the diffuser without touching the hair until it’s dry.'] },
    'miracle-mask': { freq: 1.5, start: 1, full: 28, place: 'lengths', rinse: true, often: '1–2 times a week',
      steps: ['After shampoo, towel-dry your hair gently.', 'Apply generously from mid-lengths to ends.', 'Leave 10–15 minutes (wrap in a warm towel for extra repair).', 'Rinse thoroughly, then use the Leave-In.'] },
    'serum': { freq: 7, start: 1, full: 7, place: 'ends', rinse: false, often: 'Daily, as needed',
      steps: ['Warm 1–2 drops between your palms.', 'Smooth over dry or damp ends and any frizz.', 'Keep it away from the roots; a little goes a long way.'] },
    'heat-protectant': { freq: 7, start: 1, full: 28, place: 'all', rinse: false, often: 'Every time before heat',
      steps: ['Spray evenly over damp or dry hair from about 20 cm away.', 'Comb through so every strand is covered.', 'Then blow-dry, straighten or curl (up to 450°F).'] },
    'deep-repair-capsules': { freq: 1.5, start: 1, full: 21, place: 'ends', rinse: false, often: '1–2 times a week',
      steps: ['Open one capsule into your palm.', 'Apply to towel-dried or dry lengths and ends.', 'Comb through. No need to rinse.'] },
    'detox-scalp-scrub': { freq: 1, start: 1, full: 21, place: 'scalp', rinse: true, often: 'Once a week',
      steps: ['On a wet scalp, before shampoo, take a small amount.', 'Massage in gentle circles for 1–2 minutes, section by section.', 'Rinse well, then shampoo and condition as usual.'] },
    'anti-dandruff-shampoo': { freq: 3, start: 3, full: 21, place: 'scalp', rinse: true, often: '2–3 times a week',
      steps: ['Massage into a wet scalp.', 'Leave it on for 2–3 minutes so the actives can work.', 'Rinse well. Follow with conditioner on the lengths only.'] },
    'wax-stick-styling-hair-wax': { freq: 7, start: 1, full: 1, place: 'edges', rinse: false, often: 'As needed',
      steps: ['Glide the stick along your edges, baby hairs or parting.', 'Smooth into place with an edge brush or your fingers.'] },
    'hair-mist': { freq: 7, start: 1, full: 1, place: 'lengths', rinse: false, often: 'Any time',
      steps: ['Spray from about 20 cm onto dry hair.', 'Focus on the lengths; re-spray during the day if you like.'] },
    'scalp-massager': { freq: 4, start: 28, full: 42, place: 'scalp', rinse: false, often: 'With every wash or with the Miracle',
      steps: ['Use gentle circles over the whole scalp for 2–3 minutes.', 'Use it with shampoo for a deeper cleanse, or after applying The Miracle Pro-Edition to boost absorption.'] },
    'dermaroller': { freq: 1, start: 28, full: 56, place: 'scalp', rinse: false, often: 'Once a week',
      steps: ['On a clean, dry scalp, roll gently 4–5 times in each direction over thinning areas.', 'Apply The Miracle Pro-Edition right after.', 'Disinfect the roller after every use and never share it.'] },
    'curly-hair-brush': { freq: 3, start: 1, full: 1, place: 'lengths', rinse: false, often: 'On wash days',
      steps: ['On wet hair with conditioner or leave-in, brush through section by section.', 'Shake or twist each section gently so curls clump.'] },
    'diffuser-top': { freq: 3, start: 1, full: 1, place: 'lengths', rinse: false, often: 'When blow-drying',
      steps: ['Use low heat and low speed.', 'Cup sections of hair in the diffuser and lift toward the scalp. Don’t move it around too much.'] },
    'satin-pillow-cover': { freq: 7, start: 1, full: 7, place: 'night', rinse: false, often: 'Every night', steps: ['Sleep on it every night to cut friction, frizz and breakage.'] },
    'microfiber-towel': { freq: 3, start: 1, full: 1, place: 'lengths', rinse: false, often: 'After every wash', steps: ['Squeeze and scrunch the water out. Don’t rub.'] }
  };
  ['hair-mist-oh-honey', 'hair-mist-tropical-vanilla'].forEach(k => (USAGE[k] = USAGE['hair-mist']));
  USAGE['intensive-repair-shampoo-tropical-vanilla'] = USAGE['shampoo'];
  USAGE['hydrating-conditioner-tropical-vanilla'] = USAGE['conditioner'];
  products.forEach(p => { if (USAGE[p.slug]) p.usage = USAGE[p.slug]; });

  return { products, bundles, bySlug, bestSellers, categories, ingredients, reviews, faqs };
})();
