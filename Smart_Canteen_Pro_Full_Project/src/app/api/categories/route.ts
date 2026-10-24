import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth(req, ['ADMIN']);
  if (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, slug, description, icon, displayOrder } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description?.trim(),
        icon: icon?.trim() || 'Utensils',
        displayOrder: Number(displayOrder) || 0,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'CATEGORY_CREATE',
        details: `Created menu category "${category.name}"`,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
