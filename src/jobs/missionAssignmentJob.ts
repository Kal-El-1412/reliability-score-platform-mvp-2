import prisma from '../config/database';
import logger from '../config/logger';
import { missionsService } from '../modules/missions/missions.service';

export class MissionAssignmentJob {
  async assignDailyMissionsForAllUsers() {
    try {
      logger.info('Starting daily mission assignment for all users');

      const users = await prisma.user.findMany({
        select: { id: true },
      });

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          await missionsService.assignDailyMissionsForUser(user.id);
          successCount++;
        } catch (error) {
          logger.error(`Failed to assign daily missions for user ${user.id}:`, error);
          errorCount++;
        }
      }

      logger.info(`Daily mission assignment completed: ${successCount} succeeded, ${errorCount} failed`);
    } catch (error) {
      logger.error('Error in daily mission assignment job:', error);
    }
  }

  async assignWeeklyMissionsForAllUsers() {
    try {
      logger.info('Starting weekly mission assignment for all users');

      const users = await prisma.user.findMany({
        select: { id: true },
      });

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          await missionsService.assignWeeklyMissionsForUser(user.id);
          successCount++;
        } catch (error) {
          logger.error(`Failed to assign weekly missions for user ${user.id}:`, error);
          errorCount++;
        }
      }

      logger.info(`Weekly mission assignment completed: ${successCount} succeeded, ${errorCount} failed`);
    } catch (error) {
      logger.error('Error in weekly mission assignment job:', error);
    }
  }

  async expireOldMissions() {
    try {
      logger.info('Starting mission expiration job');

      await missionsService.expireOldMissions();

      logger.info('Mission expiration job completed');
    } catch (error) {
      logger.error('Error in mission expiration job:', error);
    }
  }

  async runDailyTasks() {
    await this.expireOldMissions();
    await this.assignDailyMissionsForAllUsers();
  }

  async runWeeklyTasks() {
    await this.assignWeeklyMissionsForAllUsers();
  }
}

export const missionAssignmentJob = new MissionAssignmentJob();
