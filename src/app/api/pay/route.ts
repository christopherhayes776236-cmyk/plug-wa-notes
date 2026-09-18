import { NextRequest, NextResponse } from 'next/server';
import { getUnitByCode } from '@/lib/data';
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

    const body = await req.json();
    const { phone, unitCode, productType } = body;

    if (!phone || !unitCode || !productType) {
      return NextResponse.json(
        { error: 'Missing phone, unitCode, or productType.' },
        { status: 400 }
      );
    }

    // Lookup unit and product price
    const unit = getUnitByCode(unitCode);
    if (!unit) {
      return NextResponse.json({ error: 'Unit not found.' }, { status: 404 });
    }

    const product = unit.products.find((p) => p.type === productType);
    if (!product) {
      return NextResponse.json({ error: 'Product type not found.' }, { status: 404 });
    }

    const orderId = `PWN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Initiate STK Push via Daraja
    const stkResult = await initiateStkPush({
      phone,
      amount: product.price,
      orderId,
      description: `${unit.code} ${product.name}`.slice(0, 30),
    });

    // Save pending order
    await saveOrder({
      id: orderId,
      orderId,
      unitCode: unit.code,
      productType: product.type,
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
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment initiation failed.' },
      { status: 500 }
    );
  }
}
