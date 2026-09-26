import { Order } from './types';

// In-memory store for orders during development or before Supabase credentials are wired
const ordersMap = new Map<string, Order>();

export async function saveOrder(order: Order): Promise<void> {
  ordersMap.set(order.orderId, order);

  // If Supabase environment variables exist, persist there as well
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          order_id: order.orderId,
          unit_code: order.unitCode,
          product_type: order.productType,
          product_id: order.productId,
          phone: order.phone,
          amount: order.amount,
          status: order.status,
          file_url: order.fileUrl,
          checkout_request_id: order.checkoutRequestId,
        }),
      });
    } catch (e) {
      console.error('Supabase write error:', e);
    }
  }
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const local = ordersMap.get(orderId);
  if (local) return local;

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const res = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/orders?order_id=eq.${encodeURIComponent(orderId)}&select=*`,
        {
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      );
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id || r.order_id,
            orderId: r.order_id,
            unitCode: r.unit_code,
            productType: r.product_type,
            productId: r.product_id,
            phone: r.phone,
            amount: r.amount,
            status: r.status,
            fileUrl: r.file_url,
            checkoutRequestId: r.checkout_request_id,
            createdAt: r.created_at,
          };
        }
      }
    } catch (e) {
      console.error('Supabase read error:', e);
    }
  }

  return null;
}

export async function getOrderByCheckoutRequestId(checkoutRequestId: string): Promise<Order | null> {
  // Check in-memory store
  for (const order of ordersMap.values()) {
    if (order.checkoutRequestId === checkoutRequestId) {
      return order;
    }
  }

  // Check Supabase if configured
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const res = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/orders?checkout_request_id=eq.${encodeURIComponent(checkoutRequestId)}&select=*`,
        {
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      );
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id || r.order_id,
            orderId: r.order_id,
            unitCode: r.unit_code,
            productType: r.product_type,
            productId: r.product_id,
            phone: r.phone,
            amount: r.amount,
            status: r.status,
            fileUrl: r.file_url,
            checkoutRequestId: r.checkout_request_id,
            createdAt: r.created_at,
          };
        }
      }
    } catch (e) {
      console.error('Supabase read error:', e);
    }
  }

  return null;
}

export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'paid' | 'failed' | 'cancelled',
  fileUrl?: string | null
): Promise<Order | null> {
  const existing = await getOrder(orderId);
  if (!existing) return null;

  const updated: Order = {
    ...existing,
    status,
    fileUrl: fileUrl !== undefined ? fileUrl : existing.fileUrl,
  };

  await saveOrder(updated);
  return updated;
}
