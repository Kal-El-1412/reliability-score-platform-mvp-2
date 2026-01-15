import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scoreApi, missionsApi, walletApi, rewardsApi } from '../lib/apiClient';
import type { CompleteMissionRequest, RedeemRewardRequest } from '../lib/types';

export function useScore() {
  return useQuery({
    queryKey: ['score'],
    queryFn: scoreApi.getScore,
  });
}

export function useScoreHistory() {
  return useQuery({
    queryKey: ['scoreHistory'],
    queryFn: scoreApi.getScoreHistory,
  });
}

export function useMissions() {
  return useQuery({
    queryKey: ['missions'],
    queryFn: missionsApi.getActiveMissions,
  });
}

export function useCompleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompleteMissionRequest) => missionsApi.completeMission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
    },
  });
}

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getWallet,
  });
}

export function useRewards() {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: rewardsApi.getAvailableRewards,
  });
}

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RedeemRewardRequest) => rewardsApi.redeemReward(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}
