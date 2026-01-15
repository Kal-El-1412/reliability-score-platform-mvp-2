import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';

import authRoutes from './modules/auth/auth.routes';
import eventsRoutes from './modules/events/events.routes';
import scoreRoutes from './modules/score/score.routes';
import missionsRoutes from './modules/missions/missions.routes';
import rewardsRoutes from './modules/rewards/rewards.routes';
import walletRoutes from './modules/wallet/wallet.routes';
import riskRoutes from './modules/risk/risk.routes';

import { errorHandler } from './middleware/errorHandler';
import logger from './config/logger';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/user', authRoutes);
app.use('/events', eventsRoutes);
app.use('/score', scoreRoutes);
app.use('/missions', missionsRoutes);
app.use('/rewards', rewardsRoutes);
app.use('/wallet', walletRoutes);
app.use('/internal/risk', riskRoutes);

app.use(errorHandler);

export default app;
