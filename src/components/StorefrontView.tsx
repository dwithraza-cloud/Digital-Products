import React, { useState } from 'react';
import { Product, PaymentSettings } from '../types';
import { PRODUCTS } from '../data/mockData';
import { HeroDigitalVaultMockup } from './HeroDigitalVaultMockup';

interface StorefrontViewProps {
  products?: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateToCheckout: () => void;
  onNavigateToLedger: () => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  paymentSettings?: PaymentSettings;
  onOpenCustomerSalesAgent?: () => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  products = PRODUCTS,
  onSelectProduct,
  onNavigateToCheckout,
  onNavigateToLedger,
  isAdmin = false,
  onOpenAdminLogin,
  paymentSettings,
  onOpenCustomerSalesAgent,
}) => {
  const waClean = paymentSettings?.whatsappSupportNumber?.replace(/\D/g, '') || '923145338340';
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'creative' | 'streaming' | string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const activeProducts = products || PRODUCTS;

  const filteredProducts = activeProducts.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const faqs = [
    {
      q: 'How quickly will I receive my license after submitting payment proof?',
      a: 'Over 92% of orders are dispatched within 5 to 15 minutes during active hours (10:00 AM to 1:00 AM PKT). Once your payment slip is automatically OCR-matched against Meezan Bank, JazzCash, or Easypaisa ledger, your credentials or official invite link arrive instantly on WhatsApp and Email.',
    },
    {
      q: 'Which payment rails are accepted in Pakistan?',
      a: 'We accept direct online bank transfer to Meezan Bank Ltd (Islamic Banking verified escrow with 1-Link integration), as well as direct wallet transfers via JazzCash and Easypaisa. There are zero additional transaction fees.',
    },
    {
      q: 'What if a license key or subscription has an issue?',
      a: 'Every single product from Insight Products comes backed by our 100% Replacement Guarantee. If an account, domain, or key experiences any downtime or interruption during your purchased term, our human WhatsApp team will replace or restore it with a fresh key within minutes.',
    },
    {
      q: 'Are these shared accounts or private individual credentials?',
      a: 'Products like Canva Pro and Adobe CC are activated directly onto your personal email address via official educator/enterprise domain teams. Streaming products like Netflix Premium include private, PIN-locked 4K profiles. ChatGPT Plus and AI tools are clean, private passes with dedicated quotas.',
    },
    {
      q: 'Can I purchase bulk licenses for an agency, software house, or student batch?',
      a: 'Yes! We support custom wholesale seat bundles for universities, agencies, and development teams with consolidated monthly invoicing and dedicated vendor attribution.',
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
        {/* Glow gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#6063ee]/15 to-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-48 right-10 w-[300px] h-[300px] bg-[#6ffbbe]/10 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="max-w-[1280px] mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#eff4ff] border border-[#dce9ff] rounded-full shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3.5" />
                <span className="text-xs font-bold text-[#4648d4] tracking-wide uppercase">
                  Fast &amp; Verified Digital Vault
                </span>
              </div>

              <h1 className="font-headline font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#0b1c30] tracking-tight leading-[1.12]">
                Premium Digital Products,{' '}
                <span className="text-[#4648d4]">Made Simple.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#464554] max-w-xl leading-relaxed">
                Get top-tier AI generators, creative suites, and 4K streaming accounts —
                quickly, securely, and affordably. Backed by Meezan, JazzCash, and Easypaisa
                instant verification with zero markup fraud.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#catalog"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#4648d4] hover:bg-[#6063ee] text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(70,72,212,0.28)] transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span className="material-symbols-outlined text-[20px]">explore</span>
                  <span>Explore Verified Products</span>
                </a>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#eff4ff] text-[#0b1c30] font-bold rounded-2xl border border-[#dce9ff] shadow-sm transition-all hover:border-[#4648d4]/40"
                >
                  <span className="material-symbols-outlined text-[20px]">help_outline</span>
                  <span>How It Works</span>
                </a>

                {onOpenCustomerSalesAgent && (
                  <button
                    onClick={onOpenCustomerSalesAgent}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-linear-to-r from-[#0284c7] to-[#0369a1] hover:brightness-110 text-white font-bold rounded-2xl shadow-[0_4px_14px_rgba(2,132,199,0.25)] transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#38bdf8]">smart_toy</span>
                    <span>Ask AI Sales Assistant</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </button>
                )}
              </div>

              {/* Trust badges */}
              <div className="pt-6 border-t border-[#e5eeff] grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <div className="font-headline font-extrabold text-xl sm:text-2xl text-[#0b1c30]">
                    10,000+
                  </div>
                  <div className="text-xs text-[#767586] font-medium">Delivered Orders</div>
                </div>
                <div>
                  <div className="font-headline font-extrabold text-xl sm:text-2xl text-[#006c49]">
                    4.9 / 5
                  </div>
                  <div className="text-xs text-[#767586] font-medium">User Satisfaction</div>
                </div>
                <div>
                  <div className="font-headline font-extrabold text-xl sm:text-2xl text-[#4648d4]">
                    ~15 Min
                  </div>
                  <div className="text-xs text-[#767586] font-medium">Average Delivery</div>
                </div>
              </div>
            </div>

            {/* Right Hero: Digital Vault Mockup with 3D Spheres & Floating Badges */}
            <div className="lg:col-span-5 relative">
              <HeroDigitalVaultMockup
                products={activeProducts}
                onSelectProduct={(prod) => {
                  onSelectProduct(prod);
                  onNavigateToCheckout();
                }}
                onNavigateToCatalog={() => {
                  const el = document.getElementById('catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                isAdmin={isAdmin}
                onNavigateToLedger={onNavigateToLedger}
                onOpenAdminLogin={onOpenAdminLogin}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Verified Products Catalog */}
      <section id="catalog" className="py-16 bg-[#eff4ff]/60 border-y border-[#dce9ff]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#dce9ff] rounded-full text-xs font-bold text-[#4648d4] uppercase tracking-wider mb-2 shadow-xs">
                <span>⚡ Curated Verified Software Passes</span>
              </div>
              <h2 className="font-headline font-bold text-2xl sm:text-3xl md:text-4xl text-[#0b1c30]">
                Verified Digital Licenses &amp; Passes
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-[#464554] mt-1 max-w-xl">
                Pick your required tool. All products feature instant WhatsApp credentials delivery
                and replacement protection.
              </p>
            </div>

            {/* Category Filter Pills (Mobile scrollable) */}
            <div className="flex overflow-x-auto pb-1 sm:pb-0 gap-2 p-1.5 bg-white rounded-2xl border border-[#dce9ff] shadow-sm scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-[#4648d4] text-white shadow-sm'
                    : 'text-[#464554] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
                }`}
              >
                All ({activeProducts.length})
              </button>
              <button
                onClick={() => setSelectedCategory('ai')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === 'ai'
                    ? 'bg-[#4648d4] text-white shadow-sm'
                    : 'text-[#464554] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
                }`}
              >
                AI Tools ({activeProducts.filter((p) => p.category === 'ai').length})
              </button>
              <button
                onClick={() => setSelectedCategory('creative')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === 'creative'
                    ? 'bg-[#4648d4] text-white shadow-sm'
                    : 'text-[#464554] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
                }`}
              >
                Creative ({activeProducts.filter((p) => p.category === 'creative').length})
              </button>
              <button
                onClick={() => setSelectedCategory('streaming')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === 'streaming'
                    ? 'bg-[#4648d4] text-white shadow-sm'
                    : 'text-[#464554] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
                }`}
              >
                Streaming ({activeProducts.filter((p) => p.category === 'streaming').length})
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-3xl border border-[#e5eeff] p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Card Visual Header with Real Product Image */}
                  <div className="w-full h-44 rounded-2xl relative overflow-hidden mb-4 border border-[#dce9ff] bg-[#0b1c30] shadow-xs">
                    {product.imageUrl ? (
                      <>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Dynamic Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30] via-[#0b1c30]/40 to-black/30" />
                      </>
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${product.accentGradient}`} />
                    )}

                    {/* Overlaid Badges & Reference */}
                    <div className="absolute inset-0 p-3 flex flex-col justify-between text-white pointer-events-none">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold tracking-wide border border-white/15 shadow-sm text-white">
                          <span className="material-symbols-outlined text-[13px] text-amber-300">
                            {product.badgeIcon}
                          </span>
                          <span>{product.badge}</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white shadow-xs">
                          {product.ref}
                        </span>
                      </div>

                      <div className="flex items-end justify-between">
                        {/* Brand logo pill */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-md">
                            <span className={`material-symbols-outlined text-[18px] ${product.iconColor}`}>
                              {product.icon}
                            </span>
                          </div>
                          {product.brandLogo && (
                            <span className="text-[10px] font-extrabold tracking-wider bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-white">
                              {product.brandLogo}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold bg-[#4648d4] text-white px-2 py-0.5 rounded-md shadow-sm">
                          {product.durationTag}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Product Title & Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#4648d4]">
                        {product.categoryLabel}
                      </span>
                      <span className="text-xs text-[#767586] font-medium">{product.tag}</span>
                    </div>

                    <h3 className="font-headline font-bold text-lg text-[#0b1c30] group-hover:text-[#4648d4] transition-colors leading-snug">
                      {product.name}
                    </h3>

                    <p className="text-xs text-[#464554] line-clamp-2 leading-relaxed">
                      {product.desc || product.longDesc || product.shortDesc || 'Instant digital subscription pass with warranty.'}
                    </p>
                  </div>
                </div>

                {/* Price & Buy Now CTA */}
                <div className="pt-5 mt-4 border-t border-[#eff4ff] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-[#767586]">Instant Checkout</div>
                    <div className="font-headline font-extrabold text-xl text-[#0b1c30]">
                      {product.formattedPrice}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectProduct(product);
                      onNavigateToCheckout();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#4648d4] group-hover:bg-[#6063ee] text-white text-xs font-bold rounded-xl shadow-[0_4px_12px_rgba(70,72,212,0.22)] transition-all hover:scale-105 active:scale-95"
                  >
                    <span>Buy Now</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works In 3 Steps */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#eff4ff] border border-[#dce9ff] rounded-full text-xs font-bold text-[#4648d4] uppercase tracking-wider">
              Fast Escrow Architecture
            </div>
            <h2 className="font-headline font-bold text-3xl sm:text-4xl text-[#0b1c30]">
              How Insight Products Works in 3 Simple Steps
            </h2>
            <p className="text-sm sm:text-base text-[#464554]">
              Zero guesswork. Transparent Pakistani bank transfers with automated OCR receipt
              validation and direct WhatsApp fulfillment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-[#f8f9ff] border border-[#e5eeff] relative space-y-4 hover:border-[#4648d4]/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#4648d4] text-white flex items-center justify-center font-headline font-bold text-xl shadow-md">
                1
              </div>
              <h3 className="font-headline font-bold text-xl text-[#0b1c30]">
                Choose Your Digital Tool
              </h3>
              <p className="text-sm text-[#464554] leading-relaxed">
                Select from our curated list of 10 essential software tools, AI passes, and 4K
                streaming platforms at direct wholesale pricing.
              </p>
              <div className="text-xs font-semibold text-[#4648d4] flex items-center gap-1 pt-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>No recurring credit card required</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-[#f8f9ff] border border-[#e5eeff] relative space-y-4 hover:border-[#4648d4]/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#006c49] text-white flex items-center justify-center font-headline font-bold text-xl shadow-md">
                2
              </div>
              <h3 className="font-headline font-bold text-xl text-[#0b1c30]">
                Transfer &amp; Upload Slip
              </h3>
              <p className="text-sm text-[#464554] leading-relaxed">
                Send the exact PKR amount directly to our Meezan Bank corporate account, JazzCash,
                or Easypaisa. Upload your transaction screenshot on the secure checkout form.
              </p>
              <div className="text-xs font-semibold text-[#006c49] flex items-center gap-1 pt-2">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>1-Link &amp; Meezan instant match</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-[#f8f9ff] border border-[#e5eeff] relative space-y-4 hover:border-[#4648d4]/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#6063ee] text-white flex items-center justify-center font-headline font-bold text-xl shadow-md">
                3
              </div>
              <h3 className="font-headline font-bold text-xl text-[#0b1c30]">
                Instant WhatsApp Delivery
              </h3>
              <p className="text-sm text-[#464554] leading-relaxed">
                Our automated OCR matches the transaction reference within 90 seconds. Your login
                credentials or official invitation link are dispatched straight to your WhatsApp and Email.
              </p>
              <div className="text-xs font-semibold text-[#6063ee] flex items-center gap-1 pt-2">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>15-minute SLA delivery guarantee</span>
              </div>
            </div>
          </div>

          {/* Guarantee Banner */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#4648d4] via-[#6063ee] to-[#4338ca] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[32px] text-[#6ffbbe]">
                  verified_user
                </span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-xl">100% Replacement Guarantee</h4>
                <p className="text-sm text-white/80 max-w-xl">
                  If your subscription stops functioning at any time within your validity period, we
                  replace it immediately with fresh verified credentials. Full replacement guarantee.
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToCheckout}
              className="px-6 py-3.5 bg-white text-[#4648d4] hover:bg-[#f8f9ff] font-bold text-sm rounded-2xl shadow-md shrink-0 transition-all hover:scale-105 active:scale-95"
            >
              Order Now with Escrow
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#eff4ff]/60 border-t border-[#dce9ff]">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#dce9ff] rounded-full text-xs font-bold text-[#4648d4] uppercase tracking-wider">
              Pakistani Community Feedback
            </div>
            <h2 className="font-headline font-bold text-3xl sm:text-4xl text-[#0b1c30]">
              Trusted by 10,000+ Creators &amp; Engineers
            </h2>
            <p className="text-sm sm:text-base text-[#464554]">
              Read how freelancers, agencies, and university students rely on Insight Products daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#e5eeff] shadow-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {'★'.repeat(5)}
              </div>
              <p className="text-sm text-[#464554] leading-relaxed italic">
                "Bought Canva Pro and ChatGPT Plus through Meezan Bank transfer. Uploaded the
                receipt and had the login credentials on my WhatsApp in literally 4 minutes.
                Zero hassle."
              </p>
              <div className="pt-2 border-t border-[#eff4ff] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e4e0f5] flex items-center justify-center font-bold text-sm text-[#4648d4]">
                  FA
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0b1c30]">Farhan Ahmed</div>
                  <div className="text-xs text-[#767586]">AI Developer • Lahore</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#e5eeff] shadow-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {'★'.repeat(5)}
              </div>
              <p className="text-sm text-[#464554] leading-relaxed italic">
                "Our design studio in Faisalabad relies on Adobe CC and CapCut Pro. Whenever we need
                new member invites, Insight Products provides authentic edu/agency seats with immediate
                support."
              </p>
              <div className="pt-2 border-t border-[#eff4ff] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#d3e4fe] flex items-center justify-center font-bold text-sm text-[#4648d4]">
                  SZ
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0b1c30]">Syeda Zainab</div>
                  <div className="text-xs text-[#767586]">Studio Lead • Faisalabad</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#e5eeff] shadow-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {'★'.repeat(5)}
              </div>
              <p className="text-sm text-[#464554] leading-relaxed italic">
                "Kling AI and Higgsfield credits are super hard to buy without international cards in
                Pakistan. Insight Products solves this seamlessly using direct JazzCash payments."
              </p>
              <div className="pt-2 border-t border-[#eff4ff] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e1e0ff] flex items-center justify-center font-bold text-sm text-[#4648d4]">
                  BK
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0b1c30]">Bilal Khan</div>
                  <div className="text-xs text-[#767586]">Video Producer • Islamabad</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-[840px] mx-auto px-5 lg:px-8">
          <div className="text-center mb-14 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#eff4ff] border border-[#dce9ff] rounded-full text-xs font-bold text-[#4648d4] uppercase tracking-wider">
              Clarifications &amp; Assurance
            </div>
            <h2 className="font-headline font-bold text-3xl sm:text-4xl text-[#0b1c30]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-[#464554]">
              Everything you need to know about payment validation and subscription activation.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#e5eeff] bg-[#f8f9ff] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-headline font-bold text-[#0b1c30] text-base hover:text-[#4648d4] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span
                      className={`material-symbols-outlined text-[#4648d4] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-[#464554] leading-relaxed border-t border-[#e5eeff]/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* WhatsApp Direct Banner */}
          <div className="mt-12 p-6 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#006c49] text-[28px]">
                support_agent
              </span>
              <div>
                <h5 className="font-headline font-bold text-sm text-[#0b1c30]">
                  Still have a question?
                </h5>
                <p className="text-xs text-[#464554]">
                  Speak directly to a human support agent on WhatsApp.
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/${waClean}?text=Hi%20Insight%20Products%20Support,%20I%20have%20a%20question%20regarding%20licenses`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-[#006c49] hover:bg-[#00885d] text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
