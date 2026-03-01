'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/shell/AppShell';

// Existing platform components (already in your repo)
import { ThePulse } from '@/components/village/ThePulse';
import { TribalImpactDashboard } from '@/components/village/TribalImpactDashboard';
import { CommonsVault } from '@/components/village/CommonsVault';
import { ImmutableLedger, type LedgerEvent } from '@/components/ledger/ImmutableLedger';
import { VillageCircle } from '@/components/village/VillageCircle';
import { CircularProtocol } from '@/components/village/CircularProtocol';
import { TechnicalDashboard } from '@/components/dashboard/TechnicalDashboard';

import { WelcomeDashboard } from '@/components/home/WelcomeDashboard';
import { VaultBalance } from '@/components/home/VaultBalance';
import { ActivityFeed } from '@/components/home/ActivityFeed';
import { QuickResources } from '@/components/home/QuickResources';
import { FAQSection } from '@/components/home/FAQSection';
import { ProsperityTiers } from '@/components/home/ProsperityTiers';
import { UserProfile } from '@/components/home/UserProfile';

type ViewType = 'pulse' | 'tribal' | 'ledger' | 'reputation' | 'vault' | 'dashboard';

const mockLedgerEvents: LedgerEvent[] = [
  {
    id: 'evt-001',
    eventType: 'CREDIT',
    actorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    entityId: 'pool-001',
    entityType: 'pool',
    payload: { amount: 1000, currency: 'USDC', source: 'contribution' },
    occurredAt: '2026-02-28T10:30:00Z',
    sequenceNo: 15234,
    hash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12',
    prevHash: 'b2c3d4e5f67890123456789012345678901bcdef1234567890abcdef123',
  },
];

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>('pulse');

  const views = useMemo(
    () =>
      [
        { id: 'pulse' as const, label: 'The Pulse', help: 'Real-time global impact map — waves of community activity' },
        { id: 'tribal' as const, label: 'Impact', help: 'Your contributions integrated with the collective' },
        { id: 'ledger' as const, label: 'Ledger', help: 'Append-only event stream with hash chain integrity' },
        { id: 'reputation' as const, label: 'Trust', help: 'Peer-attested reputation — badges gifted by others' },
        { id: 'vault' as const, label: 'Vault', help: 'Shared community resources unlocked by goals' },
        { id: 'dashboard' as const, label: 'Health', help: 'Platform metrics — governance & compliance posture' },
      ],
    []
  );

  const renderContent = () => {
    switch (activeView) {
      case 'pulse':
        return <ThePulse />;
      case 'tribal':
        return <TribalImpactDashboard />;
      case 'ledger':
        return <ImmutableLedger events={mockLedgerEvents} />;
      case 'reputation':
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="up-card up-border-gradient p-6">
              <p className="up-kicker">Trust Circle</p>
              <h2 className="mt-2 text-2xl font-black tracking-tighter">Reputation is gifted.</h2>
              <p className="mt-3 text-sm text-[color:var(--muted)]">
                Badges are peer-attested. No self-awarding. Trust is social—like it should be.
              </p>
              <div className="mt-6">
                <VillageCircle members={[]} />
              </div>
            </div>
            <div className="up-card p-6">
              <p className="up-kicker">Protocol</p>
              <h3 className="mt-2 text-xl font-black tracking-tighter">Circular accountability.</h3>
              <p className="mt-3 text-sm text-[color:var(--muted)]">
                Governance flows in loops: propose → discuss → consent → record → learn.
              </p>
              <div className="mt-6">
                <CircularProtocol />
              </div>
            </div>
          </div>
        );
      case 'vault':
        return <CommonsVault />;
      case 'dashboard':
        return <TechnicalDashboard />;
      default:
        return null;
    }
  };

  return (
    <AppShell>
      {/* Top summary row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 up-card up-border-gradient p-6">
          <WelcomeDashboard />
        </div>
        <div className="up-card p-6">
          <VaultBalance />
        </div>
      </div>

      {/* Switcher */}
      <div className="mt-10 flex flex-wrap gap-2">
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

      {/* Main content */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-8"
      >
        {renderContent()}
      </motion.div>

      {/* Human touches */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <div className="up-card p-6">
          <UserProfile />
        </div>
        <div className="lg:col-span-2 up-card p-6">
          <ActivityFeed />
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="up-card p-6">
          <QuickResources />
        </div>
        <div className="up-card p-6">
          <ProsperityTiers />
        </div>
      </div>

      <div className="mt-12 up-card p-6">
        <FAQSection />
      </div>
    </AppShell>
  );
}
