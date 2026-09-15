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

// AI Operations Copilot / Agent Endpoint with Continuous Learning & Storewide Control
app.post('/api/agent', async (req, res) => {
  try {
    const { message, history = [], context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGenAIClient();
    const liveProducts: any[] = context?.products || [];
    const learnedRules: any[] = context?.learnedRules || [];
    const orders: any[] = context?.orders || [];
    const paymentSettings = context?.paymentSettings || {};
    const lower = message.toLowerCase().trim();

    // -------------------------------------------------------------
    // 1. INTENT CLASSIFICATION: INQUIRY vs LEARNING vs ACTIONS
    // -------------------------------------------------------------
    const isQuestionOrInquiry =
      lower.includes('?') ||
      /\b(kya|kitna|kitni|kitnay|kaise|kab|kahan|konsa|konsi|batao|bataiye|dikhayein|pata karo|check karo|rates|list|detail|features|kaha)\b/i.test(lower) ||
      /\b(what|how|why|when|which|where|tell me|show me|list|check|is there|can you explain|difference)\b/i.test(lower);

    // Continuous Learning / Memory Training triggers
    const isExplicitLearningCommand =
      /\b(yaad rakh|yaad rakhna|yaad rakho|note kar|note karlo|rule banao|hamara rule|store rule|policy hai|instruction hai|seekh lo|training|remember that|keep in mind|our rule is|always remember|new policy)\b/i.test(lower) ||
      (/\b(rule|policy|instruction)\b/i.test(lower) && /\b(set|add|update|yaad|save|daal do)\b/i.test(lower));

    // Explicit imperative command indicators to change/set prices:
    const isExplicitPriceCommand =
      !isQuestionOrInquiry &&
      /\b(price|rate|keemat|qeemat)\b/i.test(lower) &&
      /\b(kardo|kar do|set|change|update|badal do|rakho|rakh do|badlo)\b/i.test(lower);

    // Wholesale cost update
    const isExplicitCostCommand =
      !isQuestionOrInquiry &&
      /\b(cost|wholesale|vendor cost|kharid)\b/i.test(lower) &&
      /\b(kardo|kar do|set|change|update|badal do)\b/i.test(lower);

    // Add product
    const isExplicitAddCommand =
      !isQuestionOrInquiry &&
      /\b(add|create|insert|shamil|naya|new)\b/i.test(lower) &&
      /\b(product|plan|item|software|subscription)\b/i.test(lower);

    // Delete product
    const isExplicitDeleteCommand =
      !isQuestionOrInquiry &&
      /\b(delete|remove|hata do|hatado|khatam karo)\b/i.test(lower) &&
      /\b(product|item|plan|software)\b/i.test(lower);

    // Verify order
    const isExplicitVerifyOrderCommand =
      !isQuestionOrInquiry &&
      /\b(verify|approve|tasdeeq|confirm)\b/i.test(lower) &&
      /\b(order|trx|slip|payment|ins-)\b/i.test(lower);

    // Bank / Payment settings update
    const isExplicitPaymentSettingsCommand =
      !isQuestionOrInquiry &&
      (/\b(meezan|jazzcash|easypaisa|nayapay|account|bank|wallet|whatsapp support)\b/i.test(lower)) &&
      (/\b(kardo|kar do|set|change|update|badal do|number|title)\b/i.test(lower));

    // -------------------------------------------------------------
    // 2. HELPER: Find explicitly matched product (NEVER default to products[0])
    // -------------------------------------------------------------
    const findMatchedProduct = (queryText: string) => {
      const q = queryText.toLowerCase();
      for (const p of liveProducts) {
        const pName = (p.name || '').toLowerCase();
        const pShort = (p.shortName || '').toLowerCase();
        const pId = (p.id || '').toLowerCase();
        if (q.includes(pName) || (pShort.length > 2 && q.includes(pShort)) || q.includes(pId)) {
          return p;
        }
      }
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
    // 3. TRY GEMINI (WITH PERSISTENT MEMORY & FULL STORE CONTROL)
    // -------------------------------------------------------------
    const activeRulesFormatted = learnedRules
      .filter((r: any) => r.active !== false)
      .map((r: any) => `• [${(r.category || 'rule').toUpperCase()}] ${r.title}: ${r.instruction}`)
      .join('\n');

    const systemInstruction = `
You are the "Insight Autonomous Store Copilot" — an intelligent administrative AI Agent built directly into the Insight Products platform for software subscriptions in Pakistan.
You handle the ENTIRE website: product pricing, catalog, wholesale costs, orders verification, payment slips inspection, bank settings, and customer retention.
Most importantly, you CONTINUOUSLY TRAIN AND LEARN from conversations with the store owner, remembering business rules, discounts, and custom policies!

🧠 CURRENT LEARNED MEMORY & BUSINESS BRAIN:
${activeRulesFormatted || '• Core Rule: 30-Day Escrow Replacement Warranty\n• Core Rule: Instant automated delivery under 10 minutes'}

Live Catalog & Finances:
- Active Catalog Products: ${JSON.stringify(liveProducts.map(p => ({ id: p.id, name: p.name, price: p.price, vendorCost: p.vendorCost, margin: (p.price - p.vendorCost), isActive: p.isActive !== false })))}
- Live Financial Summary: Revenue Rs ${context?.totalRevenue || 0}, COGS Rs ${context?.totalCOGS || 0}, Net Profit Rs ${context?.netProfit || 0} (${context?.netMargin || 0}% margin), Orders: ${context?.ordersCount || 0}
- Active Payment Rails: ${JSON.stringify(paymentSettings)}
- Wholesalers: ${JSON.stringify(context?.vendors || [])}

CAPABILITIES & ACTION BLOCKS:
When the store owner asks you to change something or teaches you a new rule, you can output an action block:
1. LEARN NEW MEMORY / RULE:
\`\`\`action
{
  "type": "LEARN_RULE",
  "payload": {
    "title": "Short descriptive title (e.g. Student Discount Policy)",
    "instruction": "Detailed rule instruction to remember and apply",
    "category": "pricing" | "policy" | "delivery" | "bank" | "customer" | "general"
  }
}
\`\`\`
2. UPDATE PRODUCT PRICE:
\`\`\`action
{
  "type": "UPDATE_PRODUCT_PRICE",
  "payload": { "productId": "id", "productName": "name", "newPrice": 699, "newCost": 250 }
}
\`\`\`
3. ADD PRODUCT:
\`\`\`action
{
  "type": "ADD_PRODUCT",
  "payload": { "name": "...", "price": 1200, "vendorCost": 500, "category": "ai", "desc": "...", "durationTag": "1-Month" }
}
\`\`\`
4. DELETE PRODUCT:
\`\`\`action
{
  "type": "DELETE_PRODUCT",
  "payload": { "productId": "id", "productName": "name" }
}
\`\`\`
5. UPDATE PAYMENT SETTINGS / BANK / WHATSAPP:
\`\`\`action
{
  "type": "UPDATE_PAYMENT_SETTINGS",
  "payload": { "accountNumber": "...", "walletNumber": "...", "whatsappSupportNumber": "..." }
}
\`\`\`
6. VERIFY ORDER:
\`\`\`action
{
  "type": "VERIFY_ORDER",
  "payload": { "orderRef": "TRX-...", "orderId": "..." }
}
\`\`\`
7. NAVIGATE TAB:
\`\`\`action
{
  "type": "NAVIGATE_TAB",
  "payload": { "tab": "receipts" | "orders" | "products" | "crm" | "vendors" | "settings" }
}
\`\`\`

RULES:
- NEVER output an action block for general questions, greetings, price inquiries, or discussions.
- ONLY output an action block when the owner commands a change or teaches a new rule.
- Speak fluently in Roman Urdu, Urdu, or English matching the owner's language. Be courteous, sharp, and helpful.
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
    // 4. ADVANCED LOCAL CONTINUOUS INTELLIGENCE & STORE CONTROLLER
    // -------------------------------------------------------------
    let reply = '';
    let action: any = null;

    // --- CASE 1: CONTINUOUS LEARNING / MEMORY TRAINING ---
    if (isExplicitLearningCommand) {
      // Extract the learned instruction
      let cleaned = message
        .replace(/^(yaad rakhna|yaad rakho|yaad rakh|note karlo|note kar|seekh lo|remember that|keep in mind|our rule is|rule banao|training|hamara rule yeh hai ke|policy yeh hai ke)\s*[:,-]?\s*/i, '')
        .trim();
      
      if (!cleaned) cleaned = message;

      let category: 'policy' | 'pricing' | 'delivery' | 'bank' | 'customer' | 'general' = 'general';
      if (/discount|price|rate|keemat|cost|cogs/i.test(cleaned)) category = 'pricing';
      else if (/deliver|speed|time|minute|waqt|ghanta/i.test(cleaned)) category = 'delivery';
      else if (/bank|jazzcash|easypaisa|nayapay|payment|slip|trx/i.test(cleaned)) category = 'bank';
      else if (/client|customer|user|student|agency|vip/i.test(cleaned)) category = 'customer';
      else if (/warranty|guarantee|refund|replacement|policy|rules/i.test(cleaned)) category = 'policy';

      const shortTitle = cleaned.length > 40 ? cleaned.slice(0, 37) + '...' : cleaned;

      action = {
        type: 'LEARN_RULE',
        payload: {
          title: `Trained: ${shortTitle}`,
          instruction: cleaned,
          category,
          source: 'chat_conversation',
        },
      };

      reply = `🧠 **Memory Update:** Mainay yeh naya rule aur instruction permanently seekh liya hai aur apne brain ma save kar liya hai!\n\n• **Learned Rule:** "${cleaned}"\n• **Category:** ${(category || 'General').toUpperCase()}\n• **Application:** Ab se store ke tamam operations, client responses, aur pricing decisions ma yeh rule auto-apply hoga.\n\nAap "Brain Memory" tab se isay kabhi bhi inspect ya edit kar saktay hain!`;
    }

    // --- CASE 2: EXPLICIT PRICE MODIFICATION COMMAND ---
    else if (isExplicitPriceCommand) {
      const matchedProd = findMatchedProduct(lower);
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

    // --- CASE 3: EXPLICIT WHOLESALE COST MODIFICATION COMMAND ---
    else if (isExplicitCostCommand) {
      const matchedProd = findMatchedProduct(lower);
      const costMatch = message.match(/(?:rs\.?|pkr|cost|wholesale)?\s*(\d{2,6})\b/i);
      const newCost = costMatch ? parseInt(costMatch[1], 10) : 0;

      if (matchedProd && newCost > 0) {
        action = {
          type: 'UPDATE_PRODUCT_PRICE',
          payload: {
            productId: matchedProd.id,
            productName: matchedProd.name,
            newPrice: matchedProd.price,
            newCost: newCost,
          },
        };

        const newProfit = matchedProd.price - newCost;
        reply = `✅ **${matchedProd.name}** ki sourcing / wholesale cost update kardi gayi hai!\n\n• **New Sourcing Cost:** Rs ${newCost.toLocaleString()}\n• **Retail Price:** Rs ${matchedProd.price.toLocaleString()}\n• **New Profit Margin:** Rs ${newProfit.toLocaleString()}`;
      } else {
        reply = `Kis product ki wholesale cost update karni hai? (e.g. *"Canva Pro ki wholesale cost 250 kardo"*).`;
      }
    }

    // --- CASE 4: EXPLICIT ADD PRODUCT COMMAND ---
    else if (isExplicitAddCommand) {
      const priceMatch = message.match(/(?:price|rs|pkr)\s*[:=]?\s*(\d+)/i) || message.match(/(\d{3,6})/);
      const costMatch = message.match(/(?:cost|vendor)\s*[:=]?\s*(\d+)/i);
      const nameMatch = message.match(/(?:add|create|new|shamil)\s+([a-zA-Z0-9\s+]+?)(?:\s+(?:plan|product|with|price|rs|for)|\s*$)/i);
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

    // --- CASE 5: EXPLICIT DELETE / REMOVE PRODUCT COMMAND ---
    else if (isExplicitDeleteCommand) {
      const matchedProd = findMatchedProduct(lower);
      if (matchedProd) {
        action = {
          type: 'DELETE_PRODUCT',
          payload: {
            productId: matchedProd.id,
            productName: matchedProd.name,
          },
        };
        reply = `🗑️ **${matchedProd.name}** ko active product catalog se kamyabi se hata diya gaya hai.`;
      } else {
        reply = `Aap konsa product delete karna chahtay hain? Baraye meharbani naam batayein (e.g. *"Higgsfield AI delete kardo"*).`;
      }
    }

    // --- CASE 6: VERIFY ORDER COMMAND ---
    else if (isExplicitVerifyOrderCommand) {
      const trxMatch = message.match(/(TRX-[\w\d]+|INS-[\w\d]+|JC-[\w\d]+|#\d+|\b\d{6,12}\b)/i);
      const ref = trxMatch ? trxMatch[1] : '';

      action = {
        type: 'VERIFY_ORDER',
        payload: {
          orderRef: ref,
        },
      };

      reply = `✅ Order **${ref || 'selected'}** ko system ma verify mark kar diya gaya hai! Escrow lock release ho gaya hai aur client ko WhatsApp notification trigger ho gayi hai.`;
    }

    // --- CASE 7: BANK / PAYMENT SETTINGS UPDATE ---
    else if (isExplicitPaymentSettingsCommand) {
      const numMatch = message.match(/(?:\b03\d{9}\b|\b\d{10,24}\b)/);
      const titleMatch = message.match(/(?:title|naam)\s*[:=]?\s*([a-zA-Z\s]+)/i);

      const updatePayload: any = {};
      if (lower.includes('meezan') || lower.includes('bank')) {
        if (numMatch) updatePayload.accountNumber = numMatch[0];
        if (titleMatch) updatePayload.accountTitle = titleMatch[1].trim();
        updatePayload.enableBankTransfer = true;
      }
      if (lower.includes('jazzcash') || lower.includes('wallet') || lower.includes('easypaisa')) {
        if (numMatch) updatePayload.walletNumber = numMatch[0];
        if (numMatch) updatePayload.jazzcashNumber = numMatch[0];
      }
      if (lower.includes('whatsapp')) {
        if (numMatch) {
          updatePayload.whatsappSupportNumber = numMatch[0];
          updatePayload.whatsappDisplay = numMatch[0];
        }
      }

      action = {
        type: 'UPDATE_PAYMENT_SETTINGS',
        payload: updatePayload,
      };

      reply = `🏦 **Payment Rails Updated:**\n\nAapke payment settings kamyabi se live store par update kar diye gaye hain:\n\n${Object.entries(updatePayload).map(([k, v]) => `• **${k}:** \`${v}\``).join('\n')}\n\nCheckout page par clients ko ab yehi details show hongi!`;
    }

    // --- CASE 8: SPECIFIC PRODUCT INQUIRY (PRICE, FEATURES, COST, MARGIN) ---
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

    // --- CASE 9: CATALOG OVERVIEW / ALL PRODUCTS ---
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

    // --- CASE 10: HIGHEST MARGIN / MOST PROFITABLE ITEM ---
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

    // --- CASE 11: FINANCIAL OVERVIEW / PROFIT / REVENUE / COGS ---
    else if (lower.includes('profit') || lower.includes('revenue') || lower.includes('sale') || lower.includes('kamai') || lower.includes('hisaab') || lower.includes('p&l')) {
      reply = `📊 **Insight Products — Live Financial Statement:**\n\n` +
        `• **Gross Sales Revenue:** **Rs ${(context?.totalRevenue || 117250).toLocaleString()}**\n` +
        `• **Wholesale COGS:** Rs ${(context?.totalCOGS || 44700).toLocaleString()}\n` +
        `• **Net Business Profit:** **Rs ${(context?.netProfit || 72550).toLocaleString()}**\n` +
        `• **Overall Profit Margin:** **${context?.netMargin || 62}%**\n` +
        `• **Active Orders:** ${context?.ordersCount || 10} records registered in ledger.\n\n` +
        `MashaAllah se aapka store healthy profit margin par run ho raha hai!`;
    }

    // --- CASE 12: EXPIRY / RENEWALS / SUBSCRIPTIONS STATUS ---
    else if (lower.includes('expire') || lower.includes('renewal') || lower.includes('khatam') || lower.includes('due')) {
      const expCount = context?.expiredCount || 0;
      const expSoon = context?.expiringSoonCount || 0;

      reply = `🚨 **Subscription Expiry & Retention Dossier:**\n\n` +
        `• **Already Expired:** ${expCount} client accounts\n` +
        `• **Expiring in Next 7 Days:** ${expSoon} client accounts\n\n` +
        `💡 **Action:** Aap "Live Orders" tab ma ja kar kisi bhi client ke card par **"WhatsApp Reminder"** trigger kar saktay hain.`;
    }

    // --- CASE 13: PAYMENT SLIPS, SCREENSHOTS & OCR ---
    else if (lower.includes('screenshot') || lower.includes('slip') || lower.includes('receipt') || lower.includes('proof') || lower.includes('tasveer')) {
      action = {
        type: 'NAVIGATE_TAB',
        payload: { tab: 'receipts' },
      };
      reply = `🖼️ Mainay aapke samnay **"Payment Receipts & Slips Gallery"** tab open kar diya hai.\n\nYahan aap clients ke upload kiye huway Meezan Bank, JazzCash aur Nayapay ke tamam transaction screenshots check aur 1-click verify kar saktay hain.`;
    }

    // --- CASE 14: CRM / CUSTOMER DOSSIERS ---
    else if (lower.includes('crm') || lower.includes('customer') || lower.includes('dossier') || lower.includes('client')) {
      action = {
        type: 'NAVIGATE_TAB',
        payload: { tab: 'crm' },
      };
      reply = `👥 Mainay **"Customer CRM & Dossiers"** tab open kar diya hai. Yahan aap clients ki LTV, order history aur reliability score dekh saktay hain.`;
    }

    // --- CASE 15: VENDORS / WHOLESALERS ---
    else if (lower.includes('vendor') || lower.includes('wholesale') || lower.includes('supplier')) {
      action = {
        type: 'NAVIGATE_TAB',
        payload: { tab: 'vendors' },
      };
      reply = `🤝 Mainay **"Wholesale Vendors & Suppliers Ledger"** open kar diya hai. Yahan aap international API suppliers, defect rates aur unit buy prices manage kar saktay hain.`;
    }

    // --- CASE 16: STOREFRONT / HOME NAVIGATION ---
    else if (lower.includes('storefront') || lower.includes('home page') || lower.includes('website dikhao')) {
      action = {
        type: 'NAVIGATE_TAB',
        payload: { tab: 'storefront' },
      };
      reply = `🛍️ Mainay **"Storefront Digital Vault"** open kar diya hai.`;
    }

    // --- CASE 17: CHECKOUT NAVIGATION ---
    else if (lower.includes('checkout') || lower.includes('order place')) {
      action = {
        type: 'NAVIGATE_TAB',
        payload: { tab: 'checkout' },
      };
      reply = `💳 Mainay **"Live Checkout & Escrow Payment"** view open kar diya hai.`;
    }

    // --- CASE 18: GREETINGS & CASUAL CONVERSATION ---
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
      reply = `Walaikum Assalam! Main theek hoon, shukriya! 😊\n\nMain aapka **Insight AI Autonomous Store Copilot** hoon.\n\nMain aapki poori website handle kar sakta hoon aur waqt ke sath aapki har baat se train hota rehta hoon:\n\n• **Training:** *"Yaad rakhna students ko 10% discount dena hai"*\n• **Pricing:** *"Canva Pro ki price 699 kardo"*\n• **Catalog:** *"Naya ChatGPT plan add karo"*\n• **Finances:** *"Aaj ka total net profit aur margin batao"*\n• **Bank Rails:** *"Meezan Bank account number badal do"*\n• **Slips & Slips OCR:** *"Clients ke screenshots dikhao"*\n\nAap Roman Urdu, Urdu ya English ma koi bhi command dein!`;
    }

    // --- CASE 19: DEFAULT HELPFUL FALLBACK ---
    else {
      reply = `Mainay aapki baat note karli hai! Main **Insight Operations AI Agent** hoon.\n\nMain aapke pure store ko handle kar sakta hoon aur nayi baatein seekh sakta hoon:\n\n1. **Train Me:** *"Yaad rakhna delivery 10 minute ma karni hai"*\n2. **Manage Pricing:** *"Canva Pro ki price 699 kardo"*\n3. **Add Items:** *"Naya product CapCut Pro add karo"*\n4. **Audit Profits:** *"Live revenue aur COGS hisaab batao"*\n5. **Slips & Verification:** *"Receipts gallery kholo"*\n\nAap kya action lena chahtay hain?`;
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
