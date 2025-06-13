import React, { useState, useEffect } from 'react';
import { useMoneyMakerStore } from '../stores/moneyMakerStore';
import { UnifiedBettingService } from '../services/unified/UnifiedBettingService';
import { UnifiedPredictionService } from '../services/unified/UnifiedPredictionService';
import { ArbitrageService } from '../services/ArbitrageService';
import { PrizePicksAPI } from '../services/PrizePicksAPI';
import { UnifiedWebSocketService } from '../services/unified/UnifiedWebSocketService';
import KellyCalculator from './betting/KellyCalculator';
import { Card, Grid, Typography, Slider, Select, MenuItem, Button, CircularProgress, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';

interface OpportunityCard {
  id: string;
  type: 'prizepicks' | 'arbitrage' | 'value_bet';
  playerName: string;
  statType: string;
  line: number;
  overOdds: number;
  underOdds: number;
  confidence: number;
  expectedValue: number;
  kellyFraction: number;
  projectedValue: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeRemaining: string;
  analysis: {
    historicalTrends: string[];
    marketSignals: string[];
    riskFactors: string[];
    modelBreakdown: Record<string, number>;
  };
}

interface ConfigurationMatrix {
  investmentAmount: number;
  mlModelSet: string;
  confidenceThreshold: number;
  strategyMode: string;
  portfolioSize: number;
  sportsUniverse: string[];
  timeWindow: string;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  kellyMultiplier: number;
  maxExposurePerBet: number;
}

const INITIAL_CONFIG: ConfigurationMatrix = {
  investmentAmount: 1000,
  mlModelSet: 'ensemble',
  confidenceThreshold: 85,
  strategyMode: 'kelly_optimal',
  portfolioSize: 5,
  sportsUniverse: ['NBA', 'NFL'],
  timeWindow: 'today',
  riskProfile: 'moderate',
  kellyMultiplier: 0.25,
  maxExposurePerBet: 0.05,
};

const STRATEGY_MODES = [
  { value: 'kelly_optimal', label: '🎯 Kelly Optimal (Recommended)' },
  { value: 'arbitrage_hunter', label: '🔄 Arbitrage Hunter' },
  { value: 'value_maximizer', label: '💎 Value Maximizer' },
  { value: 'risk_parity', label: '⚖️ Risk Parity' },
  { value: 'momentum', label: '📈 Momentum' },
  { value: 'contrarian', label: '🔀 Contrarian' },
];

export const UltimateMoneyMakerEnhanced: React.FC = () => {
  const theme = useTheme();
  const [config, setConfig] = useState<ConfigurationMatrix>(INITIAL_CONFIG);
  const [opportunities, setOpportunities] = useState<OpportunityCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalExpectedValue, setTotalExpectedValue] = useState(0);
  const [optimalBankrollAllocation, setOptimalBankrollAllocation] = useState<Record<string, number>>({});
  const [realTimeUpdates, setRealTimeUpdates] = useState(0);

  // Services
  const bettingService = UnifiedBettingService.getInstance();
  const predictionService = UnifiedPredictionService.getInstance();
  const arbitrageService = ArbitrageService.getInstance();
  const prizePicksService = PrizePicksAPI.getInstance();
  const wsService = UnifiedWebSocketService.getInstance();

  useEffect(() => {
    // Subscribe to real-time opportunities
    const handleOpportunity = (data: any) => {
      setRealTimeUpdates(prev => prev + 1);
      if (data.confidence >= config.confidenceThreshold / 100) {
        generateOpportunityCard(data);
      }
    };

    wsService.subscribe('betting:opportunity', handleOpportunity);
    wsService.subscribe('arbitrage:found', handleOpportunity);
    wsService.subscribe('market:value_bet', handleOpportunity);

    return () => {
      wsService.unsubscribe('betting:opportunity', handleOpportunity);
      wsService.unsubscribe('arbitrage:found', handleOpportunity);
      wsService.unsubscribe('market:value_bet', handleOpportunity);
    };
  }, [config.confidenceThreshold]);

  const generateOpportunityCard = async (data: any): Promise<OpportunityCard> => {
    // Enhanced opportunity generation with full ML analysis
    const prediction = await predictionService.getPrediction({
      playerId: data.playerId,
      metric: data.statType,
      timeframe: config.timeWindow
    });

    const kellyFraction = calculateKellyFraction(
      prediction.confidence,
      data.odds,
      config.kellyMultiplier
    );

    return {
      id: data.id || Math.random().toString(36),
      type: data.type || 'value_bet',
      playerName: data.playerName,
      statType: data.statType,
      line: data.line,
      overOdds: data.overOdds || data.odds,
      underOdds: data.underOdds || data.odds,
      confidence: prediction.confidence,
      expectedValue: calculateExpectedValue(prediction, data.odds),
      kellyFraction,
      projectedValue: prediction.value,
      riskLevel: getRiskLevel(prediction.confidence, kellyFraction),
      timeRemaining: data.timeRemaining || 'Unknown',
      analysis: {
        historicalTrends: prediction.historicalTrends || [],
        marketSignals: prediction.marketSignals || [],
        riskFactors: prediction.riskFactors || [],
        modelBreakdown: prediction.modelBreakdown || {},
      }
    };
  };

  const calculateKellyFraction = (confidence: number, odds: number, multiplier: number): number => {
    const b = odds - 1; // net odds
    const p = confidence; // probability of winning
    const q = 1 - p; // probability of losing
    
    const kelly = (b * p - q) / b;
    return Math.max(0, Math.min(kelly * multiplier, config.maxExposurePerBet));
  };

  const calculateExpectedValue = (prediction: any, odds: number): number => {
    const impliedProbability = 1 / odds;
    const trueProbability = prediction.confidence;
    return (trueProbability * odds - 1) * 100; // Return as percentage
  };

  const getRiskLevel = (confidence: number, kellyFraction: number): 'low' | 'medium' | 'high' => {
    if (confidence > 0.8 && kellyFraction < 0.03) return 'low';
    if (confidence > 0.7 && kellyFraction < 0.06) return 'medium';
    return 'high';
  };

  const generateOptimalLineup = async () => {
    try {
      setIsGenerating(true);
      setOpportunities([]);

      // Multi-strategy opportunity generation
      const strategies = await Promise.all([
        generatePrizePicksOpportunities(),
        generateArbitrageOpportunities(),
        generateValueBetOpportunities(),
      ]);

      const allOpportunities = strategies.flat();
      
      // Apply Kelly Criterion optimization
      const optimizedPortfolio = optimizePortfolio(allOpportunities);
      
      setOpportunities(optimizedPortfolio);
      setTotalExpectedValue(
        optimizedPortfolio.reduce((sum, opp) => sum + opp.expectedValue, 0)
      );

      // Calculate optimal bankroll allocation
      const allocation = calculateOptimalAllocation(optimizedPortfolio);
      setOptimalBankrollAllocation(allocation);

      toast.success(`Generated ${optimizedPortfolio.length} optimal opportunities!`);
    } catch (error) {
      toast.error('Failed to generate opportunities');
      console.error('Error generating opportunities:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePrizePicksOpportunities = async (): Promise<OpportunityCard[]> => {
    try {
      const props = await prizePicksService.getAvailableProps({
        sports: config.sportsUniverse,
        timeWindow: config.timeWindow,
      });

      const opportunities: OpportunityCard[] = [];
      
      for (const prop of props.slice(0, 20)) { // Limit to top 20 for performance
        const prediction = await predictionService.getPrediction({
          playerId: prop.playerId,
          metric: prop.statType,
          timeframe: config.timeWindow
        });

        if (prediction.confidence >= config.confidenceThreshold / 100) {
          const opportunity = await generateOpportunityCard({
            ...prop,
            type: 'prizepicks',
            odds: prop.overOdds,
          });
          opportunities.push(opportunity);
        }
      }

      return opportunities;
    } catch (error) {
      console.error('Error generating PrizePicks opportunities:', error);
      return [];
    }
  };

  const generateArbitrageOpportunities = async (): Promise<OpportunityCard[]> => {
    try {
      const arbOpportunities = await arbitrageService.findOpportunities({
        sports: config.sportsUniverse,
        minProfit: 0.02, // 2% minimum profit
        timeWindow: config.timeWindow,
      });

      return Promise.all(arbOpportunities.map(arb => generateOpportunityCard({
        ...arb,
        type: 'arbitrage',
        confidence: 0.99, // Arbitrage has near-certain profit
      })));
    } catch (error) {
      console.error('Error generating arbitrage opportunities:', error);
      return [];
    }
  };

  const generateValueBetOpportunities = async (): Promise<OpportunityCard[]> => {
    try {
      const valueBets = await bettingService.findValueBets({
        sports: config.sportsUniverse,
        minEdge: 0.05, // 5% minimum edge
        confidenceThreshold: config.confidenceThreshold / 100,
      });

      return Promise.all(valueBets.map(bet => generateOpportunityCard({
        ...bet,
        type: 'value_bet',
      })));
    } catch (error) {
      console.error('Error generating value bet opportunities:', error);
      return [];
    }
  };

  const optimizePortfolio = (opportunities: OpportunityCard[]): OpportunityCard[] => {
    // Sort by Kelly-adjusted expected value
    const sorted = opportunities.sort((a, b) => {
      const aScore = a.expectedValue * a.kellyFraction * a.confidence;
      const bScore = b.expectedValue * b.kellyFraction * b.confidence;
      return bScore - aScore;
    });

    // Apply portfolio constraints
    const optimized = [];
    let totalAllocation = 0;
    
    for (const opp of sorted) {
      if (optimized.length >= config.portfolioSize) break;
      if (totalAllocation + opp.kellyFraction > 0.25) break; // Max 25% total exposure
      
      optimized.push(opp);
      totalAllocation += opp.kellyFraction;
    }

    return optimized;
  };

  const calculateOptimalAllocation = (opportunities: OpportunityCard[]): Record<string, number> => {
    const allocation: Record<string, number> = {};
    
    opportunities.forEach(opp => {
      const amount = config.investmentAmount * opp.kellyFraction;
      allocation[opp.id] = Math.round(amount);
    });

    return allocation;
  };

  const placeBet = async (opportunity: OpportunityCard) => {
    try {
      const amount = optimalBankrollAllocation[opportunity.id] || 0;
      
      const result = await bettingService.placeBet({
        opportunityId: opportunity.id,
        amount,
        type: opportunity.type,
        selection: opportunity.projectedValue > opportunity.line ? 'over' : 'under',
      });

      if (result.success) {
        toast.success(`Bet placed: $${amount} on ${opportunity.playerName} ${opportunity.statType}`);
        // Update opportunity status
        setOpportunities(prev => prev.filter(opp => opp.id !== opportunity.id));
      } else {
        toast.error(`Failed to place bet: ${result.error}`);
      }
    } catch (error) {
      toast.error('Error placing bet');
      console.error('Error placing bet:', error);
    }
  };

  const handleConfigChange = (key: keyof ConfigurationMatrix, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <Card sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="h4" className="font-bold">
              💰 Ultimate Money Maker Enhanced
            </Typography>
            <Typography variant="subtitle1">
              AI-Powered Optimal Betting with Kelly Criterion & Real-time Arbitrage
            </Typography>
          </div>
          <div className="text-right">
            <Typography variant="h6">
              Live Updates: {realTimeUpdates}
            </Typography>
            <Typography variant="body2">
              Expected Value: +{totalExpectedValue.toFixed(2)}%
            </Typography>
          </div>
        </div>
      </Card>

      {/* Configuration Matrix */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🎛️ Configuration Matrix
        </Typography>
        
        <Grid container spacing={3}>
          {/* Investment Amount */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Investment Amount: ${config.investmentAmount}</Typography>
            <Slider
              value={config.investmentAmount}
              min={100}
              max={100000}
              step={100}
              onChange={(_, value) => handleConfigChange('investmentAmount', value)}
              valueLabelDisplay="auto"
              valueLabelFormat={value => `$${value.toLocaleString()}`}
            />
          </Grid>

          {/* Strategy Mode */}
          <Grid item xs={12} md={6}>
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

          {/* Confidence Threshold */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Confidence Threshold: {config.confidenceThreshold}%</Typography>
            <Slider
              value={config.confidenceThreshold}
              min={70}
              max={99}
              step={1}
              onChange={(_, value) => handleConfigChange('confidenceThreshold', value)}
              valueLabelDisplay="auto"
              valueLabelFormat={value => `${value}%`}
            />
          </Grid>

          {/* Kelly Multiplier */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Kelly Multiplier: {config.kellyMultiplier}</Typography>
            <Slider
              value={config.kellyMultiplier}
              min={0.1}
              max={1.0}
              step={0.05}
              onChange={(_, value) => handleConfigChange('kellyMultiplier', value)}
              valueLabelDisplay="auto"
              valueLabelFormat={value => `${value}x`}
            />
          </Grid>
        </Grid>

        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={isGenerating}
          onClick={generateOptimalLineup}
          sx={{ mt: 3, py: 2 }}
        >
          {isGenerating ? (
            <>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              Generating Optimal Opportunities...
            </>
          ) : (
            '🚀 Generate Optimal Money-Making Opportunities'
          )}
        </Button>
      </Card>

      {/* Opportunities Display */}
      {opportunities.length > 0 && (
        <Grid container spacing={3}>
          {opportunities.map((opportunity) => (
            <Grid item xs={12} md={6} lg={4} key={opportunity.id}>
              <Card 
                sx={{ 
                  p: 3, 
                  border: opportunity.riskLevel === 'low' ? '2px solid #4caf50' : 
                         opportunity.riskLevel === 'medium' ? '2px solid #ff9800' : '2px solid #f44336',
                  position: 'relative'
                }}
              >
                {/* Risk Level Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${
                  opportunity.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                  opportunity.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {opportunity.riskLevel.toUpperCase()} RISK
                </div>

                <Typography variant="h6" className="font-bold mb-2">
                  {opportunity.playerName}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" className="mb-2">
                  {opportunity.statType} • Line: {opportunity.line}
                </Typography>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span className="font-bold">{(opportunity.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Value:</span>
                    <span className="font-bold text-green-600">+{opportunity.expectedValue.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kelly Fraction:</span>
                    <span className="font-bold">{(opportunity.kellyFraction * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recommended Bet:</span>
                    <span className="font-bold text-blue-600">
                      ${optimalBankrollAllocation[opportunity.id] || 0}
                    </span>
                  </div>
                </div>

                {/* Kelly Calculator Integration */}
                <KellyCalculator
                  prediction={opportunity.confidence}
                  confidence={opportunity.confidence}
                  marketEdge={opportunity.expectedValue / 100}
                />

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => placeBet(opportunity)}
                  sx={{ mt: 2 }}
                >
                  Place Optimal Bet
                </Button>

                {/* Model Breakdown */}
                {Object.keys(opportunity.analysis.modelBreakdown).length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <Typography variant="caption" display="block" gutterBottom>
                      Model Breakdown:
                    </Typography>
                    {Object.entries(opportunity.analysis.modelBreakdown).map(([model, weight]) => (
                      <div key={model} className="flex justify-between text-xs">
                        <span>{model}:</span>
                        <span>{(weight * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Portfolio Summary */}
      {opportunities.length > 0 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            📊 Portfolio Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Typography variant="h4" color="primary">
                {opportunities.length}
              </Typography>
              <Typography variant="body2">Active Opportunities</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h4" color="success.main">
                +{totalExpectedValue.toFixed(2)}%
              </Typography>
              <Typography variant="body2">Total Expected Value</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h4" color="info.main">
                ${Object.values(optimalBankrollAllocation).reduce((sum, amount) => sum + amount, 0)}
              </Typography>
              <Typography variant="body2">Total Allocation</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h4" color="warning.main">
                {((Object.values(optimalBankrollAllocation).reduce((sum, amount) => sum + amount, 0) / config.investmentAmount) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2">Bankroll Utilization</Typography>
            </Grid>
          </Grid>
        </Card>
      )}
    </div>
  );
};

export default UltimateMoneyMakerEnhanced;
