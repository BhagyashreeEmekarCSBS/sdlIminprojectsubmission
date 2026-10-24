import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  // Also fetch unread notifications count
  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });

  return NextResponse.json({
    user: {
      ...user,
      favorites: user.favorites ? JSON.parse(user.favorites) : [],
      unreadNotificationsCount: unreadCount,
    },
  });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone, studentId, department, year, favorites } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        phone: phone !== undefined ? phone.trim() : undefined,
        studentId: studentId !== undefined ? studentId.trim() : undefined,
        department: department !== undefined ? department.trim() : undefined,
        year: year !== undefined ? year.trim() : undefined,
        favorites: favorites !== undefined ? JSON.stringify(favorites) : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        studentId: true,
        department: true,
        year: true,
        loyaltyPoints: true,
        favorites: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        ...updated,
        favorites: updated.favorites ? JSON.parse(updated.favorites) : [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
