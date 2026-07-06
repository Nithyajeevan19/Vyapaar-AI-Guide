export interface BusinessBranding {
  businessName: string;
  tagline: string;
  primaryColor: string;
  shortDescription: string;
  category: string;
}

function fallbackBranding(businessName: string, businessType: string): BusinessBranding {
  const isWater = businessType.toLowerCase().includes("water");
  return {
    businessName,
    tagline: isWater ? "Pure water delivered to your door" : "Your trusted local business",
    primaryColor: isWater ? "#0284c7" : "#6366f1",
    shortDescription: `${businessName} is a trusted ${businessType} serving the local community with quality products and excellent service.`,
    category: businessType,
  };
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^```[\w]*\s*/i, "")
    .replace(/```\s*$/i, "")
    .replace(/^`{1,2}/g, "")
    .replace(/`{1,2}$/g, "")
    .trim();
}

export async function generateBranding(
  businessName: string,
  businessType: string,
  phone: string,
  language: string
): Promise<BusinessBranding> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("Gemini API key not set — using fallback branding");
    return fallbackBranding(businessName, businessType);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const systemText =
    "You are a business branding assistant for Indian SMEs. Return ONLY valid JSON, no markdown, no code fences, no explanation.";

  const prompt = `Given this business info:
- Name: ${businessName}
- Type: ${businessType}
- Phone: ${phone}
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

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemText }] },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText);
      console.warn("Gemini API error:", response.status, errText, "— using fallback");
      return fallbackBranding(businessName, businessType);
    }

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!raw) {
      console.warn("Gemini returned empty response — using fallback");
      return fallbackBranding(businessName, businessType);
    }

    const cleaned = stripMarkdown(raw);

    try {
      const parsed = JSON.parse(cleaned) as BusinessBranding;
      // Ensure required fields exist
      return {
        businessName: parsed.businessName || businessName,
        tagline: parsed.tagline || "Your trusted business",
        primaryColor: parsed.primaryColor || "#6366f1",
        shortDescription: parsed.shortDescription || `${businessName} — quality service you can trust.`,
        category: parsed.category || businessType,
      };
    } catch {
      console.warn("Failed to parse Gemini JSON — using fallback:", cleaned);
      return fallbackBranding(businessName, businessType);
    }
  } catch (err) {
    console.warn("Gemini fetch failed — using fallback:", err);
    return fallbackBranding(businessName, businessType);
  }
}
