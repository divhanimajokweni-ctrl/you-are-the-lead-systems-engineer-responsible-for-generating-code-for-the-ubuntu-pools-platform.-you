'use client';

import { useMemo, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/shell/AppShell';

// Lazy load heavy components for code splitting
const ThePulse = lazy(() => import('@/components/village/ThePulse').then(m => ({ default: m.ThePulse })));
const TribalImpactDashboard = lazy(() => import('@/components/village/TribalImpactDashboard').then(m => ({ default: m.TribalImpactDashboard })));
const CommonsVault = lazy(() => import('@/components/village/CommonsVault').then(m => ({ default: m.CommonsVault })));
const ImmutableLedger = lazy(() => import('@/components/ledger/ImmutableLedger').then(m => ({ default: m.ImmutableLedger })));
const VillageCircle = lazy(() => import('@/components/village/VillageCircle').then(m => ({ default: m.VillageCircle })));
const CircularProtocol = lazy(() => import('@/components/village/CircularProtocol').then(m => ({ default: m.CircularProtocol })));
const TechnicalDashboard = lazy(() => import('@/components/dashboard/TechnicalDashboard').then(m => ({ default: m.TechnicalDashboard })));

// Existing platform components
import { WelcomeDashboard } from '@/components/home/WelcomeDashboard';
import { VaultBalance } from '@/components/home/VaultBalance';
import { ActivityFeed } from '@/components/home/ActivityFeed';
import { QuickResources } from '@/components/home/QuickResources';
import { FAQSection } from '@/components/home/FAQSection';
import { ProsperityTiers } from '@/components/home/ProsperityTiers';
import { UserProfile } from '@/components/home/UserProfile';
import { UbuntuCard } from '@/components/village/UbuntuCard';
import type { LedgerEvent } from '@/components/ledger/ImmutableLedger';

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
    const loadingFallback = (
      <div className="up-card p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

    switch (activeView) {
      case 'pulse':
        return <Suspense fallback={loadingFallback}><ThePulse /></Suspense>;
      case 'tribal':
        return <Suspense fallback={loadingFallback}><TribalImpactDashboard {...mockTribalImpact} /></Suspense>;
      case 'ledger':
        return <Suspense fallback={loadingFallback}><ImmutableLedger events={mockLedgerEvents} /></Suspense>;
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
                <Suspense fallback={loadingFallback}><VillageCircle onNavigate={(view) => setActiveView(view as ViewType)} /></Suspense>
              </div>
            </div>
            <div className="up-card p-6">
              <p className="up-kicker">Protocol</p>
              <h3 className="mt-2 text-xl font-black tracking-tighter">Circular accountability.</h3>
              <p className="mt-3 text-sm text-[color:var(--muted)]">
                Governance flows in loops: propose → discuss → consent → record → learn.
              </p>
              <div className="mt-6">
                <Suspense fallback={loadingFallback}><CircularProtocol members={mockMembers} currentUserId="user-001" /></Suspense>
              </div>
            </div>
          </div>
        );
      case 'vault':
        return <Suspense fallback={loadingFallback}><CommonsVault currentAmount={7500} maxAmount={10000} /></Suspense>;
      case 'dashboard':
        return <Suspense fallback={loadingFallback}><TechnicalDashboard /></Suspense>;
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
