import axios, { AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ScoreResponse,
  ScoreHistoryResponse,
  MissionsResponse,
  WalletResponse,
  RewardsResponse,
  CompleteMissionRequest,
  RedeemRewardRequest,
  RedeemRewardResponse,
  User,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    throw new ApiError(
      axiosError.response?.data?.message || axiosError.message,
      axiosError.response?.status,
      axiosError.response?.data
    );
  }
  throw error;
};

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<{ status: string; data: AuthResponse }>(
        '/auth/login',
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<{ status: string; data: AuthResponse }>(
        '/auth/register',
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getMe: async (): Promise<User> => {
    try {
      const response = await apiClient.get<{ status: string; data: { user: User } }>(
        '/user/me'
      );
      return response.data.data.user;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const scoreApi = {
  getScore: async (): Promise<ScoreResponse> => {
    try {
      const response = await apiClient.get<{ status: string; data: ScoreResponse }>(
        '/score'
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getScoreHistory: async (): Promise<ScoreHistoryResponse> => {
    try {
      const response = await apiClient.get<{ status: string; data: ScoreHistoryResponse }>(
        '/score/history'
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const missionsApi = {
  getActiveMissions: async (): Promise<MissionsResponse> => {
    try {
      const response = await apiClient.get<{ status: string; data: MissionsResponse }>(
        '/missions/active'
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  completeMission: async (data: CompleteMissionRequest): Promise<any> => {
    try {
      const response = await apiClient.post<{ status: string; data: any }>(
        '/missions/complete',
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const walletApi = {
  getWallet: async (): Promise<WalletResponse> => {
    try {
      const response = await apiClient.get<{ status: string; data: WalletResponse }>(
        '/wallet'
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const rewardsApi = {
  getAvailableRewards: async (): Promise<RewardsResponse> => {
    try {
      const response = await apiClient.get<{ status: string; data: RewardsResponse }>(
        '/rewards/available'
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  redeemReward: async (data: RedeemRewardRequest): Promise<RedeemRewardResponse> => {
    try {
      const response = await apiClient.post<{ status: string; data: RedeemRewardResponse }>(
        '/rewards/redeem',
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default apiClient;
