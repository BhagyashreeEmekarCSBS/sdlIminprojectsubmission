import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: user!.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read.' });
    }

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId, userId: user!.id },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'Notification marked as read.' });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
