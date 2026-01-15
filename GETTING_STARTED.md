# Getting Started - Reliability Score Platform

Complete guide to running both the backend and frontend of the Reliability Score Platform.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database (via Supabase or local)
- Redis server (for background jobs)
- npm or yarn

## Project Structure

```
reliability-score-platform/
├── backend/               # Node.js + Express backend
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── .env
└── frontend/              # Next.js frontend
    ├── app/
    ├── package.json
    └── .env.local
```

## Step 1: Backend Setup

### 1.1 Install Dependencies

```bash
# From project root
npm install
```

### 1.2 Configure Environment

The `.env` file should already contain your database connection details:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=4000
```

### 1.3 Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
```

### 1.4 Start Backend

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Backend will run on http://localhost:4000

## Step 2: Frontend Setup

### 2.1 Navigate to Frontend

```bash
cd frontend
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Configure Environment

The `.env.local` file should already exist:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/v1
```

### 2.4 Start Frontend

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Frontend will run on http://localhost:3000

## Step 3: Test the Application

### 3.1 Register a New User

1. Open http://localhost:3000 in your browser
2. You'll be redirected to http://localhost:3000/login
3. Click "Sign up" to go to registration
4. Enter:
   - Email: test@example.com
   - Password: password123
   - Phone: (optional)
5. Click "Create Account"
6. You'll be automatically logged in and redirected to the dashboard

### 3.2 Explore the Dashboard

The dashboard displays:
- Your reliability score (initially 0 as a new user)
- Sub-scores breakdown
- Wallet balance (0 points initially)
- Performance insights
- Recommended actions

### 3.3 Complete Missions

1. Click "Missions" in the navigation
2. View available daily and weekly missions
3. Complete missions by clicking "Complete Mission" when progress reaches the target
4. Earn points added to your wallet
5. Watch your score improve

### 3.4 Redeem Rewards

1. Click "Rewards" in the navigation
2. View your wallet balance
3. Browse available rewards
4. Click "Redeem Now" on any reward you can afford
5. Copy the voucher code from the modal

## API Endpoints Reference

### Authentication
- `POST /v1/auth/register` - Create account
- `POST /v1/auth/login` - Sign in
- `GET /v1/user/me` - Get current user

### Score
- `GET /v1/score` - Get current score with insights
- `GET /v1/score/history` - Get score history

### Missions
- `GET /v1/missions/active` - Get active missions
- `POST /v1/missions/complete` - Complete a mission

### Wallet & Rewards
- `GET /v1/wallet` - Get wallet balance and transactions
- `GET /v1/rewards/available` - Get available rewards
- `POST /v1/rewards/redeem` - Redeem a reward

### Risk (Internal)
- `POST /v1/internal/risk/flag` - Add risk flag to user
- `GET /v1/internal/risk/profile/:user_id` - Get risk profile

## Background Jobs

The backend runs automated jobs:

### Daily Jobs (2:00 AM)
- Score recalculation for active users
- Mission expiration
- Daily mission assignment

### Weekly Jobs (Monday 00:00)
- Weekly mission assignment

## Troubleshooting

### Backend Issues

**Database Connection Error**
```bash
# Check DATABASE_URL in .env
# Verify PostgreSQL is running
# Run migrations
npm run prisma:migrate
```

**Redis Connection Error**
```bash
# Check REDIS_HOST and REDIS_PORT in .env
# Verify Redis is running
redis-cli ping  # Should return PONG
```

**Port Already in Use**
```bash
# Change PORT in .env
# Or kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

### Frontend Issues

**API Connection Error**
- Verify backend is running on http://localhost:4000
- Check NEXT_PUBLIC_API_BASE_URL in .env.local
- Open browser console for detailed errors

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Module Not Found**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

### Making Changes

**Backend Changes:**
1. Edit files in `src/`
2. Server auto-restarts (with tsx watch)
3. Test endpoints with curl or Postman
4. Run tests: `npm test`

**Frontend Changes:**
1. Edit files in `app/`
2. Hot reload automatically updates browser
3. Check browser console for errors
4. TypeScript errors shown in terminal

### Database Changes

1. Edit `prisma/schema.prisma`
2. Create migration:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
3. Prisma client auto-regenerates
4. Restart backend

### Adding New API Endpoints

**Backend:**
1. Create route in `src/modules/[module]/[module].routes.ts`
2. Add controller method
3. Add service logic
4. Update validation schemas

**Frontend:**
1. Add TypeScript types in `app/lib/types.ts`
2. Add API method in `app/lib/apiClient.ts`
3. Create React Query hook in `app/hooks/`
4. Use hook in component

## Production Deployment

### Backend Deployment

1. Set environment variables:
   ```env
   NODE_ENV=production
   DATABASE_URL=your-production-db
   JWT_SECRET=strong-random-secret
   REDIS_HOST=your-redis-host
   ```

2. Build and run:
   ```bash
   npm run build
   npm start
   ```

### Frontend Deployment

1. Update `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/v1
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Deploy `.next` folder to hosting platform

### Recommended Platforms

**Backend:**
- Railway
- Render
- DigitalOcean App Platform
- AWS Elastic Beanstalk

**Frontend:**
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Cloudflare Pages

## Next Steps

1. **Customize the scoring formula** in `src/modules/score/scoringEngine.service.ts`
2. **Add more missions** via database seeds or admin panel
3. **Create custom rewards** from partner integrations
4. **Implement analytics** for user behavior tracking
5. **Add email notifications** for important events
6. **Set up monitoring** with services like Sentry
7. **Configure CI/CD** for automated deployments

## Support

For issues or questions:
1. Check the console logs (backend and frontend)
2. Review API responses in browser Network tab
3. Check database records with Prisma Studio: `npx prisma studio`
4. Review the implementation documentation in README files

## Summary

You now have a complete, full-stack application running:
- ✓ Backend API on port 4000
- ✓ Frontend UI on port 3000
- ✓ Database with seed data
- ✓ Background jobs for automation
- ✓ Authentication and authorization
- ✓ Score tracking and history
- ✓ Mission system
- ✓ Rewards and wallet

Happy coding!
