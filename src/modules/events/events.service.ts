import prisma from '../../config/database';
import logger from '../../config/logger';
import { ValidationError } from '../../utils/errors';

const VALID_CATEGORIES = ['behavior', 'transaction', 'engagement', 'risk', 'system'];

export interface CreateEventData {
  eventType: string;
  category: string;
  timestamp?: Date;
  properties?: any;
  deviceId?: string;
  riskScore?: number;
}

export class EventsService {
  async createEvent(userId: string, data: CreateEventData) {
    if (!data.eventType || data.eventType.trim().length === 0) {
      throw new ValidationError('Event type is required');
    }

    if (!data.category || !VALID_CATEGORIES.includes(data.category)) {
      throw new ValidationError(
        `Category must be one of: ${VALID_CATEGORIES.join(', ')}`
      );
    }

    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();

    if (isNaN(timestamp.getTime())) {
      throw new ValidationError('Invalid timestamp format');
    }

    const event = await prisma.event.create({
      data: {
        userId,
        eventType: data.eventType,
        category: data.category,
        timestamp,
        properties: data.properties || {},
        deviceId: data.deviceId,
        riskScore: data.riskScore || 0,
      },
    });

    logger.info(`Event created: ${event.id} for user ${userId}, type: ${data.eventType}`);

    return event;
  }

  async getEventsByUser(userId: string, limit: number = 100) {
    const events = await prisma.event.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return events;
  }

  async getEventsForUserInRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    const events = await prisma.event.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    return events;
  }

  async getEventsForUserLastNDays(userId: string, nDays: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - nDays);

    return this.getEventsForUserInRange(userId, startDate, endDate);
  }

  async getEventsByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    return this.getEventsForUserInRange(userId, startDate, endDate);
  }
}
