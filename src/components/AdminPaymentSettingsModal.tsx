import React, { useState } from 'react';
import { PaymentSettings } from '../types';
import { DEFAULT_PAYMENT_SETTINGS } from '../data/mockData';

interface AdminPaymentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: PaymentSettings;
  onSaveSettings: (newSettings: PaymentSettings) => void;
}

export const AdminPaymentSettingsModal: React.FC<AdminPaymentSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<PaymentSettings>({ ...currentSettings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof PaymentSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_PAYMENT_SETTINGS });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#213145]/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-[#eff4ff] text-[#464554] hover:text-[#0b1c30] flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ea580c] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[24px]">account_balance</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-bold text-xl text-[#0b1c30]">
                Payment Rails &amp; Account Numbers Settings
              </h3>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Website Sync
              </span>
            </div>
            <p className="text-xs text-[#767586]">
              Modify official bank accounts, mobile wallets, and WhatsApp dispatch numbers. Any change
              saved here immediately updates the public checkout page for all customers.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-fade-in">
            <span className="material-symbols-outlined text-emerald-600 text-[22px]">
              check_circle
            </span>
            <div className="text-xs">
              <span className="font-bold block">Settings Saved &amp; Live!</span>
              <span>All public checkout forms and copy buttons now show your updated account numbers.</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Section 1: Bank Account Details */}
          <div className="p-5 rounded-2xl bg-[#f8f9ff] border border-[#dce9ff] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-[#0b1c30] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#4648d4] text-[18px]">
                  account_balance
                </span>
                Primary Bank Details (1-Link &amp; Escrow)
              </h4>
              <span className="text-[10px] text-[#767586] font-mono">SECTION 01</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">BANK NAME</label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                  placeholder="e.g. Meezan Bank Ltd"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">BANK CATEGORY / SUBTITLE</label>
                <input
                  type="text"
                  required
                  value={formData.bankSubtitle}
                  onChange={(e) => handleChange('bankSubtitle', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                  placeholder="e.g. Islamic Banking Corporate Account"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-[#0b1c30]">OFFICIAL ACCOUNT TITLE</label>
                <input
                  type="text"
                  required
                  value={formData.accountTitle}
                  onChange={(e) => handleChange('accountTitle', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#ea580c] focus:outline-none font-semibold"
                  placeholder="e.g. Insight Products or Muhammad Ali"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">FAST DEPOSIT ACCOUNT NUMBER</label>
                <input
                  type="text"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => handleChange('accountNumber', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#ea580c] focus:outline-none font-mono"
                  placeholder="e.g. 0102-0105-9238-1102"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">FULL IBAN (1-LINK ACTIVE)</label>
                <input
                  type="text"
                  required
                  value={formData.iban}
                  onChange={(e) => handleChange('iban', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#ea580c] focus:outline-none font-mono"
                  placeholder="e.g. PK42MEZN0001020105923811"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Mobile Wallet Details */}
          <div className="p-5 rounded-2xl bg-[#fff7ed]/50 border border-[#fed7aa] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-[#0b1c30] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#ea580c] text-[18px]">
                  smartphone
                </span>
                Mobile Wallet Rails (JazzCash &amp; Easypaisa)
              </h4>
              <span className="text-[10px] text-[#767586] font-mono">SECTION 02</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">WALLET RAIL LABEL</label>
                <input
                  type="text"
                  required
                  value={formData.walletName}
                  onChange={(e) => handleChange('walletName', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#fed7aa] bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                  placeholder="e.g. JazzCash / Easypaisa Direct Transfer"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">WALLET ACCOUNT TITLE</label>
                <input
                  type="text"
                  required
                  value={formData.walletTitle}
                  onChange={(e) => handleChange('walletTitle', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#fed7aa] bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#ea580c] focus:outline-none font-semibold"
                  placeholder="e.g. Insight Pay or Your Name"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-[#0b1c30]">WALLET MOBILE NUMBER</label>
                <input
                  type="text"
                  required
                  value={formData.walletNumber}
                  onChange={(e) => handleChange('walletNumber', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#fed7aa] bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#ea580c] focus:outline-none font-mono"
                  placeholder="e.g. 0300-1234567 or 0312-9876543"
                />
              </div>
            </div>
          </div>

          {/* Section 3: WhatsApp Support & Dispatch */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-[#0b1c30] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-700 text-[18px]">
                  chat
                </span>
                Official WhatsApp Desk
              </h4>
              <span className="text-[10px] text-[#767586] font-mono">SECTION 03</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">
                  WHATSAPP NUMBER (INTERNATIONAL FORMAT)
                </label>
                <input
                  type="text"
                  required
                  value={formData.whatsappSupportNumber}
                  onChange={(e) => handleChange('whatsappSupportNumber', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white text-[#0b1c30] focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  placeholder="e.g. +923001234567"
                />
                <span className="text-[10px] text-[#767586] block">
                  Used for direct wa.me click-to-chat links.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">WHATSAPP DISPLAY TEXT</label>
                <input
                  type="text"
                  required
                  value={formData.whatsappDisplay}
                  onChange={(e) => handleChange('whatsappDisplay', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white text-[#0b1c30] focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="e.g. +92 300 1234567"
                />
                <span className="text-[10px] text-[#767586] block">
                  Displayed on website footer and support buttons.
                </span>
              </div>
            </div>
          </div>

          {/* Live Preview Bar */}
          <div className="p-4 rounded-2xl bg-[#0b1c30] text-white space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5 text-amber-400">
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                Live Customer Checkout Preview
              </span>
              <span className="text-[10px] text-gray-400 font-mono">Real-time preview</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/10 p-3 rounded-xl">
              <div>
                <span className="text-gray-400 block text-[10px]">BANK PREVIEW</span>
                <span className="font-bold block text-white">{formData.bankName}</span>
                <span className="font-mono text-emerald-300 text-[11px] block">{formData.accountNumber}</span>
                <span className="text-[10px] text-gray-300">Title: {formData.accountTitle}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">WALLET PREVIEW</span>
                <span className="font-bold block text-white">{formData.walletName}</span>
                <span className="font-mono text-amber-300 text-[11px] block">{formData.walletNumber}</span>
                <span className="text-[10px] text-gray-300">Title: {formData.walletTitle}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#dce9ff] text-[#464554] hover:bg-[#eff4ff] text-xs font-bold transition-colors"
            >
              Reset to Defaults
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-[#767586] hover:text-[#0b1c30] text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save &amp; Update Live Website</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
