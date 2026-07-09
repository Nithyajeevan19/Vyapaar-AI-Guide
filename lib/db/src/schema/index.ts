import { pgTable, serial, text, integer, timestamp, boolean, jsonb, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core";

// ============================================================================
// 1. POSTGRESQL ENUM DEFINITIONS
// ============================================================================

export const roleEnum = pgEnum("user_role", ["owner", "admin", "staff"]);

export const industryTypeEnum = pgEnum("industry_type", [
  "retail",
  "restaurant",
  "education",
  "healthcare",
  "hospitality",
  "real_estate",
  "manufacturing",
  "agriculture",
  "service"
]);

export const leadStatusEnum = pgEnum("lead_status", ["new", "contacted", "qualified", "converted", "lost"]);
export const leadSourceEnum = pgEnum("lead_source", ["website", "whatsapp", "manual", "referral"]);
export const inquiryStatusEnum = pgEnum("inquiry_status", ["pending", "resolved"]);
export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "completed"]);

export const productStatusEnum = pgEnum("product_status", ["active", "inactive"]);
export const serviceStatusEnum = pgEnum("service_status", ["active", "inactive"]);

export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "processing", "completed", "cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed"]);
export const paymentMethodEnum = pgEnum("payment_method", ["upi", "cash", "card", "bank_transfer"]);
export const orderTypeEnum = pgEnum("order_type", ["dine_in", "takeaway", "delivery", "online"]);

export const appointmentStatusEnum = pgEnum("appointment_status", ["scheduled", "completed", "cancelled"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "resolved", "closed"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high"]);

export const invoiceStatusEnum = pgEnum("invoice_status", ["unpaid", "paid", "overdue", "cancelled"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "sent"]);
export const assetTypeEnum = pgEnum("asset_type", ["website", "marketing_post", "video_script"]);


// ============================================================================
// 2. CORE PLATFORM TABLES
// ============================================================================

// Users mapped from Firebase Authentication profiles
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Firebase UID
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("users_email_idx").on(table.email)
]);

// Organization tenants representing distinct businesses
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Organization Members (Mapping users to roles inside businesses)
export const organizationMembers = pgTable("organization_members", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: roleEnum("role").default("staff").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("member_org_idx").on(table.orgId),
  index("member_user_idx").on(table.userId)
]);

// Branches supporting multi-location operations
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("branch_org_idx").on(table.orgId)
]);

// Custom branding profiles generated for organizations
export const businessProfiles = pgTable("business_profiles", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  logoUrl: text("logo_url"),
  tagline: text("tagline"),
  primaryColor: text("primary_color"),
  shortDescription: text("short_description"),
  category: text("category"),
  phone: text("phone"),
  address: text("address"),
  businessHours: jsonb("business_hours"),
  locationCoords: text("location_coords"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("profile_org_idx").on(table.orgId)
]);

// Industry Profile presets dynamically managing active modules
export const industryProfiles = pgTable("industry_profiles", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  industryType: industryTypeEnum("industry_type").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("industry_org_idx").on(table.orgId)
]);

// Staff details scoping records inside branches
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  branchId: integer("branch_id").references(() => branches.id, { onDelete: "set null" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  role: text("role"),
  phone: text("phone"),
  email: text("email"),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("staff_org_idx").on(table.orgId),
  index("staff_branch_idx").on(table.branchId)
]);


// ============================================================================
// 3. CRM LAYER TABLES
// ============================================================================

// Customers CRM Registry
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  branchId: integer("branch_id").references(() => branches.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("cust_org_idx").on(table.orgId),
  index("cust_branch_idx").on(table.branchId)
]);

// CRM Leads pipeline tracking prospective deals
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  branchId: integer("branch_id").references(() => branches.id, { onDelete: "set null" }),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "cascade" }),
  source: leadSourceEnum("source").default("manual"),
  status: leadStatusEnum("status").default("new").notNull(),
  notes: text("notes"),
  assignedTo: text("assigned_to").references(() => users.id, { onDelete: "set null" }),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("leads_org_idx").on(table.orgId),
  index("leads_branch_idx").on(table.branchId),
  index("leads_customer_idx").on(table.customerId)
]);

// Public Inquiries logged from self-service mini websites
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  branchId: integer("branch_id").references(() => branches.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  message: text("message"),
  status: inquiryStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("inq_org_idx").on(table.orgId),
  index("inq_branch_idx").on(table.branchId)
]);

// Tasks and follow-up activities
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  branchId: integer("branch_id").references(() => branches.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("todo").notNull(),
  dueDate: timestamp("due_date"),
  assignedTo: text("assigned_to").references(() => users.id, { onDelete: "set null" }),
  relatedToType: text("related_to_type"),
  relatedToId: integer("related_to_id"),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("tasks_org_idx").on(table.orgId),
  index("tasks_branch_idx").on(table.branchId)
]);


// ============================================================================
// 4. COMMERCE LAYER TABLES
// ============================================================================

// Products Catalog
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in paise
  sku: text("sku"),
  stock: integer("stock"),
  category: text("category"),
  imageUrl: text("image_url"),
  status: productStatusEnum("status").default("active").notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("prod_org_idx").on(table.orgId)
]);

// Services Catalog
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in paise
  duration: integer("duration"), // in minutes
  status: serviceStatusEnum("status").default("active").notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("serv_org_idx").on(table.orgId)
]);

// Commercial orders and bookings
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  branchId: integer("branch_id").references(() => branches.id, { onDelete: "set null" }),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "set null" }),
  status: orderStatusEnum("status").default("pending").notNull(),
  totalAmount: integer("total_amount").notNull(), // in paise
  paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),
  paymentMethod: paymentMethodEnum("payment_method"),
  type: orderTypeEnum("type"),
  notes: text("notes"),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("orders_org_idx").on(table.orgId),
  index("orders_branch_idx").on(table.branchId),
  index("orders_customer_idx").on(table.customerId)
]);

// Items inside commercial orders
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  serviceId: integer("service_id").references(() => services.id, { onDelete: "set null" }),
  quantity: integer("quantity").default(1).notNull(),
  price: integer("price").notNull(), // in paise (locked price at sale time)
}, (table) => [
  index("items_order_idx").on(table.orderId)
]);


// ============================================================================
// 5. OPERATION & BOOKING TABLES
// ============================================================================

// Appointments scheduling registry
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  branchId: integer("branch_id").references(() => branches.id, { onDelete: "set null" }),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  serviceId: integer("service_id").references(() => services.id, { onDelete: "set null" }),
  staffId: integer("staff_id").references(() => staff.id, { onDelete: "set null" }),
  dateTime: timestamp("date_time").notNull(),
  status: appointmentStatusEnum("status").default("scheduled").notNull(),
  notes: text("notes"),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("appt_org_idx").on(table.orgId),
  index("appt_branch_idx").on(table.branchId),
  index("appt_customer_idx").on(table.customerId)
]);

// Service tickets tracking workflows and issues
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  branchId: integer("branch_id").references(() => branches.id, { onDelete: "set null" }),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: ticketStatusEnum("status").default("open").notNull(),
  priority: ticketPriorityEnum("priority").default("medium").notNull(),
  assignedTo: text("assigned_to").references(() => users.id, { onDelete: "set null" }),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("tickets_org_idx").on(table.orgId),
  index("tickets_branch_idx").on(table.branchId),
  index("tickets_customer_idx").on(table.customerId)
]);

// Invoices representing billing details
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  branchId: integer("branch_id").references(() => branches.id, { onDelete: "set null" }),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "set null" }),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  dueDate: timestamp("due_date"),
  status: invoiceStatusEnum("status").default("unpaid").notNull(),
  subtotal: integer("subtotal").notNull(), // in paise
  tax: integer("tax").default(0).notNull(),
  discount: integer("discount").default(0).notNull(),
  total: integer("total").notNull(), // in paise
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("inv_org_idx").on(table.orgId),
  index("inv_branch_idx").on(table.branchId),
  index("inv_customer_idx").on(table.customerId)
]);

// Payments transactions logs
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "set null" }),
  amount: integer("amount").notNull(), // in paise
  paymentMethod: paymentMethodEnum("payment_method").default("upi").notNull(),
  transactionRef: text("transaction_ref"),
  status: paymentStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("pmt_org_idx").on(table.orgId),
  index("pmt_invoice_idx").on(table.invoiceId),
  index("pmt_order_idx").on(table.orderId)
]);


// ============================================================================
// 6. COMMUNICATION & ASSETS
// ============================================================================

// Marketing campaigns logs
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  content: text("content"),
  status: campaignStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("mktg_org_idx").on(table.orgId)
]);

// Generated assets metadata
export const generatedAssets = pgTable("generated_assets", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  type: assetTypeEnum("type").notNull(),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("asset_org_idx").on(table.orgId)
]);

// Documents registry
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  fileType: text("file_type"),
  size: integer("size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("doc_org_idx").on(table.orgId)
]);

// User notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("notif_user_idx").on(table.userId)
]);

// User language settings
export const languagePreferences = pgTable("language_preferences", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  language: text("language").default("en").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Copilot AI conversations context store
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  messages: jsonb("messages").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("ai_conv_user_idx").on(table.userId)
]);

// Audit trails & analytics events
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("logs_org_idx").on(table.orgId)
]);

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  eventData: jsonb("event_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("analytics_org_idx").on(table.orgId)
]);

// Custom pgvector type mapping and knowledge base tables for RAG support agent
import { customType } from "drizzle-orm/pg-core";

export const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(768)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: string): number[] {
    return value
      .replace(/[\[\]]/g, "")
      .split(",")
      .map(Number);
  },
});

export const knowledgeDocuments = pgTable("knowledge_documents", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("kb_doc_org_idx").on(table.orgId)
]);

export const knowledgeChunks = pgTable("knowledge_chunks", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  documentId: integer("document_id").notNull().references(() => knowledgeDocuments.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  contentText: text("content_text").notNull(),
  embedding: vector("embedding").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("kb_chunk_org_idx").on(table.orgId),
  index("kb_chunk_doc_idx").on(table.documentId)
]);