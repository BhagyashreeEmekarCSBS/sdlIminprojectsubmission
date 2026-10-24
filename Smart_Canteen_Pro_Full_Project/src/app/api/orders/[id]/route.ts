import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = await requireAuth(req);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Role check: Students can only view their own order
    if (user!.role === 'STUDENT' && order.userId !== user!.id) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = await requireAuth(req);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, cancelReason } = body;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Student cancellation permissions
    if (user!.role === 'STUDENT') {
      if (order.userId !== user!.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      if (status !== 'CANCELLED') {
        return NextResponse.json(
          { error: 'Students can only cancel eligible orders.' },
          { status: 403 }
        );
      }
      if (order.status !== 'PLACED') {
        return NextResponse.json(
          { error: `Cannot cancel order in "${order.status}" status. The kitchen has already begun preparation.` },
          { status: 400 }
        );
      }
    }

    // Staff/Admin status transitions
    const validTransitions: { [key: string]: string[] } = {
      PLACED: ['CONFIRMED', 'CANCELLED', 'REJECTED'],
      CONFIRMED: ['PREPARING', 'CANCELLED', 'REJECTED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['COLLECTED', 'CANCELLED'],
      COLLECTED: [],
      CANCELLED: [],
      REJECTED: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status transition from "${order.status}" to "${status}".` },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updateData: any = { status };

      if (status === 'CONFIRMED') updateData.confirmedAt = new Date();
      if (status === 'PREPARING') updateData.preparingAt = new Date();
      if (status === 'READY') updateData.readyAt = new Date();
      if (status === 'COLLECTED') {
        updateData.collectedAt = new Date();
        updateData.verifiedByStaffId = user!.id;
      }
      if (status === 'CANCELLED' || status === 'REJECTED') {
        updateData.cancelledAt = new Date();
        updateData.cancelReason = cancelReason || (status === 'REJECTED' ? 'Kitchen over capacity' : 'Cancelled by user');
        updateData.paymentStatus = 'REFUNDED';

        // Restore inventory stock upon cancellation
        for (const item of order.items) {
          await tx.menuItem.update({
            where: { id: item.menuItemId },
            data: {
              stockQuantity: { increment: item.quantity },
              isAvailable: true,
            },
          });
        }
      }

      const res = await tx.order.update({
        where: { id: order.id },
        data: updateData,
        include: { items: true },
      });

      // Notification to student
      let notifTitle = `Order Status: ${status}`;
      let notifMsg = `Your order ${order.orderNumber} is now ${status.toLowerCase()}.`;

      if (status === 'CONFIRMED') {
        notifTitle = 'Order Confirmed by Kitchen! 👨‍🍳';
        notifMsg = `Kitchen has accepted token ${order.tokenNumber}. Preparation will start shortly.`;
      } else if (status === 'PREPARING') {
        notifTitle = 'Your Meal is Cooking! 🔥';
        notifMsg = `Chef is preparing token ${order.tokenNumber}. Get ready for pickup!`;
      } else if (status === 'READY') {
        notifTitle = 'Ready for Pickup! 🔔';
        notifMsg = `Token ${order.tokenNumber} is ready at the counter! Show your token or QR code to collect.`;
      } else if (status === 'COLLECTED') {
        notifTitle = 'Order Collected! ✅';
        notifMsg = `Thank you for ordering with Smart Canteen Pro. Enjoy your meal!`;
      } else if (status === 'CANCELLED' || status === 'REJECTED') {
        notifTitle = `Order ${status} ⚠️`;
        notifMsg = `Token ${order.tokenNumber} was ${status.toLowerCase()}. Reason: ${updateData.cancelReason}`;
      }

      await tx.notification.create({
        data: {
          userId: order.userId,
          title: notifTitle,
          message: notifMsg,
          type: 'ORDER_STATUS',
          link: '/orders',
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: user!.id,
          action: 'ORDER_STATUS_UPDATE',
          details: `Order ${order.orderNumber} (Token: ${order.tokenNumber}) transitioned to ${status}`,
        },
      });

      return res;
    });

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updated,
    });
  } catch (err: any) {
    console.error('Order update error:', err);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
