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
  const backendUrl = import.meta.env.VITE_API_URL || "https://vyapaar-ai-guide-1.onrender.com";
  
  try {
    const response = await fetch(`${backendUrl}/api/copilot/branding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName,
        businessType,
        phone,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    return await response.json() as BusinessBranding;
  } catch (err) {
    console.warn("Backend generateBranding call failed, using client fallback:", err);
    const isWater = businessType.toLowerCase().includes("water");
    return {
      businessName,
      tagline: isWater ? "Pure water delivered to your door" : "Your trusted local business",
      primaryColor: isWater ? "#0284c7" : "#6366f1",
      shortDescription: `${businessName} is a trusted ${businessType} serving the local community with quality products and excellent service.`,
      category: businessType,
    };
  }
}
