import React, { useState, useEffect } from 'react';
import { useStore } from '@/stores';
import { Card, Grid, Typography, Slider, Select, MenuItem, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MLService from '../../services/ml/index';
import PrizePicksService from '../../services/prizepicks/index';
import { toast } from 'react-toastify';

interface ConfigurationMatrix {
  investmentAmount: number;
  mlModelSet: string;
  confidenceThreshold: number;
  strategyMode: string;
  portfolioSize: number;
  sportsUniverse: string[];
  timeWindow: string;
}

const INITIAL_CONFIG: ConfigurationMatrix = {
  investmentAmount: 1000,
  mlModelSet: 'ensemble',
  confidenceThreshold: 85,
  strategyMode: 'balanced',
  portfolioSize: 3,
  sportsUniverse: ['NBA'],
  timeWindow: 'today',
};

const ML_MODEL_SETS = [
  { value: 'ensemble', label: 'Ensemble (All Models)' },
  { value: 'traditional', label: 'Traditional ML' },
  { value: 'deep_learning', label: 'Deep Learning' },
  { value: 'time_series', label: 'Time Series' },
  { value: 'optimization', label: 'Optimization' },
];

const STRATEGY_MODES = [
  { value: 'aggressive', label: 'Aggressive' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'conservative', label: 'Conservative' },
  { value: 'momentum', label: 'Momentum' },
  { value: 'contrarian', label: 'Contrarian' },
  { value: 'arbitrage', label: 'Arbitrage' },
];

const TIME_WINDOWS = [
  { value: 'today', label: 'Today' },
  { value: '3h', label: 'Next 3 Hours' },
  { value: '6h', label: 'Next 6 Hours' },
  { value: '12h', label: 'Next 12 Hours' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'week', label: 'This Week' },
  { value: 'weekend', label: 'This Weekend' },
  { value: 'custom', label: 'Custom Range' },
];

const SPORTS_OPTIONS = [
  { value: 'NBA', label: 'NBA' },
  { value: 'NFL', label: 'NFL' },
  { value: 'MLB', label: 'MLB' },
  { value: 'NHL', label: 'NHL' },
  { value: 'WNBA', label: 'WNBA' },
  { value: 'SOCCER', label: 'Soccer' },
];

export const UltimateMoneyMaker: React.FC = () => {
  const theme = useTheme();
  const [config, setConfig] = useState<ConfigurationMatrix>(INITIAL_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const handleConfigChange = (key: keyof ConfigurationMatrix, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const generateRecommendations = async () => {
    try {
      setIsGenerating(true);
      const mlService = MLService.getInstance();
      const prizepicksService = PrizePicksService.getInstance();

      // Get ML predictions
      const predictions = await mlService.predict({
        modelSet: config.mlModelSet,
        confidenceThreshold: config.confidenceThreshold,
        sports: config.sportsUniverse,
        timeWindow: config.timeWindow,
      });

      // Get PrizePicks props
      const props = await prizepicksService.getAvailableProps({
        sports: config.sportsUniverse,
        timeWindow: config.timeWindow,
      });

      // Generate optimized lineup
      const lineup = await prizepicksService.generateOptimizedLineup({
        predictions,
        props,
        investmentAmount: config.investmentAmount,
        strategyMode: config.strategyMode,
        portfolioSize: config.portfolioSize,
      });

      setRecommendations(lineup);
      toast.success('Generated optimized lineup!');
    } catch (error) {
      toast.error('Failed to generate recommendations');
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography gutterBottom variant="h5">
        Ultimate Money Maker
      </Typography>

      <Grid container spacing={3}>
        {/* Investment Amount */}
        <Grid item md={6} xs={12}>
          <Typography gutterBottom>Investment Amount</Typography>
          <Slider
            max={100000}
            min={100}
            step={100}
            value={config.investmentAmount}
            valueLabelDisplay="auto"
            valueLabelFormat={value => `$${value}`}
            onChange={(_, value) => handleConfigChange('investmentAmount', value)}
          />
        </Grid>

        {/* ML Model Set */}
        <Grid item md={6} xs={12}>
          <Typography gutterBottom>ML Model Set</Typography>
          <Select
            fullWidth
            value={config.mlModelSet}
            onChange={e => handleConfigChange('mlModelSet', e.target.value)}
          >
            {ML_MODEL_SETS.map(model => (
              <MenuItem key={model.value} value={model.value}>
                {model.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Confidence Threshold */}
        <Grid item md={6} xs={12}>
          <Typography gutterBottom>Confidence Threshold</Typography>
          <Slider
            max={99}
            min={80}
            step={1}
            value={config.confidenceThreshold}
            valueLabelDisplay="auto"
            valueLabelFormat={value => `${value}%`}
            onChange={(_, value) => handleConfigChange('confidenceThreshold', value)}
          />
        </Grid>

        {/* Strategy Mode */}
        <Grid item md={6} xs={12}>
          <Typography gutterBottom>Strategy Mode</Typography>
          <Select
            fullWidth
            value={config.strategyMode}
            onChange={e => handleConfigChange('strategyMode', e.target.value)}
          >
            {STRATEGY_MODES.map(strategy => (
              <MenuItem key={strategy.value} value={strategy.value}>
                {strategy.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Portfolio Size */}
        <Grid item md={6} xs={12}>
          <Typography gutterBottom>Portfolio Size</Typography>
          <Slider
            marks
            max={6}
            min={2}
            step={1}
            value={config.portfolioSize}
            valueLabelDisplay="auto"
            onChange={(_, value) => handleConfigChange('portfolioSize', value)}
          />
        </Grid>

        {/* Sports Universe */}
        <Grid item md={6} xs={12}>
          <Typography gutterBottom>Sports Universe</Typography>
          <Select
            fullWidth
            multiple
            value={config.sportsUniverse}
            onChange={e => handleConfigChange('sportsUniverse', e.target.value)}
          >
            {SPORTS_OPTIONS.map(sport => (
              <MenuItem key={sport.value} value={sport.value}>
                {sport.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Time Window */}
        <Grid item md={6} xs={12}>
          <Typography gutterBottom>Time Window</Typography>
          <Select
            fullWidth
            value={config.timeWindow}
            onChange={e => handleConfigChange('timeWindow', e.target.value)}
          >
            {TIME_WINDOWS.map(window => (
              <MenuItem key={window.value} value={window.value}>
                {window.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Generate Button */}
        <Grid item xs={12}>
          <Button
            fullWidth
            color="primary"
            disabled={isGenerating}
            variant="contained"
            onClick={generateRecommendations}
          >
            {isGenerating ? 'Generating...' : 'Generate Optimized Lineup'}
          </Button>
        </Grid>
      </Grid>

      {/* Recommendations Display */}
      {recommendations.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 3 }}>
          {recommendations.map((rec, index) => (
            <Grid key={index} item xs={12}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6">{rec.playerName}</Typography>
                <Typography>
                  Prop: {rec.propType} {rec.line}
                </Typography>
                <Typography>Confidence: {rec.confidence}%</Typography>
                <Typography>Expected Value: {rec.expectedValue}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Card>
  );
};

export default React.memo(UltimateMoneyMaker);
