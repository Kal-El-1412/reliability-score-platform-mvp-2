# Testing Guide - Reliability Score Platform

This guide provides comprehensive examples for testing the Event Ledger, Feature Aggregation, and Scoring Engine V2 implementation.

## Setup

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Register a test user and get token:**
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testuser@example.com",
       "password": "testpassword123",
       "firstName": "Test",
       "lastName": "User"
     }'
   ```

   Save the returned `token` for subsequent requests.

## Test Scenario 1: New User Journey

### Step 1: Create Initial Events

```bash
# Login event
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "USER.LOGIN",
    "category": "behavior",
    "properties": {
      "source": "web",
      "browser": "Chrome"
    }
  }'

# Profile update
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "USER.PROFILE_UPDATED",
    "category": "behavior",
    "properties": {
      "fields_updated": ["firstName", "lastName"]
    }
  }'

# Mission started
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "ENG.MISSION_STARTED",
    "category": "engagement",
    "properties": {
      "mission_id": "daily-login",
      "mission_name": "Daily Login"
    }
  }'

# Mission completed
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "ENG.MISSION_COMPLETED",
    "category": "engagement",
    "properties": {
      "mission_id": "daily-login",
      "points_earned": 10
    }
  }'
```

### Step 2: Check Score (Auto-Computed)

```bash
curl http://localhost:3000/score \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "user_id": "...",
    "total_score": 75,
    "sub_scores": {
      "consistency": 30,
      "capacity": 25,
      "integrity": 15,
      "engagement_quality": 25
    },
    "drivers": {
      "positive": [],
      "negative": [
        "No current activity streak",
        "Low activity in last 30 days"
      ]
    },
    "next_recommended_actions": [
      "Build a daily activity streak by logging in for 3+ consecutive days",
      "Try different types of activities to increase engagement diversity",
      "Increase daily engagement by being active on more days"
    ]
  }
}
```

## Test Scenario 2: Building a Streak

Create events for consecutive days to build a streak:

```bash
# Day 1
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "USER.DAILY_CHECKIN",
    "category": "engagement",
    "timestamp": "2024-01-01T10:00:00Z",
    "properties": {}
  }'

# Day 2
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "USER.DAILY_CHECKIN",
    "category": "engagement",
    "timestamp": "2024-01-02T10:00:00Z",
    "properties": {}
  }'

# Day 3
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "USER.DAILY_CHECKIN",
    "category": "engagement",
    "timestamp": "2024-01-03T10:00:00Z",
    "properties": {}
  }'

# Day 4
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "USER.DAILY_CHECKIN",
    "category": "engagement",
    "timestamp": "2024-01-04T10:00:00Z",
    "properties": {}
  }'

# Day 5
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "USER.DAILY_CHECKIN",
    "category": "engagement",
    "timestamp": "2024-01-05T10:00:00Z",
    "properties": {}
  }'
```

After these events, check the score again. You should now see:
- Higher consistency score (due to 5-day streak)
- Positive driver: "Strong streak of 5 days"

## Test Scenario 3: Event Diversity

Create different event types to increase diversity:

```bash
# Transaction event
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "TXN.PAYMENT_INITIATED",
    "category": "transaction",
    "properties": {
      "amount": 50.00,
      "currency": "USD"
    }
  }'

# Another engagement event
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "ENG.CONTENT_VIEWED",
    "category": "engagement",
    "properties": {
      "content_id": "article-123",
      "duration_seconds": 120
    }
  }'

# Social engagement
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "ENG.SHARED_CONTENT",
    "category": "engagement",
    "properties": {
      "platform": "twitter",
      "content_id": "article-123"
    }
  }'

# Feedback event
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "USER.FEEDBACK_SUBMITTED",
    "category": "behavior",
    "properties": {
      "rating": 5,
      "comment": "Great platform!"
    }
  }'
```

Now your diversity index should be higher, increasing the engagement quality score.

## Test Scenario 4: Risk Events (Negative Impact)

```bash
# Dispute event
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "TXN.DISPUTE",
    "category": "transaction",
    "properties": {
      "transaction_id": "txn-123",
      "reason": "Item not received"
    }
  }'

# Risk flag
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "RISK.VELOCITY_SPIKE",
    "category": "risk",
    "properties": {
      "event_count": 50,
      "time_window_seconds": 60
    }
  }'
```

After these events, check the score:
- Integrity score should decrease
- Negative drivers will appear about disputes and risk flags

## Test Scenario 5: Score History Tracking

```bash
# Get score history
curl "http://localhost:3000/score/history?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "user_id": "...",
    "points": [
      {
        "timestamp": "2024-01-10T02:00:00Z",
        "total_score": 450
      },
      {
        "timestamp": "2024-01-09T02:00:00Z",
        "total_score": 425
      },
      {
        "timestamp": "2024-01-08T02:00:00Z",
        "total_score": 400
      }
    ]
  }
}
```

## Test Scenario 6: Programmatic Score Calculation

You can also trigger score calculation programmatically:

```typescript
import { scoringJob } from './src/jobs/scoringJob';

// Calculate for specific user
await scoringJob.calculateScoreForUser('user-id-here');

// Or run for all users
await scoringJob.runForAllUsers();
```

## Feature Computation Test Cases

### Test Case 1: Streak Calculation

**Scenario:** User active on consecutive days
**Events:**
- Day 1: 1 event
- Day 2: 2 events
- Day 3: 1 event
- Day 5: 1 event (gap on day 4)
- Day 6: 1 event

**Expected Features:**
- `streakDays`: 2 (only days 5 and 6 are consecutive ending today)
- `activeDays30d`: 5

### Test Case 2: Diversity Calculation

**Scenario:** Multiple event types
**Events:**
- USER.LOGIN (x3)
- ENG.MISSION_COMPLETED (x2)
- TXN.PAYMENT_INITIATED (x1)
- ENG.CONTENT_VIEWED (x5)
- SYSTEM.SCORE_RECALCULATED (x1) - should not count

**Expected Features:**
- `diversityIndex90d`: 4 (system events excluded)

### Test Case 3: Inactivity Calculation

**Scenario:** Last event was 15 days ago
**Expected Features:**
- `inactivityWeeks`: 2 (ceil((15 - 7) / 7))
- Penalty: 20 points (2 × 10)

### Test Case 4: Clean History Bonus

**Scenario:** User with perfect record
**Events:** No disputes, reversals, or risk flags in 90 days
**Expected:**
- `integrityScore`: baseIntegrity + 30 (clean history bonus)

## Validation Tests

### Test Invalid Event Category

```bash
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "USER.LOGIN",
    "category": "invalid_category",
    "properties": {}
  }'
```

**Expected:** 400 error with message about valid categories

### Test Missing Required Fields

```bash
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "",
    "category": "behavior"
  }'
```

**Expected:** 400 error about event type being required

## Performance Tests

### Load Test: Multiple Events

Create 50 events rapidly:

```bash
for i in {1..50}; do
  curl -X POST http://localhost:3000/events \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"eventType\": \"USER.ACTION_$i\",
      \"category\": \"behavior\",
      \"properties\": {\"action_number\": $i}
    }" &
done
wait
```

Then check score computation time.

## Expected Score Ranges

Based on activity patterns:

| Activity Level | Expected Total Score | Characteristics |
|---------------|---------------------|-----------------|
| New User | 50-150 | Low tenure, minimal activity |
| Casual User | 200-400 | Occasional login, some diversity |
| Regular User | 400-700 | Daily activity, good streak, diverse events |
| Power User | 700-900 | Long streak, high diversity, clean record |
| Elite User | 900-1000 | Perfect record, maximum engagement |

## Debugging Tips

1. **Check logs** for feature computation details:
   ```bash
   # In development, logs show:
   # - Features computed for user
   # - Individual sub-scores
   # - Drivers generated
   ```

2. **Query database directly** to inspect features:
   ```sql
   SELECT * FROM features WHERE user_id = 'your-user-id';
   ```

3. **Verify event creation**:
   ```sql
   SELECT event_type, category, timestamp
   FROM events
   WHERE user_id = 'your-user-id'
   ORDER BY timestamp DESC
   LIMIT 20;
   ```

4. **Check score history**:
   ```sql
   SELECT timestamp, total_score
   FROM score_history
   WHERE user_id = 'your-user-id'
   ORDER BY timestamp DESC;
   ```

## Common Issues

### Issue: Score is 0
**Cause:** No events in last 90 days
**Solution:** Create some recent events

### Issue: Streak not calculating correctly
**Cause:** Events not on consecutive days or timezone issues
**Solution:** Ensure events have proper timestamps

### Issue: Diversity index is 0
**Cause:** All events are system events or only one event type
**Solution:** Create events with different eventType values

### Issue: Integrity score very low
**Cause:** Multiple disputes/risk flags
**Solution:** This is expected behavior; avoid creating negative events

## Next Steps

After testing:
1. Set up daily cron job for production scoring
2. Monitor score distribution across users
3. Adjust scoring weights if needed
4. Add custom event types for your business domain
5. Create dashboard visualizations for score trends
