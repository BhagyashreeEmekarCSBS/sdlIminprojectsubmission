import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({
      item: {
        ...item,
        customizationOptions: item.customizationOptions
          ? JSON.parse(item.customizationOptions)
          : [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = await requireAuth(req, ['STAFF', 'ADMIN']);
  if (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      name,
      description,
      price,
      imageUrl,
      categoryId,
      isVeg,
      isAvailable,
      stockQuantity,
      prepTimeMinutes,
      ingredients,
      allergens,
      isFeatured,
      isBestSeller,
      isSurplus,
      surplusDiscountPercent,
      surplusExpiryTime,
      customizationOptions,
    } = body;

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description.trim();
    if (price !== undefined) data.price = parseFloat(price);
    if (imageUrl !== undefined) data.imageUrl = imageUrl.trim();
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (isVeg !== undefined) data.isVeg = Boolean(isVeg);
    if (isAvailable !== undefined) data.isAvailable = Boolean(isAvailable);
    if (stockQuantity !== undefined) {
      data.stockQuantity = parseInt(stockQuantity);
      if (data.stockQuantity <= 0) {
        data.isAvailable = false;
      }
    }
    if (prepTimeMinutes !== undefined) data.prepTimeMinutes = parseInt(prepTimeMinutes);
    if (ingredients !== undefined) data.ingredients = ingredients;
    if (allergens !== undefined) data.allergens = allergens;
    if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured);
    if (isBestSeller !== undefined) data.isBestSeller = Boolean(isBestSeller);
    if (isSurplus !== undefined) data.isSurplus = Boolean(isSurplus);
    if (surplusDiscountPercent !== undefined) data.surplusDiscountPercent = parseInt(surplusDiscountPercent);
    if (surplusExpiryTime !== undefined) data.surplusExpiryTime = surplusExpiryTime;
    if (customizationOptions !== undefined) {
      data.customizationOptions = JSON.stringify(customizationOptions);
    }

    const updated = await prisma.menuItem.update({
      where: { id: params.id },
      data,
      include: { category: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'MENU_ITEM_UPDATE',
        details: `Updated item "${updated.name}" (Stock: ${updated.stockQuantity}, Price: ₹${updated.price})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Item updated successfully!',
      item: {
        ...updated,
        customizationOptions: updated.customizationOptions
          ? JSON.parse(updated.customizationOptions)
          : [],
      },
    });
  } catch (err: any) {
    console.error('Menu update error:', err);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = await requireAuth(req, ['ADMIN']);
  if (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: { orderItems: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // If item has orders in history, soft delete by setting isAvailable = false
    if (item.orderItems.length > 0) {
      await prisma.menuItem.update({
        where: { id: params.id },
        data: { isAvailable: false, stockQuantity: 0 },
      });
      return NextResponse.json({
        success: true,
        message: 'Item has order history; archived and marked unavailable.',
      });
    }

    await prisma.menuItem.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'MENU_ITEM_DELETE',
        details: `Deleted menu item "${item.name}"`,
      },
    });

    return NextResponse.json({ success: true, message: 'Item deleted permanently.' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
