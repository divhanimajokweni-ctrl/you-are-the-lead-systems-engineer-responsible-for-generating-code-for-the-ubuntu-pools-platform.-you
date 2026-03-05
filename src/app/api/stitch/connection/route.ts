import { NextRequest, NextResponse } from 'next/server';
import { getStitchProvider } from '@/lib/bank-provider/stitch';

export async function POST(request: NextRequest) {
  try {
    const { access_token, action } = await request.json();

    if (!access_token) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    const provider = getStitchProvider();

    switch (action) {
      case 'disconnect':
        await provider.disconnect(access_token);
        return NextResponse.json({ success: true, message: 'Disconnected successfully' });
      
      case 'refresh':
        await provider.refreshConnection(access_token);
        const accounts = await provider.getAccounts(access_token);
        return NextResponse.json({ success: true, accounts });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "disconnect" or "refresh"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Stitch connection error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to manage connection' },
      { status: 500 }
    );
  }
}
