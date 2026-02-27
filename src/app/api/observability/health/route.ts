import { NextResponse } from 'next/server';
import { getSystemHealth } from '@/lib/observability/service';

export async function GET() {
  try {
    const health = getSystemHealth();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve system health' },
      { status: 500 }
    );
  }
}
