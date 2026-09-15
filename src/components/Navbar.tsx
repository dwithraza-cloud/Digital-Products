import React, { useState, useEffect } from 'react';

interface NavbarProps {
  currentTab: 'home' | 'checkout' | 'ledger';
  setCurrentTab: (tab: 'home' | 'checkout' | 'ledger') => void;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  onBrowseProductsClick?: () => void;
  onOpenAIAgent?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isAdmin,
  onOpenAdminLogin,
  onAdminLogout,
  onBrowseProductsClick,
  onOpenAIAgent,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'home' | 'catalog' | 'how-it-works' | 'faq'>('home');

  // Listen to window scroll to automatically update active blue pill as user scrolls
  useEffect(() => {
    if (currentTab !== 'home') return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 200; // offset for header

      const catalogEl = document.getElementById('catalog');
      const howItWorksEl = document.getElementById('how-it-works');
      const faqEl = document.getElementById('faq');

      if (faqEl && scrollPos >= faqEl.offsetTop) {
        setActiveSection('faq');
      } else if (howItWorksEl && scrollPos >= howItWorksEl.offsetTop) {
        setActiveSection('how-it-works');
      } else if (catalogEl && scrollPos >= catalogEl.offsetTop) {
        setActiveSection('catalog');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentTab]);

  const handleNavClick = (tab: 'home' | 'checkout' | 'ledger', anchorId?: 'catalog' | 'how-it-works' | 'faq') => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);

    if (tab === 'home') {
      if (anchorId) {
        setActiveSection(anchorId);
        setTimeout(() => {
          const el = document.getElementById(anchorId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 60);
      } else {
        setActiveSection('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-[#f8f9ff]/90 backdrop-blur-xl border-b border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-20 max-w-[1280px] mx-auto px-5 lg:px-10 flex items-center justify-between gap-4">
          {/* Logo & Safe Badge */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <img
                alt="Insight Products Logo"
                className="h-9 w-9 rounded-xl object-contain shadow-sm transition-transform group-hover:scale-105"
                src="/logo.svg"
              />
              <span className="font-headline font-bold text-2xl tracking-tight text-[#0b1c30]">
                Insight <span className="text-[#ea580c]">Products</span>
              </span>
            </button>

            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-[#eff4ff] border border-[#dce9ff] rounded-full">
              <span className="material-symbols-outlined text-[#006c49] text-[18px]">
                verified_user
              </span>
              <span className="text-[11px] font-bold text-[#464554] uppercase tracking-wider">
                Safe &amp; Verified Assets
              </span>
            </div>
          </div>

          {/* Desktop Navigation - Home, Products, How It Works, FAQ */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-[#f0f4ff]/80 rounded-2xl border border-[#e5eeff]">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentTab === 'home' && activeSection === 'home'
                  ? 'bg-[#4648d4] text-white shadow-sm'
                  : 'text-[#464554] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('home', 'catalog')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentTab === 'home' && activeSection === 'catalog'
                  ? 'bg-[#4648d4] text-white shadow-sm'
                  : 'text-[#464554] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => handleNavClick('home', 'how-it-works')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentTab === 'home' && activeSection === 'how-it-works'
                  ? 'bg-[#4648d4] text-white shadow-sm'
                  : 'text-[#464554] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('home', 'faq')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentTab === 'home' && activeSection === 'faq'
                  ? 'bg-[#4648d4] text-white shadow-sm'
                  : 'text-[#464554] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
              }`}
            >
              FAQ
            </button>

            {/* If Admin is logged in, show CRM Tab */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('ledger')}
                className={`px-3.5 py-1.5 ml-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentTab === 'ledger'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">monitoring</span>
                <span>Operations CRM</span>
              </button>
            )}
          </nav>

          {/* Right Action & Admin Login / Logout */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (currentTab !== 'home') {
                  setCurrentTab('home');
                }
                setActiveSection('catalog');
                if (onBrowseProductsClick) {
                  onBrowseProductsClick();
                } else {
                  setTimeout(() => {
                    const el = document.getElementById('catalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 60);
                }
              }}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#4648d4] hover:bg-[#6063ee] text-white text-xs font-bold rounded-xl shadow-[0_4px_14px_rgba(70,72,212,0.28)] transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
              <span>Browse Products</span>
            </button>

            {/* AI Copilot Button (Admin Exclusive) */}
            {isAdmin && onOpenAIAgent && (
              <button
                onClick={onOpenAIAgent}
                title="Insight AI Store Copilot (Admin Exclusive)"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-linear-to-r from-[#4648d4] via-[#6366f1] to-[#ea580c] hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">smart_toy</span>
                <span className="hidden sm:inline">AI Agent</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            )}

            {/* Admin State & Login Trigger */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('ledger')}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    currentTab === 'ledger'
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title="Open Admin CRM & Ledger"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Admin CRM</span>
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Log out of Admin"
                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                title="Admin Login - Insight Operations"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#fff7ed] hover:bg-[#ffedd5] text-[#c2410c] hover:text-[#9a3412] text-xs font-bold transition-all border border-[#fdba74] shadow-sm"
              >
                <span className="material-symbols-outlined text-[17px] text-[#ea580c]">admin_panel_settings</span>
                <span className="hidden sm:inline">Admin Login</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              aria-label="Open Navigation Menu"
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0b1c30] hover:bg-[#e5eeff] transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#213145]/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 right-0 w-72 max-w-[85vw] h-full bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col p-6 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2">
            <img
              alt="Insight Products Logo"
              className="h-8 w-8 rounded-lg object-contain"
              src="/logo.svg"
            />
            <span className="font-headline font-bold text-lg text-[#0b1c30]">
              Insight <span className="text-[#ea580c]">Products</span>
            </span>
          </div>
          <button
            aria-label="Close Navigation Menu"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#eff4ff] text-[#464554] hover:text-[#0b1c30]"
            onClick={() => setMobileMenuOpen(false)}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation list: Home, Products, How It Works, FAQ */}
        <nav className="flex flex-col gap-2 flex-1 mt-6">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              currentTab === 'home' && activeSection === 'home'
                ? 'bg-[#4648d4] text-white font-bold shadow-sm'
                : 'text-[#464554] hover:bg-[#eff4ff]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('home', 'catalog')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              currentTab === 'home' && activeSection === 'catalog'
                ? 'bg-[#4648d4] text-white font-bold shadow-sm'
                : 'text-[#464554] hover:bg-[#eff4ff]'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => handleNavClick('home', 'how-it-works')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              currentTab === 'home' && activeSection === 'how-it-works'
                ? 'bg-[#4648d4] text-white font-bold shadow-sm'
                : 'text-[#464554] hover:bg-[#eff4ff]'
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('home', 'faq')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              currentTab === 'home' && activeSection === 'faq'
                ? 'bg-[#4648d4] text-white font-bold shadow-sm'
                : 'text-[#464554] hover:bg-[#eff4ff]'
            }`}
          >
            FAQ
          </button>

          {/* AI Copilot in Mobile Drawer (Admin Exclusive) */}
          {isAdmin && onOpenAIAgent && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAIAgent();
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm bg-linear-to-r from-[#4648d4] via-[#6366f1] to-[#ea580c] text-white flex items-center justify-between shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                <span>Insight AI Agent</span>
              </div>
              <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Admin Copilot
              </span>
            </button>
          )}

          {/* Admin CRM Option in Mobile Drawer */}
          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-[#eff4ff]">
              <button
                onClick={() => handleNavClick('ledger')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-between ${
                  currentTab === 'ledger'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800'
                }`}
              >
                <span>Operations CRM &amp; Ledger</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono">
                  Admin
                </span>
              </button>
            </div>
          )}
        </nav>

        {/* Bottom Drawer Actions */}
        <div className="pt-4 border-t border-[#eff4ff] space-y-2">
          {isAdmin ? (
            <button
              onClick={() => {
                onAdminLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 bg-rose-50 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Logout from Admin</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminLogin();
              }}
              className="w-full py-2.5 px-4 bg-[#eff4ff] text-[#464554] hover:text-[#4648d4] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-[#dce9ff]"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
