import { Router } from 'express';
import walletController from './wallet.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, walletController.getWallet.bind(walletController));

export default router;
