import { z } from 'zod';

export const redeemRewardSchema = z.object({
  body: z.object({
    rewardId: z.string().uuid('Invalid reward ID'),
  }),
});
