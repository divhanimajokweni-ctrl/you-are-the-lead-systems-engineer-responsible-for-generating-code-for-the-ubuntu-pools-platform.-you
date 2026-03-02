'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/shell/AppShell';
import { ConsentCard, ComplianceMeta, RTBFRequest, PrivacyBadge } from '@/components/privacy/PrivacyComponents';

interface PrivacyToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  category: 'social' | 'financial' | 'analytics';
}

export default function PrivacyPage() {
  const [toggles, setToggles] = useState<PrivacyToggle[]>([
    { id: 'instagram-interests', label: 'Instagram Interests', description: 'Allow algorithm to see Instagram interests', enabled: true, category: 'social' },
    { id: 'tiktok-metrics', label: 'TikTok Engagement', description: 'Hide TikTok engagement metrics', enabled: false, category: 'social' },
    { id: 'x-activity', label: 'X/Twitter Activity', description: 'Share X activity with matchmaker', enabled: true, category: 'social' },
    { id: 'plaid-transactions', label: 'Plaid Transactions', description: 'Share transaction data for financial goals', enabled: true, category: 'financial' },
    { id: 'spending-patterns', label: 'Spending Patterns', description: 'Allow lifestyle tag matching', enabled: false, category: 'financial' },
    { id: 'anonymized-analytics', label: 'Anonymized Analytics', description: 'Help improve the platform', enabled: true, category: 'analytics' },
  ]);

  const [rtbfStatus, setRtbfStatus] = useState<'pending' | 'processing' | 'completed'>('completed');

  const togglePrivacy = (id: string) => {
    setToggles(prev => prev.map(t => 
      t.id === id ? { ...t, enabled: !t.enabled } : t
    ));
  };

  const getCategoryColor = (category: PrivacyToggle['category']) => {
    switch (category) {
      case 'social': return 'var(--accent-clay)';
      case 'financial': return 'var(--accent-sage)';
      case 'analytics': return 'var(--accent-gold)';
    }
  };

  const getCategoryLabel = (category: PrivacyToggle['category']) => {
    switch (category) {
      case 'social': return 'Social APIs';
      case 'financial': return 'Financial Data';
      case 'analytics': return 'Analytics';
    }
  };

  const groupedToggles = toggles.reduce((acc, toggle) => {
    if (!acc[toggle.category]) acc[toggle.category] = [];
    acc[toggle.category].push(toggle);
    return acc;
  }, {} as Record<PrivacyToggle['category'], PrivacyToggle[]>);

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="up-card up-border-gradient p-6">
            <p className="up-kicker">Data Sovereignty</p>
            <h1 className="mt-2 text-3xl font-black tracking-tighter">
              Privacy Dashboard
            </h1>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              Your data, your rules. Granular controls over what you share and who sees it.
            </p>
          </div>

          <div className="mt-8 space-y-8">
            {Object.entries(groupedToggles).map(([category, categoryToggles]) => (
              <div key={category} className="up-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: getCategoryColor(category as PrivacyToggle['category']) }}
                  />
                  <p className="up-kicker">{getCategoryLabel(category as PrivacyToggle['category'])}</p>
                </div>
                
                <div className="space-y-4">
                  {categoryToggles.map((toggle) => (
                    <motion.div
                      key={toggle.id}
                      layout
                      className="flex items-center justify-between p-4 bg-[color:var(--surface-2)] rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-black tracking-tight">{toggle.label}</h4>
                        <p className="mt-1 text-xs text-[color:var(--muted)]">{toggle.description}</p>
                      </div>
                      <button
                        onClick={() => togglePrivacy(toggle.id)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          toggle.enabled 
                            ? 'bg-[color:var(--accent-sage)]' 
                            : 'bg-[color:var(--border)]'
                        }`}
                      >
                        <motion.div
                          animate={{ x: toggle.enabled ? 24 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                        />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 up-card p-6">
            <p className="up-kicker">Data Subject Rights</p>
            <h3 className="mt-2 text-xl font-black tracking-tighter">Right to be Forgotten</h3>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              Request complete deletion of your data from our systems. This includes all 
              transaction history, social connections, and reputation badges.
            </p>
            <div className="mt-6">
              <RTBFRequest status={rtbfStatus} requestedAt="2026-01-15T10:00:00Z" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="up-card p-6">
            <p className="up-kicker">Your Identity</p>
            <h3 className="mt-2 text-lg font-black tracking-tighter">Pseudonym</h3>
            <div className="mt-4">
              <PrivacyBadge 
                userId="a1b2c3d4-e5f6-7890-abcd-ef1234567890" 
                peerBadges={['Knowledge Keeper', 'Community Builder']}
              />
            </div>
          </div>

          <div className="up-card p-6">
            <p className="up-kicker">Consent Status</p>
            <h3 className="mt-2 text-lg font-black tracking-tighter">Legal Basis</h3>
            <div className="mt-4">
              <ConsentCard 
                consentVersion="v2.1.0"
                legalBasis="Explicit Consent"
              />
            </div>
          </div>

          <div className="up-card p-6">
            <p className="up-kicker">Compliance</p>
            <h3 className="mt-2 text-lg font-black tracking-tighter">Data Handling</h3>
            <div className="mt-4">
              <ComplianceMeta 
                consentVersion="v2.1.0"
                legalBasis="Explicit Consent"
                dataRetention="7 years"
              />
            </div>
          </div>

          <div className="up-card p-6">
            <p className="up-kicker">Your Footprint</p>
            <h3 className="mt-2 text-lg font-black tracking-tighter">Data Summary</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[color:var(--muted)]">Events Recorded</span>
                <span className="font-black">1,523</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[color:var(--muted)]">Social Connections</span>
                <span className="font-black">47</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[color:var(--muted)]">Data Shares</span>
                <span className="font-black">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
