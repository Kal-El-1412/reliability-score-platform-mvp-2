import { Router } from 'express';
import { RewardsController } from './rewards.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { redeemRewardSchema } from './rewards.validation';

const router = Router();
const rewardsController = new RewardsController();

router.get('/available', authenticate, rewardsController.getAvailableRewards.bind(rewardsController));
router.post('/redeem', authenticate, validate(redeemRewardSchema), rewardsController.redeemReward.bind(rewardsController));

export default router;
