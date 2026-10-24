import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const categorySlug = searchParams.get('category');
    const diet = searchParams.get('diet'); // 'veg', 'nonveg', 'all'
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy');
    const surplus = searchParams.get('surplus');
    const featured = searchParams.get('featured');

    const where: any = {};

    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search.trim() } },
        { description: { contains: search.trim() } },
        { ingredients: { contains: search.trim() } },
      ];
    }

    if (categorySlug && categorySlug !== 'all') {
      where.category = {
        slug: categorySlug,
      };
    }

    if (diet === 'veg') {
      where.isVeg = true;
    } else if (diet === 'nonveg') {
      where.isVeg = false;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (surplus === 'true') {
      where.isSurplus = true;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    else if (sortBy === 'rating_desc') orderBy = { rating: 'desc' };
    else if (sortBy === 'prep_asc') orderBy = { prepTimeMinutes: 'asc' };

    const items = await prisma.menuItem.findMany({
      where,
      orderBy,
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        customizationOptions: item.customizationOptions
          ? JSON.parse(item.customizationOptions)
          : [],
      })),
    });
  } catch (err: any) {
    console.error('Menu fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth(req, ['ADMIN']);
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

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Item name, price, and category are required.' },
        { status: 400 }
      );
    }

    const item = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        price: parseFloat(price),
        imageUrl:
          imageUrl?.trim() ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        categoryId,
        isVeg: Boolean(isVeg),
        stockQuantity: parseInt(stockQuantity) || 50,
        prepTimeMinutes: parseInt(prepTimeMinutes) || 10,
        ingredients: ingredients?.trim() || null,
        allergens: allergens?.trim() || null,
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        isSurplus: Boolean(isSurplus),
        surplusDiscountPercent: parseInt(surplusDiscountPercent) || 0,
        surplusExpiryTime: surplusExpiryTime || null,
        customizationOptions: customizationOptions
          ? JSON.stringify(customizationOptions)
          : '[]',
      },
      include: {
        category: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'MENU_ITEM_CREATE',
        details: `Created menu item "${item.name}" at ₹${item.price}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Menu item created successfully!',
      item: {
        ...item,
        customizationOptions: item.customizationOptions
          ? JSON.parse(item.customizationOptions)
          : [],
      },
    });
  } catch (err: any) {
    console.error('Menu create error:', err);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
