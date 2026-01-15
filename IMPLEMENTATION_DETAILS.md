# Reliability Score Platform - Implementation Details

## Overview

This document describes the full implementation of the Event Ledger, Feature Aggregation Service, Scoring Engine V2, and Score API endpoints.

## 1. Event Ledger Implementation

### Database Model (Prisma)

The Event model has been enhanced with the following structure:

```prisma
model Event {
  id          String   @id @default(cuid())
  userId      String
  eventType   String
  category    String   @default("behavior")
  timestamp   DateTime @default(now())
  properties  Json     @default("{}")
  deviceId    String?
  riskScore   Float    @default(0)
  createdAt   DateTime @default(now())
}
```

**Categories**: `behavior`, `transaction`, `engagement`, `risk`, `system`

### Service Layer (`src/modules/events/events.service.ts`)

**Key Methods:**
- `createEvent(userId, data)` - Creates and validates new events
- `getEventsForUserInRange(userId, startDate, endDate)` - Retrieves events in date range
- `getEventsForUserLastNDays(userId, nDays)` - Gets recent N days of events

**Validation:**
- Event type must be non-empty
- Category must be one of the valid categories
- Timestamp format validation
- Automatic fallback to current time if not provided

### Controller (`src/modules/events/events.controller.ts`)

**POST /events**
- Requires authentication
- Validates all input fields
- Returns: `{ event_id, status: "accepted" }`

**Example Request:**
```json
{
  "eventType": "ENG.MISSION_COMPLETED",
  "category": "engagement",
  "timestamp": "2024-01-10T10:00:00Z",
  "properties": {
    "mission_id": "abc123",
    "points_earned": 50
  },
  "deviceId": "device-xyz",
  "riskScore": 0.1
}
```

---

## 2. Feature Aggregation Service

### Database Model (Prisma)

```prisma
model Features {
  userId               String   @id
  streakDays           Int      @default(0)
  activeDays30d        Int      @default(0)
  activeDays90d        Int      @default(0)
  meaningfulEvents30d  Int      @default(0)
  diversityIndex90d    Int      @default(0)
  disputeCount90d      Int      @default(0)
  reversalCount90d     Int      @default(0)
  velocityFlags30d     Int      @default(0)
  riskFlags90d         Int      @default(0)
  inactivityWeeks      Int      @default(0)
  completionRate90d    Float    @default(0)
  tenureDays           Int      @default(0)
  updatedAt            DateTime @default(now())
}
```

### Service Layer (`src/modules/score/featureComputation.service.ts`)

**Main Method:**
```typescript
computeFeaturesForUser(userId: string, now: Date): Promise<ComputedFeatures>
```

**Feature Calculations:**

1. **streakDays**: Consecutive days with at least one event (backwards from today)
2. **activeDays30d/90d**: Unique calendar days with events
3. **meaningfulEvents30d**: Events where category != "system" and != "risk"
4. **diversityIndex90d**: Count of distinct event types (excluding system events)
5. **disputeCount90d**: Events with "DISPUTE" or "REFUND" in eventType
6. **reversalCount90d**: Events with "REVERSAL" or "CHARGEBACK" in eventType
7. **velocityFlags30d**: Count of "RISK.VELOCITY_SPIKE" events
8. **riskFlags90d**: Count of all risk category events
9. **inactivityWeeks**: Weeks inactive beyond 7 days: `ceil((days_inactive - 7) / 7)`
10. **completionRate90d**: Mission completed events / mission-related events (default 0.5 if no data)
11. **tenureDays**: Days since user creation

**Helper Methods:**
- `countActiveDays(events)` - Count unique activity days
- `calculateStreak(events, now)` - Calculate current streak
- `groupEventsByDay(events)` - Group events by calendar day

---

## 3. Scoring Engine V2

### Database Models (Prisma)

```prisma
model Score {
  userId      String   @id
  totalScore  Int
  subScores   Json
  drivers     Json
  lastUpdated DateTime @default(now())
}

model ScoreHistory {
  id          String   @id @default(cuid())
  userId      String
  timestamp   DateTime @default(now())
  totalScore  Int
}
```

### Service Layer (`src/modules/score/scoringEngine.service.ts`)

**Main Method:**
```typescript
computeScoreForUser(features: Features, now: Date): ScoreResult
```

#### Scoring Formula

**1. Consistency Score (0-300)**
```
streakPoints = min(streakDays, 60) × 2              // max 120
active30Points = min(activeDays30d, 30) × 3         // max 90
varianceStabilityScore = activeDays90d >= 45 ? 90 : (activeDays90d / 45) × 90

consistencyScore = min(streakPoints + active30Points + round(varianceStabilityScore × 0.3), 300)
```

**2. Capacity Score (0-250)**
```
completionScore = completionRate90d × 150            // max 150
tenureFactor = min(tenureDays / 90, 1)
tenureScore = tenureFactor × 100                     // max 100

capacityScore = round(completionScore + tenureScore)  // clamped 0-250
```

**3. Integrity Score (0-250)**
```
baseIntegrity = min(200, round((tenureDays / 90) × 200))

integrityPenalty =
  (disputeCount90d × 5) +
  (reversalCount90d × 10) +
  (velocityFlags30d × 20) +
  (riskFlags90d × 40)

rawIntegrity = baseIntegrity - integrityPenalty

cleanHistoryBonus = (disputeCount90d == 0 && reversalCount90d == 0 && riskFlags90d == 0) ? 30 : 0

integrityScore = max(0, min(rawIntegrity + cleanHistoryBonus, 250))
```

**4. Engagement Quality Score (0-200)**
```
meaningfulEventsScore = min(meaningfulEvents30d × 5, 100)
diversityScore = min(diversityIndex90d × 20, 100)

engagementQualityScore = max(0, min(meaningfulEventsScore + diversityScore, 200))
```

**5. Inactivity Penalty**
```
inactivityPenalty = inactivityWeeks × 10
```

**6. Total Score**
```
totalScore = consistencyScore + capacityScore + integrityScore + engagementQualityScore - inactivityPenalty

totalScore = max(0, min(totalScore, 1000))
```

#### Driver Generation

**Positive Drivers:**
- Strong streak of X days (if streakDays >= 5)
- High action diversity (if diversityIndex90d >= 5)
- No disputes/reversals in 90 days
- Clean risk profile (riskFlags90d == 0)
- Highly active (activeDays30d >= 20)
- Excellent completion rate (>= 0.8)

**Negative Drivers:**
- X dispute(s) in last 90 days
- X reversal(s) in last 90 days
- Recent inactivity (inactivityWeeks > 0)
- X risk flag(s) detected
- X velocity spike(s) in last 30 days
- Low activity in last 30 days (< 5 days)
- No current activity streak (< 2 days)

#### Next Recommended Actions

Generated based on negative indicators:
- Build a daily activity streak (if streakDays < 3)
- Try different types of activities (if diversityIndex90d < 5)
- Increase daily engagement (if activeDays30d < 10)
- Complete more meaningful actions (if meaningfulEvents30d < 20)
- Return to regular activity (if inactivityWeeks > 0)
- Focus on completing missions (if completionRate90d < 0.5)

Default if all good: "Keep up the great work!"

---

## 4. Daily Scoring Job

### Implementation (`src/jobs/scoringJob.ts`)

**Methods:**
- `calculateScoreForUser(userId)` - Compute and persist score for one user
- `runForAllUsers()` - Daily batch job for all active users

**Process Flow:**
1. Find all users with events in last 90 days
2. For each user:
   - Compute features via FeatureComputationService
   - Calculate score via ScoringEngineService
   - Persist to Score and ScoreHistory tables
   - Create SYSTEM.SCORE_RECALCULATED event
3. Log success/error counts

**Optimization:**
- Only processes users with recent activity (last 90 days)
- Graceful error handling per user
- Detailed logging

---

## 5. Score API Implementation

### GET /score

**Authentication**: Required
**URL**: `/score`

**Response Format:**
```json
{
  "status": "success",
  "data": {
    "user_id": "uuid",
    "total_score": 750,
    "sub_scores": {
      "consistency": 250,
      "capacity": 200,
      "integrity": 200,
      "engagement_quality": 150
    },
    "last_updated": "2024-01-10T14:30:00Z",
    "drivers": {
      "positive": [
        "Strong streak of 15 days",
        "High action diversity with 8 unique event types",
        "No disputes or reversals in the last 90 days"
      ],
      "negative": [
        "Low activity in last 30 days"
      ]
    },
    "next_recommended_actions": [
      "Increase daily engagement by being active on more days this month",
      "Complete more meaningful actions beyond just logging in"
    ]
  }
}
```

**Behavior:**
- If no score exists, computes on-demand
- Returns personalized drivers and next actions
- Includes all sub-scores for transparency

### GET /score/history

**Authentication**: Required
**URL**: `/score/history?from=2024-01-01&to=2024-01-31&limit=30`

**Query Parameters:**
- `from` (optional): ISO datetime string (start date)
- `to` (optional): ISO datetime string (end date)
- `limit` (optional): Number of records (default: 30)

**Response Format:**
```json
{
  "status": "success",
  "data": {
    "user_id": "uuid",
    "points": [
      {
        "timestamp": "2024-01-10T02:00:00Z",
        "total_score": 750
      },
      {
        "timestamp": "2024-01-09T02:00:00Z",
        "total_score": 725
      }
    ]
  }
}
```

**Features:**
- Date range filtering
- Returns historical snapshots
- Useful for trend visualization

---

## Testing Examples

### 1. Create Events
```bash
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "ENG.MISSION_COMPLETED",
    "category": "engagement",
    "properties": {
      "mission_id": "daily-login"
    }
  }'
```

### 2. Get Current Score
```bash
curl http://localhost:3000/score \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Score History
```bash
curl "http://localhost:3000/score/history?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Run Daily Scoring Job (Programmatic)
```typescript
import { scoringJob } from './src/jobs/scoringJob';

await scoringJob.runForAllUsers();
```

---

## Key Design Decisions

1. **On-Demand Score Computation**: If a user hasn't been scored yet, GET /score computes it automatically
2. **Historical Tracking**: ScoreHistory table maintains daily snapshots for trend analysis
3. **System Events**: Score recalculations create audit trail via SYSTEM events
4. **Graceful Degradation**: If feature data is incomplete, reasonable defaults are used
5. **Performance Optimization**: Daily job only processes users with recent activity

---

## Database Migration Required

Before using the new implementation:

```bash
npm run prisma:generate
npm run prisma:migrate
```

This will update the database schema to include:
- Enhanced Event model with category, properties, deviceId, riskScore
- New Features model with all computed fields
- Updated Score model (userId as primary key)
- New ScoreHistory model for tracking

---

## Next Steps

1. Run database migrations
2. Test event creation with different categories
3. Create sample events for a test user
4. Verify score calculation
5. Check score history tracking
6. Set up daily cron job for production

---

## Files Modified/Created

### Created:
- `src/modules/score/featureComputation.service.ts` - Feature aggregation logic
- `src/modules/score/scoringEngine.service.ts` - Scoring formula and driver generation
- `IMPLEMENTATION_DETAILS.md` - This documentation

### Modified:
- `prisma/schema.prisma` - Enhanced Event, Features, Score models
- `src/modules/events/events.service.ts` - Full event ledger implementation
- `src/modules/events/events.controller.ts` - Updated controller
- `src/modules/events/events.validation.ts` - New validation schema
- `src/modules/score/score.service.ts` - Integration with new services
- `src/modules/score/score.controller.ts` - Enhanced endpoints
- `src/jobs/scoringJob.ts` - Updated to use new services

All changes maintain backward compatibility where possible and follow TypeScript best practices.
