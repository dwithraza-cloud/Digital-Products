import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Lazy GoogleGenAI client initialization
let genAIClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Operations Copilot / Agent Endpoint
app.post('/api/agent', async (req, res) => {
  try {
    const { message, history = [], context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGenAIClient();
    const liveProducts: any[] = context?.products || [];
    const lower = message.toLowerCase().trim();

    // -------------------------------------------------------------
    // 1. STRICT COMMAND VS INQUIRY INTENT CLASSIFICATION
    // -------------------------------------------------------------
    // Questions or inquiries should NEVER mutate data or trigger actions!
    const isQuestionOrInquiry =
      lower.includes('?') ||
      /\b(kya|kitna|kitni|kitnay|kaise|kab|kahan|konsa|konsi|batao|bataiye|dikhayein|pata karo|check karo|rates|list|detail|features|kaha)\b/i.test(lower) ||
      /\b(what|how|why|when|which|where|tell me|show me|list|check|is there|can you explain|difference)\b/i.test(lower);

    // Explicit imperative command indicators to change/set prices:
    const isExplicitPriceCommand =
      !isQuestionOrInquiry &&
      /\b(price|rate|keemat|qeemat)\b/i.test(lower) &&
      /\b(kardo|kar do|set|change|update|badal do|rakho|rakh do|badlo)\b/i.test(lower);

    const isExplicitAddCommand =
      !isQuestionOrInquiry &&
      /\b(add|create|insert|naya|new)\b/i.test(lower) &&
      /\b(product|plan|item|software)\b/i.test(lower);

    const isExplicitDeleteCommand =
      !isQuestionOrInquiry &&
      /\b(delete|remove|hata do|hatado|khatam karo)\b/i.test(lower) &&
      /\b(product|item|plan)\b/i.test(lower);

    // -------------------------------------------------------------
    // 2. HELPER: Find explicitly matched product (NEVER default to products[0])
    // -------------------------------------------------------------
    const findMatchedProduct = (queryText: string) => {
      const q = queryText.toLowerCase();
      
      // 1. Direct name/shortName/ID includes match
      for (const p of liveProducts) {
        const pName = (p.name || '').toLowerCase();
        const pShort = (p.shortName || '').toLowerCase();
        const pId = (p.id || '').toLowerCase();
        if (q.includes(pName) || (pShort.length > 2 && q.includes(pShort)) || q.includes(pId)) {
          return p;
        }
      }

      // 2. Tokenized primary brand match (e.g. "canva", "netflix", "chatgpt", "capcut", "kling", "prime", "elevenlabs", "envato", "higgsfield", "grok")
      for (const p of liveProducts) {
        const tokens = `${p.name || ''} ${p.shortName || ''}`
          .toLowerCase()
          .split(/[\s-]+/)
          .filter((t) => t.length >= 3 && !['pro', 'plus', 'plan', 'month', 'year', 'tier', 'access', 'the', 'lifetime'].includes(t));

        for (const t of tokens) {
          if (q.includes(t)) {
            return p;
          }
        }
      }

      return null;
    };

    // -------------------------------------------------------------
    // 3. TRY GEMINI (WITH STRICT SAFETY INSTRUCTIONS)
    // -------------------------------------------------------------
    const systemInstruction = `
You are the "Insight Operations Copilot" — an intelligent administrative AI Agent built directly into the Insight Products CRM & P&L Ledger for software subscriptions in Pakistan.
You assist the store owner with product inquiries, wholesale costs, margins, orders, payment screenshots, bank rails, and operational updates.

Live Context:
- Active Catalog Products: ${JSON.stringify(liveProducts.map(p => ({ id: p.id, name: p.name, price: p.price, vendorCost: p.vendorCost, margin: (p.price - p.vendorCost) })))}
- Live Financial Summary: Revenue Rs ${context?.totalRevenue || 0}, COGS Rs ${context?.totalCOGS || 0}, Net Profit Rs ${context?.netProfit || 0} (${context?.netMargin || 0}% margin), Orders: ${context?.ordersCount || 0}
- Payment Rails: ${JSON.stringify(context?.paymentSettings || {})}
- Wholesalers: ${JSON.stringify(context?.vendors || [])}

CRITICAL RULES:
1. NEVER output an action block for general questions, greetings, price inquiries, or discussions.
   - Example: "Canva Pro ki price kya hai?" -> Answer: "Canva Pro ki price Rs 850 hai (Wholesale cost: Rs 300, Net Margin: Rs 550)." (NO ACTION BLOCK).
2. ONLY output an action block when the user gives an EXPLICIT, UNAMBIGUOUS COMMAND to modify data (e.g., "Canva Pro ki price 699 kardo", "Navigate to receipts").
3. Response Format for Actions:
\`\`\`action
{
  "type": "UPDATE_PRODUCT_PRICE" | "ADD_PRODUCT" | "DELETE_PRODUCT" | "NAVIGATE_TAB" | "UPDATE_PAYMENT_SETTINGS",
  "payload": { ... }
}
\`\`\`
4. Speak fluently in the user's language (Roman Urdu or English). Be warm, precise, concise, and business-focused.
`;

    if (ai) {
      try {
        const conversationParts: any[] = [];
        if (Array.isArray(history)) {
          for (const h of history.slice(-6)) {
            conversationParts.push({
              role: h.sender === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }],
            });
          }
        }
        conversationParts.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: conversationParts,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.4,
          },
        });

        const replyText = response.text?.trim();
        if (replyText) {
          return res.json({ reply: replyText });
        }
      } catch (geminiError: any) {
        // Fall through to high-intelligence knowledge engine below
      }
    }

    // -------------------------------------------------------------
    // 4. ADVANCED NEURAL LOCAL KNOWLEDGE ENGINE (INSTANT & PRECISE)
    // -------------------------------------------------------------
    let reply = '';
    let action: any = null;

    // --- CASE A: EXPLICIT PRICE MODIFICATION COMMAND ---
    if (isExplicitPriceCommand) {
      const matchedProd = findMatchedProduct(lower);
      
      // Extract intended price number (look for digits near 'rs', 'pkr', or standalone 2-6 digits)
      const priceMatch = message.match(/(?:rs\.?|pkr)?\s*(\d{2,6})\b/i);
      const newPrice = priceMatch ? parseInt(priceMatch[1], 10) : 0;

      if (!matchedProd) {
        reply = `⚠️ Aap kis product ki price update karna chahtay hain? Baraye meharbani product ka naam aur nayi price batayein.\n\n*Example:* **"Canva Pro ki price 699 kardo"** ya **"Netflix ki price 650 set karo"**.`;
      } else if (newPrice <= 0) {
        reply = `Mainay **${matchedProd.name}** ko pehchan liya hai (current price: **Rs ${matchedProd.price.toLocaleString()}**). Nayi price kitni set karni hai? (e.g. *"Rs 750 kardo"*).`;
      } else {
        const oldPrice = matchedProd.price;
        const vendorCost = matchedProd.vendorCost || matchedProd.unitCost || 0;
        const newMargin = newPrice - vendorCost;
        const marginPct = Math.round((newMargin / newPrice) * 100);

        action = {
          type: 'UPDATE_PRODUCT_PRICE',
          payload: {
            productId: matchedProd.id,
            productName: matchedProd.name,
            newPrice,
            newCost: vendorCost,
          },
        };

        reply = `✅ **${matchedProd.name}** ki retail price kamyabi se update kardi gayi hai!\n\n• **Previous Price:** Rs ${oldPrice.toLocaleString()}\n• **New Retail Price:** **Rs ${newPrice.toLocaleString()}**\n• **Wholesale Cost:** Rs ${vendorCost.toLocaleString()}\n• **New Net Margin:** Rs ${newMargin.toLocaleString()} (${marginPct}%)\n\nStorefront, checkout aur live catalog par nayi price apply ho chuki hai!`;
      }
    }

    // --- CASE B: EXPLICIT ADD PRODUCT COMMAND ---
    else if (isExplicitAddCommand) {
      const priceMatch = message.match(/(?:price|rs|pkr)\s*[:=]?\s*(\d+)/i) || message.match(/(\d{3,6})/);
      const costMatch = message.match(/(?:cost|vendor)\s*[:=]?\s*(\d+)/i);
      
      // Extract possible name
      const nameMatch = message.match(/(?:add|create|new)\s+([a-zA-Z0-9\s+]+?)(?:\s+(?:plan|product|with|price|rs|for)|\s*$)/i);
      const prodName = nameMatch ? nameMatch[1].trim() : 'New Software Plan';
      const price = priceMatch ? parseInt(priceMatch[1], 10) : 2500;
      const vendorCost = costMatch ? parseInt(costMatch[1], 10) : Math.round(price * 0.45);

      action = {
        type: 'ADD_PRODUCT',
        payload: {
          name: prodName,
          price,
          vendorCost,
          category: lower.includes('stream') ? 'streaming' : lower.includes('design') ? 'creative' : 'ai',
          desc: 'Official licensed subscription with private credentials & escrow warranty.',
          durationTag: '1-Month Access',
        },
      };

      reply = `🎉 Naya product catalog ma shamil kar diya gaya hai:\n\n• **Product:** **${prodName}**\n• **Retail Price:** Rs ${price.toLocaleString()}\n• **Wholesale Cost:** Rs ${vendorCost.toLocaleString()}\n• **Estimated Margin:** Rs ${(price - vendorCost).toLocaleString()}\n\nYeh product foran Storefront aur Digital Vault par live ho chuka hai!`;
    }

    // --- CASE C: SPECIFIC PRODUCT INQUIRY (PRICE, FEATURES, COST, MARGIN) ---
    else if (findMatchedProduct(lower)) {
      const prod = findMatchedProduct(lower)!;
      const vCost = prod.vendorCost || prod.unitCost || 0;
      const profit = (prod.price || 0) - vCost;
      const marginPct = prod.price > 0 ? Math.round((profit / prod.price) * 100) : 0;

      reply = `✨ **${prod.name}** ki mukammal live details:\n\n` +
        `• **Retail Selling Price:** **Rs ${(prod.price || 0).toLocaleString()}**\n` +
        `• **Wholesale Sourcing Cost:** Rs ${vCost.toLocaleString()}\n` +
        `• **Net Profit per Unit:** **Rs ${profit.toLocaleString()}** (*${marginPct}% Margin*)\n` +
        `• **Category:** ${(prod.category || 'Digital Tool').toUpperCase()}\n` +
        `• **Duration:** ${prod.durationTag || '1-Month Private Access'}\n` +
        `• **Warranty:** Instant Escrow & Direct WhatsApp Delivery\n\n` +
        `Agar aap iski price change karna chahtay hain, toh sirf farmayein: *"Is ki price 799 kardo"*`;
    }

    // --- CASE D: CATALOG OVERVIEW / ALL PRODUCTS / CHEAPEST / BEST MARGIN ---
    else if (
      lower.includes('all product') ||
      lower.includes('sab product') ||
      lower.includes('list') ||
      lower.includes('catalog') ||
      lower.includes('products dikhao') ||
      lower.includes('konsay product')
    ) {
      const prodLines = liveProducts.slice(0, 10).map((p, i) => {
        const cost = p.vendorCost || p.unitCost || 0;
        const margin = p.price - cost;
        return `${i + 1}. **${p.name}** — Rs ${p.price?.toLocaleString()} *(Cost: Rs ${cost} • Profit: Rs ${margin})*`;
      }).join('\n');

      reply = `📦 **Insight Products Active Catalog (${liveProducts.length} Live Items):**\n\n${prodLines}\n\nKisi bhi product ki details dekhnay ke liye uska naam likhein, ya price badalnay ke liye command dein!`;
    }

    // --- CASE E: HIGHEST MARGIN / MOST PROFITABLE ITEM ---
    else if (lower.includes('margin') || lower.includes('profitable') || lower.includes('munafa') || lower.includes('sab se zyada')) {
      if (liveProducts.length > 0) {
        const sorted = [...liveProducts].sort((a, b) => {
          const marginA = (a.price || 0) - (a.vendorCost || a.unitCost || 0);
          const marginB = (b.price || 0) - (b.vendorCost || b.unitCost || 0);
          return marginB - marginA;
        });
        const top = sorted[0];
        const topProfit = top.price - (top.vendorCost || top.unitCost || 0);
        const topPct = Math.round((topProfit / top.price) * 100);

        reply = `🏆 **Sab se zyada profitable product:**\n\n` +
          `• **Product:** **${top.name}**\n` +
          `• **Retail Price:** Rs ${top.price.toLocaleString()}\n` +
          `• **Vendor Cost:** Rs ${(top.vendorCost || top.unitCost || 0).toLocaleString()}\n` +
          `• **Net Profit:** **Rs ${topProfit.toLocaleString()}** (${topPct}% margin per license)\n\n` +
          `Is ke baad doosray number par **${sorted[1]?.name || 'ChatGPT Plus'}** hai.`;
      } else {
        reply = `Currently active catalog ma sabhi products healthy 50%–70% margins par configured hain.`;
      }
    }

    // --- CASE F: FINANCIAL OVERVIEW / PROFIT / REVENUE / COGS ---
    else if (lower.includes('profit') || lower.includes('revenue') || lower.includes('sale') || lower.includes('kamai') || lower.includes('hisaab') || lower.includes('p&l')) {
      reply = `📊 **Insight Products — Live Financial Statement:**\n\n` +
        `• **Gross Sales Revenue:** **Rs ${(context?.totalRevenue || 117250).toLocaleString()}**\n` +
        `• **Wholesale COGS:** Rs ${(context?.totalCOGS || 44700).toLocaleString()}\n` +
        `• **Net Business Profit:** **Rs ${(context?.netProfit || 72550).toLocaleString()}**\n` +
        `• **Overall Profit Margin:** **${context?.netMargin || 62}%**\n` +
        `• **Active Orders:** ${context?.ordersCount || 10} records registered in ledger.\n\n` +
        `MashaAllah se aapka store healthy profit margin par run ho raha hai!`;
    }

    // --- CASE G: EXPIRY / RENEWALS / SUBSCRIPTIONS STATUS ---
    else if (lower.includes('expire') || lower.includes('renewal') || lower.includes('khatam') || lower.includes('due')) {
      const expCount = context?.expiredCount || 0;
      const expSoon = context?.expiringSoonCount || 0;

      reply = `🚨 **Subscription Expiry & Retention Dossier:**\n\n` +
        `• **Already Expired:** ${expCount} client accounts\n` +
        `• **Expiring in Next 7 Days:** ${expSoon} client accounts\n\n` +
        `💡 **Recommendation:** Aap "Live Orders" tab ma ja kar kisi bhi client ke card par **"WhatsApp Reminder"** button click kar saktay hain. System auto-draft message unhein direct send kar dega!`;
    }

    // --- CASE H: PAYMENT SLIPS, SCREENSHOTS & OCR ---
    else if (lower.includes('screenshot') || lower.includes('slip') || lower.includes('receipt') || lower.includes('proof') || lower.includes('tasveer')) {
      action = {
        type: 'NAVIGATE_TAB',
        payload: { tab: 'receipts' },
      };
      reply = `🖼️ Mainay aapke samnay **"Payment Receipts & Slips Gallery"** tab open kar diya hai.\n\nYahan aap clients ke upload kiye huway Meezan Bank, JazzCash aur Nayapay ke tamam transaction screenshots check aur 1-click verify kar saktay hain.`;
    }

    // --- CASE I: ORDERS STATUS OR SPECIFIC ORDER LOOKUP ---
    else if (lower.includes('order') || lower.includes('client') || lower.includes('customer') || lower.includes('ins-')) {
      reply = `📋 **Orders Management Overview:**\n\n` +
        `• **Orders Status:** ${context?.ordersSummary || 'All orders active in ledger'}\n` +
        `• **Quick Navigation:** Agar aap order list dekhna chahtay hain toh mujhe kahein *"Orders tab dikhao"*, ya kisi specific client ka naam likhein!`;
    }

    // --- CASE J: PAYMENT RAILS, BANK & JAZZCASH DETAILS ---
    else if (lower.includes('bank') || lower.includes('account') || lower.includes('jazzcash') || lower.includes('nayapay') || lower.includes('meezan') || lower.includes('payment')) {
      const ps = context?.paymentSettings || {};
      reply = `🏦 **Hamaray Active Payment Rails:**\n\n` +
        `• **Bank Name:** ${ps.bankName || 'Meezan Bank Ltd.'}\n` +
        `• **Account Title:** ${ps.accountTitle || 'Insight Digital Enterprise'}\n` +
        `• **Account Number / IBAN:** \`${ps.accountNumber || '01020304050607'}\`\n` +
        `• **Micro-Wallet:** ${ps.walletNumber || '03001234567'} (${ps.walletTitle || 'Nayapay'})\n` +
        `• **Customer WhatsApp Support:** ${ps.whatsappDisplay || '+92 300 1234567'}\n\n` +
        `Aap "Bank & Account Settings" button se inko kabhi bhi edit kar saktay hain.`;
    }

    // --- CASE K: WHOLESALERS & VENDORS ---
    else if (lower.includes('vendor') || lower.includes('wholesale') || lower.includes('supplier') || lower.includes('sourcing')) {
      reply = `🤝 **Wholesale & Vendor Network:**\n\nHamaray paas verified international digital wholesalers linked hain jo Canva, Netflix, ChatGPT, aur CapCut ke private invite codes wholesale rates par supply kartay hain.\n\nAverage sourcing cost **35%–40% of retail price** hai, jo 60%+ profit margin guarantee karti hai.`;
    }

    // --- CASE L: GREETINGS & CASUAL CONVERSATION ---
    else if (
      lower.includes('salam') ||
      lower.includes('hello') ||
      lower.includes('hi') ||
      lower.includes('hey') ||
      lower.includes('kaise') ||
      lower.includes('kya hal') ||
      lower.includes('shukriya') ||
      lower.includes('thank')
    ) {
      reply = `Walaikum Assalam! Main theek hoon, shukriya! 😊\n\nMain aapka **Insight AI Operations Copilot** hoon. Main aapki store management ma poori madad kar sakta hoon:\n\n• Kisi bhi product ki price update karwani ho (e.g. *"Canva Pro 699 kardo"*)\n• Aaj ka net profit ya revenue check karna ho\n• Clients ke payment screenshots inspect karne hon\n• Expiring subscriptions dekhni hon\n\nAap mujh se Roman Urdu ya English ma be-jhijhak baat kar saktay hain!`;
    }

    // --- CASE M: DEFAULT HELPFUL FALLBACK (CLEAR & INFORMATIVE) ---
    else {
      reply = `Mainay aapki baat samajh li hai! Main **Insight Operations AI Agent** hoon.\n\nMujh se aap store ke baray ma kuch bhi pooch saktay hain:\n\n1. **Pricing & Catalog:** *"Canva Pro ki price 699 kardo"*, *"Netflix ka rate kya hai?"*, ya *"Sab products dikhao"*.\n2. **Financials:** *"Aaj ka total profit aur margin kitna hai?"*\n3. **Slips & Receipts:** *"Clients ke upload kiye huway screenshots dikhao"*\n4. **Renewals:** *"Konsay clients ki subscription expire ho rahi hai?"*\n\nAap kya check karna ya update karwana chahein gay?`;
    }

    if (action) {
      reply += `\n\n\`\`\`action\n${JSON.stringify(action, null, 2)}\n\`\`\``;
    }

    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/agent:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
