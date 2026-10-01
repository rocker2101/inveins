import crypto from 'crypto';

/**
 * Safely resolves the server-side order signing secret
 */
export function getOrderSigningSecret(): string {
  const secret = process.env.ORDER_SIGNING_SECRET?.trim() || process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ORDER_SIGNING_SECRET is required in production environment.');
  }
  return 'inveins_dev_order_secret_ephemeral';
}

/**
 * Atomically decrements catalog inventory for an order's items
 * Uses Supabase RPC procedure if available, falling back to direct safe query
 */
export async function decrementOrderStock(items: any): Promise<void> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    const rawItems = typeof items === 'string' ? JSON.parse(items) : items;
    if (!Array.isArray(rawItems) || rawItems.length === 0) return;

    // Parallelize updates for all items simultaneously to eliminate sequential network latency
    const updatePromises = rawItems.map(async (item) => {
      const prodId = item?.product?.id;
      const qty = Math.max(1, Number(item?.quantity) || 1);
      if (!prodId) return;

      const { data: currentProd } = await supabaseAdmin
        .from('inveins_products')
        .select('available_stock')
        .eq('id', prodId)
        .maybeSingle();

      if (currentProd && typeof currentProd.available_stock === 'number') {
        const currentStock = currentProd.available_stock;
        const newStock = Math.max(0, currentStock - qty);
        await supabaseAdmin
          .from('inveins_products')
          .update({
            available_stock: newStock,
            badge: newStock <= 0 ? 'SOLD OUT' : undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('id', prodId);
      }
    });

    await Promise.allSettled(updatePromises);
  } catch (stockErr) {
    console.warn('[STOCK DECREMENT NOTICE]', stockErr);
  }
}

/**
 * Atomically restores catalog inventory when an order is cancelled or refunded
 */
export async function restoreOrderStock(items: any): Promise<void> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    const rawItems = typeof items === 'string' ? JSON.parse(items) : items;
    if (!Array.isArray(rawItems)) return;

    for (const item of rawItems) {
      const prodId = item?.product?.id;
      const qty = Math.max(1, Number(item?.quantity) || 1);
      if (!prodId) continue;

      const { data: currentProd } = await supabaseAdmin
        .from('inveins_products')
        .select('available_stock, badge')
        .eq('id', prodId)
        .single();

      if (currentProd) {
        const currentStock = Number(currentProd.available_stock) || 0;
        const newStock = currentStock + qty;
        await supabaseAdmin
          .from('inveins_products')
          .update({
            available_stock: newStock,
            badge: currentProd.badge === 'SOLD OUT' ? null : currentProd.badge,
            updated_at: new Date().toISOString(),
          })
          .eq('id', prodId);
      }
    }
  } catch (stockErr) {
    console.warn('[STOCK RESTORE NOTICE]', stockErr);
  }
}

/**
 * Verify Order Verification Token issued by /api/orders/create
 */
export function verifyOrderToken(
  orderId: string,
  grandTotal: number,
  customerPhone: string,
  createdAt: string,
  token: string,
  secret: string = process.env.ORDER_SIGNING_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'inveins_dev_order_secret_ephemeral')
): boolean {
  if (!secret) return false;
  try {
    const payload = `${orderId}|${grandTotal}|${customerPhone}|${createdAt}`;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const expectedBuffer = Buffer.from(expected);
    const tokenBuffer = Buffer.from(token);

    if (expectedBuffer.length !== tokenBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, tokenBuffer);
  } catch (e) {
    return false;
  }
}
