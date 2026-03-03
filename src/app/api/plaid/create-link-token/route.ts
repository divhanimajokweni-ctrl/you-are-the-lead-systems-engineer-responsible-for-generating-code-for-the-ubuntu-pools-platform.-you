import { NextResponse } from 'next/server';
import { plaidClient, plaidProducts, plaidCountryCodes } from '@/lib/plaid/client';

export async function POST() {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: 'user_' + Date.now() },
      client_name: 'Ubuntu Pools',
      products: plaidProducts,
      country_codes: plaidCountryCodes,
      language: 'en',
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Plaid link token error:', error);
    return NextResponse.json(
      { error: 'Failed to create link token' },
      { status: 500 }
    );
  }
}
