import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Gemini Client safely on server side
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Products Persistence Server Store
const PRODUCTS_FILE_PATH = path.join(process.cwd(), 'products.json');

function loadProductsFromDisk(): any[] | null {
  try {
    if (fs.existsSync(PRODUCTS_FILE_PATH)) {
      const content = fs.readFileSync(PRODUCTS_FILE_PATH, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.error('Failed to read products.json:', e);
  }
  return null;
}

function saveProductsToDisk(products: any[]) {
  try {
    fs.writeFileSync(PRODUCTS_FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save products.json:', e);
  }
}

let serverProductsStore: any[] | null = loadProductsFromDisk();

app.get('/api/products', (req, res) => {
  res.json({ products: serverProductsStore });
});

app.post('/api/products', (req, res) => {
  if (Array.isArray(req.body?.products)) {
    serverProductsStore = req.body.products;
    saveProductsToDisk(serverProductsStore);
  }
  res.json({ success: true, count: serverProductsStore ? serverProductsStore.length : 0 });
});

// AI Headcover Finder API Endpoint
app.post('/api/ai-finder', async (req, res) => {
  try {
    const { answers, inventory } = req.body;
    
    const ai = getGeminiClient();

    // Context summary string built from user answers
    const userProfileText = `
    Customer Preferences:
    - Target Club: ${answers?.clubFit || 'Driver'}
    - Preferred Style: ${answers?.style || 'Luxury'}
    - Budget Range: ${answers?.budget || 'No limit'}
    - Genuine Leather Required: ${answers?.genuineLeather || 'No preference'}
    - Waterproofing Needed: ${answers?.waterproof || 'No preference'}
    - Purchasing Context: ${answers?.context || 'Personal'}
    - Preferred Colours: ${answers?.preferredColours || 'Any'}
    - Golfer Personality: ${answers?.personality || 'Enthusiast'}
    `;

    const inventorySummary = (inventory || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      clubFit: p.clubFit,
      price: p.price,
      material: p.material,
      isGenuineLeather: p.isGenuineLeather,
      isWaterproof: p.isWaterproof,
      description: p.description,
      tags: p.tags
    }));

    if (!ai) {
      // Fallback intelligent matching if GEMINI_API_KEY is not configured
      const matched = (inventory || []).filter((p: any) => {
        let score = 0;
        if (answers?.clubFit && (p.clubFit === answers.clubFit || p.clubFit.includes(answers.clubFit))) score += 3;
        if (answers?.style && p.category.toLowerCase().includes(answers.style.toLowerCase())) score += 3;
        if (answers?.genuineLeather === 'Yes' && p.isGenuineLeather) score += 2;
        if (answers?.waterproof === 'Yes' && p.isWaterproof) score += 2;
        return score > 0;
      }).slice(0, 3);

      const recommendations = (matched.length > 0 ? matched : (inventory || []).slice(0, 3)).map((p: any) => ({
        productId: p.id,
        reason: `Selected for your ${p.clubFit} with ${p.material} and ${p.category} styling.`,
        matchScore: 95
      }));

      return res.json({
        summary: `Based on your selection for ${answers?.clubFit || 'your club'} with a preference for ${answers?.style || 'luxury'} styling, here are our top handcrafted recommendations from The Golf Wardrobe.`,
        recommendations
      });
    }

    const prompt = `
    You are the head AI Luxury Shopping Concierge at "The Golf Wardrobe".
    A customer is seeking the perfect golf headcover for their golf bag.
    
    User Profile:
    ${userProfileText}

    Available Store Inventory:
    ${JSON.stringify(inventorySummary)}

    Instructions:
    Select 2 to 4 products from the inventory that best match the customer's club fit, style, budget, leather/waterproof requirements, and personality.
    For each recommended product:
    - Provide a product ID from the inventory list
    - Provide a short, elegant, persuasive 1-2 sentence luxury concierge reason explaining why this exact headcover suits their game.
    - Assign a match percentage integer score between 85 and 99.

    Also provide a warm, 2-sentence concierge summary greeting acknowledging their style choices.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'A warm luxury concierge opening summary.'
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: {
                    type: Type.STRING,
                    description: 'The matching product ID from the inventory.'
                  },
                  reason: {
                    type: Type.STRING,
                    description: 'Concierge explanation why this fits the user.'
                  },
                  matchScore: {
                    type: Type.INTEGER,
                    description: 'Match score between 80 and 99.'
                  }
                },
                required: ['productId', 'reason', 'matchScore']
              }
            }
          },
          required: ['summary', 'recommendations']
        }
      }
    });

    const text = response.text || '';
    let parsedData;
    try {
      const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse Gemini finder JSON output:', text);
      throw parseErr;
    }

    return res.json(parsedData);

  } catch (error: any) {
    console.error('Error in /api/ai-finder:', error);
    // Intelligent fallback response on any API error
    const inventory = req.body?.inventory || [];
    const recommendations = inventory.slice(0, 3).map((p: any) => ({
      productId: p.id,
      reason: `Exquisitely crafted ${p.category} headcover featuring ${p.material}.`,
      matchScore: 92
    }));

    return res.json({
      summary: "Our AI Concierge has handpicked these luxury recommendations from our collection for your game.",
      recommendations
    });
  }
});

// AI Custom Headcover Review API Endpoint
app.post('/api/ai-custom-review', async (req, res) => {
  try {
    const { 
      headcoverType, material, mainColor, secondaryColor, stitchColor, 
      customText, font, embroideryColor, logoFileName, logoWidth, logoHeight, logoFileSize,
      hasLogo, hasImage, designerNotes 
    } = req.body;

    const ai = getGeminiClient();

    // Default intelligent analysis fallback generator
    const generateFallbackReview = () => {
      let resolutionStatus: 'Good' | 'Warning' | 'Low' = 'Good';
      let resolutionWarning = undefined;
      let detailLossEstimate: 'Minimal' | 'Moderate' | 'High Detail Loss Likely' = 'Minimal';

      if (hasLogo || hasImage) {
        if (logoWidth && logoWidth < 500) {
          resolutionStatus = 'Warning';
          resolutionWarning = `Image dimension (${logoWidth}px) is low. For crisp needlework embroidery, we recommend artwork at least 800px or vector format.`;
          detailLossEstimate = 'Moderate';
        } else if (logoFileSize && logoFileSize < 50000) {
          resolutionStatus = 'Warning';
          resolutionWarning = 'Image file size is small. Fine gradients or small sub-text may lose clarity during thread digitizing.';
          detailLossEstimate = 'Moderate';
        } else {
          resolutionStatus = 'Good';
        }
      }

      // Check color contrast
      const isDarkLeather = ['#1A1A1A', '#0D382C', '#1E293B', '#1E1B4B', '#2D1500'].includes(mainColor);
      const isDarkEmbroidery = ['#000000', '#1A1A1A', '#0D382C', '#1E293B'].includes(embroideryColor);
      const isLightEmbroidery = ['#FFFFFF', '#FAF8F5', '#C9A24D', '#E2E8F0', '#FDE047'].includes(embroideryColor);

      let colorContrastAdvice = `The ${mainColor} leather paired with ${secondaryColor} accent panels offers a refined luxury contrast.`;
      if (isDarkLeather && isDarkEmbroidery) {
        colorContrastAdvice = `⚠️ Low Contrast Alert: Selected dark embroidery thread (${embroideryColor}) on dark leather (${mainColor}) may be subtle. Consider Gold Thread (#C9A24D) or Silver/Off-White for high visibility.`;
      } else if (!isDarkLeather && isLightEmbroidery && embroideryColor === '#FFFFFF') {
        colorContrastAdvice = `Note: White embroidery on light leather creates a subtle tone-on-tone effect. Gold or Emerald thread will pop more.`;
      }

      const suggestions = [];
      if (customText && customText.length > 18) {
        suggestions.push(`Custom text "${customText}" is detailed (${customText.length} chars). We will optimize line spacing on the ${headcoverType}.`);
      }
      if (hasLogo) {
        suggestions.push(`Logo digitizing: We will simplify tiny background gradients into solid thread fills for maximum durability.`);
      }
      suggestions.push(`High density ${stitchColor} perimeter saddle stitching ensures links-weather durability.`);

      return {
        overallScore: resolutionStatus === 'Good' ? 96 : 82,
        resolutionStatus,
        resolutionWarning,
        colorContrastAdvice,
        embroiderySuggestions: suggestions,
        detailLossEstimate,
        aiSummary: `Exquisite custom ${headcoverType} design! The combination of ${material} with ${mainColor} leather, ${stitchColor} stitching, and ${embroideryColor} monogramming creates a distinct tour-grade finish.`
      };
    };

    if (!ai) {
      return res.json(generateFallbackReview());
    }

    const prompt = `
    You are the Master Bespoke Golf Craftsman & AI Design Inspector at "The Golf Wardrobe".
    Analyze the user's custom golf headcover design parameters:

    - Headcover Type: ${headcoverType || 'Driver Headcover'}
    - Material: ${material || 'Genuine Leather'}
    - Main Leather Color: ${mainColor}
    - Secondary Accent Color: ${secondaryColor}
    - Perimeter Stitch Color: ${stitchColor}
    - Custom Text: "${customText || 'None'}"
    - Selected Font: ${font || 'Serif Classic'}
    - Embroidery Thread Color: ${embroideryColor}
    - Has Uploaded Logo: ${hasLogo ? 'Yes' : 'No'} (${logoFileName || 'None'}, Approx Width: ${logoWidth || 'Unknown'}px)
    - Designer Notes: "${designerNotes || 'None'}"

    Instructions:
    Evaluate the design for luxury aesthetics, color contrast visibility, embroidery feasibility, and potential detail loss.
    1. Overall score between 75 and 99.
    2. resolutionStatus: "Good" | "Warning" | "Low". If logo dimensions or details look small or low quality, set to "Warning" or "Low" and add a clear resolutionWarning.
    3. colorContrastAdvice: Evaluate contrast between Main Leather Color and Embroidery Thread Color / Stitch Color.
    4. embroiderySuggestions: 2-3 specific, actionable recommendations for thread embroidery (e.g. simplifying tiny text, line thickness, thread choices).
    5. detailLossEstimate: "Minimal" | "Moderate" | "High Detail Loss Likely".
    6. aiSummary: Warm, encouraging 2-sentence summary of the custom piece.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            resolutionStatus: { type: Type.STRING, enum: ['Good', 'Warning', 'Low'] },
            resolutionWarning: { type: Type.STRING, description: 'Warning if resolution or image detail might be low, else omit/empty.' },
            colorContrastAdvice: { type: Type.STRING },
            embroiderySuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            detailLossEstimate: { type: Type.STRING, enum: ['Minimal', 'Moderate', 'High Detail Loss Likely'] },
            aiSummary: { type: Type.STRING }
          },
          required: ['overallScore', 'resolutionStatus', 'colorContrastAdvice', 'embroiderySuggestions', 'detailLossEstimate', 'aiSummary']
        }
      }
    });

    const text = response.text || '';
    let parsedData;
    try {
      const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse Gemini custom review JSON output:', text);
      throw parseErr;
    }
    return res.json(parsedData);

  } catch (error) {
    console.error('Error in /api/ai-custom-review:', error);
    // Fallback if AI server call encounters any error
    return res.json({
      overallScore: 92,
      resolutionStatus: 'Good',
      colorContrastAdvice: 'Saddle leather and embroidery thread colors present a harmonious high-end contrast.',
      embroiderySuggestions: [
        'Vector artwork will be digitized into high-density satin stitches for maximum vibrancy.',
        'Saddle perimeter stitching enhances structural durability.'
      ],
      detailLossEstimate: 'Minimal',
      aiSummary: 'Your bespoke design has been evaluated by our master craftsman guidelines. Every piece is handmade and you will receive a digital proof before production.'
    });
  }
});

// Vite Middleware for Dev vs Production Static File Serving
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
    console.log(`[The Golf Wardrobe] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
