import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid/client';

export async function POST(request: NextRequest) {
  try {
    const { public_token } = await request.json();

    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    return NextResponse.json({
      access_token: accessToken,
      item_id: itemId,
    });
  } catch (error) {
    console.error('Plaid token exchange error:', error);
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    );
  }
}
