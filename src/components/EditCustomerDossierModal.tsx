import React, { useState, useEffect } from 'react';
import { CustomerDossier } from '../types';

interface EditCustomerDossierModalProps {
  isOpen: boolean;
  dossier: CustomerDossier | null;
  onClose: () => void;
  onSave: (updatedDossier: CustomerDossier) => void;
  onDelete?: (customerName: string) => void;
}

export const EditCustomerDossierModal: React.FC<EditCustomerDossierModalProps> = ({
  isOpen,
  dossier,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<CustomerDossier | null>(dossier);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // For adding a new history line item
  const [newHistProduct, setNewHistProduct] = useState('');
  const [newHistVendor, setNewHistVendor] = useState('TechWholesale_TR (Rs 240)');
  const [newHistProfit, setNewHistProfit] = useState(750);
  const [newHistCost, setNewHistCost] = useState(240);
  const [newHistDate, setNewHistDate] = useState('Today');

  useEffect(() => {
    setFormData(dossier ? JSON.parse(JSON.stringify(dossier)) : null);
    setShowDeleteConfirm(false);
  }, [dossier, isOpen]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddHistoryItem = () => {
    if (!newHistProduct.trim()) return;
    const newItem = {
      product: newHistProduct,
      vendor: newHistVendor,
      cost: Number(newHistCost),
      profit: Number(newHistProfit),
      date: newHistDate || 'Today',
    };
    setFormData({
      ...formData,
      completedOrders: formData.completedOrders + 1,
      ltv: formData.ltv + newItem.cost + newItem.profit,
      orderHistory: [newItem, ...formData.orderHistory],
    });
    setNewHistProduct('');
  };

  const handleRemoveHistoryItem = (index: number) => {
    const updatedHistory = formData.orderHistory.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      orderHistory: updatedHistory,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#213145]/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#e5eeff] p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#eff4ff]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#eff4ff] text-[#4648d4] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">badge</span>
              </span>
              <h3 className="font-headline font-bold text-lg sm:text-xl text-[#0b1c30]">
                Edit Customer CRM Dossier
              </h3>
            </div>
            <p className="text-xs text-[#767586] mt-1">
              Update customer contact info, role, reliability score, and license order allocation.
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
              <span>Remove Customer Dossier for {formData.name}?</span>
            </div>
            <p className="text-xs text-red-700">
              This will remove this customer's profile and historical ledger history from your CRM.
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
                onClick={() => onDelete && onDelete(formData.name)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Yes, Remove Dossier
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#464554] mb-1">Customer Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30] font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#464554] mb-1">WhatsApp / Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#464554] mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#464554] mb-1">City / Location</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#464554] mb-1">Role / Profession</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Agency Senior Designer"
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#464554] mb-1">Reliability Status</label>
              <select
                value={formData.reliability}
                onChange={(e) => setFormData({ ...formData, reliability: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30] font-semibold"
              >
                <option value="100% Reliable">100% Reliable (VIP Escrow)</option>
                <option value="98% Reliable">98% Reliable (Verified)</option>
                <option value="95% Reliable">95% Reliable (Standard)</option>
                <option value="New Buyer">New Buyer (First Time)</option>
                <option value="Review Required">Review Required (Flagged)</option>
              </select>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#f8f9ff] rounded-2xl border border-[#e5eeff]">
            <div>
              <label className="block text-[11px] font-semibold text-[#767586] mb-1">Lifetime Value (PKR)</label>
              <input
                type="number"
                min="0"
                value={formData.ltv}
                onChange={(e) => setFormData({ ...formData, ltv: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#dce9ff] bg-white font-mono font-bold text-[#0b1c30]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#767586] mb-1">Completed Orders</label>
              <input
                type="number"
                min="0"
                value={formData.completedOrders}
                onChange={(e) => setFormData({ ...formData, completedOrders: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#dce9ff] bg-white font-mono font-bold text-[#006c49]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#767586] mb-1">Disputes / Chargebacks</label>
              <input
                type="number"
                min="0"
                value={formData.disputes}
                onChange={(e) => setFormData({ ...formData, disputes: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#dce9ff] bg-white font-mono font-bold text-[#4648d4]"
              />
            </div>
          </div>

          {/* Historical Order Items */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0b1c30]">Client Order History ({formData.orderHistory.length})</span>
              <span className="text-[11px] text-[#767586]">Allocation Records</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {formData.orderHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#f8f9ff] border border-[#eff4ff] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-[#0b1c30] truncate">{item.product}</div>
                    <div className="text-[11px] text-[#767586] truncate">{item.vendor}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right font-mono">
                      <div className="font-bold text-[#006c49]">+Rs {item.profit}</div>
                      <div className="text-[10px] text-[#767586]">{item.date}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveHistoryItem(idx)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50"
                      title="Remove History Record"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add History Item */}
            <div className="p-3 bg-[#eff4ff] rounded-2xl border border-[#dce9ff] space-y-2 mt-2">
              <span className="font-semibold text-[#4648d4] block text-[11px]">
                + Append Past Order to Dossier
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Product (e.g. Canva Pro 1-Yr)"
                  value={newHistProduct}
                  onChange={(e) => setNewHistProduct(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#dce9ff] bg-white text-[11px]"
                />
                <input
                  type="number"
                  placeholder="Profit (Rs)"
                  value={newHistProfit}
                  onChange={(e) => setNewHistProfit(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg border border-[#dce9ff] bg-white font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={handleAddHistoryItem}
                  className="px-3 py-1.5 bg-[#4648d4] text-white rounded-lg font-bold hover:bg-[#6063ee] text-[11px]"
                >
                  Add Record
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#eff4ff] flex flex-col sm:flex-row items-center justify-between gap-3">
            {onDelete ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full sm:w-auto px-3.5 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-xl font-bold flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Delete Dossier</span>
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
                <span>Save Customer Dossier</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
