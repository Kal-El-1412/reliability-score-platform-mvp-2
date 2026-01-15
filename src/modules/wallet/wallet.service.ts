import prisma from '../../config/database';
import logger from '../../config/logger';

export class WalletService {
  async getBalance(userId: string): Promise<number> {
    const result = await prisma.walletTransaction.aggregate({
      where: { userId },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  }

  async getTransactions(userId: string, limit: number = 20) {
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        reward: true,
      },
    });

    return transactions;
  }

  async addTransaction(
    userId: string,
    amount: number,
    type: 'earn' | 'redeem' | 'adjustment',
    source: string,
    relatedId?: string
  ) {
    const transaction = await prisma.walletTransaction.create({
      data: {
        userId,
        amount,
        currency: 'POINTS',
        type,
        source,
        relatedId,
      },
    });

    logger.info(`Wallet transaction created for user ${userId}: ${type} ${amount} points from ${source}`);

    return transaction;
  }

  async creditPoints(userId: string, amount: number, source: string, relatedId?: string) {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }

    return this.addTransaction(userId, amount, 'earn', source, relatedId);
  }

  async debitPoints(userId: string, amount: number, source: string, relatedId?: string) {
    if (amount <= 0) {
      throw new Error('Debit amount must be positive');
    }

    const balance = await this.getBalance(userId);

    if (balance < amount) {
      throw new Error('Insufficient balance');
    }

    return this.addTransaction(userId, -amount, 'redeem', source, relatedId);
  }

  async getWallet(userId: string) {
    const balance = await this.getBalance(userId);
    const transactions = await this.getTransactions(userId, 20);

    return {
      balance,
      transactions,
    };
  }
}

export const walletService = new WalletService();
