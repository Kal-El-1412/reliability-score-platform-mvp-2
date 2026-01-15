'use client';

import { useState } from 'react';
import { useWallet, useRewards, useRedeemReward } from '@/app/hooks/useScore';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { CardSkeleton } from '@/app/components/LoadingSkeleton';
import { Toast } from '@/app/components/Toast';
import { format } from 'date-fns';
import type { Reward, RedeemRewardResponse } from '@/app/lib/types';

export default function RewardsPage() {
  const { data: walletData, isLoading: isLoadingWallet } = useWallet();
  const { data: rewardsData, isLoading: isLoadingRewards } = useRewards();
  const redeemReward = useRedeemReward();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<RedeemRewardResponse | null>(null);

  const handleRedeemReward = async (rewardId: string) => {
    try {
      const result = await redeemReward.mutateAsync({ rewardId });
      setSelectedVoucher(result);
      setToast({
        message: 'Reward redeemed successfully!',
        type: 'success',
      });
    } catch (error: any) {
      setToast({
        message: error.message || 'Failed to redeem reward. Please try again.',
        type: 'error',
      });
    }
  };

  if (isLoadingWallet || isLoadingRewards) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Rewards</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <div className="lg:col-span-2">
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const wallet = walletData;
  const rewards = rewardsData?.rewards || [];
  const balance = wallet?.balance.points || 0;

  const renderRewardCard = (reward: Reward) => {
    const pointsNeeded = Math.max(0, reward.cost_points - balance);
    const canAfford = reward.eligible;

    return (
      <Card key={reward.reward_id}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>{reward.title}</CardTitle>
              {reward.partner_id && (
                <p className="text-xs text-slate-500 mt-1">Partner: {reward.partner_id}</p>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              reward.type === 'gift_card'
                ? 'bg-green-100 text-green-700'
                : reward.type === 'badge'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'
            }`}>
              {reward.type.replace('_', ' ')}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{reward.description}</p>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-indigo-600">
                  {reward.cost_points}
                </div>
                <div className="text-xs text-slate-500">points</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-slate-900">
                  {reward.value_display}
                </div>
                <div className="text-xs text-slate-500">value</div>
              </div>
            </div>

            {reward.terms_url && (
              <a
                href={reward.terms_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-700"
              >
                View Terms & Conditions →
              </a>
            )}

            <div className="text-xs text-slate-500">
              Valid until {format(new Date(reward.active_to), 'MMM d, yyyy')}
            </div>

            {canAfford ? (
              <Button
                onClick={() => handleRedeemReward(reward.reward_id)}
                className="w-full"
                isLoading={redeemReward.isPending}
              >
                Redeem Now
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  disabled
                  className="w-full"
                >
                  Need {pointsNeeded} more points
                </Button>
                <p className="text-xs text-center text-slate-500">
                  Complete missions to earn points
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Rewards</h1>
        <p className="text-slate-600 mt-2">
          Redeem your points for exclusive rewards and benefits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-indigo-600">
                  {balance}
                </div>
                <div className="text-sm text-slate-500 mt-1">Points Available</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wallet?.transactions.slice(0, 5).map((tx) => (
                  <div key={tx.transaction_id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium text-slate-900 capitalize">
                        {tx.type}
                      </div>
                      <div className="text-xs text-slate-500">
                        {format(new Date(tx.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </div>
                  </div>
                ))}
                {wallet?.transactions.length === 0 && (
                  <p className="text-sm text-slate-500">No transactions yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Available Rewards</h2>
          {rewards.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-500">
                  No rewards available at this time. Check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rewards.map(renderRewardCard)}
            </div>
          )}
        </div>
      </div>

      {selectedVoucher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Reward Redeemed!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <div className="text-sm text-slate-600 mb-2">Your Voucher Code</div>
                  <div className="text-2xl font-mono font-bold text-indigo-600 select-all">
                    {selectedVoucher.voucher.code}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Expires: {format(new Date(selectedVoucher.voucher.expires_at), 'MMM d, yyyy')}
                  </div>
                </div>

                <div className="text-sm text-slate-600">
                  <p className="font-medium mb-1">{selectedVoucher.reward.title}</p>
                  <p className="text-xs">Value: {selectedVoucher.reward.value_display}</p>
                  <p className="text-xs mt-2">Points deducted: {selectedVoucher.points_deducted}</p>
                </div>

                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedVoucher.voucher.code);
                    setToast({ message: 'Voucher code copied!', type: 'success' });
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  Copy Code
                </Button>

                <Button
                  onClick={() => setSelectedVoucher(null)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
