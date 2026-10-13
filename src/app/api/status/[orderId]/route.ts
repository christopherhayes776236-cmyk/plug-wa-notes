import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrderStatus } from '@/lib/ordersStore';
import { queryIntasendStatus, getIntasendConfig } from '@/lib/intasend';
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

    const { searchParams } = new URL(req.url);
    const invoiceIdFromQuery = searchParams.get('invoiceId');
    const unitCodeFromQuery = searchParams.get('unit');
    const productIdFromQuery = searchParams.get('product');
    const productTypeFromQuery = searchParams.get('type');

    let order = await getOrder(orderId);

    // If order is already paid, return instantly
    if (order && order.status === 'paid') {
      return NextResponse.json({
        status: 'paid',
        fileUrl: order.fileUrl,
      });
    }

    const effectiveInvoiceId = invoiceIdFromQuery || order?.checkoutRequestId;
    const effectiveUnitCode = unitCodeFromQuery || order?.unitCode;
    const effectiveProductId = productIdFromQuery || order?.productId;
    const effectiveProductType = productTypeFromQuery || order?.productType;

    const intasendConfig = getIntasendConfig();
    const hasIntasend = !!intasendConfig.secretKey;

    // Direct IntaSend status verification (stateless, works across all lambda instances)
    if (hasIntasend && effectiveInvoiceId) {
      try {
        const isStatus = await queryIntasendStatus(effectiveInvoiceId);
        if (isStatus.completed) {
          const unit = effectiveUnitCode ? getUnitByCode(effectiveUnitCode) : undefined;
          const product = unit
            ? findProduct(unit, { productId: effectiveProductId || undefined, productType: effectiveProductType || undefined })
            : undefined;
          const downloadUrl = getProductDownloadUrl(effectiveUnitCode || '', effectiveProductType || '', product?.fileUrl);

          await updateOrderStatus(orderId, 'paid', downloadUrl);

          return NextResponse.json({
            status: 'paid',
            fileUrl: downloadUrl,
          });
        } else if (isStatus.failed) {
          await updateOrderStatus(orderId, 'failed');
          return NextResponse.json({
            status: 'failed',
            message: 'Payment was cancelled or failed.',
          });
        } else {
          return NextResponse.json({
            status: 'pending',
          });
        }
      } catch (err) {
        console.warn('IntaSend status inquiry warning:', err);
      }
    }

    // Safaricom Daraja fallback if IntaSend not used
    if (order && !hasIntasend && order.status === 'pending' && order.checkoutRequestId) {
      try {
        const queryRes = await queryStkStatus(order.checkoutRequestId);

        if (queryRes.resultCode === '0') {
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
        console.warn('Daraja fallback query attempt error:', queryErr);
      }
    }

    if (order) {
      return NextResponse.json({
        status: order.status,
        fileUrl: order.fileUrl,
      });
    }

    // Still pending initiation or waiting for gateway
    return NextResponse.json({
      status: 'pending',
    });
  } catch (error: any) {
    console.error('Order status check error:', error);
    return NextResponse.json(
      { error: 'Failed to verify status' },
      { status: 500 }
    );
  }
}
