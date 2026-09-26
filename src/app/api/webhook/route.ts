import { NextRequest, NextResponse } from 'next/server';
import { getOrder, getOrderByCheckoutRequestId, updateOrderStatus } from '@/lib/ordersStore';
import { findProduct, getUnitByCode } from '@/lib/data';
import { getProductDownloadUrl } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify Daraja callback structure
    const stkCallback = body?.Body?.stkCallback;
    if (!stkCallback) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid payload' }, { status: 400 });
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
    } = stkCallback;

    if (!CheckoutRequestID) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Missing CheckoutRequestID' }, { status: 400 });
    }

    // Lookup order by CheckoutRequestID or AccountReference
    // Daraja sends CallbackMetadata on success (ResultCode === 0)
    if (ResultCode === 0) {
      console.log(`M-Pesa payment success: CheckoutID=${CheckoutRequestID}, ResultCode=${ResultCode}`);
      
      const order = await getOrderByCheckoutRequestId(CheckoutRequestID);
      if (order) {
        const unit = getUnitByCode(order.unitCode);
        const product = unit
          ? findProduct(unit, { productId: order.productId, productType: order.productType })
          : undefined;
        const downloadUrl = getProductDownloadUrl(order.unitCode, order.productType, product?.fileUrl);

        await updateOrderStatus(order.orderId, 'paid', downloadUrl);
      }
    } else {
      console.log(`M-Pesa payment failed or cancelled: CheckoutID=${CheckoutRequestID}, Code=${ResultCode}, Desc=${ResultDesc}`);
      const order = await getOrderByCheckoutRequestId(CheckoutRequestID);
      if (order) {
        await updateOrderStatus(order.orderId, 'failed');
      }
    }

    // Safaricom expects standard response shape
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Success',
    });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Internal server error' }, { status: 500 });
  }
}
