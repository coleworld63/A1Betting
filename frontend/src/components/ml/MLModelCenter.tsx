import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  Alert,
  LinearProgress,
  Tooltip,
  IconButton,
  Divider,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Avatar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Psychology,
  ModelTraining,
  Analytics,
  Speed,
  TrendingUp,
  TrendingDown,
  Assessment,
  Settings,
  PlayArrow,
  Stop,
  Refresh,
  Download,
  Upload,
  ExpandMore,
  Add,
  Edit,
  Delete,
  Visibility,
  BarChart,
  Timeline,
  Memory,
  CloudDownload,
  CloudUpload,
  BugReport,
  Tune,
  AutoAwesome,
  Science,
  PrecisionManufacturing,
  Insights,
  CompareArrows,
  Schedule,
  CheckCircle,
  Error,
  Warning,
  Info,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  BarChart as RechartsBarChart,
  Bar,
  ComposedChart,
} from "recharts";
import {
  formatCurrency,
  formatPercentage,
  formatDateTime,
} from "../../utils/formatters";

interface MLModel {
  id: string;
  name: string;
  type:
    | "ensemble"
    | "neural_network"
    | "random_forest"
    | "xgboost"
    | "lstm"
    | "transformer";
  status: "training" | "ready" | "error" | "deprecated";
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingProgress: number;
  lastTrained: Date;
  version: string;
  features: string[];
  hyperparameters: { [key: string]: any };
  metrics: {
    loss: number;
    valLoss: number;
    trainingTime: number;
    memoryUsage: number;
    predictions: number;
    profitContribution: number;
  };
  deployment: {
    isDeployed: boolean;
    environment: "development" | "staging" | "production";
    instances: number;
    load: number;
  };
}

interface TrainingJob {
  id: string;
  modelId: string;
  modelName: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  startTime: Date;
  estimatedCompletion?: Date;
  currentEpoch: number;
  totalEpochs: number;
  currentLoss: number;
  bestLoss: number;
  logs: string[];
}

interface ModelComparison {
  models: string[];
  metrics: {
    accuracy: number[];
    precision: number[];
    recall: number[];
    f1Score: number[];
    profitability: number[];
  };
  timeRange: string;
}

const MODEL_TYPES = [
  { value: "ensemble", label: "Ensemble Models", color: "#1976d2" },
  { value: "neural_network", label: "Neural Networks", color: "#dc004e" },
  { value: "random_forest", label: "Random Forest", color: "#2e7d32" },
  { value: "xgboost", label: "XGBoost", color: "#ed6c02" },
  { value: "lstm", label: "LSTM Networks", color: "#9c27b0" },
  { value: "transformer", label: "Transformers", color: "#00acc1" },
];

const COLORS = {
  primary: "#1976d2",
  secondary: "#dc004e",
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
  info: "#0288d1",
};

export const MLModelCenter: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [models, setModels] = useState<MLModel[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [modelComparison, setModelComparison] =
    useState<ModelComparison | null>(null);
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"accuracy" | "profit" | "lastTrained">(
    "accuracy",
  );

  // Load Models Data
  const loadModels = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate loading ML models
      const mockModels: MLModel[] = [
        {
          id: "ensemble-v2.1",
          name: "Advanced Ensemble",
          type: "ensemble",
          status: "ready",
          accuracy: 0.742,
          precision: 0.719,
          recall: 0.756,
          f1Score: 0.737,
          trainingProgress: 100,
          lastTrained: new Date(Date.now() - 3600000),
          version: "2.1.0",
          features: [
            "odds_movement",
            "volume",
            "sentiment",
            "weather",
            "injuries",
            "historical",
          ],
          hyperparameters: {
            n_estimators: 500,
            learning_rate: 0.01,
            max_depth: 8,
            subsample: 0.8,
          },
          metrics: {
            loss: 0.342,
            valLoss: 0.367,
            trainingTime: 1847,
            memoryUsage: 2.4,
            predictions: 15647,
            profitContribution: 8432.5,
          },
          deployment: {
            isDeployed: true,
            environment: "production",
            instances: 3,
            load: 0.67,
          },
        },
        {
          id: "lstm-v1.3",
          name: "LSTM Predictor",
          type: "lstm",
          status: "training",
          accuracy: 0.689,
          precision: 0.671,
          recall: 0.698,
          f1Score: 0.684,
          trainingProgress: 73,
          lastTrained: new Date(Date.now() - 7200000),
          version: "1.3.0",
          features: [
            "time_series",
            "odds_sequences",
            "volume_patterns",
            "market_cycles",
          ],
          hyperparameters: {
            units: 128,
            dropout: 0.2,
            sequence_length: 50,
            batch_size: 32,
          },
          metrics: {
            loss: 0.456,
            valLoss: 0.489,
            trainingTime: 3241,
            memoryUsage: 4.1,
            predictions: 9832,
            profitContribution: 4567.2,
          },
          deployment: {
            isDeployed: false,
            environment: "staging",
            instances: 1,
            load: 0.23,
          },
        },
        {
          id: "xgb-v3.0",
          name: "XGBoost Champion",
          type: "xgboost",
          status: "ready",
          accuracy: 0.703,
          precision: 0.687,
          recall: 0.721,
          f1Score: 0.704,
          trainingProgress: 100,
          lastTrained: new Date(Date.now() - 14400000),
          version: "3.0.1",
          features: [
            "player_stats",
            "team_metrics",
            "matchup_history",
            "venue_effects",
          ],
          hyperparameters: {
            n_estimators: 1000,
            max_depth: 6,
            learning_rate: 0.05,
            subsample: 0.9,
          },
          metrics: {
            loss: 0.389,
            valLoss: 0.412,
            trainingTime: 892,
            memoryUsage: 1.8,
            predictions: 12456,
            profitContribution: 6789.3,
          },
          deployment: {
            isDeployed: true,
            environment: "production",
            instances: 2,
            load: 0.45,
          },
        },
        {
          id: "transformer-v1.0",
          name: "Transformer Alpha",
          type: "transformer",
          status: "error",
          accuracy: 0.654,
          precision: 0.641,
          recall: 0.669,
          f1Score: 0.655,
          trainingProgress: 0,
          lastTrained: new Date(Date.now() - 86400000),
          version: "1.0.0",
          features: [
            "text_analysis",
            "news_sentiment",
            "social_media",
            "expert_opinions",
          ],
          hyperparameters: {
            d_model: 512,
            n_heads: 8,
            n_layers: 6,
            dropout: 0.1,
          },
          metrics: {
            loss: 0.567,
            valLoss: 0.634,
            trainingTime: 0,
            memoryUsage: 0,
            predictions: 0,
            profitContribution: 0,
          },
          deployment: {
            isDeployed: false,
            environment: "development",
            instances: 0,
            load: 0,
          },
        },
      ];

      const mockTrainingJobs: TrainingJob[] = [
        {
          id: "job-001",
          modelId: "lstm-v1.3",
          modelName: "LSTM Predictor",
          status: "running",
          progress: 73,
          startTime: new Date(Date.now() - 3600000),
          estimatedCompletion: new Date(Date.now() + 1800000),
          currentEpoch: 73,
          totalEpochs: 100,
          currentLoss: 0.456,
          bestLoss: 0.423,
          logs: [
            "Epoch 73/100 - Loss: 0.456 - Val Loss: 0.489",
            "Learning rate adjusted to 0.001",
            "Early stopping patience: 7/10",
            "Memory usage: 4.1 GB",
          ],
        },
        {
          id: "job-002",
          modelId: "ensemble-v2.2",
          modelName: "Ensemble v2.2",
          status: "queued",
          progress: 0,
          startTime: new Date(Date.now() + 900000),
          currentEpoch: 0,
          totalEpochs: 50,
          currentLoss: 0,
          bestLoss: 0,
          logs: ["Job queued for execution"],
        },
      ];

      setModels(mockModels);
      setTrainingJobs(mockTrainingJobs);
    } catch (err) {
      setError("Failed to load ML models");
      console.error("Models loading error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadModels();

    if (autoRefresh) {
      const interval = setInterval(loadModels, 30000);
      return () => clearInterval(interval);
    }
  }, [loadModels, autoRefresh]);

  // Filtered and sorted models
  const filteredModels = useMemo(() => {
    let filtered = models;

    if (filterType !== "all") {
      filtered = filtered.filter((model) => model.type === filterType);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "accuracy":
          return b.accuracy - a.accuracy;
        case "profit":
          return b.metrics.profitContribution - a.metrics.profitContribution;
        case "lastTrained":
          return b.lastTrained.getTime() - a.lastTrained.getTime();
        default:
          return 0;
      }
    });
  }, [models, filterType, sortBy]);

  // Model performance comparison data
  const comparisonData = useMemo(() => {
    if (selectedModels.length === 0) return [];

    const selectedModelData = models.filter((m) =>
      selectedModels.includes(m.id),
    );
    return selectedModelData.map((model) => ({
      name: model.name,
      accuracy: model.accuracy * 100,
      precision: model.precision * 100,
      recall: model.recall * 100,
      f1Score: model.f1Score * 100,
      profit: model.metrics.profitContribution,
    }));
  }, [models, selectedModels]);

  // Event Handlers
  const handleStartTraining = useCallback(
    async (modelId: string) => {
      try {
        // Simulate starting training
        console.log("Starting training for model:", modelId);

        // Update model status
        setModels((prev) =>
          prev.map((model) =>
            model.id === modelId
              ? { ...model, status: "training" as const, trainingProgress: 0 }
              : model,
          ),
        );

        // Add training job
        const newJob: TrainingJob = {
          id: `job-${Date.now()}`,
          modelId,
          modelName: models.find((m) => m.id === modelId)?.name || "Unknown",
          status: "running",
          progress: 0,
          startTime: new Date(),
          estimatedCompletion: new Date(Date.now() + 7200000),
          currentEpoch: 0,
          totalEpochs: 100,
          currentLoss: 0,
          bestLoss: 0,
          logs: ["Training started"],
        };

        setTrainingJobs((prev) => [...prev, newJob]);
      } catch (error) {
        console.error("Failed to start training:", error);
      }
    },
    [models],
  );

  const handleStopTraining = useCallback(async (jobId: string) => {
    try {
      // Simulate stopping training
      setTrainingJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? { ...job, status: "completed" as const, progress: 100 }
            : job,
        ),
      );
    } catch (error) {
      console.error("Failed to stop training:", error);
    }
  }, []);

  const handleDeployModel = useCallback(
    async (modelId: string, environment: "staging" | "production") => {
      try {
        // Simulate model deployment
        setModels((prev) =>
          prev.map((model) =>
            model.id === modelId
              ? {
                  ...model,
                  deployment: {
                    ...model.deployment,
                    isDeployed: true,
                    environment,
                    instances: environment === "production" ? 3 : 1,
                  },
                }
              : model,
          ),
        );
        setShowDeployDialog(false);
      } catch (error) {
        console.error("Failed to deploy model:", error);
      }
    },
    [],
  );

  const handleCompareModels = useCallback(() => {
    if (selectedModels.length < 2) return;

    const comparison: ModelComparison = {
      models: selectedModels,
      metrics: {
        accuracy: selectedModels.map(
          (id) => models.find((m) => m.id === id)?.accuracy || 0,
        ),
        precision: selectedModels.map(
          (id) => models.find((m) => m.id === id)?.precision || 0,
        ),
        recall: selectedModels.map(
          (id) => models.find((m) => m.id === id)?.recall || 0,
        ),
        f1Score: selectedModels.map(
          (id) => models.find((m) => m.id === id)?.f1Score || 0,
        ),
        profitability: selectedModels.map(
          (id) =>
            models.find((m) => m.id === id)?.metrics.profitContribution || 0,
        ),
      },
      timeRange: "30d",
    };

    setModelComparison(comparison);
  }, [selectedModels, models]);

  const exportModelData = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      models: filteredModels,
      trainingJobs,
      comparison: modelComparison,
      summary: {
        totalModels: models.length,
        deployedModels: models.filter((m) => m.deployment.isDeployed).length,
        activeTrainingJobs: trainingJobs.filter((j) => j.status === "running")
          .length,
        totalProfitContribution: models.reduce(
          (sum, m) => sum + m.metrics.profitContribution,
          0,
        ),
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ml-models-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredModels, trainingJobs, modelComparison, models]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={400}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={loadModels}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Psychology />
              ML Model Center
              <Badge
                badgeContent={
                  models.filter((m) => m.deployment.isDeployed).length
                }
                color="success"
              >
                <PrecisionManufacturing />
              </Badge>
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Model Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {MODEL_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <MenuItem value="accuracy">Accuracy</MenuItem>
                  <MenuItem value="profit">Profit</MenuItem>
                  <MenuItem value="lastTrained">Last Trained</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                }
                label="Auto Refresh"
              />
              <IconButton onClick={loadModels}>
                <Refresh />
              </IconButton>
              <IconButton onClick={exportModelData}>
                <Download />
              </IconButton>
            </Box>
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="primary.main">
                  {models.length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Models
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={`${models.filter((m) => m.deployment.isDeployed).length} deployed`}
                    color="success"
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="success.main">
                  {trainingJobs.filter((j) => j.status === "running").length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Active Training
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={`${trainingJobs.filter((j) => j.status === "queued").length} queued`}
                    color="warning"
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="info.main">
                  {(
                    (models.reduce((sum, m) => sum + m.accuracy, 0) /
                      models.length) *
                    100
                  ).toFixed(1)}
                  %
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Avg Accuracy
                </Typography>
                <Box mt={1}>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (models.reduce((sum, m) => sum + m.accuracy, 0) /
                        models.length) *
                      100
                    }
                    color="info"
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="secondary.main">
                  {formatCurrency(
                    models.reduce(
                      (sum, m) => sum + m.metrics.profitContribution,
                      0,
                    ),
                  )}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Profit
                </Typography>
                <Box mt={1}>
                  <TrendingUp color="success" fontSize="small" />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Tab Navigation */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
          >
            <Tab label="Models Overview" icon={<Assessment />} />
            <Tab label="Training Jobs" icon={<ModelTraining />} />
            <Tab label="Model Comparison" icon={<CompareArrows />} />
            <Tab label="Deployment" icon={<CloudUpload />} />
            <Tab label="Performance" icon={<BarChart />} />
          </Tabs>

          {/* Models Overview Tab */}
          {activeTab === 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Chip
                        label="Select"
                        size="small"
                        onClick={() => {
                          if (selectedModels.length === models.length) {
                            setSelectedModels([]);
                          } else {
                            setSelectedModels(models.map((m) => m.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Accuracy</TableCell>
                    <TableCell>F1 Score</TableCell>
                    <TableCell>Profit Contribution</TableCell>
                    <TableCell>Last Trained</TableCell>
                    <TableCell>Deployment</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredModels.map((model) => (
                    <TableRow
                      key={model.id}
                      sx={{
                        backgroundColor: selectedModels.includes(model.id)
                          ? "action.selected"
                          : "inherit",
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Switch
                          checked={selectedModels.includes(model.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedModels((prev) => [...prev, model.id]);
                            } else {
                              setSelectedModels((prev) =>
                                prev.filter((id) => id !== model.id),
                              );
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>
                            {model.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {model.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              v{model.version}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            MODEL_TYPES.find((t) => t.value === model.type)
                              ?.label || model.type
                          }
                          size="small"
                          sx={{
                            backgroundColor:
                              MODEL_TYPES.find((t) => t.value === model.type)
                                ?.color || "#gray",
                            color: "white",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={model.status}
                          color={
                            model.status === "ready"
                              ? "success"
                              : model.status === "training"
                                ? "warning"
                                : model.status === "error"
                                  ? "error"
                                  : "default"
                          }
                          size="small"
                          icon={
                            model.status === "ready" ? (
                              <CheckCircle />
                            ) : model.status === "training" ? (
                              <Schedule />
                            ) : model.status === "error" ? (
                              <Error />
                            ) : (
                              <Info />
                            )
                          }
                        />
                        {model.status === "training" && (
                          <LinearProgress
                            variant="determinate"
                            value={model.trainingProgress}
                            sx={{ mt: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {formatPercentage(model.accuracy)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          P: {formatPercentage(model.precision)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {model.f1Score.toFixed(3)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={
                            model.metrics.profitContribution > 0
                              ? "success.main"
                              : "error.main"
                          }
                          fontWeight="bold"
                        >
                          {formatCurrency(model.metrics.profitContribution)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDateTime(model.lastTrained)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {model.deployment.isDeployed ? (
                          <Box>
                            <Chip
                              label={model.deployment.environment}
                              color={
                                model.deployment.environment === "production"
                                  ? "success"
                                  : "warning"
                              }
                              size="small"
                            />
                            <Typography variant="caption" display="block">
                              {model.deployment.instances} instances
                            </Typography>
                          </Box>
                        ) : (
                          <Chip label="Not Deployed" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => setSelectedModel(model)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {model.status === "ready" &&
                            !model.deployment.isDeployed && (
                              <Tooltip title="Deploy">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedModel(model);
                                    setShowDeployDialog(true);
                                  }}
                                >
                                  <CloudUpload />
                                </IconButton>
                              </Tooltip>
                            )}
                          {model.status === "ready" && (
                            <Tooltip title="Retrain">
                              <IconButton
                                size="small"
                                onClick={() => handleStartTraining(model.id)}
                              >
                                <ModelTraining />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Training Jobs Tab */}
          {activeTab === 1 && (
            <Stack spacing={2}>
              {trainingJobs.map((job) => (
                <Paper key={job.id} sx={{ p: 2 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">{job.modelName}</Typography>
                    <Box display="flex" gap={1} alignItems="center">
                      <Chip
                        label={job.status}
                        color={
                          job.status === "completed"
                            ? "success"
                            : job.status === "running"
                              ? "warning"
                              : job.status === "failed"
                                ? "error"
                                : "default"
                        }
                        size="small"
                      />
                      {job.status === "running" && (
                        <IconButton
                          size="small"
                          onClick={() => handleStopTraining(job.id)}
                        >
                          <Stop />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {job.status === "running" && (
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">
                          Epoch {job.currentEpoch} / {job.totalEpochs}
                        </Typography>
                        <Typography variant="body2">{job.progress}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={job.progress}
                      />

                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption">
                            Current Loss
                          </Typography>
                          <Typography variant="body2">
                            {job.currentLoss.toFixed(4)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption">Best Loss</Typography>
                          <Typography variant="body2">
                            {job.bestLoss.toFixed(4)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle2">Training Logs</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {job.logs.map((log, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={log}
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.875rem",
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              ))}

              {trainingJobs.length === 0 && (
                <Alert severity="info">
                  No training jobs currently running. Start training a model to
                  see jobs here.
                </Alert>
              )}
            </Stack>
          )}

          {/* Model Comparison Tab */}
          {activeTab === 2 && (
            <Box>
              <Box
                display="flex"
                justifyContent="between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Model Comparison</Typography>
                <Button
                  onClick={handleCompareModels}
                  disabled={selectedModels.length < 2}
                  startIcon={<CompareArrows />}
                >
                  Compare Selected ({selectedModels.length})
                </Button>
              </Box>

              {comparisonData.length > 0 ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Performance Metrics
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <RadarChart
                          data={[
                            {
                              metric: "Accuracy",
                              ...comparisonData.reduce(
                                (acc, model, idx) => ({
                                  ...acc,
                                  [model.name]: model.accuracy,
                                }),
                                {},
                              ),
                            },
                            {
                              metric: "Precision",
                              ...comparisonData.reduce(
                                (acc, model, idx) => ({
                                  ...acc,
                                  [model.name]: model.precision,
                                }),
                                {},
                              ),
                            },
                            {
                              metric: "Recall",
                              ...comparisonData.reduce(
                                (acc, model, idx) => ({
                                  ...acc,
                                  [model.name]: model.recall,
                                }),
                                {},
                              ),
                            },
                            {
                              metric: "F1 Score",
                              ...comparisonData.reduce(
                                (acc, model, idx) => ({
                                  ...acc,
                                  [model.name]: model.f1Score,
                                }),
                                {},
                              ),
                            },
                          ]}
                        >
                          <PolarGrid />
                          <PolarAngleAxis dataKey="metric" />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={false}
                          />
                          {comparisonData.map((model, index) => (
                            <Radar
                              key={model.name}
                              name={model.name}
                              dataKey={model.name}
                              stroke={`hsl(${index * 137.5}, 70%, 50%)`}
                              fill={`hsl(${index * 137.5}, 70%, 50%)`}
                              fillOpacity={0.2}
                              strokeWidth={2}
                            />
                          ))}
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Profit Comparison
                      </Typography>
                      <Stack spacing={2}>
                        {comparisonData.map((model, index) => (
                          <Box key={model.name}>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              mb={1}
                            >
                              <Typography variant="body2">
                                {model.name}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {formatCurrency(model.profit)}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={
                                (model.profit /
                                  Math.max(
                                    ...comparisonData.map((m) => m.profit),
                                  )) *
                                100
                              }
                              sx={{
                                height: 8,
                                backgroundColor: "grey.200",
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: `hsl(${index * 137.5}, 70%, 50%)`,
                                },
                              }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">
                  Select at least 2 models to compare their performance.
                </Alert>
              )}
            </Box>
          )}

          {/* Deployment Tab */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Deployment Overview
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Model</TableCell>
                          <TableCell>Environment</TableCell>
                          <TableCell>Instances</TableCell>
                          <TableCell>Load</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {models
                          .filter((m) => m.deployment.isDeployed)
                          .map((model) => (
                            <TableRow key={model.id}>
                              <TableCell>{model.name}</TableCell>
                              <TableCell>
                                <Chip
                                  label={model.deployment.environment}
                                  color={
                                    model.deployment.environment ===
                                    "production"
                                      ? "success"
                                      : "warning"
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {model.deployment.instances}
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={model.deployment.load * 100}
                                    sx={{ width: 60 }}
                                  />
                                  <Typography variant="caption">
                                    {formatPercentage(model.deployment.load)}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label="Healthy"
                                  color="success"
                                  size="small"
                                  icon={<CheckCircle />}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                >
                                  Undeploy
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Deployment Stats
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption">
                        Production Models
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {
                          models.filter(
                            (m) => m.deployment.environment === "production",
                          ).length
                        }
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption">Staging Models</Typography>
                      <Typography variant="h4" color="warning.main">
                        {
                          models.filter(
                            (m) => m.deployment.environment === "staging",
                          ).length
                        }
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption">Total Instances</Typography>
                      <Typography variant="h4" color="info.main">
                        {models.reduce(
                          (sum, m) =>
                            sum +
                            (m.deployment.isDeployed
                              ? m.deployment.instances
                              : 0),
                          0,
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption">Avg Load</Typography>
                      <Typography variant="h4">
                        {formatPercentage(
                          models
                            .filter((m) => m.deployment.isDeployed)
                            .reduce((sum, m) => sum + m.deployment.load, 0) /
                            Math.max(
                              models.filter((m) => m.deployment.isDeployed)
                                .length,
                              1,
                            ),
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Performance Tab */}
          {activeTab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Model Performance Over Time
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart
                      data={[
                        {
                          date: "2024-01-01",
                          ensemble: 74.2,
                          lstm: 68.9,
                          xgboost: 70.3,
                          profit: 8432,
                        },
                        {
                          date: "2024-01-15",
                          ensemble: 75.1,
                          lstm: 69.5,
                          xgboost: 71.1,
                          profit: 9156,
                        },
                        {
                          date: "2024-02-01",
                          ensemble: 74.8,
                          lstm: 70.2,
                          xgboost: 70.8,
                          profit: 8934,
                        },
                        {
                          date: "2024-02-15",
                          ensemble: 76.3,
                          lstm: 71.1,
                          xgboost: 72.5,
                          profit: 10247,
                        },
                        {
                          date: "2024-03-01",
                          ensemble: 74.2,
                          lstm: 68.9,
                          xgboost: 70.3,
                          profit: 8432,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="ensemble"
                        stroke={COLORS.primary}
                        name="Ensemble"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="lstm"
                        stroke={COLORS.secondary}
                        name="LSTM"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="xgboost"
                        stroke={COLORS.success}
                        name="XGBoost"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="profit"
                        fill={COLORS.warning}
                        opacity={0.3}
                        name="Profit"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Deploy Dialog */}
      <Dialog
        open={showDeployDialog}
        onClose={() => setShowDeployDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Deploy Model</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Deploy {selectedModel?.name} to which environment?
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() =>
                selectedModel && handleDeployModel(selectedModel.id, "staging")
              }
              startIcon={<CloudUpload />}
            >
              Deploy to Staging
            </Button>
            <Button
              variant="contained"
              onClick={() =>
                selectedModel &&
                handleDeployModel(selectedModel.id, "production")
              }
              startIcon={<CloudUpload />}
            >
              Deploy to Production
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeployDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default MLModelCenter;
