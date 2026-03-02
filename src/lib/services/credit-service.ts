/**
 * Ubuntu Pools — Credit Facilities Service
 * Phased credit system with Pool Health gates and Ubuntu Score limits
 */

import { z } from 'zod';
import { randomUUID } from 'crypto';
import {
  type CreditPoolConfig,
  type MemberCreditProfile,
  type CreditLoan,
  type CreditPayment,
  type PoolHealthHistory,
  type CreditPhase,
  type CreditStatus,
  type CreditType,
  creditPhaseEnum,
  creditStatusEnum,
  creditTypeEnum,
} from '@/db/schema-credit';

export const CreditPoolConfigSchema = z.object({
  poolId: z.string().uuid(),
  currency: z.string().default('USD'),
  phase1BufferTarget: z.number().int().positive(),
  phase2Alpha: z.number().int().min(1).max(20).default(5),
  phase2MaxDurationDays: z.number().int().min(7).max(180).default(90),
  beta: z.number().int().min(1).max(50).default(25),
  gamma: z.number().int().min(1).max(50).default(10),
  healthGateLow: z.number().int().min(0).max(100).default(70),
  healthGateMedium: z.number().int().min(0).max(100).default(85),
  healthGateHigh: z.number().int().min(0).max(100).default(90),
  minContributionWindowDays: z.number().int().min(0).max(365).default(90),
});

export const CreditRequestSchema = z.object({
  poolId: z.string().uuid(),
  memberId: z.string().uuid(),
  amount: z.number().int().positive(),
  termDays: z.number().int().positive(),
  purpose: z.string().optional(),
});

export const CreditEligibilitySchema = z.object({
  memberId: z.string().uuid(),
  poolId: z.string().uuid(),
  ubuntuScore: z.number().int().min(0).max(100),
  contributionBase: z.number().int().min(0),
  contributionWindowDays: z.number().int().min(0),
  poolPhase: z.enum(['phase1_formation', 'phase2_microcredit', 'phase3_scaling']),
  poolHealthScore: z.number().int().min(0).max(100),
  creditActivated: z.boolean(),
  existingExposure: z.number().int().min(0),
});

export interface PoolHealthMetrics {
  poolHealthScore: number;
  bufferRatio: number;
  capitalRatio: number;
  defaultRate: number;
  liquidityScore: number;
  assetQualityScore: number;
  profitabilityScore: number;
  growthScore: number;
}

export interface CreditLimitResult {
  eligible: boolean;
  creditLimit: number;
  reason?: string;
  phase: CreditPhase;
}

export interface LoanApprovalResult {
  approved: boolean;
  loanId?: string;
  principal?: number;
  interestRate?: number;
  totalDue?: number;
  dueDate?: Date;
  reason?: string;
}

export class CreditService {
  private poolConfigs: Map<string, CreditPoolConfig> = new Map();
  private memberProfiles: Map<string, MemberCreditProfile> = new Map();
  private loans: Map<string, CreditLoan[]> = new Map();

  initializePool(config: z.infer<typeof CreditPoolConfigSchema>): CreditPoolConfig {
    const poolConfig: CreditPoolConfig = {
      id: randomUUID(),
      poolId: config.poolId,
      currency: config.currency,
      currentPhase: 'phase1_formation',
      phase1BufferTarget: config.phase1BufferTarget,
      phase2Alpha: config.phase2Alpha,
      phase2MaxDurationDays: config.phase2MaxDurationDays,
      beta: config.beta,
      gamma: config.gamma,
      healthGateLow: config.healthGateLow,
      healthGateMedium: config.healthGateMedium,
      healthGateHigh: config.healthGateHigh,
      minContributionWindowDays: config.minContributionWindowDays,
      totalPoolCapital: 0,
      safetyBuffer: 0,
      activeCreditExposure: 0,
      poolHealthScore: 100,
      creditActivated: false,
      creditActivationDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.poolConfigs.set(config.poolId, poolConfig);
    return poolConfig;
  }

  updatePoolCapital(poolId: string, capital: number, buffer: number): void {
    const config = this.poolConfigs.get(poolId);
    if (!config) return;

    config.totalPoolCapital = capital;
    config.safetyBuffer = buffer;
    this.recalculatePoolPhase(config);
    this.poolConfigs.set(poolId, config);
  }

  private recalculatePoolPhase(config: CreditPoolConfig): void {
    const bufferRatio = config.totalPoolCapital > 0 
      ? (config.safetyBuffer / config.totalPoolCapital) * 100 
      : 0;

    if (!config.creditActivationDate && bufferRatio >= 25) {
      config.creditActivated = true;
      config.creditActivationDate = new Date();
    }

    switch (config.currentPhase) {
      case 'phase1_formation':
        if (bufferRatio >= 25 && config.creditActivated) {
          config.currentPhase = 'phase2_microcredit';
        }
        break;
      case 'phase2_microcredit':
        if (config.poolHealthScore >= config.healthGateMedium) {
          config.currentPhase = 'phase3_scaling';
        } else if (config.poolHealthScore < config.healthGateLow) {
          config.currentPhase = 'phase2_microcredit';
        }
        break;
      case 'phase3_scaling':
        if (config.poolHealthScore < config.healthGateLow) {
          config.currentPhase = 'phase2_microcredit';
        }
        break;
    }

    config.updatedAt = new Date();
  }

  calculatePoolHealth(config: CreditPoolConfig): PoolHealthMetrics {
    const exposure = config.activeCreditExposure;
    const capital = config.totalPoolCapital;
    const buffer = config.safetyBuffer;

    const bufferRatio = exposure > 0 ? (buffer / exposure) * 100 : 100;
    const capitalRatio = exposure > 0 ? ((capital - exposure) / exposure) * 100 : 100;

    const liquidityScore = Math.min(100, bufferRatio * 2);
    const assetQualityScore = capital > 0 ? Math.min(100, (capital / (exposure + 1)) * 50) : 100;
    const profitabilityScore = config.poolHealthScore > 70 ? 80 : 50;
    const growthScore = config.currentPhase === 'phase3_scaling' ? 90 : 70;

    const poolHealthScore = Math.round(
      (liquidityScore * 0.35) +
      (assetQualityScore * 0.30) +
      (profitabilityScore * 0.20) +
      (growthScore * 0.15)
    );

    config.poolHealthScore = poolHealthScore;
    this.recalculatePoolPhase(config);

    return {
      poolHealthScore,
      bufferRatio: Math.round(bufferRatio),
      capitalRatio: Math.round(capitalRatio),
      defaultRate: 0,
      liquidityScore: Math.round(liquidityScore),
      assetQualityScore: Math.round(assetQualityScore),
      profitabilityScore: Math.round(profitabilityScore),
      growthScore: Math.round(growthScore),
    };
  }

  checkEligibility(eligibility: z.infer<typeof CreditEligibilitySchema>): CreditLimitResult {
    const config = this.poolConfigs.get(eligibility.poolId);
    
    if (!config) {
      return { eligible: false, creditLimit: 0, reason: 'Pool not initialized', phase: 'phase1_formation' };
    }

    if (!eligibility.creditActivated) {
      return { eligible: false, creditLimit: 0, reason: 'Credit not yet activated in pool', phase: config.currentPhase };
    }

    if (eligibility.poolPhase === 'phase1_formation') {
      return { eligible: false, creditLimit: 0, reason: 'Pool in capital formation phase', phase: 'phase1_formation' };
    }

    if (eligibility.poolHealthScore < config.healthGateLow) {
      return { eligible: false, creditLimit: 0, reason: 'Pool health below threshold', phase: config.currentPhase };
    }

    if (eligibility.contributionWindowDays < config.minContributionWindowDays) {
      return { eligible: false, creditLimit: 0, reason: 'Minimum contribution period not met', phase: config.currentPhase };
    }

    let maxCreditLimit: number;

    if (eligibility.poolPhase === 'phase2_microcredit') {
      const alpha = config.phase2Alpha / 100;
      maxCreditLimit = Math.floor(eligibility.contributionBase * alpha * (eligibility.ubuntuScore / 50));
      maxCreditLimit = Math.min(maxCreditLimit, eligibility.contributionBase * 0.10);
    } else {
      const alpha = config.phase2Alpha / 100;
      const baseLimit = eligibility.contributionBase * alpha * (eligibility.ubuntuScore / 50);
      
      if (eligibility.poolHealthScore >= config.healthGateHigh) {
        maxCreditLimit = Math.floor(baseLimit * 1.4);
      } else if (eligibility.poolHealthScore >= config.healthGateMedium) {
        maxCreditLimit = Math.floor(baseLimit * 1.2);
      } else {
        maxCreditLimit = Math.floor(baseLimit);
      }
    }

    const availableLimit = Math.max(0, maxCreditLimit - eligibility.existingExposure);

    return {
      eligible: availableLimit > 0,
      creditLimit: availableLimit,
      phase: config.currentPhase,
    };
  }

  approveLoan(request: z.infer<typeof CreditRequestSchema>): LoanApprovalResult {
    const config = this.poolConfigs.get(request.poolId);
    if (!config) {
      return { approved: false, reason: 'Pool not found' };
    }

    const eligibility: z.infer<typeof CreditEligibilitySchema> = {
      memberId: request.memberId,
      poolId: request.poolId,
      ubuntuScore: 50,
      contributionBase: request.amount * 10,
      contributionWindowDays: 180,
      poolPhase: config.currentPhase,
      poolHealthScore: config.poolHealthScore,
      creditActivated: config.creditActivated,
      existingExposure: config.activeCreditExposure,
    };

    const eligibilityResult = this.checkEligibility(eligibility);

    if (!eligibilityResult.eligible) {
      return { approved: false, reason: eligibilityResult.reason };
    }

    if (request.amount > eligibilityResult.creditLimit) {
      return { approved: false, reason: `Amount exceeds credit limit of ${eligibilityResult.creditLimit}` };
    }

    const totalExposure = config.activeCreditExposure + request.amount;
    const maxExposure = Math.floor(config.beta * config.safetyBuffer);
    
    if (totalExposure > maxExposure) {
      return { approved: false, reason: 'Pool exposure limit reached' };
    }

    const interestRate = this.calculateInterestRate(config, request.termDays);
    const interestAmount = Math.floor(request.amount * (interestRate / 10000));
    const totalDue = request.amount + interestAmount;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + request.termDays);

    const loanId = `LOAN-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const loan: CreditLoan = {
      id: randomUUID(),
      loanId,
      poolId: request.poolId,
      memberId: request.memberId,
      creditType: config.currentPhase === 'phase2_microcredit' ? 'microcredit' : 'standard',
      status: 'active',
      principal: request.amount,
      interestRate,
      interestAmount,
      totalDue,
      currency: config.currency,
      termDays: request.termDays,
      issuedAt: new Date(),
      dueDate,
      repaidAt: null,
      amountPaid: 0,
      paymentSchedule: [],
      nextPaymentDate: dueDate,
      nextPaymentAmount: totalDue,
      ubuntuScoreAtIssuance: eligibility.ubuntuScore,
      poolHealthAtIssuance: config.poolHealthScore,
      phaseAtIssuance: config.currentPhase,
      purpose: request.purpose || null,
      approvedByEventId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existingLoans = this.loans.get(request.memberId) || [];
    existingLoans.push(loan);
    this.loans.set(request.memberId, existingLoans);

    config.activeCreditExposure = totalExposure;
    this.poolConfigs.set(request.poolId, config);

    return {
      approved: true,
      loanId,
      principal: request.amount,
      interestRate,
      totalDue,
      dueDate,
    };
  }

  private calculateInterestRate(config: CreditPoolConfig, termDays: number): number {
    let baseRate = 500;

    if (config.poolHealthScore >= config.healthGateHigh) {
      baseRate = 300;
    } else if (config.poolHealthScore >= config.healthGateMedium) {
      baseRate = 400;
    }

    if (termDays > 90) {
      baseRate += 100;
    } else if (termDays > 60) {
      baseRate += 50;
    }

    return baseRate;
  }

  processPayment(loanId: string, amount: number): { success: boolean; remainingBalance?: number; status?: CreditStatus } {
    for (const [memberId, loans] of this.loans.entries()) {
      const loanIndex = loans.findIndex(l => l.loanId === loanId);
      if (loanIndex !== -1) {
        const loan = loans[loanIndex];
        loan.amountPaid += amount;
        
        const remainingBalance = loan.totalDue - loan.amountPaid;
        
        if (remainingBalance <= 0) {
          loan.status = 'repaid';
          loan.repaidAt = new Date();
        }

        loans[loanIndex] = loan;
        this.loans.set(memberId, loans);

        const config = this.poolConfigs.get(loan.poolId);
        if (config && loan.status === 'repaid') {
          config.activeCreditExposure = Math.max(0, config.activeCreditExposure - loan.principal);
          this.poolConfigs.set(loan.poolId, config);
        }

        return { 
          success: true, 
          remainingBalance: Math.max(0, remainingBalance),
          status: loan.status,
        };
      }
    }
    return { success: false };
  }

  getPoolConfig(poolId: string): CreditPoolConfig | undefined {
    return this.poolConfigs.get(poolId);
  }

  getMemberLoans(memberId: string): CreditLoan[] {
    return this.loans.get(memberId) || [];
  }

  getPoolPhase(poolId: string): CreditPhase {
    const config = this.poolConfigs.get(poolId);
    return config?.currentPhase || 'phase1_formation';
  }

  isCreditActive(poolId: string): boolean {
    const config = this.poolConfigs.get(poolId);
    return config?.creditActivated || false;
  }

  getPoolHealthScore(poolId: string): number {
    const config = this.poolConfigs.get(poolId);
    return config?.poolHealthScore || 100;
  }
}

export const creditService = new CreditService();

export function calculatePoolHealth(config: CreditPoolConfig): PoolHealthMetrics {
  const service = new CreditService();
  return service.calculatePoolHealth(config);
}

export function checkCreditEligibility(eligibility: z.infer<typeof CreditEligibilitySchema>): CreditLimitResult {
  return creditService.checkEligibility(eligibility);
}

export function approveCreditRequest(request: z.infer<typeof CreditRequestSchema>): LoanApprovalResult {
  return creditService.approveLoan(request);
}
