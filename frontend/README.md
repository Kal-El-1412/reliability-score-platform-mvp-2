# Reliability Score Platform - Frontend

A modern Next.js 14 frontend application for the Reliability Score Platform, built with TypeScript, Tailwind CSS, and React Query.

## Features

- Modern, responsive UI built with Tailwind CSS
- JWT-based authentication
- Real-time score tracking and visualization
- Mission management system
- Rewards and wallet system
- Protected routes
- Optimized data fetching with React Query

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **TanStack Query (React Query)** - Data fetching and caching
- **Axios** - HTTP client
- **date-fns** - Date formatting

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── (protected)/       # Protected routes
│   │   ├── dashboard/     # Dashboard with score and insights
│   │   ├── missions/      # Missions page
│   │   └── rewards/       # Rewards and wallet page
│   ├── components/        # Reusable UI components
│   ├── hooks/             # React Query hooks
│   ├── lib/               # Utilities and API client
│   │   ├── apiClient.ts   # Axios API client
│   │   └── types.ts       # TypeScript types
│   ├── providers/         # Context providers
│   │   ├── AuthContext.tsx
│   │   └── QueryProvider.tsx
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── .env.local             # Environment variables
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/v1
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on port 4000

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your backend URL
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Pages

### Authentication

- **/login** - User login with email/password
- **/register** - New user registration

### Protected Pages

- **/dashboard** - Main dashboard with:
  - Total reliability score (0-1000)
  - Sub-scores breakdown (Consistency, Capacity, Integrity, Engagement)
  - Performance insights (strengths and areas to improve)
  - Recommended next actions
  - Score history table
  - Wallet balance summary

- **/missions** - Missions management:
  - View active daily and weekly missions
  - Track mission progress
  - Complete missions to earn points
  - Real-time mission status updates

- **/rewards** - Rewards and wallet:
  - View wallet balance and transaction history
  - Browse available rewards
  - Redeem rewards with points
  - Receive voucher codes
  - Copy voucher codes to clipboard

## API Integration

The frontend connects to the backend API with the following endpoints:

### Auth
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /user/me` - Get current user

### Score
- `GET /score` - Get current score and insights
- `GET /score/history` - Get score history

### Missions
- `GET /missions/active` - Get active missions
- `POST /missions/complete` - Complete a mission

### Wallet & Rewards
- `GET /wallet` - Get wallet balance and transactions
- `GET /rewards/available` - Get available rewards
- `POST /rewards/redeem` - Redeem a reward

## Components

### Reusable UI Components

- **Card** - Container component with header, title, and content sections
- **Button** - Customizable button with variants (primary, secondary, danger) and loading states
- **LoadingSkeleton** - Loading placeholders
- **Toast** - Notification system for success/error messages
- **ProtectedRoute** - Route wrapper for authentication

### Context Providers

- **AuthContext** - Manages authentication state, login, register, and logout
- **QueryProvider** - Configures React Query for data fetching

### Custom Hooks

- **useScore()** - Fetch current score
- **useScoreHistory()** - Fetch score history
- **useMissions()** - Fetch active missions
- **useCompleteMission()** - Complete a mission
- **useWallet()** - Fetch wallet data
- **useRewards()** - Fetch available rewards
- **useRedeemReward()** - Redeem a reward

## Styling

The app uses Tailwind CSS with a custom configuration:

- **Primary color**: Indigo (#4F46E5)
- **Background**: Slate shades
- **Responsive breakpoints**: Mobile-first design
- **Custom components**: Cards, buttons, inputs with consistent styling

## Security

- JWT tokens stored in localStorage
- Protected routes redirect to login if unauthenticated
- Automatic token refresh on page load
- Logout clears all local data

## Error Handling

- API errors caught and displayed via Toast notifications
- Loading states for all async operations
- Graceful fallbacks for missing data
- TypeScript ensures type safety

## Performance

- React Query caching reduces API calls
- Static page generation where possible
- Optimized images and assets
- Code splitting with Next.js App Router

## License

Private - For internal use only
