export interface InstaPost {
  caption: string;
  hashtags: string;
}

export interface MarketingContent {
  instaPosts: InstaPost[];
  whatsappPromo: string;
  videoScriptIdea: string;
}

function fallbackContent(businessName: string, businessType: string, serviceType: string): MarketingContent {
  return {
    instaPosts: [
      {
        caption: `✨ ${businessName} — quality you can trust every day!\n\nWe're dedicated to serving our community with the best ${businessType} products and services. ${serviceType.toLowerCase().includes("delivery") ? "We deliver straight to your doorstep! 🚚" : "Come visit us today! 🏪"}`,
        hashtags: `#${businessName.replace(/\s+/g, "")} #${businessType.replace(/\s+/g, "")} #LocalBusiness #ShopLocal #BharatBusiness #SupportLocal`,
      },
      {
        caption: `🌟 Why choose ${businessName}?\n\n✅ Trusted quality\n✅ Excellent service\n✅ Your satisfaction is our priority\n\n${serviceType.toLowerCase().includes("both") ? "Whether you prefer delivery or walk-in, we've got you covered! 💪" : "We're here to serve you with the best!"}`,
        hashtags: `#${businessName.replace(/\s+/g, "")} #Quality${businessType.replace(/\s+/g, "")} #SmallBusiness #MadeInBharat #TrustUs`,
      },
    ],
    whatsappPromo: `🙏 Namaste! \n\nWe're *${businessName}* — your trusted ${businessType} in the area!\n\n${serviceType.toLowerCase().includes("delivery") || serviceType.toLowerCase().includes("both") ? "🚚 *Home delivery available!*\n" : ""}${serviceType.toLowerCase().includes("walk-in") || serviceType.toLowerCase().includes("both") ? "🏪 *Walk-in welcome anytime!*\n" : ""}\n✅ Quality guaranteed\n✅ Fast & reliable service\n\nCall us or message us anytime. We're always happy to serve you! 😊\n\n_${businessName}_`,
    videoScriptIdea: `🎬 *Reel Idea for ${businessName}*\n\n**Concept:** "A day at ${businessName}"\n\n📝 Script:\n[0-3s] Show your shop front / products with upbeat music\n[3-8s] Show the process — making / packing / serving customers\n[8-12s] Happy customer receiving the product / smiling\n[12-15s] End card: "${businessName}" + Contact number + "Order Now!"\n\n💡 Tip: Use trending audio on Instagram Reels for more reach!`,
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

export async function generateMarketingContent(
  businessName: string,
  businessType: string,
  serviceType: string
): Promise<MarketingContent> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("Gemini API key not set — using fallback marketing content");
    return fallbackContent(businessName, businessType, serviceType);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a social media marketing expert for Indian SME businesses. Generate marketing content for this business:

Business Name: ${businessName}
Business Type: ${businessType}
Service Type: ${serviceType}

Return ONLY a valid JSON object with this exact structure (no markdown, no code fences):
{
  "instaPosts": [
    {
      "caption": "Instagram post caption (2-4 sentences, engaging, with emojis)",
      "hashtags": "10-12 relevant hashtags separated by spaces"
    },
    {
      "caption": "Second Instagram post caption (different angle, with emojis)",
      "hashtags": "10-12 relevant hashtags separated by spaces"
    }
  ],
  "whatsappPromo": "WhatsApp promotional message (3-5 lines, friendly, with emojis, include business name)",
  "videoScriptIdea": "Short 15-30 second reel/video script idea with timestamps and tips (3-5 lines)"
}

Rules:
- All text in English
- Make it sound natural and local (Indian SME tone)
- Use relevant emojis
- Hashtags should include business name, type, and popular Indian business hashtags
- Return ONLY the JSON, nothing else`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      console.warn("Gemini API error:", response.status, "— using fallback");
      return fallbackContent(businessName, businessType, serviceType);
    }

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!raw) {
      return fallbackContent(businessName, businessType, serviceType);
    }

    const cleaned = stripMarkdown(raw);

    try {
      const parsed = JSON.parse(cleaned) as MarketingContent;
      return {
        instaPosts: parsed.instaPosts?.slice(0, 2) || fallbackContent(businessName, businessType, serviceType).instaPosts,
        whatsappPromo: parsed.whatsappPromo || fallbackContent(businessName, businessType, serviceType).whatsappPromo,
        videoScriptIdea: parsed.videoScriptIdea || fallbackContent(businessName, businessType, serviceType).videoScriptIdea,
      };
    } catch {
      console.warn("Failed to parse Gemini JSON — using fallback");
      return fallbackContent(businessName, businessType, serviceType);
    }
  } catch (err) {
    console.warn("Gemini fetch failed — using fallback:", err);
    return fallbackContent(businessName, businessType, serviceType);
  }
}
