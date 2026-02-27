'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CollectivePulseVisualization } from '@/components/collective/PulseVisualization';
import { TrustConstellation } from '@/components/collective/TrustConstellation';
import { ContributionResonance } from '@/components/collective/ContributionResonance';
import { TimebankHarmony } from '@/components/collective/TimebankHarmony';
import { GovernanceHub } from '@/components/governance/GovernanceHub';
import { ObservabilityDashboard } from '@/components/observability/Dashboard';

const mockTrustNodes = [
  { id: '1', name: 'Ubuntu', trustScore: 95, x: 50, y: 50 },
  { id: '2', name: 'Alice', trustScore: 78, x: 30, y: 30 },
  { id: '3', name: 'Bob', trustScore: 65, x: 70, y: 35 },
  { id: '4', name: 'Carol', trustScore: 82, x: 25, y: 70 },
  { id: '5', name: 'David', trustScore: 55, x: 75, y: 75 },
];

const mockTrustConnections = [
  { from: '1', to: '2', strength: 80 },
  { from: '1', to: '3', strength: 65 },
  { from: '1', to: '4', strength: 90 },
  { from: '2', to: '3', strength: 45 },
  { from: '3', to: '5', strength: 55 },
  { from: '4', to: '5', strength: 40 },
];

const mockContributions = [
  { id: '1', contributor: 'Alice', type: 'knowledge' as const, amount: 50, recipientsCount: 10, timestamp: Date.now(), impact: 500 },
  { id: '2', contributor: 'Bob', type: 'support' as const, amount: 30, recipientsCount: 5, timestamp: Date.now() - 1000, impact: 150 },
  { id: '3', contributor: 'Carol', type: 'curation' as const, amount: 25, recipientsCount: 8, timestamp: Date.now() - 2000, impact: 200 },
  { id: '4', contributor: 'David', type: 'liquidity' as const, amount: 100, recipientsCount: 15, timestamp: Date.now() - 3000, impact: 1500 },
];

const mockTimeEntries = [
  { id: '1', userId: '1', userName: 'Alice', action: 'given' as const, description: 'Helped with smart contract review', hours: 2, timestamp: new Date().toISOString() },
  { id: '2', userId: '2', userName: 'Bob', action: 'given' as const, description: 'Mentored new community member', hours: 1.5, timestamp: new Date().toISOString() },
  { id: '3', userId: '1', userName: 'Carol', action: 'received' as const, description: 'Received help with governance proposal', hours: 1, timestamp: new Date().toISOString() },
];

const mockProposals = [
  { id: '1', title: 'Increase Trust Circle Minimum', description: 'Raise minimum trust score for creating pools from 25 to 35', proposer: 'Alice', proposerTrustScore: 78, status: 'active' as const, votes: { approve: 12, reject: 3 }, votingEnds: '2026-03-15' },
  { id: '2', title: 'Add Knowledge Contribution Type', description: 'Introduce new contribution type for documentation', proposer: 'Bob', proposerTrustScore: 65, status: 'passed' as const, votes: { approve: 25, reject: 5 }, votingEnds: '2026-02-20' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'collective' | 'governance' | 'transparency'>('collective');

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Ubuntu Pools
              </h1>
              <p className="text-neutral-400 mt-1">&quot;I am because we are&quot; — Collective Prosperity Platform</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-neutral-400">Live</span>
            </div>
          </motion.div>
        </div>
      </header>

      <nav className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {(['collective', 'governance', 'transparency'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-neutral-700 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {tab === 'collective' ? 'Collective' : tab === 'governance' ? 'Governance' : 'Transparency'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'collective' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🌊</span> Real-Time Collective Pulse
              </h2>
              <CollectivePulseVisualization />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">✨</span> Trust Constellation
                </h2>
                <TrustConstellation nodes={mockTrustNodes} connections={mockTrustConnections} />
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">💫</span> Contribution Resonance
                </h2>
                <ContributionResonance contributions={mockContributions} />
              </section>
            </div>

            <section>
              <TimebankHarmony
                entries={mockTimeEntries}
                currentUserId="1"
                userBalance={3.5}
              />
            </section>
          </motion.div>
        )}

        {activeTab === 'governance' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <GovernanceHub proposals={mockProposals} userTrustScore={72} />
          </motion.div>
        )}

        {activeTab === 'transparency' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Community Transparency Dashboard</h2>
              <p className="text-neutral-400 mt-2">
                Radical transparency — because observability is a community right
              </p>
            </div>
            <ObservabilityDashboard />
          </motion.div>
        )}
      </main>
    </div>
  );
}
