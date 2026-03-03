'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface MemberCoreData {
  displayName: string;
  ubuntuScore: number;
  scoreChange: number;
  memberSince: string;
  contributionTier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface VillagePulseData {
  peerMatches: number;
  sharedInterests: string[];
  recentActivity: {
    type: 'contribution' | 'badge' | 'governance' | 'pool';
    description: string;
    timestamp: Date;
  }[];
}

export interface PoolHealthData {
  score: number;
  safetyBuffer: number;
  targetBuffer: number;
  liquidity: number;
  status: 'thriving' | 'stable' | 'stressed' | 'critical';
}

interface UbuntuCardProps {
  memberCore: MemberCoreData;
  villagePulse?: VillagePulseData;
  poolHealth: PoolHealthData;
}

export function UbuntuCard({ memberCore, villagePulse, poolHealth }: UbuntuCardProps) {
  const [isLoadingPulse, setIsLoadingPulse] = useState(true);
  const [pulseData, setPulseData] = useState<VillagePulseData | null>(null);

  useEffect(() => {
    if (villagePulse) {
      const timer = setTimeout(() => {
        setPulseData(villagePulse);
        setIsLoadingPulse(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [villagePulse]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'from-slate-400 to-slate-600';
      case 'gold': return 'from-amber-300 to-amber-500';
      case 'silver': return 'from-slate-300 to-slate-400';
      default: return 'from-orange-400 to-orange-600';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'thriving': return 'text-emerald-400';
      case 'stable': return 'text-blue-400';
      case 'stressed': return 'text-amber-400';
      default: return 'text-red-400';
    }
  };

  const getHealthBg = (status: string) => {
    switch (status) {
      case 'thriving': return 'bg-emerald-500/20 border-emerald-500/30';
      case 'stable': return 'bg-blue-500/20 border-blue-500/30';
      case 'stressed': return 'bg-amber-500/20 border-amber-500/30';
      default: return 'bg-red-500/20 border-red-500/30';
    }
  };

  return (
    <div className="up-card up-border-gradient p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="up-kicker">Member Core</p>
          <h3 className="mt-1 text-xl font-black tracking-tighter">{memberCore.displayName}</h3>
          <p className="text-xs text-[color:var(--muted)]">Member since {memberCore.memberSince}</p>
        </div>
        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(memberCore.contributionTier)} text-white text-xs font-bold uppercase`}>
          {memberCore.contributionTier}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <span className="text-3xl font-black text-white">{memberCore.ubuntuScore}</span>
          </div>
          {memberCore.scoreChange !== 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                memberCore.scoreChange > 0 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}
            >
              {memberCore.scoreChange > 0 ? '+' : ''}{memberCore.scoreChange}
            </motion.div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-[color:var(--muted)]">Ubuntu Score</p>
          <div className="mt-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${memberCore.ubuntuScore}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {poolHealth && (
        <div className={`p-4 rounded-lg border ${getHealthBg(poolHealth.status)}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Pool Health</p>
            <span className={`text-lg font-black ${getHealthColor(poolHealth.status)}`}>
              {poolHealth.score}%
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
            <span>Safety Buffer:</span>
            <span className="font-bold">{(poolHealth.safetyBuffer / 100).toLocaleString()} / {(poolHealth.targetBuffer / 100).toLocaleString()}</span>
          </div>
          <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${
                poolHealth.status === 'thriving' ? 'bg-emerald-400' :
                poolHealth.status === 'stable' ? 'bg-blue-400' :
                poolHealth.status === 'stressed' ? 'bg-amber-400' : 'bg-red-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${(poolHealth.safetyBuffer / poolHealth.targetBuffer) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {villagePulse && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="up-kicker">Village Pulse</p>
            {isLoadingPulse && (
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          
          {isLoadingPulse ? (
            <div className="h-20 flex items-center justify-center text-sm text-[color:var(--muted)]">
              Loading pulse...
            </div>
          ) : pulseData ? (
            <>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-sm">
                  <span className="font-black text-emerald-400">{pulseData.peerMatches}</span>
                  <span className="text-[color:var(--muted)]"> peers share your interests</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {pulseData.sharedInterests.slice(0, 3).map((interest, i) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full">
                      #{interest}
                    </span>
                  ))}
                </div>
              </div>

              {pulseData.recentActivity.length > 0 && (
                <div className="space-y-2">
                  {pulseData.recentActivity.slice(0, 2).map((activity, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[color:var(--muted)]">{activity.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function LazySocialEmbed({ 
  platform, 
  username,
  visible 
}: { 
  platform: 'instagram' | 'tiktok';
  username: string;
  visible: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (visible && !isLoaded) {
      const timer = setTimeout(() => setIsLoaded(true), 300);
      return () => clearTimeout(timer);
    }
  }, [visible, isLoaded]);

  if (!visible) return null;

  return (
    <div className="up-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{platform === 'instagram' ? '📸' : '🎵'}</span>
        <span className="font-medium">@{username}</span>
      </div>
      
      {isLoaded ? (
        <div className="aspect-square bg-slate-800 rounded-lg flex items-center justify-center">
          <p className="text-sm text-[color:var(--muted)]">
            {platform === 'instagram' ? 'Instagram' : 'TikTok'} content would load here
          </p>
        </div>
      ) : (
        <div className="aspect-square bg-slate-800/50 rounded-lg animate-pulse" />
      )}
    </div>
  );
}

export function useIntersectionObserver(
  callback: () => void,
  threshold: number = 0.1
) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
        }
      },
      { threshold }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [target, callback, threshold]);

  return setTarget;
}
