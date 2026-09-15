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
    const { message, history, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGenAIClient();

    const systemInstruction = `
You are the "Insight Operations Copilot" — an intelligent administrative AI Agent built directly into the Insight Products CRM & P&L Ledger.
You help the business administrator manage live software subscriptions, client orders, payment proofs, catalog products, pricing, wholesale sourcing costs, and customer dossiers in Pakistan.

Your personality:
- Highly professional, efficient, proactive, and friendly.
- Fluent in English, Urdu, and Roman Urdu (e.g., "G haan sir, mainay Canva Pro ki price update kardi hai"). Match the language of the user seamlessly.
- You have real-time access to the store's current live state via the attached context.

Live Context Summary:
- Products: ${JSON.stringify(context?.products || [])}
- Orders Summary: ${context?.ordersSummary || 'No summary'}
- Payment Rails: ${JSON.stringify(context?.paymentSettings || {})}
- Wholesalers: ${JSON.stringify(context?.vendors || [])}

Action Capability:
When the user instructs you to perform an operational action (e.g. change a price, add a product, delete a product, update bank numbers, verify an order, or generate a renewal message), you MUST include an "action" object in your JSON response or specify the exact parameters.

Response Format:
You should output a clean, helpful response. If an action should be executed on the client UI, include an action block formatted as:
\`\`\`action
{
  "type": "UPDATE_PRODUCT_PRICE" | "ADD_PRODUCT" | "DELETE_PRODUCT" | "UPDATE_PAYMENT_SETTINGS" | "VERIFY_ORDER" | "SEARCH_ORDERS" | "NAVIGATE_TAB",
  "payload": { ... }
}
\`\`\`

Action Types:
1. UPDATE_PRODUCT_PRICE: { "productId": string or "productName": string, "newPrice": number, "newCost"?: number }
2. ADD_PRODUCT: { "name": string, "price": number, "vendorCost": number, "category": string, "desc"?: string, "durationTag"?: string }
3. DELETE_PRODUCT: { "productId": string or "productName": string }
4. UPDATE_PAYMENT_SETTINGS: { "bankName"?: string, "accountNumber"?: string, "accountTitle"?: string, "walletNumber"?: string, "whatsappSupportNumber"?: string }
5. VERIFY_ORDER: { "orderId"?: string, "refNumber"?: string, "status": "Verified" | "Dispatched" | "Awaiting Slip" }
6. NAVIGATE_TAB: { "tab": "orders" | "products" | "receipts" | "crm" | "vendors" }

Always provide a concise, natural, and helpful explanation before or after the action.
`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Message: ${message}` }] },
          ],
        });

        const replyText = response.text || 'I have processed your request.';
        return res.json({ reply: replyText });
      } catch (geminiError: any) {
        console.warn('Gemini 3.8 Flash request failed, trying gemini-3.6-flash fallback:', geminiError?.message);
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [
              { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Message: ${message}` }] },
            ],
          });
          const replyText = fallbackResponse.text || 'I have processed your request.';
          return res.json({ reply: replyText });
        } catch (innerError) {
          console.warn('Gemini API fallback also failed, switching to smart local agent:', innerError);
          // Fall through to local heuristic planner below
        }
      }
    }

    // Intelligent built-in local heuristic planner if API key is not configured or network fallback
    const lower = message.toLowerCase();
      let reply = '';
      let action = null;

      if (lower.includes('price') && (lower.includes('kardo') || lower.includes('change') || lower.includes('set') || lower.includes('update'))) {
        // extract price numbers
        const numMatch = message.match(/(\d+[\d,]*)/);
        const newPrice = numMatch ? parseInt(numMatch[1].replace(/,/g, ''), 10) : 0;
        
        let targetProd = context?.products?.[0];
        if (context?.products) {
          for (const p of context.products) {
            if (lower.includes(p.name.toLowerCase()) || lower.includes(p.shortName.toLowerCase())) {
              targetProd = p;
              break;
            }
          }
        }

        if (targetProd && newPrice > 0) {
          action = {
            type: 'UPDATE_PRODUCT_PRICE',
            payload: { productId: targetProd.id, productName: targetProd.name, newPrice },
          };
          reply = `✅ Mainay **${targetProd.name}** ki retail price update karke **Rs ${newPrice.toLocaleString()}** set kardi hai. Storefront aur checkout par nayi price apply ho chuki hai!`;
        } else {
          reply = `Aap kis product ki price change karna chahtay hain? Baraye meharbani product ka naam aur nayi price batayein (e.g. *"Canva Pro ki price 699 kardo"*).`;
        }
      } else if (lower.includes('profit') || lower.includes('revenue') || lower.includes('sale') || lower.includes('kamai')) {
        reply = `📊 **Live Financial Overview:**\n- **Gross Revenue:** Rs ${context?.totalRevenue?.toLocaleString() || '117,250'}\n- **Wholesale COGS:** Rs ${context?.totalCOGS?.toLocaleString() || '44,700'}\n- **Net Profit:** Rs ${context?.netProfit?.toLocaleString() || '72,550'} (*${context?.netMargin || 62}% Margin*)\n- **Active Orders:** ${context?.ordersCount || 10} records in live ledger.`;
      } else if (lower.includes('expire') || lower.includes('renewal')) {
        reply = `🚨 **Software Expiry Alert:**\nLedger ma ${context?.expiredCount || 2} subscriptions expired hain aur ${context?.expiringSoonCount || 2} aglay 7 din ma expire honay wali hain.\n\nAap "Live Orders" ya "Payment Slips" tab ma ja kar 1-click **WhatsApp Renewal Reminder** bhej saktay hain!`;
      } else if (lower.includes('screenshot') || lower.includes('slip') || lower.includes('receipt') || lower.includes('proof')) {
        action = {
          type: 'NAVIGATE_TAB',
          payload: { tab: 'receipts' },
        };
        reply = `🖼️ Mainay aapko **"Customer Payment Slips & Verification Gallery"** par switch kar diya hai. Yahan aap saray clients ke upload kiye huway bank/JazzCash screenshots inspect aur verify kar saktay hain.`;
      } else if (lower.includes('bank') || lower.includes('account') || lower.includes('jazzcash') || lower.includes('nayapay')) {
        reply = `🏦 **Current Live Payment Rails:**\n- **Bank:** ${context?.paymentSettings?.bankName || 'Meezan Bank'} (${context?.paymentSettings?.accountNumber || '01020304050607'})\n- **Title:** ${context?.paymentSettings?.accountTitle || 'Insight Digital Enterprise'}\n- **Wallet:** ${context?.paymentSettings?.walletNumber || '03001234567'} (${context?.paymentSettings?.walletTitle || 'Nayapay'})\n- **Support WhatsApp:** ${context?.paymentSettings?.whatsappDisplay || '+92 300 1234567'}\n\nAap "Bank & Account Settings" button se inko direct change kar saktay hain ya mujhay direct command de saktay hain!`;
      } else {
        reply = `Assalam-o-Alaikum! Main Insight Operations AI Copilot hoon. Main aapke orders, financial P&L, customer screenshots, wholesale sourcing, aur product catalog ko manage karne ma madad kar sakta hoon.\n\nAap mujh se pooch saktay hain:\n- *"Aaj total net profit kitna hai?"*\n- *"Canva Pro ki price 699 kardo"*\n- *"Client ke upload kiye huway payment screenshots dikhao"*\n- *"Konsi subscriptions expire honay wali hain?"*`;
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
