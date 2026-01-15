import prisma from '../../config/database';
import logger from '../../config/logger';
import { ValidationError, NotFoundError } from '../../utils/errors';
import { EventsService } from '../events/events.service';

const eventsService = new EventsService();

export interface UserMissionWithMission {
  id: string;
  userId: string;
  missionId: string;
  status: string;
  progressCount: number;
  createdAt: Date;
  completedAt: Date | null;
  mission: {
    id: string;
    type: string;
    code: string;
    title: string;
    description: string;
    targetCount: number;
    rewardPoints: number;
    scoreImpactHint: number;
    activeFrom: Date;
    activeTo: Date;
    conditions: any;
  };
}

export class MissionsService {
  async getActiveMissionsForUser(userId: string, now: Date = new Date()): Promise<UserMissionWithMission[]> {
    const userMissions = await prisma.userMission.findMany({
      where: {
        userId,
        status: {
          in: ['assigned', 'in_progress'],
        },
        mission: {
          activeFrom: {
            lte: now,
          },
          activeTo: {
            gte: now,
          },
        },
      },
      include: {
        mission: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return userMissions as UserMissionWithMission[];
  }

  async assignDailyMissionsForUser(userId: string, now: Date = new Date()): Promise<void> {
    const existingDailyMissions = await prisma.userMission.findMany({
      where: {
        userId,
        status: {
          in: ['assigned', 'in_progress'],
        },
        mission: {
          type: 'daily',
          activeFrom: {
            lte: now,
          },
          activeTo: {
            gte: now,
          },
        },
      },
      include: {
        mission: true,
      },
    });

    if (existingDailyMissions.length > 0) {
      logger.debug(`User ${userId} already has ${existingDailyMissions.length} active daily missions`);
      return;
    }

    const availableDailyMissions = await prisma.mission.findMany({
      where: {
        type: 'daily',
        activeFrom: {
          lte: now,
        },
        activeTo: {
          gte: now,
        },
      },
    });

    if (availableDailyMissions.length === 0) {
      logger.warn(`No daily missions available for assignment`);
      return;
    }

    const missionToAssign = availableDailyMissions[0];

    await prisma.userMission.create({
      data: {
        userId,
        missionId: missionToAssign.id,
        status: 'assigned',
        progressCount: 0,
      },
    });

    logger.info(`Assigned daily mission ${missionToAssign.code} to user ${userId}`);
  }

  async assignWeeklyMissionsForUser(userId: string, now: Date = new Date()): Promise<void> {
    const existingWeeklyMissions = await prisma.userMission.findMany({
      where: {
        userId,
        status: {
          in: ['assigned', 'in_progress'],
        },
        mission: {
          type: 'weekly',
          activeFrom: {
            lte: now,
          },
          activeTo: {
            gte: now,
          },
        },
      },
      include: {
        mission: true,
      },
    });

    if (existingWeeklyMissions.length > 0) {
      logger.debug(`User ${userId} already has ${existingWeeklyMissions.length} active weekly missions`);
      return;
    }

    const availableWeeklyMissions = await prisma.mission.findMany({
      where: {
        type: 'weekly',
        activeFrom: {
          lte: now,
        },
        activeTo: {
          gte: now,
        },
      },
    });

    if (availableWeeklyMissions.length === 0) {
      logger.warn(`No weekly missions available for assignment`);
      return;
    }

    const missionToAssign = availableWeeklyMissions[0];

    await prisma.userMission.create({
      data: {
        userId,
        missionId: missionToAssign.id,
        status: 'assigned',
        progressCount: 0,
      },
    });

    logger.info(`Assigned weekly mission ${missionToAssign.code} to user ${userId}`);
  }

  async incrementMissionProgress(userId: string, missionId: string, increment: number = 1): Promise<UserMissionWithMission> {
    const userMission = await prisma.userMission.findFirst({
      where: {
        userId,
        missionId,
        status: {
          in: ['assigned', 'in_progress'],
        },
      },
      include: {
        mission: true,
      },
    });

    if (!userMission) {
      throw new NotFoundError('Mission not found or not active');
    }

    const newProgressCount = userMission.progressCount + increment;
    const newStatus = newProgressCount >= userMission.mission.targetCount ? 'in_progress' : 'in_progress';

    const updated = await prisma.userMission.update({
      where: { id: userMission.id },
      data: {
        progressCount: newProgressCount,
        status: newStatus,
      },
      include: {
        mission: true,
      },
    });

    return updated as UserMissionWithMission;
  }

  async completeMission(userId: string, missionId: string, proofEventId?: string): Promise<UserMissionWithMission> {
    const userMission = await prisma.userMission.findFirst({
      where: {
        userId,
        missionId,
        status: {
          in: ['assigned', 'in_progress'],
        },
      },
      include: {
        mission: true,
      },
    });

    if (!userMission) {
      throw new NotFoundError('Mission not found or already completed');
    }

    if (userMission.status === 'completed') {
      throw new ValidationError('Mission already completed');
    }

    if (userMission.status === 'expired') {
      throw new ValidationError('Mission has expired');
    }

    if (proofEventId) {
      const proofEvent = await prisma.event.findUnique({
        where: { id: proofEventId },
      });

      if (!proofEvent || proofEvent.userId !== userId) {
        throw new ValidationError('Invalid proof event');
      }
    }

    const completedAt = new Date();

    const updated = await prisma.userMission.update({
      where: { id: userMission.id },
      data: {
        status: 'completed',
        completedAt,
        progressCount: userMission.mission.targetCount,
      },
      include: {
        mission: true,
      },
    });

    await eventsService.createEvent(userId, {
      eventType: 'ENG.MISSION_COMPLETED',
      category: 'engagement',
      timestamp: completedAt,
      properties: {
        missionId: userMission.mission.id,
        missionCode: userMission.mission.code,
        rewardPoints: userMission.mission.rewardPoints,
        proofEventId,
      },
    });

    logger.info(`Mission ${userMission.mission.code} completed by user ${userId}`);

    return updated as UserMissionWithMission;
  }

  async expireOldMissions(): Promise<void> {
    const now = new Date();

    const expiredCount = await prisma.userMission.updateMany({
      where: {
        status: {
          in: ['assigned', 'in_progress'],
        },
        mission: {
          activeTo: {
            lt: now,
          },
        },
      },
      data: {
        status: 'expired',
      },
    });

    logger.info(`Expired ${expiredCount.count} old missions`);
  }

  async getMission(missionId: string) {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    return mission;
  }

  async getUserMission(userId: string, missionId: string) {
    const userMission = await prisma.userMission.findFirst({
      where: {
        userId,
        missionId,
      },
      include: {
        mission: true,
      },
    });

    return userMission;
  }
}

export const missionsService = new MissionsService();
