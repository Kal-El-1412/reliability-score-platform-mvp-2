import prisma from '../../config/database';
import logger from '../../config/logger';
import { riskService } from '../risk/risk.service';

export interface Features {
  streakDays: number;
  activeDays30d: number;
  activeDays90d: number;
  meaningfulEvents30d: number;
  diversityIndex90d: number;
  disputeCount90d: number;
  reversalCount90d: number;
  velocityFlags30d: number;
  riskFlags90d: number;
  inactivityWeeks: number;
  completionRate90d: number;
  tenureDays: number;
}

export interface SubScores {
  consistency: number;
  capacity: number;
  integrity: number;
  engagement_quality: number;
}

export interface Drivers {
  positive: string[];
  negative: string[];
}

export interface ScoreResult {
  totalScore: number;
  subScores: SubScores;
  drivers: Drivers;
}

export class ScoringEngineService {
  async computeScoreForUser(features: Features, now: Date = new Date(), userId?: string): Promise<ScoreResult> {
    const consistencyScore = this.calculateConsistencyScore(features);
    const capacityScore = this.calculateCapacityScore(features);
    let integrityScore = this.calculateIntegrityScore(features);
    const engagementQualityScore = this.calculateEngagementQualityScore(features);
    const inactivityPenalty = this.calculateInactivityPenalty(features);

    if (userId) {
      const riskStatus = await riskService.getRiskStatus(userId);
      if (riskStatus === 'shadow') {
        integrityScore = 0;
        logger.warn(`IntegrityScore clamped to 0 for user ${userId} due to shadow status`);
      }
    }

    let totalScore =
      consistencyScore +
      capacityScore +
      integrityScore +
      engagementQualityScore -
      inactivityPenalty;

    totalScore = Math.max(0, Math.min(totalScore, 1000));

    const subScores: SubScores = {
      consistency: consistencyScore,
      capacity: capacityScore,
      integrity: integrityScore,
      engagement_quality: engagementQualityScore,
    };

    const drivers = this.generateDrivers(features);

    logger.info(`Score computed: total=${totalScore}, consistency=${consistencyScore}, capacity=${capacityScore}, integrity=${integrityScore}, engagement=${engagementQualityScore}`);

    return {
      totalScore: Math.round(totalScore),
      subScores,
      drivers,
    };
  }

  private calculateConsistencyScore(features: Features): number {
    const streakPoints = Math.min(features.streakDays, 60) * 2;
    const active30Points = Math.min(features.activeDays30d, 30) * 3;

    let varianceStabilityScore = 0;
    if (features.activeDays90d >= 45) {
      varianceStabilityScore = 90;
    } else {
      varianceStabilityScore = Math.round((features.activeDays90d / 45) * 90);
    }

    const consistencyScore = Math.min(
      streakPoints + active30Points + Math.round(varianceStabilityScore * 0.3),
      300
    );

    return Math.round(consistencyScore);
  }

  private calculateCapacityScore(features: Features): number {
    const completionRate = Math.min(Math.max(features.completionRate90d, 0), 1);
    const completionScore = completionRate * 150;

    const tenureFactor = Math.min(features.tenureDays / 90, 1);
    const tenureScore = tenureFactor * 100;

    const capacityScore = completionScore + tenureScore;

    return Math.round(Math.max(0, Math.min(capacityScore, 250)));
  }

  private calculateIntegrityScore(features: Features): number {
    const baseIntegrity = Math.min(200, Math.round((features.tenureDays / 90) * 200));

    const integrityPenalty =
      (features.disputeCount90d * 5) +
      (features.reversalCount90d * 10) +
      (features.velocityFlags30d * 20) +
      (features.riskFlags90d * 40);

    const rawIntegrity = baseIntegrity - integrityPenalty;

    let cleanHistoryBonus = 0;
    if (features.disputeCount90d === 0 &&
        features.reversalCount90d === 0 &&
        features.riskFlags90d === 0) {
      cleanHistoryBonus = 30;
    }

    const integrityScore = rawIntegrity + cleanHistoryBonus;

    return Math.round(Math.max(0, Math.min(integrityScore, 250)));
  }

  private calculateEngagementQualityScore(features: Features): number {
    const meaningfulEventsScore = Math.min(features.meaningfulEvents30d * 5, 100);
    const diversityScore = Math.min(features.diversityIndex90d * 20, 100);

    const engagementQualityScore = meaningfulEventsScore + diversityScore;

    return Math.round(Math.max(0, Math.min(engagementQualityScore, 200)));
  }

  private calculateInactivityPenalty(features: Features): number {
    if (features.inactivityWeeks > 0) {
      return features.inactivityWeeks * 10;
    }
    return 0;
  }

  private generateDrivers(features: Features): Drivers {
    const positive: string[] = [];
    const negative: string[] = [];

    if (features.streakDays >= 5) {
      positive.push(`Strong streak of ${features.streakDays} days`);
    }

    if (features.diversityIndex90d >= 5) {
      positive.push(`High action diversity with ${features.diversityIndex90d} unique event types`);
    }

    if (features.disputeCount90d === 0 && features.reversalCount90d === 0) {
      positive.push('No disputes or reversals in the last 90 days');
    }

    if (features.riskFlags90d === 0) {
      positive.push('Clean risk profile');
    }

    if (features.activeDays30d >= 20) {
      positive.push(`Highly active with ${features.activeDays30d} active days in last 30 days`);
    }

    if (features.completionRate90d >= 0.8) {
      positive.push('Excellent mission completion rate');
    }

    if (features.disputeCount90d > 0) {
      negative.push(`${features.disputeCount90d} dispute(s) in the last 90 days`);
    }

    if (features.reversalCount90d > 0) {
      negative.push(`${features.reversalCount90d} reversal(s) in the last 90 days`);
    }

    if (features.inactivityWeeks > 0) {
      negative.push(`Recent inactivity: ${features.inactivityWeeks} week(s)`);
    }

    if (features.riskFlags90d > 0) {
      negative.push(`${features.riskFlags90d} risk flag(s) detected`);
    }

    if (features.velocityFlags30d > 0) {
      negative.push(`${features.velocityFlags30d} velocity spike(s) in last 30 days`);
    }

    if (features.activeDays30d < 5) {
      negative.push('Low activity in last 30 days');
    }

    if (features.streakDays < 2) {
      negative.push('No current activity streak');
    }

    return { positive, negative };
  }

  generateNextActions(drivers: Drivers, features: Features): string[] {
    const actions: string[] = [];

    if (features.streakDays < 3) {
      actions.push('Build a daily activity streak by logging in and completing actions for 3+ consecutive days');
    }

    if (features.diversityIndex90d < 5) {
      actions.push('Try different types of activities to increase your engagement diversity');
    }

    if (features.activeDays30d < 10) {
      actions.push('Increase daily engagement by being active on more days this month');
    }

    if (features.meaningfulEvents30d < 20) {
      actions.push('Complete more meaningful actions beyond just logging in');
    }

    if (features.inactivityWeeks > 0) {
      actions.push('Return to regular activity to remove inactivity penalties');
    }

    if (features.completionRate90d < 0.5) {
      actions.push('Focus on completing started missions to improve your completion rate');
    }

    if (actions.length === 0) {
      actions.push('Keep up the great work! Maintain your current activity levels');
      actions.push('Consider trying new types of activities to further diversify your engagement');
    }

    return actions.slice(0, 3);
  }

  async persistScore(userId: string, scoreResult: ScoreResult): Promise<void> {
    await prisma.score.upsert({
      where: { userId },
      update: {
        totalScore: scoreResult.totalScore,
        subScores: scoreResult.subScores as any,
        drivers: scoreResult.drivers as any,
        lastUpdated: new Date(),
      },
      create: {
        userId,
        totalScore: scoreResult.totalScore,
        subScores: scoreResult.subScores as any,
        drivers: scoreResult.drivers as any,
      },
    });

    await prisma.scoreHistory.create({
      data: {
        userId,
        totalScore: scoreResult.totalScore,
        timestamp: new Date(),
      },
    });

    logger.info(`Score persisted for user ${userId}: ${scoreResult.totalScore}`);
  }
}

export const scoringEngineService = new ScoringEngineService();
