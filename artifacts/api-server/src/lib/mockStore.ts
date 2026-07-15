import fs from "fs";
import path from "path";

export interface MockStore {
  users: any[];
  organizations: any[];
  organizationMembers: any[];
  branches: any[];
  businessProfiles: any[];
  industryProfiles: any[];
  customers: any[];
  leads: any[];
  inquiries: any[];
  staff: any[];
  tasks: any[];
  products: any[];
  services: any[];
  orders: any[];
  orderItems: any[];
  appointments: any[];
  tickets: any[];
  invoices: any[];
  payments: any[];
  marketingCampaigns: any[];
  knowledgeDocuments: any[];
  knowledgeChunks: any[];
  aiConversations: Record<string, any[]>;
}

const MOCK_DB_PATH = path.resolve(process.cwd(), "mock_database.json");

const rawMockStore: MockStore = {
  users: [
    { id: "mock-user-1", email: "demo@vyapaar.ai", displayName: "Demo Owner" }
  ],
  organizations: [
    { id: 1, name: "Srinivasa Kirana Store" }
  ],
  organizationMembers: [
    { id: 1, orgId: 1, userId: "mock-user-1", role: "owner" }
  ],
  branches: [
    { id: 1, orgId: 1, name: "Main Branch", location: "Kukatpally, Hyderabad" }
  ],
  businessProfiles: [
    {
      orgId: 1,
      tagline: "Your daily grocery partner",
      primaryColor: "#4f46e5",
      shortDescription: "Srinivasa Kirana Store is a trusted retail grocery business serving quality food products and household essentials.",
      category: "Retail & Grocery",
      phone: "+919876543210",
      address: "H.No 12-34, Main Road, Kukatpally, Hyderabad, 500072",
      businessHours: { Monday: "9:00 AM - 9:00 PM", Tuesday: "9:00 AM - 9:00 PM", Wednesday: "9:00 AM - 9:00 PM", Thursday: "9:00 AM - 9:00 PM", Friday: "9:00 AM - 9:00 PM", Saturday: "9:00 AM - 9:00 PM", Sunday: "Closed" }
    }
  ],
  industryProfiles: [
    { id: 1, orgId: 1, industryType: "retail", metadata: {} }
  ],
  customers: [
    { id: 1, orgId: 1, branchId: 1, name: "Rajesh Kumar", email: "rajesh@gmail.com", phone: "+919988776655", notes: "Regular milk customer" },
    { id: 2, orgId: 1, branchId: 1, name: "Pranitha Reddy", email: "pranitha@yahoo.com", phone: "+919944332211", notes: "Prefers home delivery" }
  ],
  leads: [
    { id: 1, orgId: 1, branchId: 1, customerId: 1, source: "website", status: "contacted", notes: "Inquired about bulk rice bags delivery", assignedTo: "mock-user-1", createdAt: new Date().toISOString() },
    { id: 2, orgId: 1, branchId: 1, customerId: 2, source: "whatsapp", status: "new", notes: "Wants weekly vegetable deliveries", assignedTo: "mock-user-1", createdAt: new Date().toISOString() }
  ],
  inquiries: [
    { id: 1, orgId: 1, branchId: 1, name: "Anil Sharma", email: "anil@gmail.com", phone: "+919876500111", message: "Do you deliver to Gachibowli?", status: "pending", createdAt: new Date().toISOString() }
  ],
  staff: [
    { id: 1, orgId: 1, branchId: 1, name: "Ramu", role: "Delivery Agent", phone: "+919111222333", email: "ramu@gmail.com" }
  ],
  tasks: [
    { id: 1, orgId: 1, branchId: 1, title: "Deliver Rice Bag to Rajesh", description: "Deliver 25kg Sonamasuri bag", status: "todo", dueDate: new Date(Date.now() + 86400000).toISOString(), assignedTo: "mock-user-1" },
    { id: 2, orgId: 1, branchId: 1, title: "Call Pranitha", description: "Confirm weekend delivery list", status: "todo", dueDate: new Date(Date.now() + 172800000).toISOString(), assignedTo: "mock-user-1" }
  ],
  products: [
    { id: 1, orgId: 1, name: "Sonamasuri Rice 25kg", description: "Premium aged white rice", price: 135000, sku: "RICE-SONA-25", stock: 15, category: "Grains" },
    { id: 2, orgId: 1, name: "Sunflower Oil 1L", description: "Refined healthy oil", price: 16000, sku: "OIL-SUN-1L", stock: 50, category: "Oils" },
    { id: 3, orgId: 1, name: "Toor Dal 1kg", description: "Unpolished organic dal", price: 18000, sku: "DAL-TOOR-1K", stock: 30, category: "Dals" },
    { id: 4, orgId: 1, name: "Atta Wheat Flour 10kg", description: "Premium whole wheat flour", price: 45000, sku: "FLOUR-ATTA-10", stock: 8, category: "Flour" }
  ],
  services: [
    { id: 1, orgId: 1, name: "Express Home Delivery", description: "Delivery within 2 hours", price: 5000, duration: 120 }
  ],
  orders: [
    { id: 1, orgId: 1, branchId: 1, customerId: 1, status: "completed", totalAmount: 151000, paymentStatus: "paid", paymentMethod: "upi", type: "delivery", notes: "Doorstep delivery", createdAt: new Date().toISOString() }
  ],
  orderItems: [
    { id: 1, orderId: 1, productId: 1, quantity: 1, price: 135000 },
    { id: 2, orderId: 1, productId: 2, quantity: 1, price: 16000 }
  ],
  appointments: [],
  tickets: [],
  invoices: [
    { id: 1, orgId: 1, branchId: 1, orderId: 1, customerId: 1, invoiceNumber: "INV-2026-001", dueDate: new Date().toISOString(), status: "paid", subtotal: 151000, tax: 0, discount: 0, total: 151000, createdAt: new Date().toISOString() }
  ],
  payments: [
    { id: 1, orgId: 1, invoiceId: 1, orderId: 1, amount: 151000, paymentMethod: "upi", transactionRef: "UTR9876543210", status: "success", createdAt: new Date().toISOString() }
  ],
  marketingCampaigns: [
    { id: 1, orgId: 1, name: "Diwali Special Offer", type: "whatsapp", content: "Flat 10% off on all products at Srinivasa Stores!", status: "sent", createdAt: new Date().toISOString() }
  ],
  knowledgeDocuments: [],
  knowledgeChunks: [],
  aiConversations: {}
};

// Try loading database from disk
try {
  if (fs.existsSync(MOCK_DB_PATH)) {
    const fileContent = fs.readFileSync(MOCK_DB_PATH, "utf-8");
    const loadedData = JSON.parse(fileContent);
    Object.assign(rawMockStore, loadedData);
  }
} catch (err: any) {
  console.error("🚨 [DB Warning] Failed to parse mock database JSON (corrupted?), starting fresh with default store. Error details:", err.message);
}

// Auto-save state trackers
let writeTimeout: NodeJS.Timeout | null = null;
let isWriting = false;
let writePending = false;

// Async atomic write worker
async function performWrite() {
  if (isWriting) {
    writePending = true;
    return;
  }

  isWriting = true;

  try {
    const tmpPath = `${MOCK_DB_PATH}.tmp`;
    const serialized = JSON.stringify(rawMockStore, null, 2);

    // Write to a temporary file first
    await fs.promises.writeFile(tmpPath, serialized, "utf-8");
    // Atomically rename it to the target database file
    await fs.promises.rename(tmpPath, MOCK_DB_PATH);
  } catch (err: any) {
    console.error("🚨 [DB Error] Failed to write mock database JSON:", err.message);
  } finally {
    isWriting = false;
    // If another write request queued up during our active write, trigger it immediately
    if (writePending) {
      writePending = false;
      performWrite();
    }
  }
}

// Debounced auto-save function
function saveMockStore() {
  if (writeTimeout) {
    clearTimeout(writeTimeout);
  }

  writeTimeout = setTimeout(() => {
    writeTimeout = null;
    performWrite();
  }, 250); // 250ms debounce time window
}


// Proxy handlers
const arrayHandler: ProxyHandler<any[]> = {
  set(target, prop, value, receiver) {
    const success = Reflect.set(target, prop, value, receiver);
    if (success) {
      saveMockStore();
    }
    return success;
  },
  deleteProperty(target, prop) {
    const success = Reflect.deleteProperty(target, prop);
    if (success) {
      saveMockStore();
    }
    return success;
  }
};

const objectHandler: ProxyHandler<any> = {
  set(target, prop, value, receiver) {
    if (Array.isArray(value)) {
      value = new Proxy(value, arrayHandler);
    }
    const success = Reflect.set(target, prop, value, receiver);
    if (success) {
      saveMockStore();
    }
    return success;
  }
};

// Wrap arrays in proxy layers
for (const key of Object.keys(rawMockStore) as Array<keyof MockStore>) {
  if (Array.isArray(rawMockStore[key])) {
    rawMockStore[key] = new Proxy(rawMockStore[key] as any, arrayHandler);
  } else if (rawMockStore[key] && typeof rawMockStore[key] === "object") {
    rawMockStore[key] = new Proxy(rawMockStore[key] as any, objectHandler);
  }
}

export const mockStore = new Proxy(rawMockStore, objectHandler);
