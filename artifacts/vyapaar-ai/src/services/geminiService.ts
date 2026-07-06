export interface BusinessBranding {
  businessName: string;
  tagline: string;
  primaryColor: string;
  shortDescription: string;
  category: string;
}

export async function generateBranding(
  businessName: string,
  businessType: string,
  phone: string,
  language: string
): Promise<BusinessBranding> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API Key");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const systemText =
    "You are a business branding assistant for Indian SMEs. Return ONLY valid JSON, no markdown, no explanation.";
  const prompt = `Given this business info: Name: ${businessName}, Type: ${businessType}, Phone: ${phone}, Language: ${language}. Return ONLY a JSON object: { businessName, tagline, primaryColor (hex, vivid), shortDescription (2-3 sentences), category }. If type contains 'water', use a blue primaryColor.`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemText }] },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  // Strip markdown fences
  const cleanedText = textResponse.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

  return JSON.parse(cleanedText) as BusinessBranding;
}
