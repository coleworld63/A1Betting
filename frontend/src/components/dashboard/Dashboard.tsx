import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { predictionService } from '../../services/predictionService';
import useStore from '../../store/useStore';
import { UnifiedStrategyConfig } from '../strategy/UnifiedStrategyConfig';

const Dashboard: React.FC = () => {
  const { darkMode } = useStore();

  // Fetch recent predictions
  const { data: predictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => predictionService.getRecentPredictions(),
    staleTime: 30000,
  });

  // Fetch engine metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => predictionService.getEngineMetrics(),
    staleTime: 30000,
  });

  // Performance chart data
  const chartData = {
    labels: predictions?.map(p => new Date(p.timestamp).toLocaleTimeString()) || [],
    datasets: [
      {
        label: 'Prediction Accuracy',
        data: predictions?.map(p => p.prediction) || [],
        borderColor: '#5D5CDE',
        backgroundColor: 'rgba(93, 92, 222, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Confidence',
        data: predictions?.map(p => p.confidence) || [],
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <div className="flex space-x-4">
          <button className="modern-button">
            <i className="fas fa-sync-alt mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="modern-card p-6"
          initial={{ opacity: 0, y: 20 }}
        >
          <div className="text-sm text-gray-500">Total Predictions</div>
          <div className="text-3xl font-bold text-primary-500">
            {metrics?.total_predictions || 0}
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="modern-card p-6"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-sm text-gray-500">Average Accuracy</div>
          <div className="text-3xl font-bold text-primary-500">
            {metrics?.average_accuracy ? `${(metrics.average_accuracy * 100).toFixed(1)}%` : '0%'}
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="modern-card p-6"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-sm text-gray-500">Success Rate</div>
          <div className="text-3xl font-bold text-primary-500">
            {metrics?.success_rate ? `${(metrics.success_rate * 100).toFixed(1)}%` : '0%'}
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="modern-card p-6"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-sm text-gray-500">ROI</div>
          <div className="text-3xl font-bold text-primary-500">
            {metrics?.roi ? `${metrics.roi.toFixed(2)}%` : '0%'}
          </div>
        </motion.div>
      </div>

      {/* Performance Chart */}
      <div className="modern-card p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Predictions */}
      <div className="modern-card p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Predictions</h2>
        <div className="space-y-4">
          {predictions?.slice(0, 5).map(prediction => (
            <motion.div
              key={prediction.id}
              animate={{ opacity: 1, y: 0 }}
              className="premium-input-container p-4"
              initial={{ opacity: 0, y: 20 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-semibold">
                    Prediction: {(prediction.prediction * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(prediction.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    Confidence: {(prediction.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    Edge: {(prediction.marketEdge * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Strategy Compositor */}
      <div className="modern-card p-6">
        <h2 className="text-xl font-semibold mb-4">Strategy Compositor</h2>
        <UnifiedStrategyConfig />
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
