import { Response, NextFunction } from 'express';
import { WalletService } from './wallet.service';
import { AuthRequest } from '../../middleware/auth';

const walletService = new WalletService();

export class WalletController {
  async getWallet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const balance = await walletService.getBalance(req.userId!);
      const transactions = await walletService.getTransactions(req.userId!, limit);

      const formattedTransactions = transactions.map(tx => ({
        transaction_id: tx.id,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        source: tx.source,
        related_id: tx.relatedId,
        created_at: tx.createdAt.toISOString(),
      }));

      res.status(200).json({
        status: 'success',
        data: {
          user_id: req.userId,
          balance: {
            points: balance,
          },
          transactions: formattedTransactions,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new WalletController();
