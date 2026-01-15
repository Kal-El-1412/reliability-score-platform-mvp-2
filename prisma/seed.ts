import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const now = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  const missions = await prisma.mission.createMany({
    data: [
      {
        code: 'DAILY_LOGIN',
        title: 'Daily Login',
        description: 'Log in to the platform today',
        type: 'daily',
        targetCount: 1,
        rewardPoints: 10,
        scoreImpactHint: 5,
        activeFrom: now,
        activeTo: oneYearFromNow,
        conditions: { eventType: 'ENG.LOGIN' },
      },
      {
        code: 'DAILY_COMPLETE_5_EVENTS',
        title: 'Complete 5 Events',
        description: 'Complete 5 meaningful events today',
        type: 'daily',
        targetCount: 5,
        rewardPoints: 20,
        scoreImpactHint: 10,
        activeFrom: now,
        activeTo: oneYearFromNow,
        conditions: { category: 'engagement' },
      },
      {
        code: 'DAILY_DIVERSITY',
        title: 'Event Diversity',
        description: 'Complete 3 different types of events today',
        type: 'daily',
        targetCount: 3,
        rewardPoints: 15,
        scoreImpactHint: 8,
        activeFrom: now,
        activeTo: oneYearFromNow,
        conditions: { diversityRequired: true },
      },
      {
        code: 'WEEKLY_STREAK',
        title: 'Weekly Streak',
        description: 'Maintain a 7-day activity streak',
        type: 'weekly',
        targetCount: 7,
        rewardPoints: 50,
        scoreImpactHint: 25,
        activeFrom: now,
        activeTo: oneYearFromNow,
        conditions: { streakRequired: 7 },
      },
      {
        code: 'WEEKLY_CHAMPION',
        title: 'Weekly Champion',
        description: 'Complete 50 events in a week',
        type: 'weekly',
        targetCount: 50,
        rewardPoints: 100,
        scoreImpactHint: 50,
        activeFrom: now,
        activeTo: oneYearFromNow,
        conditions: { category: 'engagement' },
      },
    ],
    skipDuplicates: true,
  });

  console.log(`Created ${missions.count} missions`);

  const rewards = await prisma.reward.createMany({
    data: [
      {
        title: '$5 Amazon Gift Card',
        description: 'Redeem for a $5 Amazon gift card',
        partnerId: 'AMAZON',
        type: 'gift_card',
        costPoints: 100,
        valueDisplay: '$5 USD',
        termsUrl: 'https://www.amazon.com/gp/help/customer/display.html',
        activeFrom: now,
        activeTo: oneYearFromNow,
      },
      {
        title: '$10 Amazon Gift Card',
        description: 'Redeem for a $10 Amazon gift card',
        partnerId: 'AMAZON',
        type: 'gift_card',
        costPoints: 200,
        valueDisplay: '$10 USD',
        termsUrl: 'https://www.amazon.com/gp/help/customer/display.html',
        activeFrom: now,
        activeTo: oneYearFromNow,
      },
      {
        title: '$25 Amazon Gift Card',
        description: 'Redeem for a $25 Amazon gift card',
        partnerId: 'AMAZON',
        type: 'gift_card',
        costPoints: 500,
        valueDisplay: '$25 USD',
        termsUrl: 'https://www.amazon.com/gp/help/customer/display.html',
        activeFrom: now,
        activeTo: oneYearFromNow,
      },
      {
        title: 'Premium Profile Badge',
        description: 'Get a premium badge displayed on your profile',
        type: 'badge',
        costPoints: 50,
        valueDisplay: 'Digital Badge',
        activeFrom: now,
        activeTo: oneYearFromNow,
      },
      {
        title: 'VIP Access - 1 Month',
        description: 'Get 1 month of VIP access with exclusive features',
        type: 'access',
        costPoints: 300,
        valueDisplay: '30 Days',
        activeFrom: now,
        activeTo: oneYearFromNow,
      },
      {
        title: '$50 Starbucks Gift Card',
        description: 'Redeem for a $50 Starbucks gift card',
        partnerId: 'STARBUCKS',
        type: 'gift_card',
        costPoints: 1000,
        valueDisplay: '$50 USD',
        termsUrl: 'https://www.starbucks.com/card/terms',
        activeFrom: now,
        activeTo: oneYearFromNow,
      },
    ],
    skipDuplicates: true,
  });

  console.log(`Created ${rewards.count} rewards`);

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
