import { AICeoMission, AICeoPriority, AICeoProposal, AICeoTimelineEvent, AICeoStandup, AIEmployeeAgent } from "../types/aiCeo";

/**
 * Mock API Service Adapter for AI CEO Command Center.
 * Simulates asynchronous network requests with realistic delay and yields contextual data
 * based on the business type/category.
 */
export async function fetchAICeoCommandData(businessCategory?: string): Promise<{
  mission: AICeoMission;
  priorities: AICeoPriority[];
  proposals: AICeoProposal[];
  timeline: AICeoTimelineEvent[];
  standup: AICeoStandup;
  agents: AIEmployeeAgent[];
}> {
  // Simulate 750ms network delay
  await new Promise((resolve) => setTimeout(resolve, 750));

  const category = (businessCategory || "General").toLowerCase();

  // 1. Standup Data
  let standup: AICeoStandup = {
    greetingContext: "Good morning! Here is your AI business standup for today.",
    yesterdaySummary: "Yesterday, I synchronized your digital store prices and captured 4 WhatsApp customer inquiries.",
    todayPlan: "Today, I am auditing your low-stock retail lines, drafting a vendor purchase order, and framing a Diwali campaign.",
    recommendation: "I recommend sending the prepared Diwali discount coupons to customer segments to boost holiday sales."
  };

  if (category.includes("kirana") || category.includes("retail") || category.includes("grocery")) {
    standup = {
      greetingContext: "Namaste! Kirkana Assistant checking in for shift.",
      yesterdaySummary: "Yesterday, we recorded INR 14,200 in gross revenue and automatically updated our retail pulses pricing catalogue index.",
      todayPlan: "Today, I am tracking oil stock-out dates, drafting bulk replenishment invoices, and preparing Diwali marketing broadcasts.",
      recommendation: "Confirm the prepared purchase order for 'A-1 Distributors' to secure bulk margins before holiday price hikes."
    };
  } else if (category.includes("restaurant") || category.includes("food") || category.includes("cafe")) {
    standup = {
      greetingContext: "Chef Assistant bot ready for kitchen stock operations.",
      yesterdaySummary: "Yesterday, we tracked raw materials margins, auto-replied to 8 weekend table inquiries, and updated the digital catalog menu items.",
      todayPlan: "Today, I am flagging raw dairy stock levels, preparing bulk ingredient replenishment worksheets, and monitoring WhatsApp reservation links.",
      recommendation: "Approve the dairy restocking order to prevent kitchen stock-out issues during the heavy weekend rush."
    };
  } else if (category.includes("service") || category.includes("water") || category.includes("tech")) {
    standup = {
      greetingContext: "Operations Support Assistant online.",
      yesterdaySummary: "Yesterday, we successfully auto-answered 12 basic WhatsApp catalog inquiries and resolved 3 support dispatch coordinates.",
      todayPlan: "Today, I am routing the technician dispatch calendar, following up with unassigned ticket logs, and sync status checks.",
      recommendation: "Verify and dispatch the customer service schedule route to technician profiles immediately to clear yesterday's backlog."
    };
  }

  // 2. Agents Data
  const agents: AIEmployeeAgent[] = [
    {
      id: "ag1",
      name: "WhatsApp Catalog Autopilot Bot",
      description: "Auto-responds to catalog requests and customer support questions.",
      status: "active",
      lastActive: "Active now"
    },
    {
      id: "ag2",
      name: "Low-Stock Monitor",
      description: "Checks inventory balances against sales velocities to prevent stock-outs.",
      status: "active",
      lastActive: "Checked 12 mins ago"
    },
    {
      id: "ag3",
      name: "Pulse Market Index Repricer",
      description: "Monitors wholesale commodity market indexes and flags optimization plans.",
      status: "idle",
      lastActive: "Checked 1 hour ago"
    }
  ];

  // 3. Mission data
  let mission: AICeoMission = {
    description: "Reconcile daily wholesale billing and update e-commerce catalog pricing.",
    target: "Reconcile 15 inventory items & synchronize digital store prices.",
    progress: 55,
    status: "active",
    category: "Operations",
  };

  if (category.includes("kirana") || category.includes("retail") || category.includes("grocery")) {
    mission = {
      description: "Optimize fast-moving product margins & prepare Diwali promotional catalog.",
      target: "Reconcile ghee/oil stock lines & set bulk discount rates.",
      progress: 68,
      status: "active",
      category: "Inventory & Marketing",
    };
  } else if (category.includes("restaurant") || category.includes("food") || category.includes("cafe")) {
    mission = {
      description: "Manage weekend raw ingredient inventory & optimize vendor purchase order prices.",
      target: "Verify stock level of dairy, flour, and poultry supplies.",
      progress: 40,
      status: "active",
      category: "Supply Chain",
    };
  } else if (category.includes("service") || category.includes("water") || category.includes("tech")) {
    mission = {
      description: "Resolve pending support tickets & dispatch technician scheduling orders.",
      target: "Follow up with 8 overdue service complaints.",
      progress: 80,
      status: "active",
      category: "Customer Service",
    };
  }

  // 4. Priorities list
  const priorities: AICeoPriority[] = [
    {
      id: "p1",
      title: "Critical Stock Warning",
      description: "Popular refined oil items are projected to sell out in 3 days. Price inflation detected from Vendor A (+5%).",
      priorityLevel: "high",
      module: "Inventory",
    },
    {
      id: "p2",
      title: "Unresponsive Inquiries",
      description: "3 WhatsApp customer queries regarding catalog prices are pending response for over 3 hours.",
      priorityLevel: "high",
      module: "CRM",
    },
    {
      id: "p3",
      title: "Outdated Domain Link",
      description: "Your digital store link in WhatsApp status has outdated pricing info. Recommend auto-syncing catalog items.",
      priorityLevel: "medium",
      module: "Website",
    },
    {
      id: "p4",
      title: "Tax Filing Deadline",
      description: "Monthly GST invoices report is compiled. Ready for dispatch to your chartered accountant.",
      priorityLevel: "low",
      module: "Finance",
    },
  ];

  // 5. Action Center Proposals
  const proposals: AICeoProposal[] = [
    {
      id: "prop-diwali-whatsapp",
      title: "Launch Diwali Discount WhatsApp Campaign",
      description: "AI prepared a broadcast message to 42 customer contacts offering a 10% coupon code on bulk festival purchases.",
      category: "marketing_campaign",
      summary: "Broadcast Diwali discount coupon to active customer segment.",
      proposedAction: "Send WhatsApp template broadcast",
      details: {
        recipientsCount: 42,
        templateName: "diwali_promo_v1",
        couponCode: "FESTIVE10",
        messageContent: "Greetings! Celebrate Diwali with Vyapaar Store. Order bulk items and get 10% off. Click here to view catalog: [StoreLink]"
      },
      approved: false,
      status: "pending",
    },
    {
      id: "prop-stock-refill",
      title: "Replenish Wheat Flour & Edible Oil Stock",
      description: "Low-stock warning triggered. AI drafted a vendor purchase order for 5 bags of Wheat Flour & 3 cartons of Mustard Oil from trusted vendor 'A-1 Distributors'.",
      category: "stock_replenishment",
      summary: "Place supply order of INR 4,800 with A-1 Distributors.",
      proposedAction: "Generate vendor purchase order receipt",
      details: {
        vendorName: "A-1 Distributors",
        estimatedCost: 4800,
        items: [
          { name: "Premium Wheat Flour (10kg)", qty: 5, unitPrice: 380 },
          { name: "Mustard Oil (1L)", qty: 30, unitPrice: 165 }
        ]
      },
      approved: false,
      status: "pending",
    },
    {
      id: "prop-catalog-update",
      title: "Sync New Wholesale Prices to E-Store",
      description: "Wholesale grain price drops detected in market index database. AI prepared a list of updates lowering online prices of 4 pulses by 3-5% to capture local customer traffic.",
      category: "website_update",
      summary: "Reduce digital catalog pricing for 4 grain products.",
      proposedAction: "Update e-commerce catalog pricing indexes",
      details: {
        itemsCount: 4,
        averagePriceReductionPercent: 4.2,
        products: [
          { name: "Split Green Gram (Moong Dal)", oldPrice: 120, newPrice: 115 },
          { name: "Red Lentils (Masoor Dal)", oldPrice: 95, newPrice: 92 },
          { name: "Chickpeas (Kabuli Chana)", oldPrice: 140, newPrice: 135 },
          { name: "Yellow Split Peas (Toor Dal)", oldPrice: 160, newPrice: 154 }
        ]
      },
      approved: false,
      status: "pending",
    }
  ];

  // 6. Observations & Actions Timeline
  const timeline: AICeoTimelineEvent[] = [
    {
      id: "t1",
      timestamp: "Today, 9:30 AM",
      type: "observation",
      message: "Analyzed local market wholesale price indices.",
      details: "Observed a market price drop of 4.2% in pulses. Flagged option to adjust retail pricing.",
    },
    {
      id: "t2",
      timestamp: "Today, 10:15 AM",
      type: "plan",
      message: "Drafted e-commerce catalog repricing updates.",
      details: "Created a proposal to lower catalog pricing on Moong Dal, Masoor Dal, Kabuli Chana, and Toor Dal.",
    },
    {
      id: "t3",
      timestamp: "Today, 11:00 AM",
      type: "observation",
      message: "Received 3 customer catalog inquiries on WhatsApp.",
      details: "Analyzed customer chat intents; categorized as catalog and discount queries.",
    },
    {
      id: "t4",
      timestamp: "Today, 11:45 AM",
      type: "plan",
      message: "Drafted Diwali promotional WhatsApp campaign.",
      details: "Composed template messages with coupon code FESTIVE10 targeted at repeat customer segment.",
    },
  ];

  return {
    mission,
    priorities,
    proposals,
    timeline,
    standup,
    agents,
  };
}
