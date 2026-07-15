import { Router } from "express";
import { db, customers, leads, products, businessProfiles } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { mockStore } from "../lib/mockStore";
import { requireOrgMembership } from "../middlewares/requireOrgMembership";

const router = Router();

// Stub rate-limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 15;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(phone: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(phone);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(phone, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (limit.count >= MAX_MESSAGES_PER_WINDOW) {
    return false;
  }

  limit.count += 1;
  return true;
}

// Initialize mock WhatsApp state
mockStore.whatsappSettings = mockStore.whatsappSettings || [
  { branchId: 1, autoReply: true }
];
mockStore.whatsappLogs = mockStore.whatsappLogs || [
  {
    id: 1,
    orgId: 1,
    senderPhone: "919876543210",
    message: "What is the price of Desi Ghee?",
    reply: "Hello! Our Pure Desi Ghee (sourced from native Gir cows) is priced at Rs. 750 for 1 Liter.",
    intentDetected: "none",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
];

// GET /api/webhooks/whatsapp - Challenge Verification for Meta API Developer Configuration
router.get("/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "vyapaar-verify-token";
  
  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp webhook verified successfully.");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// POST /api/webhooks/whatsapp - Inbound Webhook messages ingestion
router.post("/whatsapp", async (req, res) => {
  try {
    // 1. Defensively validate webhook payload
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];
    const metadata = value?.metadata;

    if (!message || !message.text?.body || !message.from) {
      // Return 200 to acknowledge Meta webhook so they do not retry delivery
      return res.status(200).json({ status: "ignored", reason: "empty_or_malformed_payload" });
    }

    const messageText = message.text.body;
    const senderPhone = message.from;
    const senderName = value?.contacts?.[0]?.profile?.name || `Customer-${senderPhone.slice(-4)}`;
    const displayPhoneNumber = metadata?.display_phone_number || "16505553333";
    const phoneNumberId = metadata?.phone_number_id || "default-id";

    // 2. Identify org context by matching display_phone_number in business profiles
    let orgId = 1;
    let businessName = "Vyapaar Kirana Store";
    let defaultLanguage = "English";

    try {
      if (process.env.DATABASE_URL) {
        const profile = await db.select().from(businessProfiles).where(eq(businessProfiles.phone, displayPhoneNumber)).limit(1);
        if (profile.length > 0) {
          orgId = profile[0].orgId;
          businessName = profile[0].tagline || "Vyapaar Store";
        }
      } else {
        const profile = mockStore.businessProfiles?.find((p: any) => p.phone === displayPhoneNumber);
        if (profile) {
          orgId = profile.orgId;
          businessName = profile.tagline || "Vyapaar Store";
        }
      }
    } catch (dbErr) {
      console.warn("DB Lookup failed, using default organization context:", dbErr);
    }

    // 3. Fetch auto-reply settings
    const settings = mockStore.whatsappSettings.find((s: any) => s.branchId === orgId);
    if (settings && !settings.autoReply) {
      return res.status(200).json({ status: "ignored", reason: "auto_reply_disabled" });
    }

    // 4. Implement Outbound rate-limiting
    if (!checkRateLimit(senderPhone)) {
      console.warn(`Rate limit exceeded for sender: ${senderPhone}`);
      return res.status(200).json({ status: "ignored", reason: "rate_limit_exceeded" });
    }

    // 5. Fetch catalog context to ground Gemini responses
    let catalogText = "Store Catalog:\n";
    try {
      if (process.env.DATABASE_URL) {
        const prodList = await db.select().from(products).where(eq(products.orgId, orgId));
        prodList.forEach(p => {
          catalogText += `- ${p.name}: Rs. ${(p.price / 100).toFixed(2)}\n`;
        });
      } else {
        const prodList = mockStore.products.filter((p: any) => p.orgId === orgId);
        prodList.forEach((p: any) => {
          catalogText += `- ${p.name}: Rs. ${(p.price / 100).toFixed(2)}\n`;
        });
      }
    } catch (catalogErr) {
      console.warn("Catalog fetch failed:", catalogErr);
    }

    // 6. Formulate structured grounded Gemini query
    const systemPrompt = `You are a helpful, localized, and polite store assistant for "${businessName}".
Your language preference is: ${defaultLanguage}. Respond to customer inquiries using only the storefront catalog products listed below.

Rules:
- Speak in a friendly tone in the store's default language.
- DO NOT invent pricing or stock information that is not in the catalog.
- If the customer asks about booking, buying, ordering, or scheduling, answer that you can help, and structure a follow-up lead.
- Keep responses short, concise, and professional (suitable for WhatsApp).

Grounded Catalog Details:
${catalogText}

Customer Message: "${messageText}"`;

    const geminiApiKey = process.env.GEMINI_API_KEY || "";
    let replyText = `Hello! Thanks for writing to ${businessName}. We received your query: "${messageText}". We will look into it shortly.`;
    
    if (geminiApiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        });

        if (response.ok) {
          const resJson = await response.json() as any;
          replyText = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || replyText;
        }
      } catch (geminiErr: any) {
        console.error("Gemini webhook answering failure:", geminiErr.message);
      }
    }

    // 7. Check if customer query indicates booking or order intent
    const orderIntentKeywords = ["buy", "order", "book", "reserve", "purchase", "ghee", "rice", "dal", "cost", "price"];
    const isIntentDetected = orderIntentKeywords.some(keyword => messageText.toLowerCase().includes(keyword));

    if (isIntentDetected) {
      try {
        // Auto-create customer and lead row
        if (process.env.DATABASE_URL) {
          let customerList = await db.select().from(customers).where(and(eq(customers.orgId, orgId), eq(customers.phone, senderPhone))).limit(1);
          let customerId: number;

          if (customerList.length === 0) {
            const [newCust] = await db.insert(customers).values({
              orgId,
              name: senderName,
              phone: senderPhone,
              notes: "Auto-created via WhatsApp message inquiry"
            }).returning();
            customerId = newCust.id;
          } else {
            customerId = customerList[0].id;
          }

          await db.insert(leads).values({
            orgId,
            customerId,
            source: "whatsapp",
            status: "new",
            notes: `WhatsApp inbound query: "${messageText}"`
          });
        } else {
          // Mock save
          let cust = mockStore.customers.find((c: any) => c.phone === senderPhone);
          let customerId = cust ? cust.id : mockStore.customers.length + 1;
          if (!cust) {
            mockStore.customers.push({ id: customerId, orgId, name: senderName, phone: senderPhone });
          }
          mockStore.leads.push({
            id: mockStore.leads.length + 1,
            orgId,
            customerId,
            source: "whatsapp",
            status: "new",
            notes: `WhatsApp inbound query: "${messageText}"`
          });
        }
      } catch (leadErr) {
        console.error("Failed to insert lead from WhatsApp webhook:", leadErr);
      }
    }

    // 8. Call Meta Graph API to send WhatsApp message back (if config credentials exist)
    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
    if (whatsappToken) {
      try {
        const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
        await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${whatsappToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: senderPhone,
            type: "text",
            text: { body: replyText }
          })
        });
      } catch (sendErr: any) {
        console.error("WhatsApp Send-Message API invocation failed:", sendErr.message);
      }
    } else {
      console.log(`[WhatsApp Stub Outbound] To: ${senderPhone} | Msg: ${replyText}`);
    }

    // 9. Store audited log entries
    mockStore.whatsappLogs.push({
      id: mockStore.whatsappLogs.length + 1,
      orgId,
      senderPhone,
      message: messageText,
      reply: replyText,
      intentDetected: isIntentDetected ? "lead_created" : "none",
      createdAt: new Date().toISOString()
    });

    return res.json({ success: true, reply: replyText, leadCreated: isIntentDetected });

  } catch (err: any) {
    console.error("WhatsApp Webhook Endpoint Error:", err);
    return res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
});

// GET /api/webhooks/whatsapp/logs - Fetch audited conversation transcripts for settings panel
router.get("/whatsapp/logs", requireOrgMembership, async (req, res) => {
  const orgId = parseInt(req.query.orgId as string || "1");
  return res.json(mockStore.whatsappLogs.filter((l: any) => l.orgId === orgId));
});

// GET /api/webhooks/whatsapp/settings - Fetch auto-reply toggles
router.get("/whatsapp/settings", requireOrgMembership, async (req, res) => {
  const branchId = parseInt(req.query.branchId as string || "1");
  let setting = mockStore.whatsappSettings.find((s: any) => s.branchId === branchId);
  if (!setting) {
    setting = { branchId, autoReply: true };
    mockStore.whatsappSettings.push(setting);
  }
  return res.json(setting);
});

// POST /api/webhooks/whatsapp/settings - Toggle auto-reply states
router.post("/whatsapp/settings", requireOrgMembership, async (req, res) => {
  const { branchId, autoReply } = req.body;
  let setting = mockStore.whatsappSettings.find((s: any) => s.branchId === branchId);
  if (setting) {
    setting.autoReply = autoReply;
  } else {
    setting = { branchId, autoReply };
    mockStore.whatsappSettings.push(setting);
  }
  return res.json(setting);
});

export default router;
