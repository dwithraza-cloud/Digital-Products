import React, { useState, useEffect } from 'react';
import { Order } from '../types';

interface EditOrderModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSave: (updatedOrder: Order) => void;
  onDelete: (orderId: string) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  order,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Order | null>(order);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setFormData(order ? { ...order } : null);
    setShowDeleteConfirm(false);
  }, [order, isOpen]);

  if (!isOpen || !formData) return null;

  const profit = formData.sellingPrice - formData.vendorCost;
  const marginPercent =
    formData.sellingPrice > 0
      ? Math.round((profit / formData.sellingPrice) * 100)
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDelete = () => {
    onDelete(formData.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#213145]/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#e5eeff] p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#eff4ff]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#eff4ff] text-[#4648d4] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">edit_note</span>
              </span>
              <h3 className="font-headline font-bold text-lg sm:text-xl text-[#0b1c30]">
                Edit Live Order #{formData.refNumber}
              </h3>
            </div>
            <p className="text-xs text-[#767586] mt-1">
              Modify transaction values, customer contact, delivery status, and COGS calculations.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#eff4ff] hover:bg-[#e4e0f5] text-[#464554] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Delete Confirmation Banner if active */}
        {showDeleteConfirm ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
              <span className="material-symbols-outlined text-[20px] text-red-600">warning</span>
              <span>Permanently Delete Order #{formData.refNumber}?</span>
            </div>
            <p className="text-xs text-red-700 leading-relaxed">
              This will remove <strong>{formData.customerName}</strong>'s purchase of{' '}
              <strong>{formData.productName}</strong> (Rs {formData.sellingPrice.toLocaleString()}) from the live ledger and adjust your live revenue, COGS, and profit calculations immediately.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-1.5 bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-xl text-xs font-semibold"
              >
                No, Keep Order
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Yes, Delete Order
              </button>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer Profile Section */}
          <div className="bg-[#f8f9ff] p-4 rounded-2xl border border-[#e5eeff] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0b1c30] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#4648d4]">person</span>
                Customer Profile &amp; Contact
              </span>
              <span className="text-[11px] text-[#767586]">CRM Synced</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#464554] mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30] font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#464554] mb-1">WhatsApp / Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#464554] mb-1">Customer Email</label>
                <input
                  type="email"
                  value={formData.customerEmail || ''}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#464554] mb-1">City / Region</label>
                <input
                  type="text"
                  value={formData.customerCity}
                  onChange={(e) => setFormData({ ...formData, customerCity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#464554] mb-1">Customer Tag</label>
                <select
                  value={formData.customerTag || 'Client'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerTag: e.target.value as Order['customerTag'],
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30]"
                >
                  <option value="VIP">VIP</option>
                  <option value="Repeat">Repeat</option>
                  <option value="New">New</option>
                  <option value="Agency">Agency</option>
                  <option value="Client">Client</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#464554] mb-1">Role / Profession</label>
                <input
                  type="text"
                  value={formData.customerRole || ''}
                  onChange={(e) => setFormData({ ...formData, customerRole: e.target.value })}
                  placeholder="e.g. Motion Designer, Agency Lead"
                  className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30]"
                />
              </div>
            </div>
          </div>

          {/* Product & Financials Section */}
          <div className="bg-[#f8f9ff] p-4 rounded-2xl border border-[#e5eeff] space-y-3">
            <span className="font-bold text-[#0b1c30] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#006c49]">attach_money</span>
              License Product &amp; Financial Ledger
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#464554] mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30] font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#464554] mb-1">Plan &amp; Duration Details</label>
                <input
                  type="text"
                  value={formData.planDetails}
                  onChange={(e) => setFormData({ ...formData, planDetails: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-[#464554] mb-1">Selling Price (PKR)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#464554] mb-1">Vendor Cost / COGS (PKR)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.vendorCost}
                  onChange={(e) => setFormData({ ...formData, vendorCost: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#ba1a1a] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#006c49] mb-1">Calculated Net Margin</label>
                <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#006c49] font-mono font-bold flex items-center justify-between">
                  <span>+Rs {profit.toLocaleString()}</span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    {marginPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* License Expiry & Subscription Lifecycle */}
          <div className="bg-[#fff7ed] p-4 rounded-2xl border border-[#ffedd5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#9a3412] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#ea580c]">event_upcoming</span>
                Software License Expiry &amp; WhatsApp Renewal Lifecycle
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                formData.expiryStatus === 'Expired'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : formData.expiryStatus === 'Expiring Soon'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {formData.expiryStatus || 'Active'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#7c2d12] mb-1">Expiry Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    let autoStatus: Order['expiryStatus'] = 'Active';
                    if (newDate) {
                      const today = new Date().toISOString().split('T')[0];
                      if (newDate < today) autoStatus = 'Expired';
                      else {
                        const diffDays = (new Date(newDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                        if (diffDays <= 7) autoStatus = 'Expiring Soon';
                      }
                    }
                    setFormData({ ...formData, expiryDate: newDate, expiryStatus: autoStatus });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#fed7aa] bg-white text-[#0b1c30] font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#7c2d12] mb-1">Lifecycle Expiry Status</label>
                <select
                  value={formData.expiryStatus || 'Active'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expiryStatus: e.target.value as Order['expiryStatus'],
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#fed7aa] bg-white text-[#0b1c30] font-semibold"
                >
                  <option value="Active">🟢 Active License</option>
                  <option value="Expiring Soon">🟡 Expiring Soon (3-7 Days)</option>
                  <option value="Expired">🔴 Expired (Renewal Needed)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#7c2d12] mb-1">License Key / Serial #</label>
                <input
                  type="text"
                  placeholder="e.g. CNV-EDU-8829-XPK"
                  value={formData.licenseKey || ''}
                  onChange={(e) => setFormData({ ...formData, licenseKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#fed7aa] bg-white text-[#0b1c30] font-mono"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-[#9a3412] font-semibold">Quick Expiry Presets:</span>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 30);
                  setFormData({
                    ...formData,
                    expiryDate: d.toISOString().split('T')[0],
                    expiryStatus: 'Active',
                  });
                }}
                className="px-2 py-1 bg-white hover:bg-orange-100 border border-[#fed7aa] rounded-lg text-[#9a3412] font-medium"
              >
                +30 Days (1 Mo)
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 90);
                  setFormData({
                    ...formData,
                    expiryDate: d.toISOString().split('T')[0],
                    expiryStatus: 'Active',
                  });
                }}
                className="px-2 py-1 bg-white hover:bg-orange-100 border border-[#fed7aa] rounded-lg text-[#9a3412] font-medium"
              >
                +90 Days (3 Mo)
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setFullYear(d.getFullYear() + 1);
                  setFormData({
                    ...formData,
                    expiryDate: d.toISOString().split('T')[0],
                    expiryStatus: 'Active',
                  });
                }}
                className="px-2 py-1 bg-white hover:bg-orange-100 border border-[#fed7aa] rounded-lg text-[#9a3412] font-medium"
              >
                +1 Year (365d)
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 1);
                  setFormData({
                    ...formData,
                    expiryDate: d.toISOString().split('T')[0],
                    expiryStatus: 'Expired',
                  });
                }}
                className="px-2 py-1 bg-red-100 hover:bg-red-200 border border-red-300 rounded-lg text-red-800 font-bold"
              >
                Mark Expired (Today)
              </button>
            </div>
          </div>

          {/* Sourcing & Payment Rail Section */}
          <div className="bg-[#f8f9ff] p-4 rounded-2xl border border-[#e5eeff] space-y-3">
            <span className="font-bold text-[#0b1c30] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#ea580c]">account_balance</span>
              Fulfillment &amp; Payment Status
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#464554] mb-1">Vendor Origin Partner</label>
                <input
                  type="text"
                  value={formData.vendorOrigin}
                  onChange={(e) => setFormData({ ...formData, vendorOrigin: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#464554] mb-1">Payment Rail</label>
                <select
                  value={formData.paymentRail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentRail: e.target.value as Order['paymentRail'],
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30]"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Nayapay Wallet">Nayapay Wallet</option>
                  <option value="JazzCash Retail">JazzCash Retail</option>
                  <option value="Easypaisa">Easypaisa</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#464554] mb-1">Verification Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Order['status'],
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white font-bold text-[#0b1c30]"
                >
                  <option value="Verified">Verified (Payment Confirmed)</option>
                  <option value="Dispatched">Dispatched (Key Sent)</option>
                  <option value="Awaiting Slip">Awaiting Slip / Review</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-[#464554] mb-1">Transaction Ref / Slip ID</label>
                <input
                  type="text"
                  value={formData.transactionId || formData.refNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transactionId: e.target.value,
                      refNumber: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#464554] mb-1">Timestamp / Order Date</label>
                <input
                  type="text"
                  value={formData.timestamp}
                  onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#464554] mb-1">
                Admin Notes &amp; Delivered Credentials (Private)
              </label>
              <textarea
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Sent private 4K slot PIN 8821 on WhatsApp. Buyer confirmed active."
                className="w-full px-3 py-2 rounded-xl border border-[#dce9ff] bg-white text-[#0b1c30] font-mono text-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>Delete Order</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#dce9ff] text-[#464554] hover:bg-[#f8f9ff] font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#4648d4] hover:bg-[#6063ee] text-white font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Save Live Order</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
