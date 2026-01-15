'use client';

import { useState } from 'react';
import { useMissions, useCompleteMission } from '@/app/hooks/useScore';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { CardSkeleton } from '@/app/components/LoadingSkeleton';
import { Toast } from '@/app/components/Toast';
import { formatDistanceToNow } from 'date-fns';
import type { Mission } from '@/app/lib/types';

export default function MissionsPage() {
  const { data: missionsData, isLoading } = useMissions();
  const completeMission = useCompleteMission();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleCompleteMission = async (missionId: string) => {
    try {
      await completeMission.mutateAsync({ mission_id: missionId });
      setToast({
        message: 'Mission completed successfully! Points added to your wallet.',
        type: 'success',
      });
    } catch (error: any) {
      setToast({
        message: error.message || 'Failed to complete mission. Please try again.',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Missions</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const missions = missionsData?.missions || [];
  const dailyMissions = missions.filter((m) => m.type === 'daily');
  const weeklyMissions = missions.filter((m) => m.type === 'weekly');

  const renderMissionCard = (mission: Mission) => {
    const progress = (mission.progress_count / mission.target_count) * 100;
    const isCompleted = mission.status === 'completed';
    const expiresIn = formatDistanceToNow(new Date(mission.active_to), { addSuffix: true });

    return (
      <Card key={mission.mission_id}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {mission.title}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  mission.type === 'daily'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {mission.type}
                </span>
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">{mission.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Progress</span>
                <span className="font-medium text-slate-900">
                  {mission.progress_count} / {mission.target_count}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-slate-600">Reward:</span>
                  <span className="ml-1 font-semibold text-indigo-600">
                    +{mission.reward_points} points
                  </span>
                </div>
                {mission.score_impact_hint > 0 && (
                  <div>
                    <span className="text-slate-600">Score:</span>
                    <span className="ml-1 font-semibold text-green-600">
                      ~+{mission.score_impact_hint}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Expires {expiresIn}
            </div>

            {isCompleted ? (
              <div className="w-full py-2 bg-green-50 text-green-700 text-center rounded-lg font-medium">
                ✓ Completed
              </div>
            ) : progress >= 100 ? (
              <Button
                onClick={() => handleCompleteMission(mission.mission_id)}
                className="w-full"
                isLoading={completeMission.isPending}
              >
                Complete Mission
              </Button>
            ) : (
              <Button
                variant="secondary"
                disabled
                className="w-full"
              >
                In Progress
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Your Missions</h1>
        <p className="text-slate-600 mt-2">
          Complete missions to earn points and improve your reliability score
        </p>
      </div>

      {missions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-slate-500">
              No active missions right now. Check back soon for new opportunities!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {dailyMissions.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Daily Missions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dailyMissions.map(renderMissionCard)}
              </div>
            </div>
          )}

          {weeklyMissions.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Weekly Missions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weeklyMissions.map(renderMissionCard)}
              </div>
            </div>
          )}
        </>
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
