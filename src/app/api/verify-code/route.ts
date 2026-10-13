import { NextRequest, NextResponse } from 'next/server';
import { verifyIntasendMpesaCode } from '@/lib/intasend';
import { findProduct, getUnitByCode } from '@/lib/data';
import { getProductDownloadUrl } from '@/lib/cloudinary';
import { saveOrder } from '@/lib/ordersStore';

export async function POST(req: NextRequest) {
  try {
    const { mpesaCode, unitCode, productId, productType } = await req.json();

    if (!mpesaCode || typeof mpesaCode !== 'string') {
      return NextResponse.json({ error: 'Please enter your M-Pesa transaction code' }, { status: 400 });
    }

    const verification = await verifyIntasendMpesaCode(mpesaCode);
    if (!verification.verified || !verification.invoice) {
      return NextResponse.json(
        { error: verification.error || 'Could not verify M-Pesa transaction code.' },
        { status: 400 }
      );
    }

    const unit = unitCode ? getUnitByCode(unitCode) : undefined;
    const product = unit
      ? findProduct(unit, { productId: productId || undefined, productType: productType || undefined })
      : undefined;

    const downloadUrl = getProductDownloadUrl(unitCode || '', productType || '', product?.fileUrl);

    const orderId = `PWN-VERIFY-${mpesaCode.trim().toUpperCase()}`;
    await saveOrder({
      id: orderId,
      orderId,
      unitCode: unitCode || '',
      productType: productType || 'notes',
      productId: productId || '',
      phone: verification.phone || '',
      amount: verification.amount || product?.price || 0,
      status: 'paid',
      checkoutRequestId: verification.invoice.invoice_id || mpesaCode,
      fileUrl: downloadUrl,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      fileUrl: downloadUrl,
      message: 'M-Pesa payment confirmed successfully! Download unlocked.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
