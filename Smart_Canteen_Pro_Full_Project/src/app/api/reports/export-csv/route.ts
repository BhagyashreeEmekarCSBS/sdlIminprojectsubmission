import { NextRequest, NextResponse } from 'next/server';
import { generateSalesCsvReport } from '@/lib/csv';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req, ['ADMIN']);
  if (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const csvContent = await generateSalesCsvReport({ startDate, endDate });

    const todayStr = new Date().toISOString().slice(0, 10);
    const filename = `smart-canteen-report-${todayStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error('CSV Export error:', err);
    return NextResponse.json({ error: 'Failed to generate CSV report' }, { status: 500 });
  }
}
