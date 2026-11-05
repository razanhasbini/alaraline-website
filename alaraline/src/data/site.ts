// Content of alaraline.co's homepage, as published on 30 Oct 2026 (names, prices, badges, reviews and photos).
// Images were downloaded from the live site into public/live/.

export const LIVE = 'https://alaraline.co';
const IMG = '/live/';

export type Product = {
  name: string;
  slug: string;
  price: number;
  was?: number;
  badge?: 'New' | 'Just Restocked!';
  img: string;
  options?: boolean; // "Select options" instead of "Add to cart"
};

const p = (name: string, slug: string, price: number, extra: Partial<Product> = {}, file = slug): Product =>
  ({ name, slug, price, img: `${IMG}products/${file}.jpg`, ...extra });

export const productUrl = (slug: string) => `${LIVE}/product/${slug}/`;

export const bestSellers: Product[] = [
  p('Curls On Care Kit', 'curls-on-care-kit', 85, { was: 116, badge: 'New' }),
  p('Detox Scalp Scrub', 'detox-scalp-scrub', 24),
  p('Full Treatment Set', 'full-treatment-set', 75, { was: 107, options: true }),
  p('The Miracle Pro-Edition', 'miracle-pro-edition', 36, { badge: 'Just Restocked!' }, 'the-miracle-pro-edition'),
];

export const tabs: { label: string; products: Product[] }[] = [
  {
    label: 'Hair Care',
    products: [
      p('Curl Boosting Cream', 'curl-boosting-cream', 26, { badge: 'New' }),
      p('Hydrating Curl Conditioner', 'hydrating-curl-conditioner', 14, { badge: 'New' }),
      p('Curl Defining Shampoo', 'curl-defining-shampoo', 16, { badge: 'New' }),
      p('Detox Scalp Scrub', 'detox-scalp-scrub', 24),
      p('ÀLara’s Pouch', 'alaras-pouch', 18),
      p('Deep Repair Capsules', 'deep-repair-capsules', 30),
      p('Anti-Dandruff Shampoo', 'anti-dandruff-shampoo', 20),
      p('Hair Mist – Tropical Vanilla', 'hair-mist-tropical-vanilla', 20),
      p('Edge Control Wax Stick', 'wax-stick-styling-hair-wax', 22, {}, 'edge-control-wax-stick'),
      p('Intensive Repair Shampoo – Tropical vanilla', 'intensive-repair-shampoo-tropical-vanilla', 15),
    ],
  },
  {
    label: 'Body Care',
    products: [p('Golden Dusky Tanning Oil', 'golden-dusky-tanning-oil', 16)],
  },
  {
    label: 'Hair Accessories',
    products: [
      p('ÀLara’s Pouch', 'alaras-pouch', 18),
      p('Curly Hair Brush', 'curly-hair-brush', 13),
      p('Diffuser Top for Hair Dryers', 'diffuser-top', 16),
      p('Satin Pillow Cover', 'satin-pillow-cover', 14),
      p('Microfiber Hair Towel', 'microfiber-towel', 10),
      p('Scalp Massager', 'scalp-massager', 14),
      p('Derma Roller 0.25mm', 'dermaroller', 16),
    ],
  },
];

export const offers: Product[] = [
  p('Curls On Care Kit', 'curls-on-care-kit', 85, { was: 116, badge: 'New' }),
  p('Curls On Collection', 'curls-on-collection', 49, { was: 56, badge: 'New' }),
  p('4 Hair Mists', '4-hair-mists', 65, { was: 80 }),
  p('Deep Repair Duo', 'deep-repair-duo', 53, { was: 60 }),
  p('Full Treatment Set', 'full-treatment-set', 75, { was: 107, options: true }),
];

export const categories = [
  { name: 'Hair Care', href: `${LIVE}/product-category/hair-care/`, img: `${IMG}cats/hair-care.jpg` },
  { name: 'Limited Offers', href: `${LIVE}/product-category/offers/`, img: `${IMG}cats/limited-offers.jpg` },
  { name: 'Hair Accessories', href: `${LIVE}/product-category/hair-accessories/`, img: `${IMG}cats/hair-accessories.jpg` },
  { name: 'Curls On Collection', href: `${LIVE}/product-category/curls-on-collection/`, img: `${IMG}cats/curls-on-collection.jpg` },
];

export const nav = [
  { label: 'Home', href: '/' },
  {
    label: 'Shop', href: `${LIVE}/shop/`,
    children: [
      { label: 'Hair Care', href: `${LIVE}/product-category/hair-care/` },
      { label: 'Limited Offers', href: `${LIVE}/product-category/offers/` },
      { label: 'Curls On Collection', href: `${LIVE}/product-category/curls-on-collection/` },
      { label: 'Hair Accessories', href: `${LIVE}/product-category/hair-accessories/` },
      { label: 'Body Care', href: `${LIVE}/product-category/body-care/` },
    ],
  },
  { label: 'Our Story', href: `${LIVE}/our-story/` },
  { label: 'Ingredients', href: `${LIVE}/ingredients/` },
  { label: 'Contact', href: `${LIVE}/contact/` },
  { label: 'FAQ', href: `${LIVE}/faq/` },
  { label: 'Shipping Policy', href: `${LIVE}/shipping-policy/` },
];

// The Results Wall: before & after photos clients shared (live numbering kept)
export const results = [1, 2, 6, 4, 5, 8, 9].map(n => ({
  before: `${IMG}results/client-results-before-${n}.jpg`,
  after: `${IMG}results/client-results-after-${n}.jpg`,
}));

export type Review = { who: string; text: string; avatar: string; rtl?: boolean };
const r = (who: string, file: string, text: string, rtl = false): Review => ({ who, text, rtl, avatar: `${IMG}reviews/${file}.jpg` });

export const reviews: Review[] = [
  r('Sabah_abouaycha', 'sabah-abouaycha', 'Stafadet ktir 3layon aktar chi st3mlt shampoo conditioner w leave in\nNow excited la est3mel l oil aktar w l serum\nW towel cha3re w sar ytla3le baby hair'),
  r('Sylvana_omar', 'sylvana-omar', 'Thank you kteer 3n jadd men awal est3mel hasseyet el fare2\nNchallah bass hadda ysefer la 3nd khayi badi eb3at la 3aylto men 3ndkoun'),
  r('Rawano_adib', 'rawano-adib', 'Bdii elkk thank you 3ala ha products le b janenoo\nSarli 1 month 3m est3mlo w sh3rii sar b janen'),
  r('_rama_nahas', 'rama-nahas', 'sorry aam ehkikon b hal waet bas I got the products a month ago w I wanted to show you ade ana mabsouta b my healthy curls!!\nthe magical mask b kel maana l kelme magical everyone was asking about my hair routine w i told them about uuu, so happy eno i found such beautiful and life changing products 💕'),
  r('J.o.u.r.y._.a.i', 'j-o-u-r-y-a-i', 'Aanjddd aanjd what can i sayyy msh 3erfa🤷🏻‍♀️ can’t be more thankful ❤️kil shi bl products perfect mn reeha lal package lal results kil shiii, sarle shi 6 months aam besta3mloun w shi b jannen wow!!!❤️❤️❤️'),
  r('Makdissijessika', 'makdissijessika', 'Y3neee saraha sarahaaa shiii fe5errr 3alll e5errrr btbydoooo wejjjjj shiii ktirrr 7eloo cha3reee mastfedd 8errr 3ndikk w cha3er rfi2te w e5te kmnn jerbnaa ktirrr zyoutttt ablikkk bs kelon fechlin ma elonnn 3aze bs 3ndik 3njadd shi byst7e2 eno yenbe3 w ykonn bl sou2 wel 3alam 3m techtriiii good luck hbibteeee 🌸🌸🌸❤️❤️❤️❤️'),
  r('elissa_challita', 'elissa-challita', 'First of all, I want to thank you for your amazing products.\nI have naturally curly hair that can be frizzy and dry. I tried A lara Shampoo,Conditioner, mask, leave in for the second time and I’m obsessed! My curls are now defined and bouncy, and my hair feels so soft and hydrated. This is definitely my new go-to hair care line!"🤩 👩‍🦱I am addicted to A lara line products 😅'),
  r('@lara_gemayel', 'lara-gemayel', 'Cha3re ken bl marra mnachaf w echre w mayet bala hayet la 7adiyet ma sta3malet | products taba3kol kel l set t8ayar cha3re sar fi hayet w lama3ye w towel bs birou7 mch bi to2ssif wel echre 5affet mn awal este3mel lal shampoo. Ri/et | shampoo wl conditioner betsatel wel mask ktirrr bi rattebb wel leave in wel miracle oil bi satlo wel serum ktir mnih wel mist kamenn.'),
  r('@b.a.t.o.u.l.313', 'b-a-t-o-u-l-313', 'هاي كيفك، والله كنت ناطرا لكذا استعمال حتى اتأكد من النتيجة لان شعري كان كتير تعبان وفي نفشة بشعة بس لما ستعملت الشامبو وكل شي اخدتو من عندكم صرت لاحظ الفرق عن قبل والله مش مجاملة كتير تحسن وانشالله مع الايام رح يتحسر اكتر بفضل منتجاتكم الرائعة 😍❤️\nاللّٰه يقويكم يارب ويرزقكم عنجد بتستاهلو كنت رايحة بدي قص شعري وزعلانة لان صار كتير طويل بس اول اسبوع ستعملت المنتجات فرق كتير كبير الحمدلله وشلت فكرة القص كلها 😍😍', true),
  r('@sawanasala', 'sawanasala', 'Helloo it is really the best products i’ve used in a while ken eli fatra bjareb ktr products w wala shi ken mneeh and then i started using ur products w kteer stafadet mn el oils wl mask. I love your products w hata i told all my friends and family about it'),
  r('@_may_sam_sh', 'may-sam-sh', 'Hello dear, the products are wonderful. They moisturize the hair wonderfully and for a longer time.\nThey helped me reduce hair loss from the third use, and I hope that these products will help me treat all the problems I was facing with my hair. Thank you very much.\nThanks a lot ana tazabt ktr la la2yt shy ynasb sharii bhl2d fatra 2aseraa w3njd msh mojamlii bsss 3am la2ee far2 bjann lhamdela'),
];

// The first hero slide: products scattered around the plush pouch (left/top in % of the slide, height in px of the 760px slide, tilt in degrees)
export const heroFloat = [
  { file: 'curly-hair-brush.webp', x: 49.5, y: 30, h: 118, d: 0, r: 12 },
  { file: 'serum.webp', x: 56, y: 18, h: 138, d: 1, r: -12 },
  { file: 'miracle-pro-edition.webp', x: 65.8, y: 6.5, h: 136, d: 2, r: 3 },
  { file: 'heat-protectant.webp', x: 75.5, y: 13.5, h: 138, d: 3, r: 14 },
  { file: 'deep-repair-capsules.webp', x: 83.4, y: 27, h: 110, d: 4, r: 18 },
  { file: 'shampoo.webp', x: 61, y: 33.5, h: 150, d: 5, r: -2 },
  { file: 'hair-mist-tropical-vanilla.png', x: 68.4, y: 38.5, h: 76, d: 6, r: 0 },
  { file: 'conditioner.webp', x: 74.2, y: 32.5, h: 150, d: 7, r: 4 },
  { file: 'hair-mist-oh-honey.png', x: 90.6, y: 45, h: 80, d: 8, r: 10 },
  { file: 'curl-defining-shampoo.webp', x: 51.8, y: 48.5, h: 156, d: 9, r: -14 },
  { file: 'scalp-massager.webp', x: 82, y: 54, h: 96, d: 10, r: -8 },
  { file: 'alaras-pouch.webp', x: 60, y: 59.5, h: 200, d: 11, r: 0 },
];
