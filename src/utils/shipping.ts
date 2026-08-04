import { CartItem, CustomerDetails, Order, ShippingLabelData, ShippingSettings, CustomsDeclaration } from '../types';

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  freeShippingThreshold: 75.00,
  freeShippingEnabled: true,
  rateType: 'headcover_matrix',
  flatRate: 6.99,
  weightRatePerKg: 12.00,
  matrix: {
    // Index 0 = 1 headcover, 1 = 2 headcovers, 2 = 3 headcovers, 3 = 4+ headcovers
    ireland: [6.99, 6.99, 6.99, 6.99],
    uk: [9.99, 11.99, 13.99, 14.99],
    eu: [11.99, 14.99, 16.99, 18.99],
    us: [19.99, 22.99, 25.99, 28.99],
  }
};

export const SENDER_ADDRESS = {
  name: 'Dispatches & Logistics',
  company: 'The Golf Wardrobe Ireland',
  street: 'Unit 4, Dublin Logistics Park, Ballymount',
  city: 'Dublin 12',
  postcode: 'D12 X9K2',
  country: 'Ireland',
  phone: '+353 1 800 465 392'
};

export const EU_COUNTRIES = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark',
  'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy',
  'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal',
  'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'
];

export function normalizeCountryZone(countryString: string): 'ireland' | 'uk' | 'eu' | 'us' {
  if (!countryString) return 'ireland';
  const c = countryString.trim().toLowerCase();
  
  if (c.includes('ireland') || c.includes('eire') || c === 'ie' || c === 'irl') {
    return 'ireland';
  }
  if (c.includes('united kingdom') || c.includes('uk') || c.includes('england') || c.includes('scotland') || c.includes('wales') || c.includes('northern ireland') || c === 'gb') {
    return 'uk';
  }
  if (c.includes('united states') || c.includes('usa') || c.includes('us') || c.includes('america')) {
    return 'us';
  }
  // Check if EU
  if (EU_COUNTRIES.some(eu => c.includes(eu.toLowerCase()))) {
    return 'eu';
  }
  
  return 'us'; // Default rest of world to US rate
}

export function countTotalHeadcovers(cartItems: CartItem[]): number {
  if (!cartItems || cartItems.length === 0) return 0;
  return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
}

export function calculateShippingFee(
  cartItems: CartItem[],
  customerCountry: string,
  subtotal: number,
  settings: ShippingSettings = DEFAULT_SHIPPING_SETTINGS
): number {
  // Free Shipping check
  if (settings.freeShippingEnabled && subtotal >= settings.freeShippingThreshold) {
    return 0.00;
  }

  const headcoverCount = countTotalHeadcovers(cartItems);
  if (headcoverCount === 0) return 0.00;

  if (settings.rateType === 'flat') {
    return settings.flatRate;
  }

  if (settings.rateType === 'weight_based') {
    const totalWeightKg = Math.max(0.3, headcoverCount * 0.3);
    return Math.round(totalWeightKg * settings.weightRatePerKg * 100) / 100;
  }

  // Matrix calculation based on headcovers count (1, 2, 3, 4+)
  const zone = normalizeCountryZone(customerCountry);
  const matrixRates = settings.matrix[zone] || settings.matrix.us;
  
  // Index 0 for 1, 1 for 2, 2 for 3, 3 for 4 or more
  const index = Math.min(Math.max(1, headcoverCount), 4) - 1;
  return matrixRates[index];
}

export function isCustomsRequired(country: string): boolean {
  const zone = normalizeCountryZone(country);
  // UK, US, or Non-EU required customs declaration (CN22/CN23)
  if (zone === 'uk' || zone === 'us') return true;
  if (zone === 'ireland') return false;
  
  // Check if non-EU
  const c = country.trim().toLowerCase();
  const isEu = EU_COUNTRIES.some(eu => c.includes(eu.toLowerCase()));
  return !isEu;
}

export function generateTrackingNumber(carrier: string): string {
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
  switch (carrier) {
    case 'An Post':
      return `AP${randomDigits}IE`;
    case 'DPD':
      return `DPD${randomDigits}`;
    case 'DHL':
      return `DHL${randomDigits}`;
    case 'UPS':
      return `1Z999999${randomDigits.toString().substring(0, 8)}`;
    case 'FedEx':
      return `FX${randomDigits}`;
    default:
      return `GW${randomDigits}IE`;
  }
}

export function createShippingLabelData(
  order: Order,
  carrier: 'An Post' | 'DPD' | 'DHL' | 'UPS' | 'FedEx' = 'An Post',
  weightKg?: number,
  dimensions?: { length: number; width: number; height: number }
): ShippingLabelData {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const calculatedWeight = weightKg || Math.max(0.3, Math.round(totalItems * 0.25 * 100) / 100);
  const trackingNumber = order.trackingNumber || generateTrackingNumber(carrier);

  const customsNeeded = isCustomsRequired(order.customer.country);
  
  let customsInfo: CustomsDeclaration | undefined = undefined;
  if (customsNeeded) {
    customsInfo = {
      hsCode: '9506.39.00', // HS Code for Golf Equipment & Headcovers
      description: 'Golf Headcover (Synthetic/Leather)',
      countryOfOrigin: 'IE',
      declarationType: 'Commercial Goods',
      itemValueEuro: order.subtotal,
      weightKg: calculatedWeight
    };
  }

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    carrier,
    serviceType: carrier === 'An Post' ? 'Express Post Registered' : `${carrier} Express Delivery`,
    trackingNumber,
    parcelWeightKg: calculatedWeight,
    dimensionsCm: dimensions || { length: 30, width: 20, height: 10 },
    productDescription: 'Golf Headcover',
    senderAddress: SENDER_ADDRESS,
    recipientAddress: order.customer,
    customsInfo,
    createdAt: new Date().toISOString()
  };
}

export function exportOrdersToCSV(orders: Order[]): void {
  const headers = [
    'Order Number',
    'Date',
    'Customer Name',
    'Email',
    'Phone',
    'Street Address',
    'City',
    'Postcode',
    'Country',
    'Items Summary',
    'Total Quantity',
    'Subtotal (€)',
    'Discount (€)',
    'Shipping Fee (€)',
    'Order Total (€)',
    'Payment Method',
    'Payment Status',
    'Order Status',
    'Carrier',
    'Tracking Number'
  ];

  const rows = orders.map(order => {
    const customerName = `${order.customer.firstName} ${order.customer.lastName}`;
    const fullAddress = `${order.customer.address}${order.customer.apartment ? `, ${order.customer.apartment}` : ''}`;
    const itemsSummary = order.items.map(i => `${i.name} (x${i.quantity})`).join('; ');
    const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

    return [
      `"${order.orderNumber}"`,
      `"${order.date}"`,
      `"${customerName.replace(/"/g, '""')}"`,
      `"${order.customer.email}"`,
      `"${order.customer.phone || ''}"`,
      `"${fullAddress.replace(/"/g, '""')}"`,
      `"${order.customer.city.replace(/"/g, '""')}"`,
      `"${order.customer.postcode}"`,
      `"${order.customer.country}"`,
      `"${itemsSummary.replace(/"/g, '""')}"`,
      totalQty,
      order.subtotal.toFixed(2),
      order.discount.toFixed(2),
      order.shippingFee.toFixed(2),
      order.total.toFixed(2),
      `"${order.paymentMethod}"`,
      `"${order.paymentStatus || 'Paid'}"`,
      `"${order.status}"`,
      `"${order.carrier || 'An Post'}"`,
      `"${order.trackingNumber || ''}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `golf_wardrobe_orders_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
