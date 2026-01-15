# Project Structure Overview

## Created Files and Directories

### Configuration Files
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Jest testing configuration
- `package.json` - Updated with all dependencies
- `.env` - Environment variables (configured for Supabase)

### Prisma
- `prisma/schema.prisma` - Complete database schema with 9 tables
- `prisma/seed.ts` - Seed data for missions and rewards

### Source Code Structure

#### Config (`src/config/`)
- `database.ts` - Prisma client initialization
- `env.ts` - Environment variable management (typed)
- `logger.ts` - Winston logger configuration

#### Middleware (`src/middleware/`)
- `auth.ts` - JWT authentication middleware
- `errorHandler.ts` - Global error handling
- `validate.ts` - Zod validation middleware

#### Utils (`src/utils/`)
- `errors.ts` - Custom error classes (AppError, ValidationError, etc.)

#### Modules (`src/modules/`)

**Auth Module** (`src/modules/auth/`)
- `auth.service.ts` - User registration, login, JWT generation
- `auth.controller.ts` - Auth endpoints controller
- `auth.routes.ts` - Auth routes (register, login, me)
- `auth.validation.ts` - Zod schemas for validation
- `auth.service.test.ts` - Test stubs

**Events Module** (`src/modules/events/`)
- `events.service.ts` - Event creation and retrieval
- `events.controller.ts` - Events endpoints controller
- `events.routes.ts` - Events routes (POST /events)
- `events.validation.ts` - Zod schemas
- `events.service.test.ts` - Test stubs

**Score Module** (`src/modules/score/`)
- `score.service.ts` - Score retrieval and calculation stub
- `score.controller.ts` - Score endpoints controller
- `score.routes.ts` - Score routes (GET /score, /score/history)

**Missions Module** (`src/modules/missions/`)
- `missions.service.ts` - Mission assignment and completion
- `missions.controller.ts` - Missions endpoints controller
- `missions.routes.ts` - Missions routes (GET /active, POST /complete)
- `missions.validation.ts` - Zod schemas

**Rewards Module** (`src/modules/rewards/`)
- `rewards.service.ts` - Reward catalog and redemption
- `rewards.controller.ts` - Rewards endpoints controller
- `rewards.routes.ts` - Rewards routes (GET /available, POST /redeem)
- `rewards.validation.ts` - Zod schemas

**Wallet Module** (`src/modules/wallet/`)
- `wallet.service.ts` - Wallet balance and transactions
- `wallet.controller.ts` - Wallet endpoints controller
- `wallet.routes.ts` - Wallet routes (GET /wallet)

**Risk Module** (`src/modules/risk/`)
- `risk.service.ts` - Risk profiling and flagging
- `risk.controller.ts` - Risk endpoints controller
- `risk.routes.ts` - Risk routes (GET /profile/:userId, POST /flag)

#### Background Jobs (`src/jobs/`)
- `scoringJob.ts` - Daily scoring calculation with full implementation
- `missionAssignmentJob.ts` - Mission assignment and expiration
- `scheduler.ts` - BullMQ job scheduler setup
- `scoringJob.test.ts` - Test stubs

#### Application Files
- `src/app.ts` - Express app setup with all routes
- `src/index.ts` - Server entry point with graceful shutdown

## Key Features Implemented

### 1. Complete Database Schema
- 9 tables with proper relationships
- Foreign keys and indexes
- JSON fields for flexible data

### 2. Authentication System
- JWT-based authentication
- Password hashing with bcrypt
- User registration and login

### 3. Event Tracking
- Event creation endpoint
- Event retrieval by user and date range

### 4. Scoring Engine
- Feature computation (streaks, diversity, activity)
- Sub-score calculation:
  - Consistency (0-300)
  - Capacity (0-250)
  - Integrity (0-250)
  - Engagement Quality (0-200)
- Driver generation
- Next actions recommendations
- Risk profile integration

### 5. Missions System
- Daily and weekly missions
- Mission assignment
- Mission completion tracking
- Automatic expiration

### 6. Rewards System
- Reward catalog
- Points-based redemption
- Balance checking

### 7. Wallet System
- Transaction ledger
- Balance calculation
- Point credits and debits

### 8. Risk Engine
- Risk profiling
- User flagging
- Risk state management (ok, watch, shadow)
- Velocity checking

### 9. Background Jobs
- Daily scoring (2 AM)
- Daily mission assignment (midnight)
- Weekly mission assignment (Mondays)
- Configurable with BullMQ

### 10. Validation & Error Handling
- Zod schemas for input validation
- Custom error classes
- Global error handler
- Proper HTTP status codes

## API Endpoints Summary

### Public
- POST /auth/register
- POST /auth/login
- GET /health

### Authenticated
- GET /auth/me
- POST /events
- GET /score
- GET /score/history
- GET /missions/active
- POST /missions/complete
- GET /rewards/available
- POST /rewards/redeem
- GET /wallet

### Internal
- GET /internal/risk/profile/:userId
- POST /internal/risk/flag

## Next Steps

1. Set up Supabase database migrations
2. Run seed script
3. Start Redis for background jobs
4. Test all endpoints
5. Implement full business logic
6. Add comprehensive tests
7. Add API documentation (Swagger)
8. Set up CI/CD pipeline
