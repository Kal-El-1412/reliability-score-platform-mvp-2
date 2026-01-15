import app from './app';
import { config } from './config/env';
import logger from './config/logger';
import prisma from './config/database';

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    const server = app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });

    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await prisma.$disconnect();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await prisma.$disconnect();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
