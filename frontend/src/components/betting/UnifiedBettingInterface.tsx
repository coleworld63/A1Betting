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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Avatar,
  ButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  MonetizationOn,
  Warning,
  Info,
  Download,
  Settings,
  PlayArrow,
  Stop,
  Refresh,
  Add,
  Remove,
  ShoppingCart,
  History,
  Timeline,
  Speed,
  Psychology,
  Calculate,
  AutoAwesome,
  CandlestickChart,
  ShowChart,
  BarChart,
  PieChart,
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
  Notifications,
  NotificationsOff,
  Schedule,
  CheckCircle,
  Error,
  ExpandMore,
  FilterList,
  Sort,
  Search,
  BookmarkBorder,
  Bookmark,
  Share,
  Print,
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
  BarChart as RechartsBarChart,
  Bar,
  ComposedChart,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  formatCurrency,
  formatPercentage,
  formatOdds,
  formatDateTime,
} from "../../utils/formatters";

interface BettingOpportunity {
  id: string;
  sport: string;
  league: string;
  event: string;
  market: string;
  selection: string;
  odds: number;
  impliedProbability: number;
  prediction: {
    probability: number;
    confidence: number;
    edge: number;
    expectedValue: number;
    kellyFraction: number;
  };
  bookmaker: string;
  volume: number;
  lastUpdate: Date;
  timeToExpiry: number;
  riskLevel: "low" | "medium" | "high";
  tags: string[];
  liquidity: number;
  spread: number;
}

interface BetSlipItem {
  opportunityId: string;
  stake: number;
  potentialPayout: number;
  odds: number;
  isLocked: boolean;
}

interface PortfolioPosition {
  id: string;
  sport: string;
  market: string;
  exposure: number;
  positions: number;
  averageOdds: number;
  currentValue: number;
  pnl: number;
  riskMetrics: {
    var: number;
    expectedShortfall: number;
    correlation: number;
  };
}

interface TradingSession {
  id: string;
  startTime: Date;
  duration: number;
  betsPlaced: number;
  totalStake: number;
  pnl: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

const RISK_LEVELS = {
  low: { color: "#2e7d32", label: "Low Risk" },
  medium: { color: "#ed6c02", label: "Medium Risk" },
  high: { color: "#d32f2f", label: "High Risk" },
};

const COLORS = {
  primary: "#1976d2",
  secondary: "#dc004e",
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
  info: "#0288d1",
};

export const UnifiedBettingInterface: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [opportunities, setOpportunities] = useState<BettingOpportunity[]>([]);
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([]);
  const [tradingSession, setTradingSession] = useState<TradingSession | null>(
    null,
  );
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<BettingOpportunity | null>(null);

  // Trading State
  const [isTrading, setIsTrading] = useState(false);
  const [autoTrading, setAutoTrading] = useState(false);
  const [riskManagement, setRiskManagement] = useState(true);
  const [showOnlyEdge, setShowOnlyEdge] = useState(false);
  const [maxStakePerBet, setMaxStakePerBet] = useState(100);
  const [totalBankroll, setTotalBankroll] = useState(10000);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [showBetDialog, setShowBetDialog] = useState(false);
  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false);
  const [filters, setFilters] = useState({
    sport: "all",
    market: "all",
    minEdge: 0,
    maxRisk: "high",
    minConfidence: 0,
    bookmaker: "all",
  });

  // Load Trading Data
  const loadTradingData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate loading betting opportunities
      const mockOpportunities: BettingOpportunity[] = [
        {
          id: "opp-001",
          sport: "Basketball",
          league: "NBA",
          event: "Lakers vs Warriors",
          market: "Player Points",
          selection: "LeBron James Over 25.5",
          odds: 1.91,
          impliedProbability: 0.523,
          prediction: {
            probability: 0.67,
            confidence: 0.82,
            edge: 0.147,
            expectedValue: 12.85,
            kellyFraction: 0.08,
          },
          bookmaker: "DraftKings",
          volume: 245000,
          lastUpdate: new Date(Date.now() - 300000),
          timeToExpiry: 7200000,
          riskLevel: "low",
          tags: ["trending", "high-volume", "injury-news"],
          liquidity: 0.95,
          spread: 0.02,
        },
        {
          id: "opp-002",
          sport: "Football",
          league: "NFL",
          event: "Chiefs vs Bills",
          market: "Spread",
          selection: "Chiefs -3.5",
          odds: 2.15,
          impliedProbability: 0.465,
          prediction: {
            probability: 0.58,
            confidence: 0.74,
            edge: 0.115,
            expectedValue: 8.92,
            kellyFraction: 0.06,
          },
          bookmaker: "FanDuel",
          volume: 189000,
          lastUpdate: new Date(Date.now() - 180000),
          timeToExpiry: 14400000,
          riskLevel: "medium",
          tags: ["primetime", "divisional"],
          liquidity: 0.88,
          spread: 0.03,
        },
        {
          id: "opp-003",
          sport: "Soccer",
          league: "Premier League",
          event: "Man City vs Liverpool",
          market: "Match Result",
          selection: "Man City Win",
          odds: 2.45,
          impliedProbability: 0.408,
          prediction: {
            probability: 0.52,
            confidence: 0.69,
            edge: 0.112,
            expectedValue: 15.67,
            kellyFraction: 0.05,
          },
          bookmaker: "Bet365",
          volume: 567000,
          lastUpdate: new Date(Date.now() - 120000),
          timeToExpiry: 3600000,
          riskLevel: "medium",
          tags: ["classic", "high-stakes"],
          liquidity: 0.92,
          spread: 0.025,
        },
        {
          id: "opp-004",
          sport: "Tennis",
          league: "ATP",
          event: "Djokovic vs Nadal",
          market: "Match Winner",
          selection: "Djokovic",
          odds: 1.75,
          impliedProbability: 0.571,
          prediction: {
            probability: 0.68,
            confidence: 0.91,
            edge: 0.109,
            expectedValue: 7.43,
            kellyFraction: 0.07,
          },
          bookmaker: "Pinnacle",
          volume: 123000,
          lastUpdate: new Date(Date.now() - 60000),
          timeToExpiry: 1800000,
          riskLevel: "low",
          tags: ["GOAT-matchup", "clay-court"],
          liquidity: 0.85,
          spread: 0.015,
        },
      ];

      const mockPortfolio: PortfolioPosition[] = [
        {
          id: "pos-001",
          sport: "Basketball",
          market: "Player Props",
          exposure: 2450.0,
          positions: 8,
          averageOdds: 1.92,
          currentValue: 2687.5,
          pnl: 237.5,
          riskMetrics: {
            var: -145.67,
            expectedShortfall: -201.34,
            correlation: 0.23,
          },
        },
        {
          id: "pos-002",
          sport: "Football",
          market: "Spreads",
          exposure: 1890.0,
          positions: 5,
          averageOdds: 2.01,
          currentValue: 1756.2,
          pnl: -133.8,
          riskMetrics: {
            var: -187.23,
            expectedShortfall: -245.67,
            correlation: 0.45,
          },
        },
      ];

      const mockSession: TradingSession = {
        id: "session-001",
        startTime: new Date(Date.now() - 14400000),
        duration: 14400000,
        betsPlaced: 23,
        totalStake: 2340.0,
        pnl: 456.78,
        winRate: 0.652,
        sharpeRatio: 1.89,
        maxDrawdown: -0.085,
      };

      setOpportunities(mockOpportunities);
      setPortfolio(mockPortfolio);
      setTradingSession(mockSession);
    } catch (error) {
      console.error("Failed to load trading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadTradingData();

    // Auto-refresh data
    const interval = setInterval(loadTradingData, 30000);
    return () => clearInterval(interval);
  }, [loadTradingData]);

  // Filtered opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities;

    if (filters.sport !== "all") {
      filtered = filtered.filter((opp) => opp.sport === filters.sport);
    }

    if (filters.market !== "all") {
      filtered = filtered.filter((opp) => opp.market === filters.market);
    }

    if (filters.minEdge > 0) {
      filtered = filtered.filter(
        (opp) => opp.prediction.edge >= filters.minEdge,
      );
    }

    if (filters.maxRisk !== "high") {
      const riskOrder = { low: 0, medium: 1, high: 2 };
      const maxRiskLevel = riskOrder[filters.maxRisk as keyof typeof riskOrder];
      filtered = filtered.filter(
        (opp) => riskOrder[opp.riskLevel] <= maxRiskLevel,
      );
    }

    if (filters.minConfidence > 0) {
      filtered = filtered.filter(
        (opp) => opp.prediction.confidence >= filters.minConfidence,
      );
    }

    if (showOnlyEdge) {
      filtered = filtered.filter((opp) => opp.prediction.edge > 0);
    }

    return filtered.sort(
      (a, b) => b.prediction.expectedValue - a.prediction.expectedValue,
    );
  }, [opportunities, filters, showOnlyEdge]);

  // Bet slip calculations
  const betSlipTotals = useMemo(() => {
    const totalStake = betSlip.reduce((sum, item) => sum + item.stake, 0);
    const totalPayout = betSlip.reduce(
      (sum, item) => sum + item.potentialPayout,
      0,
    );
    const totalProfit = totalPayout - totalStake;

    return { totalStake, totalPayout, totalProfit };
  }, [betSlip]);

  // Portfolio metrics
  const portfolioMetrics = useMemo(() => {
    const totalExposure = portfolio.reduce((sum, pos) => sum + pos.exposure, 0);
    const totalPnL = portfolio.reduce((sum, pos) => sum + pos.pnl, 0);
    const totalPositions = portfolio.reduce(
      (sum, pos) => sum + pos.positions,
      0,
    );
    const totalVar = portfolio.reduce(
      (sum, pos) => sum + pos.riskMetrics.var,
      0,
    );

    return { totalExposure, totalPnL, totalPositions, totalVar };
  }, [portfolio]);

  // Event Handlers
  const handleAddToBetSlip = useCallback(
    (opportunity: BettingOpportunity, stake: number = 50) => {
      const existingItem = betSlip.find(
        (item) => item.opportunityId === opportunity.id,
      );

      if (existingItem) {
        setBetSlip((prev) =>
          prev.map((item) =>
            item.opportunityId === opportunity.id
              ? {
                  ...item,
                  stake: item.stake + stake,
                  potentialPayout: (item.stake + stake) * opportunity.odds,
                }
              : item,
          ),
        );
      } else {
        const newItem: BetSlipItem = {
          opportunityId: opportunity.id,
          stake,
          potentialPayout: stake * opportunity.odds,
          odds: opportunity.odds,
          isLocked: false,
        };
        setBetSlip((prev) => [...prev, newItem]);
      }
    },
    [betSlip],
  );

  const handleRemoveFromBetSlip = useCallback((opportunityId: string) => {
    setBetSlip((prev) =>
      prev.filter((item) => item.opportunityId !== opportunityId),
    );
  }, []);

  const handleUpdateStake = useCallback(
    (opportunityId: string, newStake: number) => {
      setBetSlip((prev) =>
        prev.map((item) =>
          item.opportunityId === opportunityId
            ? {
                ...item,
                stake: newStake,
                potentialPayout: newStake * item.odds,
              }
            : item,
        ),
      );
    },
    [],
  );

  const handlePlaceBets = useCallback(async () => {
    try {
      setIsLoading(true);

      // Simulate placing bets
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear bet slip
      setBetSlip([]);

      // Update session stats
      if (tradingSession) {
        setTradingSession((prev) =>
          prev
            ? {
                ...prev,
                betsPlaced: prev.betsPlaced + betSlip.length,
                totalStake: prev.totalStake + betSlipTotals.totalStake,
              }
            : null,
        );
      }

      console.log("Bets placed successfully");
    } catch (error) {
      console.error("Failed to place bets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [betSlip, betSlipTotals.totalStake, tradingSession]);

  const handleStartTrading = useCallback(() => {
    setIsTrading(true);
    if (!tradingSession) {
      setTradingSession({
        id: `session-${Date.now()}`,
        startTime: new Date(),
        duration: 0,
        betsPlaced: 0,
        totalStake: 0,
        pnl: 0,
        winRate: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
      });
    }
  }, [tradingSession]);

  const handleStopTrading = useCallback(() => {
    setIsTrading(false);
    setAutoTrading(false);
  }, []);

  if (isLoading && opportunities.length === 0) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Grid container spacing={2}>
        {/* Main Trading Interface */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 2 }}>
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
                  <CandlestickChart />
                  Unified Betting Interface
                  <Badge
                    badgeContent={filteredOpportunities.length}
                    color="primary"
                  >
                    <Assessment />
                  </Badge>
                </Typography>
                <Box display="flex" gap={1} alignItems="center">
                  {!isTrading ? (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleStartTrading}
                      startIcon={<PlayArrow />}
                    >
                      Start Trading
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleStopTrading}
                      startIcon={<Stop />}
                    >
                      Stop Trading
                    </Button>
                  )}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoTrading}
                        onChange={(e) => setAutoTrading(e.target.checked)}
                        disabled={!isTrading}
                      />
                    }
                    label="Auto"
                  />
                  <IconButton onClick={loadTradingData}>
                    <Refresh />
                  </IconButton>
                </Box>
              </Box>

              {/* Trading Session Stats */}
              {tradingSession && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 1, textAlign: "center" }}>
                      <Typography variant="h6" color="primary.main">
                        {tradingSession.betsPlaced}
                      </Typography>
                      <Typography variant="caption">Bets Placed</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 1, textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        color={
                          tradingSession.pnl >= 0
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {formatCurrency(tradingSession.pnl)}
                      </Typography>
                      <Typography variant="caption">Session P&L</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 1, textAlign: "center" }}>
                      <Typography variant="h6">
                        {formatPercentage(tradingSession.winRate)}
                      </Typography>
                      <Typography variant="caption">Win Rate</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 1, textAlign: "center" }}>
                      <Typography variant="h6">
                        {tradingSession.sharpeRatio.toFixed(2)}
                      </Typography>
                      <Typography variant="caption">Sharpe</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* Filters and Controls */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sport</InputLabel>
                    <Select
                      value={filters.sport}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          sport: e.target.value,
                        }))
                      }
                    >
                      <MenuItem value="all">All Sports</MenuItem>
                      <MenuItem value="Basketball">Basketball</MenuItem>
                      <MenuItem value="Football">Football</MenuItem>
                      <MenuItem value="Soccer">Soccer</MenuItem>
                      <MenuItem value="Tennis">Tennis</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Market</InputLabel>
                    <Select
                      value={filters.market}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          market: e.target.value,
                        }))
                      }
                    >
                      <MenuItem value="all">All Markets</MenuItem>
                      <MenuItem value="Player Points">Player Points</MenuItem>
                      <MenuItem value="Spread">Spread</MenuItem>
                      <MenuItem value="Match Result">Match Result</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Min Edge %"
                    type="number"
                    value={filters.minEdge * 100}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minEdge: Number(e.target.value) / 100,
                      }))
                    }
                    inputProps={{ min: 0, max: 50, step: 1 }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Min Confidence %"
                    type="number"
                    value={filters.minConfidence * 100}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minConfidence: Number(e.target.value) / 100,
                      }))
                    }
                    inputProps={{ min: 0, max: 100, step: 5 }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showOnlyEdge}
                        onChange={(e) => setShowOnlyEdge(e.target.checked)}
                      />
                    }
                    label="Edge Only"
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={riskManagement}
                        onChange={(e) => setRiskManagement(e.target.checked)}
                      />
                    }
                    label="Risk Mgmt"
                  />
                </Grid>
              </Grid>

              {/* Opportunities Table */}
              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Market</TableCell>
                      <TableCell>Odds</TableCell>
                      <TableCell>Edge</TableCell>
                      <TableCell>Confidence</TableCell>
                      <TableCell>EV</TableCell>
                      <TableCell>Kelly</TableCell>
                      <TableCell>Risk</TableCell>
                      <TableCell>Volume</TableCell>
                      <TableCell>Expiry</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOpportunities.map((opportunity) => (
                      <TableRow
                        key={opportunity.id}
                        sx={{
                          "&:hover": { backgroundColor: "action.hover" },
                          backgroundColor:
                            opportunity.prediction.edge > 0.1
                              ? "success.light"
                              : "inherit",
                          opacity: opportunity.prediction.edge > 0.1 ? 1 : 0.8,
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {opportunity.event}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {opportunity.sport} • {opportunity.league}
                            </Typography>
                            <Box display="flex" gap={0.5} mt={0.5}>
                              {opportunity.tags.map((tag) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {opportunity.market}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {opportunity.selection}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {formatOdds(opportunity.odds)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatPercentage(opportunity.impliedProbability)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={formatPercentage(
                              opportunity.prediction.edge,
                            )}
                            color={
                              opportunity.prediction.edge > 0.1
                                ? "success"
                                : opportunity.prediction.edge > 0.05
                                  ? "warning"
                                  : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LinearProgress
                              variant="determinate"
                              value={opportunity.prediction.confidence * 100}
                              sx={{ width: 40, height: 6 }}
                              color={
                                opportunity.prediction.confidence > 0.8
                                  ? "success"
                                  : opportunity.prediction.confidence > 0.6
                                    ? "warning"
                                    : "error"
                              }
                            />
                            <Typography variant="caption">
                              {formatPercentage(
                                opportunity.prediction.confidence,
                              )}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color={
                              opportunity.prediction.expectedValue > 0
                                ? "success.main"
                                : "error.main"
                            }
                            fontWeight="bold"
                          >
                            {formatCurrency(
                              opportunity.prediction.expectedValue,
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatPercentage(
                              opportunity.prediction.kellyFraction,
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={RISK_LEVELS[opportunity.riskLevel].label}
                            size="small"
                            sx={{
                              backgroundColor:
                                RISK_LEVELS[opportunity.riskLevel].color,
                              color: "white",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatCurrency(opportunity.volume)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {Math.floor(opportunity.timeToExpiry / 60000)}m
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <ButtonGroup size="small">
                            <Button
                              onClick={() =>
                                handleAddToBetSlip(
                                  opportunity,
                                  Math.min(
                                    maxStakePerBet,
                                    totalBankroll *
                                      opportunity.prediction.kellyFraction,
                                  ),
                                )
                              }
                              startIcon={<Add />}
                              disabled={!isTrading}
                            >
                              Bet
                            </Button>
                            <Button
                              onClick={() =>
                                setSelectedOpportunity(opportunity)
                              }
                              startIcon={<Visibility />}
                            >
                              View
                            </Button>
                          </ButtonGroup>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Bet Slip and Portfolio */}
        <Grid item xs={12} md={4}>
          {/* Bet Slip */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <ShoppingCart />
                  Bet Slip
                  <Badge badgeContent={betSlip.length} color="primary" />
                </Typography>
                <IconButton
                  onClick={() => setBetSlip([])}
                  disabled={betSlip.length === 0}
                >
                  <Delete />
                </IconButton>
              </Box>

              <Stack spacing={2} sx={{ maxHeight: 400, overflow: "auto" }}>
                {betSlip.map((item) => {
                  const opportunity = opportunities.find(
                    (opp) => opp.id === item.opportunityId,
                  );
                  if (!opportunity) return null;

                  return (
                    <Paper key={item.opportunityId} sx={{ p: 2 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {opportunity.event}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleRemoveFromBetSlip(item.opportunityId)
                          }
                        >
                          <Remove />
                        </IconButton>
                      </Box>

                      <Typography
                        variant="caption"
                        color="textSecondary"
                        gutterBottom
                      >
                        {opportunity.selection} @ {formatOdds(item.odds)}
                      </Typography>

                      <Box display="flex" gap={1} alignItems="center" mt={1}>
                        <TextField
                          size="small"
                          label="Stake"
                          type="number"
                          value={item.stake}
                          onChange={(e) =>
                            handleUpdateStake(
                              item.opportunityId,
                              Number(e.target.value),
                            )
                          }
                          sx={{ flex: 1 }}
                          inputProps={{ min: 1, max: maxStakePerBet }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => {
                            setBetSlip((prev) =>
                              prev.map((bet) =>
                                bet.opportunityId === item.opportunityId
                                  ? { ...bet, isLocked: !bet.isLocked }
                                  : bet,
                              ),
                            );
                          }}
                        >
                          {item.isLocked ? <Lock /> : <LockOpen />}
                        </IconButton>
                      </Box>

                      <Box display="flex" justifyContent="space-between" mt={1}>
                        <Typography variant="caption">
                          Potential Payout:
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {formatCurrency(item.potentialPayout)}
                        </Typography>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>

              {betSlip.length > 0 && (
                <Box mt={2}>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Total Stake:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(betSlipTotals.totalStake)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Potential Payout:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(betSlipTotals.totalPayout)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Potential Profit:</Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={
                          betSlipTotals.totalProfit > 0
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {formatCurrency(betSlipTotals.totalProfit)}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handlePlaceBets}
                      disabled={!isTrading || betSlip.length === 0 || isLoading}
                      sx={{ mt: 2 }}
                    >
                      {isLoading ? (
                        <LinearProgress sx={{ width: "100%" }} />
                      ) : (
                        "Place Bets"
                      )}
                    </Button>
                  </Stack>
                </Box>
              )}

              {betSlip.length === 0 && (
                <Alert severity="info">
                  Add opportunities to your bet slip to start trading.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Portfolio Overview */}
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <PieChart />
                  Portfolio
                </Typography>
                <IconButton onClick={() => setShowPortfolioDialog(true)}>
                  <Visibility />
                </IconButton>
              </Box>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption">Total Exposure</Typography>
                  <Typography variant="h5" color="primary.main">
                    {formatCurrency(portfolioMetrics.totalExposure)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption">Total P&L</Typography>
                  <Typography
                    variant="h5"
                    color={
                      portfolioMetrics.totalPnL >= 0
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    {formatCurrency(portfolioMetrics.totalPnL)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {portfolioMetrics.totalPnL >= 0 ? (
                      <TrendingUp color="success" fontSize="small" />
                    ) : (
                      <TrendingDown color="error" fontSize="small" />
                    )}
                    <Typography variant="caption">
                      {formatPercentage(
                        portfolioMetrics.totalPnL /
                          portfolioMetrics.totalExposure,
                      )}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Stack spacing={1}>
                  {portfolio.map((position) => (
                    <Box key={position.id}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2">
                          {position.sport}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={
                            position.pnl >= 0 ? "success.main" : "error.main"
                          }
                          fontWeight="bold"
                        >
                          {formatCurrency(position.pnl)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        {position.positions} positions •{" "}
                        {formatCurrency(position.exposure)} exposure
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <Alert severity="warning" icon={<Warning />}>
                  <Typography variant="caption">
                    VaR (95%):{" "}
                    {formatCurrency(Math.abs(portfolioMetrics.totalVar))}
                  </Typography>
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default UnifiedBettingInterface;
