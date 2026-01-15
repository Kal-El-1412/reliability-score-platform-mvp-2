import { Response, NextFunction } from 'express';
import { ScoreService } from './score.service';
import { AuthRequest } from '../../middleware/auth';

const scoreService = new ScoreService();

export class ScoreController {
  async getCurrentScore(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const scoreData = await scoreService.getScoreWithActions(req.userId!);

      res.status(200).json({
        status: 'success',
        data: {
          user_id: scoreData.userId,
          total_score: scoreData.totalScore,
          sub_scores: scoreData.subScores,
          last_updated: scoreData.lastUpdated,
          drivers: scoreData.drivers,
          next_recommended_actions: scoreData.nextActions,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getScoreHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 30;
      const from = req.query.from ? new Date(req.query.from as string) : undefined;
      const to = req.query.to ? new Date(req.query.to as string) : undefined;

      const history = await scoreService.getScoreHistory(req.userId!, from, to, limit);

      const points = history.map(h => ({
        timestamp: h.timestamp,
        total_score: h.totalScore,
      }));

      res.status(200).json({
        status: 'success',
        data: {
          user_id: req.userId,
          points,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
