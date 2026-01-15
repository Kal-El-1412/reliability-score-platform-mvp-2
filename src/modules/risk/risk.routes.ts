import { Router } from 'express';
import { RiskController } from './risk.controller';

const router = Router();
const riskController = new RiskController();

router.get('/profile/:user_id', riskController.getRiskProfile.bind(riskController));
router.post('/flag', riskController.addRiskFlag.bind(riskController));

export default router;
