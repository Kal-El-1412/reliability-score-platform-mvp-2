import prisma from '../../config/database';
import { ValidationError, ForbiddenError } from '../../utils/errors';
import { WalletService } from '../wallet/wallet.service';
import { RiskService } from '../risk/risk.service';
import { EventsService } from '../events/events.service';
import logger from '../../config/logger';

const walletService = new WalletService();
const riskService = new RiskService();
const eventsService = new EventsService();

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'RWD-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class RewardsService {
  async getAvailableRewards(userId: string, now: Date = new Date()) {
    const rewards = await prisma.reward.findMany({
      where: {
        activeFrom: {
          lte: now,
        },
        activeTo: {
          gte: now,
        },
      },
      orderBy: { costPoints: 'asc' },
    });

    const balance = await walletService.getBalance(userId);

    return rewards.map(reward => ({
      ...reward,
      eligible: balance >= reward.costPoints,
    }));
  }

  async redeemReward(userId: string, rewardId: string) {
    const now = new Date();

    const riskStatus = await riskService.getRiskStatus(userId);
    if (riskStatus === 'shadow') {
      throw new ForbiddenError('Account under review - redemptions temporarily unavailable');
    }

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      throw new ValidationError('Reward not found');
    }

    if (reward.activeFrom > now || reward.activeTo < now) {
      throw new ValidationError('Reward not currently available');
    }

    const balance = await walletService.getBalance(userId);

    if (balance < reward.costPoints) {
      throw new ValidationError('Insufficient points');
    }

    const transaction = await walletService.debitPoints(
      userId,
      reward.costPoints,
      'reward',
      reward.id
    );

    const voucherCode = generateVoucherCode();
    const expiresAt = new Date(Math.min(
      reward.activeTo.getTime(),
      now.getTime() + (30 * 24 * 60 * 60 * 1000)
    ));

    await eventsService.createEvent(userId, {
      eventType: 'ENG.REWARD_REDEEMED',
      category: 'engagement',
      timestamp: now,
      properties: {
        rewardId: reward.id,
        rewardTitle: reward.title,
        costPoints: reward.costPoints,
        voucherCode,
      },
    });

    logger.info(`Reward ${reward.title} redeemed by user ${userId}`);

    return {
      transaction,
      reward,
      voucher: {
        code: voucherCode,
        expires_at: expiresAt,
      },
    };
  }
}

export const rewardsService = new RewardsService();
