import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { BetRecommendation, BettingAlert, BettingOpportunity } from '../../types/betting';
import { formatCurrency, formatPercentage, formatOdds } from '../../utils/formatters';

interface BettingOpportunitiesProps {
  opportunities: (BetRecommendation | BettingOpportunity)[];
  onBetPlacement: (opportunity: BetRecommendation | BettingOpportunity) => void;
  alerts: BettingAlert[];
  isLoading: boolean;
}

export const BettingOpportunities: React.FC<BettingOpportunitiesProps> = ({
  opportunities,
  onBetPlacement,
  alerts,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (opportunities.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No betting opportunities available at the moment.
      </Alert>
    );
  }

  const isBetRecommendation = (
    opp: BetRecommendation | BettingOpportunity
  ): opp is BetRecommendation => {
    return 'confidence_score' in opp && 'expected_roi' in opp && 'recommended_stake' in opp;
  };

  return (
    <Stack spacing={2}>
      {alerts.map((alert, index) => (
        <Alert key={index} severity={alert.type === 'warning' ? 'warning' : 'info'} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      ))}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {opportunities.map(opportunity => (
          <Card
            key={isBetRecommendation(opportunity) ? opportunity.event_id : opportunity.id}
            sx={{ flex: '1 1 300px', maxWidth: '100%' }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Box alignItems="center" display="flex" justifyContent="space-between">
                  <Typography variant="h6">Betting Opportunity</Typography>
                  <Chip
                    color={
                      (isBetRecommendation(opportunity)
                        ? opportunity.confidence_score
                        : opportunity.confidence) > 0.7
                        ? 'success'
                        : 'warning'
                    }
                    label={`${formatPercentage(isBetRecommendation(opportunity) ? opportunity.confidence_score : opportunity.confidence)} Confidence`}
                  />
                </Box>

                <Stack spacing={2}>
                  {isBetRecommendation(opportunity) ? (
                    <>
                      <Box>
                        <Typography color="text.secondary" variant="body2">
                          Expected ROI
                        </Typography>
                        <Typography
                          color={opportunity.expected_roi > 0 ? 'success.main' : 'error.main'}
                          variant="h6"
                        >
                          {formatPercentage(opportunity.expected_roi)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography color="text.secondary" variant="body2">
                          Recommended Stake
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(opportunity.recommended_stake)}
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
                          color={opportunity.kellyValue > 0 ? 'success.main' : 'error.main'}
                          variant="h6"
                        >
                          {formatPercentage(opportunity.kellyValue)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography color="text.secondary" variant="body2">
                          Market Edge
                        </Typography>
                        <Typography
                          color={opportunity.marketEdge > 0 ? 'success.main' : 'error.main'}
                          variant="h6"
                        >
                          {formatPercentage(opportunity.marketEdge)}
                        </Typography>
                      </Box>
                    </>
                  )}

                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Odds
                    </Typography>
                    <Typography variant="h6">{formatOdds(opportunity.odds)}</Typography>
                  </Box>

                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Win Probability
                    </Typography>
                    <Typography variant="h6">
                      {formatPercentage(
                        isBetRecommendation(opportunity)
                          ? opportunity.prediction.home_win_probability
                          : opportunity.prediction
                      )}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    color="primary"
                    variant="contained"
                    onClick={() => onBetPlacement(opportunity)}
                  >
                    Place Bet
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Stack>
  );
};
