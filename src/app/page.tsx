'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { VillageCircle } from '@/components/village/VillageCircle';
import { ThePulse } from '@/components/village/ThePulse';
import { CommonsVault } from '@/components/village/CommonsVault';
import { TribalImpactDashboard } from '@/components/village/TribalImpactDashboard';
import { CircularProtocol } from '@/components/village/CircularProtocol';
import { ImmutableLedger, LedgerEvent } from '@/components/ledger/ImmutableLedger';
import { TechnicalDashboard } from '@/components/dashboard/TechnicalDashboard';
import { PrivacyBadge, ConsentCard, ComplianceMeta } from '@/components/privacy/PrivacyComponents';
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
  {
    id: 'evt-002',
    eventType: 'DEBIT',
    actorId: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    entityId: 'member-042',
    entityType: 'member',
    payload: { amount: 50, currency: 'USDC', destination: 'vault' },
    occurredAt: '2026-02-28T10:31:00Z',
    sequenceNo: 15235,
    hash: 'c3d4e5f678901234567890123456789012cdef1234567890abcdef12345',
    prevHash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12',
  },
  {
    id: 'evt-003',
    eventType: 'REVERSAL',
    actorId: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
    entityId: 'evt-002',
    entityType: 'event',
    payload: { reason: 'Incorrect amount', originalAmount: 50, correctAmount: 25 },
    occurredAt: '2026-02-28T10:35:00Z',
    sequenceNo: 15236,
    hash: 'd4e5f6789012345678901234567890123def1234567890abcdef1234567',
    prevHash: 'c3d4e5f678901234567890123456789012cdef1234567890abcdef12345',
    isReversal: true,
    originalEventId: 'evt-002',
  },
];

const mockMembers = [
  { id: '1', displayName: 'Ubuntu', trustScore: 95, badges: [{ id: 'b1', name: 'Knowledge Keeper', awardedBy: '2', timestamp: Date.now() }], hasVoted: true },
  { id: '2', displayName: 'Alice', trustScore: 78, badges: [{ id: 'b2', name: 'Community Builder', awardedBy: '1', timestamp: Date.now() }], hasVoted: true },
  { id: '3', displayName: 'Bob', trustScore: 65, badges: [], hasVoted: false },
  { id: '4', displayName: 'Carol', trustScore: 82, badges: [{ id: 'b3', name: 'Truth Teller', awardedBy: '2', timestamp: Date.now() }], hasVoted: true },
  { id: '5', displayName: 'David', trustScore: 55, badges: [], hasVoted: false },
  { id: '6', displayName: 'Eve', trustScore: 70, badges: [], hasVoted: true },
];

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>('pulse');

  const contributionsHistory = [
    { type: 'knowledge' as const, amount: 50, timestamp: 1738156800000, description: 'Documentation update' },
    { type: 'support' as const, amount: 30, timestamp: 1738070400000, description: 'Mentored newcomer' },
    { type: 'curation' as const, amount: 25, timestamp: 1737984000000, description: 'Code review' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'pulse':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">The Pulse</h2>
              <p className="text-neutral-400">Real-time global impact map — waves of community activity</p>
            </div>
            <ThePulse autoGenerate={true} />
          </motion.div>
        );

      case 'tribal':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">Tribal Impact Dashboard</h2>
              <p className="text-neutral-400">Your contributions integrated with the collective</p>
            </div>
            <TribalImpactDashboard
              userId="member-001"
              displayName="Ubuntu Member"
              trustScore={72}
              totalContributions={47}
              communityImpact={2840}
              shadowWorkRecognition={12}
              contributionsHistory={contributionsHistory}
            />
          </motion.div>
        );

      case 'ledger':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">Immutable Ledger</h2>
              <p className="text-neutral-400">Append-only event stream with hash chain integrity</p>
            </div>
            <ImmutableLedger events={mockLedgerEvents} />
          </motion.div>
        );

      case 'reputation':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">Trust Circle</h2>
              <p className="text-neutral-400">Peer-attested reputation — badges gifted by others, never self-earned</p>
            </div>
            <CircularProtocol members={mockMembers} currentUserId="1" />
          </motion.div>
        );

      case 'vault':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">Commons Vault</h2>
              <p className="text-neutral-400">Shared community resources unlocked by collective goals</p>
            </div>
            <CommonsVault 
              currentAmount={75000} 
              maxAmount={100000}
              contributors={12}
            />
          </motion.div>
        );

      case 'dashboard':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">Platform Health</h2>
              <p className="text-neutral-400">Technical dashboard — governance & compliance metrics</p>
            </div>
            <TechnicalDashboard />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-neutral-900 to-deep-forest">
      <VillageCircle onNavigate={(view) => setActiveView(view as ViewType)} />
      
      <main className="ml-24 p-6 lg:p-8">
        <header className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-earth via-harvest to-clay flex items-center justify-center animate-float">
                <span className="text-2xl">🌱</span>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-earth via-harvest to-clay bg-clip-text text-transparent">
                  Ubuntu Pools
                </h1>
                <p className="text-neutral-400 text-sm">&quot;I am because we are&quot; — Digital Ubuntu Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <PrivacyBadge 
                userId="member-001-uuid-v4" 
                peerBadges={['Knowledge Keeper', 'Community Builder']}
              />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-earth animate-pulse" />
                <span className="text-sm text-neutral-400 hidden sm:inline">Live</span>
              </div>
              <UserProfile userName="Ubuntu" trustScore={72} />
            </div>
          </motion.div>
        </header>

        <ComplianceMeta 
          consentVersion="v1.0.0" 
          legalBasis="Contractual Necessity"
        />

        <div className="mt-6">
          {activeView === 'pulse' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <WelcomeDashboard userName="Ubuntu Member" />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="glass-card warm-glow p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-white">The Pulse</h2>
                        <p className="text-neutral-400 text-sm">Real-time global impact map — waves of community activity</p>
                      </div>
                    </div>
                    <ThePulse autoGenerate={true} />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <VaultBalance balance="2,300.00" currency="R" />
                  <ActivityFeed />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <QuickResources />
                <ProsperityTiers />
              </div>

              <FAQSection />
            </motion.div>
          ) : (
            renderContent()
          )}
        </div>
      </main>
    </div>
  );
}
