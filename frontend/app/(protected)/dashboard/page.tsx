'use client';

import { useScore, useScoreHistory, useWallet } from '@/app/hooks/useScore';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { CardSkeleton } from '@/app/components/LoadingSkeleton';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: scoreData, isLoading: isLoadingScore } = useScore();
  const { data: historyData, isLoading: isLoadingHistory } = useScoreHistory();
  const { data: walletData, isLoading: isLoadingWallet } = useWallet();

  if (isLoadingScore || isLoadingHistory || isLoadingWallet) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const score = scoreData;
  const wallet = walletData;
  const history = historyData?.history || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Reliability Score</CardTitle>
            <p className="text-sm text-slate-500">
              Last updated {formatDistanceToNow(new Date(score?.last_updated || new Date()))} ago
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="text-6xl font-bold text-indigo-600">
                  {score?.total_score || 0}
                </div>
                <div className="text-sm text-slate-500 text-center mt-1">out of 1000</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-slate-700">Consistency</div>
                <div className="mt-1 flex items-center">
                  <div className="flex-1 bg-slate-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${((score?.sub_scores.consistency || 0) / 300) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{score?.sub_scores.consistency || 0}/300</span>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700">Capacity</div>
                <div className="mt-1 flex items-center">
                  <div className="flex-1 bg-slate-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${((score?.sub_scores.capacity || 0) / 250) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{score?.sub_scores.capacity || 0}/250</span>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700">Integrity</div>
                <div className="mt-1 flex items-center">
                  <div className="flex-1 bg-slate-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${((score?.sub_scores.integrity || 0) / 250) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{score?.sub_scores.integrity || 0}/250</span>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700">Engagement</div>
                <div className="mt-1 flex items-center">
                  <div className="flex-1 bg-slate-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${((score?.sub_scores.engagement_quality || 0) / 200) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{score?.sub_scores.engagement_quality || 0}/200</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600">
                {wallet?.balance.points || 0}
              </div>
              <div className="text-sm text-slate-500 mt-1">Points Available</div>
            </div>
            <Link
              href="/rewards"
              className="mt-4 block w-full text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg font-medium transition-colors"
            >
              Redeem Rewards
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-green-700 mb-2">Strengths</h4>
                <div className="space-y-2">
                  {score?.drivers.positive.map((driver, index) => (
                    <div key={index} className="flex items-start text-sm text-slate-700">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{driver}</span>
                    </div>
                  ))}
                  {score?.drivers.positive.length === 0 && (
                    <p className="text-sm text-slate-500">No positive drivers yet</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-amber-700 mb-2">Areas to Improve</h4>
                <div className="space-y-2">
                  {score?.drivers.negative.map((driver, index) => (
                    <div key={index} className="flex items-start text-sm text-slate-700">
                      <span className="text-amber-500 mr-2">⚠</span>
                      <span>{driver}</span>
                    </div>
                  ))}
                  {score?.drivers.negative.length === 0 && (
                    <p className="text-sm text-slate-500">Everything looks good!</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {score?.next_recommended_actions.map((action, index) => (
                <div key={index} className="flex items-start p-3 bg-indigo-50 rounded-lg">
                  <span className="text-indigo-600 mr-2">→</span>
                  <span className="text-sm text-slate-700">{action}</span>
                </div>
              ))}
              {score?.next_recommended_actions.length === 0 && (
                <p className="text-sm text-slate-500">No recommended actions at this time</p>
              )}
            </div>
            <Link
              href="/missions"
              className="mt-4 block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              View Missions
            </Link>
          </CardContent>
        </Card>
      </div>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Score History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Total Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Consistency
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Integrity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Engagement
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {history.slice(0, 10).map((entry) => (
                    <tr key={entry.score_id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                        {new Date(entry.computed_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-900">
                        {entry.total_score}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                        {entry.sub_scores.consistency}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                        {entry.sub_scores.capacity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                        {entry.sub_scores.integrity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                        {entry.sub_scores.engagement_quality}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
