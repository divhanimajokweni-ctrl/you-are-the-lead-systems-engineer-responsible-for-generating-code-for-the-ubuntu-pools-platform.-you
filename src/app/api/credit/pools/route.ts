/**
 * Ubuntu Pools — Credit API Routes
 * REST endpoints for credit facilities management
 */

import { NextRequest, NextResponse } from 'next/server';
import { creditService, CreditPoolConfigSchema } from '@/lib/services/credit-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = CreditPoolConfigSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.issues },
        { status: 400 }
      );
    }

    const poolConfig = creditService.initializePool(result.data);
    return NextResponse.json(poolConfig, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to initialize credit pool' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const poolId = searchParams.get('poolId');

  if (!poolId) {
    return NextResponse.json(
      { error: 'poolId is required' },
      { status: 400 }
    );
  }

  const config = creditService.getPoolConfig(poolId);
  if (!config) {
    return NextResponse.json(
      { error: 'Credit pool not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(config);
}
