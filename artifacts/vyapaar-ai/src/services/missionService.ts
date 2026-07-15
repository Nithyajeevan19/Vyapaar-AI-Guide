import { BusinessMission } from "../types/mission";

/**
 * Mock Service Adapter for AI Mission Control.
 * Returns contextual objectives tailored to the business category.
 */
export async function fetchBusinessMissions(businessCategory?: string): Promise<BusinessMission[]> {
  // Simulate 800ms network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const category = (businessCategory || "General").toLowerCase();

  // Standard lists
  const defaultMissions: BusinessMission[] = [
    {
      id: "m1",
      title: "Diwali Stock Optimization & Replenishment",
      description: "Analyze low-stock risk profiles on high-margin festival items and prepare purchase orders to prevent stock-outs.",
      priority: "critical",
      businessImpact: "Secure projected festival sales, avoiding stock-outs on top 5 products and capturing 12% higher margin.",
      estimatedTime: "2 hours execution",
      progress: 60,
      reason: "Inventory projections show ghee, edible oil, and dry fruit lines will stock out 4 days prior to Diwali. Price index shows Vendor A-1 has stock at a bulk discount.",
      status: "active",
      subTasks: [
        { id: "s1", title: "Audit current ghee and oil stock lines manually", status: "completed", timeEstimate: "15 mins" },
        { id: "s2", title: "Compare vendor quotes for dry fruits", status: "completed", timeEstimate: "30 mins" },
        { id: "s3", title: "Submit purchase order request to A-1 Distributors", status: "pending", timeEstimate: "10 mins" },
        { id: "s4", title: "Verify warehouse shelving space availability", status: "pending", timeEstimate: "20 mins" }
      ],
      preparedActions: [
        {
          id: "act-po",
          title: "Authorize Purchase Order A-1",
          description: "Generate and send automated PDF purchase order of INR 4,800 to A-1 Distributors on WhatsApp.",
          actionText: "Send Purchase Order",
          status: "pending"
        },
        {
          id: "act-promo",
          title: "Publish Diwali Retail Catalog Updates",
          description: "Push revised retail prices and discount banners online to capture digital traffic.",
          actionText: "Sync Online Store Catalog",
          status: "pending"
        }
      ]
    },
    {
      id: "m2",
      title: "Automate Customer WhatsApp Catalog Inquiries",
      description: "Integrate catalog details into WhatsApp chatbot keyword responders to automate common user catalog inquiries.",
      priority: "high",
      businessImpact: "Saves an estimated 10-15 hours of manual chat responses per week and guarantees 24/7 client response times.",
      estimatedTime: "1 day",
      progress: 25,
      reason: "Observed 18 incoming WhatsApp product inquiries outside business hours this week, resulting in 4 dropped leads due to delayed follow-up.",
      status: "active",
      subTasks: [
        { id: "m2-s1", title: "Import digital inventory product catalogue into chatbot repository", status: "completed", timeEstimate: "45 mins" },
        { id: "m2-s2", title: "Define custom conversational keyword templates", status: "pending", timeEstimate: "1 hour" },
        { id: "m2-s3", title: "Train Gemini chatbot model with store pricing index guidelines", status: "pending", timeEstimate: "2 hours" },
        { id: "m2-s4", title: "Conduct chat simulator sandbox verification", status: "pending", timeEstimate: "1 hour" }
      ],
      preparedActions: [
        {
          id: "act-chatbot",
          title: "Activate WhatsApp Autopilot Model",
          description: "Deploys standard Gemini catalog responder hooks on your active WhatsApp Business phone link.",
          actionText: "Go Live with Bot",
          status: "pending"
        }
      ]
    },
    {
      id: "m3",
      title: "Establish Google Maps Store Visibility Profile",
      description: "Build a Google Business profile to drive local footprint traffic and digitize search indexing.",
      priority: "medium",
      businessImpact: "Estimated 20-30% increase in local store visits from search directions.",
      estimatedTime: "2 days",
      progress: 100,
      reason: "Local competitors in 1km radius have average search rankings of 4.2 stars. Local map indexing is missing for your shop address.",
      status: "completed",
      subTasks: [
        { id: "m3-s1", title: "Register organization business parameters", status: "completed", timeEstimate: "20 mins" },
        { id: "m3-s2", title: "Upload physical shop storefront photos and coordinates", status: "completed", timeEstimate: "30 mins" },
        { id: "m3-s3", title: "Initiate Google verification postcards", status: "completed", timeEstimate: "10 mins" }
      ],
      preparedActions: []
    }
  ];

  // Specific adaptations based on categories
  if (category.includes("restaurant") || category.includes("food")) {
    // Return restaurant-specific goals
    defaultMissions[0].title = "Weekend Raw Materials Replenishment";
    defaultMissions[0].reason = "Flour, poultry, and dairy stock levels are below safety margins for projected high weekend orders.";
    defaultMissions[0].subTasks[0].title = "Audit raw ingredients inventory in kitchen store";
    defaultMissions[0].subTasks[1].title = "Review wholesale vendor poultry price quotes";
  } else if (category.includes("service") || category.includes("water")) {
    // Service business goals
    defaultMissions[0].title = "Dispatch Technician Scheduling System";
    defaultMissions[0].reason = "Unassigned service calls have reached 8 tickets this week. Dispatch scheduler needed.";
    defaultMissions[0].subTasks[0].title = "Verify technician shift roster spreadsheet availability";
    defaultMissions[0].subTasks[1].title = "Optimize customer route mapping markers";
  }

  return defaultMissions;
}
