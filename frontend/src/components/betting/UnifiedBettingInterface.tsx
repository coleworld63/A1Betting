import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Stack,
  Slider,
  TextField,
  Chip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatPercentage, formatOdds, formatDateTime } from '@/utils/formatters';
import {
  BetRecommendation,
  RiskProfileType,
  UserConstraints,
  BettingEvent,
  BettingAlert,
  SHAPExplanation,
  ShapFeature,
  BettingOpportunity,
} from '@/types/betting';
import { RiskProfileSelector } from './RiskProfileSelector';
import { BettingOpportunities } from './BettingOpportunities';
import { PerformanceMetrics } from './PerformanceMetrics';
import { LiveOddsTicker } from './LiveOddsTicker';
import { ConfidenceIndicator } from '@/components/common/ConfidenceIndicator';
import { ShapVisualization } from './SHAPVisualization';
import type { WebSocketMessage } from '../../types/webSocket';

// Unified Services
import UnifiedPredictionService from '@/services/unified/predictionService';
import UnifiedBettingService from '@/services/unified/bettingService';
import UnifiedAnalyticsService from '@/services/unified/analyticsService';
import UnifiedWebSocketService from '@/services/unified/WebSocketService';
import UnifiedSettingsService from '@/services/unified/settingsService';
import UnifiedNotificationService from '@/services/unified/notificationService';
import UnifiedErrorService from '@/services/unified/errorService';
import UnifiedLoggingService from '@/services/unified/loggingService';
import UnifiedStateService from '@/services/unified/stateService';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

interface UnifiedBettingInterfaceProps {
  initialBankroll: number;
  onBetPlaced: (bet: BetRecommendation) => void;
  darkMode?: boolean;
  onDarkModeChange?: (darkMode: boolean) => void;
}

interface BettingInterfaceState {
  bankroll: number;
  profit: number;
  riskProfile: RiskProfileType;
  userConstraints: UserConstraints;
  selectedEvent: BettingEvent | null;
  recommendations: BetRecommendation[];
  bettingOpportunities: BettingOpportunity[];
  alerts: any[];
  performance?: any;
}

export const UnifiedBettingInterface: React.FC<UnifiedBettingInterfaceProps> = ({
  initialBankroll,
  onBetPlaced,
  darkMode: externalDarkMode,
  onDarkModeChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { token } = useAuth();

  // Initialize unified services
  const predictionService = UnifiedPredictionService.getInstance();
  const bettingService = UnifiedBettingService.getInstance();
  const analyticsService = UnifiedAnalyticsService.getInstance();
  const wsService = UnifiedWebSocketService.getInstance();
  const settingsService = UnifiedSettingsService.getInstance();
  const notificationService = UnifiedNotificationService.getInstance();
  const errorService = UnifiedErrorService.getInstance();
  const loggingService = UnifiedLoggingService.getInstance();
  const stateService = UnifiedStateService.getInstance({
    initialState: {
      bankroll: initialBankroll,
      profit: 0,
      riskProfile: RiskProfileType.MODERATE,
      userConstraints: {
        max_bankroll_stake: 0.1,
        time_window_hours: 24,
        preferred_sports: [],
        preferred_markets: [],
      },
      selectedEvent: null,
      recommendations: [],
      bettingOpportunities: [],
      alerts: [],
    },
    storageKey: 'betting_interface_state',
  });

  // State from unified state service
  const [state, setState] = useState(stateService.getState());
  const [activeTab, setActiveTab] = useState(0);
  const [internalDarkMode, setInternalDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use external dark mode if provided, otherwise use internal state
  const darkMode = externalDarkMode ?? internalDarkMode;

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = stateService.subscribe(setState);
    return () => unsubscribe();
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    loggingService.info('Initializing WebSocket connection', 'UnifiedBettingInterface');
    wsService.connect();

    const handleBettingOpportunities = (data: BettingOpportunity[]) => {
      try {
        stateService.setState(
          { bettingOpportunities: data },
          'WebSocket',
          'betting_opportunities_update'
        );
        loggingService.debug('Received betting opportunities update', 'UnifiedBettingInterface', {
          count: data.length,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to handle betting opportunities';
        errorService.handleError(new Error(errorMessage), 'UnifiedBettingInterface', 'high', {
          action: 'handleBettingOpportunities',
        });
      }
    };

    const handleRecommendations = (data: BetRecommendation[]) => {
      try {
        stateService.setState({ recommendations: data }, 'WebSocket', 'recommendations_update');
        loggingService.debug('Received recommendations update', 'UnifiedBettingInterface', {
          count: data.length,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to handle recommendations';
        errorService.handleError(new Error(errorMessage), 'UnifiedBettingInterface', 'high', {
          action: 'handleRecommendations',
        });
      }
    };

    const handleEventUpdate = (data: BettingEvent) => {
      try {
        stateService.setState({ selectedEvent: data }, 'WebSocket', 'event_update');
        loggingService.debug('Received event update', 'UnifiedBettingInterface', {
          eventId: data.id,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to handle event update';
        errorService.handleError(new Error(errorMessage), 'UnifiedBettingInterface', 'high', {
          action: 'handleEventUpdate',
        });
      }
    };

    const handleOddsUpdate = (data: { eventId: string; odds: number }) => {
      try {
        const newState: Partial<BettingInterfaceState> = {
          bettingOpportunities: state.bettingOpportunities.map(opp =>
            opp.id === data.eventId ? { ...opp, odds: data.odds } : opp
          ),
        };
        stateService.setState(newState, 'WebSocket', 'odds_update');
        loggingService.debug('Received odds update', 'UnifiedBettingInterface', {
          eventId: data.eventId,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to handle odds update';
        errorService.handleError(new Error(errorMessage), 'UnifiedBettingInterface', 'high', {
          action: 'handleOddsUpdate',
        });
      }
    };

    const handlePredictionUpdate = (data: {
      eventId: string;
      prediction: {
        home_win_probability: number;
        away_win_probability: number;
        draw_probability: number;
      };
    }) => {
      try {
        const newState: Partial<BettingInterfaceState> = {
          recommendations: state.recommendations.map(rec =>
            rec.event_id === data.eventId ? { ...rec, prediction: data.prediction } : rec
          ),
        };
        stateService.setState(newState, 'WebSocket', 'prediction_update');
        loggingService.debug('Received prediction update', 'UnifiedBettingInterface', {
          eventId: data.eventId,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to handle prediction update';
        errorService.handleError(new Error(errorMessage), 'UnifiedBettingInterface', 'high', {
          action: 'handlePredictionUpdate',
        });
      }
    };

    const handleError = (message: WebSocketMessage) => {
      const errorMessage = message.payload.message || 'An error occurred';
      setError(errorMessage);
      errorService.handleError(new Error(errorMessage), 'UnifiedBettingInterface', 'high', {
        action: 'websocket_error',
        message,
      });
    };

    // Subscribe to WebSocket events
    wsService.subscribe('betting_opportunities', handleBettingOpportunities);
    wsService.subscribe('recommendations', handleRecommendations);
    wsService.subscribe('event_update', handleEventUpdate);
    wsService.subscribe('odds_update', handleOddsUpdate);
    wsService.subscribe('prediction_update', handlePredictionUpdate);
    wsService.subscribe('error', handleError);

    return () => {
      loggingService.info('Cleaning up WebSocket subscriptions', 'UnifiedBettingInterface');
      // Unsubscribe from WebSocket events
      wsService.unsubscribe('betting_opportunities', handleBettingOpportunities);
      wsService.unsubscribe('recommendations', handleRecommendations);
      wsService.unsubscribe('event_update', handleEventUpdate);
      wsService.unsubscribe('odds_update', handleOddsUpdate);
      wsService.unsubscribe('prediction_update', handlePredictionUpdate);
      wsService.unsubscribe('error', handleError);
      wsService.disconnect();
    };
  }, []);

  // Analytics and predictions setup
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        loggingService.info('Fetching analytics data', 'UnifiedBettingInterface');

        const [opportunities, predictions, performance] = await Promise.all([
          bettingService.getBettingOpportunities(),
          predictionService.getRecentPredictions(),
          analyticsService.getBettingMetrics(),
        ]);

        // Fetch SHAP values for each opportunity
        const opportunitiesWithShap = await Promise.all(
          opportunities.map(async opp => {
            try {
              const shapValues = await predictionService.getShapValues(opp.event_id);
              return {
                id: opp.event_id,
                event_id: opp.event_id,
                event_name: opp.market,
                start_time: opp.timestamp,
                confidence: opp.prediction?.confidence || 0,
                odds: opp.odds,
                prediction: opp.prediction?.probability || 0,
                marketEdge: opp.marketEdge,
                kellyValue: opp.prediction?.confidence || 0,
                shapValues: shapValues || {},
                timestamp: opp.timestamp,
              } as BettingOpportunity;
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : 'Failed to fetch SHAP values';
              errorService.handleError(
                new Error(errorMessage),
                'UnifiedBettingInterface',
                'medium',
                {
                  action: 'fetch_shap_values',
                  eventId: opp.event_id,
                }
              );
              return {
                id: opp.event_id,
                event_id: opp.event_id,
                event_name: opp.market,
                start_time: opp.timestamp,
                confidence: opp.prediction?.confidence || 0,
                odds: opp.odds,
                prediction: opp.prediction?.probability || 0,
                marketEdge: opp.marketEdge,
                kellyValue: opp.prediction?.confidence || 0,
                shapValues: {},
                timestamp: opp.timestamp,
              } as BettingOpportunity;
            }
          })
        );

        const mappedRecommendations: BetRecommendation[] = predictions.map(p => ({
          event_id: p.id,
          event_name: p.id,
          start_time: p.timestamp,
          confidence_score: p.confidence,
          expected_roi: p.marketEdge,
          recommended_stake: p.kellyValue * state.bankroll,
          odds: 0, // This will be updated by the betting service
          prediction: {
            home_win_probability: p.prediction,
            away_win_probability: 1 - p.prediction,
            draw_probability: 0,
          },
          animate: true,
        }));

        stateService.setState(
          {
            bettingOpportunities: opportunitiesWithShap,
            recommendations: mappedRecommendations,
            performance,
          },
          'Analytics',
          'fetch_analytics'
        );

        loggingService.info('Analytics data fetched successfully', 'UnifiedBettingInterface', {
          opportunitiesCount: opportunitiesWithShap.length,
          recommendationsCount: mappedRecommendations.length,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch analytics data';
        errorService.handleError(new Error(errorMessage), 'UnifiedBettingInterface', 'high', {
          action: 'fetch_analytics',
        });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Handle risk profile changes
  const handleRiskProfileChange = useCallback(
    (newProfile: RiskProfileType) => {
      try {
        stateService.setState({ riskProfile: newProfile }, 'User', 'risk_profile_change');

        const updates = {
          max_stake_percentage: state.userConstraints.max_bankroll_stake,
          min_confidence_threshold:
            newProfile === RiskProfileType.CONSERVATIVE
              ? 0.75
              : newProfile === RiskProfileType.MODERATE
                ? 0.6
                : 0.5,
          volatility_tolerance:
            newProfile === RiskProfileType.CONSERVATIVE
              ? 0.3
              : newProfile === RiskProfileType.MODERATE
                ? 0.5
                : 0.7,
          max_risk_score:
            newProfile === RiskProfileType.CONSERVATIVE
              ? 0.4
              : newProfile === RiskProfileType.MODERATE
                ? 0.6
                : 0.8,
        };

        wsService.send({
          type: 'update_risk_profile',
          payload: {
            profile_type: newProfile,
            updates,
          },
          timestamp: Date.now(),
        });

        loggingService.info('Risk profile updated', 'UnifiedBettingInterface', {
          newProfile,
          updates,
        });

        notificationService.notify('success', 'Risk profile updated successfully');
      } catch (error) {
        errorService.handleError(
          error instanceof Error ? error : new Error('Failed to update risk profile'),
          'UnifiedBettingInterface',
          'high',
          { action: 'update_risk_profile' }
        );
        notificationService.notify('error', 'Failed to update risk profile');
      }
    },
    [state.userConstraints.max_bankroll_stake]
  );

  // Handle user constraints changes
  const handleUserConstraintsChange = useCallback(
    (field: keyof UserConstraints, value: any) => {
      try {
        const newConstraints = {
          ...state.userConstraints,
          [field]: value,
        };

        stateService.setState({ userConstraints: newConstraints }, 'User', 'constraints_change');

        wsService.send({
          type: 'update_constraints',
          payload: {
            constraints: newConstraints,
          },
          timestamp: Date.now(),
        });

        loggingService.info('User constraints updated', 'UnifiedBettingInterface', {
          field,
          value,
          newConstraints,
        });

        notificationService.notify('success', 'Settings updated successfully');
      } catch (error) {
        errorService.handleError(
          error instanceof Error ? error : new Error('Failed to update constraints'),
          'UnifiedBettingInterface',
          'high',
          { action: 'update_constraints' }
        );
        notificationService.notify('error', 'Failed to update settings');
      }
    },
    [state.userConstraints]
  );

  const handleDarkModeToggle = useCallback(() => {
    try {
      if (onDarkModeChange) {
        onDarkModeChange(!darkMode);
      } else {
        setInternalDarkMode(!internalDarkMode);
      }
      loggingService.info('Dark mode toggled', 'UnifiedBettingInterface', { newMode: !darkMode });
    } catch (error) {
      errorService.handleError(
        error instanceof Error ? error : new Error('Failed to toggle dark mode'),
        'UnifiedBettingInterface',
        'low',
        { action: 'toggle_dark_mode' }
      );
    }
  }, [darkMode, onDarkModeChange]);

  const handleNotificationClose = () => {
    setError(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    try {
      setActiveTab(newValue);
      loggingService.debug('Tab changed', 'UnifiedBettingInterface', { newTab: newValue });
    } catch (error) {
      errorService.handleError(
        error instanceof Error ? error : new Error('Failed to change tab'),
        'UnifiedBettingInterface',
        'low',
        { action: 'change_tab' }
      );
    }
  };

  // Add the type guard function at the top of the file or before the render:
  const isBetRecommendation = (
    opp: BetRecommendation | BettingOpportunity
  ): opp is BetRecommendation => {
    return 'confidence_score' in opp && 'expected_roi' in opp && 'recommended_stake' in opp;
  };

  const handleBetPlacement = useCallback(
    (opportunity: BetRecommendation | BettingOpportunity) => {
      try {
        if ('confidence_score' in opportunity) {
          // It's a BetRecommendation
          onBetPlaced(opportunity);
          loggingService.info('Bet placed from recommendation', 'UnifiedBettingInterface', {
            opportunity,
          });
        } else {
          // It's a BettingOpportunity, convert to BetRecommendation
          const recommendation: BetRecommendation = {
            event_id: opportunity.event_id,
            event_name: opportunity.event_name,
            start_time: opportunity.start_time,
            confidence_score: opportunity.confidence,
            expected_roi: opportunity.marketEdge,
            recommended_stake: opportunity.kellyValue * state.bankroll,
            odds: opportunity.odds,
            prediction: {
              home_win_probability: opportunity.prediction,
              away_win_probability: 1 - opportunity.prediction,
              draw_probability: 0,
            },
          };
          onBetPlaced(recommendation);
          loggingService.info('Bet placed from opportunity', 'UnifiedBettingInterface', {
            opportunity,
          });
        }

        notificationService.notify('success', 'Bet placed successfully');
      } catch (error) {
        errorService.handleError(
          error instanceof Error ? error : new Error('Failed to place bet'),
          'UnifiedBettingInterface',
          'high',
          { action: 'place_bet' }
        );
        notificationService.notify('error', 'Failed to place bet');
      }
    },
    [onBetPlaced, state.bankroll]
  );

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2 }}>
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Typography gutterBottom variant="h6">
              Betting Opportunities
            </Typography>
            <Stack spacing={2}>
              {[...state.bettingOpportunities, ...state.recommendations].map((opp, idx) => (
                <Card key={isBetRecommendation(opp) ? opp.event_id : opp.id}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box alignItems="center" display="flex" justifyContent="space-between">
                        <Typography variant="h6">Betting Opportunity</Typography>
                        <Chip
                          color={
                            (isBetRecommendation(opp) ? opp.confidence_score : opp.confidence) > 0.7
                              ? 'success'
                              : 'warning'
                          }
                          label={`${formatPercentage(isBetRecommendation(opp) ? opp.confidence_score : opp.confidence)} Confidence`}
                        />
                      </Box>
                      <Stack spacing={2}>
                        {isBetRecommendation(opp) ? (
                          <>
                            <Box>
                              <Typography color="text.secondary" variant="body2">
                                Expected ROI
                              </Typography>
                              <Typography
                                color={opp.expected_roi > 0 ? 'success.main' : 'error.main'}
                                variant="h6"
                              >
                                {formatPercentage(opp.expected_roi)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography color="text.secondary" variant="body2">
                                Recommended Stake
                              </Typography>
                              <Typography variant="h6">
                                {formatCurrency(opp.recommended_stake)}
                              </Typography>
                            </Box>
                          </>
                        ) : (
                          <>
                            <Box>
                              <Typography color="text.secondary" variant="body2">
                                Kelly Value
                              </Typography>
                              <Typography
                                color={opp.kellyValue > 0 ? 'success.main' : 'error.main'}
                                variant="h6"
                              >
                                {formatPercentage(opp.kellyValue)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography color="text.secondary" variant="body2">
                                Market Edge
                              </Typography>
                              <Typography
                                color={opp.marketEdge > 0 ? 'success.main' : 'error.main'}
                                variant="h6"
                              >
                                {formatPercentage(opp.marketEdge)}
                              </Typography>
                            </Box>
                          </>
                        )}
                        <Box>
                          <Typography color="text.secondary" variant="body2">
                            Odds
                          </Typography>
                          <Typography variant="h6">{formatOdds(opp.odds)}</Typography>
                        </Box>
                        <Box>
                          <Typography color="text.secondary" variant="body2">
                            Win Probability
                          </Typography>
                          <Typography variant="h6">
                            {formatPercentage(
                              isBetRecommendation(opp)
                                ? opp.prediction.home_win_probability
                                : opp.prediction
                            )}
                          </Typography>
                        </Box>
                        <Button
                          fullWidth
                          color="primary"
                          variant="contained"
                          onClick={() => handleBetPlacement(opp)}
                        >
                          Place Bet
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={6000}
        open={!!error}
        onClose={handleNotificationClose}
      >
        <Alert severity="error" sx={{ width: '100%' }} onClose={handleNotificationClose}>
          {error}
        </Alert>
      </Snackbar>

      <BettingOpportunities
        alerts={state.alerts}
        isLoading={false}
        opportunities={[...state.bettingOpportunities, ...state.recommendations]}
        onBetPlacement={handleBetPlacement}
      />
    </Box>
  );
};
