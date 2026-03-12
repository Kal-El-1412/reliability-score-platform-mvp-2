import { Router, Request, Response, NextFunction } from 'express';
import { RiskController } from './risk.controller';

const router = Router();
const riskController = new RiskController();

// Internal routes are protected by a shared secret header.
// Services calling these endpoints must set X-Internal-Token.
const requireInternalToken = (req: Request, res: Response, next: NextFunction) => {
  const secret = process.env.INTERNAL_API_SECRET;
  if (secret && req.headers['x-internal-token'] !== secret) {
    res.status(403).json({ status: 'error', message: 'Forbidden' });
    return;
  }
  next();
};

router.get('/profile/:user_id', requireInternalToken, riskController.getRiskProfile.bind(riskController));
router.post('/flag', requireInternalToken, riskController.addRiskFlag.bind(riskController));

export default router;
