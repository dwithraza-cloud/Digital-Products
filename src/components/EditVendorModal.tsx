import React, { useState, useEffect } from 'react';
import { Vendor } from '../types';

interface EditVendorModalProps {
  isOpen: boolean;
  vendor: Vendor | null;
  onClose: () => void;
  onSave: (updatedVendor: Vendor) => void;
  onDelete?: (vendorId: string) => void;
}

export const EditVendorModal: React.FC<EditVendorModalProps> = ({
  isOpen,
  vendor,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Vendor | null>(vendor);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setFormData(vendor ? { ...vendor } : null);
    setShowDeleteConfirm(false);
  }, [vendor, isOpen]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#213145]/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#e5eeff] p-5 sm:p-7 max-w-xl w-full shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#eff4ff]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#eff4ff] text-[#4648d4] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </span>
              <h3 className="font-headline font-bold text-lg sm:text-xl text-[#0b1c30]">
                {formData.id.startsWith('new-') ? 'Add New Supplier Partner' : `Edit Supplier: ${formData.partnerName}`}
              </h3>
            </div>
            <p className="text-xs text-[#767586] mt-1">
              Configure wholesale unit buy prices, regional SLA, and inventory escrow balances.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#eff4ff] hover:bg-[#e4e0f5] text-[#464554] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3">
            <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
              <span className="material-symbols-outlined text-[20px] text-red-600">warning</span>
              <span>Remove {formData.partnerName} from Matrix?</span>
            </div>
            <p className="text-xs text-red-700">
              This will remove this supplier agreement and disable automated routing for their catalogs.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onDelete && onDelete(formData.id)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Yes, Delete Supplier
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#464554] mb-1">Partner / Hub Name</label>
              <input
                type="text"
                required
                value={formData.partnerName}
                onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30] font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#464554] mb-1">Hub Code</label>
              <input
                type="text"
                required
                maxLength={4}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30] font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#464554] mb-1">Region / Jurisdiction</label>
              <input
                type="text"
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="e.g. Istanbul TR / Asia-Pac"
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#464554] mb-1">Primary Catalogs</label>
              <input
                type="text"
                required
                value={formData.catalogs}
                onChange={(e) => setFormData({ ...formData, catalogs: e.target.value })}
                placeholder="e.g. Canva Edu, Adobe CC, ChatGPT Plus"
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#464554] mb-1">Total Supplier Spend (PKR)</label>
              <input
                type="number"
                min="0"
                value={formData.supplierSpendPkr}
                onChange={(e) => setFormData({ ...formData, supplierSpendPkr: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30] font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#464554] mb-1">Unit Buy Price</label>
              <input
                type="text"
                value={formData.unitBuyPrice}
                onChange={(e) => setFormData({ ...formData, unitBuyPrice: e.target.value })}
                placeholder="e.g. Rs 240 / key"
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#ba1a1a] font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#464554] mb-1">Lumina / Retail Price</label>
              <input
                type="text"
                value={formData.luminaRetail}
                onChange={(e) => setFormData({ ...formData, luminaRetail: e.target.value })}
                placeholder="e.g. Rs 999"
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#006c49] font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#464554] mb-1">Fulfillment Speed</label>
              <input
                type="text"
                value={formData.fulfillmentSpeed}
                onChange={(e) => setFormData({ ...formData, fulfillmentSpeed: e.target.value })}
                placeholder="e.g. 3 mins SLA"
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#464554] mb-1">Defect Rate</label>
              <input
                type="text"
                value={formData.defectRate}
                onChange={(e) => setFormData({ ...formData, defectRate: e.target.value })}
                placeholder="e.g. 0.4%"
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#464554] mb-1">Defect Quality Tier</label>
              <select
                value={formData.defectTier}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defectTier: e.target.value as Vendor['defectTier'],
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30]"
              >
                <option value="Elite">Elite (&lt;0.5%)</option>
                <option value="Pristine">Pristine (&lt;1%)</option>
                <option value="Stable">Stable (&lt;2%)</option>
                <option value="Managed">Managed (Escrow)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#464554] mb-1">Vendor Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Vendor['status'],
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30] font-semibold"
            >
              <option value="Active Priority">Active Priority (Primary Wholesale)</option>
              <option value="Operational">Operational (Ready)</option>
              <option value="Active">Active (Secondary)</option>
              <option value="Contracted">Contracted (Backup Escrow)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-[#eff4ff] flex flex-col sm:flex-row items-center justify-between gap-3">
            {onDelete && !formData.id.startsWith('new-') ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full sm:w-auto px-3.5 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-xl font-bold flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Delete Supplier</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#dce9ff] text-[#464554] hover:bg-[#f8f9ff] font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#4648d4] hover:bg-[#6063ee] text-white font-bold shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Save Supplier Config</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
