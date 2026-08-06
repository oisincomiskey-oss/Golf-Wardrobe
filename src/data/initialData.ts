import { CategoryInfo, HomepageConfig, AISettingsConfig, StoreSettings, Order, CustomerUser, SalePromoConfig, CustomHeadcoverConfig, CustomStudioSettings } from '../types';
import { DEFAULT_SHIPPING_SETTINGS } from '../utils/shipping';

export const INITIAL_CATEGORIES: CategoryInfo[] = [
  {
    id: 'cat-leather',
    name: 'Leather',
    slug: 'leather',
    description: '100% full-grain Florentine and Napa saddle leather headcovers handcrafted for understated elegance.',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1000',
    displayOrder: 1
  },
  {
    id: 'cat-funny',
    name: 'Funny',
    slug: 'funny',
    description: 'Witty embroideries and lighthearted banter designs that bring personality to every tee box.',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1000',
    displayOrder: 2
  },
  {
    id: 'cat-irish',
    name: 'Irish',
    slug: 'irish',
    description: 'Heritage Shamrock motifs, Celtic knots and authentic Scottish Harris Tweed crafted with Irish luck.',
    image: 'https://images.unsplash.com/photo-1593111774601-dfbce7fe2f92?auto=format&fit=crop&q=80&w=1000',
    displayOrder: 3
  },
  {
    id: 'cat-animal',
    name: 'Animal',
    slug: 'animal',
    description: 'Charming Gophers, Highland Stags and Golden Eagles with plush fur linings and custom details.',
    image: 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=80&w=1000',
    displayOrder: 4
  }
];

export const INITIAL_HOMEPAGE_CONFIG: HomepageConfig = {
  heroTitle: "Find the Perfect Headcover for Your Game.",
  heroSubheading: "Premium golf headcovers with unique designs that combine luxury, personality and craftsmanship.",
  heroImageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1600",
  primaryButtonText: "Shop Now",
  secondaryButtonText: "Find My Headcover",
  announcementText: "Free Ireland Delivery on Orders Over €75 • Complimentary Luxury Gift Box Included",
  promoBannerTitle: "Crafted for Golfers Who Appreciate Distinction.",
  promoBannerSubheading: "Every Golf Wardrobe headcover features plush scratch-proof lining, reinforced magnetic closures, and weather-defying materials."
};

export const INITIAL_AI_SETTINGS: AISettingsConfig = {
  systemPrompt: `You are the AI Concierge for "The Golf Wardrobe", an elite luxury golf headcover brand.
Your goal is to recommend the best headcovers based on the customer's preferred club, style (Luxury, Funny, Irish, Animal, Classic, Minimal), budget, leather preference, waterproofing, gift context, preferred colours, and personality.
Always sound sophisticated, warm, helpful, and eloquent like a master golf caddie or boutique luxury associate.
Reference specific products from the available inventory, explain WHY they match the customer's criteria, and suggest complementary items.`,
  enabled: true,
  featuredProductIds: ['prod-1', 'prod-2', 'prod-6', 'prod-10']
};

export const INITIAL_CUSTOM_ORDERS: CustomHeadcoverConfig[] = [
  {
    id: 'custom-101',
    headcoverType: 'Driver Headcover',
    material: 'Genuine Leather',
    mainColor: '#1A1A1A',
    secondaryColor: '#3B1C59',
    stitchColor: '#C9A24D',
    customText: 'ST ANDREWS 18',
    font: 'Serif Classic',
    embroideryColor: '#C9A24D',
    designerNotes: 'Please center the gold embroidery text on the upper saddle flap and double reinforce the throat seam.',
    aiReview: {
      overallScore: 98,
      resolutionStatus: 'Good',
      colorContrastAdvice: 'Deep black Florentine leather paired with Golf Gold thread offers maximum high-contrast visibility.',
      embroiderySuggestions: [
        'High-density 12,000 stitch satin embroidery recommended.',
        'Saddle perimeter stitching enhances weather durability.'
      ],
      detailLossEstimate: 'Minimal',
      aiSummary: 'Tour-grade luxury custom Driver headcover design. Passed master embroidery digitizing inspection.'
    },
    estimatedDays: '7-10 Business Days',
    price: 84.99,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'Proof Pending'
  },
  {
    id: 'custom-102',
    headcoverType: 'Blade Putter Cover',
    material: 'Genuine Leather',
    mainColor: '#0D382C',
    secondaryColor: '#FAF8F5',
    stitchColor: '#C9A24D',
    customText: 'BALLYBUNION #1',
    font: 'Script Elegant',
    embroideryColor: '#FAF8F5',
    designerNotes: 'Include custom magnetic flap closure and plush emerald velvet inner lining.',
    aiReview: {
      overallScore: 95,
      resolutionStatus: 'Good',
      colorContrastAdvice: 'Emerald leather with off-white thread creates a classic links aesthetic.',
      embroiderySuggestions: [
        'Script font flourishes will be stabilized with backing mesh.'
      ],
      detailLossEstimate: 'Minimal',
      aiSummary: 'Charming links-style putter cover.'
    },
    estimatedDays: '7-10 Business Days',
    price: 64.99,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    status: 'In Production'
  }
];

export const INITIAL_SALE_PROMO_CONFIG: SalePromoConfig = {
  enabled: true,
  title: "Exclusive Season Sale",
  subtitle: "Limited time pricing on handcrafted Florentine leather, Irish luck, and humorous headcover editions.",
  autoPlayIntervalSeconds: 4,
  slides: [
    {
      id: 'sale-1',
      imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200',
      title: 'Florentine Leather Clearance Sale',
      subtitle: 'Up to 30% Off Genuine Saddle Leather Drivers & Fairway Woods.',
      badgeText: 'LIMITED SALE',
      discountText: '30% OFF',
      linkCategory: 'Leather',
      buttonText: 'Shop Leather Sale'
    },
    {
      id: 'sale-2',
      imageUrl: 'https://images.unsplash.com/photo-1593111774601-dfbce7fe2f92?auto=format&fit=crop&q=80&w=1200',
      title: 'Irish Heritage & Shamrock Specials',
      subtitle: 'Bring Irish luck to your tee box with 20% Off St. Andrews & Tweed Covers.',
      badgeText: 'IRISH COLLECTION',
      discountText: '20% OFF',
      linkCategory: 'Irish',
      buttonText: 'Explore Irish Sale'
    },
    {
      id: 'sale-3',
      imageUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200',
      title: 'Humorous & Animal Novelty Bundle Deal',
      subtitle: 'Buy 2 Novelty or Animal Headcovers & Save an Extra 15% Automatically.',
      badgeText: 'POPULAR BUNDLE',
      discountText: 'SAVE 15%',
      linkCategory: 'Funny',
      buttonText: 'Shop Funny Headcovers'
    }
  ]
};

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  currencySymbol: '€',
  freeShippingThreshold: 75.00,
  standardShippingRate: 6.99,
  expressShippingRate: 9.99,
  taxRate: 23, // 23% Irish VAT included or calculated
  paypalEmail: 'payments@thegolfwardrobe.com',
  paypalClientId: 'sb-client-id-golfwardrobe-live',
  paypalEnabled: true,
  shippingSettings: DEFAULT_SHIPPING_SETTINGS
};

export const INITIAL_CUSTOM_STUDIO_SETTINGS: CustomStudioSettings = {
  studioTitle: 'Design & Buy Custom Headcovers',
  studioSubtitle: 'Design a 100% custom leather headcover for your driver, fairway woods, hybrids, or putters. Personalized with your custom text, colors, material, and embroidered logo artwork.',
  deliveryNotice: 'Handcrafted to Order in Ireland • 7-10 Business Days Production • 100% Digital Proof Included',
  typePrices: {
    'Driver Headcover': 79.99,
    'Fairway Wood Headcover': 69.99,
    'Hybrid Headcover': 64.99,
    'Blade Putter Cover': 59.99,
    'Mallet Putter Cover': 64.99,
  },
  materialExtra: {
    'Genuine Leather': 15.00,
    'Premium PU Leather': 0.00,
  },
  availableColors: [
    { name: 'Pure White', hex: '#FFFFFF' },
    { name: 'Pitch Black', hex: '#1A1A1A' },
    { name: 'Emerald Green', hex: '#0D382C' },
    { name: 'Navy Blue', hex: '#1E3A8A' },
    { name: 'Royal Blue', hex: '#2563EB' },
    { name: 'Burgundy Wine', hex: '#7F1D1D' },
    { name: 'Crimson Red', hex: '#DC2626' },
    { name: 'Golf Gold', hex: '#C9A24D' },
    { name: 'Saddle Tan', hex: '#8B5E3C' },
    { name: 'Charcoal Grey', hex: '#4B5563' },
  ],
  availableFonts: [
    'Serif Classic',
    'Script Elegant',
    'Athletic Bold',
    'Modern Minimal',
    'Gothic Blackletter'
  ],
  enableLogoUpload: true,
  enableCustomText: true,
  enableNotesDescription: true,
};

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_CUSTOMERS: CustomerUser[] = [];
