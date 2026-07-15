import { db, products } from "@workspace/db";
import { eq, sql, and, lte } from "drizzle-orm";
import { mockStore } from "../lib/mockStore";

export const InventoryProvider = {
  /**
   * Returns ContextEngine data for the Inventory domain (low-stock items).
   */
  resolveContext: async (orgId: number | string) => {
    const parsedOrgId = typeof orgId === "string" ? parseInt(orgId, 10) : orgId;
    let lowStockItems: any[] = [];

    if (process.env.DATABASE_URL) {
      try {
        const lowStockProducts = await db
          .select({
            id: products.id,
            name: products.name,
            stock: products.stock,
          })
          .from(products)
          .where(and(eq(products.orgId, parsedOrgId), lte(products.stock, 20)));

        lowStockItems = lowStockProducts.map((p) => ({
          id: p.id,
          name: p.name,
          stock: p.stock ?? 0,
        }));
      } catch (err: any) {
        console.error("[InventoryProvider] DB resolveContext Error:", err.message);
      }
    }

    // Fallback / sync to mockStore
    if (lowStockItems.length === 0) {
      const orgProducts = mockStore.products.filter(
        (p: any) => p.orgId === parsedOrgId && (p.stock ?? 0) <= 20
      );
      lowStockItems = orgProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        stock: p.stock ?? 0,
      }));
    }

    return { lowStockItems };
  },

  /**
   * Updates catalog inventory stock level.
   */
  adjust_stock_level: async (params: {
    productId?: number | string;
    product_id?: number | string;
    id?: number | string;
    quantity?: number | string;
    qty?: number | string;
    amount?: number | string;
  }) => {
    const productIdRaw = params.productId !== undefined ? params.productId : (params.product_id !== undefined ? params.product_id : params.id);
    const qtyRaw = params.quantity !== undefined ? params.quantity : (params.qty !== undefined ? params.qty : params.amount);

    if (productIdRaw === undefined || qtyRaw === undefined) {
      throw new Error("[InventoryProvider] Missing required parameters 'productId' or 'quantity'.");
    }

    const prodId = typeof productIdRaw === "string" ? parseInt(productIdRaw, 10) : productIdRaw;
    const qty = typeof qtyRaw === "string" ? parseInt(qtyRaw, 10) : qtyRaw;

    if (process.env.DATABASE_URL) {
      try {
        const [updatedProduct] = await db
          .update(products)
          .set({ stock: sql`${products.stock} + ${qty}` })
          .where(eq(products.id, prodId))
          .returning();
        return updatedProduct;
      } catch (err: any) {
        console.error("[InventoryProvider] DB Adjust Stock Error:", err.message);
      }
    }

    // Fallback to mockStore
    const product = mockStore.products.find((p) => p.id === prodId);
    if (product) {
      product.stock = (product.stock ?? 0) + qty;
      return product;
    }
    return null;
  },

  /**
   * Registers a supplier purchase order.
   * There is no Drizzle table for purchase orders in the MVP schema,
   * so we store it in a mock list in mockStore.
   */
  create_purchase_order: async (params: {
    orgId: number | string;
    supplierId: number | string;
    items: Array<{ name: string; qty: number | string; unitPrice: number | string }>;
  }) => {
    const { orgId, supplierId, items } = params;
    const parsedOrgId = typeof orgId === "string" ? parseInt(orgId, 10) : orgId;
    const parsedSupplierId = typeof supplierId === "string" ? parseInt(supplierId, 10) : supplierId;

    const parsedItems = items.map((item) => ({
      name: item.name,
      qty: typeof item.qty === "string" ? parseInt(item.qty, 10) : item.qty,
      unitPrice: typeof item.unitPrice === "string" ? parseInt(item.unitPrice, 10) : item.unitPrice,
    }));

    const mockOrder = {
      id: Math.floor(Math.random() * 900000) + 100000,
      orgId: parsedOrgId,
      supplierId: parsedSupplierId,
      items: parsedItems,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    if (!(mockStore as any).purchaseOrders) {
      (mockStore as any).purchaseOrders = [];
    }
    (mockStore as any).purchaseOrders.push(mockOrder);

    return mockOrder;
  },

  /**
   * Performs a bulk update of product catalog retail prices.
   */
  sync_catalog_prices: async (params: {
    orgId: number | string;
    pricingUpdate: Array<{ productId: number | string; price: number | string }>;
  }) => {
    const { orgId, pricingUpdate } = params;
    const parsedOrgId = typeof orgId === "string" ? parseInt(orgId, 10) : orgId;
    const results: any[] = [];

    for (const update of pricingUpdate) {
      const prodId = typeof update.productId === "string" ? parseInt(update.productId, 10) : update.productId;
      const priceVal = typeof update.price === "string" ? parseInt(update.price, 10) : update.price;

      if (process.env.DATABASE_URL) {
        try {
          const [updated] = await db
            .update(products)
            .set({ price: priceVal })
            .where(eq(products.id, prodId))
            .returning();
          if (updated) {
            results.push(updated);
          }
        } catch (err: any) {
          console.error(`[InventoryProvider] DB Sync Pricing Error for product ${prodId}:`, err.message);
        }
      } else {
        const product = mockStore.products.find((p) => p.id === prodId && p.orgId === parsedOrgId);
        if (product) {
          product.price = priceVal;
          results.push(product);
        }
      }
    }

    return results;
  },

  /**
   * Dispatches the action route by action name mapping.
   */
  execute: async (action: string, params: any): Promise<any> => {
    const fn = (InventoryProvider as any)[action];
    if (!fn || typeof fn !== "function") {
      throw new Error(`Action "${action}" is not supported by InventoryProvider.`);
    }
    return await fn(params);
  },
};
