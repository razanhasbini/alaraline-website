// The Christmas PR box. Edit this file to change what the page shows.
//
// SAMPLE CONTENTS: the box below is a sample "Oh Honey ritual" put together from the live catalogue, so the
// page can be seen full. Replace `items` with what the real box holds before the page goes live.
// Descriptions are taken from the product pages on alaraline.co; keep it that way (no new claims).

export type BoxItem = {
  slug: string;     // product page on alaraline.co
  name: string;
  line: string;     // one line, shown when the item is picked and on hover in "What it holds"
  text: string;     // two lines for the "Inside" card
  img: string;      // transparent cut-out
  field: string;    // the card's colour panel
  at: { x: number; y: number; h: number; r: number }; // when the box opens: centre offset, bottom, height (px in the 620×560 stage), tilt
};

const IMG = '/live/prbox/';

export const sample = true;

export const items: BoxItem[] = [
  {
    slug: 'shampoo', name: 'Intensive Repair Shampoo', img: `${IMG}shampoo.webp`, field: '#4a1424',
    line: 'Oh Honey. Sulfate- and silicone-free, with provitamins and peptides.',
    text: 'Hydrate, revive, strengthen: softness and shine from the very first wash, scented with honey.',
    at: { x: -200, y: 250, h: 200, r: -9 },
  },
  {
    slug: 'conditioner', name: 'Hydrating Conditioner', img: `${IMG}conditioner.webp`, field: '#432034',
    line: 'Oh Honey. Deep hydration that makes detangling easy.',
    text: 'A rich, sulfate- and silicone-free conditioner that leaves a radiant, silky finish.',
    at: { x: -125, y: 300, h: 210, r: -4 },
  },
  {
    slug: 'miracle-pro-edition', name: 'The Miracle Pro-Edition', img: `${IMG}miracle-pro-edition.webp`, field: '#521a2e',
    line: 'Scalp treatment with vitamins, caffeine and peptides.',
    text: 'Energises the scalp and supports healthier-looking, fuller hair through the daily growth cycle.',
    at: { x: -38, y: 340, h: 200, r: 2 },
  },
  {
    slug: 'leave-in', name: 'Leave In Your Dreams', img: `${IMG}leave-in.webp`, field: '#3d1a28',
    line: 'A lightweight leave-in for curly, wavy or straight hair.',
    text: 'Smooths frizz and enhances your natural shape. Fresh, defined, hydrated, nourished.',
    at: { x: 48, y: 325, h: 205, r: 5 },
  },
  {
    slug: 'hair-mist-oh-honey', name: 'Hair Mist, Pure Honey', img: `${IMG}hair-mist-oh-honey.webp`, field: '#47241c',
    line: 'The scent of a jar of honey. Alcohol-free, with vitamin E.',
    text: 'Sweet honey that lasts all day, alcohol-free and enriched with vitamin E.',
    at: { x: 128, y: 285, h: 140, r: 8 },
  },
  {
    slug: 'miracle-mask', name: 'Miracle Mask', img: `${IMG}miracle-mask.webp`, field: '#4e1d1a',
    line: 'Shea, mango and cocoa butters with honey.',
    text: 'Saturates dry hair with moisture and restores softness, elasticity and shine from the first use.',
    at: { x: 205, y: 240, h: 112, r: 6 },
  },
  {
    slug: 'alaras-pouch', name: 'ÀLara’s Pouch', img: `${IMG}alaras-pouch.webp`, field: '#3f1530',
    line: 'Our plush pouch, embroidered with the ÀLara Line signature.',
    text: 'A soft home for everything in this box, to carry the ritual wherever you go.',
    at: { x: 0, y: 205, h: 130, r: -3 },
  },
];

// "What it holds": ingredients and hair needs, each traced to the products above
export const madeWith: [string, string][] = [
  ['Honey', 'In the shampoo, conditioner, mist and Miracle Mask.'],
  ['Shea butter', 'In the Miracle Mask, with mango and cocoa butters.'],
  ['Mango butter', 'In the Miracle Mask, for dry lengths.'],
  ['Cocoa butter', 'In the Miracle Mask, for softness and elasticity.'],
  ['Caffeine', 'In The Miracle Pro-Edition, to energise the scalp.'],
  ['Peptides', 'In the shampoo, conditioner and The Miracle Pro-Edition.'],
  ['Provitamins', 'In the shampoo and conditioner.'],
  ['Vitamin E', 'In the Pure Honey hair mist.'],
];

export const madeFor: [string, string][] = [
  ['Curly hair', 'Leave In Your Dreams enhances your natural shape.'],
  ['Wavy hair', 'Leave In Your Dreams enhances your natural shape.'],
  ['Straight hair', 'Leave In Your Dreams enhances your natural shape.'],
  ['Dry hair', 'The Miracle Mask saturates dry hair with moisture.'],
  ['Frizz', 'The leave-in smooths it; the conditioner detangles.'],
  ['Dull lengths', 'The mask restores softness, elasticity and shine.'],
  ['A tired scalp', 'The Miracle Pro-Edition energises it with caffeine.'],
];
