import React, { useState, useEffect } from 'react';
import { Product, Order, PaymentSettings } from './types';
import { PRODUCTS, INITIAL_ORDERS, DEFAULT_PAYMENT_SETTINGS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { StorefrontView } from './components/StorefrontView';
import { CheckoutView } from './components/CheckoutView';
import { OperationsLedgerView } from './components/OperationsLedgerView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPaymentSettingsModal } from './components/AdminPaymentSettingsModal';
import { Footer } from './components/Footer';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'checkout' | 'ledger'>('home');

  // Dynamic Products List with local persistence
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('insight_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading products from localStorage:', e);
      }
    }
    return PRODUCTS;
  });

  const [selectedProduct, setSelectedProduct] = useState<Product>(() => {
    return products.find((p) => p.id === 'canva') || products[0] || PRODUCTS[0];
  });

  // Sync products with localStorage
  useEffect(() => {
    localStorage.setItem('insight_products', JSON.stringify(products));
  }, [products]);

  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    // If selected product was edited or removed, sync selectedProduct
    const currentId = selectedProduct.id;
    const match = newProducts.find((p) => p.id === currentId);
    if (match) {
      setSelectedProduct(match);
    } else if (newProducts.length > 0) {
      setSelectedProduct(newProducts[0]);
    }
  };

  const handleAddProduct = (newProd: Product) => {
    const updated = [newProd, ...products];
    handleUpdateProducts(updated);
  };

  const handleSaveProduct = (savedProd: Product) => {
    const exists = products.some((p) => p.id === savedProd.id);
    let updated: Product[];
    if (exists) {
      updated = products.map((p) => (p.id === savedProd.id ? savedProd : p));
    } else {
      updated = [savedProd, ...products];
    }
    handleUpdateProducts(updated);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    handleUpdateProducts(updated);
  };

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('insight_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ORDERS;
  });

  // Dynamic Payment Rails Settings with local persistence
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    const saved = localStorage.getItem('insight_payment_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If old placeholder number or unconfigured bank setting exists, upgrade gracefully
        if (parsed.walletNumber === '0300-1234567' || !parsed.walletNumber || parsed.enableBankTransfer === undefined) {
          const merged = { ...DEFAULT_PAYMENT_SETTINGS, ...parsed, enableBankTransfer: parsed.enableBankTransfer ?? false, walletNumber: parsed.walletNumber === '0300-1234567' ? '03145338340' : parsed.walletNumber, whatsappSupportNumber: parsed.whatsappSupportNumber === '+923001234567' ? '+923145338340' : parsed.whatsappSupportNumber, whatsappDisplay: parsed.whatsappDisplay === '+92 300 1234567' ? '0314 5338340' : parsed.whatsappDisplay };
          localStorage.setItem('insight_payment_settings', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch {
        return DEFAULT_PAYMENT_SETTINGS;
      }
    }
    return DEFAULT_PAYMENT_SETTINGS;
  });
  const [showGlobalPaymentSettingsModal, setShowGlobalPaymentSettingsModal] = useState<boolean>(false);

  const handleUpdatePaymentSettings = (newSettings: PaymentSettings) => {
    setPaymentSettings(newSettings);
    localStorage.setItem('insight_payment_settings', JSON.stringify(newSettings));
  };

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('lumina_is_admin') === 'true';
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);

  // Sync orders with localStorage
  useEffect(() => {
    localStorage.setItem('insight_orders', JSON.stringify(orders));
  }, [orders]);

  // Sync admin state with localStorage
  useEffect(() => {
    localStorage.setItem('lumina_is_admin', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
  };

  const handleOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const handleResetOrders = () => {
    if (window.confirm('Reset orders back to initial demo baseline?')) {
      setOrders(INITIAL_ORDERS);
      localStorage.setItem('insight_orders', JSON.stringify(INITIAL_ORDERS));
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setShowAdminLoginModal(false);
    setCurrentTab('ledger');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('lumina_is_admin');
    setCurrentTab('home');
  };

  const handleFooterNavigate = (tab: 'home' | 'checkout' | 'ledger', anchorId?: string) => {
    if (tab === 'ledger' && !isAdmin) {
      setShowAdminLoginModal(true);
      return;
    }
    setCurrentTab(tab);
    if (anchorId) {
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'ledger' && !isAdmin) {
            setShowAdminLoginModal(true);
            return;
          }
          setCurrentTab(tab);
        }}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        onAdminLogout={handleAdminLogout}
        onBrowseProductsClick={() => {
          if (currentTab !== 'home') {
            setCurrentTab('home');
            setTimeout(() => {
              const el = document.getElementById('catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 60);
          } else {
            const el = document.getElementById('catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-20">
        {currentTab === 'home' && (
          <StorefrontView
            products={products}
            onSelectProduct={(p) => {
              handleSelectProduct(p);
              setCurrentTab('checkout');
            }}
            onNavigateToCheckout={() => setCurrentTab('checkout')}
            onNavigateToLedger={() => {
              if (!isAdmin) {
                setShowAdminLoginModal(true);
              } else {
                setCurrentTab('ledger');
              }
            }}
            isAdmin={isAdmin}
            onOpenAdminLogin={() => setShowAdminLoginModal(true)}
            paymentSettings={paymentSettings}
          />
        )}

        {currentTab === 'checkout' && (
          <CheckoutView
            products={products}
            selectedProduct={selectedProduct}
            onSelectProduct={handleSelectProduct}
            onOrderPlaced={handleOrderPlaced}
            onNavigateToLedger={() => {
              if (!isAdmin) {
                setShowAdminLoginModal(true);
              } else {
                setCurrentTab('ledger');
              }
            }}
            onNavigateToHome={() => setCurrentTab('home')}
            isAdmin={isAdmin}
            paymentSettings={paymentSettings}
            onOpenPaymentSettings={() => setShowGlobalPaymentSettingsModal(true)}
          />
        )}

        {currentTab === 'ledger' && (
          <>
            {isAdmin ? (
              <OperationsLedgerView
                orders={orders}
                products={products}
                onUpdateProducts={handleUpdateProducts}
                onAddProduct={handleAddProduct}
                onSaveProduct={handleSaveProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddOrder={(newOrd) => setOrders((prev) => [newOrd, ...prev])}
                onUpdateOrder={handleUpdateOrder}
                onDeleteOrder={handleDeleteOrder}
                onResetOrders={handleResetOrders}
                onNavigateToCheckout={() => setCurrentTab('checkout')}
                paymentSettings={paymentSettings}
                onUpdatePaymentSettings={handleUpdatePaymentSettings}
              />
            ) : (
              <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-[#e5eeff] text-center shadow-lg space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[30px]">lock</span>
                </div>
                <h2 className="font-headline font-bold text-xl text-[#0b1c30]">
                  Admin Authentication Required
                </h2>
                <p className="text-xs text-[#464554] leading-relaxed">
                  The Operations Financial Ledger &amp; Customer CRM is private and restricted to
                  authorized administrators only.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => setShowAdminLoginModal(true)}
                    className="w-full py-3 px-4 bg-[#4648d4] hover:bg-[#6063ee] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">key</span>
                    <span>Enter Admin Credentials</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('home')}
                    className="w-full py-2.5 px-4 bg-[#eff4ff] text-[#464554] hover:text-[#0b1c30] font-bold text-xs rounded-xl transition-colors"
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Payment Settings Modal (Direct trigger from Checkout or Quick Actions) */}
      <AdminPaymentSettingsModal
        isOpen={showGlobalPaymentSettingsModal}
        onClose={() => setShowGlobalPaymentSettingsModal(false)}
        currentSettings={paymentSettings}
        onSaveSettings={handleUpdatePaymentSettings}
      />

      {/* Global Footer */}
      <Footer
        onNavigate={handleFooterNavigate}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        paymentSettings={paymentSettings}
      />
    </div>
  );
}
