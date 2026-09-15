import React, { useState, useEffect } from 'react';
import { Product, Order, PaymentSettings, LearnedMemoryRule } from './types';
import { PRODUCTS, INITIAL_ORDERS, DEFAULT_PAYMENT_SETTINGS, VENDORS, INITIAL_LEARNED_RULES } from './data/mockData';
import { Navbar } from './components/Navbar';
import { StorefrontView } from './components/StorefrontView';
import { CheckoutView } from './components/CheckoutView';
import { OperationsLedgerView } from './components/OperationsLedgerView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPaymentSettingsModal } from './components/AdminPaymentSettingsModal';
import { AIOperationsAgentModal } from './components/AIOperationsAgentModal';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { Footer } from './components/Footer';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'checkout' | 'ledger'>('home');
  const [showAIAgentModal, setShowAIAgentModal] = useState<boolean>(false);
  const [showLiveVoiceModal, setShowLiveVoiceModal] = useState<boolean>(false);

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
        if (Array.isArray(parsed)) {
          // If stored data contains the old mock demo orders (ord-01 to ord-07), purge them to zero
          const hasOldMockOrders = parsed.some((o: Order) => typeof o.id === 'string' && o.id.startsWith('ord-0'));
          if (hasOldMockOrders) {
            localStorage.setItem('insight_orders', JSON.stringify([]));
            localStorage.removeItem('insight_customer_dossiers');
            return [];
          }
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
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

  // Continuous Learning Memory Rules state with persistence
  const [learnedRules, setLearnedRules] = useState<LearnedMemoryRule[]>(() => {
    const saved = localStorage.getItem('insight_learned_rules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to load learned rules:', e);
      }
    }
    return INITIAL_LEARNED_RULES;
  });

  useEffect(() => {
    localStorage.setItem('insight_learned_rules', JSON.stringify(learnedRules));
  }, [learnedRules]);

  const handleUpdateLearnedRules = (newRules: LearnedMemoryRule[]) => {
    setLearnedRules(newRules);
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
    if (window.confirm('Clear all orders and sales records back to zero?')) {
      setOrders([]);
      localStorage.setItem('insight_orders', JSON.stringify([]));
      localStorage.removeItem('insight_customer_dossiers');
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
    setShowAIAgentModal(false);
    setCurrentTab('home');
  };

  const handleOpenAIAgent = () => {
    if (!isAdmin) {
      setShowAdminLoginModal(true);
    } else {
      setShowAIAgentModal(true);
    }
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
        onOpenAIAgent={isAdmin ? handleOpenAIAgent : undefined}
        onOpenLiveVoice={isAdmin ? () => setShowLiveVoiceModal(true) : undefined}
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
                onOpenAIAgent={() => setShowAIAgentModal(true)}
                onOpenLiveVoice={() => setShowLiveVoiceModal(true)}
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

      {/* Floating Action Buttons (Admin Exclusive) */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col sm:flex-row items-end sm:items-center gap-2.5">
          {/* Real-time Voice Live Assistant (Gemini Live API) - Admin Exclusive */}
          <button
            onClick={() => setShowLiveVoiceModal(true)}
            title="Open Admin Real-Time Voice Copilot (gemini-3.1-flash-live-preview)"
            className="group flex items-center gap-2.5 px-4 py-3 bg-linear-to-r from-[#4648d4] via-[#6366f1] to-[#ea580c] hover:scale-105 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-full shadow-[0_12px_30px_rgba(70,72,212,0.4)] transition-all border border-white/25 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] animate-pulse">graphic_eq</span>
            </div>
            <span>Admin Live Voice</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </button>

          {/* Floating Global AI Operations Agent Launcher (Admin Exclusive) */}
          <button
            onClick={handleOpenAIAgent}
            title="Open Insight AI Operations Copilot (Admin Exclusive)"
            className="group flex items-center gap-2.5 px-4 py-3 bg-linear-to-r from-[#0b1c30] via-[#4648d4] to-[#ea580c] hover:scale-105 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-full shadow-[0_12px_30px_rgba(70,72,212,0.35)] transition-all border border-white/25 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            </div>
            <span>Insight AI Agent</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      )}

      {/* Global AI Operations Copilot Modal (Admin Exclusive) */}
      <AIOperationsAgentModal
        isOpen={showAIAgentModal}
        onClose={() => setShowAIAgentModal(false)}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => {
          setShowAIAgentModal(false);
          setShowAdminLoginModal(true);
        }}
        products={products}
        orders={orders}
        vendors={VENDORS}
        paymentSettings={paymentSettings}
        learnedRules={learnedRules}
        onUpdateProducts={handleUpdateProducts}
        onUpdateOrder={handleUpdateOrder}
        onUpdateOrders={(newOrders) => setOrders(newOrders)}
        onUpdatePaymentSettings={handleUpdatePaymentSettings}
        onUpdateLearnedRules={handleUpdateLearnedRules}
        onNavigateToStorefront={() => setCurrentTab('home')}
        onNavigateToCheckout={() => setCurrentTab('checkout')}
        onOpenLiveVoice={() => setShowLiveVoiceModal(true)}
        onNavigateTab={(tab) => {
          if (tab === 'receipts' || tab === 'orders' || tab === 'products' || tab === 'crm' || tab === 'vendors') {
            if (!isAdmin) {
              setShowAdminLoginModal(true);
            } else {
              setCurrentTab('ledger');
            }
          }
        }}
      />

      {/* Real-time Gemini Live Voice Modal with direct store modification capabilities (Admin Exclusive) */}
      <LiveVoiceModal
        isOpen={showLiveVoiceModal}
        onClose={() => setShowLiveVoiceModal(false)}
        products={products}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateProducts={handleUpdateProducts}
        paymentSettings={paymentSettings}
        onUpdatePaymentSettings={handleUpdatePaymentSettings}
        onNavigateTab={(tab, productId) => {
          if (tab === 'home') {
            setCurrentTab('home');
          } else if (tab === 'checkout') {
            if (productId) {
              const target = products.find((p) => p.id === productId);
              if (target) setSelectedProduct(target);
            }
            setCurrentTab('checkout');
          } else if (tab === 'receipts' || tab === 'orders' || tab === 'products' || tab === 'crm' || tab === 'vendors') {
            if (!isAdmin) {
              setShowAdminLoginModal(true);
            } else {
              setCurrentTab('ledger');
            }
          }
        }}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => {
          setShowLiveVoiceModal(false);
          setShowAdminLoginModal(true);
        }}
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
