/**
 * Ubuntu Pools — WebSocket Infrastructure
 * Real-time collective pulses for Digital Ubuntu
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { randomUUID } from 'crypto';

export interface CollectivePulse {
  id: string;
  type: 'contribution' | 'achievement' | 'trust_update' | 'governance_vote' | 'milestone';
  timestamp: number;
  actorId: string;
  actorType: 'member' | 'pool' | 'system';
  payload: Record<string, unknown>;
  communityImpact: number;
  visualization: {
    color: string;
    intensity: 'subtle' | 'moderate' | 'celebratory';
    duration: number;
  };
}

export interface TrustFlowEvent {
  fromUserId: string;
  toUserId: string;
  trustAmount: number;
  timestamp: number;
}

export interface ContributionEvent {
  contributorId: string;
  resourceType: 'knowledge' | 'curation' | 'support' | 'liquidity';
  amount: number;
  recipientsBenefited: string[];
  timestamp: number;
}

export interface CommunityMetrics {
  totalContributions: number;
  activeMembers: number;
  trustCircles: number;
  governanceParticipation: number;
  collectiveProsperity: number;
}

class UbuntuWebSocketServer {
  private io: SocketIOServer | null = null;
  private pulseHistory: CollectivePulse[] = [];
  private readonly MAX_HISTORY = 1000;
  private metrics: CommunityMetrics = {
    totalContributions: 0,
    activeMembers: 0,
    trustCircles: 0,
    governanceParticipation: 0,
    collectiveProsperity: 0,
  };

  initialize(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST'],
      },
      path: '/api/socket',
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      socket.on('subscribe:collective', () => {
        socket.join('collective');
        socket.emit('collective:init', {
          pulses: this.pulseHistory.slice(-50),
          metrics: this.metrics,
        });
      });

      socket.on('subscribe:trust', (userId: string) => {
        socket.join(`trust:${userId}`);
      });

      socket.on('subscribe:governance', () => {
        socket.join('governance');
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  emitPulse(pulse: Omit<CollectivePulse, 'id'>): CollectivePulse {
    const fullPulse: CollectivePulse = {
      ...pulse,
      id: randomUUID(),
    };

    this.pulseHistory.push(fullPulse);
    if (this.pulseHistory.length > this.MAX_HISTORY) {
      this.pulseHistory.shift();
    }

    if (this.io) {
      this.io.to('collective').emit('pulse:new', fullPulse);
    }

    return fullPulse;
  }

  emitContribution(event: ContributionEvent): void {
    this.metrics.totalContributions += event.amount;
    this.metrics.activeMembers = Math.max(
      this.metrics.activeMembers,
      this.pulseHistory.filter(p => p.timestamp > Date.now() - 3600000).length
    );

    const pulse = this.emitPulse({
      type: 'contribution',
      timestamp: event.timestamp,
      actorId: event.contributorId,
      actorType: 'member',
      payload: {
        resourceType: event.resourceType,
        amount: event.amount,
        recipientsCount: event.recipientsBenefited.length,
      },
      communityImpact: event.amount * event.recipientsBenefited.length,
      visualization: {
        color: this.getResourceColor(event.resourceType),
        intensity: event.amount > 100 ? 'celebratory' : event.amount > 50 ? 'moderate' : 'subtle',
        duration: 2000,
      },
    });

    if (this.io) {
      this.io.to('collective').emit('metrics:update', this.metrics);
    }
  }

  emitTrustFlow(event: TrustFlowEvent): void {
    const pulse = this.emitPulse({
      type: 'trust_update',
      timestamp: event.timestamp,
      actorId: event.fromUserId,
      actorType: 'member',
      payload: {
        toUserId: event.toUserId,
        trustAmount: event.trustAmount,
      },
      communityImpact: event.trustAmount,
      visualization: {
        color: '#10B981',
        intensity: event.trustAmount > 50 ? 'celebratory' : 'moderate',
        duration: 1500,
      },
    });

    if (this.io) {
      this.io.to(`trust:${event.toUserId}`).emit('trust:received', pulse);
      this.io.to('collective').emit('trust:flow', event);
    }
  }

  emitMilestone(type: string, data: Record<string, unknown>): void {
    const pulse = this.emitPulse({
      type: 'milestone',
      timestamp: Date.now(),
      actorId: 'system',
      actorType: 'system',
      payload: data,
      communityImpact: 100,
      visualization: {
        color: '#F59E0B',
        intensity: 'celebratory',
        duration: 5000,
      },
    });

    if (this.io) {
      this.io.emit('milestone:achieved', pulse);
      this.io.to('collective').emit('metrics:update', this.metrics);
    }
  }

  emitGovernanceUpdate(proposalId: string, voteCount: { approve: number; reject: number }): void {
    this.metrics.governanceParticipation += voteCount.approve + voteCount.reject;

    const pulse = this.emitPulse({
      type: 'governance_vote',
      timestamp: Date.now(),
      actorId: proposalId,
      actorType: 'system',
      payload: voteCount,
      communityImpact: voteCount.approve + voteCount.reject,
      visualization: {
        color: '#8B5CF6',
        intensity: 'moderate',
        duration: 1000,
      },
    });

    if (this.io) {
      this.io.to('governance').emit('governance:update', pulse);
    }
  }

  updateMetrics(metrics: Partial<CommunityMetrics>): void {
    this.metrics = { ...this.metrics, ...metrics };
    if (this.io) {
      this.io.to('collective').emit('metrics:update', this.metrics);
    }
  }

  getMetrics(): CommunityMetrics {
    return { ...this.metrics };
  }

  getPulseHistory(limit = 50): CollectivePulse[] {
    return this.pulseHistory.slice(-limit);
  }

  private getResourceColor(type: string): string {
    const colors: Record<string, string> = {
      knowledge: '#3B82F6',
      curation: '#8B5CF6',
      support: '#10B981',
      liquidity: '#F59E0B',
    };
    return colors[type] || '#6B7280';
  }
}

export const ubuntuWS = new UbuntuWebSocketServer();

export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  return ubuntuWS.initialize(httpServer);
}
