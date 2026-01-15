import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { featureComputationService } from './featureComputation.service';
import { scoringEngineService } from './scoringEngine.service';
import logger from '../../config/logger';

export class ScoreService {
  async getCurrentScore(userId: string) {
    let score = await prisma.score.findUnique({
      where: { userId },
    });

    if (!score) {
      logger.info(`No score found for user ${userId}, computing on-demand`);
      await this.computeAndSaveScore(userId);
      score = await prisma.score.findUnique({
        where: { userId },
      });
    }

    if (!score) {
      throw new NotFoundError('Unable to compute score for user');
    }

    return score;
  }

  async getScoreHistory(userId: string, from?: Date, to?: Date, limit: number = 30) {
    const whereClause: any = { userId };

    if (from || to) {
      whereClause.timestamp = {};
      if (from) whereClause.timestamp.gte = from;
      if (to) whereClause.timestamp.lte = to;
    }

    const history = await prisma.scoreHistory.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return history;
  }

  async computeAndSaveScore(userId: string): Promise<void> {
    const now = new Date();

    const features = await featureComputationService.computeFeaturesForUser(userId, now);

    const scoreResult = await scoringEngineService.computeScoreForUser(features, now, userId);

    await scoringEngineService.persistScore(userId, scoreResult);

    logger.info(`Score computed and saved for user ${userId}: ${scoreResult.totalScore}`);
  }

  async calculateScore(userId: string) {
    const features = await featureComputationService.computeFeaturesForUser(userId);
    const scoreResult = await scoringEngineService.computeScoreForUser(features, new Date(), userId);

    return {
      totalScore: scoreResult.totalScore,
      subScores: scoreResult.subScores,
      drivers: scoreResult.drivers,
      nextActions: scoringEngineService.generateNextActions(
        scoreResult.drivers,
        features
      ),
    };
  }

  async getScoreWithActions(userId: string) {
    const score = await this.getCurrentScore(userId);

    const features = await prisma.features.findUnique({
      where: { userId },
    });

    const nextActions = features
      ? scoringEngineService.generateNextActions(score.drivers as any, features as any)
      : ['Complete more activities to get personalized recommendations'];

    return {
      userId: score.userId,
      totalScore: score.totalScore,
      subScores: score.subScores,
      lastUpdated: score.lastUpdated,
      drivers: score.drivers,
      nextActions,
    };
  }
}
