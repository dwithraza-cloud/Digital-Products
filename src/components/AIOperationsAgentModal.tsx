import React, { useState, useRef, useEffect } from 'react';
import { Product, Order, Vendor, PaymentSettings } from '../types';

interface AIOperationsAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  vendors: Vendor[];
  paymentSettings: PaymentSettings;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateOrder: (order: Order) => void;
  onUpdatePaymentSettings: (settings: PaymentSettings) => void;
  onNavigateTab: (tab: 'all' | 'orders' | 'products' | 'receipts' | 'crm' | 'vendors') => void;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actionExecuted?: {
    type: string;
    description: string;
  };
}

export const AIOperationsAgentModal: React.FC<AIOperationsAgentModalProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  vendors,
  paymentSettings,
  onUpdateProducts,
  onUpdateOrder,
  onUpdatePaymentSettings,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: `Assalam-o-Alaikum! 🤖 Main **Insight Operations AI Agent** hoon.\n\nMain aapke pure store ko control kar sakta hoon. Mujh se aap **Roman Urdu**, **Urdu**, ya **English** ma kuch bhi pooch saktay hain ya live updates karwa saktay hain:\n\n• *"Canva Pro ki price 699 kardo"*\n• *"Aaj ka total net profit aur sale batao"*\n• *"Clients ke upload kiye huway payment screenshots dikhao"*\n• *"ChatGPT 3-Month Plan add kardo Rs 4500 ma"*\n• *"Konsay clients ki subscription expire ho rahi hai?"*`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

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
      let actionExecuted: { type: string; description: string } | undefined = undefined;
      const actionMatch = rawReply.match(/```action\s*([\s\S]*?)\s*```/);

      if (actionMatch && actionMatch[1]) {
        try {
          const parsedAction = JSON.parse(actionMatch[1]);
          rawReply = rawReply.replace(/```action[\s\S]*?```/g, '').trim();

          // Execute action on application state ONLY if strictly valid
          if (parsedAction.type === 'UPDATE_PRODUCT_PRICE') {
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
          } else if (parsedAction.type === 'NAVIGATE_TAB') {
            const { tab } = parsedAction.payload;
            if (tab) {
              onNavigateTab(tab);
              actionExecuted = {
                type: 'NAVIGATE_TAB',
                description: `Switched view to ${tab.toUpperCase()} section`,
              };
            }
          } else if (parsedAction.type === 'ADD_PRODUCT') {
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
          } else if (parsedAction.type === 'DELETE_PRODUCT') {
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
          } else if (parsedAction.type === 'UPDATE_PAYMENT_SETTINGS') {
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
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      // Local fallback handler if network fails
      const lower = textToSend.toLowerCase();
      let fallbackText = '';
      let actionExecuted: { type: string; description: string } | undefined = undefined;

      const isQuestion =
        lower.includes('?') ||
        /\b(kya|kitna|kitni|kitnay|kaise|rates|batao|check|list|what|how)\b/i.test(lower);

      const isExplicitPriceCommand =
        !isQuestion &&
        /\b(price|rate|keemat)\b/i.test(lower) &&
        /\b(kardo|kar do|set|change|update|badal do)\b/i.test(lower);

      if (isExplicitPriceCommand) {
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
        } else if (!targetProd) {
          fallbackText = `Aap kis product ki price change karna chahtay hain? Baraye meharbani product ka naam batayein (e.g. *"Canva Pro ki price 699 kardo"*).`;
        } else {
          fallbackText = `Mainay **${targetProd.name}** ko pehchan liya hai. Nayi price kitni set karni hai?`;
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
      } else if (lower.includes('expire') || lower.includes('renewal')) {
        fallbackText = `🚨 **Subscriptions Expiry Status:**\n- **Expired:** ${expiredCount} orders\n- **Expiring in 7 Days:** ${expiringSoonCount} orders\n\nAap "Live Orders" tab ma ja kar direct WhatsApp renewal reminders send kar saktay hain.`;
      } else {
        fallbackText = `Mainay aapki request note karli hai. Main aapke orders, products, payment screenshots, aur financial reports ko realtime ma control kar sakta hoon. Kuch aur poochiye ya koi command dein!`;
      }

      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionExecuted,
      };

      setMessages((prev) => [...prev, agentMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: '📊 Aaj ka Net Profit', query: 'Aaj ka total net profit, revenue aur margin kitna hai?' },
    { label: '🖼️ Client Screenshots', query: 'Clients ke upload kiye huway payment screenshots dikhao' },
    { label: '🚨 Expiring Subscriptions', query: 'Konsay clients ki subscription expire ho rahi hai?' },
    { label: '💰 Canva Pro Price 699', query: 'Canva Pro ki price 699 kardo' },
    { label: '➕ Add ChatGPT Plan', query: 'ChatGPT Plus 1-Month Plan add kardo Rs 3500 price aur Rs 1200 cost ma' },
    { label: '🏦 Check Bank Details', query: 'Hamaray active bank account aur JazzCash numbers kya hain?' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0b1c30]/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#dce9ff] shadow-2xl w-full max-w-3xl h-[88vh] max-h-[750px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-[#0b1c30] via-[#1a2b4c] to-[#0b1c30] text-white flex items-center justify-between border-b border-[#2a3b5c]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-[#4648d4] to-[#ea580c] flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[24px] text-white animate-pulse">
                  smart_toy
                </span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0b1c30]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-base sm:text-lg text-white">
                  Insight AI Operations Copilot
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 font-mono">
                  Live Agent
                </span>
              </div>
              <p className="text-[11px] text-[#a4b3cf]">
                Control entire store, edit products, check receipts &amp; analyze profits via chat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'welcome-reset',
                    sender: 'agent',
                    text: 'Chat history cleared. How can I assist you with the store operations?',
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

        {/* Quick Suggestion Pills */}
        <div className="bg-[#f8f9ff] px-4 py-2.5 border-b border-[#e5eeff] overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[10px] font-bold uppercase text-[#767586] tracking-wider shrink-0 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#4648d4]">bolt</span>
            <span>Quick Commands:</span>
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              className="px-3 py-1 bg-white hover:bg-[#eff4ff] text-[#464554] hover:text-[#4648d4] text-[11px] font-semibold rounded-full border border-[#dce9ff] shadow-2xs shrink-0 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

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
                <div className="w-8 h-8 rounded-xl bg-[#4648d4] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
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

                {/* If an action was executed by the agent */}
                {msg.actionExecuted && (
                  <div className="mt-3 pt-2.5 border-t border-emerald-100 bg-emerald-50/80 -mx-2 -mb-2 p-2.5 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[12px] shrink-0">
                      ✓
                    </span>
                    <span>System Action Executed: {msg.actionExecuted.description}</span>
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
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              </div>
              <div className="bg-white border border-[#e5eeff] rounded-2xl rounded-tl-none p-4 shadow-2xs">
                <div className="flex items-center gap-2 text-xs text-[#767586]">
                  <span className="w-2 h-2 rounded-full bg-[#4648d4] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#4648d4] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#4648d4] animate-bounce [animation-delay:0.4s]" />
                  <span className="font-semibold text-[#4648d4] ml-1">
                    Analyzing store state &amp; executing command...
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
                placeholder="Ask in Roman Urdu or English (e.g., 'Canva Pro ki price 699 kardo', 'Show all uploaded slips')..."
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
              className="px-5 py-3 rounded-2xl bg-[#4648d4] hover:bg-[#6063ee] disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] shrink-0"
            >
              <span>Send</span>
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-[#767586] mt-2 px-1">
            <span>Powered by Gemini 2.5 AI Operations Controller</span>
            <span className="font-mono">Real-time bi-directional sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
