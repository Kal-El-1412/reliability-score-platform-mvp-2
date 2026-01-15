import { Response, NextFunction } from 'express';
import { WalletService } from './wallet.service';
import { AuthRequest } from '../../middleware/auth';

const walletService = new WalletService();

export class WalletController {
  async getWallet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { balance, transactions } = await walletService.getWallet(req.userId!);

      const formattedTransactions = transactions.map(tx => ({
        transaction_id: tx.id,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        source: tx.source,
        related_id: tx.relatedId,
        created_at: tx.createdAt,
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
