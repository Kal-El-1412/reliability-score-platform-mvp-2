import { z } from 'zod';

const validCategories = ['behavior', 'transaction', 'engagement', 'risk', 'system'] as const;

export const createEventSchema = z.object({
  body: z.object({
    eventType: z.string().min(1, 'Event type is required'),
    category: z.enum(validCategories, {
      errorMap: () => ({ message: 'Category must be one of: behavior, transaction, engagement, risk, system' }),
    }),
    timestamp: z.string().datetime().optional(),
    properties: z.record(z.any()).optional(),
    deviceId: z.string().optional(),
    riskScore: z.number().min(0).max(1).optional(),
  }),
});
