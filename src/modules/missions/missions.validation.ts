import { z } from 'zod';

export const completeMissionSchema = z.object({
  body: z.object({
    mission_id: z.string().min(1, 'Mission ID is required'),
    proof_event_id: z.string().optional(),
  }),
});
