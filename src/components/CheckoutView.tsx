import React, { useState } from 'react';
import { Product, Order, PaymentSettings } from '../types';
import { PRODUCTS, DEFAULT_PAYMENT_SETTINGS } from '../data/mockData';

interface CheckoutViewProps {
  products?: Product[];
  selectedProduct: Product;
  onSelectProduct: (product: Product) => void;
  onOrderPlaced: (newOrder: Order) => void;
  onNavigateToLedger: () => void;
  onNavigateToHome: () => void;
  isAdmin?: boolean;
  paymentSettings?: PaymentSettings;
  onOpenPaymentSettings?: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  products = PRODUCTS,
  selectedProduct,
  onSelectProduct,
  onOrderPlaced,
  onNavigateToLedger,
  onNavigateToHome,
  isAdmin = false,
  paymentSettings,
  onOpenPaymentSettings,
}) => {
  const settings = paymentSettings || DEFAULT_PAYMENT_SETTINGS;
  const activeProducts = products || PRODUCTS;

  // Form states - starting fresh without fake attachments
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('Lahore');
  const [selectedRail, setSelectedRail] = useState<Order['paymentRail']>('JazzCash Retail');

  // Screenshot Upload States (Mandatory)
  const [receiptAttached, setReceiptAttached] = useState(false);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptFileSize, setReceiptFileSize] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Interactive submission & Confirmation (Thank You) states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<Order | null>(null);
  const [viewingReceiptModal, setViewingReceiptModal] = useState<string | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  // Process image file for upload
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a valid image file (PNG, JPG, JPEG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size is too large. Please upload an image under 10MB.');
      return;
    }

    setUploadError(null);
    setReceiptFileName(file.name);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    setReceiptFileSize(`${sizeMb} MB`);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReceiptImage(reader.result);
        setReceiptAttached(true);
        showToast(`Screenshot attached: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptAttached(false);
    setReceiptFileName('');
    setReceiptFileSize('');
    setReceiptImage(null);
    setUploadError(null);
    showToast('Payment screenshot removed.');
  };

  const handleSubmitOrder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // STRICT VALIDATION: User cannot proceed without screenshot
    if (!receiptAttached || !receiptImage) {
      setUploadError('⚠️ Payment Screenshot Required! Please upload your payment transfer receipt to confirm your order.');
      const uploadElement = document.getElementById('payment-upload-section');
      if (uploadElement) {
        uploadElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showToast('Please upload your payment screenshot first!');
      return;
    }

    if (!fullName.trim()) {
      showToast('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      showToast('Please enter your delivery email address.');
      return;
    }

    if (!whatsapp.trim()) {
      showToast('Please enter your WhatsApp contact number.');
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    setTimeout(() => {
      const generatedRef = `TX-${Math.floor(10000000 + Math.random() * 90000000)}`;

      // Calculate auto-expiry date based on product duration
      const expiry = new Date();
      if (selectedProduct.name.toLowerCase().includes('1-year') || selectedProduct.name.toLowerCase().includes('1-yr') || selectedProduct.name.toLowerCase().includes('lifetime')) {
        expiry.setFullYear(expiry.getFullYear() + 1);
      } else if (selectedProduct.name.toLowerCase().includes('3-mo') || selectedProduct.name.toLowerCase().includes('quarterly')) {
        expiry.setDate(expiry.getDate() + 90);
      } else {
        expiry.setDate(expiry.getDate() + 30);
      }
      const expiryDateStr = expiry.toISOString().split('T')[0];

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        refNumber: generatedRef,
        customerName: fullName.trim(),
        customerPhone: whatsapp.trim(),
        customerEmail: email.trim(),
        customerCity: city || 'Lahore',
        customerRole: 'Client',
        customerTag: 'New',
        productName: selectedProduct.name,
        productId: selectedProduct.id,
        planDetails: selectedProduct.desc || selectedProduct.shortDesc || selectedProduct.durationTag || 'Subscription Pass',
        timestamp: 'Just now',
        expiryDate: expiryDateStr,
        expiryStatus: 'Active',
        licenseKey: `INS-${selectedProduct.id.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-PAK`,
        sellingPrice: selectedProduct.price || 0,
        vendorOrigin: selectedProduct.vendorName || 'DirectWholesale_PK',
        vendorCost: selectedProduct.unitCost ?? selectedProduct.vendorCost ?? 0,
        paymentRail: selectedRail,
        transactionId: generatedRef,
        status: 'Verified',
        receiptName: receiptFileName || 'bank_transfer_slip.jpg',
        receiptImage: receiptImage || undefined,
        receiptSize: receiptFileSize || '1.2 MB',
      };

      setIsSubmitting(false);
      setOrderConfirmed(newOrder);
      // Immediately connect & persist to CRM Operations Ledger
      onOrderPlaced(newOrder);
      showToast('Payment verified! Order confirmed & sent to CRM.');
    }, 1200);
  };

  // WhatsApp Support Helper
  const getWhatsAppConfirmationUrl = (order: Order) => {
    const cleanSupport = settings.whatsappSupportNumber.replace(/[^0-9]/g, '');
    const target = cleanSupport.startsWith('92') ? cleanSupport : '92' + cleanSupport.replace(/^0/, '');
    const msg = `Assalam-o-Alaikum Insight Products Team!\n\nI have placed an order on your website:\n*Order Ref:* #${order.refNumber}\n*Product:* ${order.productName}\n*Amount Paid:* Rs ${order.sellingPrice.toLocaleString()}\n*Payment Rail:* ${order.paymentRail}\n*Delivery Email:* ${order.customerEmail}\n*WhatsApp:* ${order.customerPhone}\n\nI have already uploaded my payment screenshot. Please dispatch my credentials / activation link. Thank you!`;
    return `https://wa.me/${target}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="w-full pb-28 pt-8 min-h-screen bg-[#f8f9ff]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-[#0b1c30] text-white text-xs font-semibold rounded-2xl shadow-2xl border border-[#4648d4] animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {viewingReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#e5eeff] p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c49] text-[20px]">receipt_long</span>
                <h3 className="font-headline font-bold text-sm text-[#0b1c30]">Uploaded Payment Slip Proof</h3>
              </div>
              <button
                onClick={() => setViewingReceiptModal(null)}
                className="w-7 h-7 rounded-xl bg-[#eff4ff] text-[#464554] flex items-center justify-center hover:bg-[#dce9ff]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-[#dce9ff] max-h-[65vh] flex items-center justify-center bg-gray-50">
              <img
                src={viewingReceiptModal}
                alt="Payment Slip Proof"
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setViewingReceiptModal(null)}
                className="px-4 py-2 bg-[#4648d4] text-white text-xs font-bold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-[#767586] font-medium">
            <button
              onClick={onNavigateToHome}
              className="hover:text-[#4648d4] transition-colors"
            >
              Store Catalog
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#0b1c30] font-semibold">Instant Payment &amp; Slip Upload</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="tracking-wide uppercase text-[10px]">LIVE CRM SYNC ACTIVE</span>
          </div>
        </div>

        {/* Product Quick Switcher */}
        <div className="mb-6 p-4 bg-white rounded-3xl border border-[#e5eeff] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3 px-1">
            <span className="text-xs font-bold text-[#464554] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#4648d4]">tune</span>
              Select / Switch Product ({activeProducts.length} Available)
            </span>
            <span className="text-[11px] text-[#767586]">
              Selected: <strong className="text-[#4648d4]">{selectedProduct.shortName}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
            {activeProducts.map((prod) => {
              const isSelected = prod.id === selectedProduct.id;
              return (
                <button
                  key={prod.id}
                  onClick={() => {
                    onSelectProduct(prod);
                    showToast(`Switched to ${prod.shortName}`);
                  }}
                  className={`p-2 rounded-2xl text-left border transition-all flex flex-col justify-between overflow-hidden relative ${
                    isSelected
                      ? 'bg-[#4648d4] text-white border-[#4648d4] shadow-md ring-2 ring-[#4648d4]/20 scale-[1.02]'
                      : 'bg-[#f8f9ff] text-[#0b1c30] border-[#e5eeff] hover:border-[#4648d4]/40 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    {prod.imageUrl ? (
                      <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/30 shadow-xs shrink-0 bg-black/40">
                        <img
                          src={prod.imageUrl}
                          alt={prod.shortName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          isSelected ? 'text-white' : prod.iconColor
                        }`}
                      >
                        {prod.icon}
                      </span>
                    )}
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold truncate leading-tight">
                      {prod.shortName}
                    </div>
                    <div
                      className={`text-[10px] font-mono ${
                        isSelected ? 'text-white/80' : 'text-[#767586]'
                      }`}
                    >
                      Rs {prod.price}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* THANK YOU / CONFIRMATION PAGE (SHOWN ONLY AFTER SLIP UPLOAD) */}
        {/* ---------------------------------------------------- */}
        {orderConfirmed ? (
          <div className="space-y-6 animate-fade-in">
            {/* Main Thank You Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e5eeff] shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#eff4ff]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shrink-0">
                    <span className="material-symbols-outlined text-[32px]">task_alt</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                      Payment Received &amp; Verified
                    </span>
                    <h2 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#0b1c30] mt-1">
                      Thank You, {orderConfirmed.customerName}!
                    </h2>
                    <p className="text-xs text-[#767586]">
                      Your order has been confirmed and registered in our live Operations CRM Ledger.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#f8f9ff] p-3 rounded-2xl border border-[#dce9ff] self-start md:self-center">
                  <div>
                    <span className="text-[10px] text-[#767586] block font-semibold">ORDER TRACKING #</span>
                    <span className="font-mono font-extrabold text-sm sm:text-base text-[#4648d4]">
                      {orderConfirmed.refNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(orderConfirmed.refNumber, 'Tracking Number')}
                    className="p-1.5 bg-white hover:bg-[#eff4ff] text-[#4648d4] border border-[#dce9ff] rounded-xl text-xs font-bold"
                    title="Copy Order ID"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                </div>
              </div>

              {/* Order Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Product Summary */}
                <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#767586] uppercase tracking-wider block">
                      Product &amp; License
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                      Dispatched to Queue
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {PRODUCTS.find((p) => p.name === orderConfirmed.productName || p.id === orderConfirmed.productId)?.imageUrl ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#dce9ff] shadow-sm shrink-0 bg-[#0b1c30]">
                        <img
                          src={PRODUCTS.find((p) => p.name === orderConfirmed.productName || p.id === orderConfirmed.productId)?.imageUrl}
                          alt={orderConfirmed.productName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div>
                      <div className="font-headline font-bold text-sm sm:text-base text-[#0b1c30]">
                        {orderConfirmed.productName}
                      </div>
                      <div className="text-xs text-[#464554]">{orderConfirmed.planDetails}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#eff4ff] flex items-center justify-between text-xs">
                    <span className="text-[#767586]">Paid Amount:</span>
                    <strong className="font-mono text-emerald-700 font-bold">
                      Rs {orderConfirmed.sellingPrice.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Delivery & Dispatch Target */}
                <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff] space-y-2">
                  <span className="text-[10px] font-bold text-[#767586] uppercase tracking-wider block">
                    Recipient Delivery Details
                  </span>
                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-gray-500">Email:</span>{' '}
                      <strong className="text-gray-900 font-mono">{orderConfirmed.customerEmail}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">WhatsApp:</span>{' '}
                      <strong className="text-gray-900 font-mono">{orderConfirmed.customerPhone}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment Rail:</span>{' '}
                      <strong className="text-gray-900">{orderConfirmed.paymentRail}</strong>
                    </div>
                  </div>
                </div>

                {/* Attached Screenshot Proof */}
                <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff] space-y-2">
                  <span className="text-[10px] font-bold text-[#767586] uppercase tracking-wider block">
                    Uploaded Payment Slip Proof
                  </span>
                  {orderConfirmed.receiptImage ? (
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => setViewingReceiptModal(orderConfirmed.receiptImage!)}
                        className="w-14 h-14 rounded-xl overflow-hidden border border-[#dce9ff] cursor-pointer hover:opacity-90 relative group shrink-0 bg-white"
                      >
                        <img
                          src={orderConfirmed.receiptImage}
                          alt="Slip Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-white text-[18px]">zoom_in</span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-mono font-bold text-[#0b1c30] truncate block">
                          {orderConfirmed.receiptName || 'payment_slip.jpg'}
                        </span>
                        <span className="text-[10px] text-[#006c49] font-bold block">
                          ✓ Verified &amp; Attached
                        </span>
                        <button
                          onClick={() => setViewingReceiptModal(orderConfirmed.receiptImage!)}
                          className="text-[11px] text-[#4648d4] font-bold hover:underline"
                        >
                          View Full Screenshot
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 font-mono">
                      {orderConfirmed.receiptName || 'Verified Payment Slip'}
                    </div>
                  )}
                </div>
              </div>

              {/* Next Steps & Action Buttons */}
              <div className="p-4 rounded-2xl bg-[#fff7ed] border border-[#fed7aa] space-y-3">
                <div className="flex items-center gap-2 text-[#9a3412] font-bold text-xs">
                  <span className="material-symbols-outlined text-[18px] text-[#ea580c]">schedule_send</span>
                  <span>What happens next?</span>
                </div>
                <p className="text-xs text-[#7c2d12] leading-relaxed">
                  Our automated fulfillment system has matched your payment slip. Your activation credentials / invite link will be sent to your email (<strong>{orderConfirmed.customerEmail}</strong>) and dispatched to your WhatsApp within 5–15 minutes.
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={getWhatsAppConfirmationUrl(orderConfirmed)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 bg-[#006c49] hover:bg-[#00885d] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>Send Order Slip to WhatsApp Support Desk</span>
                  </a>

                  {isAdmin && (
                    <button
                      onClick={onNavigateToLedger}
                      className="px-4 py-3 bg-[#4648d4] hover:bg-[#6063ee] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">monitoring</span>
                      <span>Inspect in CRM Operations Ledger</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    setOrderConfirmed(null);
                    setReceiptAttached(false);
                    setReceiptImage(null);
                    setReceiptFileName('');
                    onNavigateToHome();
                  }}
                  className="px-5 py-3 bg-white hover:bg-[#eff4ff] text-[#464554] border border-[#dce9ff] text-xs font-bold rounded-xl transition-all"
                >
                  ← Return to Store Catalog
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ---------------------------------------------------- */
          /* CHECKOUT PAYMENT & MANDATORY SLIP UPLOAD FORM */
          /* ---------------------------------------------------- */
          <>
            {/* Order Summary Header Bar */}
            <div className="mb-8 p-6 bg-white rounded-3xl border border-[#e5eeff] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#dce9ff] bg-[#0b1c30] shadow-md shrink-0 relative">
                  {selectedProduct.imageUrl ? (
                    <>
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-1 right-1">
                        <span className={`material-symbols-outlined text-[16px] ${selectedProduct.iconColor}`}>
                          {selectedProduct.icon}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${selectedProduct.accentGradient} flex items-center justify-center text-white`}
                    >
                      <span className={`material-symbols-outlined text-[28px] ${selectedProduct.iconColor}`}>
                        {selectedProduct.icon}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#eff4ff] text-[#4648d4] rounded-md">
                      {selectedProduct.categoryLabel}
                    </span>
                    {selectedProduct.brandLogo && (
                      <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 bg-[#0b1c30] text-white rounded-md">
                        {selectedProduct.brandLogo}
                      </span>
                    )}
                    <span className="text-xs text-[#767586] font-mono">{selectedProduct.ref}</span>
                  </div>
                  <h2 className="font-headline font-bold text-xl text-[#0b1c30] mt-0.5">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-xs text-[#464554]">{selectedProduct.longDesc || selectedProduct.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 self-end md:self-center pt-4 md:pt-0 border-t md:border-t-0 border-[#eff4ff] w-full md:w-auto justify-between md:justify-end">
                <div>
                  <div className="text-[11px] text-[#767586]">Base Price</div>
                  <div className="font-headline font-bold text-sm text-[#0b1c30]">
                    {selectedProduct.formattedPrice}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#767586]">Processing Fee</div>
                  <div className="font-headline font-bold text-sm text-[#006c49]">PKR 0 (FREE)</div>
                </div>
                <div className="pl-6 border-l border-[#eff4ff]">
                  <div className="text-[11px] text-[#767586]">Total Payable</div>
                  <div className="font-headline font-extrabold text-2xl text-[#4648d4]">
                    {selectedProduct.formattedPrice}
                  </div>
                </div>
              </div>
            </div>

            {/* Main 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Mobile Wallets & Bank Account Details */}
              <div className="lg:col-span-7 space-y-6">
                {/* Mobile Accounts Primary Box (JazzCash & Easypaisa) */}
                <div className="bg-white rounded-3xl border border-[#dce9ff] p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#eff4ff]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#4648d4] text-white flex items-center justify-center font-bold shadow-sm">
                        <span className="material-symbols-outlined text-[22px]">smartphone</span>
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-lg text-[#0b1c30]">
                          JazzCash &amp; Easypaisa Transfer
                        </h3>
                        <p className="text-xs text-[#767586]">Instant Mobile Account Payment Rails</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && onOpenPaymentSettings && (
                        <button
                          onClick={onOpenPaymentSettings}
                          className="px-2.5 py-1 bg-[#fff7ed] hover:bg-[#ffedd5] text-[#c2410c] border border-[#fdba74] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                          title="Admin: Change live account numbers"
                        >
                          <span className="material-symbols-outlined text-[15px]">settings</span>
                          <span className="hidden sm:inline">Edit Numbers</span>
                        </button>
                      )}
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        <span>Verified 0% Fee</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#464554] leading-relaxed">
                    Please transfer the exact payable amount{' '}
                    <strong className="text-[#4648d4] font-bold">
                      {selectedProduct.formattedPrice}
                    </strong>{' '}
                    to any of our official verified mobile accounts below via your JazzCash or Easypaisa app:
                  </p>

                  {/* JazzCash Mobile Account Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-50/60 to-[#fff7ed] border border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                        JC
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-red-900 tracking-wider">
                            JAZZCASH MOBILE ACCOUNT
                          </span>
                          <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-md border border-red-200">
                            Direct Transfer
                          </span>
                        </div>
                        <span className="font-mono font-extrabold text-lg sm:text-xl text-[#0b1c30] tracking-wider block mt-0.5">
                          {settings.jazzcashNumber || settings.walletNumber || '03145338340'}
                        </span>
                        <span className="text-[11px] text-[#464554] font-medium block">
                          Account Title: <strong className="text-[#0b1c30]">{settings.jazzcashTitle || settings.walletTitle || 'Insight Products'}</strong>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          (settings.jazzcashNumber || settings.walletNumber || '03145338340').replace(/[^0-9]/g, ''),
                          'JazzCash Number'
                        )
                      }
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      <span>Copy JazzCash</span>
                    </button>
                  </div>

                  {/* Easypaisa Mobile Account Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-[#eff4ff] border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#006c49] text-white flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                        EP
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[#006c49] tracking-wider">
                            EASYPAISA MOBILE ACCOUNT
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                            Instant Verified
                          </span>
                        </div>
                        <span className="font-mono font-extrabold text-lg sm:text-xl text-[#0b1c30] tracking-wider block mt-0.5">
                          {settings.easypaisaNumber || settings.walletNumber || '03145338340'}
                        </span>
                        <span className="text-[11px] text-[#464554] font-medium block">
                          Account Title: <strong className="text-[#0b1c30]">{settings.easypaisaTitle || settings.walletTitle || 'Insight Products'}</strong>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          (settings.easypaisaNumber || settings.walletNumber || '03145338340').replace(/[^0-9]/g, ''),
                          'Easypaisa Number'
                        )
                      }
                      className="px-4 py-2 bg-[#006c49] hover:bg-[#00885d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      <span>Copy Easypaisa</span>
                    </button>
                  </div>

                  {/* WhatsApp Verification Support Direct Desk */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">chat</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-950 block">
                          Need Help or Instant WhatsApp Confirmation?
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-800">
                          {settings.whatsappDisplay || '0314 5338340'}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${(settings.whatsappSupportNumber || '+923145338340').replace(/\D/g, '')}?text=Hi%20Insight%20Products%20Support,%20I%20am%20ordering%20${encodeURIComponent(selectedProduct.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                      <span>WhatsApp Desk</span>
                    </a>
                  </div>

                  {/* Optional Bank Account Box (Shown ONLY when enableBankTransfer is explicitly enabled and configured by Admin) */}
                  {settings.enableBankTransfer && settings.accountNumber && (
                    <div className="p-5 rounded-2xl bg-[#f8f9ff] border border-[#dce9ff] space-y-3 pt-4 mt-4">
                      <div className="flex items-center justify-between border-b border-[#eff4ff] pb-2">
                        <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#4648d4] text-[18px]">account_balance</span>
                          <span>{settings.bankName} (1-Link Transfer)</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Active</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-[#767586] block">ACCOUNT NUMBER</span>
                          <span className="font-mono font-bold text-sm text-[#0b1c30]">{settings.accountNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#767586] block">ACCOUNT TITLE</span>
                          <span className="font-bold text-sm text-[#0b1c30]">{settings.accountTitle}</span>
                        </div>
                        {settings.iban && (
                          <div className="sm:col-span-2">
                            <span className="text-[10px] text-[#767586] block">IBAN</span>
                            <span className="font-mono font-bold text-xs text-[#0b1c30] break-all">{settings.iban}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mandatory Upload Notice */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-700 text-[20px] shrink-0 mt-0.5">
                      info
                    </span>
                    <div className="text-xs text-amber-950 space-y-1">
                      <span className="font-bold block">
                        Payment Proof is Mandatory Before Order Confirmation
                      </span>
                      <p className="text-amber-900 leading-relaxed">
                        After transferring funds via JazzCash or Easypaisa app, take a screenshot of the transaction slip and upload it in the form to your right. Once uploaded, your license will be queued for instant activation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buyer Protection Guarantee */}
                <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 shadow-sm">
                  <h4 className="font-headline font-bold text-sm text-[#0b1c30] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006c49] text-[18px]">
                      security
                    </span>
                    <span>Insight Products Buyer Protection Guarantee</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff]">
                      <span className="material-symbols-outlined text-[#4648d4] text-[22px] mb-1">
                        bolt
                      </span>
                      <div className="font-bold text-xs text-[#0b1c30]">Auto-Delivery</div>
                      <div className="text-[10px] text-[#767586]">Under 15 Mins</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff]">
                      <span className="material-symbols-outlined text-[#006c49] text-[22px] mb-1">
                        support_agent
                      </span>
                      <div className="font-bold text-xs text-[#0b1c30]">Direct WhatsApp</div>
                      <div className="text-[10px] text-[#767586]">{settings.whatsappDisplay}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff]">
                      <span className="material-symbols-outlined text-[#6063ee] text-[22px] mb-1">
                        verified_user
                      </span>
                      <div className="font-bold text-xs text-[#0b1c30]">Replacement</div>
                      <div className="text-[10px] text-[#767586]">100% Guaranteed</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff]">
                      <span className="material-symbols-outlined text-[#4338ca] text-[22px] mb-1">
                        sync
                      </span>
                      <div className="font-bold text-xs text-[#0b1c30]">Live CRM Sync</div>
                      <div className="text-[10px] text-[#767586]">Instant Queue</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Delivery Info & Mandatory Screenshot Upload Form */}
              <div className="lg:col-span-5 space-y-6">
                <form
                  onSubmit={handleSubmitOrder}
                  className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 shadow-sm space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-[#eff4ff]">
                    <h3 className="font-headline font-bold text-lg text-[#0b1c30]">
                      Recipient Delivery Details
                    </h3>
                    <span className="text-xs font-semibold text-[#767586]">Final Step</span>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0b1c30]">
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#f8f9ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4648d4] transition-all"
                      placeholder="e.g. Ayesha Khan"
                    />
                  </div>

                  {/* Delivery Email */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#0b1c30]">
                        DELIVERY EMAIL ADDRESS *
                      </label>
                      <span className="text-[10px] text-[#4648d4] font-semibold">
                        {selectedProduct.targetLabel}
                      </span>
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#f8f9ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4648d4] transition-all font-mono"
                      placeholder="yourname@gmail.com"
                    />
                    <p className="text-[11px] text-[#767586]">{selectedProduct.deliveryNote}</p>
                  </div>

                  {/* WhatsApp Number */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0b1c30]">
                      WHATSAPP NUMBER *
                    </label>
                    <input
                      type="text"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#f8f9ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4648d4] transition-all font-mono"
                      placeholder="+92 300 1234567"
                    />
                    <p className="text-[11px] text-[#767586]">
                      Instant backup delivery &amp; order status ping will be dispatched here.
                    </p>
                  </div>

                  {/* Payment Rail Used */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0b1c30]">
                      PAYMENT METHOD TRANSFERRED TO
                    </label>
                    <select
                      value={selectedRail}
                      onChange={(e) => setSelectedRail(e.target.value as Order['paymentRail'])}
                      className="w-full px-4 py-3 rounded-2xl bg-[#f8f9ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4648d4] font-semibold"
                    >
                      <option value="JazzCash Retail">JazzCash ({settings.jazzcashNumber || settings.walletNumber || '03145338340'})</option>
                      <option value="Easypaisa">Easypaisa ({settings.easypaisaNumber || settings.walletNumber || '03145338340'})</option>
                      <option value="Nayapay Wallet">Nayapay / Sadapay Wallet</option>
                      {settings.enableBankTransfer && settings.accountNumber && (
                        <>
                          <option value="Meezan Bank">{settings.bankName || 'Direct Bank Account'}</option>
                          <option value="Bank Alfalah">Bank Alfalah 1-Link</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* ---------------------------------------------------- */}
                  {/* MANDATORY PAYMENT SCREENSHOT UPLOAD SECTION */}
                  {/* ---------------------------------------------------- */}
                  <div
                    id="payment-upload-section"
                    className="pt-4 border-t border-[#eff4ff] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#ea580c]">add_a_photo</span>
                        <span>UPLOAD PAYMENT SCREENSHOT (MANDATORY) *</span>
                      </label>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        receiptAttached
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                      }`}>
                        {receiptAttached ? '✓ Slip Attached' : 'Required to Continue'}
                      </span>
                    </div>

                    {uploadError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 animate-shake">
                        <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0 mt-0.5">
                          error
                        </span>
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {receiptAttached && receiptImage ? (
                      /* Attached State with Thumbnail */
                      <div className="p-4 rounded-2xl bg-[#eff4ff]/60 border-2 border-emerald-400 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => setViewingReceiptModal(receiptImage)}
                              className="w-12 h-12 rounded-xl overflow-hidden border border-[#dce9ff] cursor-pointer hover:opacity-90 relative group bg-white shrink-0"
                            >
                              <img
                                src={receiptImage}
                                alt="Uploaded Screenshot"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white text-[16px]">zoom_in</span>
                              </div>
                            </div>
                            <div className="min-w-0">
                              <span className="font-mono font-bold text-xs text-[#0b1c30] block truncate max-w-[170px]">
                                {receiptFileName}
                              </span>
                              <span className="text-[11px] text-[#767586]">{receiptFileSize}</span>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check</span>
                            <span>Ready to Confirm</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#dce9ff] text-xs">
                          <label className="text-[11px] font-bold text-[#4648d4] hover:underline cursor-pointer flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">change_circle</span>
                            <span>Change Screenshot</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileInputChange}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={handleRemoveReceipt}
                            className="text-[11px] font-semibold text-red-600 hover:underline flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Drag & Drop Upload Zone */
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`rounded-2xl border-2 border-dashed transition-all p-6 text-center cursor-pointer ${
                          isDragging
                            ? 'border-[#4648d4] bg-[#eff4ff]'
                            : 'border-[#fed7aa] bg-[#fff7ed]/50 hover:bg-[#fff7ed] hover:border-[#ea580c]'
                        }`}
                      >
                        <label className="cursor-pointer block">
                          <div className="w-12 h-12 rounded-2xl bg-white text-[#ea580c] shadow-sm flex items-center justify-center mx-auto mb-2 border border-[#fed7aa]">
                            <span className="material-symbols-outlined text-[26px]">
                              cloud_upload
                            </span>
                          </div>
                          <span className="text-xs font-extrabold text-[#7c2d12] block">
                            Click to upload Payment Screenshot or Drag &amp; Drop
                          </span>
                          <span className="text-[11px] text-[#9a3412] mt-1 block">
                            PNG, JPG, JPEG or WebP from Banking App (Max 10MB)
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            required
                            onChange={handleFileInputChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-6 font-bold text-sm sm:text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      receiptAttached
                        ? 'bg-[#4648d4] hover:bg-[#6063ee] text-white shadow-[0_8px_24px_rgba(70,72,212,0.32)] hover:scale-[1.01] active:scale-[0.99]'
                        : 'bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-[0_8px_24px_rgba(234,88,12,0.3)]'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying Payment Slip with CRM...</span>
                      </>
                    ) : receiptAttached ? (
                      <>
                        <span className="material-symbols-outlined text-[20px]">verified</span>
                        <span>
                          Confirm Order &amp; Proceed to Thank You Page ({selectedProduct.formattedPrice})
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                        <span>
                          Upload Screenshot &amp; Confirm Order ({selectedProduct.formattedPrice})
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Sticky CTA Bar */}
      {!orderConfirmed && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-[#e5eeff] z-30 shadow-lg flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] text-[#767586] uppercase font-bold tracking-wider">
              Total Payable
            </div>
            <div className="font-headline font-extrabold text-lg text-[#4648d4]">
              {selectedProduct.formattedPrice}
            </div>
          </div>

          <button
            onClick={() => handleSubmitOrder()}
            disabled={isSubmitting}
            className={`px-5 py-3 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer ${
              receiptAttached ? 'bg-[#4648d4]' : 'bg-[#ea580c]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {receiptAttached ? 'check_circle' : 'upload_file'}
            </span>
            <span>{receiptAttached ? 'Confirm Order' : 'Upload Slip & Order'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
