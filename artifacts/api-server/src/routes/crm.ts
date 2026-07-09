import { Router } from "express";
import { db, customers, leads, inquiries, tasks } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { mockStore } from "../lib/mockStore";
import { validate } from "../middlewares/validate";
import { requireOrgMembership } from "../middlewares/requireOrgMembership";

const router = Router();

const createCustomerSchema = z.object({
  orgId: z.number(),
  branchId: z.number().optional().nullable(),
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const createLeadSchema = z.object({
  orgId: z.number(),
  branchId: z.number().optional().nullable(),
  customerId: z.number(),
  source: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
});

const updateLeadStatusSchema = z.object({
  status: z.string().min(1),
});

const createInquirySchema = z.object({
  orgId: z.number(),
  branchId: z.number().optional().nullable(),
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
});

const createTaskSchema = z.object({
  orgId: z.number(),
  branchId: z.number().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
});

// ============================================================================
// CUSTOMERS ROUTING
// ============================================================================

router.get("/customers", requireOrgMembership, async (req, res) => {
  const orgId = parseInt(req.query.orgId as string || "1");

  if (process.env.DATABASE_URL) {
    try {
      const results = await db.select().from(customers).where(eq(customers.orgId, orgId));
      return res.json(results);
    } catch (err: any) {
      console.error("DB List Customers Error:", err.message);
    }
  }

  // Fallback
  const orgCusts = mockStore.customers.filter((c) => c.orgId === orgId);
  return res.json(orgCusts);
});

router.post("/customers", requireOrgMembership, validate(createCustomerSchema), async (req, res) => {
  const { orgId, branchId, name, email, phone, notes } = req.body;

  if (process.env.DATABASE_URL) {
    try {
      const [newCust] = await db
        .insert(customers)
        .values({ orgId, branchId, name, email, phone, notes })
        .returning();
      return res.json(newCust);
    } catch (err: any) {
      console.error("DB Create Customer Error:", err.message);
    }
  }

  // Fallback
  const newCust = {
    id: mockStore.customers.length + 1,
    orgId,
    branchId,
    name,
    email,
    phone,
    notes,
  };
  mockStore.customers.push(newCust);
  return res.json(newCust);
});

// ============================================================================
// LEADS ROUTING
// ============================================================================

router.get("/leads", requireOrgMembership, async (req, res) => {
  const orgId = parseInt(req.query.orgId as string || "1");

  if (process.env.DATABASE_URL) {
    try {
      const results = await db.select().from(leads).where(eq(leads.orgId, orgId));
      return res.json(results);
    } catch (err: any) {
      console.error("DB List Leads Error:", err.message);
    }
  }

  // Fallback
  const orgLeads = mockStore.leads.filter((l) => l.orgId === orgId);
  return res.json(orgLeads);
});

router.post("/leads", requireOrgMembership, validate(createLeadSchema), async (req, res) => {
  const { orgId, branchId, customerId, source, status, notes, assignedTo } = req.body;

  if (process.env.DATABASE_URL) {
    try {
      const [newLead] = await db
        .insert(leads)
        .values({
          orgId,
          branchId,
          customerId,
          source,
          status: status || "new",
          notes,
          assignedTo,
        })
        .returning();
      return res.json(newLead);
    } catch (err: any) {
      console.error("DB Create Lead Error:", err.message);
    }
  }

  // Fallback
  const newLead = {
    id: mockStore.leads.length + 1,
    orgId,
    branchId,
    customerId,
    source,
    status: status || "new",
    notes,
    assignedTo,
    createdAt: new Date().toISOString(),
  };
  mockStore.leads.push(newLead);
  return res.json(newLead);
});

router.put("/leads/:leadId/status", validate(updateLeadStatusSchema), async (req, res) => {
  const leadId = parseInt(req.params.leadId as string);
  const { status } = req.body;

  if (process.env.DATABASE_URL) {
    try {
      const [updated] = await db
        .update(leads)
        .set({ status, updatedAt: new Date() })
        .where(eq(leads.id, leadId))
        .returning();
      return res.json(updated);
    } catch (err: any) {
      console.error("DB Update Lead Status Error:", err.message);
    }
  }

  // Fallback
  const lead = mockStore.leads.find((l) => l.id === leadId);
  if (lead) {
    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    return res.json(lead);
  }
  return res.status(404).json({ error: "Lead not found" });
});

// ============================================================================
// INQUIRIES ROUTING (FROM WEBSITES)
// ============================================================================

router.get("/inquiries", requireOrgMembership, async (req, res) => {
  const orgId = parseInt(req.query.orgId as string || "1");

  if (process.env.DATABASE_URL) {
    try {
      const results = await db.select().from(inquiries).where(eq(inquiries.orgId, orgId));
      return res.json(results);
    } catch (err: any) {
      console.error("DB List Inquiries Error:", err.message);
    }
  }

  // Fallback
  const orgInquiries = mockStore.inquiries.filter((inq) => inq.orgId === orgId);
  return res.json(orgInquiries);
});

router.post("/inquiries", validate(createInquirySchema), async (req, res) => {
  const { orgId, branchId, name, email, phone, message } = req.body;

  if (process.env.DATABASE_URL) {
    try {
      const [newInq] = await db
        .insert(inquiries)
        .values({
          orgId,
          branchId,
          name,
          email,
          phone,
          message,
          status: "pending",
        })
        .returning();
      
      // Auto create a CRM Customer & Lead card for this Inquiry!
      let customerId;
      const existingCustomers = await db.select().from(customers).where(and(eq(customers.orgId, orgId), eq(customers.phone, phone || ""))).limit(1);
      if (existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
      } else {
        const [newCust] = await db.insert(customers).values({ orgId, branchId, name, email, phone, notes: "Created from website inquiry." }).returning();
        customerId = newCust.id;
      }

      await db.insert(leads).values({
        orgId,
        branchId,
        customerId,
        source: "website",
        status: "new",
        notes: message || "Website inquiry inquiry.",
      });

      return res.json(newInq);
    } catch (err: any) {
      console.error("DB Create Inquiry Error:", err.message);
    }
  }

  // Fallback
  const newInq = {
    id: mockStore.inquiries.length + 1,
    orgId,
    branchId,
    name,
    email,
    phone,
    message,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  mockStore.inquiries.push(newInq);

  // Fallback Auto-lead linking
  let mockCust = mockStore.customers.find((c) => c.orgId === orgId && c.phone === phone);
  if (!mockCust) {
    mockCust = {
      id: mockStore.customers.length + 1,
      orgId,
      branchId,
      name,
      email,
      phone,
      notes: "Created from website inquiry.",
    };
    mockStore.customers.push(mockCust);
  }

  mockStore.leads.push({
    id: mockStore.leads.length + 1,
    orgId,
    branchId,
    customerId: mockCust.id,
    source: "website",
    status: "new",
    notes: message || "Website inquiry inquiry.",
    createdAt: new Date().toISOString(),
  });

  return res.json(newInq);
});

// ============================================================================
// TASKS ROUTING
// ============================================================================

router.get("/tasks", requireOrgMembership, async (req, res) => {
  const orgId = parseInt(req.query.orgId as string || "1");

  if (process.env.DATABASE_URL) {
    try {
      const results = await db.select().from(tasks).where(eq(tasks.orgId, orgId));
      return res.json(results);
    } catch (err: any) {
      console.error("DB List Tasks Error:", err.message);
    }
  }

  // Fallback
  const orgTasks = mockStore.tasks.filter((t) => t.orgId === orgId);
  return res.json(orgTasks);
});

router.post("/tasks", requireOrgMembership, validate(createTaskSchema), async (req, res) => {
  const { orgId, branchId, title, description, status, dueDate, assignedTo } = req.body;

  if (process.env.DATABASE_URL) {
    try {
      const [newTask] = await db
        .insert(tasks)
        .values({
          orgId,
          branchId,
          title,
          description,
          status: status || "todo",
          dueDate: dueDate ? new Date(dueDate) : null,
          assignedTo,
        })
        .returning();
      return res.json(newTask);
    } catch (err: any) {
      console.error("DB Create Task Error:", err.message);
    }
  }

  // Fallback
  const newTask = {
    id: mockStore.tasks.length + 1,
    orgId,
    branchId,
    title,
    description,
    status: status || "todo",
    dueDate,
    assignedTo,
    createdAt: new Date().toISOString(),
  };
  mockStore.tasks.push(newTask);
  return res.json(newTask);
});

export default router;
