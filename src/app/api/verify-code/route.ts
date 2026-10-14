import { NextRequest, NextResponse } from 'next/server';
import { verifyIntasendMpesaCode } from '@/lib/intasend';
import { findProduct, getUnitByCode } from '@/lib/data';
import { getProductDownloadUrl } from '@/lib/cloudinary';
import { saveOrder } from '@/lib/ordersStore';

// Rate limiting: max 10 code-verification attempts per 5 minutes per IP
const verifyRateLimit = new Map<string, { count: number; expiresAt: number }>();

function checkVerifyRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = verifyRateLimit.get(ip);
  if (!entry || entry.expiresAt < now) {
    verifyRateLimit.set(ip, { count: 1, expiresAt: now + 300000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkVerifyRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many verification attempts. Please wait 5 minutes.' }, { status: 429 });
    }

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

    // SECURITY: Verify that the M-Pesa payment amount covers the product price
    if (product && verification.amount !== undefined) {
      const paidAmount = verification.amount;
      const requiredAmount = product.price;
      if (paidAmount < requiredAmount) {
        return NextResponse.json({
          error: `This M-Pesa code was for KSH ${paidAmount}, but ${product.name} costs KSH ${requiredAmount}. Please use the correct code or pay through the payment button.`,
        }, { status: 400 });
      }
    }

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
