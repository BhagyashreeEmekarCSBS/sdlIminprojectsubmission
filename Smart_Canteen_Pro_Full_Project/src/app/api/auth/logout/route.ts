import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Signed out successfully.',
  });

  response.cookies.set('scp_token', '', {
    path: '/',
    maxAge: 0,
  });

  return response;
}
