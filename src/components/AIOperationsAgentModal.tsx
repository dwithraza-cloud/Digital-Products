import React, { useState, useRef, useEffect } from 'react';
import { Product, Order, Vendor, PaymentSettings, LearnedMemoryRule } from '../types';
import { useAdaptiveRuleSuggestions, RuleSuggestion } from '../hooks/useAdaptiveRuleSuggestions';

interface AIOperationsAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  products: Product[];
  orders: Order[];
  vendors: Vendor[];
  paymentSettings: PaymentSettings;
  learnedRules: LearnedMemoryRule[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateOrder: (order: Order) => void;
  onUpdateOrders?: (orders: Order[]) => void;
  onUpdatePaymentSettings: (settings: PaymentSettings) => void;
  onUpdateLearnedRules: (rules: LearnedMemoryRule[]) => void;
  onNavigateTab: (tab: 'all' | 'orders' | 'products' | 'receipts' | 'crm' | 'vendors') => void;
  onNavigateToStorefront?: () => void;
  onNavigateToCheckout?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actionExecuted?: {
    type: string;
    description: string;
    details?: string;
  };
  learningLearned?: {
    title: string;
    instruction: string;
    category: string;
  };
}

export const AIOperationsAgentModal: React.FC<AIOperationsAgentModalProps> = ({
  isOpen,
  onClose,
  isAdmin = true,
  onOpenAdminLogin,
  products,
  orders,
  vendors,
  paymentSettings,
  learnedRules,
  onUpdateProducts,
  onUpdateOrder,
  onUpdateOrders,
  onUpdatePaymentSettings,
  onUpdateLearnedRules,
  onNavigateTab,
  onNavigateToStorefront,
  onNavigateToCheckout,
}) => {
  const [activeView, setActiveView] = useState<'chat' | 'brain'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: `Assalam-o-Alaikum! 🤖 Main **Insight Autonomous Store Copilot** hoon.\n\nMain aapki **poori website** ko control karta hoon aur waqt ke sath aapki har baat se **seekhta (train hota)** rehta hoon!\n\n🧠 **Aap mujhay train kar saktay hain:**\n• *"Yaad rakhna, students ko 10% discount dena hai"*\n• *"Delivery policy note karlo: 10 minutes max"*\n\n⚡ **Pori website control karein:**\n• *"Canva Pro ki price 699 kardo"*\n• *"Order INS-91024 verify kardo"*\n• *"Meezan Bank account number badal do"*\n• *"Payment slips gallery kholo"*\n• *"Aaj ka total net profit aur margin batao"*`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleInstruction, setNewRuleInstruction] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState<LearnedMemoryRule['category']>('policy');
  const [showAddRuleForm, setShowAddRuleForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hook: Scans user interactions and proactively suggests new behavioral rules
  const {
    suggestedRules,
    pendingCount,
    isScanning,
    applySuggestion,
    dismissSuggestion,
    applyAllSuggestions,
    rescan,
  } = useAdaptiveRuleSuggestions({
    messages,
    learnedRules,
    onUpdateLearnedRules,
    enabled: isOpen && isAdmin,
  });

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen && activeView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeView]);

  if (!isOpen) return null;

  // Strict Admin Gating: If not admin, render security barrier
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0b1c30]/80 backdrop-blur-md animate-fade-in">
        <div className="bg-white rounded-3xl border border-[#dce9ff] shadow-2xl w-full max-w-md p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[34px]">lock</span>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Admin Exclusive Access
            </div>
            <h3 className="font-headline font-extrabold text-xl sm:text-2xl text-[#0b1c30]">
              Admin Access Required
            </h3>
            <p className="text-xs text-[#464554] mt-2 leading-relaxed">
              Insight Autonomous Store Agent aur iska Business Brain sirf <strong>authorized store admin</strong> ke pass accessible hai. Baki kisi user ya customer ke pass iska access nahi hai.
            </p>
          </div>

          <div className="p-3.5 bg-[#f8f9ff] rounded-2xl border border-[#e5eeff] text-left text-xs space-y-1.5 text-[#464554]">
            <div className="flex items-center gap-2 font-bold text-[#0b1c30]">
              <span className="material-symbols-outlined text-[16px] text-[#4648d4]">shield</span>
              <span>Protected Operations &amp; Memory</span>
            </div>
            <p className="text-[11px] text-[#767586] leading-relaxed">
              Pricing matrix, wholesale COGS costs, bank account configurations, order verification, and self-learning business rules are strictly encrypted for Admin.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => {
                onClose();
                if (onOpenAdminLogin) onOpenAdminLogin();
              }}
              className="w-full py-3.5 px-4 bg-linear-to-r from-[#4648d4] via-[#6063ee] to-[#ea580c] hover:brightness-110 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">key</span>
              <span>Enter Admin Credentials to Unlock</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#464554] font-bold text-xs rounded-2xl transition-colors cursor-pointer"
            >
              Close &amp; Return to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate live financial summary for context
  const totalRevenue = orders.reduce((sum, o) => sum + (o.sellingPrice || 0), 0);
  const totalCOGS = orders.reduce((sum, o) => sum + (o.vendorCost || 0), 0);
  const netProfit = totalRevenue - totalCOGS;
  const netMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const expiredCount = orders.filter(
    (o) =>
      o.expiryStatus === 'Expired' ||
      (o.expiryDate ? new Date(o.expiryDate) < new Date() : false)
  ).length;
  const expiringSoonCount = orders.filter((o) => {
    if (o.expiryStatus === 'Expiring Soon') return true;
    if (!o.expiryDate) return false;
    const diffDays =
      (new Date(o.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  const handleToggleRule = (id: string) => {
    const updated = learnedRules.map((r) =>
      r.id === id ? { ...r, active: !r.active } : r
    );
    onUpdateLearnedRules(updated);
  };

  const handleDeleteRule = (id: string) => {
    const updated = learnedRules.filter((r) => r.id !== id);
    onUpdateLearnedRules(updated);
  };

  const handleAddManualRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle.trim() || !newRuleInstruction.trim()) return;

    const newRule: LearnedMemoryRule = {
      id: `rule-manual-${Date.now()}`,
      category: newRuleCategory,
      title: newRuleTitle.trim(),
      instruction: newRuleInstruction.trim(),
      learnedAt: 'Added by Owner',
      source: 'admin_manual',
      active: true,
    };

    onUpdateLearnedRules([newRule, ...learnedRules]);
    setNewRuleTitle('');
    setNewRuleInstruction('');
    setShowAddRuleForm(false);

    // Notify in chat
    setMessages((prev) => [
      ...prev,
      {
        id: `agent-learned-${Date.now()}`,
        sender: 'agent',
        text: `🧠 **New Knowledge Added:** Mainay aapka naya rule **"${newRule.title}"** brain memory ma permanently store kar liya hai!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        learningLearned: {
          title: newRule.title,
          instruction: newRule.instruction,
          category: newRule.category,
        },
      },
    ]);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          context: {
            products: products.map((p) => ({
              id: p.id,
              name: p.name,
              shortName: p.shortName,
              price: p.price,
              vendorCost: p.unitCost || p.vendorCost || 0,
              category: p.category,
              durationTag: p.durationTag,
              isActive: p.isActive !== false,
            })),
            learnedRules: learnedRules.map((r) => ({
              id: r.id,
              title: r.title,
              instruction: r.instruction,
              category: r.category,
              active: r.active,
            })),
            ordersSummary: `${orders.length} total orders, ${orders.filter((o) => o.status === 'Verified').length} verified, ${orders.filter((o) => o.receiptImage).length} have customer uploaded receipts.`,
            ordersCount: orders.length,
            totalRevenue,
            totalCOGS,
            netProfit,
            netMargin,
            expiredCount,
            expiringSoonCount,
            paymentSettings,
            vendors: vendors.map((v) => ({ name: v.partnerName, catalogs: v.catalogs, region: v.region })),
          },
        }),
      });

      let rawReply = '';
      if (response.ok) {
        const data = await response.json();
        rawReply = data.reply || '';
      } else {
        throw new Error('Server returned non-200');
      }

      // Check if reply has an action block
      let actionExecuted: { type: string; description: string; details?: string } | undefined = undefined;
      let learningLearned: { title: string; instruction: string; category: string } | undefined = undefined;
      const actionMatch = rawReply.match(/```action\s*([\s\S]*?)\s*```/);

      if (actionMatch && actionMatch[1]) {
        try {
          const parsedAction = JSON.parse(actionMatch[1]);
          rawReply = rawReply.replace(/```action[\s\S]*?```/g, '').trim();

          // 1. LEARN_RULE Action
          if (parsedAction.type === 'LEARN_RULE') {
            const { title, instruction, category } = parsedAction.payload;
            if (instruction) {
              const newRule: LearnedMemoryRule = {
                id: `rule-ai-${Date.now()}`,
                category: category || 'general',
                title: title || 'Trained Custom Instruction',
                instruction: instruction,
                learnedAt: 'Learned from Chat',
                source: 'chat_conversation',
                active: true,
              };
              onUpdateLearnedRules([newRule, ...learnedRules]);
              learningLearned = {
                title: newRule.title,
                instruction: newRule.instruction,
                category: newRule.category,
              };
              actionExecuted = {
                type: 'LEARN_RULE',
                description: `Trained new store knowledge: "${newRule.title}"`,
              };
            }
          }
          // 2. UPDATE_PRODUCT_PRICE Action
          else if (parsedAction.type === 'UPDATE_PRODUCT_PRICE') {
            const { productId, productName, newPrice, newCost } = parsedAction.payload;
            if ((productId || productName) && newPrice !== undefined && Number(newPrice) > 0) {
              let didFindMatch = false;
              let updatedProdName = '';
              const updated = products.map((p) => {
                const matchesId = productId && p.id.toLowerCase() === productId.toLowerCase();
                const matchesName = productName && (
                  p.name.toLowerCase().includes(productName.toLowerCase()) ||
                  (p.shortName && p.shortName.toLowerCase().includes(productName.toLowerCase()))
                );
                if (matchesId || matchesName) {
                  didFindMatch = true;
                  updatedProdName = p.name;
                  return {
                    ...p,
                    price: Number(newPrice),
                    formattedPrice: `Rs ${Number(newPrice).toLocaleString()}`,
                    unitCost: newCost !== undefined ? Number(newCost) : p.unitCost,
                    vendorCost: newCost !== undefined ? Number(newCost) : p.vendorCost,
                  };
                }
                return p;
              });

              if (didFindMatch) {
                onUpdateProducts(updated);
                actionExecuted = {
                  type: 'UPDATE_PRODUCT_PRICE',
                  description: `${updatedProdName} price updated to Rs ${Number(newPrice).toLocaleString()}`,
                };
              }
            }
          }
          // 3. NAVIGATE_TAB Action
          else if (parsedAction.type === 'NAVIGATE_TAB') {
            const { tab } = parsedAction.payload;
            if (tab === 'storefront') {
              if (onNavigateToStorefront) onNavigateToStorefront();
              else onNavigateTab('all');
            } else if (tab === 'checkout') {
              if (onNavigateToCheckout) onNavigateToCheckout();
              else onNavigateTab('all');
            } else if (tab) {
              onNavigateTab(tab);
            }
            actionExecuted = {
              type: 'NAVIGATE_TAB',
              description: `Navigated to ${String(tab).toUpperCase()} view`,
            };
          }
          // 4. ADD_PRODUCT Action
          else if (parsedAction.type === 'ADD_PRODUCT') {
            const { name, price, vendorCost, category, desc, durationTag } = parsedAction.payload;
            const newProd: Product = {
              id: `prod-ai-${Date.now()}`,
              name: name || 'Custom Plan',
              shortName: name || 'Custom Plan',
              price: Number(price) || 2000,
              formattedPrice: `Rs ${(Number(price) || 2000).toLocaleString()}`,
              ref: `AI-${Math.floor(100 + Math.random() * 900)}`,
              category: category || 'ai',
              categoryLabel: (category || 'ai').toUpperCase(),
              tag: '⚡ AI Added',
              badge: 'Instant Key',
              badgeIcon: 'bolt',
              desc: desc || 'Official premium digital software subscription.',
              longDesc: desc || 'Official licensed software subscription with private credentials and replacement warranty.',
              durationTag: durationTag || '1-Month Access',
              vendorName: 'Direct Wholesaler',
              unitCost: Number(vendorCost) || 1000,
              vendorCost: Number(vendorCost) || 1000,
              imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
              features: ['Private Credentials', 'Instant Escrow Delivery', 'Full Replacement Warranty'],
              isActive: true,
            };
            onUpdateProducts([newProd, ...products]);
            actionExecuted = {
              type: 'ADD_PRODUCT',
              description: `Added "${newProd.name}" (Rs ${newProd.price.toLocaleString()}) to catalog`,
            };
          }
          // 5. DELETE_PRODUCT Action
          else if (parsedAction.type === 'DELETE_PRODUCT') {
            const { productId, productName } = parsedAction.payload;
            if (productId || productName) {
              const filtered = products.filter(
                (p) =>
                  p.id !== productId &&
                  (!productName || !p.name.toLowerCase().includes(productName.toLowerCase()))
              );
              onUpdateProducts(filtered);
              actionExecuted = {
                type: 'DELETE_PRODUCT',
                description: `Product removed from active catalog`,
              };
            }
          }
          // 6. UPDATE_PAYMENT_SETTINGS Action
          else if (parsedAction.type === 'UPDATE_PAYMENT_SETTINGS') {
            const updatedSettings = {
              ...paymentSettings,
              ...parsedAction.payload,
            };
            onUpdatePaymentSettings(updatedSettings);
            actionExecuted = {
              type: 'UPDATE_PAYMENT_SETTINGS',
              description: `Payment rails & bank account credentials updated`,
            };
          }
          // 7. VERIFY_ORDER Action
          else if (parsedAction.type === 'VERIFY_ORDER') {
            const { orderRef, orderId } = parsedAction.payload;
            let matched = false;
            const updatedOrders = orders.map((o) => {
              const match = (orderId && o.id === orderId) || (orderRef && (o.refNumber.includes(orderRef) || o.transactionId.includes(orderRef)));
              if (match || (!orderId && !orderRef && o.status === 'Awaiting Slip')) {
                matched = true;
                return { ...o, status: 'Verified' as const };
              }
              return o;
            });
            if (onUpdateOrders) onUpdateOrders(updatedOrders);
            else if (updatedOrders[0]) onUpdateOrder(updatedOrders[0]);
            actionExecuted = {
              type: 'VERIFY_ORDER',
              description: `Verified order ${orderRef || 'in ledger'}`,
            };
          }
        } catch (e) {
          console.warn('Failed to parse AI action:', e);
        }
      }

      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: rawReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionExecuted,
        learningLearned,
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      // Local fallback handler if network fails
      const lower = textToSend.toLowerCase();
      let fallbackText = '';
      let actionExecuted: { type: string; description: string } | undefined = undefined;
      let learningLearned: { title: string; instruction: string; category: string } | undefined = undefined;

      const isLearning = /\b(yaad rakh|yaad rakhna|note kar|rule banao|policy|training)\b/i.test(lower);

      if (isLearning) {
        const cleaned = textToSend.replace(/^(yaad rakhna|yaad rakho|note karlo|rule banao|training)\s*[:,-]?\s*/i, '').trim();
        const newRule: LearnedMemoryRule = {
          id: `rule-local-${Date.now()}`,
          category: 'policy',
          title: `Trained: ${cleaned.slice(0, 30)}...`,
          instruction: cleaned || textToSend,
          learnedAt: 'Learned from Chat',
          source: 'chat_conversation',
          active: true,
        };
        onUpdateLearnedRules([newRule, ...learnedRules]);
        learningLearned = {
          title: newRule.title,
          instruction: newRule.instruction,
          category: newRule.category,
        };
        fallbackText = `🧠 **Memory Stored:** Mainay yeh rule permanently seekh liya hai!\n\n• "${newRule.instruction}"\n\nAb yeh instruction mere brain ma active hai!`;
        actionExecuted = {
          type: 'LEARN_RULE',
          description: `Trained new knowledge rule: "${newRule.title}"`,
        };
      } else if (lower.includes('price') && (lower.includes('kardo') || lower.includes('set') || lower.includes('change'))) {
        const numMatch = textToSend.match(/(?:rs\.?|pkr)?\s*(\d{2,6})\b/i);
        const newPrice = numMatch ? parseInt(numMatch[1], 10) : 0;
        
        let targetProd: Product | null = null;
        for (const p of products) {
          if (lower.includes(p.name.toLowerCase()) || (p.shortName && lower.includes(p.shortName.toLowerCase()))) {
            targetProd = p;
            break;
          }
        }

        if (targetProd && newPrice > 0) {
          const updated = products.map((p) =>
            p.id === targetProd!.id
              ? { ...p, price: newPrice, formattedPrice: `Rs ${newPrice.toLocaleString()}` }
              : p
          );
          onUpdateProducts(updated);
          fallbackText = `✅ Mainay **${targetProd.name}** ki price update karke **Rs ${newPrice.toLocaleString()}** kardi hai. Storefront par price live update ho chuki hai!`;
          actionExecuted = {
            type: 'UPDATE_PRODUCT_PRICE',
            description: `${targetProd.name} price changed to Rs ${newPrice.toLocaleString()}`,
          };
        } else {
          fallbackText = `Kis product ki price change karni hai? (e.g. *"Canva Pro ki price 699 kardo"*).`;
        }
      } else if (lower.includes('profit') || lower.includes('revenue') || lower.includes('sale') || lower.includes('kamai')) {
        fallbackText = `📊 **Live Financial Overview:**\n- **Gross Revenue:** Rs ${totalRevenue.toLocaleString()}\n- **Wholesale COGS:** Rs ${totalCOGS.toLocaleString()}\n- **Net Profit:** Rs ${netProfit.toLocaleString()} (*${netMargin}% Margin*)\n- **Active Orders:** ${orders.length} verified orders in ledger.`;
      } else if (lower.includes('screenshot') || lower.includes('slip') || lower.includes('receipt') || lower.includes('proof')) {
        onNavigateTab('receipts');
        fallbackText = `🖼️ Mainay aapko **"Payment Receipts & Slips Verification Gallery"** par switch kar diya hai. Yahan aap clients ke upload kiye huway saray screenshots dekh saktay hain!`;
        actionExecuted = {
          type: 'NAVIGATE_TAB',
          description: `Opened Payment Receipts Gallery`,
        };
      } else {
        fallbackText = `Mainay aapki baat samajh li hai! Main aapke pure store ko handle karta hoon aur har baat se train hota hoon. Koi aur command ya instruction dein!`;
      }

      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionExecuted,
        learningLearned,
      };

      setMessages((prev) => [...prev, agentMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: '🧠 Yaad rakhna: 10% Student Discount', query: 'Yaad rakhna, students ko har order par 10% discount dena hai' },
    { label: '🧠 Policy: Delivery 10 Minutes', query: 'Yaad rakhna hamari standard delivery timing 10 minutes hai' },
    { label: '💰 Canva Pro Price 699', query: 'Canva Pro ki price 699 kardo' },
    { label: '➕ Add ChatGPT Plan', query: 'ChatGPT Plus 1-Month Plan add kardo Rs 3500 price aur Rs 1200 cost ma' },
    { label: '🖼️ Slips Gallery', query: 'Clients ke upload kiye huway payment screenshots dikhao' },
    { label: '📊 Aaj ka Net Profit', query: 'Aaj ka total net profit, revenue aur margin kitna hai?' },
    { label: '🏦 Check Bank Details', query: 'Hamaray active bank account aur JazzCash numbers kya hain?' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-[#0b1c30]/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#dce9ff] shadow-2xl w-full max-w-3xl h-[92vh] max-h-[780px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-[#0b1c30] via-[#152542] to-[#0b1c30] text-white flex items-center justify-between border-b border-[#2a3b5c]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-[#4648d4] via-[#6366f1] to-[#ea580c] flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[24px] text-white animate-pulse">
                  psychology
                </span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0b1c30]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-headline font-bold text-base sm:text-lg text-white">
                  Insight Autonomous Store Agent
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Self-Training Brain
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30 font-mono flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">verified_user</span>
                  Admin Exclusive
                </span>
              </div>
              <p className="text-[11px] text-[#a4b3cf]">
                Continuous learning engine &amp; complete website handler (Roman Urdu / English)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Button */}
            <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
              <button
                onClick={() => setActiveView('chat')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeView === 'chat'
                    ? 'bg-white text-[#0b1c30] shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">chat</span>
                <span>Chat</span>
              </button>
              <button
                onClick={() => setActiveView('brain')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                  activeView === 'brain'
                    ? 'bg-linear-to-r from-[#4648d4] to-[#ea580c] text-white shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">psychology</span>
                <span>Brain ({learnedRules.filter((r) => r.active).length})</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-[#0b1c30] text-[9px] font-black animate-pulse">
                    +{pendingCount}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'welcome-reset',
                    sender: 'agent',
                    text: 'Chat history cleared. All brain memories and learned adaptations remain permanently active. How can I manage the store for you?',
                    timestamp: 'Just now',
                  },
                ])
              }
              title="Clear Chat History"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#a4b3cf] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Brain & Trained Memory Management View */}
        {activeView === 'brain' ? (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#f8f9ff] flex flex-col space-y-4">
            <div className="bg-linear-to-r from-[#0b1c30] to-[#1e293b] text-white p-4 rounded-2xl border border-[#2a3b5c] shadow-sm flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-amber-400">psychology</span>
                  <h4 className="font-bold text-sm sm:text-base">Agent Continuous Knowledge Brain</h4>
                </div>
                <p className="text-xs text-[#a4b3cf] mt-0.5">
                  Autonomous self-training engine that adapts to user interactions, pricing patterns, delivery constraints, and bank workflows.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => rescan()}
                  disabled={isScanning}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl flex items-center gap-1 border border-white/15 transition-all cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isScanning ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                  <span>{isScanning ? 'Scanning...' : 'Re-Scan Chat'}</span>
                </button>
                <button
                  onClick={() => setShowAddRuleForm(!showAddRuleForm)}
                  className="px-3.5 py-1.5 bg-[#4648d4] hover:bg-[#5b5ef0] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add Custom Rule</span>
                </button>
              </div>
            </div>

            {/* Brain Overview Metric Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white p-3 rounded-xl border border-[#dce9ff] shadow-2xs">
                <div className="text-[10px] text-[#767586] font-semibold uppercase">Active Rules</div>
                <div className="text-lg font-bold text-[#0b1c30] mt-0.5 flex items-center gap-1.5">
                  <span>{learnedRules.filter((r) => r.active).length}</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md font-mono">
                    Live
                  </span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#dce9ff] shadow-2xs">
                <div className="text-[10px] text-[#767586] font-semibold uppercase">Pending Adaptations</div>
                <div className="text-lg font-bold text-amber-600 mt-0.5 flex items-center gap-1.5">
                  <span>{pendingCount}</span>
                  {pendingCount > 0 && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md font-mono">
                      Suggested
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#dce9ff] shadow-2xs">
                <div className="text-[10px] text-[#767586] font-semibold uppercase">Conversation Learned</div>
                <div className="text-lg font-bold text-[#4648d4] mt-0.5">
                  {learnedRules.filter((r) => r.source === 'chat_conversation').length}
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#dce9ff] shadow-2xs">
                <div className="text-[10px] text-[#767586] font-semibold uppercase">Manual & System</div>
                <div className="text-lg font-bold text-[#0b1c30] mt-0.5">
                  {learnedRules.filter((r) => r.source !== 'chat_conversation').length}
                </div>
              </div>
            </div>

            {/* Smart Suggested Rules Section (Derived from user interactions) */}
            {suggestedRules.length > 0 && (
              <div className="bg-linear-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-3 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs shadow-xs font-bold">
                      ✨
                    </span>
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-amber-950">
                        AI Detected Adaptations ({suggestedRules.length} Suggested from Conversations)
                      </h5>
                      <p className="text-[11px] text-amber-800">
                        The agent observed repetitive interaction patterns in your chat and proposed these automated rules.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={applyAllSuggestions}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">done_all</span>
                    <span>Adopt All ({suggestedRules.length})</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {suggestedRules.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="bg-white/95 p-3.5 rounded-xl border border-amber-200/70 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-[#0b1c30]">{suggestion.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              suggestion.category === 'pricing'
                                ? 'bg-emerald-100 text-emerald-800'
                                : suggestion.category === 'delivery'
                                ? 'bg-blue-100 text-blue-800'
                                : suggestion.category === 'bank'
                                ? 'bg-purple-100 text-purple-800'
                                : suggestion.category === 'customer'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {suggestion.category}
                          </span>
                          <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-mono font-semibold">
                            {suggestion.confidence}% Confidence
                          </span>
                        </div>
                        <p className="text-xs text-[#334155] font-medium mt-1 leading-relaxed">
                          &ldquo;{suggestion.instruction}&rdquo;
                        </p>
                        <p className="text-[10px] text-[#64748b] mt-1 italic flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-amber-600">info</span>
                          <span>{suggestion.reason}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => applySuggestion(suggestion.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">check</span>
                          <span>Adopt Rule</span>
                        </button>
                        <button
                          onClick={() => dismissSuggestion(suggestion.id)}
                          className="p-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                          title="Dismiss Suggestion"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Rule Form */}
            {showAddRuleForm && (
              <form
                onSubmit={handleAddManualRule}
                className="bg-white p-4 rounded-2xl border border-[#dce9ff] shadow-sm space-y-3 animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs text-[#0b1c30]">Teach New Rule to Agent Brain</h5>
                  <button
                    type="button"
                    onClick={() => setShowAddRuleForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Rule Title (e.g., Student Discount)"
                    value={newRuleTitle}
                    onChange={(e) => setNewRuleTitle(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                    required
                  />
                  <select
                    value={newRuleCategory}
                    onChange={(e) => setNewRuleCategory(e.target.value as any)}
                    className="px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                  >
                    <option value="policy">Policy &amp; Warranty</option>
                    <option value="pricing">Pricing &amp; Discounts</option>
                    <option value="delivery">Delivery &amp; Timing</option>
                    <option value="bank">Bank &amp; Payments</option>
                    <option value="customer">Customer &amp; VIP</option>
                    <option value="general">General Behavior</option>
                  </select>
                </div>
                <textarea
                  placeholder="Exact instruction (e.g., 'Always give 10% discount to students and verify their university ID on WhatsApp.')"
                  value={newRuleInstruction}
                  onChange={(e) => setNewRuleInstruction(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4648d4] hover:bg-[#5b5ef0] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save into Agent Memory
                </button>
              </form>
            )}

            {/* List of learned memory rules */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#767586] px-1">
                <span>Active Knowledge Rules ({learnedRules.length})</span>
                <span className="text-[11px] font-normal">Auto-injected into every AI decision</span>
              </div>

              {learnedRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    rule.active
                      ? 'bg-white border-[#dce9ff] shadow-2xs'
                      : 'bg-[#f1f3f9] border-[#e2e4ec] opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-[#0b1c30]">{rule.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            rule.category === 'pricing'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rule.category === 'delivery'
                              ? 'bg-blue-100 text-blue-800'
                              : rule.category === 'bank'
                              ? 'bg-purple-100 text-purple-800'
                              : rule.category === 'customer'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {rule.category}
                        </span>
                        <span className="text-[10px] text-[#767586] font-mono">
                          {rule.learnedAt} • {rule.source === 'chat_conversation' ? '💬 Learned from Chat' : '⚙️ Config'}
                        </span>
                      </div>
                      <p className="text-xs text-[#464554] mt-1 leading-relaxed">
                        {rule.instruction}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`p-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          rule.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                        }`}
                        title={rule.active ? 'Disable Rule' : 'Enable Rule'}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {rule.active ? 'toggle_on' : 'toggle_off'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Delete Rule"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Chat View */
          <>
            {/* Quick Suggestion Pills */}
            <div className="bg-[#f8f9ff] px-4 py-2.5 border-b border-[#e5eeff] overflow-x-auto flex items-center gap-2 no-scrollbar">
              <span className="text-[10px] font-bold uppercase text-[#767586] tracking-wider shrink-0 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#4648d4]">bolt</span>
                <span>Instant Commands:</span>
              </span>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.query)}
                  className="px-3 py-1 bg-white hover:bg-[#eff4ff] text-[#464554] hover:text-[#4648d4] text-[11px] font-semibold rounded-full border border-[#dce9ff] shadow-2xs shrink-0 transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Context Adaptive Suggestion Alert Pill (if agent extracted a suggested adaptation) */}
            {suggestedRules.length > 0 && (
              <div className="mx-4 mt-3 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2.5 flex-wrap">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                    ✨
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-amber-950">
                        AI Detected Adaptation ({suggestedRules[0].confidence}% Match):
                      </span>
                      <span className="text-[11px] font-semibold text-[#0b1c30] truncate">
                        {suggestedRules[0].title}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 line-clamp-1">
                      &ldquo;{suggestedRules[0].instruction}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => applySuggestion(suggestedRules[0].id)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[13px]">add</span>
                    <span>Adopt Rule</span>
                  </button>
                  <button
                    onClick={() => setActiveView('brain')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    View in Brain ({suggestedRules.length})
                  </button>
                  <button
                    onClick={() => dismissSuggestion(suggestedRules[0].id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Dismiss"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </div>
              </div>
            )}

            {/* Messages Feed */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-linear-to-b from-[#f8f9ff]/50 to-white">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {msg.sender === 'agent' ? (
                    <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#4648d4] to-[#6366f1] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[18px]">psychology</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-[#0b1c30] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#4648d4] text-white rounded-tr-none shadow-sm'
                        : 'bg-white border border-[#e5eeff] text-[#0b1c30] rounded-tl-none shadow-2xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* If a learning rule was extracted & memorized */}
                    {msg.learningLearned && (
                      <div className="mt-3 pt-2.5 border-t border-amber-200 bg-amber-50 -mx-2 -mb-2 p-2.5 rounded-xl text-amber-900 text-xs">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="material-symbols-outlined text-[16px] text-amber-600">
                            psychology
                          </span>
                          <span>New Knowledge Memorized into Brain:</span>
                        </div>
                        <p className="mt-1 text-amber-800 text-[11px] font-medium">
                          &ldquo;{msg.learningLearned.instruction}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* If an action was executed by the agent */}
                    {msg.actionExecuted && (
                      <div className="mt-3 pt-2.5 border-t border-emerald-100 bg-emerald-50/90 -mx-2 -mb-2 p-2.5 rounded-xl flex items-center justify-between gap-2 text-emerald-800 text-xs font-semibold flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[12px] shrink-0">
                            ✓
                          </span>
                          <span>{msg.actionExecuted.description}</span>
                        </div>
                        {msg.actionExecuted.type === 'NAVIGATE_TAB' && (
                          <span className="text-[10px] text-emerald-600 font-mono underline">
                            View Loaded
                          </span>
                        )}
                      </div>
                    )}

                    <div
                      className={`text-[10px] mt-1.5 ${
                        msg.sender === 'user' ? 'text-white/70 text-right' : 'text-[#767586]'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#4648d4] text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                  </div>
                  <div className="bg-white border border-[#e5eeff] rounded-2xl rounded-tl-none p-4 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs text-[#767586]">
                      <span className="w-2 h-2 rounded-full bg-[#4648d4] animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-[#4648d4] animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-[#4648d4] animate-bounce [animation-delay:0.4s]" />
                      <span className="font-semibold text-[#4648d4] ml-1">
                        Learning from context, updating memory &amp; executing store actions...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-[#e5eeff]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Train me or command whole store (e.g., 'Yaad rakhna...', 'Canva 699 kardo', 'Show slips')..."
                    className="w-full pl-4 pr-10 py-3 rounded-2xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-[#0b1c30] placeholder:text-[#767586] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                  />
                  {inputQuery && (
                    <button
                      type="button"
                      onClick={() => setInputQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isLoading}
                  className="px-5 py-3 rounded-2xl bg-[#4648d4] hover:bg-[#6063ee] disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] shrink-0 cursor-pointer"
                >
                  <span>Execute</span>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
              <div className="flex items-center justify-between text-[10px] text-[#767586] mt-2 px-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Self-Training Continuous Memory Active ({learnedRules.filter((r) => r.active).length} Rules)
                </span>
                <span className="font-mono">Real-time Autonomous Site Control</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
