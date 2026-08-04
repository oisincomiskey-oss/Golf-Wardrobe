import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'The Florentine Saddle Leather Driver Cover',
    price: 65.00,
    originalPrice: 75.00,
    description: 'Handcrafted from full-grain Florentine saddle leather with a rich patina finish. Designed specifically for modern 460cc driver heads with ultra-soft plush fleece lining to protect expensive driver finishes.',
    category: 'Leather',
    clubFit: 'Driver',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=80&w=1000'
    ],
    material: '100% Full-Grain Florentine Saddle Leather',
    isWaterproof: true,
    isGenuineLeather: true,
    stock: 14,
    featured: true,
    tags: ['leather', 'luxury', 'driver', 'waterproof', 'classic', 'bestseller'],
    rating: 4.9,
    reviewsCount: 38,
    reviews: [
      {
        id: 'rev-1',
        author: 'Charles Sterling',
        rating: 5,
        date: '2026-07-12',
        comment: 'The leather smells incredible and fits my Titleist TSR3 driver like a glove. Worth every penny!',
        verified: true
      },
      {
        id: 'rev-2',
        author: 'Dr. Arthur Vance',
        rating: 5,
        date: '2026-06-28',
        comment: 'True British craftsmanship. Draws compliments on the first tee every Sunday.',
        verified: true
      }
    ]
  },
  {
    id: 'prod-2',
    name: 'The Emerald Shamrock Blade Putter Cover',
    price: 45.00,
    description: 'Embroidered with vibrant four-leaf clover motifs using high-density metallic green stitching. Features a heavy-duty magnetic enclosure that stays securely shut during transit.',
    category: 'Irish',
    clubFit: 'Blade Putter',
    image: 'https://images.unsplash.com/photo-1593111774601-dfbce7fe2f92?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1593111774601-dfbce7fe2f92?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1000'
    ],
    material: 'Weatherproof Synthetic Leather with Velvet Lining',
    isWaterproof: true,
    isGenuineLeather: false,
    stock: 22,
    featured: true,
    tags: ['irish', 'clover', 'putter', 'blade', 'luck', 'gift'],
    rating: 4.8,
    reviewsCount: 29,
    reviews: [
      {
        id: 'rev-3',
        author: 'Liam O’Connor',
        rating: 5,
        date: '2026-07-19',
        comment: 'Brought me luck on the greens at Ballybunion! Magnetic snap is super strong.',
        verified: true
      }
    ]
  },
  {
    id: 'prod-3',
    name: 'The Gopher Gentleman Fairway Wood Cover',
    price: 48.00,
    description: 'An iconic character for your bag. Plush faux-fur animal headcover with tailored tweed bowtie and stitched leather eyes. Perfect fit for 3-Wood, 5-Wood and Hybrids.',
    category: 'Animal',
    clubFit: '3 Wood',
    image: 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1000'
    ],
    material: 'Plush Faux-Fur with Houndstooth Fabric Details',
    isWaterproof: false,
    isGenuineLeather: false,
    stock: 9,
    featured: true,
    tags: ['animal', 'funny', 'wood', 'gopher', 'caddy', 'gift'],
    rating: 4.9,
    reviewsCount: 42,
    reviews: [
      {
        id: 'rev-4',
        author: 'Barnaby Finch',
        rating: 5,
        date: '2026-07-02',
        comment: 'Hilarious and top quality! Fits my Taylormade Qi10 3-wood perfectly.',
        verified: true
      }
    ]
  },
  {
    id: 'prod-4',
    name: '"3-Putt Express" Mallet Putter Cover',
    price: 38.00,
    originalPrice: 42.00,
    description: 'Add humor to your putting woes. Premium matte black leather featuring high-contrast "3-Putt Express" embroidery and train icon. Dual magnetic locking tab.',
    category: 'Funny',
    clubFit: 'Mallet Putter',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1593111774601-dfbce7fe2f92?auto=format&fit=crop&q=80&w=1000'
    ],
    material: 'Waterproof PU Leather with Microfiber Cushioning',
    isWaterproof: true,
    isGenuineLeather: false,
    stock: 18,
    featured: true,
    tags: ['funny', 'putter', 'mallet', 'humor', 'waterproof'],
    rating: 4.7,
    reviewsCount: 31,
    reviews: [
      {
        id: 'rev-5',
        author: 'Mark Henderson',
        rating: 5,
        date: '2026-06-15',
        comment: 'Always makes the four-ball chuckle before I proceed to 3-putt anyway!',
        verified: true
      }
    ]
  },
  {
    id: 'prod-5',
    name: 'St. Andrews Tweed & Saddle Leather Hybrid',
    price: 52.00,
    description: 'Authentic Scottish Harris Tweed woven pattern paired with rich saddle tan leather accents. Elasticated interior waist band prevents slippage during round.',
    category: 'Irish',
    clubFit: 'Hybrid',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=80&w=1000'
    ],
    material: 'Handwoven Scottish Tweed & Saddle Leather',
    isWaterproof: false,
    isGenuineLeather: true,
    stock: 8,
    featured: false,
    tags: ['irish', 'leather', 'hybrid', 'tweed', 'heritage'],
    rating: 5.0,
    reviewsCount: 17,
    reviews: []
  },
  {
    id: 'prod-6',
    name: 'The Golden Eagle Leather Driver Cover',
    price: 68.00,
    description: 'Gold foil embossed eagle emblem on deep charcoal top-tier Napa leather. Tailored for golfers who demand understated luxury and absolute distinction.',
    category: 'Leather',
    clubFit: 'Driver',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1000'
    ],
    material: 'Premium Italian Napa Leather & Gold Embossing',
    isWaterproof: true,
    isGenuineLeather: true,
    stock: 11,
    featured: true,
    tags: ['leather', 'luxury', 'driver', 'gold', 'animal'],
    rating: 4.9,
    reviewsCount: 23,
    reviews: []
  },
  {
    id: 'prod-7',
    name: 'The Wise Owl Fairway Wood Cover',
    price: 49.00,
    description: 'Textured leather craftsmanship creating an owl silhouette with embroidered feather details. Soft interior ensures complete crown protection.',
    category: 'Animal',
    clubFit: '3 Wood',
    image: 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=80&w=1000'
    ],
    material: 'Embossed Synthetic Leather',
    isWaterproof: true,
    isGenuineLeather: false,
    stock: 15,
    featured: false,
    tags: ['animal', 'owl', 'wood', 'waterproof'],
    rating: 4.6,
    reviewsCount: 14,
    reviews: []
  },
  {
    id: 'prod-8',
    name: '"Never In Doubt" Gold Embossed Driver Cover',
    price: 42.00,
    description: 'Witty, confident design featuring "Never In Doubt" stitched across gold piping. Lightweight, durable, and guaranteed to spark conversations.',
    category: 'Funny',
    clubFit: 'Driver',
    image: 'https://images.unsplash.com/photo-1593111774601-dfbce7fe2f92?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1593111774601-dfbce7fe2f92?auto=format&fit=crop&q=80&w=1000'
    ],
    material: 'Waterproof Matte PU Leather',
    isWaterproof: true,
    isGenuineLeather: false,
    stock: 20,
    featured: false,
    tags: ['funny', 'driver', 'gold', 'waterproof', 'quote'],
    rating: 4.8,
    reviewsCount: 19,
    reviews: []
  },
  {
    id: 'prod-9',
    name: 'The Celtic Knot Leather Mallet Cover',
    price: 54.00,
    description: 'Traditional Celtic trinity knot laser-etched into rich mahogany genuine leather. Extra padded interior designed for spider & mallet putters.',
    category: 'Irish',
    clubFit: 'Mallet Putter',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1000'
    ],
    material: '100% Mahogany Saddle Leather',
    isWaterproof: true,
    isGenuineLeather: true,
    stock: 10,
    featured: false,
    tags: ['irish', 'celtic', 'leather', 'putter', 'mallet'],
    rating: 4.9,
    reviewsCount: 27,
    reviews: []
  },
  {
    id: 'prod-10',
    name: 'The Highland Stag Driver Cover',
    price: 64.00,
    description: 'Noble stag antler embroidery over deep forest green Napa leather. High luxury finish crafted for golfers with a passion for traditional links heritage.',
    category: 'Animal',
    clubFit: 'Driver',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1000'
    ],
    material: 'Premium Forest Green Napa Leather',
    isWaterproof: true,
    isGenuineLeather: true,
    stock: 7,
    featured: true,
    tags: ['animal', 'leather', 'driver', 'stag', 'luxury'],
    rating: 5.0,
    reviewsCount: 16,
    reviews: []
  },
  {
    id: 'prod-11',
    name: 'The Sovereign Horween Leather Blade Cover',
    price: 58.00,
    description: 'Crafted from USA Horween Chromexcel leather that develops a magnificent personalized patina as you play rounds. Internal magnet locking technology.',
    category: 'Leather',
    clubFit: 'Blade Putter',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1000'
    ],
    material: 'USA Horween Chromexcel Leather',
    isWaterproof: true,
    isGenuineLeather: true,
    stock: 12,
    featured: false,
    tags: ['leather', 'horween', 'putter', 'blade', 'luxury'],
    rating: 4.9,
    reviewsCount: 22,
    reviews: []
  },
  {
    id: 'prod-12',
    name: '"Putt for Dough" Embroidered Utility Cover',
    price: 36.00,
    description: 'Playful embroidery with gold dollar sign accents on white waterproof leather. Universal fit for all hybrid and rescue clubs.',
    category: 'Funny',
    clubFit: 'Hybrid',
    image: 'https://images.unsplash.com/photo-1593111774601-dfbce7fe2f92?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1593111774601-dfbce7fe2f92?auto=format&fit=crop&q=80&w=1000'
    ],
    material: 'Synthetic Waterproof Leather',
    isWaterproof: true,
    isGenuineLeather: false,
    stock: 25,
    featured: false,
    tags: ['funny', 'hybrid', 'waterproof', 'gold', 'dough'],
    rating: 4.6,
    reviewsCount: 18,
    reviews: []
  }
];
