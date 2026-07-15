import { db, customers, leads, tasks, tickets } from "@workspace/db";
import { eq, and, or, ilike } from "drizzle-orm";
import { mockStore } from "../lib/mockStore";

export const CRMProvider = {
  /**
   * Returns ContextEngine data for the CRM domain: active leads and pending tasks.
   */
  resolveContext: async (orgId: number | string) => {
    const parsedOrgId = typeof orgId === "string" ? parseInt(orgId, 10) : orgId;
    let activeLeadsCount = 0;
    let pendingTasksCount = 0;

    if (process.env.DATABASE_URL) {
      try {
        const activeLeadsList = await db
          .select()
          .from(leads)
          .where(and(eq(leads.orgId, parsedOrgId), eq(leads.status, "new" as any)));
        activeLeadsCount = activeLeadsList.length;

        const pendingTasksList = await db
          .select()
          .from(tasks)
          .where(and(eq(tasks.orgId, parsedOrgId), eq(tasks.status, "todo" as any)));
        pendingTasksCount = pendingTasksList.length;
      } catch (err: any) {
        console.error("[CRMProvider] DB resolveContext Error:", err.message);
      }
    }

    // Fallback / sync to mockStore
    if (activeLeadsCount === 0 && pendingTasksCount === 0) {
      activeLeadsCount = mockStore.leads.filter(
        (l) => l.orgId === parsedOrgId && l.status !== "converted" && l.status !== "lost"
      ).length;
      pendingTasksCount = mockStore.tasks.filter(
        (t) => t.orgId === parsedOrgId && t.status !== "completed"
      ).length;
    }

    return { activeLeadsCount, pendingTasksCount };
  },

  /**
   * Registers a customer contact profile.
   */
  create_customer: async (params: {
    orgId: number | string;
    branchId?: number | string | null;
    name: string;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
  }) => {
    const { orgId, branchId, name, email, phone, notes } = params;
    const parsedOrgId = typeof orgId === "string" ? parseInt(orgId, 10) : orgId;
    const parsedBranchId = typeof branchId === "string" ? parseInt(branchId, 10) : (branchId ?? null);

    if (process.env.DATABASE_URL) {
      try {
        const [newCust] = await db
          .insert(customers)
          .values({
            orgId: parsedOrgId,
            branchId: parsedBranchId,
            name,
            email: email ?? null,
            phone: phone ?? null,
            notes: notes ?? null,
          } as any)
          .returning();
        return newCust;
      } catch (err: any) {
        console.error("[CRMProvider] DB Create Customer Error:", err.message);
      }
    }

    // Fallback to mockStore
    const newCust = {
      id: mockStore.customers.length + 1,
      orgId: parsedOrgId,
      branchId: parsedBranchId,
      name,
      email: email ?? null,
      phone: phone ?? null,
      notes: notes ?? null,
    };
    mockStore.customers.push(newCust);
    return newCust;
  },

  /**
   * Spawns a sales lead pipeline tracking point.
   */
  create_lead: async (params: {
    orgId: number | string;
    branchId?: number | string | null;
    customerId: number | string;
    source?: string | null;
    status?: string | null;
    notes?: string | null;
    assignedTo?: string | null;
  }) => {
    const { orgId, branchId, customerId, source, status, notes, assignedTo } = params;
    const parsedOrgId = typeof orgId === "string" ? parseInt(orgId, 10) : orgId;
    const parsedBranchId = typeof branchId === "string" ? parseInt(branchId, 10) : (branchId ?? null);
    const parsedCustomerId = typeof customerId === "string" ? parseInt(customerId, 10) : customerId;

    if (process.env.DATABASE_URL) {
      try {
        const [newLead] = await db
          .insert(leads)
          .values({
            orgId: parsedOrgId,
            branchId: parsedBranchId,
            customerId: parsedCustomerId,
            source,
            status: status || "new",
            notes,
            assignedTo,
          } as any)
          .returning();
        return newLead;
      } catch (err: any) {
        console.error("[CRMProvider] DB Create Lead Error:", err.message);
      }
    }

    // Fallback to mockStore
    const newLead = {
      id: mockStore.leads.length + 1,
      orgId: parsedOrgId,
      branchId: parsedBranchId,
      customerId: parsedCustomerId,
      source: source ?? null,
      status: status || "new",
      notes: notes ?? null,
      assignedTo: assignedTo ?? null,
      createdAt: new Date().toISOString(),
    };
    mockStore.leads.push(newLead);
    return newLead;
  },

  /**
   * Modifies lead pipelines.
   */
  update_lead_status: async (params: {
    leadId?: number | string;
    lead_id?: number | string;
    id?: number | string;
    status: string;
  }) => {
    const leadIdRaw = params.leadId !== undefined ? params.leadId : (params.lead_id !== undefined ? params.lead_id : params.id);
    if (leadIdRaw === undefined) {
      throw new Error("[CRMProvider] Missing required parameter 'leadId'.");
    }

    const { status } = params;
    const parsedLeadId = typeof leadIdRaw === "string" ? parseInt(leadIdRaw, 10) : leadIdRaw;

    if (process.env.DATABASE_URL) {
      try {
        const [updatedLead] = await db
          .update(leads)
          .set({ status } as any)
          .where(eq(leads.id, parsedLeadId))
          .returning();
        return updatedLead;
      } catch (err: any) {
        console.error("[CRMProvider] DB Update Lead Status Error:", err.message);
      }
    }

    // Fallback to mockStore
    const lead = mockStore.leads.find((l) => l.id === parsedLeadId);
    if (lead) {
      lead.status = status;
      return lead;
    }
    return null;
  },

  /**
   * Creates a staff assignment task.
   */
  create_task: async (params: {
    orgId: number | string;
    branchId?: number | string | null;
    title: string;
    description?: string | null;
    status?: string | null;
    dueDate?: string | null;
    assignedTo?: string | null;
  }) => {
    const { orgId, branchId, title, description, status, dueDate, assignedTo } = params;
    const parsedOrgId = typeof orgId === "string" ? parseInt(orgId, 10) : orgId;
    const parsedBranchId = typeof branchId === "string" ? parseInt(branchId, 10) : (branchId ?? null);

    if (process.env.DATABASE_URL) {
      try {
        const [newTask] = await db
          .insert(tasks)
          .values({
            orgId: parsedOrgId,
            branchId: parsedBranchId,
            title,
            description,
            status: status || "todo",
            dueDate: dueDate ? new Date(dueDate) : null,
            assignedTo,
          } as any)
          .returning();
        return newTask;
      } catch (err: any) {
        console.error("[CRMProvider] DB Create Task Error:", err.message);
      }
    }

    // Fallback to mockStore
    const newTask = {
      id: mockStore.tasks.length + 1,
      orgId: parsedOrgId,
      branchId: parsedBranchId,
      title,
      description: description ?? null,
      status: status || "todo",
      dueDate: dueDate ?? null,
      assignedTo: assignedTo ?? null,
      createdAt: new Date().toISOString(),
    };
    mockStore.tasks.push(newTask);
    return newTask;
  },

  /**
   * Registers a customer support or service ticket.
   */
  create_service_ticket: async (params: {
    orgId?: number | string;
    branchId?: number | string | null;
    customerId?: number | string;
    title: string;
    description?: string | null;
    priority?: string | null;
    assignedTo?: string | null;
  }) => {
    const { orgId, branchId, customerId, title, description, priority, assignedTo } = params;
    
    if (orgId === undefined || customerId === undefined || !title) {
      throw new Error("[CRMProvider] Missing required parameters 'orgId', 'customerId', or 'title'.");
    }

    const parsedOrgId = typeof orgId === "string" ? parseInt(orgId, 10) : orgId;
    const parsedBranchId = typeof branchId === "string" ? parseInt(branchId, 10) : (branchId ?? null);
    const parsedCustomerId = typeof customerId === "string" ? parseInt(customerId, 10) : customerId;

    if (process.env.DATABASE_URL) {
      try {
        const [newTicket] = await db
          .insert(tickets)
          .values({
            orgId: parsedOrgId,
            branchId: parsedBranchId,
            customerId: parsedCustomerId,
            title,
            description: description ?? null,
            status: "open" as any,
            priority: priority || "medium",
            assignedTo: assignedTo ?? null,
          } as any)
          .returning();
        return newTicket;
      } catch (err: any) {
        console.error("[CRMProvider] DB Create Ticket Error:", err.message);
      }
    }

    // Fallback to mockStore
    if (!mockStore.tickets) {
      mockStore.tickets = [];
    }

    const newTicket = {
      id: mockStore.tickets.length + 1,
      orgId: parsedOrgId,
      branchId: parsedBranchId,
      customerId: parsedCustomerId,
      title,
      description: description ?? null,
      status: "open",
      priority: priority || "medium",
      assignedTo: assignedTo ?? null,
    };
    mockStore.tickets.push(newTicket);
    return newTicket;
  },

  /**
   * Searches customer contact profiles by name, email, or phone.
   */
  search_customers: async (params: {
    orgId?: number | string;
    query: string;
  }) => {
    const { orgId, query } = params;
    if (orgId === undefined || query === undefined) {
      throw new Error("[CRMProvider] Missing required parameters 'orgId' or 'query'.");
    }

    const parsedOrgId = typeof orgId === "string" ? parseInt(orgId, 10) : orgId;
    const q = query.toLowerCase();

    if (process.env.DATABASE_URL) {
      try {
        const sqlQuery = `%${q}%`;
        const results = await db
          .select()
          .from(customers)
          .where(
            and(
              eq(customers.orgId, parsedOrgId),
              or(
                ilike(customers.name, sqlQuery),
                ilike(customers.email, sqlQuery),
                ilike(customers.phone, sqlQuery)
              )
            )
          );
        return results;
      } catch (err: any) {
        console.error("[CRMProvider] DB Search Customers Error:", err.message);
      }
    }

    // Fallback to mockStore
    return mockStore.customers.filter(
      (c: any) =>
        c.orgId === parsedOrgId &&
        ((c.name && c.name.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.phone && c.phone.toLowerCase().includes(q)))
    );
  },

  /**
   * Dispatches the action route by action name mapping.
   */
  execute: async (action: string, params: any): Promise<any> => {
    const fn = (CRMProvider as any)[action];
    if (!fn || typeof fn !== "function") {
      throw new Error(`Action "${action}" is not supported by CRMProvider.`);
    }
    return await fn(params);
  },
};
