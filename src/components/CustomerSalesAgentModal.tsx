import React, { useState, useRef, useEffect } from 'react';
import { Product, PaymentSettings } from '../types';
import { DEFAULT_PAYMENT_SETTINGS } from '../data/mockData';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  durationTag?: string;
  imageUrl?: string;
}

interface CustomerSalesAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  paymentSettings?: PaymentSettings;
  cart: CartItem[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onNavigateToCheckout: (product?: Product) => void;
  whatsappNumber?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedProduct?: Product;
  action?: {
    type: string;
    productId?: string;
    productName?: string;
    productIds?: string[];
    totalPrice?: number;
  };
}

export const CustomerSalesAgentModal: React.FC<CustomerSalesAgentModalProps> = ({
  isOpen,
  onClose,
  products,
  paymentSettings,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onNavigateToCheckout,
  whatsappNumber,
}) => {
  const safeSettings = paymentSettings || DEFAULT_PAYMENT_SETTINGS;
  const waSupport = whatsappNumber || safeSettings.whatsappSupportNumber || '+923145338340';
  const waDisplay = safeSettings.whatsappDisplay || '0314 5338340';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Assalam-o-Alaikum! 👋 Main **Insight Products** ka AI Sales Assistant hoon.\n\nAap kisi bhi subscription ki current price, package duration, comparison ya order ke baray mein pooch saktay hain.\n\n*Aap Roman Urdu, English, ya Urdu mein baat kar saktay hain!*`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'mjy chat gpt 1 mnth wala chahe',
    'wo video bnane wala ai kitny ka tha',
    'canva sal wala',
    'dono CapCut aur Canva ka total?',
    'Payment methods kya hain?',
  ];

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (userTextToSend?: string) => {
    const text = (userTextToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userTextToSend) setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text,
      }));

      const res = await fetch('/api/sales-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          cart,
          context: {
            products,
            paymentSettings: safeSettings,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.reply || 'Main aapki baat samajh nahi saka, kya aap dobara bata saktay hain?';
      const action = data.action || data.cartAction;

      // Check if a specific product was referenced
      let matchedProduct: Product | undefined;
      if (action?.productId) {
        matchedProduct = products.find((p) => p.id === action.productId);
      } else {
        const lowerReply = replyText.toLowerCase();
        matchedProduct = products.find(
          (p) =>
            lowerReply.includes(p.name.toLowerCase()) ||
            lowerReply.includes(p.shortName.toLowerCase()) ||
            lowerReply.includes(p.id.toLowerCase())
        );
      }

      // Execute client-side cart updates if action block returned
      if (action) {
        if (action.type === 'ADD_TO_CART') {
          if (action.productIds && Array.isArray(action.productIds)) {
            action.productIds.forEach((pid: string) => {
              const p = products.find((x) => x.id === pid);
              if (p) onAddToCart(p, 1);
            });
          } else if (action.productId) {
            const p = products.find((x) => x.id === action.productId);
            if (p) onAddToCart(p, 1);
          }
        } else if (action.type === 'REMOVE_FROM_CART' && action.productId) {
          onRemoveFromCart(action.productId);
        } else if (action.type === 'GO_TO_CHECKOUT') {
          const target = action.productId ? products.find((p) => p.id === action.productId) : undefined;
          onNavigateToCheckout(target);
        }
      }

      const assistantMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProduct: matchedProduct,
        action,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Error calling /api/sales-agent:', err);

      // Intelligent local resilience response
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          sender: 'assistant',
          text: `Ji, main aapki inquiry check kar raha hoon. Aap hamare WhatsApp helpline **${waDisplay}** par bhi kisi bhi waqt rabta kar saktay hain.`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#0b1c30]/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#dce9ff] shadow-2xl w-full max-w-lg h-[92vh] sm:h-[620px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-[#0b1c30] via-[#1e293b] to-[#0284c7] p-4 sm:p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#38bdf8] shadow-inner">
                <span className="material-symbols-outlined text-[26px]">smart_toy</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0b1c30] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-base sm:text-lg tracking-tight">
                  AI Sales Assistant
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  Live Online
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Understands Roman Urdu, Urdu &amp; English • Instant Quotes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {cart.length > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToCheckout();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-[#0b1c30] font-bold text-xs rounded-xl shadow transition-transform hover:scale-105"
                title="View Checkout"
              >
                <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                <span>PKR {calculateCartTotal().toLocaleString()}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Sales Assistant"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Cart Context Banner (if active) */}
        {cart.length > 0 && (
          <div className="bg-[#eff6ff] border-b border-[#dbeafe] px-4 py-2 flex items-center justify-between text-xs text-[#1e3a8a]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#2563eb]">shopping_bag</span>
              <span>
                <strong>{cart.length} item{cart.length > 1 ? 's' : ''}</strong> in cart: {cart.map((c) => c.name).join(', ')}
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                onNavigateToCheckout();
              }}
              className="font-bold text-[#2563eb] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Checkout &rarr;
            </button>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#f8f9ff]">
          {messages.map((m) => {
            const isUrdu = /[\u0600-\u06FF]/.test(m.text);
            return (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-[#4648d4] text-white rounded-tr-none'
                      : 'bg-white text-[#1e293b] border border-[#e2e8f0] rounded-tl-none shadow-sm'
                  } ${isUrdu ? 'text-right font-sans text-[15px]' : ''}`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {/* If assistant recommended or discussed a specific product */}
                  {m.sender === 'assistant' && m.suggestedProduct && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {m.suggestedProduct.imageUrl ? (
                          <img
                            src={m.suggestedProduct.imageUrl}
                            alt={m.suggestedProduct.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {m.suggestedProduct.shortName?.slice(0, 2) || 'PR'}
                          </div>
                        )}
                        <div className="min-w-0 text-left">
                          <p className="font-bold text-xs text-slate-800 truncate">
                            {m.suggestedProduct.shortName || m.suggestedProduct.name}
                          </p>
                          <p className="text-[11px] text-emerald-700 font-extrabold">
                            PKR {m.suggestedProduct.price.toLocaleString()}
                            <span className="text-[10px] text-slate-500 font-normal ml-1">
                              ({m.suggestedProduct.durationTag})
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            if (m.suggestedProduct) onAddToCart(m.suggestedProduct, 1);
                          }}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer"
                        >
                          + Cart
                        </button>
                        <button
                          onClick={() => {
                            onClose();
                            onNavigateToCheckout(m.suggestedProduct);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          Order
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Confirmation Banner */}
                  {m.action && (
                    <div className="mt-2.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">
                          task_alt
                        </span>
                        <span className="font-semibold">
                          {m.action.type === 'ADD_TO_CART'
                            ? 'Added to order selection'
                            : m.action.type === 'REMOVE_FROM_CART'
                            ? 'Removed from selection'
                            : 'Order step updated'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToCheckout(m.suggestedProduct);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-[10px] cursor-pointer"
                      >
                        Checkout &rarr;
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="bg-white border border-[#e2e8f0] rounded-2xl rounded-tl-none p-3 shadow-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span className="text-xs text-slate-500 font-medium">
                  Assistant is thinking &amp; checking live pricing...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-2.5 bg-white border-t border-[#e2e8f0] overflow-x-auto whitespace-nowrap flex items-center gap-1.5 no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-400 pl-1">Ask:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-600 text-xs rounded-full transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-[#e2e8f0]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Poochhein (e.g., 'canva sal wala', 'chat gpt 1 month', 'dono krdo')..."
              className="flex-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-linear-to-r from-[#4648d4] to-[#0284c7] hover:brightness-110 text-white flex items-center justify-center shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
              title="Send Message"
            >
              <span className="material-symbols-outlined text-[19px]">send</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>⚡ Instant answers • No keyword constraints</span>
            <span>WhatsApp: {waDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
