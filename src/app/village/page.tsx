'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/shell/AppShell';
import { ThePulse } from '@/components/village/ThePulse';
import { TribalImpactDashboard } from '@/components/village/TribalImpactDashboard';
import { CommonsVault } from '@/components/village/CommonsVault';
import { VillageCircle } from '@/components/village/VillageCircle';
import { CircularProtocol } from '@/components/village/CircularProtocol';
import { PoolHealthGauge } from '@/components/credit/PoolHealthGauge';
import { YieldCard, BufferStatusCard } from '@/components/village/PoolView';

type VillageViewType = 'pulse' | 'impact' | 'trust' | 'vault' | 'governance';

const mockMembers = [
  {
    id: 'member-1',
    displayName: 'Sarah Kim',
    trustScore: 92,
    badges: [
      { id: 'b1', name: 'Knowledge Keeper', awardedBy: 'member-2', timestamp: Date.now() - 86400000 },
      { id: 'b2', name: 'Community Builder', awardedBy: 'member-3', timestamp: Date.now() - 172800000 },
    ],
    hasVoted: true,
    isOnChain: true,
  },
  {
    id: 'member-2',
    displayName: 'Marcus Chen',
    trustScore: 85,
    badges: [
      { id: 'b3', name: 'Truth Teller', awardedBy: 'member-1', timestamp: Date.now() - 259200000 },
    ],
    hasVoted: true,
    isOnChain: false,
  },
  {
    id: 'member-3',
    displayName: 'Jordan Lee',
    trustScore: 78,
    badges: [],
    hasVoted: false,
    isOnChain: false,
  },
];

const mockTribalImpact = {
  userId: 'user-001',
  displayName: 'Alex Chen',
  trustScore: 87,
  totalContributions: 156,
  communityImpact: 2840,
  shadowWorkRecognition: 12,
  contributionsHistory: [
    { type: 'knowledge' as const, amount: 50, timestamp: Date.now() - 86400000, description: 'Shared documentation on governance' },
    { type: 'support' as const, amount: 25, timestamp: Date.now() - 172800000, description: 'Onboarded new community member' },
    { type: 'curation' as const, amount: 15, timestamp: Date.now() - 259200000, description: 'Curated useful resources' },
  ],
};

export default function VillagePage() {
  const [activeView, setActiveView] = useState<VillageViewType>('pulse');
  const [isCompounding, setIsCompounding] = useState(true);

  const views = useMemo(
    () => [
      { id: 'pulse' as const, label: 'The Pulse', help: 'Real-time global impact map — waves of community activity' },
      { id: 'impact' as const, label: 'Impact', help: 'Your contributions integrated with the collective' },
      { id: 'trust' as const, label: 'Trust Circle', help: 'Peer-attested reputation — badges gifted by others' },
      { id: 'vault' as const, label: 'Pool Vault', help: 'Collective liquidity & safety net' },
      { id: 'governance' as const, label: 'Governance', help: 'Circular accountability protocol' },
    ],
    []
  );

  const renderContent = () => {
    switch (activeView) {
      case 'pulse':
        return <ThePulse />;
      case 'impact':
        return <TribalImpactDashboard {...mockTribalImpact} />;
      case 'trust':
        return (
          <div className="up-card up-border-gradient p-6">
            <p className="up-kicker">Trust Circle</p>
            <h2 className="mt-2 text-2xl font-black tracking-tighter">Reputation is gifted.</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              Badges are peer-attested. No self-awarding. Trust is social—like it should be.
            </p>
            <div className="mt-6">
              <VillageCircle onNavigate={(view) => setActiveView(view as VillageViewType)} />
            </div>
          </div>
        );
      case 'vault':
        return (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="up-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="up-kicker">Pool Health</p>
                    <h3 className="mt-1 text-xl font-black tracking-tighter">Collective Liquidity</h3>
                  </div>
                  {isCompounding && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1 bg-[color:var(--accent-gold)]/20 text-[color:var(--accent-gold)] text-xs font-black uppercase tracking-widest rounded-full"
                    >
                      ✨ Compounding
                    </motion.span>
                  )}
                </div>
                <div className="flex justify-center py-4">
                  <PoolHealthGauge score={87} size="lg" />
                </div>
                <p className="mt-4 text-center text-sm text-[color:var(--muted)]">
                  Your safety net is generating yield. The &ldquo;Holy Grail&rdquo; of social capital in action.
                </p>
              </div>
              <BufferStatusCard currentBuffer={7500} targetBuffer={10000} protectionLevel="medium" />
            </div>
            <YieldCard principal={7500} apy={4.5} daysActive={180} />
            <CommonsVault currentAmount={7500} maxAmount={10000} />
          </div>
        );
      case 'governance':
        return (
          <div className="up-card p-6">
            <p className="up-kicker">Protocol</p>
            <h3 className="mt-2 text-xl font-black tracking-tighter">Circular accountability.</h3>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              Governance flows in loops: propose → discuss → consent → record → learn.
            </p>
            <div className="mt-6">
              <CircularProtocol members={mockMembers} currentUserId="user-001" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="up-card up-border-gradient p-6">
            <p className="up-kicker">Village</p>
            <h1 className="mt-2 text-3xl font-black tracking-tighter">
              The Social-Fintech Hub
            </h1>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              Connect, coordinate, and compound together. This is where collective prosperity happens.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {views.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id)}
                className={
                  activeView === v.id
                    ? 'up-pill border-[color:var(--accent-gold)] text-[color:var(--text)]'
                    : 'up-pill opacity-85 hover:opacity-100'
                }
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="mt-4 text-sm text-[color:var(--muted)]">
            {views.find((v) => v.id === activeView)?.help}
          </div>

          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8"
          >
            {renderContent()}
          </motion.div>
        </div>

        <div className="space-y-6">
          <div className="up-card p-6">
            <p className="up-kicker">Your Standing</p>
            <h3 className="mt-2 text-lg font-black tracking-tighter">Trust Score</h3>
            <div className="mt-4 flex justify-center">
              <PoolHealthGauge score={87} size="md" />
            </div>
          </div>
          
          <div className="up-card p-6">
            <p className="up-kicker">Quick Stats</p>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[color:var(--muted)]">Contributions</span>
                <span className="font-black">156</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[color:var(--muted)]">Community Impact</span>
                <span className="font-black">2,840</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[color:var(--muted)]">Badges Earned</span>
                <span className="font-black">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
