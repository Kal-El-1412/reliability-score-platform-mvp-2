import prisma from '../../config/database';
import logger from '../../config/logger';

const SERIOUS_FLAGS = ['DEVICE_FRAUD', 'ACCOUNT_TAKEOVER', 'MONEY_LAUNDERING'];

export class RiskService {
  async getRiskProfile(userId: string) {
    let riskProfile = await prisma.riskProfile.findUnique({
      where: { userId },
    });

    if (!riskProfile) {
      return {
        userId,
        riskScore: 0,
        status: 'ok',
        flags: [],
        updatedAt: new Date(),
      };
    }

    return riskProfile;
  }

  async getRiskStatus(userId: string): Promise<'ok' | 'watch' | 'shadow'> {
    const profile = await this.getRiskProfile(userId);
    return profile.status as 'ok' | 'watch' | 'shadow';
  }

  async addRiskFlag(userId: string, flagCode: string, details?: string): Promise<any> {
    let riskProfile = await prisma.riskProfile.findUnique({
      where: { userId },
    });

    const flags = riskProfile ? (Array.isArray(riskProfile.flags) ? riskProfile.flags : []) : [];

    const flagExists = flags.some((f: any) => f.code === flagCode);
    if (flagExists) {
      logger.debug(`Flag ${flagCode} already exists for user ${userId}`);
      return riskProfile;
    }

    const newFlag = {
      code: flagCode,
      details: details || '',
      timestamp: new Date().toISOString(),
    };

    const newFlags = [...flags, newFlag];

    const riskScoreIncrement = SERIOUS_FLAGS.includes(flagCode) ? 50 : 10;
    const newRiskScore = (riskProfile?.riskScore || 0) + riskScoreIncrement;

    const newStatus = this.calculateRiskStatus(newRiskScore, newFlags);

    if (!riskProfile) {
      riskProfile = await prisma.riskProfile.create({
        data: {
          userId,
          riskScore: newRiskScore,
          status: newStatus,
          flags: newFlags as any,
          updatedAt: new Date(),
        },
      });
    } else {
      riskProfile = await prisma.riskProfile.update({
        where: { userId },
        data: {
          riskScore: newRiskScore,
          status: newStatus,
          flags: newFlags as any,
          updatedAt: new Date(),
        },
      });
    }

    logger.info(`Risk flag added for user ${userId}: ${flagCode}, new status: ${newStatus}`);

    return riskProfile;
  }

  private calculateRiskStatus(riskScore: number, flags: any[]): string {
    const hasSeriousFlag = flags.some((f: any) => SERIOUS_FLAGS.includes(f.code));

    if (riskScore > 100 || hasSeriousFlag) {
      return 'shadow';
    } else if (flags.length > 0 || riskScore > 20) {
      return 'watch';
    }

    return 'ok';
  }

  async checkVelocity(userId: string, timeWindowMs: number = 3600000) {
    const recentEvents = await prisma.event.findMany({
      where: {
        userId,
        timestamp: {
          gte: new Date(Date.now() - timeWindowMs),
        },
      },
    });

    const velocityScore = recentEvents.length / (timeWindowMs / 1000);

    return velocityScore;
  }
}

export const riskService = new RiskService();
