import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth(req, ['STAFF', 'ADMIN']);
  if (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    const lowStockItems = items.filter((i) => i.currentStock <= i.minThreshold);

    return NextResponse.json({
      items,
      lowStockItems,
      totalCount: items.length,
      lowStockCount: lowStockItems.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth(req, ['STAFF', 'ADMIN']);
  if (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, inventoryItemId, quantity, reason, name, category, unit, minThreshold, supplierName, costPerUnit } = body;

    // Action 1: Create New Inventory Item
    if (action === 'CREATE_ITEM') {
      if (!name || !unit || minThreshold === undefined) {
        return NextResponse.json({ error: 'Name, unit, and minimum threshold are required.' }, { status: 400 });
      }

      const item = await prisma.inventoryItem.create({
        data: {
          name: name.trim(),
          category: category || 'Groceries',
          unit: unit.trim(),
          currentStock: parseFloat(quantity) || 0,
          minThreshold: parseFloat(minThreshold),
          supplierName: supplierName?.trim() || 'Local Pune Supplier',
          costPerUnit: parseFloat(costPerUnit) || 0,
        },
      });

      if (parseFloat(quantity) > 0) {
        await prisma.stockMovement.create({
          data: {
            inventoryItemId: item.id,
            changeType: 'RESTOCK',
            quantity: parseFloat(quantity),
            reason: reason || 'Initial stock intake',
            recordedBy: user!.name,
          },
        });
      }

      return NextResponse.json({ success: true, message: `Added "${item.name}" to inventory.`, item });
    }

    // Action 2: Restock or Manual Adjustment
    if (!inventoryItemId || quantity === undefined) {
      return NextResponse.json({ error: 'Item ID and quantity are required.' }, { status: 400 });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
    });

    if (!item) {
      return NextResponse.json({ error: 'Inventory item not found.' }, { status: 404 });
    }

    const qty = parseFloat(quantity);
    const changeType = action === 'RESTOCK' ? 'RESTOCK' : (action === 'WASTAGE' ? 'WASTAGE' : 'MANUAL_ADJUSTMENT');

    const updated = await prisma.$transaction(async (tx) => {
      let newStock = item.currentStock;
      if (changeType === 'RESTOCK') {
        newStock += Math.abs(qty);
      } else if (changeType === 'WASTAGE') {
        newStock = Math.max(0, newStock - Math.abs(qty));
      } else {
        // Manual adjustment sets or offsets
        newStock = Math.max(0, newStock + qty);
      }

      const updatedItem = await tx.inventoryItem.update({
        where: { id: item.id },
        data: {
          currentStock: newStock,
          lastRestocked: changeType === 'RESTOCK' ? new Date() : item.lastRestocked,
        },
      });

      await tx.stockMovement.create({
        data: {
          inventoryItemId: item.id,
          changeType,
          quantity: qty,
          reason: reason?.trim() || `Inventory updated by ${user!.name}`,
          recordedBy: user!.name,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user!.id,
          action: `INVENTORY_${changeType}`,
          details: `${user!.name} updated "${item.name}" stock by ${qty} ${item.unit}. New Stock: ${newStock}`,
        },
      });

      return updatedItem;
    });

    return NextResponse.json({
      success: true,
      message: `Updated stock for "${item.name}". New stock: ${updated.currentStock} ${item.unit}`,
      item: updated,
    });
  } catch (err: any) {
    console.error('Inventory update error:', err);
    return NextResponse.json({ error: 'Failed to update inventory.' }, { status: 500 });
  }
}
