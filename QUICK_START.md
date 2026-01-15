# Quick Start Guide

## Prerequisites
- Node.js 18+
- PostgreSQL (Supabase configured)
- Redis (for background jobs - optional for initial testing)

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npm run prisma:generate
```

### 3. Run Database Migrations
```bash
npm run prisma:migrate
```

This will create all tables in your Supabase PostgreSQL database.

### 4. Seed the Database
```bash
npm run prisma:seed
```

This will populate:
- 5 missions (3 daily, 2 weekly)
- 6 rewards (gift cards, badges, boosts, VIP access)

### 5. Start Development Server
```bash
npm run dev
```

Server will start at `http://localhost:3000`

## Testing the API

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Save the returned `token` for authenticated requests.

### 3. Create an Event
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "eventType": "login",
    "eventData": {
      "source": "web",
      "timestamp": "2024-01-10T10:00:00Z"
    }
  }'
```

### 4. Get Current User
```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Get Active Missions
```bash
curl http://localhost:3000/missions/active \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Get Available Rewards
```bash
curl http://localhost:3000/rewards/available \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 7. Get Wallet Balance
```bash
curl http://localhost:3000/wallet \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Running Background Jobs

### Option 1: Manual Trigger (for testing)
You can manually run the scoring job:

```typescript
import { scoringJob } from './src/jobs/scoringJob';

// Calculate score for specific user
await scoringJob.calculateScoreForUser(userId);

// Or run for all users
await scoringJob.runForAllUsers();
```

### Option 2: Set Up Redis & BullMQ (for production)
1. Install and start Redis locally
2. The scheduler will automatically run jobs at:
   - Daily scoring: 2:00 AM
   - Daily missions: 12:00 AM
   - Weekly missions: 12:00 AM on Mondays

To enable scheduler, uncomment in `src/index.ts`:
```typescript
import { setupJobScheduler } from './jobs/scheduler';

// In startServer function:
setupJobScheduler();
```

## Running Tests
```bash
npm test
```

Note: Test implementations need to be completed (currently stubs).

## Build for Production
```bash
npm run build
npm start
```

## Project Structure
See `PROJECT_STRUCTURE.md` for detailed information about:
- File organization
- Module architecture
- Database schema
- API endpoints
- Scoring system details

## Common Tasks

### Add a New Endpoint
1. Add method to service (`src/modules/[module]/[module].service.ts`)
2. Add controller method (`src/modules/[module]/[module].controller.ts`)
3. Add route (`src/modules/[module]/[module].routes.ts`)
4. Add validation schema if needed (`src/modules/[module]/[module].validation.ts`)

### Modify Database Schema
1. Edit `prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Update affected services

### Add New Mission Type
1. Add mission definition to `prisma/seed.ts`
2. Run `npm run prisma:seed`
3. Update mission completion logic in `missions.service.ts`

### Add New Reward
1. Add reward definition to `prisma/seed.ts`
2. Run `npm run prisma:seed`
3. Update redemption logic if needed in `rewards.service.ts`

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL in `.env`
- Check Supabase instance is running
- Run `npm run prisma:generate` after schema changes

### Authentication Errors
- Ensure JWT_SECRET is set in `.env`
- Check token expiration (default 7 days)
- Verify Authorization header format: `Bearer <token>`

### Build Errors
- Clear `dist/` and rebuild: `rm -rf dist && npm run build`
- Regenerate Prisma client: `npm run prisma:generate`
- Check TypeScript version compatibility

## Environment Variables

Required in `.env`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
REDIS_HOST=localhost
REDIS_PORT=6379
```

## API Documentation

For full API documentation, see `README.md` which includes:
- Complete endpoint list
- Request/response examples
- Authentication requirements
- Error codes and messages

## Next Steps

1. Implement full business logic in service stubs
2. Add comprehensive test coverage
3. Set up API documentation (Swagger/OpenAPI)
4. Add rate limiting and security headers
5. Set up monitoring and logging
6. Deploy to production environment
