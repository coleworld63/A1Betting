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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Avatar,
  ButtonGroup,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fab,
} from "@mui/material";
import {
  Analytics,
  Dashboard,
  TrendingUp,
  TrendingDown,
  Assessment,
  MonetizationOn,
  Warning,
  Info,
  Download,
  Settings,
  Refresh,
  Timeline,
  Speed,
  Psychology,
  AutoAwesome,
  ShowChart,
  BarChart,
  PieChart,
  DonutLarge,
  Insights,
  Memory,
  Visibility,
  ExpandMore,
  FilterList,
  Sort,
  Search,
  Share,
  Fullscreen,
  FullscreenExit,
  Menu,
  Close,
  Add,
  Remove,
  Edit,
  Delete,
  Star,
  StarBorder,
  Bookmark,
  BookmarkBorder,
  ThumbUp,
  ThumbDown,
  Comment,
  PersonAdd,
  Group,
  Public,
  Lock,
  Notifications,
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ComposedChart,
  Treemap,
  Sankey,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import {
  formatCurrency,
  formatPercentage,
  formatDateTime,
} from "../../utils/formatters";

interface AnalyticsWidget {
  id: string;
  title: string;
  type: "chart" | "metric" | "table" | "heatmap" | "treemap" | "sankey";
  size: "small" | "medium" | "large" | "xl";
  position: { x: number; y: number };
  data: any;
  config: {
    refreshInterval?: number;
    showLegend?: boolean;
    showTooltip?: boolean;
    colorScheme?: string;
    aggregation?: string;
  };
  isVisible: boolean;
  isFavorite: boolean;
  createdBy: string;
  lastUpdated: Date;
  category: string;
  tags: string[];
}

interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: AnalyticsWidget[];
  isPublic: boolean;
  isDefault: boolean;
  createdBy: string;
  sharedWith: string[];
  category: string;
  lastModified: Date;
}

interface AnalyticsInsight {
  id: string;
  type: "trend" | "anomaly" | "prediction" | "recommendation";
  title: string;
  description: string;
  confidence: number;
  impact: "low" | "medium" | "high";
  actionable: boolean;
  relatedWidgets: string[];
  generatedAt: Date;
  data: any;
}

interface SocialActivity {
  id: string;
  type: "like" | "comment" | "share" | "follow" | "bookmark";
  user: {
    id: string;
    name: string;
    avatar: string;
    reputation: number;
  };
  target: {
    type: "widget" | "dashboard" | "insight";
    id: string;
    title: string;
  };
  timestamp: Date;
  content?: string;
}

const WIDGET_SIZES = {
  small: { width: 300, height: 200 },
  medium: { width: 400, height: 300 },
  large: { width: 600, height: 400 },
  xl: { width: 800, height: 500 },
};

const COLOR_SCHEMES = {
  blue: ["#1976d2", "#42a5f5", "#90caf9"],
  green: ["#388e3c", "#66bb6a", "#a5d6a7"],
  purple: ["#7b1fa2", "#ab47bc", "#ce93d8"],
  orange: ["#f57c00", "#ff9800", "#ffcc02"],
  red: ["#d32f2f", "#f44336", "#ef5350"],
};

export const AdvancedAnalyticsHub: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  // State Management
  const [activeLayout, setActiveLayout] = useState<DashboardLayout | null>(
    null,
  );
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [socialActivity, setSocialActivity] = useState<SocialActivity[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<AnalyticsWidget | null>(
    null,
  );

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [showSocial, setShowSocial] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [fullscreenWidget, setFullscreenWidget] = useState<string | null>(null);

  // Filters and Settings
  const [filters, setFilters] = useState({
    category: "all",
    dateRange: "7d",
    onlyFavorites: false,
    showPublic: true,
  });

  // Load Analytics Data
  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock comprehensive analytics data
      const mockLayouts: DashboardLayout[] = [
        {
          id: "performance-overview",
          name: "Performance Overview",
          description: "Comprehensive performance tracking and analytics",
          widgets: [
            {
              id: "profit-trend",
              title: "Profit Trend (30 Days)",
              type: "chart",
              size: "large",
              position: { x: 0, y: 0 },
              data: generateTrendData(),
              config: {
                refreshInterval: 30000,
                showLegend: true,
                colorScheme: "green",
              },
              isVisible: true,
              isFavorite: true,
              createdBy: "system",
              lastUpdated: new Date(),
              category: "performance",
              tags: ["profit", "trend", "finance"],
            },
            {
              id: "win-rate-gauge",
              title: "Current Win Rate",
              type: "metric",
              size: "medium",
              position: { x: 600, y: 0 },
              data: { value: 0.642, target: 0.65, change: 0.023 },
              config: {
                colorScheme: "blue",
              },
              isVisible: true,
              isFavorite: false,
              createdBy: "system",
              lastUpdated: new Date(),
              category: "performance",
              tags: ["winrate", "metric"],
            },
            {
              id: "roi-distribution",
              title: "ROI Distribution by Sport",
              type: "chart",
              size: "medium",
              position: { x: 0, y: 400 },
              data: generateROIData(),
              config: {
                showLegend: true,
                colorScheme: "purple",
              },
              isVisible: true,
              isFavorite: false,
              createdBy: "system",
              lastUpdated: new Date(),
              category: "performance",
              tags: ["roi", "sports", "distribution"],
            },
            {
              id: "risk-heatmap",
              title: "Risk Heat Map",
              type: "heatmap",
              size: "medium",
              position: { x: 400, y: 400 },
              data: generateHeatmapData(),
              config: {
                colorScheme: "red",
              },
              isVisible: true,
              isFavorite: true,
              createdBy: "system",
              lastUpdated: new Date(),
              category: "risk",
              tags: ["risk", "heatmap", "analysis"],
            },
          ],
          isPublic: true,
          isDefault: true,
          createdBy: "system",
          sharedWith: [],
          category: "performance",
          lastModified: new Date(),
        },
        {
          id: "ml-insights",
          name: "ML Model Insights",
          description:
            "Advanced machine learning model performance and insights",
          widgets: [
            {
              id: "model-accuracy-trend",
              title: "Model Accuracy Over Time",
              type: "chart",
              size: "xl",
              position: { x: 0, y: 0 },
              data: generateModelAccuracyData(),
              config: {
                refreshInterval: 60000,
                showLegend: true,
                colorScheme: "blue",
              },
              isVisible: true,
              isFavorite: true,
              createdBy: "system",
              lastUpdated: new Date(),
              category: "ml",
              tags: ["models", "accuracy", "performance"],
            },
            {
              id: "feature-importance",
              title: "Feature Importance Analysis",
              type: "chart",
              size: "large",
              position: { x: 0, y: 500 },
              data: generateFeatureImportanceData(),
              config: {
                colorScheme: "orange",
              },
              isVisible: true,
              isFavorite: false,
              createdBy: "system",
              lastUpdated: new Date(),
              category: "ml",
              tags: ["features", "importance", "analysis"],
            },
          ],
          isPublic: false,
          isDefault: false,
          createdBy: "user",
          sharedWith: ["team"],
          category: "ml",
          lastModified: new Date(),
        },
      ];

      const mockInsights: AnalyticsInsight[] = [
        {
          id: "insight-001",
          type: "trend",
          title: "NBA Win Rate Trending Up",
          description:
            "Your NBA betting performance has improved by 15% over the last 2 weeks, driven by better player prop predictions.",
          confidence: 0.89,
          impact: "high",
          actionable: true,
          relatedWidgets: ["profit-trend", "win-rate-gauge"],
          generatedAt: new Date(Date.now() - 3600000),
          data: { sport: "NBA", improvement: 0.15, timeframe: "2 weeks" },
        },
        {
          id: "insight-002",
          type: "anomaly",
          title: "Unusual Tennis Betting Pattern",
          description:
            "Detected an unusual spike in tennis betting volume. Consider reviewing risk exposure.",
          confidence: 0.76,
          impact: "medium",
          actionable: true,
          relatedWidgets: ["risk-heatmap"],
          generatedAt: new Date(Date.now() - 7200000),
          data: { sport: "Tennis", anomaly_score: 0.85 },
        },
        {
          id: "insight-003",
          type: "recommendation",
          title: "Optimize ML Model Ensemble",
          description:
            "Current ensemble weights could be optimized to increase accuracy by an estimated 3-5%.",
          confidence: 0.82,
          impact: "high",
          actionable: true,
          relatedWidgets: ["model-accuracy-trend"],
          generatedAt: new Date(Date.now() - 1800000),
          data: { potential_improvement: 0.04, models_affected: 3 },
        },
      ];

      const mockSocialActivity: SocialActivity[] = [
        {
          id: "activity-001",
          type: "like",
          user: {
            id: "user-123",
            name: "Alex Rodriguez",
            avatar: "/avatars/alex.jpg",
            reputation: 4.8,
          },
          target: {
            type: "widget",
            id: "profit-trend",
            title: "Profit Trend (30 Days)",
          },
          timestamp: new Date(Date.now() - 900000),
        },
        {
          id: "activity-002",
          type: "comment",
          user: {
            id: "user-456",
            name: "Sarah Chen",
            avatar: "/avatars/sarah.jpg",
            reputation: 4.6,
          },
          target: {
            type: "dashboard",
            id: "performance-overview",
            title: "Performance Overview",
          },
          timestamp: new Date(Date.now() - 1800000),
          content: "Great dashboard! Love the risk heatmap visualization.",
        },
      ];

      setLayouts(mockLayouts);
      setActiveLayout(mockLayouts[0]);
      setInsights(mockInsights);
      setSocialActivity(mockSocialActivity);
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate mock data functions
  const generateTrendData = () => {
    const data = [];
    for (let i = 0; i < 30; i++) {
      data.push({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        profit: Math.random() * 1000 + 500,
        cumulative: (i + 1) * 200 + Math.random() * 500,
        winRate: 0.5 + Math.random() * 0.3,
        volume: Math.floor(Math.random() * 50) + 20,
      });
    }
    return data;
  };

  const generateROIData = () => [
    { sport: "NBA", roi: 0.142, bets: 234, profit: 2341 },
    { sport: "NFL", roi: 0.089, bets: 187, profit: 1876 },
    { sport: "MLB", roi: 0.203, bets: 156, profit: 1987 },
    { sport: "Tennis", roi: 0.067, bets: 98, profit: 789 },
    { sport: "Soccer", roi: 0.178, bets: 123, profit: 1456 },
  ];

  const generateHeatmapData = () => {
    const data = [];
    const sports = ["NBA", "NFL", "MLB", "Tennis", "Soccer"];
    const markets = ["Moneyline", "Spread", "Total", "Props", "Futures"];

    sports.forEach((sport, i) => {
      markets.forEach((market, j) => {
        data.push({
          sport,
          market,
          risk: Math.random(),
          x: j,
          y: i,
          value: Math.random() * 100,
        });
      });
    });
    return data;
  };

  const generateModelAccuracyData = () => {
    const models = ["Ensemble", "LSTM", "XGBoost", "Random Forest"];
    const data = [];

    for (let i = 0; i < 30; i++) {
      const point: any = {
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      };

      models.forEach((model) => {
        point[model] = 60 + Math.random() * 30;
      });

      data.push(point);
    }
    return data;
  };

  const generateFeatureImportanceData = () => [
    { feature: "Recent Form", importance: 0.234, impact: "High" },
    { feature: "Head-to-Head", importance: 0.187, impact: "Medium" },
    { feature: "Injury Report", importance: 0.156, impact: "High" },
    { feature: "Weather", importance: 0.089, impact: "Low" },
    { feature: "Venue", importance: 0.123, impact: "Medium" },
    { feature: "Rest Days", importance: 0.098, impact: "Medium" },
    { feature: "Market Sentiment", importance: 0.067, impact: "Low" },
    { feature: "Line Movement", importance: 0.045, impact: "Low" },
  ];

  // Load data on mount
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Event Handlers
  const handleLayoutChange = useCallback(
    (layoutId: string) => {
      const layout = layouts.find((l) => l.id === layoutId);
      if (layout) {
        setActiveLayout(layout);
      }
    },
    [layouts],
  );

  const handleWidgetToggle = useCallback(
    (widgetId: string) => {
      if (!activeLayout) return;

      setActiveLayout((prev) =>
        prev
          ? {
              ...prev,
              widgets: prev.widgets.map((widget) =>
                widget.id === widgetId
                  ? { ...widget, isVisible: !widget.isVisible }
                  : widget,
              ),
            }
          : null,
      );
    },
    [activeLayout],
  );

  const handleWidgetFavorite = useCallback(
    (widgetId: string) => {
      if (!activeLayout) return;

      setActiveLayout((prev) =>
        prev
          ? {
              ...prev,
              widgets: prev.widgets.map((widget) =>
                widget.id === widgetId
                  ? { ...widget, isFavorite: !widget.isFavorite }
                  : widget,
              ),
            }
          : null,
      );
    },
    [activeLayout],
  );

  const exportDashboard = useCallback(() => {
    if (!activeLayout) return;

    const exportData = {
      layout: activeLayout,
      insights: insights.filter((insight) =>
        insight.relatedWidgets.some((widgetId) =>
          activeLayout.widgets.some((w) => w.id === widgetId),
        ),
      ),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-${activeLayout.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeLayout, insights]);

  // Widget Renderer
  const renderWidget = useCallback(
    (widget: AnalyticsWidget) => {
      if (!widget.isVisible) return null;

      const isFullscreen = fullscreenWidget === widget.id;
      const size = isFullscreen ? "xl" : widget.size;
      const dimensions = WIDGET_SIZES[size];

      return (
        <motion.div
          key={widget.id}
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          style={{
            position: isFullscreen ? "fixed" : "relative",
            top: isFullscreen ? 0 : "auto",
            left: isFullscreen ? 0 : "auto",
            width: isFullscreen ? "100vw" : dimensions.width,
            height: isFullscreen ? "100vh" : dimensions.height,
            zIndex: isFullscreen ? 9999 : "auto",
            background: isFullscreen
              ? theme.palette.background.default
              : "transparent",
          }}
        >
          <Card sx={{ height: "100%", position: "relative" }}>
            <CardContent
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography
                  variant="h6"
                  sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}
                >
                  {widget.title}
                </Typography>
                <Box display="flex" gap={0.5}>
                  <IconButton
                    size="small"
                    onClick={() => handleWidgetFavorite(widget.id)}
                  >
                    {widget.isFavorite ? (
                      <Star color="warning" />
                    ) : (
                      <StarBorder />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setFullscreenWidget(isFullscreen ? null : widget.id)
                    }
                  >
                    {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                  </IconButton>
                  {isEditMode && (
                    <IconButton
                      size="small"
                      onClick={() => handleWidgetToggle(widget.id)}
                    >
                      <Visibility />
                    </IconButton>
                  )}
                </Box>
              </Box>

              <Box flex={1} minHeight={0}>
                {widget.type === "chart" && (
                  <ResponsiveContainer width="100%" height="100%">
                    {widget.id === "profit-trend" && (
                      <ComposedChart data={widget.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <RechartsTooltip />
                        <Legend />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="cumulative"
                          fill="#1976d2"
                          fillOpacity={0.3}
                        />
                        <Bar yAxisId="left" dataKey="profit" fill="#4caf50" />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="winRate"
                          stroke="#ff9800"
                          strokeWidth={3}
                        />
                      </ComposedChart>
                    )}
                    {widget.id === "roi-distribution" && (
                      <RechartsBarChart data={widget.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sport" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="roi" fill="#9c27b0" />
                      </RechartsBarChart>
                    )}
                    {widget.id === "model-accuracy-trend" && (
                      <LineChart data={widget.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[60, 90]} />
                        <RechartsTooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="Ensemble"
                          stroke="#1976d2"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="LSTM"
                          stroke="#dc004e"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="XGBoost"
                          stroke="#2e7d32"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="Random Forest"
                          stroke="#ed6c02"
                          strokeWidth={2}
                        />
                      </LineChart>
                    )}
                    {widget.id === "feature-importance" && (
                      <RechartsBarChart data={widget.data} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="feature" type="category" width={120} />
                        <RechartsTooltip />
                        <Bar dataKey="importance" fill="#ff9800" />
                      </RechartsBarChart>
                    )}
                  </ResponsiveContainer>
                )}

                {widget.type === "metric" && (
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <Typography
                      variant="h2"
                      color="primary.main"
                      fontWeight="bold"
                    >
                      {formatPercentage(widget.data.value)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Target: {formatPercentage(widget.data.target)}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      {widget.data.change > 0 ? (
                        <TrendingUp color="success" />
                      ) : (
                        <TrendingDown color="error" />
                      )}
                      <Typography
                        variant="body2"
                        color={
                          widget.data.change > 0 ? "success.main" : "error.main"
                        }
                        fontWeight="bold"
                      >
                        {formatPercentage(Math.abs(widget.data.change))}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {widget.type === "heatmap" && (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6" color="textSecondary">
                      Risk Heatmap Visualization
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      );
    },
    [
      theme,
      isMobile,
      isEditMode,
      fullscreenWidget,
      handleWidgetFavorite,
      handleWidgetToggle,
    ],
  );

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={400}
      >
        <LinearProgress sx={{ width: "50%" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Mobile FAB for sidebar */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="menu"
          sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}
          onClick={() => setSidebarOpen(true)}
        >
          <Menu />
        </Fab>
      )}

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: isMobile ? "100%" : 320,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isMobile ? "100%" : 320,
            boxSizing: "border-box",
            position: "relative",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Analytics Hub</Typography>
            {isMobile && (
              <IconButton onClick={() => setSidebarOpen(false)}>
                <Close />
              </IconButton>
            )}
          </Box>

          {/* Layout Selector */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Dashboard Layout</InputLabel>
            <Select
              value={activeLayout?.id || ""}
              onChange={(e) => handleLayoutChange(e.target.value)}
            >
              {layouts.map((layout) => (
                <MenuItem key={layout.id} value={layout.id}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {layout.isPublic ? (
                      <Public fontSize="small" />
                    ) : (
                      <Lock fontSize="small" />
                    )}
                    {layout.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Controls */}
          <Stack spacing={1} sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isEditMode}
                  onChange={(e) => setIsEditMode(e.target.checked)}
                />
              }
              label="Edit Mode"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showInsights}
                  onChange={(e) => setShowInsights(e.target.checked)}
                />
              }
              label="AI Insights"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showSocial}
                  onChange={(e) => setShowSocial(e.target.checked)}
                />
              }
              label="Social Feed"
            />
          </Stack>

          <ButtonGroup fullWidth sx={{ mb: 2 }}>
            <Button onClick={loadAnalyticsData} startIcon={<Refresh />}>
              Refresh
            </Button>
            <Button onClick={exportDashboard} startIcon={<Download />}>
              Export
            </Button>
          </ButtonGroup>

          {/* Widget List */}
          {activeLayout && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Widgets (
                {activeLayout.widgets.filter((w) => w.isVisible).length}/
                {activeLayout.widgets.length})
              </Typography>
              <List dense>
                {activeLayout.widgets.map((widget) => (
                  <ListItem key={widget.id}>
                    <ListItemIcon>
                      <Switch
                        checked={widget.isVisible}
                        onChange={() => handleWidgetToggle(widget.id)}
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={widget.title}
                      secondary={widget.category}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleWidgetFavorite(widget.id)}
                    >
                      {widget.isFavorite ? (
                        <Star color="warning" />
                      ) : (
                        <StarBorder />
                      )}
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isMobile ? 1 : 3,
          overflow: "auto",
          marginLeft: isMobile ? 0 : sidebarOpen ? 0 : "-320px",
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h4"
            sx={{ fontSize: isMobile ? "1.5rem" : "2rem" }}
          >
            {activeLayout?.name || "Analytics Hub"}
          </Typography>
          <Box display="flex" gap={1}>
            <Badge badgeContent={insights.length} color="error">
              <Button
                variant={showInsights ? "contained" : "outlined"}
                startIcon={<AutoAwesome />}
                onClick={() => setShowInsights(!showInsights)}
                size={isMobile ? "small" : "medium"}
              >
                Insights
              </Button>
            </Badge>
            <Badge badgeContent={socialActivity.length} color="primary">
              <Button
                variant={showSocial ? "contained" : "outlined"}
                startIcon={<Group />}
                onClick={() => setShowSocial(!showSocial)}
                size={isMobile ? "small" : "medium"}
              >
                Social
              </Button>
            </Badge>
          </Box>
        </Box>

        {/* Insights Panel */}
        <AnimatePresence>
          {showInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <AutoAwesome />
                  AI-Powered Insights
                </Typography>
                <Grid container spacing={2}>
                  {insights.slice(0, 3).map((insight) => (
                    <Grid item xs={12} md={4} key={insight.id}>
                      <Card sx={{ height: "100%" }}>
                        <CardContent>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="start"
                            mb={1}
                          >
                            <Chip
                              label={insight.type}
                              color={
                                insight.type === "trend"
                                  ? "info"
                                  : insight.type === "anomaly"
                                    ? "warning"
                                    : insight.type === "recommendation"
                                      ? "success"
                                      : "default"
                              }
                              size="small"
                            />
                            <Chip
                              label={`${Math.round(insight.confidence * 100)}%`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="subtitle2" gutterBottom>
                            {insight.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {insight.description}
                          </Typography>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mt={2}
                          >
                            <Chip
                              label={`${insight.impact} impact`}
                              color={
                                insight.impact === "high"
                                  ? "error"
                                  : insight.impact === "medium"
                                    ? "warning"
                                    : "success"
                              }
                              size="small"
                            />
                            {insight.actionable && (
                              <Button size="small">Take Action</Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Feed Panel */}
        <AnimatePresence>
          {showSocial && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Group />
                  Community Activity
                </Typography>
                <List>
                  {socialActivity.slice(0, 5).map((activity) => (
                    <ListItem key={activity.id}>
                      <ListItemIcon>
                        <Avatar
                          src={activity.user.avatar}
                          sx={{ width: 32, height: 32 }}
                        >
                          {activity.user.name[0]}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontWeight="bold">
                              {activity.user.name}
                            </Typography>
                            <Typography variant="body2">
                              {activity.type === "like"
                                ? "liked"
                                : activity.type === "comment"
                                  ? "commented on"
                                  : activity.type === "share"
                                    ? "shared"
                                    : activity.type}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {activity.target.title}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            {activity.content && (
                              <Typography variant="caption" display="block">
                                "{activity.content}"
                              </Typography>
                            )}
                            <Typography variant="caption" color="textSecondary">
                              {formatDateTime(activity.timestamp)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Widget Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : isTablet
                ? "repeat(auto-fit, minmax(400px, 1fr))"
                : "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 2,
            alignItems: "start",
          }}
        >
          <AnimatePresence>
            {activeLayout?.widgets.map((widget) => renderWidget(widget))}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default AdvancedAnalyticsHub;
