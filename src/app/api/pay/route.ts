import { NextRequest, NextResponse } from 'next/server';
import { findProduct, getUnitByCode } from '@/lib/data';
import { initiateStkPush } from '@/lib/mpesa';
import { saveOrder } from '@/lib/ordersStore';

// Lightweight IP rate limiting: max 5 requests per 2 minutes
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.expiresAt < now) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + 120000 });
    return true;
  }
  if (entry.count >= 5) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many payment requests. Please wait 2 minutes.' },
        { status: 429 }
      );
    }

    if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
      return NextResponse.json(
        { error: 'M-Pesa is not connected yet. Payment keys will be added soon.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { phone, unitCode, productId, productType } = body;

    if (!phone || !unitCode || (!productId && !productType)) {
      return NextResponse.json(
        { error: 'Missing phone, unitCode, or productId.' },
        { status: 400 }
      );
    }

    const unit = getUnitByCode(unitCode);
    if (!unit) {
      return NextResponse.json({ error: 'Unit not found.' }, { status: 404 });
    }

    const product = findProduct(unit, { productId, productType });
    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const orderId = `PWN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const stkResult = await initiateStkPush({
      phone,
      amount: product.price,
      orderId,
      description: `${unit.code} ${product.name}`.slice(0, 30),
    });

    await saveOrder({
      id: orderId,
      orderId,
      unitCode: unit.code,
      productType: product.type,
      productId: product.id,
      phone,
      amount: product.price,
      status: 'pending',
      checkoutRequestId: stkResult.checkoutRequestId,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      orderId,
      checkoutRequestId: stkResult.checkoutRequestId,
      message: stkResult.customerMessage,
    });
  } catch (error: unknown) {
    console.error('Payment initiation error:', error);
    const message = error instanceof Error ? error.message : 'Payment initiation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
