import { Router } from "express";
import { db, products, services, orders, orderItems, appointments, tickets, invoices, payments, marketingCampaigns } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { mockStore } from "../lib/mockStore";
import { validate } from "../middlewares/validate";
import { requireOrgMembership } from "../middlewares/requireOrgMembership";

const router = Router();

const createProductSchema = z.object({
  orgId: z.number(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.number().int().nonnegative(),
  sku: z.string().optional().nullable(),
  stock: z.number().int().optional().nullable(),
  category: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

const createServiceSchema = z.object({
  orgId: z.number(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.number().int().nonnegative(),
  duration: z.number().int().optional().nullable(),
});

const createOrderSchema = z.object({
  orgId: z.number(),
  branchId: z.number().optional().nullable(),
  customerId: z.number().optional().nullable(),
  status: z.string().optional().nullable(),
  totalAmount: z.number().int().nonnegative(),
  paymentStatus: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  items: z.array(z.object({
    productId: z.number().optional().nullable(),
    serviceId: z.number().optional().nullable(),
    quantity: z.number().int().positive().optional().nullable(),
    price: z.number().int().nonnegative(),
  })).min(1),
});

// ============================================================================
// PRODUCTS CATALOG
// ============================================================================
router.get("/products", requireOrgMembership, async (req, res) => {
  const orgId = parseInt(req.query.orgId as string || "1");

  if (process.env.DATABASE_URL) {
    try {
      const results = await db.select().from(products).where(eq(products.orgId, orgId));
      return res.json(results);
    } catch (err: any) {
      console.error("DB List Products Error:", err.message);
    }
  }

  // Fallback
  return res.json(mockStore.products.filter((p) => p.orgId === orgId));
});

router.post("/products", requireOrgMembership, validate(createProductSchema), async (req, res) => {
  const { orgId, name, description, price, sku, stock, category, imageUrl } = req.body;

  if (process.env.DATABASE_URL) {
    try {
      const [newProduct] = await db
        .insert(products)
        .values({ orgId, name, description, price, sku, stock, category, imageUrl })
        .returning();
      return res.json(newProduct);
    } catch (err: any) {
      console.error("DB Create Product Error:", err.message);
    }
  }

  // Fallback
  const newProduct = {
    id: mockStore.products.length + 1,
    orgId,
    name,
    description,
    price,
    sku,
    stock,
    category,
    imageUrl,
  };
  mockStore.products.push(newProduct);
  return res.json(newProduct);
});

// ============================================================================
// SERVICES CATALOG
// ============================================================================
router.get("/services", requireOrgMembership, async (req, res) => {
  const orgId = parseInt(req.query.orgId as string || "1");

  if (process.env.DATABASE_URL) {
    try {
      const results = await db.select().from(services).where(eq(services.orgId, orgId));
      return res.json(results);
    } catch (err: any) {
      console.error("DB List Services Error:", err.message);
    }
  }

  // Fallback
  return res.json(mockStore.services.filter((s) => s.orgId === orgId));
});

router.post("/services", requireOrgMembership, validate(createServiceSchema), async (req, res) => {
  const { orgId, name, description, price, duration } = req.body;

  if (process.env.DATABASE_URL) {
    try {
      const [newService] = await db
        .insert(services)
        .values({ orgId, name, description, price, duration })
        .returning();
      return res.json(newService);
    } catch (err: any) {
      console.error("DB Create Service Error:", err.message);
    }
  }

  // Fallback
  const newService = {
    id: mockStore.services.length + 1,
    orgId,
    name,
    description,
    price,
    duration,
  };
  mockStore.services.push(newService);
  return res.json(newService);
});

// ============================================================================
// ORDERS & SALES
// ============================================================================
router.get("/orders", requireOrgMembership, async (req, res) => {
  const orgId = parseInt(req.query.orgId as string || "1");

  if (process.env.DATABASE_URL) {
    try {
      const results = await db.select().from(orders).where(eq(orders.orgId, orgId));
      return res.json(results);
    } catch (err: any) {
      console.error("DB List Orders Error:", err.message);
    }
  }

  // Fallback
  return res.json(mockStore.orders.filter((o) => o.orgId === orgId));
});

router.post("/orders", requireOrgMembership, validate(createOrderSchema), async (req, res) => {
  const { orgId, branchId, customerId, status, totalAmount, paymentStatus, paymentMethod, type, items } = req.body;

  if (process.env.DATABASE_URL) {
    try {
      const [newOrder] = await db
        .insert(orders)
        .values({
          orgId,
          branchId,
          customerId,
          status: status || "pending",
          totalAmount,
          paymentStatus: paymentStatus || "pending",
          paymentMethod,
          type,
        })
        .returning();

      for (const item of items) {
        await db.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          serviceId: item.serviceId,
          quantity: item.quantity || 1,
          price: item.price,
        });
      }

      return res.json(newOrder);
    } catch (err: any) {
      console.error("DB Create Order Error:", err.message);
    }
  }

  // Fallback
  const newOrder = {
    id: mockStore.orders.length + 1,
    orgId,
    branchId,
    customerId,
    status: status || "pending",
    totalAmount,
    paymentStatus: paymentStatus || "pending",
    paymentMethod,
    type,
    createdAt: new Date().toISOString(),
  };
  mockStore.orders.push(newOrder);

  for (const item of items) {
    mockStore.orderItems.push({
      id: mockStore.orderItems.length + 1,
      orderId: newOrder.id,
      productId: item.productId,
      serviceId: item.serviceId,
      quantity: item.quantity || 1,
      price: item.price,
    });
  }

  return res.json(newOrder);
});

// ============================================================================
// APPOINTMENTS
// ============================================================================
router.get("/appointments", requireOrgMembership, async (req, res) => {
  const orgId = parseInt(req.query.orgId as string || "1");

  if (process.env.DATABASE_URL) {
    try {
      const results = await db.select().from(appointments).where(eq(appointments.orgId, orgId));
      return res.json(results);
    } catch (err: any) {
      console.error("DB List Appointments Error:", err.message);
    }
  }

  // Fallback
  return res.json(mockStore.appointments.filter((a) => a.orgId === orgId));
});

router.post("/appointments", requireOrgMembership, async (req, res) => {
  const { orgId, branchId, customerId, serviceId, staffId, dateTime, notes } = req.body;

  if (!orgId || !customerId || !dateTime) {
    return res.status(400).json({ error: "Missing required fields (orgId, customerId, dateTime)" });
  }

  if (process.env.DATABASE_URL) {
    try {
      const [newAppt] = await db
        .insert(appointments)
        .values({
          orgId,
          branchId,
          customerId,
          serviceId,
          staffId,
          dateTime: new Date(dateTime),
          status: "scheduled",
          notes,
        })
        .returning();
      return res.json(newAppt);
    } catch (err: any) {
      console.error("DB Create Appointment Error:", err.message);
    }
  }

  // Fallback
  const newAppt = {
    id: mockStore.appointments.length + 1,
    orgId,
    branchId,
    customerId,
    serviceId,
    staffId,
    dateTime,
    status: "scheduled",
    notes,
  };
  mockStore.appointments.push(newAppt);
  return res.json(newAppt);
});

// ============================================================================
// TICKETS (SERVICE / COMPLAINTS)
// ============================================================================
router.get("/tickets", requireOrgMembership, async (req, res) => {
  const orgId = parseInt(req.query.orgId as string || "1");

  if (process.env.DATABASE_URL) {
    try {
      const results = await db.select().from(tickets).where(eq(tickets.orgId, orgId));
      return res.json(results);
    } catch (err: any) {
      console.error("DB List Tickets Error:", err.message);
    }
  }

  // Fallback
  return res.json(mockStore.tickets.filter((t) => t.orgId === orgId));
});

router.post("/tickets", requireOrgMembership, async (req, res) => {
  const { orgId, branchId, customerId, title, description, priority, assignedTo } = req.body;

  if (!orgId || !customerId || !title) {
    return res.status(400).json({ error: "Missing required fields (orgId, customerId, title)" });
  }

  if (process.env.DATABASE_URL) {
    try {
      const [newTicket] = await db
        .insert(tickets)
        .values({
          orgId,
          branchId,
          customerId,
          title,
          description,
          status: "open",
          priority: priority || "medium",
          assignedTo,
        })
        .returning();
      return res.json(newTicket);
    } catch (err: any) {
      console.error("DB Create Ticket Error:", err.message);
    }
  }

  // Fallback
  const newTicket = {
    id: mockStore.tickets.length + 1,
    orgId,
    branchId,
    customerId,
    title,
    description,
    status: "open",
    priority: priority || "medium",
    assignedTo,
  };
  mockStore.tickets.push(newTicket);
  return res.json(newTicket);
});

// ============================================================================
// INVOICES & BILLING
// ============================================================================
router.get("/invoices", requireOrgMembership, async (req, res) => {
  const orgId = parseInt(req.query.orgId as string || "1");

  if (process.env.DATABASE_URL) {
    try {
      const results = await db.select().from(invoices).where(eq(invoices.orgId, orgId));
      return res.json(results);
    } catch (err: any) {
      console.error("DB List Invoices Error:", err.message);
    }
  }

  // Fallback
  return res.json(mockStore.invoices.filter((i) => i.orgId === orgId));
});

router.post("/invoices", requireOrgMembership, async (req, res) => {
  const { orgId, branchId, orderId, customerId, invoiceNumber, dueDate, subtotal, tax, discount, total } = req.body;

  if (!orgId || !customerId || !invoiceNumber || subtotal === undefined || total === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (process.env.DATABASE_URL) {
    try {
      const [newInvoice] = await db
        .insert(invoices)
        .values({
          orgId,
          branchId,
          orderId,
          customerId,
          invoiceNumber,
          dueDate: dueDate ? new Date(dueDate) : null,
          status: "unpaid",
          subtotal,
          tax: tax || 0,
          discount: discount || 0,
          total,
        })
        .returning();
      return res.json(newInvoice);
    } catch (err: any) {
      console.error("DB Create Invoice Error:", err.message);
    }
  }

  // Fallback
  const newInvoice = {
    id: mockStore.invoices.length + 1,
    orgId,
    branchId,
    orderId,
    customerId,
    invoiceNumber,
    dueDate,
    status: "unpaid",
    subtotal,
    tax: tax || 0,
    discount: discount || 0,
    total,
    createdAt: new Date().toISOString(),
  };
  mockStore.invoices.push(newInvoice);
  return res.json(newInvoice);
});

// ============================================================================
// PAYMENTS (UPI SETTLEMENTS)
// ============================================================================
router.get("/payments", requireOrgMembership, async (req, res) => {
  const orgId = parseInt(req.query.orgId as string || "1");

  if (process.env.DATABASE_URL) {
    try {
      const results = await db.select().from(payments).where(eq(payments.orgId, orgId));
      return res.json(results);
    } catch (err: any) {
      console.error("DB List Payments Error:", err.message);
    }
  }

  // Fallback
  return res.json(mockStore.payments.filter((pay) => pay.orgId === orgId));
});

router.post("/payments", requireOrgMembership, async (req, res) => {
  const { orgId, invoiceId, orderId, amount, paymentMethod, transactionRef, status } = req.body;

  if (!orgId || !amount || !paymentMethod) {
    return res.status(400).json({ error: "Missing required fields (orgId, amount, paymentMethod)" });
  }

  if (process.env.DATABASE_URL) {
    try {
      const [newPayment] = await db
        .insert(payments)
        .values({
          orgId,
          invoiceId,
          orderId,
          amount,
          paymentMethod,
          transactionRef,
          status: status || "pending",
        })
        .returning();

      // If success, update order/invoice payment status
      if (status === "success") {
        if (orderId) {
          await db.update(orders).set({ paymentStatus: "paid" }).where(eq(orders.id, orderId));
        }
        if (invoiceId) {
          await db.update(invoices).set({ status: "paid" }).where(eq(invoices.id, invoiceId));
        }
      }

      return res.json(newPayment);
    } catch (err: any) {
      console.error("DB Record Payment Error:", err.message);
    }
  }

  // Fallback
  const newPayment = {
    id: mockStore.payments.length + 1,
    orgId,
    invoiceId,
    orderId,
    amount,
    paymentMethod,
    transactionRef,
    status: status || "pending",
    createdAt: new Date().toISOString(),
  };
  mockStore.payments.push(newPayment);

  if (status === "success") {
    if (orderId) {
      const order = mockStore.orders.find((o) => o.id === orderId);
      if (order) order.paymentStatus = "paid";
    }
    if (invoiceId) {
      const invoice = mockStore.invoices.find((i) => i.id === invoiceId);
      if (invoice) invoice.status = "paid";
    }
  }

  return res.json(newPayment);
});

// ============================================================================
// MARKETING CAMPAIGNS
// ============================================================================
router.get("/campaigns", requireOrgMembership, async (req, res) => {
  const orgId = parseInt(req.query.orgId as string || "1");

  if (process.env.DATABASE_URL) {
    try {
      const results = await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.orgId, orgId));
      return res.json(results);
    } catch (err: any) {
      console.error("DB List Campaigns Error:", err.message);
    }
  }

  // Fallback
  return res.json(mockStore.marketingCampaigns.filter((cam) => cam.orgId === orgId));
});

router.post("/campaigns", requireOrgMembership, async (req, res) => {
  const { orgId, name, type, content } = req.body;

  if (!orgId || !name || !type) {
    return res.status(400).json({ error: "Missing required fields (orgId, name, type)" });
  }

  if (process.env.DATABASE_URL) {
    try {
      const [newCamp] = await db
        .insert(marketingCampaigns)
        .values({
          orgId,
          name,
          type,
          content,
          status: "sent",
        })
        .returning();
      return res.json(newCamp);
    } catch (err: any) {
      console.error("DB Create Campaign Error:", err.message);
    }
  }

  // Fallback
  const newCamp = {
    id: mockStore.marketingCampaigns.length + 1,
    orgId,
    name,
    type,
    content,
    status: "sent",
    createdAt: new Date().toISOString(),
  };
  mockStore.marketingCampaigns.push(newCamp);
  return res.json(newCamp);
});

export default router;
