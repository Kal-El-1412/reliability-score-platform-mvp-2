export interface User {
  id: string;
  email: string;
  phone?: string | null;
  createdAt?: string;
}

export interface SubScores {
  consistency: number;
  capacity: number;
  integrity: number;
  engagement_quality: number;
}

export interface Drivers {
  positive: string[];
  negative: string[];
}

export interface ScoreResponse {
  user_id: string;
  total_score: number;
  sub_scores: SubScores;
  last_updated: string;
  drivers: Drivers;
  next_recommended_actions: string[];
}

export interface ScoreHistoryEntry {
  score_id: string;
  user_id: string;
  total_score: number;
  sub_scores: SubScores;
  computed_at: string;
}

export interface ScoreHistoryResponse {
  user_id: string;
  history: ScoreHistoryEntry[];
}

export interface Mission {
  mission_id: string;
  type: 'daily' | 'weekly';
  title: string;
  description: string;
  status: string;
  target_count: number;
  progress_count: number;
  reward_points: number;
  score_impact_hint: number;
  active_from: string;
  active_to: string;
}

export interface MissionsResponse {
  user_id: string;
  missions: Mission[];
}

export interface WalletTransaction {
  transaction_id: string;
  type: 'earn' | 'redeem' | 'adjustment';
  amount: number;
  currency: string;
  source: string;
  related_id?: string;
  created_at: string;
}

export interface WalletResponse {
  user_id: string;
  balance: {
    points: number;
  };
  transactions: WalletTransaction[];
}

export interface Reward {
  reward_id: string;
  title: string;
  description: string;
  type: string;
  partner_id?: string;
  cost_points: number;
  value_display: string;
  terms_url?: string;
  active_from: string;
  active_to: string;
  eligible: boolean;
}

export interface RewardsResponse {
  user_id: string;
  rewards: Reward[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CompleteMissionRequest {
  mission_id: string;
  proof_event_id?: string;
}

export interface RedeemRewardRequest {
  rewardId: string;
}

export interface RedeemRewardResponse {
  redemption_id: string;
  reward: {
    id: string;
    title: string;
    type: string;
    value_display: string;
  };
  voucher: {
    code: string;
    expires_at: string;
  };
  wallet_transaction_id: string;
  points_deducted: number;
}
