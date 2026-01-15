import { Response, NextFunction } from 'express';
import { RewardsService } from './rewards.service';
import { AuthRequest } from '../../middleware/auth';

const rewardsService = new RewardsService();

export class RewardsController {
  async getAvailableRewards(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rewards = await rewardsService.getAvailableRewards(req.userId!);

      res.status(200).json({
        status: 'success',
        data: {
          user_id: req.userId,
          rewards: rewards.map(r => ({
            id: r.id,
            partner_id: r.partnerId,
            type: r.type,
            title: r.title,
            description: r.description,
            cost_points: r.costPoints,
            value_display: r.valueDisplay,
            terms_url: r.termsUrl,
            active_from: r.activeFrom,
            active_to: r.activeTo,
            eligible: r.eligible,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async redeemReward(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { rewardId } = req.body;
      const result = await rewardsService.redeemReward(req.userId!, rewardId);

      res.status(200).json({
        status: 'success',
        data: {
          redemption_id: result.transaction.id,
          reward: {
            id: result.reward.id,
            title: result.reward.title,
            type: result.reward.type,
            value_display: result.reward.valueDisplay,
          },
          voucher: {
            code: result.voucher.code,
            expires_at: result.voucher.expires_at,
          },
          wallet_transaction_id: result.transaction.id,
          points_deducted: Math.abs(result.transaction.amount),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
