import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        user: {
          select: { name: true, department: true },
        },
      },
    });

    const averageRating =
      feedbacks.length > 0
        ? feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length
        : 4.8;

    return NextResponse.json({ feedbacks, averageRating, totalCount: feedbacks.length });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth(req, ['STUDENT', 'STAFF', 'ADMIN']);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { orderId, rating, category, comments } = body;

    if (!rating || !category || !comments) {
      return NextResponse.json(
        { error: 'Rating (1-5), category, and comments are required.' },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: user!.id,
        orderId: orderId || null,
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        category: category.trim(),
        comments: comments.trim(),
      },
    });

    // Reward 5 loyalty points for constructive feedback!
    await prisma.user.update({
      where: { id: user!.id },
      data: { loyaltyPoints: { increment: 5 } },
    });

    await prisma.loyaltyTransaction.create({
      data: {
        userId: user!.id,
        points: 5,
        type: 'BONUS',
        description: 'Feedback Review Reward',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your feedback has been submitted. 5 bonus points added!',
      feedback,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
