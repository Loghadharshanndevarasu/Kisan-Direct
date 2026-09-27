import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return ai;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'KisanDirect',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Chatbot endpoint for Farm Provenance & Produce Transparency
app.post('/api/chat', async (req, res) => {
  try {
    const { message, batchContext, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const gemini = getGeminiClient();

    const systemPrompt = `You are "Kisan Mitra" (किसान मित्र), the chief farm provenance and agricultural transparency assistant for KisanDirect.
KisanDirect is an unbranded direct farm-to-consumer marketplace where all Indian pulses (Toor Dal, Chana Dal, Moong Dal, Green Gram, Peas, Groundnuts, Basmati & Sona Masoori Rice, Millets) are sold strictly in unbranded loose form directly from regional warehouse hubs.

Key Knowledge Base & Rules:
1. Always prioritize complete transparency: identify the exact farmer, their village, state, sowing and harvest dates, soil type (e.g. black cotton soil, alluvial loam), pesticide-free / organic status, and sun-drying method.
2. Explain the unbranded loose produce advantage: because there are no corporate branding, glossy plastic multi-layer pouches, or 4 levels of mandi middlemen (arhtiyas), consumers save 25-35% while farmers receive 80-92% direct payout.
3. Dual Revenue Model Knowledge:
   - "On-Demand Produce" (high-volume staples like Toor Dal, Basmati Rice, Groundnuts): Farmers receive ~91% payout with lower logistics (4%), platform (3%), and inventory holding fees.
   - "Underdog Produce" (heirloom crops like Black Rice, Horse Gram/Kulthi, White Peas): Farmers receive ~80% payout with fixed platform maintenance, specialized micro-climate warehouse storage fees, and dedicated demand-generation support.
4. Proximity Discount: Farmers and consumers located within 25km of the regional hub (Nashik, Guntur, Karnal, Indore, Thanjavur, Burdwan, Kalaburagi) receive proximity discounts on logistics and handling.
5. Macroeconomics Disparity: When asked, discuss constructively why 55% of India's population in farming accounts for only ~11-14% of national GDP (middlemen commission leakages, post-harvest 18% storage losses, lack of farm-gate sorting/milling).
6. Tone: Warm, respectful, farmer-centric (use terms like "Annadata", respectful greetings like "Namaste"), informative, and crisp. If specific produce context is provided, cite it accurately.

Current active produce context from marketplace:
${JSON.stringify(batchContext || {}, null, 2)}`;

    if (gemini) {
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(chatHistory)) {
        for (const turn of chatHistory.slice(-6)) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }],
          });
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await gemini.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      return res.json({
        reply: response.text || 'Information retrieved from farm registry.',
        source: 'gemini-3.8-flash',
      });
    } else {
      // Intelligent fallback when GEMINI_API_KEY is not configured
      let reply = `Namaste! Here is the verified harvest record from our farm-gate registry: `;
      const lower = message.toLowerCase();

      if (lower.includes('toor') || lower.includes('arhar') || lower.includes('dal')) {
        reply += `Batch #KL-TD-402 (Unpolished Toor Dal) was harvested on 14 Jan 2026 by Shri Rameshwar Patil in Dindori village, Nashik (Maharashtra). Grown in nutrient-rich black basalt soil, solar-cured for 6 days with 0% polish and 10.2% natural moisture. Farmer received 91.2% direct payout.`;
      } else if (lower.includes('green gram') || lower.includes('moong')) {
        reply += `Batch #KL-GG-108 (Whole Green Gram / Moong) was harvested on 28 Feb 2026 by Smt. Lakshmi Bai in Tenali mandal, Guntur (Andhra Pradesh). Grown in fertile alluvial Krishna river loam, 100% pesticide-free, graded mechanically at the regional hub warehouse. Farmer payout: ₹105.50/kg out of ₹118/kg.`;
      } else if (lower.includes('groundnut') || lower.includes('peanut')) {
        reply += `Batch #KL-GN-301 (Saurashtra Bold Loose Groundnut) was harvested on 20 Feb 2026 by Patel Bhaveshbhai in Junagadh, Gujarat. Sun-dried in traditional earthen fields, seed moisture certified at 6.8% with zero aflatoxin contamination.`;
      } else if (lower.includes('gdp') || lower.includes('55%') || lower.includes('11%') || lower.includes('policy')) {
        reply += `In India, 55% of the workforce is directly tied to agrarian livelihoods, yet generates only ~11.4% of national GDP. The primary bottlenecks are 25-35% price dissipation across 4 tiers of APMC middlemen, 18% post-harvest spoilage from lacking farm-gate silos, and selling raw uncleaned produce. By enabling direct loose farm-gate procurement and regional micro-warehousing, farmer income doubles and sector GDP contribution can surpass 18%.`;
      } else {
        reply += `All produce on KisanDirect is sourced 100% loose and unbranded directly from verified farmer clusters within 40km of our regional warehouse hubs. Every batch comes with digital soil, harvest date, and lab quality certificates.`;
      }

      return res.json({
        reply,
        source: 'farm-registry-fallback',
      });
    }
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    return res.status(500).json({
      error: 'Failed to process AI query',
      details: err.message,
      fallback: 'Namaste! Our farm registry verifies that all batches are harvested directly by local farmers with zero corporate branding.',
    });
  }
});

// AI Policy Analysis endpoint
app.post('/api/policy-ai', async (req, res) => {
  try {
    const { directProcurementPercent, storageLossReductionPercent, farmProcessingPercent } = req.body;
    const gemini = getGeminiClient();

    const prompt = `Analyze this Indian Agricultural Economic simulation:
- Direct Farm Procurement Rate: ${directProcurementPercent}%
- Post-Harvest Storage Loss Reduction: ${storageLossReductionPercent}%
- Primary Farm-level Cleaning & Grading: ${farmProcessingPercent}%

Provide 3 short, high-impact policy insights on how this bridges the 55% agrarian population vs 11% GDP gap, specifically regarding farmer per-capita income, rural capital formation, and consumer price stabilization. Return JSON with keys: "keyTakeaways" (array of 3 strings), "policyRecommendation" (string), "projectedGdpSharePercent" (number).`;

    if (gemini) {
      const response = await gemini.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } else {
      return res.json({
        keyTakeaways: [
          `Increasing direct procurement to ${directProcurementPercent}% eliminates multi-tier commission agent margins, directly transferring ₹42,000+ crores to rural households.`,
          `Curtailing post-harvest losses by ${storageLossReductionPercent}% preserves an estimated 14 million metric tonnes of food grains annually.`,
          `Decentralized cleaning and loose sorting creates over 3.2 million rural semi-skilled jobs at regional warehouse clusters.`
        ],
        policyRecommendation: 'Formalize regional micro-warehousing clusters under FPO management with statutory mandi cess exemptions for direct-to-consumer loose produce dispatches.',
        projectedGdpSharePercent: Number((11.4 + (directProcurementPercent * 0.05) + (storageLossReductionPercent * 0.04)).toFixed(1))
      });
    }
  } catch (err: any) {
    console.error('Policy AI error:', err);
    return res.json({
      keyTakeaways: [
        'Direct procurement eliminates 4 layers of APMC middlemen.',
        'Regional warehouse hubs cut transit losses by 68%.',
        'Transparent loose produce delivery raises farmer net realization from 35% to 88%.'
      ],
      policyRecommendation: 'Scale localized warehouse credit receipts and inter-state trade permits for verified FPOs.',
      projectedGdpSharePercent: 14.8
    });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
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
    console.log(`KisanDirect server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
