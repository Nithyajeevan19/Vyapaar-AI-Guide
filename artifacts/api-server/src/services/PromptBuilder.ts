import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { assembleContext } from "../kernel/ContextEngine";

/**
 * Helper to get the current directory path in a way that is compatible
 * with both CommonJS and ES Modules, and fallback to process.cwd() if needed.
 */
function getDirName(): string {
  try {
    if (typeof __dirname !== "undefined") {
      return __dirname;
    }
  } catch (e) {}

  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch (e) {}

  return process.cwd();
}

/**
 * Searches for the absolute path to ARCHITECTURE.md in multiple likely locations.
 */
function getArchitectureMdPath(): string {
  const dir = getDirName();
  const possiblePaths = [
    path.join(dir, "../kernel/ARCHITECTURE.md"),
    path.join(dir, "../src/kernel/ARCHITECTURE.md"),
    path.join(process.cwd(), "src/kernel/ARCHITECTURE.md"),
    path.join(process.cwd(), "artifacts/api-server/src/kernel/ARCHITECTURE.md"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  throw new Error("Could not locate ARCHITECTURE.md");
}

/**
 * Parses the available tools/providers and their exposed actions dynamically from ARCHITECTURE.md.
 * This reads from ## 3. Provider Specifications and extracts providers and backticked actions.
 */
export function parseAvailableTools(): string {
  const filePath = getArchitectureMdPath();
  const content = fs.readFileSync(filePath, "utf-8");

  const startMarker = "## 3. Provider Specifications";
  const startIndex = content.indexOf(startMarker);
  if (startIndex === -1) {
    throw new Error(`Could not find marker "${startMarker}" in ARCHITECTURE.md`);
  }

  const rest = content.slice(startIndex + startMarker.length);
  let endIndex = rest.indexOf("## 4.");
  if (endIndex === -1) {
    endIndex = rest.indexOf("---");
  }

  const providersContent = endIndex === -1 ? rest : rest.slice(0, endIndex);
  const lines = providersContent.split("\n");
  const tools: { provider: string; actions: string[] }[] = [];
  
  let currentProvider = "";
  let insideExposedActions = false;
  let currentActions: string[] = [];

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith("###")) {
      if (currentProvider && currentActions.length > 0) {
        tools.push({ provider: currentProvider, actions: currentActions });
      }
      const match = line.match(/###\s*(?:\d+\.\s*)?([A-Za-z0-9_]+)/);
      currentProvider = match ? match[1] : line.replace("###", "").trim();
      currentActions = [];
      insideExposedActions = false;
    } else if (line.includes("**Exposed Actions:**")) {
      insideExposedActions = true;
    } else if (insideExposedActions) {
      if (line.startsWith("*") || line.startsWith("-")) {
        const actionMatch = line.match(/`([^`]+)`/);
        if (actionMatch) {
          currentActions.push(line);
        }
      } else if (line.startsWith("###") || line.startsWith("Scope Boundaries")) {
        insideExposedActions = false;
      }
    }
  }
  if (currentProvider && currentActions.length > 0) {
    tools.push({ provider: currentProvider, actions: currentActions });
  }

  return tools
    .map(t => `Provider: ${t.provider}\nActions:\n${t.actions.map(a => `  - ${a}`).join("\n")}`)
    .join("\n\n");
}

/**
 * Serializes the BusinessContext object into a structured markdown profile.
 */
export function serializeContext(context: any): string {
  const sections: string[] = [];

  sections.push(`## Business Context Status (Health: ${context.contextHealth}%)`);
  if (context.warnings && context.warnings.length > 0) {
    sections.push(`> [!WARNING]`);
    sections.push(`> Context gathering warnings occurred:`);
    context.warnings.forEach((w: string) => sections.push(`> - ${w}`));
  }

  // Helper to add a section
  const addSection = (title: string, data: any, keys: string[]) => {
    sections.push(`### ${title}`);
    sections.push(`- **Source Table/API**: \`${data.source}\``);
    sections.push(`- **Freshness**: updated ${data.lastUpdated}`);
    keys.forEach(k => {
      const val = data[k];
      if (typeof val === "object") {
        sections.push(`- **${k}**: ${JSON.stringify(val)}`);
      } else {
        sections.push(`- **${k}**: ${val}`);
      }
    });
  };

  addSection("Organization Details", context.organization, ["name", "category", "branchCount", "timezone"]);
  addSection("Branding & Business Profile", context.businessProfile, ["tagline", "businessHours", "colors", "address"]);
  addSection("Sales Performance Indicators", context.sales, ["todayRevenue", "todayOrders", "monthlyRevenue"]);
  
  // Inventory
  sections.push(`### Inventory Summary`);
  sections.push(`- **Source Table/API**: \`${context.inventory.source}\``);
  sections.push(`- **Freshness**: updated ${context.inventory.lastUpdated}`);
  sections.push(`- **Out of stock items count**: ${context.inventory.outOfStock}`);
  sections.push(`- **Low Stock Items (limit 5)**:`);
  if (context.inventory.lowStockProducts) {
    context.inventory.lowStockProducts.forEach((p: any) => {
      sections.push(`  - ID ${p.id}: ${p.name} (stock remaining: ${p.stock})`);
    });
  }
  sections.push(`- **Top Selling Items**:`);
  if (context.inventory.topSelling) {
    context.inventory.topSelling.forEach((p: any) => {
      sections.push(`  - ID ${p.id}: ${p.name} (units sold: ${p.quantitySold})`);
    });
  }

  addSection("CRM Pipeline Metrics", context.crm, ["newLeads", "pendingLeads", "overdueFollowUps"]);
  addSection("WhatsApp Conversation Metrics", context.whatsApp, ["unreadChats", "pendingReplies"]);
  
  // Analytics
  sections.push(`### Sales & Revenue Analytics`);
  sections.push(`- **Source Table/API**: \`${context.analytics.source}\``);
  sections.push(`- **Freshness**: updated ${context.analytics.lastUpdated}`);
  sections.push(`- **Revenue Delta (Today vs Yesterday)**: ${context.analytics.revenueDelta}`);
  
  // Activity
  sections.push(`### Recent Business Activity (last 20 logs)`);
  sections.push(`- **Source Table/API**: \`${context.activity.source}\``);
  sections.push(`- **Freshness**: updated ${context.activity.lastUpdated}`);
  if (context.activity.recentActivity) {
    context.activity.recentActivity.forEach((a: any) => {
      sections.push(`  - [${a.timestamp}] [${a.type}] ${a.description}`);
    });
  }

  return sections.join("\n");
}

/**
 * PromptBuilder builds the complete prompt string from:
 * 1. System Role
 * 2. Business Context (serialized)
 * 3. Merchant Goal
 * 4. Available Tools (dynamically parsed)
 * 5. Required Output JSON Schema
 * 6. Basic Safety Rules
 */
export class PromptBuilder {
  /**
   * Builds the prompt string containing all six required sections.
   *
   * @param orgIdOrContext An organization ID (number) to fetch context dynamically, or a pre-assembled context object.
   * @param merchantGoal The goal/query input by the merchant.
   * @param outputSchema The JSON schema the response should adhere to.
   * @returns The built prompt string.
   */
  static async buildPrompt(
    orgIdOrContext: number | object,
    merchantGoal: string,
    outputSchema: object
  ): Promise<string> {
    // 1. System Role Section
    const systemRole = `You are a professional business operations planner (acting as a COO, Operations Manager, or Business Consultant).
Your tone must be professional, concise, and business-focused. Avoid friendly assistant conversational filler.
You must analyze the business context, merchant goals, and safety guidelines to propose a structured plan.`;

    // 2. Business Context Section
    let contextObj: object;
    if (typeof orgIdOrContext === "number") {
      contextObj = await assembleContext(orgIdOrContext);
    } else if (typeof orgIdOrContext === "object" && orgIdOrContext !== null) {
      contextObj = orgIdOrContext;
    } else {
      contextObj = {};
    }
    const businessContext = serializeContext(contextObj);

    // 3. Merchant Goal Section
    const goalText = merchantGoal;

    // 4. Available Tools Section
    const availableTools = parseAvailableTools();

    // 5. Output JSON Schema Section
    const schemaText = JSON.stringify(outputSchema, null, 2);

    // 6. Safety Rules Section
    const safetyRules = `
1. The Planner MUST NOT execute the following actions automatically (always set wait_approval to true):
   - Delete customers
   - Delete products
   - Send marketing campaigns
   - Place purchase orders (create_purchase_order)
   - Modify financial records
2. Any high-impact action or step that modifies catalog prices, stocks, or logs transactions must specify wait_approval as true, a riskLevel as high, and include a clear verificationTrigger.
3. Destructive actions must never execute without explicit merchant approval.
`;

    // Assemble everything into a single formatted string with clear sections
    return `# [SYSTEM ROLE]
${systemRole}

# [BUSINESS CONTEXT]
${businessContext}

# [MERCHANT GOAL]
Goal: ${goalText}

# [AVAILABLE TOOLS]
${availableTools}

# [OUTPUT JSON SCHEMA]
Respond with a JSON object that adheres strictly to the following JSON Schema:
${schemaText}

# [SAFETY RULES]
Safety Constraints:
${safetyRules}
`;
  }
}
