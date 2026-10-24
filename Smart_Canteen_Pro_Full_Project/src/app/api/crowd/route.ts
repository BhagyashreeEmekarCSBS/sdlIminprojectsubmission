import { NextResponse } from 'next/server';
import { getSmartQueuePrediction } from '@/lib/queue';

export async function GET() {
  try {
    const prediction = await getSmartQueuePrediction();
    return NextResponse.json({ prediction });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to calculate queue prediction' }, { status: 500 });
  }
}
