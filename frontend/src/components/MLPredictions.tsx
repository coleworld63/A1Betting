import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import type { PredictionModel, ModelMetrics } from '../types/prediction';
import { predictionService } from '../services/predictionService';
import { useWebSocket } from '../hooks/useWebSocket';
import SHAPVisualization from './betting/SHAPVisualization';
import ModelPerformance from './ModelPerformance';

// Define the expected WebSocket message format
interface PredictionWebSocketMessage {
  type: 'new_prediction' | 'model_update' | 'error';
  data?: string;
  payload?: unknown; // Replaced 'any' with 'unknown' for type safety
}

// Use Vite env variable for websocket URL, fallback to default
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/ws/predictions/';

interface ShapDetailsCacheEntry {
  data?: unknown; // Replaced 'any' with 'unknown' for type safety
  isLoading: boolean;
  error?: string | null;
  visible: boolean;
}

interface ShapDetailsCache {
  [eventId: string]: ShapDetailsCacheEntry;
}

export const MLPredictions: React.FC = () => {
  const [predictionsData, setPredictionsData] = useState<PredictionModel[]>([]);
  const [metricsData, setMetricsData] = useState<ModelMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [shapDetailsCache, setShapDetailsCache] = useState<ShapDetailsCache>({});
  const [incomingMessage, setIncomingMessage] = useState<PredictionWebSocketMessage | null>(null);

  const handleWebSocketMessage = (message: PredictionWebSocketMessage) => {
    setIncomingMessage(message);
  };

  // Initialize WebSocket connection
  useWebSocket({
    url: WEBSOCKET_URL,
    onMessage: handleWebSocketMessage,
  });

  useEffect(() => {
    if (incomingMessage && incomingMessage.data) {
      try {
        const messageData = JSON.parse(incomingMessage.data as string);
        if (messageData.type === 'new_prediction' && messageData.payload) {
          const sortedPredictions = [...predictionsData].sort((a: PredictionModel, b: PredictionModel) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setPredictionsData([messageData.payload as PredictionModel, ...sortedPredictions.filter(p => p.id !== (messageData.payload as PredictionModel).id)]);
        } else if (messageData.type === 'metrics_update' && messageData.payload) {
          setMetricsData(messageData.payload as ModelMetrics);
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message or update state:', e);
      }
    }
  }, [incomingMessage, predictionsData]);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        // Using available methods from predictionService
        const insights = await predictionService.fetchGeneralInsights();
        // Transform insights to match the expected format
        const predictions = insights.map(insight => ({
          id: insight.id,
          prediction: insight.text,
          confidence: insight.confidence || 0,
          timestamp: new Date().toISOString(),
          modelVersion: insight.source
        }));
        
        setPredictionsData(predictions as PredictionModel[]);
        setError(null);
      } catch (_err) {
        setError('Failed to fetch predictions');
        console.error('Error fetching predictions:', _err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const handleShowShapDetails = useCallback(async (eventId: string) => {
    if (!shapDetailsCache[eventId]) {
      setShapDetailsCache(prev => ({
        ...prev,
        [eventId]: { isLoading: true, error: null, visible: true }
      }));

      try {
        // Using getPredictionDetails as an alternative
        const data = await predictionService.getPredictionDetails(eventId);
        setShapDetailsCache(prev => ({
          ...prev,
          [eventId]: { 
            ...prev[eventId], 
            data, 
            isLoading: false 
          }
        }));
      } catch (_err) {
        setShapDetailsCache(prev => ({
          ...prev,
          [eventId]: { 
            ...prev[eventId], 
            error: 'Failed to load prediction details', 
            isLoading: false 
          }
        }));
      }
    } else {
      setShapDetailsCache(prev => ({
        ...prev,
        [eventId]: { 
          ...prev[eventId], 
          visible: !prev[eventId].visible 
        }
      }));
    }
  }, [shapDetailsCache]);

  if (isLoading) {
    return (
      <Box alignItems="center" display="flex" justifyContent="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const sortedPredictions = [...predictionsData].sort((a: PredictionModel, b: PredictionModel) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
      <Box sx={{ gridColumn: '1 / -1' }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Model Performance
            </Typography>
            {metricsData && <ModelPerformance modelMetricsData={metricsData} />}
          </CardContent>
        </Card>
      </Box>
      {sortedPredictions.map((prediction) => (
        <Box key={prediction.id}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {prediction.prediction || 'No prediction available'}
              </Typography>
              {prediction.confidenceScore && (
                <Typography variant="body2" color="textSecondary">
                  Confidence: {(prediction.confidenceScore * 100).toFixed(1)}%
                </Typography>
              )}
              <Typography variant="caption" display="block" color="textSecondary">
                {new Date(prediction.timestamp).toLocaleString()}
              </Typography>
              <Button 
                size="small"
                onClick={() => handleShowShapDetails(prediction.id)}
                disabled={shapDetailsCache[prediction.id]?.isLoading}
                sx={{ mb: 1, mt: 1, mr: 1 }}
                variant="outlined"
              >
                {shapDetailsCache[prediction.id]?.isLoading ? (
                  <CircularProgress size={20} />
                ) : shapDetailsCache[prediction.id]?.visible ? (
                  'Hide Explanation'
                ) : (
                  'Show Explanation'
                )}
              </Button>

              {shapDetailsCache[prediction.id]?.visible && (
                <Box border={1} borderColor="divider" borderRadius={1} mt={2} p={2}>
                  {shapDetailsCache[prediction.id]?.isLoading && <CircularProgress />}
                  {shapDetailsCache[prediction.id]?.error && (
                    <Alert severity="error">{shapDetailsCache[prediction.id]?.error}</Alert>
                  )}
                  {shapDetailsCache[prediction.id]?.data && (
                    <SHAPVisualization
                      baseValue={shapDetailsCache[prediction.id]?.data?.baseValue}
                      shapValues={shapDetailsCache[prediction.id]?.data?.shapValues || {}}
                      confidence={prediction.confidenceScore}
                    />
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
};
