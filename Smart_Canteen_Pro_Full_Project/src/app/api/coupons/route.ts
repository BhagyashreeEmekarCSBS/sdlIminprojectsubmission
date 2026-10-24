import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        validUntil: { gte: new Date() },
      },
      orderBy: { discountValue: 'desc' },
    });

    return NextResponse.json({ coupons });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const orderSubtotal = parseFloat(subtotal) || 0;

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: `Invalid coupon code "${cleanCode}".` },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { error: `Coupon "${cleanCode}" is no longer active.` },
        { status: 400 }
      );
    }

    if (new Date() > new Date(coupon.validUntil)) {
      return NextResponse.json(
        { error: `Coupon "${cleanCode}" expired on ${new Date(coupon.validUntil).toLocaleDateString()}.` },
        { status: 400 }
      );
    }

    if (orderSubtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount of ₹${coupon.minOrderAmount} required for coupon "${cleanCode}". (Current subtotal: ₹${orderSubtotal.toFixed(2)})`,
        },
        { status: 400 }
      );
    }

    if (coupon.timesUsed >= coupon.usageLimit) {
      return NextResponse.json(
        { error: `Coupon "${cleanCode}" redemption limit reached.` },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      const calc = (orderSubtotal * coupon.discountValue) / 100;
      discount = coupon.maxDiscount ? Math.min(calc, coupon.maxDiscount) : calc;
    } else {
      discount = Math.min(coupon.discountValue, orderSubtotal);
    }

    return NextResponse.json({
      valid: true,
      message: `Coupon "${cleanCode}" applied! You save ₹${discount.toFixed(2)}.`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
