import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrderStatus } from '@/lib/ordersStore';
import { getUnitByCode } from '@/lib/data';

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
      // Find matching order
      // If we have an orderId stored, update it
      // Mark as paid
      console.log(`M-Pesa payment success: CheckoutID=${CheckoutRequestID}, ResultCode=${ResultCode}`);
      
      // In production, match and update the order in Supabase
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const res = await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/orders?checkout_request_id=eq.${encodeURIComponent(CheckoutRequestID)}&select=*`,
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
              const order = rows[0];
              const unit = getUnitByCode(order.unit_code);
              const product = unit?.products.find((p) => p.type === order.product_type);
              const downloadUrl =
                product?.fileUrl ||
                `https://res.cloudinary.com/plug-wa-notes/raw/upload/fl_attachment/v1/units/${order.unit_code.toLowerCase().replace(/\s+/g, '')}/${order.product_type}.pdf`;

              await updateOrderStatus(order.order_id, 'paid', downloadUrl);
            }
          }
        } catch (e) {
          console.error('Webhook Supabase update error:', e);
        }
      }
    } else {
      console.log(`M-Pesa payment failed or cancelled: CheckoutID=${CheckoutRequestID}, Code=${ResultCode}, Desc=${ResultDesc}`);
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
