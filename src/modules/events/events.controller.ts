import { Response, NextFunction } from 'express';
import { EventsService } from './events.service';
import { AuthRequest } from '../../middleware/auth';

const eventsService = new EventsService();

export class EventsController {
  async createEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventType, category, timestamp, properties, deviceId, riskScore } = req.body;

      const event = await eventsService.createEvent(req.userId!, {
        eventType,
        category,
        timestamp: timestamp ? new Date(timestamp) : undefined,
        properties,
        deviceId,
        riskScore,
      });

      res.status(201).json({
        status: 'success',
        data: {
          event_id: event.id,
          status: 'accepted',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
