import { Request, Response, NextFunction } from 'express';
import { RiskService } from './risk.service';

const riskService = new RiskService();

export class RiskController {
  async getRiskProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id } = req.params;
      const profile = await riskService.getRiskProfile(user_id);

      res.status(200).json({
        status: 'success',
        data: {
          user_id: profile.userId,
          risk_score: profile.riskScore,
          status: profile.status,
          flags: profile.flags,
          updated_at: profile.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async addRiskFlag(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id, flag_code, details } = req.body;
      const profile = await riskService.addRiskFlag(user_id, flag_code, details);

      res.status(200).json({
        status: 'success',
        data: {
          user_id: profile.userId,
          risk_score: profile.riskScore,
          status: profile.status,
          flag_added: flag_code,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
