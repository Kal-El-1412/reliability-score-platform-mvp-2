# Reliability Score Platform - Full Stack

A modular full-stack system for tracking user reliability scores based on events, missions, and behavior analytics.

## Architecture

This is a **monorepo** containing:

- **Backend (Express + Prisma)** - Located at root, runs on **PORT 4000**
- **Frontend (Next.js)** - Located in `/frontend`, runs on **PORT 3000**

### Development Commands

```bash
npm run dev              # Starts frontend on port 3000 (default for preview)
npm run dev:frontend     # Starts frontend only
npm run dev:backend      # Starts backend only on port 4000
npm run build            # Builds both frontend and backend
```

**Note**: The frontend connects to the backend via `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/v1`

## Environment Compatibility

### Stackblitz Support ✅

This project is configured to run in Stackblitz and other WASM-based environments:

- **Turbopack disabled** via `--no-turbo` flag in `frontend/package.json`
- Uses Webpack for broader compatibility
- See [STACKBLITZ_COMPATIBILITY.md](./STACKBLITZ_COMPATIBILITY.md) for details

**If you encounter WASM/Turbopack errors**, the project is already configured correctly - just restart the dev server.

## Documentation

- **[IMPLEMENTATION_DETAILS.md](./IMPLEMENTATION_DETAILS.md)** - Comprehensive technical documentation of the Event Ledger, Feature Aggregation, and Scoring Engine V2 implementation
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Step-by-step testing scenarios and examples
- **[QUICK_START.md](./QUICK_START.md)** - Quick setup and usage guide
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Detailed project structure overview

## Overview

This platform assigns users a Reliability Score (0-1000) based on user events and missions. Users earn rewards through missions, and behavior is tracked through an event ledger. Scoring runs once per day via background jobs.

### Fully Implemented Features

✅ **Event Ledger** - Immutable event tracking with 5 categories (behavior, transaction, engagement, risk, system)
✅ **Feature Aggregation** - Computes 12+ features from events (streaks, diversity, disputes, etc.)
✅ **Scoring Engine V2** - Complete scoring formula with 4 sub-scores and driver generation
✅ **Score API** - GET /score and GET /score/history endpoints with auto-computation
✅ **Daily Scoring Job** - Automated batch processing for all active users

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Jobs**: BullMQ + Redis
- **Validation**: Zod
- **Authentication**: JWT + bcrypt

## Project Structure

```
/src
  /config              # Configuration files (database, env, logger)
  /middleware          # Express middleware (auth, validation, error handling)
  /modules             # Feature modules
    /auth              # Authentication & user management
    /events            # Event logging
    /score             # Score calculation & retrieval
    /missions          # Mission management
    /rewards           # Rewards catalog
    /wallet            # User wallet & transactions
    /risk              # Risk profiling & flagging
  /jobs                # Background jobs
    scoringJob.ts      # Daily score calculation
    missionAssignmentJob.ts  # Mission assignment
    scheduler.ts       # Job scheduler setup
  /utils               # Utility functions & error classes
  app.ts               # Express app setup
  index.ts             # Server entry point

/prisma
  schema.prisma        # Database schema
  seed.ts              # Seed data for missions & rewards
```

## Database Schema

### Core Tables

- **users** - User accounts
- **events** - User activity event ledger
- **features** - Computed user features (streaks, diversity, etc.)
- **scores** - Historical score records
- **missions** - Available missions
- **user_missions** - User mission assignments
- **rewards** - Reward catalog
- **wallet_transactions** - User points ledger
- **risk_profile** - Risk assessment data

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (authenticated)

### Events

- `POST /events` - Create event (authenticated)

### Score

- `GET /score` - Get current score (authenticated)
- `GET /score/history` - Get score history (authenticated)

### Missions

- `GET /missions/active` - Get active missions (authenticated)
- `POST /missions/complete` - Complete mission (authenticated)

### Rewards

- `GET /rewards/available` - Get available rewards (authenticated)
- `POST /rewards/redeem` - Redeem reward (authenticated)

### Wallet

- `GET /wallet` - Get wallet balance & transactions (authenticated)

### Internal - Risk Management

- `GET /internal/risk/profile/:userId` - Get risk profile
- `POST /internal/risk/flag` - Flag user for risk

## Scoring System

### Score Components (Total: 0-1000)

1. **Consistency Score (0-300)** - Based on activity streaks and regular engagement
2. **Capacity Score (0-250)** - Based on volume of events and daily averages
3. **Integrity Score (0-250)** - Based on risk profile and flags
4. **Engagement Quality Score (0-200)** - Based on event diversity and quality

### Features Computed

- Activity days (last 90 days)
- Current streak
- Longest streak
- Event diversity
- Total events
- Average events per day
- Last activity date

### Score Drivers

The system generates personalized drivers explaining score changes:
- Positive factors (e.g., consistent activity, high diversity)
- Negative factors (e.g., low activity, risk flags)

### Next Actions

Personalized recommendations for improving score:
- Build daily activity streak
- Try different types of activities
- Increase daily engagement

## Background Jobs

### Daily Scoring Job (runs at 2:00 AM)

- Fetches last 90 days of events per user
- Computes features
- Calculates sub-scores
- Applies decay if inactive >7 days
- Generates drivers & recommendations

### Mission Assignment Job (runs daily at midnight)

- Assigns daily missions to all users
- Expires old missions
- Weekly missions assigned on Mondays

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update `.env` with your configuration (already configured for Supabase).

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

### 5. Seed Database

```bash
npm run prisma:seed
```

### 6. Start Development Server

```bash
npm run dev              # Starts frontend (Next.js) on port 3000
npm run dev:backend      # Starts backend (Express) on port 4000
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:4000`.

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

## Mission Types

### Daily Missions

- Daily Login - Log in once (+10 score, 5 points)
- Complete 5 Events - Complete 5 events (+20 score, 10 points)
- Event Diversity - Complete 3 different event types (+15 score, 8 points)

### Weekly Missions

- Weekly Streak - Maintain 7-day streak (+50 score, 25 points)
- Weekly Champion - Complete 50 events in a week (+100 score, 50 points)

## Reward Categories

- **Gift Cards** - $5, $10, $25 denominations
- **Badges** - Premium profile badges
- **Boosts** - Score boosts
- **Access** - VIP access periods

## Risk Engine

### Risk States

- **ok** - Normal operation
- **watch** - Minor flags detected
- **shadow** - Multiple flags, reduced integrity score

### Flag Types

- Velocity anomalies
- Device fingerprint mismatches
- Suspicious patterns

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are issued upon registration and login, valid for 7 days by default.

## Health Check

```
GET /health
```

Returns server status and timestamp.

## Next Steps

1. Implement full business logic in services
2. Add comprehensive tests
3. Set up Redis for background jobs
4. Add rate limiting
5. Implement additional mission types
6. Add admin endpoints
7. Set up monitoring and logging
8. Deploy to production

## Notes

- This is an MVP scaffold with basic implementations
- Full scoring logic is stubbed but functional
- Background jobs require Redis running locally
- All endpoints include error handling and validation
- Database uses Supabase PostgreSQL instance
