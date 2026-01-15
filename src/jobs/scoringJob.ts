import prisma from '../config/database';
import logger from '../config/logger';
import { featureComputationService } from '../modules/score/featureComputation.service';
import { scoringEngineService } from '../modules/score/scoringEngine.service';
import { EventsService } from '../modules/events/events.service';

const eventsService = new EventsService();

export class ScoringJob {
  async calculateScoreForUser(userId: string) {
    try {
      const now = new Date();

      logger.info(`Starting score calculation for user ${userId}`);

      const features = await featureComputationService.computeFeaturesForUser(userId, now);

      const scoreResult = await scoringEngineService.computeScoreForUser(features, now, userId);

      await scoringEngineService.persistScore(userId, scoreResult);

      await eventsService.createEvent(userId, {
        eventType: 'SYSTEM.SCORE_RECALCULATED',
        category: 'system',
        timestamp: now,
        properties: {
          totalScore: scoreResult.totalScore,
          subScores: scoreResult.subScores,
        },
      });

      logger.info(`Score calculated for user ${userId}: ${scoreResult.totalScore}`);

      return scoreResult;
    } catch (error) {
      logger.error(`Error calculating score for user ${userId}:`, error);
      throw error;
    }
  }

  async runForAllUsers() {
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const usersWithRecentActivity = await prisma.event.findMany({
        where: {
          timestamp: {
            gte: ninetyDaysAgo,
          },
        },
        select: { userId: true },
        distinct: ['userId'],
      });

      const userIds = usersWithRecentActivity.map(e => e.userId);

      logger.info(`Starting daily scoring for ${userIds.length} users with recent activity`);

      let successCount = 0;
      let errorCount = 0;

      for (const userId of userIds) {
        try {
          await this.calculateScoreForUser(userId);
          successCount++;
        } catch (error) {
          logger.error(`Failed to calculate score for user ${userId}:`, error);
          errorCount++;
        }
      }

      logger.info(`Daily scoring completed: ${successCount} succeeded, ${errorCount} failed`);
    } catch (error) {
      logger.error('Error in daily scoring job:', error);
    }
  }
}

export const scoringJob = new ScoringJob();
