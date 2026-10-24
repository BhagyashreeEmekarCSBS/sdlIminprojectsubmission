import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const where: any = {};
    if (user!.role === 'STUDENT') {
      where.userId = user!.id;
    }

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, studentId: true } },
        order: { select: { orderNumber: true, tokenNumber: true } },
      },
    });

    return NextResponse.json({ complaints });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { subject, description, orderId } = body;

    if (!subject || !description) {
      return NextResponse.json(
        { error: 'Subject and description are required.' },
        { status: 400 }
      );
    }

    const ticketNumber = `CMP-${Date.now().toString().slice(-6)}`;

    const complaint = await prisma.complaint.create({
      data: {
        ticketNumber,
        userId: user!.id,
        orderId: orderId || null,
        subject: subject.trim(),
        description: description.trim(),
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Support ticket ${ticketNumber} raised. Our team will review and respond.`,
      complaint,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to submit complaint' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { error, user } = await requireAuth(req, ['ADMIN']);
  if (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { complaintId, status, adminResponse } = body;

    if (!complaintId) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
    }

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status: status || 'RESOLVED',
        adminResponse: adminResponse?.trim() || null,
        resolvedAt: status === 'RESOLVED' ? new Date() : undefined,
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: updated.userId,
        title: `Ticket ${updated.ticketNumber} Update`,
        message: `Status updated to ${updated.status}. Response: "${updated.adminResponse || 'Reviewed by administrator'}"`,
        type: 'SYSTEM',
        link: '/feedback',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Complaint updated and customer notified.',
      complaint: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}
