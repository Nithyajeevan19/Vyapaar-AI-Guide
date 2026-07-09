import { Router } from "express";
import { mockStore } from "../lib/mockStore";
import { validate } from "../middlewares/validate";
import { GetOpenAICompletionBody } from "@workspace/api-zod";
import multer from "multer";
import { z } from "zod";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /copilot/onboarding - Onboarding Optimization Analyzer
router.post("/onboarding", async (req, res) => {
  const { businessName, businessType, serviceType, language } = req.body;

  if (!businessName || !businessType || !serviceType) {
    return res.status(400).json({ error: "Missing required onboarding fields" });
  }

  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  // Setup industry type detection based on businessType keywords
  const typeLower = businessType.toLowerCase();
  let industryType = "service";
  if (typeLower.includes("shop") || typeLower.includes("store") || typeLower.includes("grocery") || typeLower.includes("kirana") || typeLower.includes("retail")) {
    industryType = "retail";
  } else if (typeLower.includes("cafe") || typeLower.includes("restaurant") || typeLower.includes("hotel") || typeLower.includes("canteen") || typeLower.includes("food") || typeLower.includes("bakery")) {
    industryType = "restaurant";
  } else if (typeLower.includes("school") || typeLower.includes("college") || typeLower.includes("coaching") || typeLower.includes("tutor") || typeLower.includes("education")) {
    industryType = "education";
  } else if (typeLower.includes("clinic") || typeLower.includes("hospital") || typeLower.includes("doctor") || typeLower.includes("dental") || typeLower.includes("healthcare")) {
    industryType = "healthcare";
  } else if (typeLower.includes("pg") || typeLower.includes("lodge") || typeLower.includes("resort") || typeLower.includes("hospitality")) {
    industryType = "hospitality";
  } else if (typeLower.includes("broker") || typeLower.includes("property") || typeLower.includes("real estate") || typeLower.includes("flat")) {
    industryType = "real_estate";
  } else if (typeLower.includes("factory") || typeLower.includes("manufacturing") || typeLower.includes("mill") || typeLower.includes("workshop")) {
    industryType = "manufacturing";
  } else if (typeLower.includes("farm") || typeLower.includes("agriculture") || typeLower.includes("nursery")) {
    industryType = "agriculture";
  }

  // Define active module recommendations based on industry
  let modules = ["profile", "website", "marketing"];
  if (industryType === "retail" || industryType === "restaurant") {
    modules.push("catalog", "orders", "payments");
  } else if (industryType === "healthcare" || industryType === "hospitality" || industryType === "real_estate") {
    modules.push("appointments", "crm");
  } else if (industryType === "service") {
    modules.push("catalog", "tickets", "payments");
  } else if (industryType === "education") {
    modules.push("crm", "documents");
  }

  const langSuffix = language === "te" ? "in Telugu" : "in English";

  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const systemInstruction = "You are a professional business onboarding analyst for Indian SMBs. Output ONLY a valid JSON object matching the requested fields, no code fences.";
      const prompt = `Given this business profile:
Name: ${businessName}
Type: ${businessType}
Service Model: ${serviceType}
Language: ${language}

Generate branding profile:
- tagline (short, catchy, under 10 words ${langSuffix})
- primaryColor (vivid hex code matching the business domain)
- description (2 sentences summarizing the business ${langSuffix})

Return JSON:
{
  "tagline": "...",
  "primaryColor": "...",
  "description": "..."
}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        const cleanJson = text.replace(/^```[\w]*\s*/i, "").replace(/```\s*$/i, "").trim();
        const parsed = JSON.parse(cleanJson);

        return res.json({
          industryType,
          maturityScore: 65, // default starter score
          modules,
          tagline: parsed.tagline || "Your trusted local business",
          primaryColor: parsed.primaryColor || "#6366f1",
          description: parsed.description || `${businessName} serves you with fine products.`,
        });
      }
    } catch (err: any) {
      console.warn("Gemini onboarding analysis failed, using fallback:", err.message);
    }
  }

  // Local Onboarding Analyzer Fallback
  const tagline = typeLower.includes("water") ? "Pure, clean water at your doorstep" : "Your reliable business partner";
  const primaryColor = typeLower.includes("water") ? "#0284c7" : "#4f46e5";
  const description = `${businessName} is a dedicated ${businessType} business committed to providing high quality solutions and customer service in the region.`;

  return res.json({
    industryType,
    maturityScore: 50,
    modules,
    tagline,
    primaryColor,
    description,
  });
});

// POST /copilot/chat - Chat with AI Copilot
router.post("/chat", async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "Missing required chat fields (userId, message)" });
  }

  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  // Retrieve or initialize conversation history
  if (!mockStore.aiConversations[userId]) {
    mockStore.aiConversations[userId] = [
      { role: "system", content: "You are a world-class AI Business Coach assisting an Indian SME business owner. Keep answers practical, clear, and focused on operational efficiency, sales growth, and digital transformation." }
    ];
  }

  const history = mockStore.aiConversations[userId];
  history.push({ role: "user", content: message });

  // Format history for Gemini API
  const contents = history
    .filter(msg => msg.role !== "system")
    .map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

  const systemInstruction = history.find(msg => msg.role === "system")?.content || "";

  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        history.push({ role: "assistant", content: reply });

        // Generate smart suggestion buttons dynamically
        const suggestions = [
          "Suggest a marketing post for Diwali",
          "How can I set up home deliveries?",
          "How do I create billing invoices?"
        ];

        return res.json({ reply, suggestions });
      }
    } catch (err: any) {
      console.warn("Gemini Copilot chat failed, using local assistant fallback:", err.message);
    }
  }

  // Local Conversational Fallback
  let reply = "Hello! I am here to help you grow your store. I can recommend marketing campaigns, assist in listing your items, or track your customer orders.";
  if (message.toLowerCase().includes("marketing")) {
    reply = "I suggest drafting a WhatsApp promotional broadcast to your regular clients. You can announce special weekend bundles or delivery slots to boost sales.";
  } else if (message.toLowerCase().includes("billing") || message.toLowerCase().includes("invoice")) {
    reply = "You can record customer purchases and instantly email/WhatsApp them digital invoices with a UPI payment QR Code for cashless collections.";
  }

  history.push({ role: "assistant", content: reply });

  return res.json({
    reply,
    suggestions: [
      "Draft a weekend sale promo",
      "How to set up multiple branches?",
      "Analyze my customer orders"
    ]
  });
});

// POST /copilot/branding - Secure branding copy generator
router.post("/branding", async (req, res) => {
  const { businessName, businessType, phone, language } = req.body;
  if (!businessName || !businessType) {
    return res.status(400).json({ error: "Missing businessName or businessType" });
  }

  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const isWater = businessType.toLowerCase().includes("water");
  const fallback = {
    businessName,
    tagline: isWater ? "Pure water delivered to your door" : "Your trusted local business",
    primaryColor: isWater ? "#0284c7" : "#6366f1",
    shortDescription: `${businessName} is a trusted ${businessType} serving the local community with quality products and excellent service.`,
    category: businessType,
  };

  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const prompt = `Given this business info:
- Name: ${businessName}
- Type: ${businessType}
- Phone: ${phone || "+919876543210"}
- Language preference: ${language === "te" ? "Telugu" : "English"}

Return ONLY a JSON object with these exact fields:
{
  "businessName": "${businessName}",
  "tagline": "short catchy tagline (max 10 words)",
  "primaryColor": "#hexcolor (vivid, suits the business type)",
  "shortDescription": "2-3 sentences about this business",
  "category": "specific category name"
}

Rules:
- If type contains 'water', use a blue primaryColor like #0284c7
- Tagline should be in ${language === "te" ? "Telugu" : "English"}
- No markdown, no code fences, just the raw JSON`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: "You are a business branding assistant for Indian SMEs. Return ONLY valid JSON, no markdown, no code fences, no explanation." }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
        }),
      });

      if (response.ok) {
        const data = await response.json() as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        const cleanJson = text.replace(/^```[\w]*\s*/i, "").replace(/```\s*$/i, "").trim();
        const parsed = JSON.parse(cleanJson);
        return res.json({
          businessName: parsed.businessName || businessName,
          tagline: parsed.tagline || fallback.tagline,
          primaryColor: parsed.primaryColor || fallback.primaryColor,
          shortDescription: parsed.shortDescription || fallback.shortDescription,
          category: parsed.category || fallback.category,
        });
      }
    } catch (err: any) {
      console.warn("Server branding generation failed, using fallback:", err.message);
    }
  }

  return res.json(fallback);
});

// POST /copilot/marketing - Secure marketing copy generator
router.post("/marketing", async (req, res) => {
  const { messages, businessName, businessType, serviceType } = req.body;
  if (!businessName || !businessType) {
    return res.status(400).json({ error: "Missing businessName or businessType" });
  }

  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const fallback = {
    intent: "clarify",
    chatReply: `Hello! I am your social media marketing expert for ${businessName}. Tell me what you'd like to create: an Instagram caption, a short Reel video script, or a WhatsApp promo!`,
    contentData: null
  };

  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const systemInstruction = `You are a social media marketing agent for Indian SMB businesses. Your client business profile is:
- Name: ${businessName}
- Category/Type: ${businessType}
- Service Type: ${serviceType || "both"}

Analyze the conversation history. Based on the user's latest query, classify their intent into one of:
1. "instagram": User wants an Instagram caption, post, or copy.
2. "reel": User wants a short Reel script or concept.
3. "whatsapp": User wants a WhatsApp promo message or blast.
4. "clarify": User is chatting, asking general marketing help, or their query is vague.

Generate a JSON object matching this schema:
{
  "intent": "instagram" | "reel" | "whatsapp" | "clarify",
  "chatReply": "A brief friendly conversational reply or clarifying question (1-2 sentences).",
  "contentData": {
    // Only populate if intent is "instagram"
    "caption": "Instagram caption with emojis",
    "hashtags": "10-12 relevant hashtags separated by spaces"
    
    // Only populate if intent is "reel"
    "concept": "Visual hook concept (1 sentence)",
    "script": "Timestamped script details (3-4 lines)"
    
    // Only populate if intent is "whatsapp"
    "message": "Friendly WhatsApp copy with emojis"
  }
}

Rules:
- Respond ONLY with the valid JSON object, no markdown code blocks, no chat headers.
- Keep the tone friendly, local, and appropriate for an Indian SMB owner.`;

      const contents = (messages || []).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.75,
            maxOutputTokens: 800 
          },
        }),
      });

      if (response.ok) {
        const data = await response.json() as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        const cleanJson = text.replace(/^```[\w]*\s*/i, "").replace(/```\s*$/i, "").trim();
        const parsed = JSON.parse(cleanJson);
        return res.json(parsed);
      }
    } catch (err: any) {
      console.warn("Server marketing content generation failed, using fallback:", err.message);
    }
  }

  return res.json(fallback);
});


// POST /copilot/completion - Secure OpenAI Chat Completion Proxy
router.post("/completion", validate(GetOpenAICompletionBody), async (req, res) => {
  const { messages } = req.body;

  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.error("OpenAI API key (OPENAI_API_KEY) is missing on the server.");
    return res.status(500).json({
      error: "OpenAI API key configuration is missing on the server. Please configure process.env.OPENAI_API_KEY.",
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `OpenAI API returned error: ${errorText}` });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error("OpenAI API proxy call failed:", error.message);
    return res.status(500).json({ error: `OpenAI API proxy call failed: ${error.message}` });
  }
});


// Zod schema to validate extracted invoice content
const extractedInvoiceSchema = z.object({
  vendorName: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  lineItems: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.number().min(1),
      price: z.number().min(0), // unit price in decimal (e.g. 15.5)
      total: z.number().min(0).optional()
    })
  ),
  total: z.number().min(0) // total amount in decimal
});

// POST /copilot/ocr-invoice
router.post("/ocr-invoice", upload.single("image"), async (req, res) => {
  try {
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
    let base64Data = "";
    let mimeType = "image/jpeg";

    if (req.file) {
      base64Data = req.file.buffer.toString("base64");
      mimeType = req.file.mimetype;
    } else if (req.body.image) {
      const imageStr = req.body.image as string;
      if (imageStr.startsWith("data:")) {
        const match = imageStr.match(/^data:(.*?);base64,(.*)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        } else {
          return res.status(400).json({ error: "Invalid base64 data format" });
        }
      } else {
        base64Data = imageStr;
      }
    } else {
      return res.status(400).json({ error: "Missing invoice image/document file or base64 body field" });
    }

    if (!base64Data) {
      return res.status(400).json({ error: "Empty document data received" });
    }

    // In development fallback if Gemini API Key is missing:
    if (!apiKey) {
      console.warn("VITE_GEMINI_API_KEY is not configured on the server. Returning mock OCR fallback data.");
      const mockOcrData = {
        vendorName: "Simulated Vendor Ltd",
        date: new Date().toISOString().split("T")[0],
        lineItems: [
          { name: "Mock Item A", quantity: 2, price: 12.50, total: 25.00 },
          { name: "Mock Item B", quantity: 1, price: 45.00, total: 45.00 }
        ],
        total: 70.00
      };
      return res.json(mockOcrData);
    }

    const extractionPrompt = `Extract items from this paper bill/invoice image or PDF document.
Return ONLY a valid JSON object matching the schema below.
Ensure all prices are returned as standard decimal currency units (e.g. 15.50 for Rs. 15 and 50 paise).

Expected JSON Structure:
{
  "vendorName": "name of vendor or null",
  "date": "YYYY-MM-DD or null",
  "lineItems": [
    {
      "name": "item description name",
      "quantity": number,
      "price": number
    }
  ],
  "total": number
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: extractionPrompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Gemini extraction failed: ${response.statusText}` });
    }

    const resJson = await response.json() as any;
    const extractedText = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!extractedText) {
      return res.status(422).json({ error: "Failed to extract text from the invoice image or document. Please verify file clarity." });
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(extractedText);
    } catch (parseErr) {
      console.error("Gemini output was not valid JSON:", extractedText);
      return res.status(422).json({ error: "Gemini did not return valid JSON format.", rawOutput: extractedText });
    }

    const validationResult = extractedInvoiceSchema.safeParse(parsedData);
    if (!validationResult.success) {
      console.error("OCR Validation Failed:", validationResult.error.format());
      return res.status(422).json({ 
        error: "Extracted invoice content did not match schema specifications.", 
        details: validationResult.error.format() 
      });
    }

    return res.json(validationResult.data);

  } catch (err: any) {
    console.error("OCR API Route Error:", err);
    return res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
});


export default router;
