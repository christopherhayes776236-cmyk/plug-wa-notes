import { NextRequest, NextResponse } from 'next/server';
import { getOrder, getOrderByCheckoutRequestId, updateOrderStatus } from '@/lib/ordersStore';
import { findProduct, getUnitByCode } from '@/lib/data';
import { getProductDownloadUrl } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Handle IntaSend Webhook
    if (body?.invoice_id && body?.state) {
      const invoiceId = body.invoice_id;
      const apiRef = body.api_ref;
      const state = String(body.state).toUpperCase();

      console.log(`IntaSend Webhook received: invoice=${invoiceId}, api_ref=${apiRef}, state=${state}`);

      const order = (apiRef ? await getOrder(apiRef) : null) || (await getOrderByCheckoutRequestId(invoiceId));
      if (order) {
        if (state === 'COMPLETE' || state === 'SUCCESSFUL' || state === 'SUCCESS') {
          const unit = getUnitByCode(order.unitCode);
          const product = unit
            ? findProduct(unit, { productId: order.productId, productType: order.productType })
            : undefined;
          const downloadUrl = getProductDownloadUrl(order.unitCode, order.productType, product?.fileUrl);

          await updateOrderStatus(order.orderId, 'paid', downloadUrl);
          console.log(`Order ${order.orderId} marked paid via IntaSend webhook`);
        } else if (state === 'FAILED' || state === 'CANCELLED' || state === 'REJECTED') {
          await updateOrderStatus(order.orderId, 'failed');
        }
      }

      return NextResponse.json({ success: true, message: 'IntaSend webhook processed' });
    }

    // 2. Handle Daraja Webhook
    const stkCallback = body?.Body?.stkCallback;
    if (!stkCallback) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid payload' }, { status: 400 });
    }

    const {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
    } = stkCallback;

    if (!CheckoutRequestID) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Missing CheckoutRequestID' }, { status: 400 });
    }

    if (ResultCode === 0) {
      console.log(`M-Pesa Daraja payment success: CheckoutID=${CheckoutRequestID}, ResultCode=${ResultCode}`);
      
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
      console.log(`M-Pesa Daraja payment failed: CheckoutID=${CheckoutRequestID}, Code=${ResultCode}, Desc=${ResultDesc}`);
      const order = await getOrderByCheckoutRequestId(CheckoutRequestID);
      if (order) {
        await updateOrderStatus(order.orderId, 'failed');
      }
    }

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Success',
    });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Internal server error' }, { status: 500 });
  }
}
