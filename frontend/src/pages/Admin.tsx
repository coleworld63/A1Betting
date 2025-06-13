import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import errorHandler from '../utils/errorHandler';
import { ErrorSeverity, ErrorCategory } from '../unified/UnifiedError';
import { Container } from '@mui/material';
import { ModelSettings } from '../components/admin/ModelSettings';
import { ErrorLogs } from '../components/admin/ErrorLogs';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const Admin: React.FC = () => {
  const [errorReport, setErrorReport] = useState<any>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<ErrorSeverity | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<ErrorCategory | 'ALL'>('ALL');
  const [threshold, setThreshold] = useState<number>(50);
  const [selectedModel, setSelectedModel] = useState<string>('default');
  const [autoClearCache, setAutoClearCache] = useState<boolean>(false);
  const [cacheStatus, setCacheStatus] = useState<{ size: number; lastCleared: string | null }>({
    size: 0,
    lastCleared: null,
  });

  useEffect(() => {
    // Load initial error report
    const report = errorHandler.generateReport();
    setErrorReport(report);
    updateCacheStatus();
  }, []);

  const updateCacheStatus = () => {
    // Simulate cache size calculation
    const size = Math.floor(Math.random() * 1000);
    const lastCleared = localStorage.getItem('cache_last_cleared');
    setCacheStatus({ size, lastCleared });
  };

  const handleDownloadReport = () => {
    errorHandler.downloadReport();
  };

  const handleClearLogs = () => {
    errorHandler.clearLogs();
    const report = errorHandler.generateReport();
    setErrorReport(report);
  };

  const handleClearCache = () => {
    // Simulate cache clearing
    localStorage.setItem('cache_last_cleared', new Date().toISOString());
    updateCacheStatus();
  };

  const handleThresholdChange = (_event: Event, newValue: number | number[]) => {
    setThreshold(newValue as number);
  };

  const handleModelChange = (event: SelectChangeEvent) => {
    setSelectedModel(event.target.value);
  };

  const handleAutoClearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoClearCache(event.target.checked);
  };

  const handleSettingsChange = (settings: {
    modelType: string;
    confidenceThreshold: number;
    kellyThreshold: number;
  }) => {
    // TODO: Implement settings update logic
    console.log('Settings updated:', settings);
  };

  const filteredErrors =
    errorReport?.errors?.filter((error: any) => {
      const severityMatch =
        selectedSeverity === 'ALL' || error.details?.severity === selectedSeverity;
      const categoryMatch =
        selectedCategory === 'ALL' || error.details?.category === selectedCategory;
      return severityMatch && categoryMatch;
    }) || [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography gutterBottom component="h1" variant="h4">
        Admin Panel
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <ModelSettings onSettingsChange={handleSettingsChange} />
        <ErrorLogs />
      </Box>
    </Container>
  );
};

export default Admin;
