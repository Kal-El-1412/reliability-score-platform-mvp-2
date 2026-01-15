import { Response, NextFunction } from 'express';
import { MissionsService } from './missions.service';
import { WalletService } from '../wallet/wallet.service';
import { AuthRequest } from '../../middleware/auth';

const missionsService = new MissionsService();
const walletService = new WalletService();

export class MissionsController {
  async getActiveMissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userMissions = await missionsService.getActiveMissionsForUser(req.userId!);

      const missions = userMissions.map(um => ({
        mission_id: um.mission.id,
        type: um.mission.type,
        title: um.mission.title,
        description: um.mission.description,
        status: um.status,
        target_count: um.mission.targetCount,
        progress_count: um.progressCount,
        reward_points: um.mission.rewardPoints,
        score_impact_hint: um.mission.scoreImpactHint,
        active_from: um.mission.activeFrom,
        active_to: um.mission.activeTo,
      }));

      res.status(200).json({
        status: 'success',
        data: {
          user_id: req.userId,
          missions,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async completeMission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { mission_id, proof_event_id } = req.body;

      const completedMission = await missionsService.completeMission(
        req.userId!,
        mission_id,
        proof_event_id
      );

      if (completedMission.mission.rewardPoints > 0) {
        await walletService.creditPoints(
          req.userId!,
          completedMission.mission.rewardPoints,
          'mission',
          completedMission.mission.id
        );
      }

      res.status(200).json({
        status: 'completed',
        data: {
          mission_id: completedMission.mission.id,
          completed_at: completedMission.completedAt,
          rewards: {
            wallet_points_earned: completedMission.mission.rewardPoints,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MissionsController();
