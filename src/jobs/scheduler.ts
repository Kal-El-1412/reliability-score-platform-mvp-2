import { Queue, Worker } from 'bullmq';
import { config } from '../config/env';
import logger from '../config/logger';
import { scoringJob } from './scoringJob';
import { missionAssignmentJob } from './missionAssignmentJob';

const connection = {
  host: config.redisHost,
  port: config.redisPort,
};

const scoringQueue = new Queue('scoring', { connection });
const missionQueue = new Queue('missions', { connection });

export const setupJobScheduler = () => {
  new Worker(
    'scoring',
    async (job) => {
      logger.info('Running scoring job');
      await scoringJob.runForAllUsers();
      return { completed: true };
    },
    { connection }
  );

  new Worker(
    'missions',
    async (job) => {
      logger.info('Running mission assignment job');

      if (job.data.type === 'daily') {
        await missionAssignmentJob.runDailyTasks();
      } else if (job.data.type === 'weekly') {
        await missionAssignmentJob.runWeeklyTasks();
      }

      return { completed: true };
    },
    { connection }
  );

  scoringQueue.add(
    'daily-scoring',
    {},
    {
      repeat: {
        pattern: '0 2 * * *',
      },
    }
  );

  missionQueue.add(
    'daily-missions',
    { type: 'daily' },
    {
      repeat: {
        pattern: '0 0 * * *',
      },
    }
  );

  missionQueue.add(
    'weekly-missions',
    { type: 'weekly' },
    {
      repeat: {
        pattern: '0 0 * * 1',
      },
    }
  );

  logger.info('Job scheduler initialized');
};
