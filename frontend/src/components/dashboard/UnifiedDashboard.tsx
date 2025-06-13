import React, { useState, useEffect, useCallback } from 'react';
// System health and feature flag indicators
import { ServiceStatusIndicators } from '../ui/ServiceStatusIndicators.js';
import { FeatureFlagIndicators } from '../ui/FeatureFlagIndicators.js';
import { UnifiedServiceRegistry } from '../../services/unified/UnifiedServiceRegistry.js';
import { UnifiedAnalyticsService } from '../../services/unified/UnifiedAnalyticsService.js';
import { UnifiedWebSocketService } from '../../services/unified/UnifiedWebSocketService.js';
import { UnifiedNotificationService } from '../../services/unified/UnifiedNotificationService.js';
import { UnifiedErrorService } from '../../services/unified/UnifiedErrorService.js';
import { Card, Button, Spinner, Badge, Toast } from '../ui/UnifiedUI.js';

interface DashboardMetrics {
  totalBets: number;
  activeBets: number;
  winRate: number;
  profitLoss: number;
  roi: number;
  bestStreak: number;
  currentStreak: number;
  averageOdds: number;
  averageStake: number;
  totalPredictions: number;
  predictionAccuracy: number;
  opportunities: number;
  timestamp: number;
}

interface RecentActivity {
  id: string;
  type: 'bet' | 'prediction' | 'opportunity';
  description: string;
  amount?: number;
  odds?: number;
  timestamp: number;
  status: 'success' | 'pending' | 'failed';
}

export const UnifiedDashboard: React.FC = () => {
  // Initialize services
  const serviceRegistry = UnifiedServiceRegistry.getInstance();
  const analyticsService = serviceRegistry.getService<UnifiedAnalyticsService>('analytics');

  const webSocketService = serviceRegistry.getService<UnifiedWebSocketService>('websocket');
  const notificationService =
    serviceRegistry.getService<UnifiedNotificationService>('notification');
  const errorService = serviceRegistry.getService<UnifiedErrorService>('error');

  // State
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  /**
   * Handles dashboard errors and displays a toast notification.
   */
  const handleError = useCallback((message: string, error: unknown) => {
    setError(message);
    setToast({ message, type: 'error' });
    errorService?.handleError(error, {
      code: 'DASHBOARD_ERROR',
      source: 'UnifiedDashboard',
      details: { message },
    });
  }, [errorService]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [metrics, activity] = await Promise.all([
        analyticsService?.getPerformanceMetrics(),
        analyticsService?.getRecentActivity(),
      ]);
      if (metrics) setMetrics(metrics);
      if (activity) setRecentActivity(activity);
    } catch (error) {
      handleError('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  }, [analyticsService, handleError]);

  const setupWebSocket = useCallback(() => {
    if (!webSocketService) return;
    webSocketService.connect();
    webSocketService.subscribe('activity', (data: unknown) => {
      // Validate data shape before casting
      if (
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        'type' in data &&
        'description' in data &&
        'timestamp' in data &&
        'status' in data
      ) {
        const activity = data as RecentActivity;
        setRecentActivity(prev => [activity, ...prev].slice(0, 10));
        notificationService?.notifyUser?.({
          type: 'info',
          message: 'New activity detected',
          data: activity,
        });
      }
    });
  }, [webSocketService, notificationService]);

  // Load data
  useEffect(() => {
    loadData();
    setupWebSocket();
    return () => {
      webSocketService?.disconnect();
    };
  }, [timeRange, loadData, setupWebSocket, webSocketService]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="primary" onClick={loadData}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* System Health & Feature Flags */}
      <ServiceStatusIndicators />
      <FeatureFlagIndicators />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            {(['day', 'week', 'month', 'year'] as const).map(range => (
              <Button
                key={range}
                variant={timeRange === range ? 'primary' : 'secondary'}
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
          <Button variant="primary" onClick={loadData}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Key Metrics */}
        <Card>
          <h3 className="text-lg font-semibold mb-2">Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Win Rate</span>
              <span className="font-medium">{metrics.winRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Profit/Loss</span>
              <span
                className={`font-medium ${metrics.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}
              >
                {metrics.profitLoss.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ROI</span>
              <span
                className={`font-medium ${metrics.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}
              >
                {metrics.roi.toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-2">Betting Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Bets</span>
              <span className="font-medium">{metrics.totalBets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Bets</span>
              <span className="font-medium">{metrics.activeBets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Odds</span>
              <span className="font-medium">{metrics.averageOdds.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-2">Predictions</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-medium">{metrics.totalPredictions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Accuracy</span>
              <span className="font-medium">{metrics.predictionAccuracy.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Opportunities</span>
              <span className="font-medium">{metrics.opportunities}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-2">Streaks</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Current</span>
              <Badge
                variant={
                  metrics.currentStreak > 0
                    ? 'success'
                    : metrics.currentStreak < 0
                      ? 'danger'
                      : 'info'
                }
              >
                {metrics.currentStreak}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Best</span>
              <Badge variant="success">{metrics.bestStreak}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Stake</span>
              <span className="font-medium">{metrics.averageStake.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map(activity => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center">
                {typeof activity.amount === 'number' && (
                  <span className="font-medium">{activity.amount.toFixed(2)}</span>
                )}
                {typeof activity.odds === 'number' && (
                  <span className="text-gray-600">@{activity.odds.toFixed(2)}</span>
                )}
                <span className="ml-2 text-gray-500 text-xs">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                {activity.amount && (
                  <span className="font-medium">{activity.amount.toFixed(2)}</span>
                )}
                {activity.odds && (
                  <span className="text-gray-600">@{activity.odds.toFixed(2)}</span>
                )}
                <Badge
                  variant={
                    activity.status === 'success'
                      ? 'success'
                      : activity.status === 'pending'
                        ? 'warning'
                        : 'danger'
                  }
                >
                  {activity.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
