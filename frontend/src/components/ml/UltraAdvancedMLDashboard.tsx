import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  Brain,
  Target,
  Settings,
  RefreshCw,
} from "lucide-react";
import { Line, Bar, Scatter, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

interface UltraAccuracyMetrics {
  overall_accuracy: number;
  directional_accuracy: number;
  profit_correlation: number;
  prediction_confidence: number;
  model_agreement: number;
  uncertainty_quality: number;
  calibration_error: number;
  feature_drift_score: number;
  prediction_latency: number;
  models_active: number;
  predictions_count: number;
  accuracy_trend: number;
  performance_stability: number;
  optimization_score: number;
  timestamp: string;
}

interface ModelPerformance {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  mse: number;
  mae: number;
  r2_score: number;
  training_time: number;
  prediction_time: number;
  stability_score: number;
  feature_importance: Record<string, number>;
}

interface EnsembleConfiguration {
  strategy: string;
  models: string[];
  weights: Record<string, number>;
  performance_threshold: number;
  last_optimized: string;
}

interface AccuracyAlert {
  alert_id: string;
  metric_name: string;
  current_value: number;
  threshold_value: number;
  severity:
    | "critical"
    | "warning"
    | "acceptable"
    | "good"
    | "excellent"
    | "exceptional";
  message: string;
  recommendations: string[];
  timestamp: string;
  resolved: boolean;
}

export const UltraAdvancedMLDashboard: React.FC = () => {
  const [accuracyMetrics, setAccuracyMetrics] =
    useState<UltraAccuracyMetrics | null>(null);
  const [modelPerformances, setModelPerformances] = useState<
    ModelPerformance[]
  >([]);
  const [ensembleConfig, setEnsembleConfig] =
    useState<EnsembleConfiguration | null>(null);
  const [alerts, setAlerts] = useState<AccuracyAlert[]>([]);
  const [accuracyHistory, setAccuracyHistory] = useState<
    UltraAccuracyMetrics[]
  >([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("1h");
  const [selectedMetric, setSelectedMetric] = useState("overall_accuracy");
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Real-time data fetching
  const fetchAccuracyMetrics = useCallback(async () => {
    try {
      const response = await fetch("/api/v3/ultra-accuracy/current-metrics");
      if (response.ok) {
        const data = await response.json();
        setAccuracyMetrics(data);

        // Add to history for trend analysis
        setAccuracyHistory((prev) => [...prev.slice(-100), data]);
      }
    } catch (error) {
      console.error("Error fetching accuracy metrics:", error);
    }
  }, []);

  const fetchModelPerformances = useCallback(async () => {
    try {
      const response = await fetch("/api/v3/ultra-accuracy/model-performances");
      if (response.ok) {
        const data = await response.json();
        setModelPerformances(data);
      }
    } catch (error) {
      console.error("Error fetching model performances:", error);
    }
  }, []);

  const fetchEnsembleConfig = useCallback(async () => {
    try {
      const response = await fetch("/api/v3/ensemble/current-configuration");
      if (response.ok) {
        const data = await response.json();
        setEnsembleConfig(data);
      }
    } catch (error) {
      console.error("Error fetching ensemble configuration:", error);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch("/api/v3/accuracy-monitor/active-alerts");
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  }, []);

  // Trigger accuracy optimization
  const triggerOptimization = useCallback(
    async (strategy: string = "quantum_ensemble") => {
      setIsOptimizing(true);
      try {
        const response = await fetch("/api/v3/ultra-accuracy/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            strategy,
            target_accuracy: 0.95,
            optimization_method: "bayesian_optimization",
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Optimization completed:", result);
          // Refresh all data after optimization
          await Promise.all([
            fetchAccuracyMetrics(),
            fetchModelPerformances(),
            fetchEnsembleConfig(),
          ]);
        }
      } catch (error) {
        console.error("Error triggering optimization:", error);
      } finally {
        setIsOptimizing(false);
      }
    },
    [fetchAccuracyMetrics, fetchModelPerformances, fetchEnsembleConfig],
  );

  // Initialize and set up real-time updates
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchAccuracyMetrics(),
        fetchModelPerformances(),
        fetchEnsembleConfig(),
        fetchAlerts(),
      ]);
    };

    initializeData();

    // Set up real-time updates
    const interval = setInterval(() => {
      fetchAccuracyMetrics();
      fetchAlerts();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [
    fetchAccuracyMetrics,
    fetchModelPerformances,
    fetchEnsembleConfig,
    fetchAlerts,
    refreshInterval,
  ]);

  // Get accuracy level and color
  const getAccuracyLevel = (
    accuracy: number,
  ): { level: string; color: string; bgColor: string } => {
    if (accuracy >= 0.97)
      return {
        level: "EXCEPTIONAL",
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      };
    if (accuracy >= 0.92)
      return {
        level: "EXCELLENT",
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    if (accuracy >= 0.85)
      return { level: "GOOD", color: "text-blue-600", bgColor: "bg-blue-100" };
    if (accuracy >= 0.75)
      return {
        level: "ACCEPTABLE",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    if (accuracy >= 0.6)
      return {
        level: "WARNING",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      };
    return { level: "CRITICAL", color: "text-red-600", bgColor: "bg-red-100" };
  };

  // Chart configurations
  const accuracyTrendChartData = useMemo(() => {
    if (!accuracyHistory.length) return null;

    const labels = accuracyHistory.map((h) =>
      new Date(h.timestamp).toLocaleTimeString(),
    );

    return {
      labels,
      datasets: [
        {
          label: "Overall Accuracy",
          data: accuracyHistory.map((h) => h.overall_accuracy * 100),
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          tension: 0.1,
          fill: true,
        },
        {
          label: "Directional Accuracy",
          data: accuracyHistory.map((h) => h.directional_accuracy * 100),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.1,
          fill: false,
        },
        {
          label: "Model Agreement",
          data: accuracyHistory.map((h) => h.model_agreement * 100),
          borderColor: "rgb(168, 85, 247)",
          backgroundColor: "rgba(168, 85, 247, 0.1)",
          tension: 0.1,
          fill: false,
        },
      ],
    };
  }, [accuracyHistory]);

  const modelPerformanceChartData = useMemo(() => {
    if (!modelPerformances.length) return null;

    return {
      labels: modelPerformances.map((m) => m.model_name),
      datasets: [
        {
          label: "R² Score",
          data: modelPerformances.map((m) => m.r2_score * 100),
          backgroundColor: "rgba(99, 102, 241, 0.8)",
        },
        {
          label: "Stability Score",
          data: modelPerformances.map((m) => m.stability_score * 100),
          backgroundColor: "rgba(34, 197, 94, 0.8)",
        },
      ],
    };
  }, [modelPerformances]);

  const ensembleWeightsChartData = useMemo(() => {
    if (!ensembleConfig?.weights) return null;

    const labels = Object.keys(ensembleConfig.weights);
    const data = Object.values(ensembleConfig.weights);
    const colors = [
      "#8B5CF6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#3B82F6",
      "#EC4899",
      "#6366F1",
      "#84CC16",
      "#F97316",
      "#06B6D4",
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    };
  }, [ensembleConfig]);

  if (!accuracyMetrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">
            Loading Ultra-Advanced ML Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const accuracyLevel = getAccuracyLevel(accuracyMetrics.overall_accuracy);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Ultra-Advanced ML Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time prediction accuracy monitoring and optimization
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => triggerOptimization("quantum_ensemble")}
            disabled={isOptimizing}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isOptimizing ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {isOptimizing ? "Optimizing..." : "Quantum Optimize"}
          </Button>
          <Button
            onClick={() =>
              Promise.all([
                fetchAccuracyMetrics(),
                fetchModelPerformances(),
                fetchEnsembleConfig(),
              ])
            }
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-red-700">
              <AlertCircle className="w-5 h-5 mr-2" />
              Active Accuracy Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.alert_id}
                  className="bg-white p-3 rounded-lg border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Current: {alert.current_value.toFixed(3)} | Threshold:{" "}
                    {alert.threshold_value.toFixed(3)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Accuracy */}
        <Card
          className={`border-l-4 border-l-purple-500 ${accuracyLevel.bgColor}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Overall Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {(accuracyMetrics.overall_accuracy * 100).toFixed(1)}%
                </div>
                <Badge
                  className={`${accuracyLevel.color} ${accuracyLevel.bgColor} mt-1`}
                >
                  {accuracyLevel.level}
                </Badge>
              </div>
              <div className="flex items-center">
                {accuracyMetrics.accuracy_trend > 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-500" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-500" />
                )}
              </div>
            </div>
            <Progress
              value={accuracyMetrics.overall_accuracy * 100}
              className="mt-3"
            />
          </CardContent>
        </Card>

        {/* Directional Accuracy */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Directional Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(accuracyMetrics.directional_accuracy * 100).toFixed(1)}%
            </div>
            <Progress
              value={accuracyMetrics.directional_accuracy * 100}
              className="mt-3"
            />
            <p className="text-xs text-gray-500 mt-2">
              Trend prediction accuracy
            </p>
          </CardContent>
        </Card>

        {/* Model Agreement */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Model Agreement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(accuracyMetrics.model_agreement * 100).toFixed(1)}%
            </div>
            <Progress
              value={accuracyMetrics.model_agreement * 100}
              className="mt-3"
            />
            <p className="text-xs text-gray-500 mt-2">Ensemble consensus</p>
          </CardContent>
        </Card>

        {/* Optimization Score */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Optimization Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {(accuracyMetrics.optimization_score * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {accuracyMetrics.models_active} models active
                </p>
              </div>
              <Brain className="w-8 h-8 text-orange-500" />
            </div>
            <Progress
              value={accuracyMetrics.optimization_score * 100}
              className="mt-3"
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Prediction Confidence */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Prediction Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900">
              {(accuracyMetrics.prediction_confidence * 100).toFixed(1)}%
            </div>
            <Progress
              value={accuracyMetrics.prediction_confidence * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Uncertainty Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Uncertainty Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900">
              {(accuracyMetrics.uncertainty_quality * 100).toFixed(1)}%
            </div>
            <Progress
              value={accuracyMetrics.uncertainty_quality * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Performance Stability */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Performance Stability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900">
              {(accuracyMetrics.performance_stability * 100).toFixed(1)}%
            </div>
            <Progress
              value={accuracyMetrics.performance_stability * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Accuracy Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accuracyTrendChartData && (
              <div className="h-64">
                <Line
                  data={accuracyTrendChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function (value) {
                            return value + "%";
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Model Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {modelPerformanceChartData && (
              <div className="h-64">
                <Bar
                  data={modelPerformanceChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function (value) {
                            return value + "%";
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ensemble Configuration and Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ensemble Weights Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-600" />
              Ensemble Weights Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ensembleWeightsChartData && (
              <div className="h-64">
                <Doughnut
                  data={ensembleWeightsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right" as const,
                      },
                    },
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ensemble Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Ensemble Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {ensembleConfig && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Strategy</p>
                  <Badge variant="outline" className="mt-1">
                    {ensembleConfig.strategy.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Models
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {ensembleConfig.models.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Performance Threshold
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {(ensembleConfig.performance_threshold * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Last Optimized
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(ensembleConfig.last_optimized).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Optimization Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-600" />
            Advanced Optimization Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={() => triggerOptimization("quantum_ensemble")}
              disabled={isOptimizing}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              Quantum Ensemble
            </Button>
            <Button
              onClick={() => triggerOptimization("neural_architecture_search")}
              disabled={isOptimizing}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Neural Architecture
            </Button>
            <Button
              onClick={() => triggerOptimization("meta_learning")}
              disabled={isOptimizing}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              Meta Learning
            </Button>
            <Button
              onClick={() => triggerOptimization("bayesian_optimization")}
              disabled={isOptimizing}
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
            >
              Bayesian Optimization
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UltraAdvancedMLDashboard;
