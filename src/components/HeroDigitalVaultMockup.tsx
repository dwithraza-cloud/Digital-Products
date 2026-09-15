import React, { useState } from 'react';
import { Product } from '../types';

interface HeroDigitalVaultMockupProps {
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onNavigateToCatalog?: () => void;
  isAdmin?: boolean;
  onNavigateToLedger?: () => void;
  onOpenAdminLogin?: () => void;
}

interface VaultItem {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  matchedStoreId?: string;
  renderIcon: () => React.ReactNode;
}

export const HeroDigitalVaultMockup: React.FC<HeroDigitalVaultMockupProps> = ({
  products = [],
  onSelectProduct,
  onNavigateToCatalog,
  isAdmin,
  onNavigateToLedger,
  onOpenAdminLogin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

  // 12 Vault Applications matching reference image
  const vaultItems: VaultItem[] = [
    {
      id: 'canva',
      name: 'Canva',
      subtitle: 'Design Anything',
      category: 'creative',
      matchedStoreId: 'canva',
      renderIcon: () => (
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#00c4cc] via-[#008fe3] to-[#7d2ae8] flex items-center justify-center shadow-sm">
          <span className="text-white font-extrabold italic text-xs sm:text-sm tracking-tight select-none font-serif">
            Canva
          </span>
        </div>
      ),
    },
    {
      id: 'netflix',
      name: 'Netflix',
      subtitle: 'Stream More',
      category: 'streaming',
      matchedStoreId: 'netflix',
      renderIcon: () => (
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#0e0e0e] flex items-center justify-center shadow-sm relative overflow-hidden">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
            <path d="M5 2H9.5V22H5V2Z" fill="#E50914" />
            <path d="M14.5 2H19V22H14.5V2Z" fill="#E50914" />
            <path
              d="M5 2L18.5 22H14L5 7.5V2Z"
              fill="#B81D24"
              style={{ filter: 'drop-shadow(2px 0 3px rgba(0,0,0,0.5))' }}
            />
          </svg>
        </div>
      ),
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      subtitle: 'Work Smarter',
      category: 'ai',
      matchedStoreId: 'chatgpt',
      renderIcon: () => (
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#10a37f] flex items-center justify-center shadow-sm p-1.5 sm:p-2">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.5 10.2a6 6 0 0 0-.5-4.2 6.1 6.1 0 0 0-5-3 5.9 5.9 0 0 0-4.3 1.2 6 6 0 0 0-4.3-1.2 6.1 6.1 0 0 0-5 3 6 6 0 0 0-.5 4.2 6.1 6.1 0 0 0-1.2 4.3 6 6 0 0 0 3 5 5.9 5.9 0 0 0 4.2.5 6 6 0 0 0 4.3 1.2 6.1 6.1 0 0 0 5-3 6 6 0 0 0 .5-4.2 6.1 6.1 0 0 0 1.2-4.3 6 6 0 0 0-2.4-4.7zm-8.8 11.2a4.4 4.4 0 0 1-2.9-.6l.1-.1 4.5-2.6a.8.8 0 0 0 .4-.7v-6.3l1.9 1.1v5.1a4.5 4.5 0 0 1-4 4.1zm-8.5-3.8a4.4 4.4 0 0 1-.7-2.9v-.2l4.5-2.6a.8.8 0 0 0 .4-.7V5l1.9 1.1v7.6a4.5 4.5 0 0 1-6.1 2.7zm-1.1-9a4.4 4.4 0 0 1 2.2-2.3l.2.1 4.5 2.6c.2.1.3.4.3.7v6.3l-1.9-1.1V9.7a4.5 4.5 0 0 1-5.3-2.1zm15.7 3.7l-4.5-2.6a.8.8 0 0 0-.8 0l-5.4 3.1 1.9 1.1 3.5-2 3.5 2v-1.6zm-1.8 7.4a4.4 4.4 0 0 1-2.2 2.3l-.2-.1-4.5-2.6a.8.8 0 0 0-.4-.7V12l1.9 1.1v5.1a4.5 4.5 0 0 1 5.4 2.1zm2.3-5.2a4.4 4.4 0 0 1 .7 2.9v.2l-4.5 2.6a.8.8 0 0 0-.4.7v5l-1.9-1.1v-7.6a4.5 4.5 0 0 1 6.1-2.7z" />
          </svg>
        </div>
      ),
    },
    {
      id: 'capcut',
      name: 'CapCut',
      subtitle: 'Edit Like a Pro',
      category: 'creative',
      matchedStoreId: 'capcut',
      renderIcon: () => (
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white border border-[#e2e8f0] flex items-center justify-center shadow-sm p-1.5 sm:p-2">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 32 32" fill="none">
            <path d="M5 9L13.5 13.5L5 18V9Z" fill="#000000" />
            <path d="M27 9L18.5 13.5L27 18V9Z" fill="#000000" />
            <path d="M5 23L13.5 18.5L5 14V23Z" fill="#000000" />
            <path d="M27 23L18.5 18.5L27 14V23Z" fill="#000000" />
          </svg>
        </div>
      ),
    },
    {
      id: 'kling',
      name: 'Kling',
      subtitle: 'AI Video Generation',
      category: 'ai',
      matchedStoreId: 'kling',
      renderIcon: () => (
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#090b14] flex items-center justify-center shadow-sm p-1.5 sm:p-2 relative">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="klingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="100%" stopColor="#0051ff" />
              </linearGradient>
            </defs>
            <circle
              cx="16"
              cy="16"
              r="10"
              stroke="url(#klingGrad)"
              strokeWidth="3.5"
              strokeDasharray="45 15"
              strokeLinecap="round"
            />
            <circle cx="16" cy="16" r="4" fill="#00f0ff" opacity="0.9" />
          </svg>
        </div>
      ),
    },
    {
      id: 'googlelabs',
      name: 'Google Labs',
      subtitle: 'Early Access AI',
      category: 'ai',
      matchedStoreId: 'googleflow',
      renderIcon: () => (
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white border border-[#e2e8f0] flex items-center justify-center shadow-sm p-1.5 sm:p-2">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="flaskLiquid" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff007f" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#00d2ff" />
              </linearGradient>
            </defs>
            <path
              d="M13 5H19M14 5V11L7.5 24C6.8 25.4 7.8 27 9.4 27H22.6C24.2 27 25.2 25.4 24.5 24L18 11V5"
              stroke="#2563eb"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 24L13.5 17C14.5 17.5 17.5 17.5 18.5 17L22 24C22.6 25 22 26 21 26H11C10 26 9.4 25 10 24Z"
              fill="url(#flaskLiquid)"
            />
          </svg>
        </div>
      ),
    },
    {
      id: 'primevideo',
      name: 'Prime Video',
      subtitle: 'Movies & More',
      category: 'streaming',
      matchedStoreId: 'prime',
      renderIcon: () => (
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#00172e] flex flex-col items-center justify-center shadow-sm p-1">
          <span className="text-white text-[9px] sm:text-[10px] font-bold tracking-tight leading-none">
            prime
          </span>
          <span className="text-white/90 text-[7px] sm:text-[8px] font-medium tracking-tight leading-none mt-0.5">
            video
          </span>
          <svg className="w-5 h-1.5 mt-0.5" viewBox="0 0 28 8" fill="none">
            <path
              d="M1 2C6 6 18 7 26 2"
              stroke="#00a8e1"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path d="M24 1.5L27 2L25 4.5" fill="#00a8e1" />
          </svg>
        </div>
      ),
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      subtitle: 'Voice Generation',
      category: 'ai',
      matchedStoreId: 'elevenlabs',
      renderIcon: () => (
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white border border-[#e2e8f0] flex items-center justify-center shadow-sm p-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 sm:w-2 h-4 sm:h-5 bg-black rounded-full" />
            <div className="w-1.5 sm:w-2 h-4 sm:h-5 bg-black rounded-full" />
          </div>
        </div>
      ),
    },
    {
      id: 'envato',
      name: 'Envato Elements',
      subtitle: 'Creative Assets',
      category: 'creative',
      matchedStoreId: 'envato',
      renderIcon: () => (
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#111418] flex items-center justify-center shadow-sm p-1.5 sm:p-2">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 32 32" fill="none">
            <path
              d="M23 7C14 7 8 13 8 21C8 25 11 27 15 27C21 27 26 21 26 12C26 8.5 24.8 7 23 7Z"
              fill="#82b440"
            />
            <path
              d="M14 26C10 24 10 20 12 16C14 12 18 10 23 8"
              stroke="#111418"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ),
    },
    {
      id: 'higgsfield',
      name: 'Higgsfield',
      subtitle: 'AI Visual Creation',
      category: 'ai',
      matchedStoreId: 'higgsfield',
      renderIcon: () => (
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#b7f92b] flex items-center justify-center shadow-sm p-1.5 sm:p-2">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 32 32" fill="none">
            <path
              d="M11 12C8.5 12 7 14 7 17C7 20 9 22 12 22C15 22 16 19 16 16M16 16C16 13 17 10 20 10C23 10 25 12 25 15C25 18 23.5 20 21 20M16 16V22"
              stroke="#0b0b0b"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ),
    },
    {
      id: 'grok',
      name: 'Grok',
      subtitle: 'Real-Time AI',
      category: 'ai',
      matchedStoreId: 'grok',
      renderIcon: () => (
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#09090b] flex items-center justify-center shadow-sm p-1.5 sm:p-2">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 32 32" fill="none">
            <path d="M8 24L20 8H24L12 24H8Z" fill="#FFFFFF" />
            <path d="M20 24L24 18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      ),
    },
    {
      id: 'more',
      name: 'More',
      subtitle: 'Coming Soon',
      category: 'all',
      matchedStoreId: undefined,
      renderIcon: () => (
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border-2 border-dashed border-[#bfdbfe] bg-[#f0f7ff] flex items-center justify-center shadow-sm">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-[#93c5fd] flex items-center justify-center text-[#2563eb]">
            <span className="material-symbols-outlined text-[15px] sm:text-[18px] font-bold">add</span>
          </div>
        </div>
      ),
    },
  ];

  const handleTileClick = (item: VaultItem) => {
    if (item.matchedStoreId && products.length > 0) {
      const found = products.find((p) => p.id.toLowerCase() === item.matchedStoreId?.toLowerCase());
      if (found && onSelectProduct) {
        onSelectProduct(found);
        return;
      }
    }
    if (onNavigateToCatalog) {
      onNavigateToCatalog();
    } else {
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredVaultItems = vaultItems.filter((it) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      it.name.toLowerCase().includes(q) ||
      it.subtitle.toLowerCase().includes(q) ||
      it.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative w-full max-w-[440px] mx-auto py-5 sm:py-7 select-none">
      {/* Ambient Backdrop Glowing Spheres and Orbital Line */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-indigo-200/25 via-sky-100/30 to-violet-200/25 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Subtle Orbital Track */}
      <svg
        className="absolute -top-3 -left-4 w-[110%] h-[110%] pointer-events-none -z-10 opacity-60"
        viewBox="0 0 600 600"
        fill="none"
      >
        <defs>
          <linearGradient id="vaultOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        <ellipse
          cx="300"
          cy="300"
          rx="270"
          ry="230"
          stroke="url(#vaultOrbitGrad)"
          strokeWidth="2"
          transform="rotate(-18 300 300)"
          strokeDasharray="7 5"
        />
      </svg>

      {/* 3D Sphere 1 (Top Left) */}
      <div
        className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full pointer-events-none z-10"
        style={{
          background: 'radial-gradient(circle at 35% 32%, #ffffff 0%, #c4b5fd 40%, #7c3aed 85%, #5b21b6 100%)',
          boxShadow: '0 8px 16px -2px rgba(124, 58, 237, 0.35)',
        }}
      />

      {/* 3D Sphere 2 (Mid Right) */}
      <div
        className="absolute top-1/2 -right-3 sm:-right-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full pointer-events-none z-10"
        style={{
          background: 'radial-gradient(circle at 35% 32%, #ffffff 0%, #c4b5fd 45%, #6366f1 85%, #4338ca 100%)',
          boxShadow: '0 6px 14px -2px rgba(99, 102, 241, 0.35)',
        }}
      />

      {/* 3D Sphere 3 (Bottom Left) */}
      <div
        className="absolute -bottom-3 left-8 w-5 h-5 sm:w-6 sm:h-6 rounded-full pointer-events-none z-10"
        style={{
          background: 'radial-gradient(circle at 35% 32%, #ffffff 0%, #c4b5fd 40%, #8b5cf6 85%, #6d28d9 100%)',
          boxShadow: '0 6px 12px -2px rgba(139, 92, 246, 0.3)',
        }}
      />

      {/* =========================================================================
          FLOATING SATELLITE CARDS (COMPACT PROPORTIONS)
      ========================================================================= */}

      {/* 1. TOP-LEFT BADGE: "100% Verified Premium Accounts" */}
      <div className="absolute -top-5 -left-2 sm:-top-6 sm:-left-4 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl border border-[#e5eeff] shadow-[0_8px_20px_rgba(70,72,212,0.1)] flex items-center gap-2 transition-transform hover:scale-105">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-[#3b82f6] to-[#6366f1] text-white flex items-center justify-center shadow-xs shrink-0">
          <span className="material-symbols-outlined text-[15px] sm:text-[17px]">verified</span>
        </div>
        <div className="text-left">
          <span className="block font-headline font-bold text-[10px] sm:text-[11px] text-[#0b1c30] leading-tight">
            100% Verified
          </span>
          <span className="text-[8px] sm:text-[9px] text-[#767586] font-medium leading-tight">
            Premium Accounts
          </span>
        </div>
      </div>

      {/* 2. TOP-RIGHT BADGE: "Instant Delivery Get access in minutes" */}
      <div className="absolute -top-5 -right-1 sm:-top-6 sm:-right-3 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl border border-[#e5eeff] shadow-[0_8px_20px_rgba(70,72,212,0.1)] flex items-center gap-2 transition-transform hover:scale-105">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#f5f3ff] text-[#7c3aed] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[16px] sm:text-[18px]">bolt</span>
        </div>
        <div className="text-left">
          <span className="block font-headline font-bold text-[10px] sm:text-[11px] text-[#0b1c30] leading-tight">
            Instant Delivery
          </span>
          <span className="text-[8px] sm:text-[9px] text-[#767586] font-medium leading-tight">
            Get access in minutes
          </span>
        </div>
      </div>

      {/* 3. MID-LEFT BADGE: "Top Digital Products All in one place" */}
      <div className="absolute top-[40%] -left-3 sm:-left-6 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#e5eeff] shadow-[0_8px_20px_rgba(70,72,212,0.1)] flex items-center gap-2 transition-transform hover:scale-105">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#6366f1] to-[#a855f7] text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[14px]">bar_chart</span>
        </div>
        <div className="text-left">
          <span className="block font-headline font-bold text-[10px] text-[#0b1c30] leading-tight whitespace-nowrap">
            Top Digital Products
          </span>
          <span className="text-[8px] text-[#767586] font-medium leading-tight whitespace-nowrap">
            All in one place
          </span>
        </div>
      </div>

      {/* 4. BOTTOM-LEFT BADGE: "Trusted by 10,000+ Users Safe. Fast. Reliable." */}
      <div className="absolute -bottom-5 -left-2 sm:-bottom-6 sm:-left-3 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl border border-[#e5eeff] shadow-[0_8px_20px_rgba(70,72,212,0.1)] flex items-center gap-2 transition-transform hover:scale-105">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[16px] sm:text-[17px]">groups</span>
        </div>
        <div className="text-left">
          <span className="block font-headline font-bold text-[10px] sm:text-[11px] text-[#0b1c30] leading-tight whitespace-nowrap">
            Trusted by 10,000+ Users
          </span>
          <span className="text-[8px] sm:text-[9px] text-[#767586] font-medium leading-tight whitespace-nowrap">
            Safe. Fast. Reliable.
          </span>
        </div>
      </div>

      {/* 5. BOTTOM-RIGHT BADGE: "Upgrade Your Digital Experience More Possibilities. One Vault." */}
      <div className="absolute -bottom-6 -right-1 sm:-bottom-7 sm:-right-3 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl border border-[#e5eeff] shadow-[0_8px_20px_rgba(70,72,212,0.1)] flex items-center gap-2 transition-transform hover:scale-105">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#eff4ff] text-[#4648d4] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[16px] sm:text-[17px]">workspace_premium</span>
        </div>
        <div className="text-left">
          <span className="block font-headline font-bold text-[10px] sm:text-[11px] text-[#0b1c30] leading-tight whitespace-nowrap">
            Upgrade Your Experience
          </span>
          <span className="text-[8px] sm:text-[9px] text-[#767586] font-medium leading-tight whitespace-nowrap">
            More Possibilities. One Vault.
          </span>
        </div>
      </div>

      {/* =========================================================================
          CENTRAL COMPACT BROWSER CARD: "DIGITAL VAULT"
      ========================================================================= */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#e2e8f0] shadow-[0_15px_45px_-10px_rgba(70,72,212,0.14),0_6px_16px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300">
        {/* --- Window Chrome Top Bar --- */}
        <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-b from-slate-50 to-white border-b border-[#edf2f7] flex items-center justify-between gap-2">
          {/* Window dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block shadow-xs" />
          </div>

          {/* Browser URL Bar */}
          <div className="flex-1 max-w-[170px] sm:max-w-[200px] mx-auto flex items-center justify-center gap-1 px-2.5 py-0.5 bg-[#f1f5f9] rounded-full border border-[#e2e8f0] text-[#64748b] text-[10px] sm:text-[11px] font-mono font-medium">
            <span className="material-symbols-outlined text-[12px] text-[#94a3b8]">lock</span>
            <span className="truncate">insightproducts.pk</span>
          </div>

          {/* Encrypted badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e6f7ef] text-[#0d824d] font-bold text-[9px] sm:text-[10px] shrink-0 border border-[#bbf0d7]">
            <span className="material-symbols-outlined text-[11px]">verified_user</span>
            <span>Secure</span>
          </div>
        </div>

        {/* --- Window Body Content --- */}
        <div className="p-3.5 sm:p-4 space-y-3.5 sm:space-y-4">
          {/* Header & Search */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white flex items-center justify-center shadow-xs shrink-0">
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">layers</span>
              </div>
              <div>
                <h3 className="font-headline font-extrabold text-sm sm:text-base text-[#0b1c30] tracking-tight leading-tight">
                  Digital Vault
                </h3>
                <p className="text-[10px] sm:text-[11px] text-[#767586] font-medium leading-tight">
                  Premium Tools for a Smarter You
                </p>
              </div>
            </div>

            {/* Quick Search */}
            <div className="relative w-28 sm:w-36">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-[13px] text-[#94a3b8]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-6 pr-2 py-1 rounded-lg border border-[#e2e8f0] bg-[#f8faff] text-[11px] text-[#0b1c30] placeholder-[#94a3b8] focus:outline-none focus:border-[#4648d4] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0b1c30] text-[10px] font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* --- 4x3 Grid of 12 Application Cards --- */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {filteredVaultItems.map((item) => {
              const isHovered = activeHoverId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTileClick(item)}
                  onMouseEnter={() => setActiveHoverId(item.id)}
                  onMouseLeave={() => setActiveHoverId(null)}
                  className={`group relative p-1.5 rounded-xl flex flex-col items-center text-center transition-all duration-150 cursor-pointer ${
                    isHovered
                      ? 'bg-[#f4f7fc] scale-[1.03] shadow-xs'
                      : 'bg-transparent hover:bg-[#f8faff]'
                  }`}
                  title={`${item.name} - ${item.subtitle}`}
                >
                  {/* Icon */}
                  <div className="relative transition-transform duration-150 group-hover:scale-105">
                    {item.renderIcon()}
                  </div>

                  {/* App Name */}
                  <span className="mt-1 font-headline font-bold text-[11px] text-[#0b1c30] group-hover:text-[#4648d4] transition-colors truncate max-w-full leading-tight">
                    {item.name}
                  </span>

                  {/* App Subtitle */}
                  <span className="text-[8px] sm:text-[9px] text-[#767586] truncate max-w-full leading-none mt-0.5 font-medium">
                    {item.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer Quick Action Bar inside the Vault */}
          <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] text-[#767586]">
            <span className="flex items-center gap-1 font-medium text-[10px] sm:text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              100% Official Licenses
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToCatalog}
                className="font-bold text-[#4648d4] hover:text-[#6063ee] text-[11px] flex items-center gap-0.5 transition-colors"
              >
                <span>Full Catalog</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </button>

              {isAdmin ? (
                <button
                  onClick={onNavigateToLedger}
                  className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200"
                >
                  CRM
                </button>
              ) : (
                <button
                  onClick={onOpenAdminLogin}
                  className="p-0.5 rounded text-[#94a3b8] hover:text-[#4648d4] transition-colors"
                  title="Admin Access"
                >
                  <span className="material-symbols-outlined text-[13px]">lock</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
