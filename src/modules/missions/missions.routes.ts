import { Router } from 'express';
import missionsController from './missions.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { completeMissionSchema } from './missions.validation';

const router = Router();

router.get('/active', authenticate, missionsController.getActiveMissions.bind(missionsController));
router.post('/complete', authenticate, validate(completeMissionSchema), missionsController.completeMission.bind(missionsController));

export default router;
