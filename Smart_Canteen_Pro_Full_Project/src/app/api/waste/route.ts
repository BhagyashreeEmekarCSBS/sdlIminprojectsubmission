import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const surplusItems = await prisma.menuItem.findMany({
      where: {
        isSurplus: true,
        isAvailable: true,
      },
      include: { category: true },
    });

    const wasteRecords = await prisma.foodWasteRecord.findMany({
      orderBy: { recordedAt: 'desc' },
      take: 20,
    });

    const totalWasteKg = wasteRecords.reduce((sum, r) => sum + r.quantity, 0);
    const totalWasteValue = wasteRecords.reduce((sum, r) => sum + r.estimatedValue, 0);

    return NextResponse.json({
      surplusItems,
      wasteRecords,
      totalWasteKg,
      totalWasteValue,
      surplusActiveCount: surplusItems.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch food waste data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth(req, ['STAFF', 'ADMIN']);
  if (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, menuItemId, surplusDiscountPercent, surplusExpiryTime, itemName, quantity, unit, estimatedValue, reason } = body;

    // Toggle Surplus Offer for an item
    if (action === 'TOGGLE_SURPLUS') {
      const item = await prisma.menuItem.update({
        where: { id: menuItemId },
        data: {
          isSurplus: Boolean(body.isSurplus),
          surplusDiscountPercent: parseInt(surplusDiscountPercent) || 20,
          surplusExpiryTime: surplusExpiryTime || 'Today by 18:00',
        },
      });

      return NextResponse.json({
        success: true,
        message: item.isSurplus
          ? `Surplus flash offer of ${item.surplusDiscountPercent}% discount activated for "${item.name}"!`
          : `Surplus offer deactivated for "${item.name}".`,
        item,
      });
    }

    // Log a new food waste incident
    if (action === 'LOG_WASTE') {
      if (!itemName || !quantity) {
        return NextResponse.json({ error: 'Item name and quantity are required.' }, { status: 400 });
      }

      const waste = await prisma.foodWasteRecord.create({
        data: {
          itemName: itemName.trim(),
          quantity: parseFloat(quantity),
          unit: unit?.trim() || 'kg',
          estimatedValue: parseFloat(estimatedValue) || 0,
          reason: reason?.trim() || 'End of day surplus',
          recordedBy: user!.name,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user!.id,
          action: 'FOOD_WASTE_LOGGED',
          details: `Logged ${waste.quantity} ${waste.unit} of "${waste.itemName}" (₹${waste.estimatedValue})`,
        },
      });

      return NextResponse.json({ success: true, message: 'Food waste record logged.', waste });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to process waste request' }, { status: 500 });
  }
}
