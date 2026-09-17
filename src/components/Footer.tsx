import React from 'react';
import { PaymentSettings } from '../types';

interface FooterProps {
  onNavigate: (tab: 'home' | 'checkout' | 'ledger', anchorId?: string) => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  paymentSettings?: PaymentSettings;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  isAdmin = false,
  onOpenAdminLogin,
  paymentSettings,
}) => {
  const waNumberClean = paymentSettings?.whatsappSupportNumber?.replace(/\D/g, '') || '923145338340';
  const waDisplay = paymentSettings?.whatsappDisplay || '0314 5338340';
  return (
    <footer className="w-full border-t border-[#dce9ff] bg-[#eff4ff] text-[#464554] mt-20">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                alt="Insight Products Logo"
                className="h-9 w-9 rounded-xl object-contain shadow-sm"
                src="/logo.svg"
              />
              <span className="font-headline font-bold text-2xl text-[#0b1c30]">
                Insight <span className="text-[#ea580c]">Products</span>
              </span>
            </div>
            <p className="text-sm text-[#464554] max-w-sm leading-relaxed">
              Curated digital licenses, instant activation tools, and reliable subscription
              fulfillment for Pakistan's designers, developers, researchers, and creators.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-[#dce9ff] text-xs font-semibold text-[#006c49]">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                256-Bit SSL Encrypted
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-[#dce9ff] text-xs font-semibold text-[#4648d4]">
                <span className="material-symbols-outlined text-[16px]">shield</span>
                1-Link Verified Escrow
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-headline font-bold text-sm text-[#0b1c30] uppercase tracking-wider">
              Top Catalogs
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('checkout')}
                  className="hover:text-[#4648d4] transition-colors"
                >
                  ChatGPT Plus
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('checkout')}
                  className="hover:text-[#4648d4] transition-colors"
                >
                  Canva Pro Lifetime
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('checkout')}
                  className="hover:text-[#4648d4] transition-colors"
                >
                  Adobe CC All Apps
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('checkout')}
                  className="hover:text-[#4648d4] transition-colors"
                >
                  CapCut Pro Desktop
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('checkout')}
                  className="hover:text-[#4648d4] transition-colors"
                >
                  Kling &amp; Higgsfield AI
                </button>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="font-headline font-bold text-sm text-[#0b1c30] uppercase tracking-wider">
              Platform &amp; Flow
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home', 'how-it-works')}
                  className="hover:text-[#4648d4] transition-colors"
                >
                  How Verification Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('checkout')}
                  className="hover:text-[#4648d4] transition-colors"
                >
                  Payment Proof Upload
                </button>
              </li>
              <li>
                {isAdmin ? (
                  <button
                    onClick={() => onNavigate('ledger')}
                    className="hover:text-[#4648d4] transition-colors flex items-center gap-1.5"
                  >
                    <span>Operations Ledger</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                      Admin Active
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAdminLogin}
                    className="hover:text-[#4648d4] transition-colors flex items-center gap-1.5 text-xs text-[#767586]"
                  >
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    <span>Admin Portal</span>
                  </button>
                )}
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home', 'faq')}
                  className="hover:text-[#4648d4] transition-colors"
                >
                  Replacement Guarantee
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="font-headline font-bold text-sm text-[#0b1c30] uppercase tracking-wider">
              Human Support
            </h4>
            <p className="text-xs text-[#464554] leading-relaxed">
              Active WhatsApp dispatch desk operating 10:00 AM - 1:00 AM PKT daily.
            </p>
            <a
              href={`https://wa.me/${waNumberClean}?text=Hi%20Insight%20Products%20Support,%20I%20have%20an%20order%20inquiry`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#006c49] hover:bg-[#00885d] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>{waDisplay}</span>
            </a>
            <div className="text-[11px] text-[#767586] pt-1">
              Average response time: &lt; 5 minutes
            </div>
          </div>
        </div>

        <div className="pt-10 mt-10 border-t border-[#dce9ff] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#767586]">
          <p>© {new Date().getFullYear()} Insight Products. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Delivery SLA</span>
            <span>Bank Reconciliation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
