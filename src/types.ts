export interface Product {
  id: string;
  name: string;
  shortName: string;
  price: number;
  formattedPrice: string;
  ref: string;
  category: 'ai' | 'creative' | 'streaming' | string;
  categoryLabel: string;
  tag: string;
  badge: string;
  badgeIcon: string;
  desc?: string;
  shortDesc?: string;
  longDesc?: string;
  icon?: string;
  targetLabel?: string;
  deliveryNote?: string;
  accentGradient?: string;
  glowColor?: string;
  iconColor?: string;
  durationTag: string;
  vendorName?: string;
  unitCost?: number;
  vendorCost?: number;
  imageUrl?: string;
  brandLogo?: string;
  features?: string[];
  isActive?: boolean;
}

export interface Order {
  id: string;
  refNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCity: string;
  customerRole: string;
  customerTag?: 'VIP' | 'Repeat' | 'New' | 'Agency' | 'Client';
  productName: string;
  productId: string;
  planDetails: string;
  timestamp: string;
  expiryDate?: string; // e.g. "2026-11-28" or "Nov 28, 2026"
  expiryStatus?: 'Active' | 'Expiring Soon' | 'Expired';
  licenseKey?: string;
  sellingPrice: number;
  vendorOrigin: string;
  vendorCost: number;
  paymentRail: 'Meezan Bank' | 'Nayapay Wallet' | 'JazzCash Retail' | 'Bank Alfalah' | 'Easypaisa';
  transactionId: string;
  status: 'Verified' | 'Awaiting Slip' | 'Dispatched';
  notes?: string;
  receiptName?: string;
  receiptImage?: string; // Data URL / preview of payment screenshot
  receiptSize?: string;
}

export interface Vendor {
  id: string;
  partnerName: string;
  region: string;
  code: string;
  catalogs: string;
  supplierSpendPkr: number;
  unitBuyPrice: string;
  luminaRetail: string;
  fulfillmentSpeed: string;
  defectRate: string;
  defectTier: 'Elite' | 'Stable' | 'Managed' | 'Pristine';
  status: 'Active Priority' | 'Operational' | 'Active' | 'Contracted';
}

export interface CustomerDossier {
  name: string;
  phone: string;
  email: string;
  city: string;
  role: string;
  reliability: string;
  ltv: number;
  completedOrders: number;
  disputes: number;
  orderHistory: {
    product: string;
    vendor: string;
    cost: number;
    profit: number;
    date: string;
  }[];
}

export interface PaymentSettings {
  bankName: string;
  bankSubtitle: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  walletName: string;
  walletNumber: string;
  walletTitle: string;
  whatsappSupportNumber: string;
  whatsappDisplay: string;
  ocrNoticeMinutes: string;
}
