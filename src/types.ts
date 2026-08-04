export type ProductCategory = 'Leather' | 'Funny' | 'Irish' | 'Animal';

export type ClubFit = 'Driver' | '3 Wood' | '5 Wood' | 'Hybrid' | 'Putter' | 'Blade Putter' | 'Mallet Putter' | 'Other';

export interface ProductReview {
  id: string;
  author: string;
  rating: number; // 1-5
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: ProductCategory;
  clubFit: ClubFit;
  allowedClubFits?: ClubFit[];
  image: string;
  gallery: string[];
  material: string;
  isWaterproof: boolean;
  isGenuineLeather: boolean;
  stock: number;
  featured: boolean;
  hidden?: boolean;
  scheduledDate?: string;
  tags: string[];
  rating: number;
  reviewsCount: number;
  reviews: ProductReview[];
}

export interface CategoryInfo {
  id: string;
  name: ProductCategory;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
}

export type CustomHeadcoverType = 'Driver Headcover' | 'Fairway Wood Headcover' | 'Hybrid Headcover' | 'Blade Putter Cover' | 'Mallet Putter Cover';

export type CustomMaterial = 'Genuine Leather' | 'Premium PU Leather';

export interface AIDesignReview {
  overallScore: number;
  resolutionStatus: 'Good' | 'Warning' | 'Low';
  resolutionWarning?: string;
  colorContrastAdvice: string;
  embroiderySuggestions: string[];
  detailLossEstimate: 'Minimal' | 'Moderate' | 'High Detail Loss Likely';
  aiSummary: string;
}

export interface CustomHeadcoverConfig {
  id: string;
  headcoverType: CustomHeadcoverType;
  material: CustomMaterial;
  mainColor: string;
  secondaryColor: string;
  stitchColor: string;
  customText: string;
  font: string;
  embroideryColor: string;
  logoUrl?: string;
  logoFileName?: string;
  imageUrl?: string;
  designerNotes: string;
  aiReview?: AIDesignReview;
  estimatedDays: string;
  price: number;
  createdAt: string;
  status: 'Proof Pending' | 'Proof Sent' | 'Proof Approved' | 'In Production' | 'Shipped';
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedClubFit?: ClubFit;
  customConfig?: CustomHeadcoverConfig;
}

export type OrderStatus = 'Pending' | 'Packed' | 'Shipped' | 'Delivered' | 'Refunded' | 'Processing';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  clubFit?: string;
  customConfig?: CustomHeadcoverConfig;
}

export interface CustomerDetails {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
}

export interface CustomsDeclaration {
  hsCode: string; // e.g. "9506.39.00"
  description: string; // "Golf Headcover"
  countryOfOrigin: string; // "IE"
  declarationType: 'Commercial Goods' | 'Merchandise' | 'Gift' | 'Sample';
  itemValueEuro: number;
  weightKg: number;
}

export interface ShippingLabelData {
  orderId: string;
  orderNumber: string;
  carrier: 'An Post' | 'DPD' | 'DHL' | 'UPS' | 'FedEx';
  serviceType: string;
  trackingNumber: string;
  parcelWeightKg: number;
  dimensionsCm: { length: number; width: number; height: number };
  productDescription: string;
  senderAddress: {
    name: string;
    company: string;
    street: string;
    city: string;
    postcode: string;
    country: string;
    phone: string;
  };
  recipientAddress: CustomerDetails;
  customsInfo?: CustomsDeclaration;
  createdAt: string;
}

export interface ShippingNotification {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  sentAt: string;
  thankYouMessage: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus?: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  trackingNumber?: string;
  carrier?: 'An Post' | 'DPD' | 'DHL' | 'UPS' | 'FedEx' | string;
  paymentMethod: string;
  shippingLabel?: ShippingLabelData;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
}

export interface CustomerUser {
  id: string;
  email: string;
  name: string;
  joinedDate: string;
  totalOrders: number;
  totalSpent: number;
  savedAddresses: CustomerDetails[];
  notes?: string;
}

export interface AIQuizAnswers {
  clubFit: string;
  style: string;
  budget: string;
  genuineLeather: string;
  waterproof: string;
  context: string;
  preferredColours: string;
  personality: string;
}

export interface AIRecommendationItem {
  productId: string;
  reason: string;
  matchScore: number; // e.g. 98%
}

export interface AIRecommendationResponse {
  summary: string;
  recommendations: AIRecommendationItem[];
}

export interface HomepageConfig {
  heroTitle: string;
  heroSubheading: string;
  heroImageUrl: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  announcementText: string;
  promoBannerTitle: string;
  promoBannerSubheading: string;
}

export interface AISettingsConfig {
  systemPrompt: string;
  enabled: boolean;
  featuredProductIds: string[];
}

export interface SaleSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  badgeText?: string;
  discountText?: string;
  linkCategory?: string;
  buttonText?: string;
}

export interface SalePromoConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  autoPlayIntervalSeconds: number;
  slides: SaleSlide[];
}

export interface ShippingRateMatrix {
  ireland: [number, number, number, number]; // for 1, 2, 3, 4+ headcovers
  uk: [number, number, number, number];
  eu: [number, number, number, number];
  us: [number, number, number, number];
}

export interface ShippingSettings {
  freeShippingThreshold: number;
  freeShippingEnabled: boolean;
  rateType: 'headcover_matrix' | 'flat' | 'weight_based';
  flatRate: number;
  weightRatePerKg: number;
  matrix: ShippingRateMatrix;
}

export interface StoreSettings {
  currencySymbol: string;
  freeShippingThreshold: number;
  standardShippingRate: number;
  expressShippingRate: number;
  taxRate: number; // percentage
  paypalEmail: string;
  paypalClientId?: string;
  paypalEnabled: boolean;
  shippingSettings?: ShippingSettings;
}

export interface CustomStudioSettings {
  studioTitle: string;
  studioSubtitle: string;
  deliveryNotice: string;
  typePrices: {
    'Driver Headcover': number;
    'Fairway Wood Headcover': number;
    'Hybrid Headcover': number;
    'Blade Putter Cover': number;
    'Mallet Putter Cover': number;
  };
  materialExtra: {
    'Genuine Leather': number;
    'Premium PU Leather': number;
  };
  availableColors: { name: string; hex: string }[];
  availableFonts: string[];
  enableLogoUpload: boolean;
  enableCustomText: boolean;
  enableNotesDescription: boolean;
}
