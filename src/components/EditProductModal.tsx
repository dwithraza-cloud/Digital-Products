import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null; // null means adding a new product
  product?: Product | null; // alias for productToEdit
  onSaveProduct?: (savedProduct: Product) => void;
  onSave?: (savedProduct: Product) => void; // alias for onSaveProduct
  onDeleteProduct?: (productId: string) => void;
  onDelete?: (productId: string) => void; // alias for onDeleteProduct
}

const PRESET_IMAGES = [
  {
    name: 'Netflix 4K UHD',
    url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80',
    brand: 'NETFLIX',
    category: 'streaming',
    icon: 'movie',
    color: 'text-rose-400',
    gradient: 'from-rose-950 via-slate-900 to-black',
  },
  {
    name: 'Amazon Prime Video',
    url: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&auto=format&fit=crop&q=80',
    brand: 'PRIME',
    category: 'streaming',
    icon: 'live_tv',
    color: 'text-sky-400',
    gradient: 'from-sky-950 via-blue-900 to-slate-950',
  },
  {
    name: 'ChatGPT Plus (GPT-4o)',
    url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    brand: 'OPENAI',
    category: 'ai',
    icon: 'psychology',
    color: 'text-emerald-400',
    gradient: 'from-emerald-950 via-teal-900 to-slate-950',
  },
  {
    name: 'Adobe Creative Cloud',
    url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&auto=format&fit=crop&q=80',
    brand: 'ADOBE',
    category: 'creative',
    icon: 'brush',
    color: 'text-red-400',
    gradient: 'from-red-950 via-amber-900 to-slate-950',
  },
  {
    name: 'Claude 3.5 Sonnet Pro',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    brand: 'ANTHROPIC',
    category: 'ai',
    icon: 'cognition',
    color: 'text-amber-400',
    gradient: 'from-amber-950 via-orange-950 to-slate-950',
  },
  {
    name: 'Midjourney v6.1 Pro',
    url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80',
    brand: 'MIDJOURNEY',
    category: 'ai',
    icon: 'auto_awesome',
    color: 'text-purple-400',
    gradient: 'from-purple-950 via-indigo-950 to-slate-950',
  },
  {
    name: 'Canva Pro Enterprise',
    url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80',
    brand: 'CANVA',
    category: 'creative',
    icon: 'view_quilt',
    color: 'text-cyan-400',
    gradient: 'from-cyan-950 via-blue-900 to-slate-950',
  },
  {
    name: 'CapCut Pro Desktop',
    url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    brand: 'CAPCUT',
    category: 'creative',
    icon: 'video_settings',
    color: 'text-blue-400',
    gradient: 'from-blue-950 via-indigo-950 to-slate-950',
  },
  {
    name: 'Spotify Premium Individual',
    url: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=800&auto=format&fit=crop&q=80',
    brand: 'SPOTIFY',
    category: 'streaming',
    icon: 'headphones',
    color: 'text-emerald-400',
    gradient: 'from-emerald-950 via-green-950 to-black',
  },
  {
    name: 'YouTube Premium Family/Ind',
    url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
    brand: 'YOUTUBE',
    category: 'streaming',
    icon: 'smart_display',
    color: 'text-rose-400',
    gradient: 'from-rose-950 via-red-950 to-black',
  },
  {
    name: 'GitHub Copilot Business',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    brand: 'GITHUB',
    category: 'ai',
    icon: 'terminal',
    color: 'text-violet-400',
    gradient: 'from-violet-950 via-slate-900 to-black',
  },
];

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  product,
  onSaveProduct,
  onSave,
  onDeleteProduct,
  onDelete,
}) => {
  const activeProduct = productToEdit !== undefined ? productToEdit : (product !== undefined ? product : null);
  const isEditMode = Boolean(activeProduct && activeProduct.name && activeProduct.name.trim().length > 0);

  // Form Fields State
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [price, setPrice] = useState(999);
  const [unitCost, setUnitCost] = useState(300);
  const [refCode, setRefCode] = useState('#TX-NEW');
  const [category, setCategory] = useState<'ai' | 'creative' | 'streaming' | string>('ai');
  const [categoryLabel, setCategoryLabel] = useState('AI Intelligence');
  const [tag, setTag] = useState('Official Access');
  const [badge, setBadge] = useState('⚡ Fast Delivery');
  const [badgeIcon, setBadgeIcon] = useState('bolt');
  const [desc, setDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [durationTag, setDurationTag] = useState('1-Month Pass');
  const [targetLabel, setTargetLabel] = useState('For Digital Professionals');
  const [deliveryNote, setDeliveryNote] = useState('Instant automated invite delivery');
  const [vendorName, setVendorName] = useState('GlobalKeyHub_NG');
  const [imageUrl, setImageUrl] = useState('');
  const [brandLogo, setBrandLogo] = useState('');
  const [icon, setIcon] = useState('smart_toy');
  const [iconColor, setIconColor] = useState('text-emerald-400');
  const [accentGradient, setAccentGradient] = useState('from-[#064e3b] via-[#065f46] to-[#022c22]');
  const [featureInput, setFeatureInput] = useState('');
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'pricing' | 'images'>('details');

  // Load product data on edit mode or populate defaults for new product
  useEffect(() => {
    if (activeProduct && activeProduct.name && activeProduct.name.trim().length > 0) {
      setName(activeProduct.name || '');
      setShortName(activeProduct.shortName || '');
      setPrice(activeProduct.price || 0);
      setUnitCost(activeProduct.unitCost ?? activeProduct.vendorCost ?? 0);
      setRefCode(activeProduct.ref || `#TX-${Math.floor(1000 + Math.random() * 9000)}`);
      setCategory(activeProduct.category || 'ai');
      setCategoryLabel(activeProduct.categoryLabel || 'AI Intelligence');
      setTag(activeProduct.tag || 'Instant License');
      setBadge(activeProduct.badge || 'Verified Pass');
      setBadgeIcon(activeProduct.badgeIcon || 'verified');
      setDesc(activeProduct.desc || activeProduct.shortDesc || '');
      setLongDesc(activeProduct.longDesc || activeProduct.desc || activeProduct.shortDesc || '');
      setDurationTag(activeProduct.durationTag || '1-Month Access');
      setTargetLabel(activeProduct.targetLabel || 'For Creators & Teams');
      setDeliveryNote(activeProduct.deliveryNote || 'Delivered to WhatsApp & Email');
      setVendorName(activeProduct.vendorName || 'DirectWholesale_PK');
      setImageUrl(activeProduct.imageUrl || '');
      setBrandLogo(activeProduct.brandLogo || '');
      setIcon(activeProduct.icon || 'smart_toy');
      setIconColor(activeProduct.iconColor || 'text-emerald-400');
      setAccentGradient(activeProduct.accentGradient || 'from-emerald-950 via-slate-900 to-black');
      setFeaturesList(
        activeProduct.features && activeProduct.features.length > 0
          ? activeProduct.features
          : [
              '100% Replacement Warranty included',
              'Fast delivery via WhatsApp and Email',
              'Official 24/7 technical support desk',
            ]
      );
    } else {
      // New product defaults
      const randomRef = `#TX-${Math.floor(1000 + Math.random() * 9000)}`;
      setName('');
      setShortName('');
      setPrice(1200);
      setUnitCost(450);
      setRefCode(randomRef);
      setCategory('ai');
      setCategoryLabel('AI & Neural Tools');
      setTag('Official License');
      setBadge('🚀 Instant Auto-Invite');
      setBadgeIcon('bolt');
      setDesc('Full private subscription with complete features and warranty.');
      setLongDesc('Direct high-tier subscription activated officially with zero downtime guarantee.');
      setDurationTag('1-Month Access');
      setTargetLabel('For Professionals & Creators');
      setDeliveryNote('Delivered to WhatsApp & Email within 5-15 mins');
      setVendorName('GlobalKeyHub_NG');
      setImageUrl('https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80');
      setBrandLogo('PRO');
      setIcon('auto_awesome');
      setIconColor('text-emerald-400');
      setAccentGradient('from-emerald-950 via-teal-900 to-slate-950');
      setFeaturesList([
        'Private credentials / Direct email invite',
        'Guaranteed uptime with 100% replacement warranty',
        '24/7 dedicated WhatsApp support desk',
      ]);
    }
  }, [productToEdit, product, isOpen]);

  if (!isOpen) return null;

  // Margin calculation
  const profit = Math.max(0, price - unitCost);
  const marginPercent = price > 0 ? ((profit / price) * 100).toFixed(1) : '0';

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeaturesList([...featuresList, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_IMAGES[0]) => {
    setImageUrl(preset.url);
    if (!name) setName(preset.name);
    if (!shortName) setShortName(preset.name.split(' ')[0]);
    if (!brandLogo) setBrandLogo(preset.brand);
    setCategory(preset.category);
    setIcon(preset.icon);
    setIconColor(preset.color);
    setAccentGradient(preset.gradient);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product name');
      return;
    }

    const productId = (activeProduct && activeProduct.id)
      ? activeProduct.id
      : name.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now().toString().slice(-4);

    const savedProduct: Product = {
      ...(activeProduct || {}),
      id: productId,
      name: name.trim(),
      shortName: shortName.trim() || name.trim().split(' ')[0],
      price: Number(price) || 0,
      formattedPrice: `Rs ${(Number(price) || 0).toLocaleString()}`,
      ref: refCode.trim() || (activeProduct?.ref || '#TX-PROD'),
      category,
      categoryLabel: categoryLabel.trim() || 'Software & Tools',
      tag: tag.trim() || 'Active License',
      badge: badge.trim() || '⚡ Verified',
      badgeIcon: badgeIcon.trim() || 'verified',
      desc: desc.trim() || longDesc.trim() || 'Official digital subscription pass.',
      shortDesc: desc.trim() || 'Instant digital credentials with warranty',
      longDesc: longDesc.trim() || desc.trim(),
      icon,
      targetLabel: targetLabel.trim() || 'For Digital Creators',
      deliveryNote: deliveryNote.trim() || 'Instant Delivery via WhatsApp',
      accentGradient: accentGradient || activeProduct?.accentGradient || 'from-[#4648d4] to-[#6063ee]',
      iconColor: iconColor || activeProduct?.iconColor || 'text-emerald-400',
      durationTag: durationTag.trim() || '1-Month',
      vendorName: vendorName.trim() || 'DirectWholesale_PK',
      unitCost: Number(unitCost) || 0,
      vendorCost: Number(unitCost) || 0,
      imageUrl: imageUrl.trim() || undefined,
      brandLogo: brandLogo.trim().toUpperCase() || undefined,
      features: featuresList.length > 0 ? featuresList : (activeProduct?.features || ['100% Replacement Warranty', 'Fast delivery via WhatsApp']),
      isActive: activeProduct?.isActive !== undefined ? activeProduct.isActive : true,
    };

    if (onSaveProduct) {
      onSaveProduct(savedProduct);
    }
    if (onSave) {
      onSave(savedProduct);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0b1c30]/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#e5eeff] w-full max-w-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#0b1c30] to-[#1e293b] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[22px]">
                {isEditMode ? 'edit_note' : 'add_box'}
              </span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-base sm:text-lg text-white">
                {isEditMode ? `Edit Product: ${activeProduct?.name}` : 'Add New Digital Product to Store'}
              </h2>
              <p className="text-xs text-white/70">
                Configure pricing, descriptions, wholesale cost, and product cover images.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab Navigation for clean mobile UX */}
        <div className="flex border-b border-[#e5eeff] bg-[#f8f9ff] px-4 pt-2 gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'details'
                ? 'bg-white text-[#4648d4] border-t-2 border-x border-[#4648d4] shadow-xs'
                : 'text-[#464554] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>Product Details &amp; Info</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'bg-white text-[#4648d4] border-t-2 border-x border-[#4648d4] shadow-xs'
                : 'text-[#464554] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">payments</span>
            <span>Pricing &amp; Margins</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'images'
                ? 'bg-white text-[#4648d4] border-t-2 border-x border-[#4648d4] shadow-xs'
                : 'text-[#464554] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">image</span>
            <span>Cover Image &amp; Visuals</span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: PRODUCT DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Product Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Product Full Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Netflix Premium 4K UHD (Private Screen)"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-semibold text-[#0b1c30] focus:ring-2 focus:ring-[#4648d4]/30 focus:outline-none"
                  />
                </div>

                {/* Short Name & Reference Code */}
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Short Name (For Mobile Badges)
                  </label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="e.g. Netflix 4K"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-semibold text-[#0b1c30] focus:ring-2 focus:ring-[#4648d4]/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Reference Code / SKU
                  </label>
                  <input
                    type="text"
                    value={refCode}
                    onChange={(e) => setRefCode(e.target.value)}
                    placeholder="e.g. #TX-NFLX"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-mono text-[#0b1c30] focus:ring-2 focus:ring-[#4648d4]/30 focus:outline-none"
                  />
                </div>

                {/* Category & Category Label */}
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Store Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCategory(val);
                      if (val === 'ai') setCategoryLabel('AI & Neural Tools');
                      else if (val === 'creative') setCategoryLabel('Creative & Design');
                      else if (val === 'streaming') setCategoryLabel('OTT & 4K Streaming');
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-semibold text-[#0b1c30] focus:ring-2 focus:ring-[#4648d4]/30 focus:outline-none cursor-pointer"
                  >
                    <option value="ai">AI &amp; Neural Tools (ChatGPT, Claude, Midjourney)</option>
                    <option value="creative">Creative &amp; Design (Adobe, Canva, CapCut)</option>
                    <option value="streaming">OTT &amp; Streaming (Netflix, Prime, Spotify)</option>
                    <option value="software">Software &amp; Productivity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Duration / Plan Tag
                  </label>
                  <input
                    type="text"
                    value={durationTag}
                    onChange={(e) => setDurationTag(e.target.value)}
                    placeholder="e.g. 1-Month Private Screen / 1-Year Pass"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-semibold text-[#0b1c30] focus:ring-2 focus:ring-[#4648d4]/30 focus:outline-none"
                  />
                </div>

                {/* Badge text & Delivery Note */}
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Card Badge
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. ⚡ Ultra 4K UHD Profile"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-semibold text-[#0b1c30] focus:ring-2 focus:ring-[#4648d4]/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Delivery Speed Note
                  </label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="e.g. 5-15 Mins on WhatsApp"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-semibold text-[#0b1c30] focus:ring-2 focus:ring-[#4648d4]/30 focus:outline-none"
                  />
                </div>
              </div>

              {/* Short & Long Description */}
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Card Short Summary (1-2 sentences)
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. Ultra HD 4K Private screen with custom PIN code lock and uninterrupted streaming."
                  className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#4648d4]/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Full Detailed Description (Shown at Checkout)
                </label>
                <textarea
                  rows={2}
                  value={longDesc}
                  onChange={(e) => setLongDesc(e.target.value)}
                  placeholder="e.g. Full premium private subscription with dedicated profile lock, zero buffering, and replacement guarantee."
                  className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#4648d4]/30 focus:outline-none"
                />
              </div>

              {/* Bullet Features Manager */}
              <div className="p-3.5 bg-[#f8f9ff] rounded-2xl border border-[#dce9ff] space-y-2">
                <label className="block text-xs font-bold text-[#0b1c30]">
                  Key Feature Bullet Points
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Type a feature and press Add..."
                    className="flex-1 px-3 py-2 bg-white border border-[#dce9ff] rounded-xl text-xs text-[#0b1c30] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-2 bg-[#4648d4] text-white text-xs font-bold rounded-xl hover:bg-[#6063ee]"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {featuresList.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 bg-white rounded-lg border border-[#e5eeff] text-xs text-[#464554]"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-emerald-600">
                          check_circle
                        </span>
                        <span>{feat}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-rose-500 hover:text-rose-700 font-bold text-xs p-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & MARGINS */}
          {activeTab === 'pricing' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-gradient-to-br from-[#eff4ff] to-[#f0f9ff] rounded-2xl border border-[#dce9ff] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#767586] uppercase tracking-wider block">
                    PROFIT MARGIN ANALYSIS
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold font-mono text-emerald-700">
                      Rs {profit.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">Net Profit per Unit</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <span className="text-[10px] text-emerald-800 font-semibold block">MARGIN</span>
                    <strong className="text-sm font-bold text-emerald-900">{marginPercent}%</strong>
                  </div>
                  <div className="px-3.5 py-1.5 bg-[#4648d4]/10 border border-[#4648d4]/20 rounded-xl text-center">
                    <span className="text-[10px] text-[#4648d4] font-semibold block">SELL PRICE</span>
                    <strong className="text-sm font-bold text-[#4648d4]">Rs {price}</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Selling Price in PKR */}
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Customer Retail Price (PKR) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                      Rs
                    </span>
                    <input
                      type="number"
                      required
                      min={10}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value) || 0)}
                      placeholder="e.g. 899"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-bold text-[#0b1c30] focus:ring-2 focus:ring-[#4648d4]/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Sourcing Cost in PKR */}
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Wholesale Sourcing Cost (PKR) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                      Rs
                    </span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={unitCost}
                      onChange={(e) => setUnitCost(Number(e.target.value) || 0)}
                      placeholder="e.g. 260"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-bold text-[#0b1c30] focus:ring-2 focus:ring-[#4648d4]/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Wholesaler Supplier Partner */}
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Wholesale Supplier Hub / Partner
                  </label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. DirectStream_PK or TechWholesale_TR"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-semibold text-[#0b1c30] focus:ring-2 focus:ring-[#4648d4]/30 focus:outline-none"
                  />
                </div>

                {/* Brand Logo Text */}
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Brand Logo Tag (Overlaid on Card)
                  </label>
                  <input
                    type="text"
                    value={brandLogo}
                    onChange={(e) => setBrandLogo(e.target.value)}
                    placeholder="e.g. NETFLIX, OPENAI, ADOBE"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-bold uppercase text-[#0b1c30] focus:ring-2 focus:ring-[#4648d4]/30 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COVER IMAGE & VISUALS */}
          {activeTab === 'images' && (
            <div className="space-y-5 animate-fade-in">
              {/* Image Preview Box */}
              <div className="p-4 bg-[#f8f9ff] rounded-2xl border border-[#dce9ff] flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden border border-[#dce9ff] bg-[#0b1c30] relative shrink-0 shadow-md">
                  {imageUrl ? (
                    <>
                      <img
                        src={imageUrl}
                        alt="Product Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30] via-transparent to-black/30" />
                      {brandLogo && (
                        <span className="absolute bottom-2 left-2 text-[9px] font-extrabold tracking-wider bg-black/80 px-2 py-0.5 rounded text-white border border-white/20">
                          {brandLogo}
                        </span>
                      )}
                      <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-[#4648d4] text-white px-1.5 py-0.5 rounded">
                        {durationTag || '1-Mo'}
                      </span>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                      <span className="material-symbols-outlined text-[28px]">image</span>
                      <span>No image set</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-xs">
                  <h4 className="font-bold text-[#0b1c30]">Product Card Cover Preview</h4>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    This image will appear in the main store grid, quick checkout switcher, and order confirmation receipt.
                  </p>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-rose-600 hover:text-rose-800 font-bold text-[11px] flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                      <span>Remove current image</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Custom Image URL or Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Image Web URL (Direct HTTPS link)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#4648d4]/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Upload from Computer / Phone
                  </label>
                  <label className="w-full px-3.5 py-2.5 bg-[#f8f9ff] hover:bg-[#eff4ff] border border-dashed border-[#4648d4]/40 rounded-xl text-xs font-bold text-[#4648d4] flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                    <span>Browse Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Quick Preset Library */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0b1c30]">
                  ⚡ Or Click to Apply High-Res Brand Presets:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="p-2 rounded-xl border border-[#e5eeff] hover:border-[#4648d4] bg-white hover:bg-[#f8f9ff] text-left transition-all group flex items-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-black shrink-0 border border-gray-200">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-[11px] text-[#0b1c30] block truncate">
                          {preset.name}
                        </span>
                        <span className="text-[9px] text-[#767586] uppercase font-mono">
                          {preset.brand}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-[#e5eeff] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            {isEditMode && (onDeleteProduct || onDelete) ? (
              <button
                type="button"
                onClick={() => {
                  if (!activeProduct) return;
                  if (
                    window.confirm(
                      `Are you sure you want to completely delete "${activeProduct.name}" from the store?`
                    )
                  ) {
                    if (onDeleteProduct) onDeleteProduct(activeProduct.id);
                    if (onDelete) onDelete(activeProduct.id);
                    onClose();
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Delete Product</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#464554] text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#4648d4] hover:bg-[#6063ee] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>{isEditMode ? 'Save Changes' : 'Create & Publish Product'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
