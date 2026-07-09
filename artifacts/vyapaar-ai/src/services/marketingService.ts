export interface MarketingMessage {
  role: "user" | "assistant";
  content: string;
  intent?: "instagram" | "reel" | "whatsapp" | "clarify";
  contentData?: {
    caption?: string;
    hashtags?: string;
    concept?: string;
    script?: string;
    message?: string;
  };
}

export interface MarketingChatResponse {
  intent: "instagram" | "reel" | "whatsapp" | "clarify";
  chatReply: string;
  contentData?: {
    caption?: string;
    hashtags?: string;
    concept?: string;
    script?: string;
    message?: string;
  };
}

export async function generateMarketingChatReply(
  messages: { role: "user" | "assistant"; content: string }[],
  businessName: string,
  businessType: string,
  serviceType: string
): Promise<MarketingChatResponse> {
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  try {
    const response = await fetch(`${backendUrl}/api/copilot/marketing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        businessName,
        businessType,
        serviceType
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    return await response.json() as MarketingChatResponse;
  } catch (err) {
    console.warn("Backend generateMarketingChatReply call failed, using fallback:", err);
    return {
      intent: "clarify",
      chatReply: `Hello! I am your social media marketing assistant for ${businessName}. Tell me what you'd like to create: an Instagram caption, a short Reel video script, or a WhatsApp promo!`,
    };
  }
}
