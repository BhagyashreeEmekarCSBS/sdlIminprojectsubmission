import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, studentId, department, year } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required fields.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'STUDENT',
        phone: phone?.trim() || null,
        studentId: studentId?.trim() || null,
        department: department?.trim() || 'Computer Science & BS',
        year: year?.trim() || 'S.Y. B.Tech',
        loyaltyPoints: 50, // Welcome bonus points
      },
    });

    // Create welcome notification & bonus transaction
    await prisma.loyaltyTransaction.create({
      data: {
        userId: user.id,
        points: 50,
        type: 'BONUS',
        description: 'Welcome Sign-up Bonus Points',
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to Smart Canteen Pro! 🎉',
        message: 'You received 50 bonus loyalty points. Start pre-ordering your favorites now!',
        type: 'REWARD',
        link: '/menu',
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! 50 bonus loyalty points added.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
      },
      token,
    });

    response.cookies.set('scp_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Server error during registration. Please try again.' },
      { status: 500 }
    );
  }
}
