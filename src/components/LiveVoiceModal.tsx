import React, { useState, useEffect, useRef } from 'react';
import { Product, PaymentSettings } from '../types';
import { LiveAudioSession, LiveVoiceConfig } from '../utils/audioLiveStream';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSaveProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onUpdateProducts?: (products: Product[]) => void;
  paymentSettings: PaymentSettings;
  onUpdatePaymentSettings?: (settings: PaymentSettings) => void;
  onNavigateTab?: (tab: 'home' | 'checkout' | 'orders' | 'products' | 'receipts' | 'crm' | 'vendors', productId?: string) => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
}

interface TranscriptTurn {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  isPartial?: boolean;
}

interface ExecutedAction {
  id: string;
  type: 'edit' | 'create' | 'delete' | 'bulk' | 'payment' | 'navigate';
  title: string;
  details: string;
  timestamp: string;
}

const AVAILABLE_VOICES = [
  { id: 'Zephyr', name: 'Zephyr', desc: 'Warm, balanced & natural', accent: 'General' },
  { id: 'Puck', name: 'Puck', desc: 'Energetic, upbeat & lively', accent: 'Bright' },
  { id: 'Charon', name: 'Charon', desc: 'Deep, calm & authoritative', accent: 'Rich' },
  { id: 'Kore', name: 'Kore', desc: 'Gentle, clear & soothing', accent: 'Smooth' },
  { id: 'Fenrir', name: 'Fenrir', desc: 'Direct, confident & crisp', accent: 'Focused' },
] as const;

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  products,
  onSaveProduct,
  onDeleteProduct,
  onUpdateProducts,
  paymentSettings,
  onUpdatePaymentSettings,
  onNavigateTab,
  isAdmin = false,
  onOpenAdminLogin,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir'>('Zephyr');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [userVolume, setUserVolume] = useState<number>(0);
  const [modelVolume, setModelVolume] = useState<number>(0);
  const [transcripts, setTranscripts] = useState<TranscriptTurn[]>([]);
  const [executedActions, setExecutedActions] = useState<ExecutedAction[]>([]);
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [activeRightTab, setActiveRightTab] = useState<'transcripts' | 'actions'>('transcripts');

  const sessionRef = useRef<LiveAudioSession | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Keep latest mutable props in refs for real-time tool execution callbacks
  const productsRef = useRef(products);
  productsRef.current = products;
  const paymentSettingsRef = useRef(paymentSettings);
  paymentSettingsRef.current = paymentSettings;

  // Auto-scroll transcript container
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  // Clean up when modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      if (sessionRef.current) {
        sessionRef.current.disconnect();
        sessionRef.current = null;
      }
      setStatus('idle');
      setUserVolume(0);
      setModelVolume(0);
    }
  }, [isOpen]);

  const handleStartSession = async (voiceToUse = selectedVoice) => {
    setStatus('connecting');
    setErrorMessage('');

    const currentProds = productsRef.current;
    const currentSettings = paymentSettingsRef.current;

    const systemPrompt = `
You are the interactive Live Voice Assistant and Store Operations Copilot for "Insight Products" in Pakistan.
Model: gemini-3.1-flash-live-preview (Gemini Live API).
Your goal is to converse smoothly with users in natural, friendly voice in Roman Urdu, Urdu, or English.

STORE CATALOG:
${currentProds.map((p) => `- ${p.name} (ID: ${p.id}, Price: Rs ${p.price}, Duration: ${p.durationTag || 'Monthly'}, Category: ${p.category})`).join('\n')}

BANK & WALLET DETAILS:
- Bank: ${currentSettings.bankName}, Title: ${currentSettings.accountTitle}, Number: ${currentSettings.accountNumber}, IBAN: ${currentSettings.iban}
- Wallet: ${currentSettings.walletName}, Title: ${currentSettings.walletTitle}, Number: ${currentSettings.walletNumber}
- WhatsApp: ${currentSettings.whatsappSupportNumber}

CRITICAL: DIRECT STORE MUTATION VIA TOOL CALLS
Whenever the user speaks an instruction to modify something in the store, you MUST call the appropriate function (tool):
1. "edit_product": Change price, duration, category, or description of any product (e.g. "Canva Pro ki price 600 kardo", "ChatGPT Plus ko 1 Year kardo").
2. "create_product": Add a new product/license (e.g. "Ek naya product add karo Cursor AI 1200 Rs ka").
3. "delete_product": Remove a product (e.g. "Netflix ko catalog se hata do").
4. "bulk_update_prices": Apply discount/price adjustments (e.g. "Sabhi AI products pe 10% discount lagado", "Har product ki price 100 barha do").
5. "update_payment_settings": Change bank account, JazzCash/EasyPaisa number, or WhatsApp contact.
6. "navigate_tab": Switch the active screen (e.g. "Mujhe inventory/products dikhao", "Receipts ledger kholo", "Checkout page par le jao").

After executing the tool, announce the completion verbally in a concise, friendly spoken response in the user's language (Roman Urdu/Urdu/English).
`;

    const config: LiveVoiceConfig = {
      voiceName: voiceToUse,
      systemInstruction: systemPrompt,
      storeContext: {
        products: currentProds.map((p) => ({ id: p.id, name: p.name, price: p.price, category: p.category })),
        paymentSettings: currentSettings,
        isAdmin,
      },
    };

    const session = new LiveAudioSession({
      onOpen: () => {
        setStatus('connected');
      },
      onAudioData: () => {
        setStatus('speaking');
      },
      onUserTranscript: (text) => {
        setTranscripts((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.sender === 'user' && last.isPartial) {
            return [
              ...prev.slice(0, -1),
              { ...last, text: last.text + ' ' + text, isPartial: true },
            ];
          }
          return [
            ...prev,
            {
              id: Date.now() + '-user',
              sender: 'user',
              text: text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              isPartial: true,
            },
          ];
        });
      },
      onModelTranscript: (text) => {
        setTranscripts((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.sender === 'gemini' && last.isPartial) {
            return [
              ...prev.slice(0, -1),
              { ...last, text: last.text + ' ' + text, isPartial: true },
            ];
          }
          return [
            ...prev,
            {
              id: Date.now() + '-gemini',
              sender: 'gemini',
              text: text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              isPartial: true,
            },
          ];
        });
      },
      onInterrupted: () => {
        setStatus('listening');
        setTranscripts((prev) =>
          prev.map((t) => (t.isPartial ? { ...t, isPartial: false, text: t.text + ' [interrupted]' } : t))
        );
      },
      onTurnComplete: () => {
        setStatus('listening');
        setTranscripts((prev) => prev.map((t) => ({ ...t, isPartial: false })));
      },
      onToolCall: async (toolCall) => {
        const functionResponses: Array<{ id: string; response: any }> = [];
        const currentProducts = productsRef.current;
        const currentSettings = paymentSettingsRef.current;

        for (const call of toolCall.functionCalls) {
          const { id, name, args } = call;
          let result: any = { success: false, message: 'Unknown action' };

          try {
            if (name === 'edit_product') {
              const query = (args.productNameOrId || '').toLowerCase().trim();
              const prod = currentProducts.find(
                (p) =>
                  p.id.toLowerCase() === query ||
                  p.name.toLowerCase().includes(query) ||
                  query.includes(p.name.toLowerCase())
              );

              if (prod) {
                const newPrice = args.price !== undefined && args.price !== null ? Number(args.price) : prod.price;
                const updated: Product = {
                  ...prod,
                  name: args.name ? String(args.name) : prod.name,
                  price: newPrice,
                  formattedPrice: `Rs ${newPrice.toLocaleString()}`,
                  durationTag: args.durationTag !== undefined ? String(args.durationTag) : prod.durationTag,
                  category: (args.category as any) || prod.category,
                  desc: args.description ? String(args.description) : prod.desc,
                };

                if (onSaveProduct) {
                  onSaveProduct(updated);
                } else if (onUpdateProducts) {
                  onUpdateProducts(currentProducts.map((p) => (p.id === prod.id ? updated : p)));
                }

                setExecutedActions((prev) => [
                  {
                    id: Date.now().toString(),
                    type: 'edit',
                    title: `Updated: ${updated.name}`,
                    details: `Price: Rs ${updated.price}${args.durationTag ? ` | Duration: ${updated.durationTag}` : ''}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                  ...prev.slice(0, 15),
                ]);

                result = {
                  success: true,
                  message: `Product "${updated.name}" has been updated successfully. New price is Rs ${updated.price}, duration is ${updated.durationTag || 'N/A'}.`,
                  product: updated,
                };
              } else {
                result = {
                  success: false,
                  message: `Product matching "${args.productNameOrId}" was not found. Available products: ${currentProducts.map((p) => p.name).join(', ')}.`,
                };
              }
            } else if (name === 'create_product') {
              const parsedPrice = Number(args.price) || 999;
              const newProd: Product = {
                id: `prod-${Date.now()}`,
                name: String(args.name),
                shortName: String(args.name).split(' ')[0],
                price: parsedPrice,
                formattedPrice: `Rs ${parsedPrice.toLocaleString()}`,
                ref: `REF-${Date.now().toString().slice(-4)}`,
                category: (args.category as any) || 'ai',
                categoryLabel: (args.category as any) === 'creative' ? 'Creative Suite' : 'AI & Productivity',
                tag: 'NEW',
                badge: 'Verified',
                badgeIcon: 'verified',
                durationTag: args.durationTag || '1 Month',
                desc: args.description || `${args.name} digital software subscription license.`,
                features: [
                  'Instant WhatsApp Key Delivery',
                  '30-Day Escrow Replacement Warranty',
                  '100% Private Account Setup',
                ],
                isActive: true,
              };

              if (onSaveProduct) {
                onSaveProduct(newProd);
              } else if (onUpdateProducts) {
                onUpdateProducts([newProd, ...currentProducts]);
              }

              setExecutedActions((prev) => [
                {
                  id: Date.now().toString(),
                  type: 'create',
                  title: `Added Product: ${newProd.name}`,
                  details: `Price: Rs ${newProd.price} | Category: ${newProd.category.toUpperCase()}`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
                ...prev.slice(0, 15),
              ]);

              result = {
                success: true,
                message: `Successfully created and published "${newProd.name}" at Rs ${newProd.price}.`,
                product: newProd,
              };
            } else if (name === 'delete_product') {
              const query = (args.productNameOrId || '').toLowerCase().trim();
              const prod = currentProducts.find(
                (p) =>
                  p.id.toLowerCase() === query ||
                  p.name.toLowerCase().includes(query) ||
                  query.includes(p.name.toLowerCase())
              );

              if (prod) {
                if (onDeleteProduct) {
                  onDeleteProduct(prod.id);
                } else if (onUpdateProducts) {
                  onUpdateProducts(currentProducts.filter((p) => p.id !== prod.id));
                }

                setExecutedActions((prev) => [
                  {
                    id: Date.now().toString(),
                    type: 'delete',
                    title: `Removed Product: ${prod.name}`,
                    details: `Deleted from catalog`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                  ...prev.slice(0, 15),
                ]);

                result = {
                  success: true,
                  message: `Product "${prod.name}" has been deleted from the catalog.`,
                };
              } else {
                result = {
                  success: false,
                  message: `Could not find product "${args.productNameOrId}" to delete.`,
                };
              }
            } else if (name === 'bulk_update_prices') {
              const targetCategory = args.category?.toLowerCase();
              let count = 0;
              const updatedList = currentProducts.map((p) => {
                if (targetCategory && targetCategory !== 'all' && p.category !== targetCategory) {
                  return p;
                }
                count++;
                let newPrice = p.price;
                if (args.percentageChange !== undefined) {
                  newPrice = Math.max(50, Math.round(p.price * (1 + Number(args.percentageChange) / 100)));
                } else if (args.fixedAmountChange !== undefined) {
                  newPrice = Math.max(50, p.price + Number(args.fixedAmountChange));
                }
                return { ...p, price: newPrice, formattedPrice: `Rs ${newPrice.toLocaleString()}` };
              });

              if (onUpdateProducts) {
                onUpdateProducts(updatedList);
              }

              setExecutedActions((prev) => [
                {
                  id: Date.now().toString(),
                  type: 'bulk',
                  title: `Bulk Price Adjustment`,
                  details: `Adjusted prices for ${count} products (${args.percentageChange ? `${args.percentageChange}%` : `Rs ${args.fixedAmountChange}`})`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
                ...prev.slice(0, 15),
              ]);

              result = {
                success: true,
                message: `Successfully adjusted prices for ${count} products.`,
              };
            } else if (name === 'update_payment_settings') {
              const updatedSettings: PaymentSettings = {
                ...currentSettings,
                bankName: args.bankName ?? currentSettings.bankName,
                accountTitle: args.accountTitle ?? currentSettings.accountTitle,
                accountNumber: args.accountNumber ?? currentSettings.accountNumber,
                iban: args.iban ?? currentSettings.iban,
                walletName: args.walletName ?? currentSettings.walletName,
                walletTitle: args.walletTitle ?? currentSettings.walletTitle,
                walletNumber: args.walletNumber ?? currentSettings.walletNumber,
                whatsappSupportNumber: args.whatsappSupportNumber ?? currentSettings.whatsappSupportNumber,
                enableBankTransfer:
                  args.enableBankTransfer !== undefined
                    ? Boolean(args.enableBankTransfer)
                    : currentSettings.enableBankTransfer,
              };

              if (onUpdatePaymentSettings) {
                onUpdatePaymentSettings(updatedSettings);
              }

              setExecutedActions((prev) => [
                {
                  id: Date.now().toString(),
                  type: 'payment',
                  title: `Updated Payment Settings`,
                  details: `Bank: ${updatedSettings.bankName} | Wallet: ${updatedSettings.walletNumber}`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
                ...prev.slice(0, 15),
              ]);

              result = {
                success: true,
                message: `Payment settings and accounts updated successfully.`,
                settings: updatedSettings,
              };
            } else if (name === 'navigate_tab') {
              if (onNavigateTab) {
                onNavigateTab(args.tab as any, args.productId);
              }

              setExecutedActions((prev) => [
                {
                  id: Date.now().toString(),
                  type: 'navigate',
                  title: `Switched View`,
                  details: `Navigated to ${args.tab.toUpperCase()} screen`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
                ...prev.slice(0, 15),
              ]);

              result = {
                success: true,
                message: `Navigated to ${args.tab} screen.`,
              };
            }
          } catch (e: any) {
            console.error('Error executing live voice tool:', e);
            result = { success: false, error: e.message || 'Execution error' };
          }

          functionResponses.push({
            id: id,
            response: result,
          });
        }

        if (sessionRef.current) {
          sessionRef.current.sendToolResponse(functionResponses);
        }
      },
      onVolumeChange: (uVol, mVol) => {
        setUserVolume(uVol);
        setModelVolume(mVol);
        if (mVol > 8) {
          setStatus('speaking');
        } else if (uVol > 8) {
          setStatus('listening');
        }
      },
      onError: (err) => {
        console.error('Session error:', err);
        setErrorMessage(err);
        setStatus('error');
      },
      onClose: () => {
        setStatus('idle');
      },
    });

    sessionRef.current = session;

    try {
      await session.connect(config);
    } catch (err: any) {
      console.error('Connection failed:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to establish live microphone connection');
    }
  };

  const handleStopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.disconnect();
      sessionRef.current = null;
    }
    setStatus('idle');
    setUserVolume(0);
    setModelVolume(0);
  };

  const handleToggleMute = () => {
    if (sessionRef.current) {
      const nextMute = !isMuted;
      sessionRef.current.setMuted(nextMute);
      setIsMuted(nextMute);
    }
  };

  const handleSendTypedMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const textToSend = typedMessage.trim();
    setTypedMessage('');

    if (sessionRef.current && status !== 'idle') {
      sessionRef.current.sendTextMessage(textToSend);
      setTranscripts((prev) => [
        ...prev,
        {
          id: Date.now() + '-typed',
          sender: 'user',
          text: textToSend,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      // If idle, start session with typed message
      handleStartSession().then(() => {
        setTimeout(() => {
          if (sessionRef.current) {
            sessionRef.current.sendTextMessage(textToSend);
          }
        }, 800);
      });
    }
  };

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/75 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#dce9ff] shadow-[0_25px_60px_rgba(11,28,48,0.25)] p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>
          <div className="space-y-1">
            <h2 className="font-headline font-bold text-xl text-[#0b1c30]">
              Admin Authentication Required
            </h2>
            <p className="text-xs text-[#767586]">
              Real-time Voice AI &amp; Store Management Copilot
            </p>
          </div>
          <div className="p-3.5 bg-[#f8f9ff] rounded-2xl border border-[#e5eeff] text-xs text-[#464554] text-left space-y-1.5">
            <p className="font-semibold text-[#0b1c30] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-600">lock</span>
              <span>Restricted to Store Administrators</span>
            </p>
            <p className="text-[11px] leading-relaxed text-[#767586]">
              The Live Voice AI agent has direct administrative privileges to modify product catalogs, adjust prices, and reconfigure bank/EasyPaisa payment credentials. Visitors &amp; customers do not have access.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                onClose();
                if (onOpenAdminLogin) onOpenAdminLogin();
              }}
              className="w-full py-3 px-4 bg-linear-to-r from-[#4648d4] to-[#6063ee] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">key</span>
              <span>Login as Administrator</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-[#eff4ff] text-[#464554] hover:text-[#0b1c30] font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentVolume = status === 'speaking' ? modelVolume : userVolume;
  const orbScale = 1 + Math.min(0.6, (currentVolume / 100) * 0.7);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0b1c30]/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#dce9ff] shadow-[0_25px_60px_rgba(11,28,48,0.25)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e5eeff] bg-linear-to-r from-[#f8f9ff] via-[#eff4ff] to-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-[#4648d4] to-[#ea580c] text-white flex items-center justify-center shadow-md shadow-[#4648d4]/20 shrink-0">
              <span className="material-symbols-outlined text-[22px]">graphic_eq</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline font-bold text-base sm:text-lg text-[#0b1c30]">
                  Admin Live Voice Copilot
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="material-symbols-outlined text-[12px]">security</span>
                  Admin Exclusive
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#eff4ff] text-[#4648d4] border border-[#dce9ff]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Gemini Live API
                </span>
              </div>
              <p className="text-xs text-[#767586]">
                Speak naturally in Roman Urdu or English to query &amp; edit products, prices, and bank details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {executedActions.length > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-xl border border-emerald-200 font-bold">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                {executedActions.length} Actions Executed
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-[#eff4ff] text-[#464554] hover:text-[#0b1c30] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Panel: Voice Orb, Controls & Voice Selection */}
          <div className="lg:col-span-5 p-5 sm:p-6 bg-[#fbfdff] border-b lg:border-b-0 lg:border-r border-[#e5eeff] flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Voice Orb & Visualizer */}
              <div className="relative flex flex-col items-center justify-center py-4">
                <div
                  className="relative w-36 h-36 rounded-full flex items-center justify-center transition-transform duration-75 ease-out shadow-2xl cursor-pointer"
                  style={{
                    transform: `scale(${orbScale})`,
                    background:
                      status === 'speaking'
                        ? 'radial-gradient(circle at 30% 30%, #ea580c, #4648d4, #0b1c30)'
                        : status === 'listening'
                        ? 'radial-gradient(circle at 30% 30%, #38bdf8, #4648d4, #1e1b4b)'
                        : status === 'connecting'
                        ? 'radial-gradient(circle at 30% 30%, #facc15, #ea580c, #4648d4)'
                        : 'radial-gradient(circle at 30% 30%, #94a3b8, #64748b, #334155)',
                  }}
                  onClick={() => {
                    if (status === 'idle') handleStartSession();
                    else handleToggleMute();
                  }}
                >
                  {/* Outer pulse aura */}
                  {(status === 'speaking' || status === 'listening') && (
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-30 pointer-events-none"
                      style={{
                        background: status === 'speaking' ? '#ea580c' : '#4648d4',
                      }}
                    />
                  )}

                  <div className="text-white text-center select-none">
                    <span className="material-symbols-outlined text-[38px] drop-shadow-md">
                      {status === 'speaking'
                        ? 'volume_up'
                        : isMuted
                        ? 'mic_off'
                        : status === 'listening'
                        ? 'mic'
                        : status === 'connecting'
                        ? 'sync'
                        : 'mode_comment'}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4 text-center space-y-1">
                  <div className="font-headline font-bold text-sm text-[#0b1c30] capitalize flex items-center justify-center gap-1.5">
                    {status === 'speaking' && <span className="text-[#ea580c] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ea580c] animate-ping" /> Gemini Speaking...</span>}
                    {status === 'listening' && <span className="text-[#4648d4] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4648d4] animate-pulse" /> Listening to you...</span>}
                    {status === 'connecting' && <span className="text-amber-600 animate-pulse">Establishing Live Stream...</span>}
                    {status === 'idle' && <span className="text-[#767586]">Ready to Start Conversation</span>}
                    {status === 'error' && <span className="text-red-600">Connection Error</span>}
                  </div>
                  <p className="text-[11px] text-[#767586]">
                    {status === 'idle'
                      ? 'Click "Start Conversation" to begin voice control'
                      : isMuted
                      ? 'Microphone is currently muted'
                      : 'Speak naturally in Roman Urdu, Urdu, or English'}
                  </p>
                </div>
              </div>

              {/* Voice Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0b1c30] flex items-center justify-between">
                  <span>Select Gemini AI Voice</span>
                  <span className="text-[10px] text-[#767586] font-normal">Prebuilt Audio Persona</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5">
                  {AVAILABLE_VOICES.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      disabled={status !== 'idle'}
                      onClick={() => setSelectedVoice(v.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedVoice === v.id
                          ? 'bg-[#eff4ff] border-[#4648d4] ring-1 ring-[#4648d4]'
                          : 'bg-white border-[#e5eeff] hover:bg-[#f8f9ff]'
                      } ${status !== 'idle' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0b1c30]">{v.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white text-[#767586] border border-[#e5eeff]">
                          {v.accent}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#767586] mt-0.5 line-clamp-1">{v.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar / Primary Trigger */}
            <div className="pt-6 space-y-2.5">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>Session Error</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{errorMessage}</p>
                </div>
              )}

              {status === 'idle' || status === 'error' ? (
                <button
                  type="button"
                  onClick={() => handleStartSession()}
                  className="w-full py-3.5 px-4 bg-linear-to-r from-[#4648d4] via-[#6366f1] to-[#ea580c] hover:brightness-110 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                  <span>Start Live Voice Conversation</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isMuted
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-[#eff4ff] hover:bg-[#dce9ff] text-[#4648d4]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isMuted ? 'mic_off' : 'mic'}
                    </span>
                    <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStopSession}
                    className="flex-1 py-3 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">call_end</span>
                    <span>End Call</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Live Dynamic Transcript Feed & Action Center */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-white overflow-hidden">
            {/* Header Tabs */}
            <div className="p-3 sm:px-4 border-b border-[#e5eeff] bg-[#fbfdff] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveRightTab('transcripts')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeRightTab === 'transcripts'
                      ? 'bg-[#4648d4] text-white shadow-xs'
                      : 'bg-transparent text-[#767586] hover:text-[#0b1c30]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">notes</span>
                  <span>Live Transcripts</span>
                  {transcripts.length > 0 && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">
                      {transcripts.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveRightTab('actions')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeRightTab === 'actions'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-transparent text-[#767586] hover:text-[#0b1c30]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Voice Actions</span>
                  {executedActions.length > 0 && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">
                      {executedActions.length}
                    </span>
                  )}
                </button>
              </div>

              {transcripts.length > 0 && activeRightTab === 'transcripts' && (
                <button
                  type="button"
                  onClick={() => setTranscripts([])}
                  className="text-[11px] text-[#767586] hover:text-[#0b1c30] transition-colors cursor-pointer"
                >
                  Clear log
                </button>
              )}
            </div>

            {/* Tab 1: Transcripts Scroll Area */}
            {activeRightTab === 'transcripts' && (
              <div
                ref={chatScrollRef}
                className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 min-h-[260px] max-h-[380px] bg-[#fcfdff]"
              >
                {/* Voice Action Announcement Banner if recent action executed */}
                {executedActions.length > 0 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      </div>
                      <div>
                        <span className="font-bold">{executedActions[0].title}</span>
                        <p className="text-[11px] text-emerald-700">{executedActions[0].details}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-mono shrink-0">{executedActions[0].timestamp}</span>
                  </div>
                )}

                {transcripts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 text-[#767586] space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#4648d4] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">forum</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#0b1c30]">No spoken turns yet</p>
                      <p className="text-[11px] max-w-xs">
                        Start the call and speak in Roman Urdu or English. You can ask questions or directly give edit commands!
                      </p>
                    </div>

                    {/* Starter Voice Commands */}
                    <div className="pt-2 w-full max-w-md space-y-1.5 text-left">
                      <span className="text-[10px] font-bold text-[#767586] uppercase tracking-wider block">
                        Try Speaking These Commands:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (status === 'idle') handleStartSession();
                        }}
                        className="w-full text-left text-xs p-2.5 rounded-xl bg-white border border-[#e5eeff] hover:border-[#4648d4] text-[#464554] transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                      >
                        <span>&ldquo;Canva Pro ki price 600 kardo aur duration 1 Year set karo&rdquo;</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Edit Price</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (status === 'idle') handleStartSession();
                        }}
                        className="w-full text-left text-xs p-2.5 rounded-xl bg-white border border-[#e5eeff] hover:border-[#4648d4] text-[#464554] transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                      >
                        <span>&ldquo;Ek naya product add karo Cursor AI 1200 Rs ka&rdquo;</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">Add Product</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (status === 'idle') handleStartSession();
                        }}
                        className="w-full text-left text-xs p-2.5 rounded-xl bg-white border border-[#e5eeff] hover:border-[#4648d4] text-[#464554] transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                      >
                        <span>&ldquo;Sabhi AI tools pe 10% discount lagado&rdquo;</span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">Bulk Discount</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  transcripts.map((t) => (
                    <div
                      key={t.id}
                      className={`flex flex-col ${t.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-[#767586]">
                          {t.sender === 'user' ? 'You' : `Gemini Live (${selectedVoice})`}
                        </span>
                        <span className="text-[9px] text-[#9ca3af]">{t.timestamp}</span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                          t.sender === 'user'
                            ? 'bg-[#4648d4] text-white rounded-br-xs'
                            : 'bg-white text-[#0b1c30] border border-[#e5eeff] shadow-xs rounded-bl-xs'
                        }`}
                      >
                        {t.text}
                        {t.isPartial && <span className="inline-block w-1.5 h-3 bg-current ml-1 animate-pulse" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Executed Voice Actions Log */}
            {activeRightTab === 'actions' && (
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 min-h-[260px] max-h-[380px] bg-[#fcfdff]">
                {executedActions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#767586] space-y-2">
                    <span className="material-symbols-outlined text-[32px] text-slate-300">pending_actions</span>
                    <p className="text-xs font-bold text-[#0b1c30]">No voice actions executed yet</p>
                    <p className="text-[11px] max-w-xs">
                      Tell the AI voice to edit products, prices, add items, or update settings. All changes will be logged here in real time!
                    </p>
                  </div>
                ) : (
                  executedActions.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 bg-white border border-[#e5eeff] rounded-2xl shadow-xs flex items-start justify-between gap-3 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${
                            act.type === 'edit'
                              ? 'bg-[#4648d4]'
                              : act.type === 'create'
                              ? 'bg-emerald-600'
                              : act.type === 'delete'
                              ? 'bg-red-600'
                              : act.type === 'bulk'
                              ? 'bg-purple-600'
                              : 'bg-amber-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {act.type === 'edit'
                              ? 'edit'
                              : act.type === 'create'
                              ? 'add_circle'
                              : act.type === 'delete'
                              ? 'delete'
                              : act.type === 'bulk'
                              ? 'percent'
                              : 'tune'}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#0b1c30]">{act.title}</h4>
                          <p className="text-[11px] text-[#464554] mt-0.5">{act.details}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#767586] font-mono shrink-0">{act.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Typed Text Input Fallback */}
            <form
              onSubmit={handleSendTypedMessage}
              className="p-3 bg-white border-t border-[#e5eeff] flex items-center gap-2"
            >
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder={status === 'idle' ? 'Start call or type: "Canva Pro ki price 600 kardo"...' : 'Send typed instruction into live stream...'}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-[#0b1c30] placeholder-[#767586] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
              />
              <button
                type="submit"
                disabled={!typedMessage.trim()}
                className="px-4 py-2.5 bg-[#4648d4] hover:bg-[#6063ee] disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
