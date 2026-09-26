import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrderStatus } from '@/lib/ordersStore';
import { queryStkStatus } from '@/lib/mpesa';
import { findProduct, getUnitByCode } from '@/lib/data';
import { getProductDownloadUrl } from '@/lib/cloudinary';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If order is already paid, return instantly
    if (order.status === 'paid') {
      return NextResponse.json({
        status: 'paid',
        fileUrl: order.fileUrl,
      });
    }

    // If pending, check order age in seconds
    const orderAgeMs = Date.now() - new Date(order.createdAt).getTime();

    // Fallback: If pending for more than 20 seconds, actively query Daraja API
    if (order.status === 'pending' && orderAgeMs > 20000 && order.checkoutRequestId) {
      try {
        const queryRes = await queryStkStatus(order.checkoutRequestId);

        if (queryRes.resultCode === '0') {
          // Success verified
          const unit = getUnitByCode(order.unitCode);
          const product = unit
            ? findProduct(unit, { productId: order.productId, productType: order.productType })
            : undefined;
          const downloadUrl = getProductDownloadUrl(order.unitCode, order.productType, product?.fileUrl);

          await updateOrderStatus(orderId, 'paid', downloadUrl);

          return NextResponse.json({
            status: 'paid',
            fileUrl: downloadUrl,
          });
        } else if (queryRes.resultCode) {
          // Failure verified from Daraja
          const messageMap: Record<string, string> = {
            '1032': 'You cancelled the request on your phone.',
            '1037': 'Request timed out. Please keep your phone unlocked and try again.',
            '1': 'Insufficient M-Pesa balance.',
            '2001': 'Invalid M-Pesa PIN.',
          };

          const friendlyMsg =
            messageMap[queryRes.resultCode] ||
            queryRes.resultDesc ||
            'Payment failed. Please try again.';

          await updateOrderStatus(orderId, 'failed');

          return NextResponse.json({
            status: 'failed',
            message: friendlyMsg,
          });
        }
      } catch (queryErr) {
        // Query error, let frontend continue polling until 60s timeout
        console.warn('Daraja fallback query attempt error:', queryErr);
      }
    }

    // For sandbox local testing without active Daraja API keys:
    // Auto-approve test orders after 6 seconds if running in pure dev mode without Mpesa keys
    if (
      !process.env.MPESA_CONSUMER_KEY &&
      order.status === 'pending' &&
      orderAgeMs > 6000
    ) {
      const unit = getUnitByCode(order.unitCode);
      const product = unit
        ? findProduct(unit, { productId: order.productId, productType: order.productType })
        : undefined;
      const testDownloadUrl = getProductDownloadUrl(order.unitCode, order.productType, product?.fileUrl);

      await updateOrderStatus(orderId, 'paid', testDownloadUrl);

      return NextResponse.json({
        status: 'paid',
        fileUrl: testDownloadUrl,
      });
    }

    return NextResponse.json({
      status: order.status,
      fileUrl: order.fileUrl,
    });
  } catch (error: any) {
    console.error('Order status check error:', error);
    return NextResponse.json(
      { error: 'Failed to verify status' },
      { status: 500 }
    );
  }
}
