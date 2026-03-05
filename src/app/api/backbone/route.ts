import { NextRequest, NextResponse } from 'next/server';
import { ubuntuBackbone } from '@/lib/backbone';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const memberId = searchParams.get('memberId');

    switch (action) {
      case 'state':
        return NextResponse.json(ubuntuBackbone.getState());

      case 'config':
        return NextResponse.json(ubuntuBackbone.getConfig());

      case 'audit':
        const limit = parseInt(searchParams.get('limit') || '50');
        return NextResponse.json(ubuntuBackbone.getAuditTrail(limit));

      case 'member':
        if (!memberId) {
          return NextResponse.json({ error: 'memberId required' }, { status: 400 });
        }
        const profile = ubuntuBackbone.getMemberProfile(memberId);
        if (!profile) {
          return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }
        return NextResponse.json(profile);

      case 'eligibility':
        if (!memberId) {
          return NextResponse.json({ error: 'memberId required' }, { status: 400 });
        }
        return NextResponse.json(ubuntuBackbone.checkMemberEligibility(memberId));

      case 'all-members':
        return NextResponse.json(ubuntuBackbone.getAllMemberProfiles());

      default:
        return NextResponse.json({
          state: ubuntuBackbone.getState(),
          config: ubuntuBackbone.getConfig(),
          stats: {
            totalMembers: ubuntuBackbone.getAllMemberProfiles().length,
            auditEntries: ubuntuBackbone.getAuditTrail().length,
          },
        });
    }
  } catch (error) {
    console.error('Backbone GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, memberId, accessToken, bufferAmount, socialActivity, contributionRate } = body;

    switch (action) {
      case 'sync':
        if (!memberId || !accessToken) {
          return NextResponse.json(
            { error: 'memberId and accessToken required' },
            { status: 400 }
          );
        }
        const profile = await ubuntuBackbone.syncMemberData(memberId, accessToken);
        return NextResponse.json(profile);

      case 'regulate':
        const reasoning = ubuntuBackbone.regulate();
        return NextResponse.json({
          reasoning,
          newState: ubuntuBackbone.getState(),
        });

      case 'update-buffer':
        if (typeof bufferAmount !== 'number') {
          return NextResponse.json(
            { error: 'bufferAmount required' },
            { status: 400 }
          );
        }
        ubuntuBackbone.updateSafetyBuffer(bufferAmount);
        return NextResponse.json({
          success: true,
          newState: ubuntuBackbone.getState(),
        });

      case 'update-pulse':
        if (typeof socialActivity !== 'number' || typeof contributionRate !== 'number') {
          return NextResponse.json(
            { error: 'socialActivity and contributionRate required' },
            { status: 400 }
          );
        }
        ubuntuBackbone.updateVillagePulse(socialActivity, contributionRate);
        return NextResponse.json({
          success: true,
          newState: ubuntuBackbone.getState(),
        });

      case 'check-eligibility':
        if (!memberId) {
          return NextResponse.json(
            { error: 'memberId required' },
            { status: 400 }
          );
        }
        return NextResponse.json(ubuntuBackbone.checkMemberEligibility(memberId));

      case 'matchmaker-input':
        if (!memberId) {
          return NextResponse.json(
            { error: 'memberId required' },
            { status: 400 }
          );
        }
        const input = ubuntuBackbone.generateMatchmakerInput(memberId);
        if (!input) {
          return NextResponse.json(
            { error: 'Member not synced. Please sync bank data first.' },
            { status: 400 }
          );
        }
        return NextResponse.json(input);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Backbone POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
