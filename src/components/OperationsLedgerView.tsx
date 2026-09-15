import React, { useState } from 'react';
import { Order, Vendor, CustomerDossier, PaymentSettings, Product } from '../types';
import { VENDORS, CUSTOMER_DOSSIERS, PRODUCTS } from '../data/mockData';
import { AdminPaymentSettingsModal } from './AdminPaymentSettingsModal';
import { EditOrderModal } from './EditOrderModal';
import { EditCustomerDossierModal } from './EditCustomerDossierModal';
import { EditVendorModal } from './EditVendorModal';
import { EditProductModal } from './EditProductModal';
import { AIOperationsAgentModal } from './AIOperationsAgentModal';

interface OperationsLedgerViewProps {
  orders: Order[];
  products?: Product[];
  onUpdateProducts?: (newProducts: Product[]) => void;
  onAddProduct?: (newProduct: Product) => void;
  onSaveProduct?: (savedProduct: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onAddOrder: (order: Order) => void;
  onUpdateOrder: (updatedOrder: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onResetOrders?: () => void;
  onNavigateToCheckout: () => void;
  paymentSettings: PaymentSettings;
  onUpdatePaymentSettings: (newSettings: PaymentSettings) => void;
  onOpenAIAgent?: () => void;
  onOpenLiveVoice?: () => void;
}

export const OperationsLedgerView: React.FC<OperationsLedgerViewProps> = ({
  orders,
  products = PRODUCTS,
  onUpdateProducts,
  onAddProduct,
  onSaveProduct,
  onDeleteProduct,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
  onResetOrders,
  onNavigateToCheckout,
  paymentSettings,
  onUpdatePaymentSettings,
  onOpenAIAgent,
  onOpenLiveVoice,
}) => {
  const [adminSectionTab, setAdminSectionTab] = useState<'orders' | 'receipts' | 'products' | 'crm' | 'vendors' | 'payments'>('orders');
  const [showAIAgentModal, setShowAIAgentModal] = useState(false);
  const [receiptFilter, setReceiptFilter] = useState<'all' | 'verified' | 'awaiting' | 'dispatched'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'expired' | 'expiring-soon' | 'high-margin' | 'canva' | 'ai' | 'capcut'
  >('all');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
  const [showCustomerDossierModal, setShowCustomerDossierModal] = useState(false);
  const [dateRange, setDateRange] = useState('All Time (Live Active P&L)');

  // Product Management States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | 'ai' | 'creative' | 'streaming' | string>('all');
  const [productViewMode, setProductViewMode] = useState<'grid' | 'table'>('grid');

  // Modal States
  const [showLogSaleModal, setShowLogSaleModal] = useState(false);
  const [showVendorSupplyModal, setShowVendorSupplyModal] = useState(false);
  const [showPaymentSettingsModal, setShowPaymentSettingsModal] = useState(false);

  // Edit / Delete Modals
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<{
    img?: string;
    name?: string;
    ref: string;
    customer: string;
    amount: number;
    rail: string;
  } | null>(null);

  // CRM Dossier State with LocalStorage persistence
  const [dossiers, setDossiers] = useState<Record<string, CustomerDossier>>(() => {
    const saved = localStorage.getItem('insight_customer_dossiers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // If stored data contains the old mock dossiers, purge them to empty
          if (parsed['Ayesha Khan'] && parsed['Ayesha Khan'].phone === '+92 301 4452109') {
            localStorage.setItem('insight_customer_dossiers', JSON.stringify({}));
            return {};
          }
          return parsed;
        }
      } catch {
        return {};
      }
    }
    return CUSTOMER_DOSSIERS;
  });
  const [editingDossier, setEditingDossier] = useState<CustomerDossier | null>(null);

  // Vendor List State with LocalStorage persistence
  const [vendorList, setVendorList] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('insight_vendors');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // If stored data has old supplier spend totals, zero out spends for fresh start
          const hasOldSpends = parsed.some((v: Vendor) => (v.supplierSpendPkr || 0) > 0);
          if (hasOldSpends) {
            const zeroed = parsed.map((v: Vendor) => ({ ...v, supplierSpendPkr: 0 }));
            localStorage.setItem('insight_vendors', JSON.stringify(zeroed));
            return zeroed;
          }
          return parsed;
        }
      } catch {
        return VENDORS;
      }
    }
    return VENDORS;
  });
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // New Sale Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustCity, setNewCustCity] = useState('Lahore');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newProduct, setNewProduct] = useState('ChatGPT Plus 1-Mo');
  const [newSellPrice, setNewSellPrice] = useState(1499);
  const [newVendorCost, setNewVendorCost] = useState(580);
  const [newVendor, setNewVendor] = useState('GlobalKeyHub_NG');
  const [newPaymentRail, setNewPaymentRail] = useState<Order['paymentRail']>('Meezan Bank');
  const [newLicenseKey, setNewLicenseKey] = useState('');
  const [newDurationDays, setNewDurationDays] = useState(30);

  // Vendor Supply Form State
  const [supplyVendorName, setSupplyVendorName] = useState('TechWholesale_TR');
  const [supplyBatchSpend, setSupplyBatchSpend] = useState(25000);
  const [supplyCatalog, setSupplyCatalog] = useState('Canva Edu Enterprise 100-Pack');

  // Counts for tabs
  const expiredOrdersCount = orders.filter((o) => {
    if (o.expiryStatus === 'Expired') return true;
    if (o.expiryDate && new Date(o.expiryDate) < new Date()) return true;
    return false;
  }).length;

  const expiringSoonCount = orders.filter((o) => {
    if (o.expiryStatus === 'Expiring Soon') return true;
    if (o.expiryDate) {
      const diffDays = (new Date(o.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    return false;
  }).length;

  // Filtered Orders with multi-attribute search (Customer Name, Order ID / Ref, Product Name, etc.)
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      order.customerName.toLowerCase().includes(q) ||
      (order.customerPhone && order.customerPhone.toLowerCase().includes(q)) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(q)) ||
      (order.customerCity && order.customerCity.toLowerCase().includes(q)) ||
      order.productName.toLowerCase().includes(q) ||
      (order.productId && order.productId.toLowerCase().includes(q)) ||
      order.refNumber.toLowerCase().includes(q) ||
      order.id.toLowerCase().includes(q) ||
      (order.transactionId && order.transactionId.toLowerCase().includes(q)) ||
      (order.paymentRail && order.paymentRail.toLowerCase().includes(q)) ||
      (order.licenseKey && order.licenseKey.toLowerCase().includes(q)) ||
      (order.planDetails && order.planDetails.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    const profit = order.sellingPrice - order.vendorCost;
    const margin = order.sellingPrice > 0 ? (profit / order.sellingPrice) * 100 : 0;

    const isExp =
      order.expiryStatus === 'Expired' ||
      (order.expiryDate ? new Date(order.expiryDate) < new Date() : false);

    const isExpSoon =
      order.expiryStatus === 'Expiring Soon' ||
      (order.expiryDate
        ? (() => {
            const diffDays =
              (new Date(order.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
            return diffDays >= 0 && diffDays <= 7;
          })()
        : false);

    if (activeFilter === 'expired') return isExp;
    if (activeFilter === 'expiring-soon') return isExpSoon;
    if (activeFilter === 'high-margin') return margin >= 70;
    if (activeFilter === 'canva') return order.productName.toLowerCase().includes('canva');
    if (activeFilter === 'ai') {
      const p = order.productName.toLowerCase();
      return p.includes('chatgpt') || p.includes('kling') || p.includes('higgsfield') || p.includes('ai');
    }
    if (activeFilter === 'capcut') return order.productName.toLowerCase().includes('capcut');

    return true;
  });

  // KPI Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.sellingPrice, 0);
  const totalCOGS = orders.reduce((sum, o) => sum + o.vendorCost, 0);
  const netProfit = totalRevenue - totalCOGS;
  const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';
  const avgProfitPerOrder = orders.length > 0 ? Math.round(netProfit / orders.length) : 0;

  // Selected Customer Dossier Calculation
  const effectiveCustomerName = selectedCustomerName || (orders.length > 0 ? orders[0].customerName : Object.keys(dossiers)[0] || '');
  const matchingOrders = orders.filter((o) => o.customerName.toLowerCase() === effectiveCustomerName.toLowerCase());
  const customerLtv = matchingOrders.reduce((sum, o) => sum + o.sellingPrice, 0);

  const customerDossier: CustomerDossier | null = effectiveCustomerName
    ? dossiers[effectiveCustomerName] || {
        name: effectiveCustomerName,
        phone: matchingOrders[0]?.customerPhone || '+92 300 0000000',
        email: matchingOrders[0]?.customerEmail || `${effectiveCustomerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        city: matchingOrders[0]?.customerCity || 'Pakistan',
        role: matchingOrders[0]?.customerRole || 'Verified Client',
        reliability: '100% Reliable',
        ltv: customerLtv,
        completedOrders: matchingOrders.length,
        disputes: 0,
        orderHistory: matchingOrders.map((o) => ({
          product: o.productName,
          vendor: `${o.vendorOrigin} (Rs ${o.vendorCost})`,
          cost: o.vendorCost,
          profit: o.sellingPrice - o.vendorCost,
          date: o.timestamp,
        })),
      }
    : null;

  // WhatsApp Renewal Reminder
  const handleSendWhatsAppRenewal = (order: Order) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const targetPhone = cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone.replace(/^0/, '');
    const expLabel = order.expiryDate ? `tareekh (${order.expiryDate})` : 'recently';

    const msg = `Assalam-o-Alaikum ${order.customerName}!\n\nInsight Products support desk se rabta kar rahe hain.\n\nAapka *${order.productName}* subscription/license ${expLabel} ko expire ho chuka hai / expire honay wala hai.\n\nKya aap isay renew karwana chahte hain taake continuous access active rahay?\n*Renewal Price:* Rs ${order.sellingPrice.toLocaleString()}\n*Payment Options:* ${paymentSettings.bankName} (${paymentSettings.accountNumber}) / Wallet (${paymentSettings.walletNumber})\n\nDirect isi WhatsApp par reply kar dein. Shukriya!\n- Insight Products (Official Support)`;

    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setExportNotice(`WhatsApp renewal message generated for ${order.customerName} (${order.customerPhone})!`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Quick Renew
  const handleQuickRenew = (order: Order, days: number = 30) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const newExp = d.toISOString().split('T')[0];

    const updated: Order = {
      ...order,
      expiryDate: newExp,
      expiryStatus: 'Active',
      status: 'Verified',
      timestamp: 'Just now (Renewed)',
    };
    onUpdateOrder(updated);
    setExportNotice(`Order #${order.refNumber} renewed! New expiry set to ${newExp}.`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Quick Status Toggle
  const handleQuickToggleStatus = (order: Order, newStatus: Order['status']) => {
    const updated: Order = { ...order, status: newStatus };
    onUpdateOrder(updated);
    setExportNotice(`Order #${order.refNumber} status marked as "${newStatus}"!`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Dossier Save / Delete Handlers
  const handleSaveDossier = (updatedDossier: CustomerDossier) => {
    const updated = { ...dossiers, [updatedDossier.name]: updatedDossier };
    setDossiers(updated);
    localStorage.setItem('insight_customer_dossiers', JSON.stringify(updated));
    setSelectedCustomerName(updatedDossier.name);
    setEditingDossier(null);
    setExportNotice(`Customer Dossier for ${updatedDossier.name} saved!`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleDeleteDossier = (customerName: string) => {
    const updated = { ...dossiers };
    delete updated[customerName];
    setDossiers(updated);
    localStorage.setItem('insight_customer_dossiers', JSON.stringify(updated));
    setEditingDossier(null);
    const remainingNames = Object.keys(updated);
    if (remainingNames.length > 0) {
      setSelectedCustomerName(remainingNames[0]);
    }
    setExportNotice(`Customer Dossier for ${customerName} removed!`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Vendor Save / Delete Handlers
  const handleSaveVendor = (updatedVendor: Vendor) => {
    let updated: Vendor[];
    if (updatedVendor.id.startsWith('new-')) {
      const realId = `v-${Date.now()}`;
      updated = [{ ...updatedVendor, id: realId }, ...vendorList];
    } else {
      updated = vendorList.map((v) => (v.id === updatedVendor.id ? updatedVendor : v));
    }
    setVendorList(updated);
    localStorage.setItem('insight_vendors', JSON.stringify(updated));
    setEditingVendor(null);
    setExportNotice(`Supplier partner ${updatedVendor.partnerName} saved!`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleDeleteVendor = (vendorId: string) => {
    const updated = vendorList.filter((v) => v.id !== vendorId);
    setVendorList(updated);
    localStorage.setItem('insight_vendors', JSON.stringify(updated));
    setEditingVendor(null);
    setExportNotice(`Supplier partner deleted from matrix!`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Product CRUD Handlers
  const handleAddNewProductModal = () => {
    const newTemplate: Product = {
      id: `prod-${Date.now()}`,
      name: '',
      shortName: '',
      ref: `INS-${Math.floor(100 + Math.random() * 900)}`,
      category: 'ai',
      categoryLabel: 'AI Tool',
      price: 1500,
      formattedPrice: 'Rs 1,500',
      vendorCost: 500,
      badge: 'Best Seller',
      badgeIcon: 'verified',
      tag: 'Direct Delivery',
      brandLogo: 'NEW',
      icon: 'star',
      iconColor: 'text-[#4648d4]',
      accentGradient: 'from-[#4648d4] to-[#6063ee]',
      glowColor: 'rgba(70,72,212,0.3)',
      durationTag: '30 Days Pass',
      shortDesc: 'Instant digital credentials with warranty',
      longDesc: 'Complete premium subscription pass with instant WhatsApp activation and full warranty.',
      features: [
        'Instant WhatsApp credentials delivery',
        '100% Replacement warranty',
        'Official tier access',
      ],
      isActive: true,
    };
    setEditingProduct(newTemplate);
  };

  const handleSaveProductInternal = (saved: Product) => {
    if (onSaveProduct) {
      onSaveProduct(saved);
    } else if (onUpdateProducts) {
      const exists = products.some((p) => p.id === saved.id);
      let updated: Product[];
      if (exists) {
        updated = products.map((p) => (p.id === saved.id ? saved : p));
      } else {
        updated = [saved, ...products];
      }
      onUpdateProducts(updated);
    }
    setEditingProduct(null);
    setExportNotice(`Product "${saved.name || saved.shortName}" saved to catalog!`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleDeleteProductInternal = (prodId: string) => {
    if (onDeleteProduct) {
      onDeleteProduct(prodId);
    } else if (onUpdateProducts) {
      const updated = products.filter((p) => p.id !== prodId);
      onUpdateProducts(updated);
    }
    setProductToDelete(null);
    setEditingProduct(null);
    setExportNotice(`Product deleted from catalog!`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleDuplicateProductInternal = (prod: Product) => {
    const clone: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      name: `${prod.name} (Copy)`,
      shortName: `${prod.shortName} Copy`,
      ref: `INS-${Math.floor(100 + Math.random() * 900)}`,
    };
    if (onAddProduct) {
      onAddProduct(clone);
    } else if (onUpdateProducts) {
      onUpdateProducts([clone, ...products]);
    }
    setExportNotice(`Duplicated "${prod.name}" as new product draft!`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleToggleProductStatus = (prod: Product) => {
    const updated: Product = {
      ...prod,
      isActive: prod.isActive === false ? true : false,
    };
    handleSaveProductInternal(updated);
  };

  // Filtered Products for Admin Matrix
  const filteredCatalogProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.shortName.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.ref.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      (p.brandLogo && p.brandLogo.toLowerCase().includes(productSearchQuery.toLowerCase())) ||
      p.categoryLabel.toLowerCase().includes(productSearchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (productCategoryFilter === 'all') return true;
    return p.category === productCategoryFilter;
  });

  // Create Manual Sale
  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();

    const d = new Date();
    d.setDate(d.getDate() + newDurationDays);
    const expDateStr = d.toISOString().split('T')[0];

    const newOrder: Order = {
      id: `ord-man-${Date.now()}`,
      refNumber: `TX-${Math.floor(1000000 + Math.random() * 9000000)}`,
      customerName: newCustName || 'Direct Client',
      customerPhone: newCustPhone || '+92 300 0000000',
      customerEmail: newCustEmail || 'client@insightproducts.pk',
      customerCity: newCustCity || 'Lahore',
      customerRole: 'Client',
      customerTag: 'VIP',
      productName: newProduct,
      productId: 'chatgpt',
      planDetails: `${newDurationDays} Days Plan`,
      timestamp: 'Just now',
      expiryDate: expDateStr,
      expiryStatus: 'Active',
      licenseKey: newLicenseKey || `INS-KEY-${Math.floor(1000 + Math.random() * 9000)}`,
      sellingPrice: newSellPrice,
      vendorOrigin: newVendor,
      vendorCost: newVendorCost,
      paymentRail: newPaymentRail,
      transactionId: `MAN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Verified',
    };

    onAddOrder(newOrder);
    setShowLogSaleModal(false);
    setSelectedCustomerName(newOrder.customerName);
    setExportNotice(`Live Sale logged for ${newOrder.customerName} (Rs ${newSellPrice.toLocaleString()})!`);
    setTimeout(() => setExportNotice(null), 4000);

    // Reset Form
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewLicenseKey('');
  };

  // Add Vendor Supply Batch
  const handleAddSupply = (e: React.FormEvent) => {
    e.preventDefault();
    setVendorList((prev) =>
      prev.map((v) =>
        v.partnerName === supplyVendorName
          ? { ...v, supplierSpendPkr: v.supplierSpendPkr + supplyBatchSpend }
          : v
      )
    );
    setShowVendorSupplyModal(false);
    setExportNotice(`Recorded Rs ${supplyBatchSpend.toLocaleString()} restock spend for ${supplyVendorName}!`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Order ID',
      'Ref Number',
      'Customer Name',
      'Customer Phone',
      'Product',
      'Selling Price PKR',
      'Vendor Cost PKR',
      'Net Profit PKR',
      'Payment Rail',
      'Status',
      'Expiry Date',
      'Expiry Status',
      'License Key',
      'Timestamp',
    ];
    const rows = orders.map((o) => [
      o.id,
      o.refNumber,
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.productName}"`,
      o.sellingPrice,
      o.vendorCost,
      o.sellingPrice - o.vendorCost,
      `"${o.paymentRail}"`,
      o.status,
      o.expiryDate || '',
      o.expiryStatus || '',
      `"${o.licenseKey || ''}"`,
      `"${o.timestamp}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Insight_Operations_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(`Exported ${orders.length} orders to CSV successfully!`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen">
      {/* Top Banner Notice */}
      {exportNotice && (
        <div className="fixed top-20 right-5 z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#4648d4] text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#213145]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <span className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">delete_forever</span>
              </span>
              <div>
                <h3 className="font-headline font-bold text-lg text-[#0b1c30]">
                  Delete Live Order #{orderToDelete.refNumber}?
                </h3>
                <p className="text-xs text-[#767586]">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-xs space-y-1 text-red-900">
              <div>Customer: <strong>{orderToDelete.customerName}</strong> ({orderToDelete.customerPhone})</div>
              <div>Product: <strong>{orderToDelete.productName}</strong></div>
              <div>Selling Price: <strong>Rs {orderToDelete.sellingPrice.toLocaleString()}</strong></div>
              <div>Vendor Cost (COGS): <strong>Rs {orderToDelete.vendorCost.toLocaleString()}</strong></div>
            </div>

            <p className="text-xs text-[#464554] leading-relaxed">
              Deleting this record will immediately deduct this transaction from your active revenue, COGS, and profit calculations in the live ledger.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#dce9ff] text-gray-700 font-bold hover:bg-[#f8f9ff]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                  setExportNotice(`Order #${orderToDelete.refNumber} deleted successfully!`);
                  setTimeout(() => setExportNotice(null), 3500);
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Yes, Delete Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#213145]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <span className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">delete_forever</span>
              </span>
              <div>
                <h3 className="font-headline font-bold text-lg text-[#0b1c30]">
                  Delete Product &quot;{productToDelete.name}&quot;?
                </h3>
                <p className="text-xs text-[#767586]">This product will be removed from your public storefront &amp; checkout.</p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-xs space-y-1 text-red-900">
              <div>Product Name: <strong>{productToDelete.name}</strong></div>
              <div>SKU / Ref: <strong>{productToDelete.ref}</strong></div>
              <div>Retail Price: <strong>Rs {productToDelete.price.toLocaleString()}</strong></div>
              <div>Wholesale Buy Cost: <strong>Rs {(productToDelete.vendorCost || 0).toLocaleString()}</strong></div>
            </div>

            <p className="text-xs text-[#464554] leading-relaxed">
              Customers will no longer be able to select or purchase this software tool on the storefront or checkout views.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#dce9ff] text-gray-700 font-bold hover:bg-[#f8f9ff]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProductInternal(productToDelete.id)}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Yes, Delete Product</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header & Admin Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-[#4648d4] text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#0b1c30]">
                    Admin Control Center
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                    Live Operations
                  </span>
                </div>
                <p className="text-xs text-[#767586] mt-0.5">
                  Track orders, profit margins, client payment proofs, inventory, and WhatsApp renewals.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowLogSaleModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4648d4] hover:bg-[#6063ee] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              title="Manual order entry for WhatsApp or direct clients"
            >
              <span className="material-symbols-outlined text-[17px]">add_circle</span>
              <span>+ Log Sale</span>
            </button>

            <button
              onClick={handleAddNewProductModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">add_box</span>
              <span>+ Add Product</span>
            </button>

            {onOpenLiveVoice && (
              <button
                onClick={onOpenLiveVoice}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-linear-to-r from-[#4648d4] via-[#6366f1] to-[#ea580c] hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                title="Open Admin Real-Time Voice Copilot (Gemini Live API)"
              >
                <span className="material-symbols-outlined text-[17px] animate-pulse">graphic_eq</span>
                <span>🎙️ Voice Copilot</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onOpenAIAgent) {
                  onOpenAIAgent();
                } else {
                  setShowAIAgentModal(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-linear-to-r from-[#0b1c30] via-[#4648d4] to-[#ea580c] hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              title="Open AI Operations Copilot"
            >
              <span className="material-symbols-outlined text-[17px]">smart_toy</span>
              <span>🤖 AI Copilot</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#eff4ff] text-[#464554] border border-[#dce9ff] text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              title="Download all orders as CSV"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Clean Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Gross Sales */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e5eeff] shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#767586] text-xs font-bold uppercase tracking-wider">
              <span>Total Revenue</span>
              <span className="material-symbols-outlined text-[18px] text-[#006c49]">trending_up</span>
            </div>
            <div className="font-headline font-extrabold text-2xl text-[#0b1c30]">
              Rs {totalRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-[#006c49] flex items-center gap-1">
              <span>{orders.length} verified orders</span>
            </div>
          </div>

          {/* Card 2: Net Profit */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <span>Net Profit</span>
              <span className="material-symbols-outlined text-[18px] text-emerald-600">payments</span>
            </div>
            <div className="font-headline font-extrabold text-2xl text-emerald-700">
              Rs {netProfit.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-emerald-700">
              Avg Margin: {netMargin}%
            </div>
          </div>

          {/* Card 3: Wholesale COGS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e5eeff] shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#767586] text-xs font-bold uppercase tracking-wider">
              <span>Wholesale Cost</span>
              <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">receipt_long</span>
            </div>
            <div className="font-headline font-extrabold text-2xl text-[#0b1c30]">
              Rs {totalCOGS.toLocaleString()}
            </div>
            <div className="text-[11px] font-medium text-[#767586]">
              Supplier buy costs
            </div>
          </div>

          {/* Card 4: Subscriptions Expiry */}
          <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs space-y-1.5 ${
            expiredOrdersCount > 0 ? 'bg-amber-50/70 border-amber-300/80' : 'bg-white border-[#e5eeff]'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span className={expiredOrdersCount > 0 ? 'text-amber-900' : 'text-[#767586]'}>
                Expiry Alerts
              </span>
              <span className={`material-symbols-outlined text-[18px] ${
                expiredOrdersCount > 0 ? 'text-amber-700 animate-pulse' : 'text-gray-400'
              }`}>
                notification_important
              </span>
            </div>
            <div className="font-headline font-extrabold text-2xl text-[#0b1c30] flex items-center gap-2">
              <span className={expiredOrdersCount > 0 ? 'text-amber-800' : 'text-[#0b1c30]'}>
                {expiredOrdersCount} Expired
              </span>
              {expiringSoonCount > 0 && (
                <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  {expiringSoonCount} Soon
                </span>
              )}
            </div>
            <div className="text-[11px] font-semibold text-amber-900">
              {expiredOrdersCount > 0 ? '1-Click WhatsApp renewal ready' : 'All subscriptions active'}
            </div>
          </div>
        </div>

        {/* Global Search Bar Banner */}
        <div className="bg-white rounded-2xl border border-[#dce9ff] p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#eff4ff] text-[#4648d4] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">search</span>
              </span>
              <div>
                <h2 className="font-headline font-bold text-sm text-[#0b1c30] flex items-center gap-2">
                  <span>Global Operations &amp; Orders Search</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#4648d4] text-[11px] font-mono font-bold">
                    {searchQuery.trim()
                      ? `${filteredOrders.length} of ${orders.length} matched`
                      : `${orders.length} active records`}
                  </span>
                </h2>
                <p className="text-[11px] text-[#767586]">
                  Instant multi-attribute search across customer names, order IDs (e.g. TX-1049281), product names, phone numbers, and license keys.
                </p>
              </div>
            </div>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#4648d4] hover:text-[#6063ee] bg-[#eff4ff] hover:bg-[#e0e9ff] px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
                <span>Clear Search</span>
              </button>
            )}
          </div>

          {/* Search Input Field */}
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-[#4648d4] pointer-events-none">
              manage_search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders by customer name, order ID / ref # (e.g. TX-1049281), or product name (e.g. ChatGPT, Canva)..."
              className="w-full pl-11 pr-24 py-3 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-xs sm:text-sm text-[#0b1c30] placeholder-[#767586] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4648d4] transition-all shadow-inner"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 px-2.5 py-1 bg-[#dce9ff] hover:bg-[#cbdcff] text-[#0b1c30] rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Clear input"
              >
                <span className="material-symbols-outlined text-[14px]">cancel</span>
                <span>Clear</span>
              </button>
            ) : (
              <span className="absolute right-3.5 text-[11px] font-mono text-[#767586] bg-white px-2 py-0.5 rounded border border-[#e5eeff] hidden sm:inline-block">
                Type to filter
              </span>
            )}
          </div>

          {/* Quick Search Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-[#767586] mr-1">Quick Search:</span>
            
            {orders.slice(0, 2).map((ord) => (
              <button
                key={ord.id}
                type="button"
                onClick={() => {
                  setSearchQuery(ord.customerName);
                  if (adminSectionTab !== 'orders' && adminSectionTab !== 'all') setAdminSectionTab('orders');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#464554] border border-[#e5eeff] hover:border-[#4648d4] transition-all cursor-pointer"
              >
                <span>👤</span>
                <span>{ord.customerName}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                setSearchQuery('ChatGPT');
                if (adminSectionTab !== 'orders' && adminSectionTab !== 'all') setAdminSectionTab('orders');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#464554] border border-[#e5eeff] hover:border-[#4648d4] transition-all cursor-pointer"
            >
              <span>⚡</span>
              <span>ChatGPT</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('Canva');
                if (adminSectionTab !== 'orders' && adminSectionTab !== 'all') setAdminSectionTab('orders');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#464554] border border-[#e5eeff] hover:border-[#4648d4] transition-all cursor-pointer"
            >
              <span>🎨</span>
              <span>Canva</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('CapCut');
                if (adminSectionTab !== 'orders' && adminSectionTab !== 'all') setAdminSectionTab('orders');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#464554] border border-[#e5eeff] hover:border-[#4648d4] transition-all cursor-pointer"
            >
              <span>🎬</span>
              <span>CapCut</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('JazzCash');
                if (adminSectionTab !== 'orders' && adminSectionTab !== 'all') setAdminSectionTab('orders');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#464554] border border-[#e5eeff] hover:border-[#4648d4] transition-all cursor-pointer"
            >
              <span>💳</span>
              <span>JazzCash</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('Meezan');
                if (adminSectionTab !== 'orders' && adminSectionTab !== 'all') setAdminSectionTab('orders');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#464554] border border-[#e5eeff] hover:border-[#4648d4] transition-all cursor-pointer"
            >
              <span>🏦</span>
              <span>Meezan</span>
            </button>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#eff4ff] text-[#4648d4] hover:bg-[#dce9ff] transition-all cursor-pointer ml-auto"
              >
                <span>✕ Show All ({orders.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Admin Navigation Hub Switcher Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none bg-white p-2 rounded-2xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setAdminSectionTab('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                adminSectionTab === 'all'
                  ? 'bg-[#4648d4] text-white shadow-sm'
                  : 'text-[#464554] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">dashboard</span>
              <span>All Hubs</span>
            </button>

            <button
              onClick={() => setAdminSectionTab('orders')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                adminSectionTab === 'orders'
                  ? 'bg-[#4648d4] text-white shadow-sm'
                  : 'text-[#464554] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">receipt_long</span>
              <span>Live Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setAdminSectionTab('receipts')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                adminSectionTab === 'receipts'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-[#464554] hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">image</span>
              <span>Payment Slips</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                adminSectionTab === 'receipts' ? 'bg-white text-purple-700' : 'bg-purple-100 text-purple-800'
              }`}>
                {orders.filter((o) => o.receiptImage || o.receiptName).length}
              </span>
            </button>

            <button
              onClick={() => setAdminSectionTab('products')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                adminSectionTab === 'products'
                  ? 'bg-[#4648d4] text-white shadow-sm'
                  : 'text-[#464554] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">inventory_2</span>
              <span>Products &amp; Pricing ({products.length})</span>
            </button>

            <button
              onClick={() => setAdminSectionTab('crm')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                adminSectionTab === 'crm'
                  ? 'bg-[#4648d4] text-white shadow-sm'
                  : 'text-[#464554] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">person_pin</span>
              <span>Customer CRM</span>
            </button>

            <button
              onClick={() => setAdminSectionTab('vendors')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                adminSectionTab === 'vendors'
                  ? 'bg-[#4648d4] text-white shadow-sm'
                  : 'text-[#464554] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">hub</span>
              <span>Wholesalers ({vendorList.length})</span>
            </button>
          </div>
        </div>

        {/* Middle Section: Orders Ledger & Customer Dossier Split */}
        {(adminSectionTab === 'all' || adminSectionTab === 'orders' || adminSectionTab === 'crm') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Orders Table */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#e5eeff] p-6 shadow-sm space-y-5">
            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#eff4ff]">
              <div>
                <h3 className="font-headline font-bold text-lg text-[#0b1c30] flex items-center gap-2">
                  <span>Live Verified Orders Ledger</span>
                  <span className="text-xs font-mono font-bold bg-[#eff4ff] text-[#4648d4] px-2 py-0.5 rounded-full">
                    {filteredOrders.length} records
                  </span>
                </h3>
                <p className="text-xs text-[#767586]">
                  Click on any row action to Edit, Delete, change verification status, or message on WhatsApp.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customer, ID, product..."
                  className="w-full sm:w-64 pl-9 pr-8 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-xs text-[#0b1c30] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4648d4] transition-all"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[16px] text-[#4648d4] pointer-events-none">
                  search
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-[#767586] hover:text-[#0b1c30] p-0.5 rounded cursor-pointer"
                    title="Clear filter"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Chips & Expiry Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-[#4648d4] text-white shadow-sm'
                    : 'bg-[#f8f9ff] text-[#464554] hover:bg-[#eff4ff]'
                }`}
              >
                All Orders ({orders.length})
              </button>

              <button
                onClick={() => setActiveFilter('expired')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  activeFilter === 'expired'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">warning</span>
                <span>Expired ({expiredOrdersCount})</span>
              </button>

              <button
                onClick={() => setActiveFilter('expiring-soon')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  activeFilter === 'expiring-soon'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                <span>Expiring Soon ({expiringSoonCount})</span>
              </button>

              <button
                onClick={() => setActiveFilter('high-margin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'high-margin'
                    ? 'bg-[#006c49] text-white shadow-sm'
                    : 'bg-[#f8f9ff] text-[#464554] hover:bg-[#eff4ff]'
                }`}
              >
                High Margin (≥70%)
              </button>

              <button
                onClick={() => setActiveFilter('canva')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'canva'
                    ? 'bg-[#4648d4] text-white shadow-sm'
                    : 'bg-[#f8f9ff] text-[#464554] hover:bg-[#eff4ff]'
                }`}
              >
                Canva Pro
              </button>

              <button
                onClick={() => setActiveFilter('ai')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'ai'
                    ? 'bg-[#4648d4] text-white shadow-sm'
                    : 'bg-[#f8f9ff] text-[#464554] hover:bg-[#eff4ff]'
                }`}
              >
                AI Platforms
              </button>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#eff4ff] text-[#767586] font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">CUSTOMER PROFILE</th>
                    <th className="py-3 px-3">PRODUCT / PLAN</th>
                    <th className="py-3 px-3">FINANCIALS (PKR)</th>
                    <th className="py-3 px-3">EXPIRY &amp; LIFECYCLE</th>
                    <th className="py-3 px-3">STATUS &amp; RAIL</th>
                    <th className="py-3 px-2 text-right">MANAGE / ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f8f9ff]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="max-w-xs mx-auto space-y-3">
                          <span className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#4648d4] flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-[24px]">search_off</span>
                          </span>
                          <div className="space-y-1">
                            <div className="font-headline font-bold text-sm text-[#0b1c30]">
                              No orders found {searchQuery ? `matching "${searchQuery}"` : 'for this filter'}
                            </div>
                            <p className="text-xs text-[#767586]">
                              Try searching by customer name (e.g. Ayesha), order reference ID (e.g. TX-1049281), or product name (e.g. ChatGPT).
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('');
                              setActiveFilter('all');
                            }}
                            className="px-4 py-2 bg-[#4648d4] hover:bg-[#6063ee] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                          >
                            Clear Search &amp; Show All Orders
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const profit = order.sellingPrice - order.vendorCost;
                      const marginPercent =
                        order.sellingPrice > 0
                          ? Math.round((profit / order.sellingPrice) * 100)
                          : 0;
                      const isSelected = selectedCustomerName === order.customerName;

                      const isExpired =
                        order.expiryStatus === 'Expired' ||
                        (order.expiryDate ? new Date(order.expiryDate) < new Date() : false);

                      const isExpiringSoon =
                        order.expiryStatus === 'Expiring Soon' ||
                        (order.expiryDate
                          ? (() => {
                              const diffDays =
                                (new Date(order.expiryDate).getTime() - new Date().getTime()) /
                                (1000 * 3600 * 24);
                              return diffDays >= 0 && diffDays <= 7;
                            })()
                          : false);

                      return (
                        <tr
                          key={order.id}
                          className={`hover:bg-[#f8f9ff] transition-colors ${
                            isSelected ? 'bg-[#eff4ff]/60' : ''
                          }`}
                        >
                          {/* Customer Profile */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={() => setSelectedCustomerName(order.customerName)}
                                className="w-8 h-8 rounded-full bg-[#e4e0f5] text-[#4648d4] font-bold flex items-center justify-center shrink-0 text-xs hover:ring-2 hover:ring-[#4648d4]"
                                title="Click to view Customer Dossier"
                              >
                                {order.customerName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </button>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    onClick={() => setSelectedCustomerName(order.customerName)}
                                    className="font-bold text-[#0b1c30] hover:text-[#4648d4] cursor-pointer"
                                  >
                                    {order.customerName}
                                  </span>
                                  {order.customerTag && (
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                        order.customerTag === 'VIP'
                                          ? 'bg-amber-100 text-amber-800'
                                          : order.customerTag === 'Repeat'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-blue-100 text-blue-800'
                                      }`}
                                    >
                                      {order.customerTag}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[#767586] font-mono">
                                  {order.customerPhone} • {order.customerCity}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Product / Plan */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              {PRODUCTS.find((p) => p.name === order.productName || p.id === order.productId)?.imageUrl ? (
                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#dce9ff] shadow-xs shrink-0 bg-[#0b1c30]">
                                  <img
                                    src={PRODUCTS.find((p) => p.name === order.productName || p.id === order.productId)?.imageUrl}
                                    alt={order.productName}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : null}
                              <div>
                                <span className="font-bold text-[#0b1c30] block">
                                  {order.productName}
                                </span>
                                <span className="text-[11px] text-[#767586]">
                                  {order.planDetails} • {order.timestamp}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Financials */}
                          <td className="py-3.5 px-3">
                            <div className="font-mono font-bold text-[#0b1c30]">
                              Rs {order.sellingPrice.toLocaleString()}
                            </div>
                            <div className="text-[11px] font-mono text-[#006c49] flex items-center gap-1">
                              <span>+Rs {profit.toLocaleString()}</span>
                              <span className="text-[10px] text-[#767586]">({marginPercent}%)</span>
                            </div>
                          </td>

                          {/* Expiry & Lifecycle */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                {isExpired ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                    Expired ({order.expiryDate || 'N/A'})
                                  </span>
                                ) : isExpiringSoon ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    Expiring ({order.expiryDate})
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Active ({order.expiryDate || '1-Yr'})
                                  </span>
                                )}
                              </div>

                              {/* WhatsApp Renewal Trigger if Expired or Expiring */}
                              {(isExpired || isExpiringSoon) && (
                                <div className="flex items-center gap-1 pt-0.5">
                                  <button
                                    onClick={() => handleSendWhatsAppRenewal(order)}
                                    title="Open WhatsApp chat with automated renewal reminder"
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all"
                                  >
                                    <span className="material-symbols-outlined text-[13px]">chat</span>
                                    <span>WhatsApp Reminder</span>
                                  </button>
                                  <button
                                    onClick={() => handleQuickRenew(order, 30)}
                                    title="Renew for +30 Days"
                                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold transition-all"
                                  >
                                    +30d
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Status & Rail */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-1.5">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleQuickToggleStatus(order, e.target.value as Order['status'])
                                }
                                className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                  order.status === 'Verified'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : order.status === 'Dispatched'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                <option value="Verified">✓ Verified</option>
                                <option value="Dispatched">⚡ Dispatched</option>
                                <option value="Awaiting Slip">⏳ Review</option>
                              </select>

                              {/* Customer Payment Screenshot Badge / Trigger */}
                              {order.receiptImage ? (
                                <button
                                  onClick={() =>
                                    setViewingReceipt({
                                      img: order.receiptImage,
                                      name: order.receiptName,
                                      ref: order.refNumber,
                                      customer: order.customerName,
                                      amount: order.sellingPrice,
                                      rail: order.paymentRail,
                                    })
                                  }
                                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#eff4ff] hover:bg-[#dce9ff] text-[#4648d4] text-[10px] font-bold border border-[#dce9ff] transition-colors"
                                  title="Click to inspect customer payment screenshot"
                                >
                                  <span className="material-symbols-outlined text-[13px]">image</span>
                                  <span>View Slip Proof</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-[#767586] font-mono block">
                                  {order.paymentRail} • {order.refNumber}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Manage / Actions */}
                          <td className="py-3.5 px-2 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Inspect in CRM */}
                              <button
                                onClick={() => setSelectedCustomerName(order.customerName)}
                                title="View Customer in CRM"
                                className={`p-1.5 rounded-xl transition-colors ${
                                  isSelected
                                    ? 'bg-[#4648d4] text-white'
                                    : 'bg-[#eff4ff] text-[#4648d4] hover:bg-[#e4e0f5]'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                              </button>

                              {/* Edit Live Order */}
                              <button
                                onClick={() => setEditingOrder(order)}
                                title="Edit Live Order Details"
                                className="p-1.5 rounded-xl bg-[#fff7ed] hover:bg-[#ffedd5] text-[#ea580c] border border-[#fed7aa] transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>

                              {/* Delete Order */}
                              <button
                                onClick={() => setOrderToDelete(order)}
                                title="Delete Live Order"
                                className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination / Total Summary */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-[#eff4ff] text-xs text-[#767586] gap-2">
              <span>
                Showing {filteredOrders.length} of {orders.length} orders • P&amp;L Live Synced
              </span>
              <div className="flex items-center gap-2">
                {onResetOrders && (
                  <button
                    onClick={onResetOrders}
                    className="text-[11px] text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer"
                  >
                    Clear All Sales (Zero Out)
                  </button>
                )}
                <button
                  onClick={onNavigateToCheckout}
                  className="px-3 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#4648d4] rounded-xl font-bold"
                >
                  + Open Store Checkout
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Customer Dossier CRM Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#4648d4] text-[18px]">badge</span>
                  <span className="text-xs font-bold text-[#767586] uppercase tracking-wider">
                    CUSTOMER DOSSIER CRM
                  </span>
                </div>
                {customerDossier && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingDossier(customerDossier)}
                      className="p-1.5 bg-[#eff4ff] hover:bg-[#e4e0f5] text-[#4648d4] rounded-lg text-xs font-bold flex items-center gap-1"
                      title="Edit this customer profile"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      <span>Edit</span>
                    </button>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      {customerDossier.reliability}
                    </span>
                  </div>
                )}
              </div>

              {customerDossier ? (
                <>
                  {/* Profile Header */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white font-headline font-bold text-xl flex items-center justify-center shadow-md shrink-0">
                      {customerDossier.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-headline font-bold text-lg text-[#0b1c30] truncate">
                        {customerDossier.name}
                      </h4>
                      <p className="text-xs text-[#767586] truncate">{customerDossier.role}</p>
                      <p className="text-xs text-[#464554] font-medium truncate">{customerDossier.city}</p>
                    </div>
                  </div>

                  {/* Quick Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff] text-center">
                    <div>
                      <div className="text-[10px] text-[#767586]">Lifetime LTV</div>
                      <div className="font-headline font-bold text-sm text-[#0b1c30]">
                        Rs {customerDossier.ltv.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#767586]">Orders</div>
                      <div className="font-headline font-bold text-sm text-[#006c49]">
                        {customerDossier.completedOrders} Done
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#767586]">Disputes</div>
                      <div className="font-headline font-bold text-sm text-[#4648d4]">
                        {customerDossier.disputes} Cases
                      </div>
                    </div>
                  </div>

                  {/* Order History & Vendor Allocation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0b1c30]">
                        Order History &amp; Key Allocation
                      </span>
                      <button
                        onClick={() => setEditingDossier(customerDossier)}
                        className="text-[10px] text-[#4648d4] hover:underline font-bold cursor-pointer"
                      >
                        + Add / Edit History
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {customerDossier.orderHistory.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-500 bg-[#f8f9ff] rounded-xl border border-dashed border-[#eff4ff]">
                          No orders logged yet for this customer.
                        </div>
                      ) : (
                        customerDossier.orderHistory.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-[#f8f9ff] border border-[#eff4ff] text-xs flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-[#0b1c30]">{item.product}</div>
                              <div className="text-[10px] text-[#767586]">{item.vendor}</div>
                            </div>
                            <div className="text-right font-mono">
                              <div className="font-bold text-[#006c49]">+Rs {item.profit}</div>
                              <div className="text-[10px] text-[#767586]">{item.date}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* WhatsApp Direct Chat */}
                  <a
                    href={`https://wa.me/${customerDossier.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-[#006c49] hover:bg-[#00885d] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>Message on WhatsApp ({customerDossier.phone})</span>
                  </a>
                </>
              ) : (
                <div className="text-center py-8 px-4 bg-[#f8f9ff] rounded-2xl border border-dashed border-[#dce9ff] space-y-3">
                  <span className="material-symbols-outlined text-gray-400 text-[36px]">
                    person_search
                  </span>
                  <div>
                    <h5 className="font-bold text-sm text-[#0b1c30]">No Client Selected</h5>
                    <p className="text-xs text-[#767586] mt-1">
                      Wipe complete: live sales ledger is reset to zero. Log a new order or click on a customer to view their CRM dossier.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLogSaleModal(true)}
                    className="px-4 py-2 bg-[#4648d4] hover:bg-[#6063ee] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    + Log First Customer Sale
                  </button>
                </div>
              )}

              {/* Margin Distribution */}
              <div className="pt-4 border-t border-[#eff4ff] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0b1c30]">MARGIN PROFITABILITY</span>
                  <span className="text-[10px] text-[#767586]">Product Categories</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#464554]">Canva / Figma Creative</span>
                      <span className="font-bold text-[#006c49]">74% Margin</span>
                    </div>
                    <div className="w-full h-2 bg-[#eff4ff] rounded-full overflow-hidden">
                      <div className="w-[74%] h-full bg-[#006c49] rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#464554]">Video Editing (CapCut VIP)</span>
                      <span className="font-bold text-[#4648d4]">69% Margin</span>
                    </div>
                    <div className="w-full h-2 bg-[#eff4ff] rounded-full overflow-hidden">
                      <div className="w-[69%] h-full bg-[#4648d4] rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#464554]">AI Platforms (ChatGPT, Claude)</span>
                      <span className="font-bold text-[#6063ee]">58% Margin</span>
                    </div>
                    <div className="w-full h-2 bg-[#eff4ff] rounded-full overflow-hidden">
                      <div className="w-[58%] h-full bg-[#6063ee] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Client Payment Screenshots & Verification Desk */}
        {(adminSectionTab === 'all' || adminSectionTab === 'receipts') && (
          <div className="bg-white rounded-3xl border border-[#dce9ff] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#eff4ff]">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-2xl bg-linear-to-br from-purple-600 to-[#4648d4] text-white flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  </span>
                  <div>
                    <h3 className="font-headline font-bold text-xl text-[#0b1c30] flex items-center gap-2">
                      <span>Client Payment Screenshots &amp; Verification Desk</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                        {orders.filter((o) => o.receiptImage || o.receiptName).length} Slips Uploaded
                      </span>
                    </h3>
                    <p className="text-xs text-[#767586] mt-0.5">
                      Directly inspect bank transfer receipts uploaded by clients at checkout. Confirm payment and dispatch licenses.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Filter Chips for Slips */}
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setReceiptFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    receiptFilter === 'all'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-[#f8f9ff] text-[#464554] hover:bg-[#eff4ff]'
                  }`}
                >
                  All Slips ({orders.filter((o) => o.receiptImage || o.receiptName).length})
                </button>
                <button
                  onClick={() => setReceiptFilter('verified')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    receiptFilter === 'verified'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#f8f9ff] text-[#464554] hover:bg-emerald-50'
                  }`}
                >
                  Verified ({orders.filter((o) => o.status === 'Verified' && (o.receiptImage || o.receiptName)).length})
                </button>
                <button
                  onClick={() => setReceiptFilter('awaiting')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    receiptFilter === 'awaiting'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-[#f8f9ff] text-[#464554] hover:bg-amber-50'
                  }`}
                >
                  Awaiting Review ({orders.filter((o) => o.status === 'Awaiting Slip').length})
                </button>
                <button
                  onClick={() => setReceiptFilter('dispatched')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    receiptFilter === 'dispatched'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-[#f8f9ff] text-[#464554] hover:bg-blue-50'
                  }`}
                >
                  Dispatched ({orders.filter((o) => o.status === 'Dispatched').length})
                </button>
              </div>
            </div>

            {/* Slips Grid */}
            {(() => {
              const slips = orders.filter((o) => {
                if (receiptFilter === 'verified') return o.status === 'Verified';
                if (receiptFilter === 'awaiting') return o.status === 'Awaiting Slip';
                if (receiptFilter === 'dispatched') return o.status === 'Dispatched';
                return o.receiptImage || o.receiptName;
              });

              if (slips.length === 0) {
                return (
                  <div className="py-12 text-center bg-[#f8f9ff] rounded-3xl border border-dashed border-[#dce9ff] space-y-3">
                    <span className="material-symbols-outlined text-[42px] text-gray-400">
                      image_search
                    </span>
                    <p className="text-sm font-semibold text-[#0b1c30]">
                      No payment screenshots found matching this filter.
                    </p>
                    <p className="text-xs text-[#767586]">
                      When customers purchase items and upload their payment slip at checkout, they appear right here in real time.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {slips.map((order) => {
                    return (
                      <div
                        key={order.id}
                        className="bg-[#f8f9ff] rounded-3xl border border-[#dce9ff] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
                      >
                        {/* Top: Customer & Status */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-[#4648d4] bg-[#eff4ff] px-2.5 py-0.5 rounded-lg border border-[#dce9ff]">
                              #{order.refNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                order.status === 'Verified'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : order.status === 'Dispatched'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              {order.status === 'Verified' ? '✓ Verified Slip' : order.status === 'Dispatched' ? '⚡ Dispatched' : '⏳ Awaiting Review'}
                            </span>
                          </div>

                          {/* Image Box / Screenshot Preview */}
                          <div
                            onClick={() =>
                              setViewingReceipt({
                                img: order.receiptImage,
                                name: order.receiptName,
                                ref: order.refNumber,
                                customer: order.customerName,
                                amount: order.sellingPrice,
                                rail: order.paymentRail,
                              })
                            }
                            className="relative h-44 rounded-2xl overflow-hidden bg-gray-900 border border-[#dce9ff] cursor-pointer group-hover:border-[#4648d4] transition-all flex items-center justify-center"
                          >
                            {order.receiptImage ? (
                              <img
                                src={order.receiptImage}
                                alt={`Receipt #${order.refNumber}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="text-center p-4 text-gray-400">
                                <span className="material-symbols-outlined text-[36px] mb-1">
                                  receipt
                                </span>
                                <p className="text-[11px] font-mono">{order.receiptName || 'Slip Attached'}</p>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="px-3 py-1.5 rounded-xl bg-white/90 text-[#0b1c30] text-xs font-bold flex items-center gap-1 shadow-md">
                                <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                                <span>Inspect Full Slip</span>
                              </span>
                            </div>
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono backdrop-blur-xs">
                              {order.paymentRail}
                            </span>
                          </div>

                          {/* Customer & Product Info */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-[#0b1c30]">
                                {order.customerName}
                              </h4>
                              <span className="font-mono font-bold text-emerald-700 text-sm">
                                Rs {order.sellingPrice.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-[#4648d4] font-semibold">
                              {order.productName}
                            </p>
                            <p className="text-[11px] text-[#767586] font-mono flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">call</span>
                              <span>{order.customerPhone}</span>
                              <span>•</span>
                              <span>{order.customerCity}</span>
                            </p>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="mt-4 pt-3 border-t border-[#e5eeff] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {order.status !== 'Verified' && (
                              <button
                                onClick={() => handleQuickToggleStatus(order, 'Verified')}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                                title="Verify Payment Slip"
                              >
                                <span className="material-symbols-outlined text-[14px]">check</span>
                                <span>Approve</span>
                              </button>
                            )}
                            {order.status !== 'Dispatched' && (
                              <button
                                onClick={() => handleQuickToggleStatus(order, 'Dispatched')}
                                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                                title="Mark License as Dispatched"
                              >
                                <span className="material-symbols-outlined text-[14px]">send</span>
                                <span>Dispatch</span>
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
                              const targetPhone = cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone.replace(/^0/, '');
                              const msg = `Assalam-o-Alaikum ${order.customerName}!\n\nInsight Products support desk se rabta kar rahe hain.\nHumne aapka payment screenshot verify kar liya hai for *${order.productName}* (Order #${order.refNumber}).\n\nAapki subscription credentials / activation guide yeh rahi:\n*License / Key:* ${order.licenseKey || 'Activated'}\n\nShukriya!\nInsight Products Support`;
                              window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-xl flex items-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">chat</span>
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Product Catalog & Pricing Management Matrix */}
        {(adminSectionTab === 'all' || adminSectionTab === 'products') && (
          <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#eff4ff]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                  </span>
                  <h3 className="font-headline font-bold text-xl text-[#0b1c30]">
                    Storefront Product Catalog &amp; Pricing Matrix
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    {products.length} Products Active
                  </span>
                </div>
                <p className="text-xs text-[#767586] mt-1">
                  Full control over your inventory: add new tools, edit names, images, descriptions, durations, wholesale buy costs (COGS), and selling prices.
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-[#f8f9ff] border border-[#dce9ff] p-1 rounded-2xl">
                  <button
                    onClick={() => setProductViewMode('grid')}
                    className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      productViewMode === 'grid'
                        ? 'bg-white text-[#4648d4] shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                    title="Grid Card View"
                  >
                    <span className="material-symbols-outlined text-[16px]">grid_view</span>
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                  <button
                    onClick={() => setProductViewMode('table')}
                    className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      productViewMode === 'table'
                        ? 'bg-white text-[#4648d4] shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                    title="Dense Table View"
                  >
                    <span className="material-symbols-outlined text-[16px]">table_rows</span>
                    <span className="hidden sm:inline">Table</span>
                  </button>
                </div>

                {/* Add Product Button */}
                <button
                  onClick={handleAddNewProductModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">add_box</span>
                  <span>+ Add New Product</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#f8f9ff] p-3 rounded-2xl border border-[#dce9ff]">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search products by name, ref, category..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-[#dce9ff] text-xs focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Categories' },
                  { id: 'ai', label: 'AI Tools' },
                  { id: 'creative', label: 'Creative Suites' },
                  { id: 'streaming', label: 'Streaming' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setProductCategoryFilter(cat.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      productCategoryFilter === cat.id
                        ? 'bg-[#4648d4] text-white shadow-xs'
                        : 'bg-white text-[#464554] border border-[#dce9ff] hover:bg-[#eff4ff]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid View */}
            {productViewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCatalogProducts.length === 0 ? (
                  <div className="col-span-full p-12 text-center bg-[#f8f9ff] rounded-3xl border border-dashed border-[#dce9ff] space-y-3">
                    <span className="material-symbols-outlined text-[#767586] text-[40px]">
                      search_off
                    </span>
                    <h4 className="font-bold text-gray-800">No products match your search</h4>
                    <p className="text-xs text-gray-500">Try adjusting your filters or click below to add a new tool.</p>
                    <button
                      onClick={handleAddNewProductModal}
                      className="px-4 py-2 bg-[#4648d4] text-white text-xs font-bold rounded-xl shadow-sm"
                    >
                      + Add New Product Now
                    </button>
                  </div>
                ) : (
                  filteredCatalogProducts.map((prod) => {
                    const cost = prod.vendorCost || 0;
                    const profit = prod.price - cost;
                    const margin = prod.price > 0 ? Math.round((profit / prod.price) * 100) : 0;
                    const isLive = prod.isActive !== false;

                    return (
                      <div
                        key={prod.id}
                        className={`rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                          isLive
                            ? 'bg-white border-[#dce9ff] hover:border-[#4648d4]/40 hover:shadow-md'
                            : 'bg-gray-50/80 border-gray-200 opacity-75'
                        }`}
                      >
                        {/* Top Banner / Image Area */}
                        <div>
                          <div className="relative h-44 bg-gradient-to-br from-slate-900 via-[#101b33] to-[#1e293b] p-4 flex flex-col justify-between overflow-hidden">
                            {/* Product Real Image or Gradient Background */}
                            {prod.imageUrl ? (
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="absolute inset-0 w-full h-full object-cover opacity-60 hover:opacity-75 transition-opacity"
                                onError={(e) => {
                                  // fallback if broken image URL
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : null}

                            {/* Top Badges */}
                            <div className="relative z-10 flex items-center justify-between gap-2">
                              <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-mono font-bold border border-white/10">
                                {prod.ref}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                                    isLive
                                      ? 'bg-emerald-500/80 text-white border-emerald-400/50'
                                      : 'bg-gray-700/80 text-gray-300 border-gray-600'
                                  }`}
                                >
                                  {isLive ? 'Active Storefront' : 'Draft / Hidden'}
                                </span>
                              </div>
                            </div>

                            {/* Product Brand & Plan Tag */}
                            <div className="relative z-10 flex items-end justify-between">
                              <div>
                                <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#4648d4]/90 text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                                  {prod.categoryLabel || prod.category}
                                </span>
                                <h4 className="font-headline font-bold text-lg text-white drop-shadow-sm leading-snug">
                                  {prod.name}
                                </h4>
                              </div>

                              <span className="px-2.5 py-1 rounded-xl bg-white/20 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                                {prod.durationTag || '30 Days'}
                              </span>
                            </div>
                          </div>

                          {/* Body Content */}
                          <div className="p-5 space-y-4">
                            {/* Short Description */}
                            <p className="text-xs text-[#767586] line-clamp-2 leading-relaxed">
                              {prod.shortDesc || prod.longDesc || 'Premium digital subscription key with warranty.'}
                            </p>

                            {/* Features Preview */}
                            {prod.features && prod.features.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                  KEY PERKS:
                                </span>
                                <div className="space-y-1">
                                  {prod.features.slice(0, 2).map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-700">
                                      <span className="material-symbols-outlined text-emerald-600 text-[14px] shrink-0">
                                        check_circle
                                      </span>
                                      <span className="truncate">{feat}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Financial Matrix Box */}
                            <div className="p-3.5 bg-[#f8f9ff] rounded-2xl border border-[#dce9ff] space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 font-medium">Customer Sells For:</span>
                                <span className="font-headline font-extrabold text-sm text-[#0b1c30]">
                                  Rs {prod.price.toLocaleString()}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 font-medium">Wholesale Cost (COGS):</span>
                                <span className="font-mono font-bold text-xs text-red-600">
                                  Rs {cost.toLocaleString()}
                                </span>
                              </div>

                              <div className="pt-2 border-t border-[#dce9ff] flex items-center justify-between text-xs">
                                <span className="text-emerald-700 font-bold">Net Profit Margin:</span>
                                <div className="text-right">
                                  <span className="font-headline font-extrabold text-xs text-emerald-700 block">
                                    +Rs {profit.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                    {margin}% Margin
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="p-4 pt-0 border-t border-[#f0f4ff] mt-2 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleToggleProductStatus(prod)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                              isLive
                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                            title={isLive ? 'Hide from storefront' : 'Make active on storefront'}
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              {isLive ? 'visibility_off' : 'visibility'}
                            </span>
                            <span>{isLive ? 'Hide' : 'Activate'}</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDuplicateProductInternal(prod)}
                              className="p-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#4648d4] transition-colors"
                              title="Duplicate as new product draft"
                            >
                              <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            </button>

                            <button
                              onClick={() => setEditingProduct(prod)}
                              className="px-3.5 py-2 rounded-xl bg-[#4648d4] hover:bg-[#6063ee] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <span className="material-symbols-outlined text-[15px]">edit</span>
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => setProductToDelete(prod)}
                              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                              title="Delete Product from Catalog"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Table View */}
            {productViewMode === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#eff4ff] text-[#767586] font-bold uppercase tracking-wider">
                      <th className="py-3 px-3">PRODUCT &amp; SKU</th>
                      <th className="py-3 px-3">CATEGORY</th>
                      <th className="py-3 px-3">SELLING PRICE</th>
                      <th className="py-3 px-3">WHOLESALE COST</th>
                      <th className="py-3 px-3">NET PROFIT</th>
                      <th className="py-3 px-3">DURATION</th>
                      <th className="py-3 px-3">STATUS</th>
                      <th className="py-3 px-2 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f8f9ff]">
                    {filteredCatalogProducts.map((prod) => {
                      const cost = prod.vendorCost || 0;
                      const profit = prod.price - cost;
                      const margin = prod.price > 0 ? Math.round((profit / prod.price) * 100) : 0;
                      const isLive = prod.isActive !== false;

                      return (
                        <tr key={prod.id} className="hover:bg-[#f8f9ff] transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              {prod.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-[#dce9ff]"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white flex items-center justify-center font-bold text-xs">
                                  {prod.brandLogo || prod.name.slice(0, 2)}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-[#0b1c30] block">{prod.name}</span>
                                <span className="font-mono text-[10px] text-[#767586]">{prod.ref}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#4648d4] font-bold text-[10px]">
                              {prod.categoryLabel || prod.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-bold font-mono text-[#0b1c30]">
                            Rs {prod.price.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-3 font-mono text-red-600 font-semibold">
                            Rs {cost.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="font-bold text-emerald-700 block font-mono">
                              +Rs {profit.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-500">{margin}% Margin</span>
                          </td>

                          <td className="py-3.5 px-3 text-gray-600 font-medium">
                            {prod.durationTag || '30 Days'}
                          </td>

                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                isLive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-gray-100 text-gray-600 border-gray-300'
                              }`}
                            >
                              {isLive ? 'Active' : 'Draft'}
                            </span>
                          </td>

                          <td className="py-3.5 px-2 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleDuplicateProductInternal(prod)}
                                className="p-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#4648d4]"
                                title="Duplicate"
                              >
                                <span className="material-symbols-outlined text-[15px]">content_copy</span>
                              </button>
                              <button
                                onClick={() => setEditingProduct(prod)}
                                className="px-2.5 py-1 rounded-lg bg-[#4648d4] hover:bg-[#6063ee] text-white font-bold text-xs flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[13px]">edit</span>
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => setProductToDelete(prod)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                                title="Delete"
                              >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Bottom Section: Wholesale Vendor Sourcing Matrix & Reliability */}
        {(adminSectionTab === 'all' || adminSectionTab === 'vendors') && (
        <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eff4ff]">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4648d4] text-[24px]">hub</span>
                <h3 className="font-headline font-bold text-xl text-[#0b1c30]">
                  Wholesale Vendor Sourcing Matrix &amp; Reliability
                </h3>
              </div>
              <p className="text-xs text-[#767586] mt-0.5">
                Regional supplier agreements, wholesale unit costs, and automated fulfillment SLA metrics.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newBlankVendor: Vendor = {
                    id: `new-${Date.now()}`,
                    partnerName: '',
                    region: 'Asia-Pac Hub',
                    code: 'AP',
                    catalogs: 'AI & Creative Keys',
                    supplierSpendPkr: 0,
                    unitBuyPrice: 'Rs 300 / key',
                    luminaRetail: 'Rs 999',
                    fulfillmentSpeed: 'Instant API',
                    defectRate: '0.3%',
                    defectTier: 'Elite',
                    status: 'Operational',
                  };
                  setEditingVendor(newBlankVendor);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#4648d4] text-xs font-bold rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">add_business</span>
                <span>+ Add Supplier Partner</span>
              </button>

              <span className="px-3 py-1.5 bg-[#f8f9ff] border border-[#dce9ff] text-[#0b1c30] rounded-xl text-xs font-bold font-mono">
                {vendorList.length} Verified Hubs
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#eff4ff] text-[#767586] font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">VENDOR PARTNER &amp; REGION</th>
                  <th className="py-3 px-3">PRIMARY CATALOGS</th>
                  <th className="py-3 px-3">SUPPLIER SPEND (PKR)</th>
                  <th className="py-3 px-3">UNIT BUY PRICE</th>
                  <th className="py-3 px-3">RETAIL PRICE</th>
                  <th className="py-3 px-3">FULFILLMENT SPEED</th>
                  <th className="py-3 px-3">DEFECT RATE</th>
                  <th className="py-3 px-3">VENDOR STATUS</th>
                  <th className="py-3 px-2 text-right">MANAGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8f9ff]">
                {vendorList.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-[#f8f9ff] transition-colors">
                    {/* Partner Name & Region */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#eff4ff] text-[#4648d4] font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                          {vendor.code}
                        </span>
                        <div>
                          <span className="font-bold text-[#0b1c30] block">
                            {vendor.partnerName}
                          </span>
                          <span className="text-[11px] text-[#767586]">{vendor.region}</span>
                        </div>
                      </div>
                    </td>

                    {/* Catalogs */}
                    <td className="py-3.5 px-3 font-medium text-[#0b1c30]">
                      {vendor.catalogs}
                    </td>

                    {/* Spend */}
                    <td className="py-3.5 px-3 font-mono font-bold text-[#0b1c30]">
                      Rs {vendor.supplierSpendPkr.toLocaleString()}
                    </td>

                    {/* Unit Buy */}
                    <td className="py-3.5 px-3 font-mono text-[#ba1a1a] font-semibold">
                      {vendor.unitBuyPrice}
                    </td>

                    {/* Retail */}
                    <td className="py-3.5 px-3 font-mono text-[#006c49] font-bold">
                      {vendor.luminaRetail}
                    </td>

                    {/* Speed */}
                    <td className="py-3.5 px-3 text-[#464554]">
                      {vendor.fulfillmentSpeed}
                    </td>

                    {/* Defect Rate */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-[#0b1c30]">
                        {vendor.defectRate}
                      </span>
                      <span
                        className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          vendor.defectTier === 'Pristine' || vendor.defectTier === 'Elite'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {vendor.defectTier}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        {vendor.status}
                      </span>
                    </td>

                    {/* Manage */}
                    <td className="py-3.5 px-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingVendor(vendor)}
                          className="px-2 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#4648d4] font-bold text-xs flex items-center gap-1 transition-colors"
                          title="Edit Wholesaler Partner"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete supplier "${vendor.partnerName}" from the CRM Matrix?`)) {
                              handleDeleteVendor(vendor.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                          title="Delete Wholesaler Partner"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={!!editingProduct}
        product={editingProduct}
        productToEdit={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveProductInternal}
        onSaveProduct={handleSaveProductInternal}
        onDelete={(prodId) => handleDeleteProductInternal(prodId)}
        onDeleteProduct={(prodId) => handleDeleteProductInternal(prodId)}
      />

      {/* Payment Screenshot Proof Inspection Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                </span>
                <div>
                  <h3 className="font-headline font-bold text-base text-[#0b1c30]">
                    Payment Screenshot Proof
                  </h3>
                  <p className="text-[11px] text-[#767586] font-mono">
                    Order #{viewingReceipt.ref} • {viewingReceipt.customer}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="w-8 h-8 rounded-xl bg-[#eff4ff] text-[#464554] flex items-center justify-center hover:bg-[#dce9ff]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-[#f8f9ff] rounded-2xl border border-[#dce9ff] flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-500 block text-[10px]">VERIFIED AMOUNT:</span>
                <strong className="font-mono text-emerald-700 font-bold text-sm">
                  Rs {viewingReceipt.amount.toLocaleString()}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block text-[10px]">PAYMENT RAIL:</span>
                <strong className="text-gray-900 font-semibold">{viewingReceipt.rail}</strong>
              </div>
            </div>

            {viewingReceipt.img ? (
              <div className="rounded-2xl overflow-hidden border border-[#dce9ff] max-h-[60vh] flex items-center justify-center bg-gray-50 p-1">
                <img
                  src={viewingReceipt.img}
                  alt={`Receipt for ${viewingReceipt.ref}`}
                  className="max-h-[55vh] w-auto object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="p-8 text-center bg-[#f8f9ff] rounded-2xl border border-dashed border-[#dce9ff] text-xs text-gray-500">
                <span className="material-symbols-outlined text-gray-400 text-[32px] mb-1">
                  image_not_supported
                </span>
                <p>Filename: {viewingReceipt.name || 'bank_slip.jpg'}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>Customer Uploaded Slip</span>
              </span>
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 bg-[#4648d4] hover:bg-[#6063ee] text-white text-xs font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      <EditOrderModal
        isOpen={!!editingOrder}
        order={editingOrder}
        onClose={() => setEditingOrder(null)}
        onSave={(updated) => {
          onUpdateOrder(updated);
          setEditingOrder(null);
          setExportNotice(`Order #${updated.refNumber} updated in live ledger!`);
          setTimeout(() => setExportNotice(null), 3000);
        }}
        onDelete={(orderId) => {
          onDeleteOrder(orderId);
          setEditingOrder(null);
          setExportNotice(`Order deleted from ledger!`);
          setTimeout(() => setExportNotice(null), 3000);
        }}
      />

      {/* Edit Customer Dossier Modal */}
      <EditCustomerDossierModal
        isOpen={!!editingDossier}
        dossier={editingDossier}
        onClose={() => setEditingDossier(null)}
        onSave={handleSaveDossier}
        onDelete={handleDeleteDossier}
      />

      {/* Edit Vendor Modal */}
      <EditVendorModal
        isOpen={!!editingVendor}
        vendor={editingVendor}
        onClose={() => setEditingVendor(null)}
        onSave={handleSaveVendor}
        onDelete={handleDeleteVendor}
      />

      {/* Log Sale Modal */}
      {showLogSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#213145]/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
              <div>
                <h3 className="font-headline font-bold text-lg text-[#0b1c30]">
                  Log New Customer Sale
                </h3>
                <p className="text-xs text-[#767586]">Record manual WhatsApp or custom enterprise order with auto-expiry.</p>
              </div>
              <button
                onClick={() => setShowLogSaleModal(false)}
                className="w-8 h-8 rounded-xl bg-[#eff4ff] text-[#464554] flex items-center justify-center hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="e.g. Daniyal Tariq"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    required
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+92 300 0000000"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">Product / Plan</label>
                  <select
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30]"
                  >
                    <option>ChatGPT Plus 1-Mo</option>
                    <option>Canva Pro 1-Year</option>
                    <option>CapCut Pro Desktop</option>
                    <option>Adobe CC All Apps</option>
                    <option>Kling AI Video Pro</option>
                    <option>Higgsfield AI Pass</option>
                    <option>Netflix Premium 4K</option>
                    <option>Prime Video Sub</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">License Duration (Days)</label>
                  <select
                    value={newDurationDays}
                    onChange={(e) => setNewDurationDays(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30] font-semibold"
                  >
                    <option value={30}>30 Days (1 Month)</option>
                    <option value={90}>90 Days (3 Months)</option>
                    <option value={180}>180 Days (6 Months)</option>
                    <option value={365}>365 Days (1 Year)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">Selling (PKR)</label>
                  <input
                    type="number"
                    required
                    value={newSellPrice}
                    onChange={(e) => setNewSellPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">COGS (PKR)</label>
                  <input
                    type="number"
                    required
                    value={newVendorCost}
                    onChange={(e) => setNewVendorCost(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#006c49] mb-1">Net Margin</label>
                  <div className="px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#006c49] font-mono font-bold">
                    +Rs {newSellPrice - newVendorCost}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">Vendor Partner</label>
                  <select
                    value={newVendor}
                    onChange={(e) => setNewVendor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30]"
                  >
                    {vendorList.map((v) => (
                      <option key={v.id} value={v.partnerName}>
                        {v.partnerName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">Payment Rail</label>
                  <select
                    value={newPaymentRail}
                    onChange={(e) => setNewPaymentRail(e.target.value as Order['paymentRail'])}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30]"
                  >
                    <option>Meezan Bank</option>
                    <option>Nayapay Wallet</option>
                    <option>JazzCash Retail</option>
                    <option>Easypaisa</option>
                    <option>Bank Alfalah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1">License Key / Login Serial</label>
                <input
                  type="text"
                  placeholder="e.g. GPT-PLUS-9901-PRO"
                  value={newLicenseKey}
                  onChange={(e) => setNewLicenseKey(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30] font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogSaleModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#dce9ff] text-[#464554] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#4648d4] text-white font-bold shadow-md hover:bg-[#6063ee]"
                >
                  Save to Active Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Payment Rails Settings Modal */}
      <AdminPaymentSettingsModal
        isOpen={showPaymentSettingsModal}
        onClose={() => setShowPaymentSettingsModal(false)}
        currentSettings={paymentSettings}
        onSaveSettings={onUpdatePaymentSettings}
      />

      {/* AI Operations Copilot Modal (Fallback) */}
      <AIOperationsAgentModal
        isOpen={showAIAgentModal}
        onClose={() => setShowAIAgentModal(false)}
        isAdmin={true}
        products={products}
        orders={orders}
        vendors={vendorList}
        paymentSettings={paymentSettings}
        learnedRules={[]}
        onUpdateLearnedRules={() => {}}
        onUpdateProducts={(updatedProds) => {
          if (onUpdateProducts) onUpdateProducts(updatedProds);
          setExportNotice('Products catalog updated via AI Agent!');
          setTimeout(() => setExportNotice(null), 3000);
        }}
        onUpdateOrder={(updatedOrder) => {
          onUpdateOrder(updatedOrder);
          setExportNotice(`Order #${updatedOrder.refNumber} updated by AI Agent!`);
          setTimeout(() => setExportNotice(null), 3000);
        }}
        onUpdatePaymentSettings={(newSet) => {
          onUpdatePaymentSettings(newSet);
          setExportNotice('Bank & Wallet credentials updated by AI Agent!');
          setTimeout(() => setExportNotice(null), 3000);
        }}
        onNavigateTab={(tab) => setAdminSectionTab(tab)}
      />
    </div>
  );
};
