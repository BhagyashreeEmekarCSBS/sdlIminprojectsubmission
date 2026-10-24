import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  // Staff or Admin authentication is strictly required
  const { error, user } = await requireAuth(req, ['STAFF', 'ADMIN']);
  if (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  try {
    const body = await req.json();
    let { tokenNumber, qrPayload } = body;

    // If QR payload scanned, extract the tokenNumber
    // Format: SCP-VERIFY:ORD-xxx:SC-xxx:PAID
    if (qrPayload && typeof qrPayload === 'string') {
      const parts = qrPayload.split(':');
      if (parts.length >= 3 && parts[0] === 'SCP-VERIFY') {
        tokenNumber = parts[2];
      } else {
        tokenNumber = qrPayload.trim();
      }
    }

    if (!tokenNumber || typeof tokenNumber !== 'string' || !tokenNumber.trim()) {
      return NextResponse.json(
        { error: 'Pickup Token or QR Code data is required.' },
        { status: 400 }
      );
    }

    const cleanToken = tokenNumber.trim().toUpperCase();

    // 1. Check if the order exists and token matches
    const order = await prisma.order.findUnique({
      where: { tokenNumber: cleanToken },
      include: {
        items: true,
        user: {
          select: {
            name: true,
            email: true,
            studentId: true,
            phone: true,
            department: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: `INVALID TOKEN: No order found matching token "${cleanToken}". Please check and re-enter.`,
          code: 'TOKEN_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // 5. Check if the order has ALREADY been collected
    if (order.status === 'COLLECTED') {
      const collectedTimeStr = order.collectedAt
        ? new Date(order.collectedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : 'earlier';
      return NextResponse.json(
        {
          error: `ALREADY COLLECTED: Token "${cleanToken}" has already been claimed at ${collectedTimeStr}. Cannot reuse token!`,
          code: 'TOKEN_ALREADY_COLLECTED',
          order,
        },
        { status: 409 }
      );
    }

    // Cancelled or rejected order check
    if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
      return NextResponse.json(
        {
          error: `VOID ORDER: Token "${cleanToken}" cannot be collected because order was ${order.status.toLowerCase()} (${order.cancelReason || 'No reason specified'}).`,
          code: 'ORDER_VOID',
          order,
        },
        { status: 400 }
      );
    }

    // 4. Check if the order is ready for pickup
    if (order.status !== 'READY') {
      return NextResponse.json(
        {
          error: `NOT READY YET: Order is currently in "${order.status}" status. The kitchen must mark it "Ready for Pickup" before collection.`,
          code: 'ORDER_NOT_READY',
          order,
        },
        { status: 400 }
      );
    }

    // 3. Check payment status
    if (order.paymentStatus !== 'PAID') {
      return NextResponse.json(
        {
          error: `PAYMENT PENDING: This order has not been paid yet. Please collect ₹${order.totalAmount.toFixed(2)} at the cash counter first.`,
          code: 'PAYMENT_PENDING',
          order,
        },
        { status: 402 }
      );
    }

    // All 5 backend checks passed! Perform atomic collection update
    const collectedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'COLLECTED',
          collectedAt: new Date(),
          verifiedByStaffId: user!.id,
        },
        include: {
          items: true,
          user: true,
        },
      });

      // Student notification
      await tx.notification.create({
        data: {
          userId: order.userId,
          title: 'Order Handed Over! 🌟',
          message: `Your token ${order.tokenNumber} has been verified and collected. Enjoy your meal!`,
          type: 'ORDER_STATUS',
          link: '/orders',
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: user!.id,
          action: 'TOKEN_VERIFIED_COLLECTED',
          details: `Staff ${user!.name} verified token ${cleanToken} for order ${order.orderNumber} (₹${order.totalAmount})`,
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: `Token ${cleanToken} verified successfully! Hand over food items to ${order.user.name}.`,
      order: collectedOrder,
      verifiedBy: user!.name,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Token verification error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during verification.' },
      { status: 500 }
    );
  }
}
