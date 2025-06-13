import React, { useEffect, useState } from 'react';
import { MarketAnalysisService } from '../services/marketAnalysisService.js';
import type { MarketMetrics, MarketEfficiencyMetrics, MarketAnomaly } from '../types/betting.js';
import LineChart from 'recharts/lib/chart/LineChart';
import Line from 'recharts/lib/cartesian/Line';
import XAxis from 'recharts/lib/cartesian/XAxis';
import YAxis from 'recharts/lib/cartesian/YAxis';
import CartesianGrid from 'recharts/lib/cartesian/CartesianGrid';
import Tooltip from 'recharts/lib/component/Tooltip';
import Legend from 'recharts/lib/component/Legend';
import ResponsiveContainer from 'recharts/lib/component/ResponsiveContainer';
import RadarChart from 'recharts/lib/chart/RadarChart';
import PolarGrid from 'recharts/lib/polar/PolarGrid';
import PolarAngleAxis from 'recharts/lib/polar/PolarAngleAxis';
import PolarRadiusAxis from 'recharts/lib/polar/PolarRadiusAxis';
import Radar from 'recharts/lib/polar/Radar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

interface MarketAnalysisDashboardProps {
  eventId: string;
}

export const MarketAnalysisDashboard: React.FC<MarketAnalysisDashboardProps> = ({ eventId }) => {
  const [metrics, setMetrics] = useState<MarketMetrics | undefined>();
  const [efficiency, setEfficiency] = useState<MarketEfficiencyMetrics | undefined>();
  const [anomalies, setAnomalies] = useState<MarketAnomaly[]>([]);
  const marketAnalysisService = MarketAnalysisService.getInstance();

  useEffect(() => {
    // Initial data load
    setMetrics(marketAnalysisService.getMarketMetrics(eventId));
    setEfficiency(marketAnalysisService.getMarketEfficiency(eventId));
    setAnomalies(marketAnalysisService.getAnomalies(eventId));

    // Set up event listeners
    const handleMarketEfficiency = (data: {
      eventId: string;
      metrics: MarketEfficiencyMetrics;
    }) => {
      if (data.eventId === eventId) {
        setEfficiency(data.metrics);
      }
    };

    const handleMarketAnomaly = (data: { eventId: string; anomalies: MarketAnomaly[] }) => {
      if (data.eventId === eventId) {
        setAnomalies(data.anomalies);
      }
    };

    marketAnalysisService.on('marketEfficiency', handleMarketEfficiency);
    marketAnalysisService.on('marketAnomaly', handleMarketAnomaly);

    return () => {
      marketAnalysisService.removeListener('marketEfficiency', handleMarketEfficiency);
      marketAnalysisService.removeListener('marketAnomaly', handleMarketAnomaly);
    };
  }, [eventId, marketAnalysisService]);

  if (!metrics) {
    return <Typography>Loading market data...</Typography>;
  }

  const volumeData = metrics.volume.volumeHistory.map((v: { timestamp: number; volume: number }) => ({
    timestamp: new Date(v.timestamp).toLocaleTimeString(),
    volume: v.volume,
  }));

  const efficiencyData = efficiency
    ? [
      { name: 'Spread Efficiency', value: efficiency.spreadEfficiency * 100 },
      { name: 'Volume Efficiency', value: efficiency.volumeEfficiency * 100 },
      { name: 'Price Discovery', value: efficiency.priceDiscovery * 100 },
      { name: 'Market Depth', value: efficiency.marketDepth * 100 },
    ]
    : [];

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Anomalies Section */}
        {anomalies.length > 0 && (
          <Grid item xs={12}>
            {anomalies.map((anomaly, index) => (
              <Alert
                key={index}
                severity={
                  anomaly.severity === 'high'
                    ? 'error'
                    : anomaly.severity === 'medium'
                      ? 'warning'
                      : 'info'
                }
                sx={{ mb: 2 }}
              >
                <AlertTitle>{anomaly.type.toUpperCase()} Anomaly</AlertTitle>
                {anomaly.description}
              </Alert>
            ))}
          </Grid>
        )}

        {/* Volume Chart */}
        <Grid item md={8} xs={12}>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="h6">
                Volume History
              </Typography>
              <ResponsiveContainer height={300} width="100%">
                <LineChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line dataKey="volume" name="Volume" stroke="#8884d8" type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Market Metrics */}
        <Grid item md={4} xs={12}>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="h6">
                Market Metrics
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Liquidity</Typography>
                <Typography variant="h4">{metrics.liquidity.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Volatility</Typography>
                <Typography variant="h4">{metrics.volatility.toFixed(2)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Trend</Typography>
                <Typography color={metrics.trend > 0 ? 'success.main' : 'error.main'} variant="h4">
                  {metrics.trend > 0 ? '↑' : '↓'} {Math.abs(metrics.trend).toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Market Efficiency Radar Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="h6">
                Market Efficiency
              </Typography>
              <ResponsiveContainer height={400} width="100%">
                <RadarChart data={efficiencyData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    dataKey="value"
                    fill="#8884d8"
                    fillOpacity={0.6}
                    name="Efficiency"
                    stroke="#8884d8"
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
