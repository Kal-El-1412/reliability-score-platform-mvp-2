import { Router } from 'express';
import { ScoreController } from './score.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const scoreController = new ScoreController();

router.get('/', authenticate, scoreController.getCurrentScore);
router.get('/history', authenticate, scoreController.getScoreHistory);

export default router;
