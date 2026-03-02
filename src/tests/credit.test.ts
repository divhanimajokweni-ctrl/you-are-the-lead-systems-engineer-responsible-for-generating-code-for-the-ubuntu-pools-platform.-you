/**
 * Ubuntu Pools — Credit Facilities Tests
 * Phase 6: Credit System Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CreditService, creditService } from '@/lib/services/credit-service';
import { randomUUID } from 'crypto';

describe('CreditService', () => {
  let service: CreditService;
  const testPoolId = randomUUID();
  const testMemberId = randomUUID();

  beforeEach(() => {
    service = new CreditService();
    service.initializePool({
      poolId: testPoolId,
      currency: 'USD',
      phase1BufferTarget: 100000,
      phase2Alpha: 5,
      phase2MaxDurationDays: 90,
      beta: 25,
      gamma: 10,
      healthGateLow: 70,
      healthGateMedium: 85,
      healthGateHigh: 90,
      minContributionWindowDays: 90,
    });
  });

  describe('Pool Initialization', () => {
    it('should initialize pool in phase1_formation', () => {
      const config = service.getPoolConfig(testPoolId);
      expect(config).toBeDefined();
      expect(config?.currentPhase).toBe('phase1_formation');
      expect(config?.creditActivated).toBe(false);
    });

    it('should have correct default values', () => {
      const config = service.getPoolConfig(testPoolId);
      expect(config?.phase1BufferTarget).toBe(100000);
      expect(config?.phase2Alpha).toBe(5);
      expect(config?.beta).toBe(25);
      expect(config?.healthGateLow).toBe(70);
    });
  });

  describe('Pool Capital & Phase Transitions', () => {
    it('should activate credit when buffer ratio >= 25%', () => {
      service.updatePoolCapital(testPoolId, 100000, 25000);
      const config = service.getPoolConfig(testPoolId);
      expect(config?.creditActivated).toBe(true);
    });

    it('should transition phases when buffer grows', () => {
      service.updatePoolCapital(testPoolId, 100000, 30000);
      const config = service.getPoolConfig(testPoolId);
      expect(config?.currentPhase).toBe('phase2_microcredit');
    });
  });

  describe('Pool Health Calculation', () => {
    it('should calculate pool health correctly', () => {
      service.updatePoolCapital(testPoolId, 100000, 30000);
      const config = service.getPoolConfig(testPoolId);
      const health = service.calculatePoolHealth(config!);
      
      expect(health.poolHealthScore).toBeGreaterThan(0);
      expect(health.bufferRatio).toBeGreaterThan(0);
    });
  });

  describe('Credit Eligibility', () => {
    it('should reject eligibility when credit not activated', () => {
      const result = service.checkEligibility({
        memberId: testMemberId,
        poolId: testPoolId,
        ubuntuScore: 50,
        contributionBase: 10000,
        contributionWindowDays: 180,
        poolPhase: 'phase1_formation',
        poolHealthScore: 100,
        creditActivated: false,
        existingExposure: 0,
      });

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('not yet activated');
    });

    it('should reject eligibility when pool in phase1', () => {
      const result = service.checkEligibility({
        memberId: testMemberId,
        poolId: testPoolId,
        ubuntuScore: 50,
        contributionBase: 10000,
        contributionWindowDays: 180,
        poolPhase: 'phase1_formation',
        poolHealthScore: 100,
        creditActivated: true,
        existingExposure: 0,
      });

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('capital formation');
    });

    it('should calculate credit limit using Ubuntu Score and contribution base', () => {
      service.updatePoolCapital(testPoolId, 100000, 25000);
      
      const result = service.checkEligibility({
        memberId: testMemberId,
        poolId: testPoolId,
        ubuntuScore: 75,
        contributionBase: 50000,
        contributionWindowDays: 180,
        poolPhase: 'phase2_microcredit',
        poolHealthScore: 80,
        creditActivated: true,
        existingExposure: 0,
      });

      expect(result.eligible).toBe(true);
      expect(result.creditLimit).toBeGreaterThan(0);
    });

    it('should reject when contribution window too short', () => {
      service.updatePoolCapital(testPoolId, 100000, 25000);
      
      const result = service.checkEligibility({
        memberId: testMemberId,
        poolId: testPoolId,
        ubuntuScore: 50,
        contributionBase: 10000,
        contributionWindowDays: 30,
        poolPhase: 'phase2_microcredit',
        poolHealthScore: 80,
        creditActivated: true,
        existingExposure: 0,
      });

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('contribution period');
    });
  });

  describe('Loan Approval', () => {
    it('should reject loan when credit not activated', () => {
      const result = service.approveLoan({
        poolId: testPoolId,
        memberId: testMemberId,
        amount: 5000,
        termDays: 60,
        purpose: 'community project',
      });

      expect(result.approved).toBe(false);
      expect(result.reason).toContain('not yet activated');
    });

    it('should reject loan exceeding credit limit', () => {
      service.updatePoolCapital(testPoolId, 100000, 25000);
      
      const result = service.approveLoan({
        poolId: testPoolId,
        memberId: testMemberId,
        amount: 1000000,
        termDays: 60,
      });

      expect(result.approved).toBe(false);
      expect(result.reason).toContain('exceeds credit limit');
    });
  });

  describe('Phase 3 Scaling', () => {
    it('should increase credit limit at high pool health', () => {
      service.updatePoolCapital(testPoolId, 100000, 30000);
      let config = service.getPoolConfig(testPoolId);
      config!.poolHealthScore = 90;
      config!.currentPhase = 'phase3_scaling';
      
      const result = service.checkEligibility({
        memberId: testMemberId,
        poolId: testPoolId,
        ubuntuScore: 50,
        contributionBase: 10000,
        contributionWindowDays: 180,
        poolPhase: 'phase3_scaling',
        poolHealthScore: 90,
        creditActivated: true,
        existingExposure: 0,
      });

      expect(result.creditLimit).toBeGreaterThan(0);
    });
  });
});

describe('Credit Service Singleton', () => {
  const testPoolId = randomUUID();

  it('should export singleton instance', () => {
    expect(creditService).toBeDefined();
    expect(creditService.initializePool).toBeDefined();
  });

  it('should handle non-existent pool', () => {
    const config = creditService.getPoolConfig(randomUUID());
    expect(config).toBeUndefined();
  });

  it('should return correct phase for non-existent pool', () => {
    const phase = creditService.getPoolPhase(randomUUID());
    expect(phase).toBe('phase1_formation');
  });
});
