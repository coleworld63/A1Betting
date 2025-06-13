import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyticsService } from '@/services/analytics';
import { ErrorMessage } from '@/components/common/ErrorMessage';

const timeRanges = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last year' },
];

const Trends: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');

  const {
    data: performanceData,
    isLoading: performanceLoading,
    error: performanceError,
  } = useQuery({
    queryKey: ['performance', selectedTimeRange],
    queryFn: () => analyticsService.getPerformanceTrends(selectedTimeRange),
  });

  const {
    data: sportsData,
    isLoading: sportsLoading,
    error: sportsError,
  } = useQuery({
    queryKey: ['sports', selectedSport, selectedTimeRange],
    queryFn: () => analyticsService.getSportsDistribution(selectedSport, selectedTimeRange),
  });

  const {
    data: marketsData,
    isLoading: marketsLoading,
    error: marketsError,
  } = useQuery({
    queryKey: ['markets', selectedMarket, selectedTimeRange],
    queryFn: () => analyticsService.getMarketsDistribution(selectedMarket, selectedTimeRange),
  });

  const handleSportChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedSport(event.target.value as string);
  };

  const handleMarketChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedMarket(event.target.value as string);
  };

  const handleTimeRangeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedTimeRange(event.target.value as string);
  };

  if (performanceError || sportsError || marketsError) {
    return <ErrorMessage error={performanceError || sportsError || marketsError} />;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Trends</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Period</InputLabel>
          <Select label="Time Period" value={selectedTimeRange} onChange={handleTimeRangeChange}>
            {timeRanges.map(range => (
              <MenuItem key={range.value} value={range.value}>
                {range.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Performance Trends</Typography>
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              </Box>
              {performanceLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer height="100%" width="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line dataKey="value" stroke="#8884d8" strokeWidth={2} type="monotone" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item md={6} xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Sports Distribution</Typography>
                <FormControl sx={{ minWidth: 150 }}>
                  <Select size="small" value={selectedSport} onChange={handleSportChange}>
                    <MenuItem value="all">All Sports</MenuItem>
                    <MenuItem value="football">Football</MenuItem>
                    <MenuItem value="basketball">Basketball</MenuItem>
                    <MenuItem value="tennis">Tennis</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {sportsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer height="100%" width="100%">
                    <BarChart data={sportsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item md={6} xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Market Distribution</Typography>
                <FormControl sx={{ minWidth: 150 }}>
                  <Select size="small" value={selectedMarket} onChange={handleMarketChange}>
                    <MenuItem value="all">All Markets</MenuItem>
                    <MenuItem value="match-winner">Match Winner</MenuItem>
                    <MenuItem value="over-under">Over/Under</MenuItem>
                    <MenuItem value="btts">Both Teams to Score</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {marketsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer height="100%" width="100%">
                    <BarChart data={marketsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="h6">
                Key Insights
              </Typography>
              <Grid container spacing={2}>
                <Grid item md={4} xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon color="success" />
                    <Box>
                      <Typography variant="subtitle2">Most Profitable Sport</Typography>
                      <Typography variant="body1">Football</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item md={4} xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingDownIcon color="error" />
                    <Box>
                      <Typography variant="subtitle2">Least Profitable Market</Typography>
                      <Typography variant="body1">Handicap</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item md={4} xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon color="success" />
                    <Box>
                      <Typography variant="subtitle2">Best Time to Bet</Typography>
                      <Typography variant="body1">Weekend Matches</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Trends;
