import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid/client';

export async function POST(request: NextRequest) {
  try {
    const { access_token, start_date, end_date } = await request.json();

    const response = await plaidClient.transactionsGet({
      access_token,
      start_date: start_date || '2024-01-01',
      end_date: end_date || new Date().toISOString().split('T')[0],
    });

    return NextResponse.json({
      transactions: response.data.transactions,
      accounts: response.data.accounts,
    });
  } catch (error) {
    console.error('Plaid transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
