import { db, inquiries } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { mockStore } from "../lib/mockStore";

/**
 * Helper to simulate sending a WhatsApp message.
 * Calls the Meta Graph API if config credentials exist, otherwise logs outbound stub.
 */
async function sendWhatsAppMessage(orgId: number, to: string, text: string) {
  const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = "default-id";

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
          to,
          type: "text",
          text: { body: text }
        })
      });
    } catch (sendErr: any) {
      console.error("[WhatsAppProvider] Meta Graph API message dispatch failed:", sendErr.message);
    }
  } else {
    console.log(`[WhatsApp Stub Outbound] To: ${to} | Msg: ${text}`);
  }

  // Audited log entry in mockStore
  if (!mockStore.whatsappLogs) {
    mockStore.whatsappLogs = [];
  }
  mockStore.whatsappLogs.push({
    id: mockStore.whatsappLogs.length + 1,
    orgId,
    senderPhone: to,
    message: "[Outbound Broadcast/Reply]",
    reply: text,
    intentDetected: "none",
    createdAt: new Date().toISOString()
  });
}

export const WhatsAppProvider = {
  /**
   * Returns ContextEngine data for the WhatsApp domain: the max pending WhatsApp count.
   */
  resolveContext: async (orgId: number) => {
    let pendingInquiriesCount = 0;
    if (process.env.DATABASE_URL) {
      try {
        const pending = await db
          .select()
          .from(inquiries)
          .where(and(eq(inquiries.orgId, orgId), eq(inquiries.status, "pending" as any)));
        pendingInquiriesCount = pending.length;
      } catch (err: any) {
        console.error("[WhatsAppProvider] DB resolveContext Error:", err.message);
      }
    } else {
      pendingInquiriesCount = mockStore.inquiries.filter(
        (i) => i.orgId === orgId && i.status === "pending"
      ).length;
    }

    const pendingLogsCount = mockStore.whatsappLogs
      ? mockStore.whatsappLogs.filter((l) => l.orgId === orgId && (!l.reply || l.reply.trim() === "")).length
      : 0;

    return {
      pendingWhatsAppChatsCount: Math.max(pendingLogsCount, pendingInquiriesCount),
      pendingInquiriesCount,
      pendingLogsCount
    };
  },

  /**
   * Sends bulk outbound campaign announcements.
   */
  send_broadcast: async (params: {
    orgId: number | string;
    numbers: string[];
    messageText?: string;
    message?: string;
    text?: string;
    content?: string;
  }) => {
    const { orgId, numbers } = params;
    const parsedOrgId = typeof orgId === "string" ? parseInt(orgId, 10) : orgId;
    const msg = params.messageText || params.message || params.text || params.content || "";
    for (const num of numbers) {
      await sendWhatsAppMessage(parsedOrgId, num, msg);
    }
    return { success: true, count: numbers.length };
  },

  /**
   * Routes conversational response back to a specific customer inquiry.
   */
  send_inquiry_reply: async (params: {
    inquiryId: number | string;
    replyText?: string;
    message?: string;
    reply?: string;
  }) => {
    const { inquiryId } = params;
    const replyText = params.replyText || params.message || params.reply || "";
    const inqId = typeof inquiryId === "string" ? parseInt(inquiryId, 10) : inquiryId;
    let phone = "";
    let orgId = 1;

    if (process.env.DATABASE_URL) {
      try {
        const [inq] = await db
          .select()
          .from(inquiries)
          .where(eq(inquiries.id, inqId))
          .limit(1);
        if (inq) {
          phone = inq.phone || "";
          orgId = inq.orgId;

          // Update status in Drizzle
          await db
            .update(inquiries)
            .set({ status: "resolved" as any })
            .where(eq(inquiries.id, inqId));
        }
      } catch (err: any) {
        console.error("[WhatsAppProvider] DB Inquiry reply failed:", err.message);
      }
    }

    // Fallback/sync to mockStore if not found or DB URL not set
    const mockInq = mockStore.inquiries.find((i) => i.id === inqId);
    if (mockInq) {
      if (!phone) {
        phone = mockInq.phone || "";
        orgId = mockInq.orgId;
      }
      mockInq.status = "resolved";
    }

    if (phone) {
      const parsedOrgId = typeof orgId === "string" ? parseInt(orgId, 10) : orgId;
      await sendWhatsAppMessage(parsedOrgId, phone, replyText);
      return { success: true, resolvedPhone: phone };
    }

    throw new Error(`Inquiry with ID ${inqId} not found.`);
  },

  /**
   * Toggles auto reply settings rules for a specific branch.
   */
  update_chatbot_rules: async (params: { branchId: number; autoReply: boolean }) => {
    const { branchId, autoReply } = params;

    if (!mockStore.whatsappSettings) {
      mockStore.whatsappSettings = [];
    }

    let setting = mockStore.whatsappSettings.find((s: any) => s.branchId === branchId);
    if (setting) {
      setting.autoReply = autoReply;
    } else {
      setting = { branchId, autoReply };
      mockStore.whatsappSettings.push(setting);
    }
    return setting;
  },

  /**
   * Dispatches the action route by action name mapping.
   */
  execute: async (action: string, params: any): Promise<any> => {
    const fn = (WhatsAppProvider as any)[action];
    if (!fn || typeof fn !== "function") {
      throw new Error(`Action "${action}" is not supported by WhatsAppProvider.`);
    }
    return await fn(params);
  },
};
