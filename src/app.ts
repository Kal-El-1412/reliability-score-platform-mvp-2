import express, { Router } from 'express';
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

// Health check stays at root — no versioning required
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const v1 = Router();
v1.use('/auth', authRoutes);
v1.use('/user', authRoutes);
v1.use('/events', eventsRoutes);
v1.use('/score', scoreRoutes);
v1.use('/missions', missionsRoutes);
v1.use('/rewards', rewardsRoutes);
v1.use('/wallet', walletRoutes);
v1.use('/internal/risk', riskRoutes);

app.use('/v1', v1);

app.use(errorHandler);

export default app;
