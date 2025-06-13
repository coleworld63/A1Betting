import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      aria-labelledby={`predictions-tab-${index}`}
      hidden={value !== index}
      id={`predictions-tabpanel-${index}`}
      role="tabpanel"
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/model-predictions/client-frontend';

const riskProfiles = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const Predictions: React.FC = () => {
  const [value, setValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [riskProfile, setRiskProfile] = useState('medium');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'prediction_request',
          features: {},
          riskProfile: { type: riskProfile },
        })
      );
    };
    ws.onmessage = event => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'prediction_result') {
          setPredictions(
            Array.isArray(msg.data.prediction) ? msg.data.prediction : [msg.data.prediction]
          );
          setLoading(false);
        } else if (msg.type === 'error') {
          setError(msg.data?.message || 'Error fetching predictions');
          setLoading(false);
        } else {
          // Handle other message types if needed
        }
      } catch (e) {
        setError('Malformed message from server');
        setLoading(false);
      }
    };
    ws.onerror = () => {
      setError('WebSocket error');
      setLoading(false);
    };
    ws.onclose = () => {
      // Optionally: try to reconnect
    };
    return () => {
      ws.close();
    };
  }, [riskProfile]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, predictionId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedPrediction(predictionId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPrediction(null);
  };

  const handleAction = (action: string) => {
    // TODO: Implement bet actions
    handleMenuClose();
  };

  const filteredPredictions = predictions.filter(
    p =>
      (!search ||
        p.match?.toLowerCase().includes(search.toLowerCase()) ||
        p.sport?.toLowerCase().includes(search.toLowerCase())) &&
      (value === 0 ? p.status === 'active' : value === 1 ? p.status === 'completed' : true)
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Predictions</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="risk-profile-label">Risk Profile</InputLabel>
          <Select
            label="Risk Profile"
            labelId="risk-profile-label"
            value={riskProfile}
            onChange={e => setRiskProfile(e.target.value)}
          >
            {riskProfiles.map(rp => (
              <MenuItem key={rp.value} value={rp.value}>
                {rp.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item md={6} xs={12}>
            <TextField
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search predictions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button startIcon={<FilterListIcon />} sx={{ flexGrow: 1 }} variant="outlined">
                Filter
              </Button>
              <Button sx={{ flexGrow: 1 }} variant="outlined">
                Sort
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Active" />
          <Tab label="Completed" />
          <Tab label="All" />
        </Tabs>
      </Box>

      {loading && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <TabPanel index={0} value={value}>
        <Grid container spacing={3}>
          {filteredPredictions.length === 0 && !loading && (
            <Grid item xs={12}>
              <Typography>No predictions found.</Typography>
            </Grid>
          )}
          {filteredPredictions.map(prediction => (
            <Grid key={prediction.id} item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{prediction.match}</Typography>
                      <Typography gutterBottom color="textSecondary">
                        {prediction.sport}
                      </Typography>
                    </Box>
                    <IconButton onClick={e => handleMenuClick(e, prediction.id)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip color="primary" label={prediction.prediction} variant="outlined" />
                    <Chip
                      color={prediction.trend === 'up' ? 'success' : 'error'}
                      icon={prediction.trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={`Confidence: ${Math.round(prediction.confidence * 100)}%`}
                    />
                    <Chip label={`Odds: ${prediction.odds}`} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
      {/* Repeat TabPanel for Completed and All as above, or refactor for DRYness */}
    </Box>
  );
};

export default Predictions;
