import prisma from '../../config/database';
import { EventsService } from '../events/events.service';
import logger from '../../config/logger';

const eventsService = new EventsService();

interface ComputedFeatures {
  streakDays: number;
  activeDays30d: number;
  activeDays90d: number;
  meaningfulEvents30d: number;
  diversityIndex90d: number;
  disputeCount90d: number;
  reversalCount90d: number;
  velocityFlags30d: number;
  riskFlags90d: number;
  inactivityWeeks: number;
  completionRate90d: number;
  tenureDays: number;
}

export class FeatureComputationService {
  async computeFeaturesForUser(userId: string, now: Date = new Date()): Promise<ComputedFeatures> {
    const events90d = await eventsService.getEventsForUserLastNDays(userId, 90);
    const events30d = events90d.filter(e =>
      (now.getTime() - new Date(e.timestamp).getTime()) <= 30 * 24 * 60 * 60 * 1000
    );

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const activeDays30d = this.countActiveDays(events30d);
    const activeDays90d = this.countActiveDays(events90d);
    const streakDays = this.calculateStreak(events90d, now);
    const meaningfulEvents30d = this.countMeaningfulEvents(events30d);
    const diversityIndex90d = this.calculateDiversityIndex(events90d);
    const disputeCount90d = this.countDisputes(events90d);
    const reversalCount90d = this.countReversals(events90d);
    const velocityFlags30d = this.countVelocityFlags(events30d);
    const riskFlags90d = this.countRiskFlags(events90d);
    const inactivityWeeks = this.calculateInactivityWeeks(events90d, now);
    const completionRate90d = this.calculateCompletionRate(events90d);
    const tenureDays = this.calculateTenureDays(user.createdAt, now);

    const features: ComputedFeatures = {
      streakDays,
      activeDays30d,
      activeDays90d,
      meaningfulEvents30d,
      diversityIndex90d,
      disputeCount90d,
      reversalCount90d,
      velocityFlags30d,
      riskFlags90d,
      inactivityWeeks,
      completionRate90d,
      tenureDays,
    };

    await this.persistFeatures(userId, features);

    logger.info(`Features computed for user ${userId}: streak=${streakDays}, active30d=${activeDays30d}`);

    return features;
  }

  private countActiveDays(events: any[]): number {
    const uniqueDays = new Set<string>();

    events.forEach(event => {
      const date = new Date(event.timestamp);
      const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      uniqueDays.add(dayKey);
    });

    return uniqueDays.size;
  }

  private calculateStreak(events: any[], now: Date): number {
    if (events.length === 0) return 0;

    const sortedEvents = [...events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const activeDaysSet = new Set<string>();
    sortedEvents.forEach(event => {
      const date = new Date(event.timestamp);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      activeDaysSet.add(dayKey);
    });

    const activeDaysArray = Array.from(activeDaysSet).sort().reverse();

    let streak = 0;
    const todayKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayKey = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth()).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

    let startDay = activeDaysSet.has(todayKey) ? todayKey :
                   activeDaysSet.has(yesterdayKey) ? yesterdayKey : null;

    if (!startDay) return 0;

    let currentDate = startDay === todayKey ? now : yesterdayDate;

    while (true) {
      const currentKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth()).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

      if (activeDaysSet.has(currentKey)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }

      if (streak > 365) break;
    }

    return streak;
  }

  private countMeaningfulEvents(events: any[]): number {
    return events.filter(e =>
      e.category !== 'system' && e.category !== 'risk'
    ).length;
  }

  private calculateDiversityIndex(events: any[]): number {
    const systemEvents = events.filter(e => e.category === 'system');
    const nonSystemEvents = events.filter(e => e.category !== 'system');

    const uniqueEventTypes = new Set(nonSystemEvents.map(e => e.eventType));
    return uniqueEventTypes.size;
  }

  private countDisputes(events: any[]): number {
    return events.filter(e =>
      e.eventType.toUpperCase().includes('DISPUTE') ||
      e.eventType.toUpperCase().includes('REFUND')
    ).length;
  }

  private countReversals(events: any[]): number {
    return events.filter(e =>
      e.eventType.toUpperCase().includes('REVERSAL') ||
      e.eventType.toUpperCase().includes('CHARGEBACK')
    ).length;
  }

  private countVelocityFlags(events: any[]): number {
    return events.filter(e =>
      e.category === 'risk' && e.eventType === 'RISK.VELOCITY_SPIKE'
    ).length;
  }

  private countRiskFlags(events: any[]): number {
    return events.filter(e => e.category === 'risk').length;
  }

  private calculateInactivityWeeks(events: any[], now: Date): number {
    if (events.length === 0) {
      return Math.ceil((90 - 7) / 7);
    }

    const sortedEvents = [...events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const lastEventDate = new Date(sortedEvents[0].timestamp);
    const daysSinceLastActivity = Math.floor(
      (now.getTime() - lastEventDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActivity <= 7) {
      return 0;
    }

    return Math.ceil((daysSinceLastActivity - 7) / 7);
  }

  private calculateCompletionRate(events: any[]): number {
    const completedMissions = events.filter(e =>
      e.eventType === 'ENG.MISSION_COMPLETED'
    ).length;

    const missionRelatedEvents = events.filter(e =>
      e.eventType.startsWith('ENG.MISSION')
    ).length;

    if (missionRelatedEvents === 0) {
      return 0.5;
    }

    return completedMissions / Math.max(1, missionRelatedEvents);
  }

  private calculateTenureDays(createdAt: Date, now: Date): number {
    const diffTime = Math.abs(now.getTime() - new Date(createdAt).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  private async persistFeatures(userId: string, features: ComputedFeatures) {
    await prisma.features.upsert({
      where: { userId },
      update: {
        ...features,
        updatedAt: new Date(),
      },
      create: {
        userId,
        ...features,
      },
    });
  }

  groupEventsByDay(events: any[]): Map<string, any[]> {
    const grouped = new Map<string, any[]>();

    events.forEach(event => {
      const date = new Date(event.timestamp);
      const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (!grouped.has(dayKey)) {
        grouped.set(dayKey, []);
      }
      grouped.get(dayKey)!.push(event);
    });

    return grouped;
  }
}

export const featureComputationService = new FeatureComputationService();
