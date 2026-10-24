import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { buildQrPayload } from '@/lib/qr';

export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const token = searchParams.get('token');

    const where: any = {};

    // Role-based visibility:
    // Students only view their own orders
    if (user!.role === 'STUDENT') {
      where.userId = user!.id;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (token) {
      where.tokenNumber = { contains: token.trim().toUpperCase() };
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { placedAt: 'desc' },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                imageUrl: true,
                isVeg: true,
                prepTimeMinutes: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            studentId: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error('Fetch orders error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      items,
      couponCode,
      redeemLoyaltyPoints,
      paymentMethod,
      pickupSlot,
      specialInstructions,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item.' },
        { status: 400 }
      );
    }

    // 1. Transactional stock check & price calculation
    const orderResult = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsToCreate: any[] = [];

      for (const item of items) {
        if (!item.menuItemId || !item.quantity || item.quantity <= 0) {
          throw new Error('Invalid item or quantity.');
        }

        const menuItem = await tx.menuItem.findUnique({
          where: { id: item.menuItemId },
        });

        if (!menuItem) {
          throw new Error(`Item not found.`);
        }

        if (!menuItem.isAvailable) {
          throw new Error(`Item "${menuItem.name}" is currently unavailable.`);
        }

        if (menuItem.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${menuItem.name}". Available: ${menuItem.stockQuantity}, Requested: ${item.quantity}`
          );
        }

        // Deduct inventory
        await tx.menuItem.update({
          where: { id: menuItem.id },
          data: {
            stockQuantity: menuItem.stockQuantity - item.quantity,
            isAvailable: menuItem.stockQuantity - item.quantity > 0,
          },
        });

        // Price calculation: apply surplus discount if active
        let effectivePrice = menuItem.price;
        if (menuItem.isSurplus && menuItem.surplusDiscountPercent > 0) {
          effectivePrice = effectivePrice * (1 - menuItem.surplusDiscountPercent / 100);
        }

        const lineTotal = effectivePrice * item.quantity;
        subtotal += lineTotal;

        orderItemsToCreate.push({
          menuItemId: menuItem.id,
          itemName: menuItem.name,
          itemPrice: effectivePrice,
          quantity: item.quantity,
          customizations: item.customizations ? JSON.stringify(item.customizations) : null,
          lineTotal,
        });
      }

      // 2. Validate Coupon
      let discountAmount = 0;
      let appliedCoupon: any = null;
      if (couponCode && couponCode.trim()) {
        const cleanCode = couponCode.trim().toUpperCase();
        appliedCoupon = await tx.coupon.findUnique({
          where: { code: cleanCode },
        });

        if (!appliedCoupon || !appliedCoupon.isActive) {
          throw new Error(`Coupon "${cleanCode}" is invalid or inactive.`);
        }

        if (new Date() > new Date(appliedCoupon.validUntil)) {
          throw new Error(`Coupon "${cleanCode}" has expired.`);
        }

        if (subtotal < appliedCoupon.minOrderAmount) {
          throw new Error(
            `Coupon "${cleanCode}" requires a minimum order of ₹${appliedCoupon.minOrderAmount}.`
          );
        }

        if (appliedCoupon.timesUsed >= appliedCoupon.usageLimit) {
          throw new Error(`Coupon "${cleanCode}" usage limit has been reached.`);
        }

        if (appliedCoupon.discountType === 'PERCENTAGE') {
          const calculatedDisc = (subtotal * appliedCoupon.discountValue) / 100;
          discountAmount = appliedCoupon.maxDiscount
            ? Math.min(calculatedDisc, appliedCoupon.maxDiscount)
            : calculatedDisc;
        } else {
          discountAmount = Math.min(appliedCoupon.discountValue, subtotal);
        }

        // Increment coupon usage
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { timesUsed: appliedCoupon.timesUsed + 1 },
        });
      }

      // 3. Loyalty Points Redemption (100 points = ₹50, 1 pt = ₹0.50)
      let loyaltyPointsUsed = 0;
      let loyaltyDiscount = 0;
      const pointsToUse = parseInt(redeemLoyaltyPoints) || 0;
      if (pointsToUse > 0) {
        const freshUser = await tx.user.findUnique({ where: { id: user!.id } });
        if (freshUser && freshUser.loyaltyPoints >= pointsToUse) {
          loyaltyPointsUsed = pointsToUse;
          loyaltyDiscount = pointsToUse * 0.5; // ₹0.50 per point
          // Cap loyalty discount so total does not drop below 0
          loyaltyDiscount = Math.min(loyaltyDiscount, Math.max(0, subtotal - discountAmount));

          // Deduct user points
          await tx.user.update({
            where: { id: user!.id },
            data: { loyaltyPoints: freshUser.loyaltyPoints - loyaltyPointsUsed },
          });

          await tx.loyaltyTransaction.create({
            data: {
              userId: user!.id,
              points: -loyaltyPointsUsed,
              type: 'REDEEMED',
              description: `Redeemed ${loyaltyPointsUsed} points for ₹${loyaltyDiscount.toFixed(2)} discount`,
            },
          });
        }
      }

      const totalDiscounts = discountAmount + loyaltyDiscount;
      const totalAmount = Math.max(0, subtotal - totalDiscounts);

      // 4. Generate Unique Order ID and Unique Pickup Token
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const orderCountToday = await tx.order.count();
      const orderNumber = `ORD-${todayStr}-${String(orderCountToday + 1).padStart(3, '0')}`;
      const tokenNumber = `SC-${1000 + orderCountToday + 1}`;

      const validPaymentMethod = paymentMethod || 'DEMO_UPI';
      const qrCodeData = buildQrPayload(orderNumber, tokenNumber, 'PAID');

      // 5. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          tokenNumber,
          userId: user!.id,
          status: 'PLACED',
          subtotal,
          discountAmount,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          loyaltyPointsUsed,
          loyaltyDiscount,
          taxAmount: 0,
          totalAmount,
          paymentMethod: validPaymentMethod,
          paymentStatus: 'PAID', // In demo mode, verified payment
          pickupSlot: pickupSlot || 'Immediate (10-15 mins)',
          specialInstructions: specialInstructions?.trim() || null,
          qrCodeData,
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: true,
        },
      });

      // 6. Award Loyalty Points for new order (1 pt per ₹10 spent)
      const earnedPoints = Math.floor(totalAmount / 10);
      if (earnedPoints > 0) {
        await tx.user.update({
          where: { id: user!.id },
          data: { loyaltyPoints: { increment: earnedPoints } },
        });

        await tx.loyaltyTransaction.create({
          data: {
            userId: user!.id,
            orderId: newOrder.id,
            points: earnedPoints,
            type: 'EARNED',
            description: `Earned for Order ${orderNumber}`,
          },
        });
      }

      // 7. Create Notification for Student
      await tx.notification.create({
        data: {
          userId: user!.id,
          title: `Order Placed! Token: ${tokenNumber} 🍽️`,
          message: `Your order for ₹${totalAmount.toFixed(2)} is received. Present token ${tokenNumber} at counter when ready.`,
          type: 'ORDER_STATUS',
          link: '/orders',
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      message: `Order placed successfully! Pickup Token: ${orderResult.tokenNumber}`,
      order: orderResult,
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to place order.' },
      { status: 400 }
    );
  }
}
