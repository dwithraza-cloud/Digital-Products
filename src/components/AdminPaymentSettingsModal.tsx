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

  const handleChange = (field: keyof PaymentSettings, value: string | boolean) => {
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
              Modify official JazzCash, Easypaisa, WhatsApp support, and Bank accounts. Any change
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
          {/* Section 1: Mobile Wallet Rails (JazzCash & Easypaisa) */}
          <div className="p-5 rounded-2xl bg-[#fff7ed]/60 border border-[#fed7aa] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-[#0b1c30] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#ea580c] text-[18px]">
                  smartphone
                </span>
                Active Mobile Wallet Rails (JazzCash &amp; Easypaisa)
              </h4>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                PRIMARY PUBLIC RAILS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">JAZZCASH MOBILE NUMBER</label>
                <input
                  type="text"
                  required
                  value={formData.jazzcashNumber || formData.walletNumber || ''}
                  onChange={(e) => {
                    handleChange('jazzcashNumber', e.target.value);
                    handleChange('walletNumber', e.target.value);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#fed7aa] bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#ea580c] focus:outline-none font-mono font-bold"
                  placeholder="e.g. 03145338340"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">JAZZCASH ACCOUNT TITLE</label>
                <input
                  type="text"
                  required
                  value={formData.jazzcashTitle || formData.walletTitle || ''}
                  onChange={(e) => handleChange('jazzcashTitle', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#fed7aa] bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#ea580c] focus:outline-none font-semibold"
                  placeholder="e.g. Insight Products"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">EASYPAISA MOBILE NUMBER</label>
                <input
                  type="text"
                  required
                  value={formData.easypaisaNumber || formData.walletNumber || ''}
                  onChange={(e) => handleChange('easypaisaNumber', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#fed7aa] bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#ea580c] focus:outline-none font-mono font-bold"
                  placeholder="e.g. 03145338340"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">EASYPAISA ACCOUNT TITLE</label>
                <input
                  type="text"
                  required
                  value={formData.easypaisaTitle || formData.walletTitle || ''}
                  onChange={(e) => handleChange('easypaisaTitle', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#fed7aa] bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#ea580c] focus:outline-none font-semibold"
                  placeholder="e.g. Insight Products"
                />
              </div>
            </div>
          </div>

          {/* Section 2: WhatsApp Support & Dispatch */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-[#0b1c30] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-700 text-[18px]">
                  chat
                </span>
                Official WhatsApp Desk
              </h4>
              <span className="text-[10px] text-[#767586] font-mono">SUPPORT DESK</span>
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
                  placeholder="e.g. +923145338340"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white text-[#0b1c30] focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                  placeholder="e.g. 0314 5338340"
                />
                <span className="text-[10px] text-[#767586] block">
                  Displayed on website footer and support buttons.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Bank Account Details (Controlled by Enable/Disable toggle) */}
          <div className="p-5 rounded-2xl bg-[#f8f9ff] border border-[#dce9ff] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4648d4] text-[18px]">
                  account_balance
                </span>
                <h4 className="font-headline font-bold text-sm text-[#0b1c30]">
                  Bank Account Rail (1-Link &amp; Direct Deposit)
                </h4>
              </div>

              {/* Bank Visibility Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.enableBankTransfer}
                  onChange={(e) => handleChange('enableBankTransfer', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4648d4]"></div>
                <span className="ml-2 text-xs font-bold text-[#0b1c30]">
                  {formData.enableBankTransfer ? 'Visible on Site' : 'Hidden on Site'}
                </span>
              </label>
            </div>

            {!formData.enableBankTransfer ? (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0">
                  visibility_off
                </span>
                <span>
                  <strong>Bank Account is currently HIDDEN from real customers.</strong> It will not be shown on the public checkout until you enter your bank details and toggle the switch above ON.
                </span>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">
                  visibility
                </span>
                <span>
                  <strong>Bank Account is ENABLED on real customers checkout.</strong>
                </span>
              </div>
            )}

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 transition-opacity ${!formData.enableBankTransfer ? 'opacity-60' : 'opacity-100'}`}>
              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">BANK NAME</label>
                <input
                  type="text"
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
                  value={formData.accountTitle}
                  onChange={(e) => handleChange('accountTitle', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#ea580c] focus:outline-none font-semibold"
                  placeholder="e.g. Insight Products"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">FAST DEPOSIT ACCOUNT NUMBER</label>
                <input
                  type="text"
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
                  value={formData.iban}
                  onChange={(e) => handleChange('iban', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#ea580c] focus:outline-none font-mono"
                  placeholder="e.g. PK42MEZN0001020105923811"
                />
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
              <span className="text-[10px] text-gray-400 font-mono">Real-time sync</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white/10 p-3 rounded-xl">
              <div>
                <span className="text-gray-400 block text-[10px]">JAZZCASH PREVIEW</span>
                <span className="font-mono font-bold text-red-400 text-[12px] block">
                  {formData.jazzcashNumber || formData.walletNumber || '03145338340'}
                </span>
                <span className="text-[10px] text-gray-300">Title: {formData.jazzcashTitle || formData.walletTitle || 'Insight Products'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">EASYPAISA PREVIEW</span>
                <span className="font-mono font-bold text-emerald-400 text-[12px] block">
                  {formData.easypaisaNumber || formData.walletNumber || '03145338340'}
                </span>
                <span className="text-[10px] text-gray-300">Title: {formData.easypaisaTitle || formData.walletTitle || 'Insight Products'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">BANK ACCOUNT STATUS</span>
                {formData.enableBankTransfer && formData.accountNumber ? (
                  <>
                    <span className="font-bold text-emerald-300 text-[11px] block">{formData.bankName}</span>
                    <span className="font-mono text-gray-200 text-[10px] block">{formData.accountNumber}</span>
                  </>
                ) : (
                  <span className="text-amber-300 text-[11px] font-bold block">🔒 Hidden from Public</span>
                )}
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
