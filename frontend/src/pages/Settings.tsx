import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from '@mui/material';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sound: false,
    },
    display: {
      darkMode: true,
      compactView: false,
    },
    betting: {
      defaultStake: 10,
      maxStake: 100,
      currency: 'USD',
    },
    privacy: {
      sharePredictions: false,
      showStats: true,
    },
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleNotificationChange = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [setting]: !prev.notifications[setting as keyof typeof prev.notifications],
      },
    }));
  };

  const handleDisplayChange = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      display: {
        ...prev.display,
        [setting]: !prev.display[setting as keyof typeof prev.display],
      },
    }));
  };

  const handleBettingChange = (setting: string, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      betting: {
        ...prev.betting,
        [setting]: value,
      },
    }));
  };

  const handlePrivacyChange = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [setting]: !prev.privacy[setting as keyof typeof prev.privacy],
      },
    }));
  };

  const handleSave = () => {
    // Here you would typically save the settings to your backend
    setSnackbar({
      open: true,
      message: 'Settings saved successfully',
      severity: 'success',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography gutterBottom variant="h4">
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="h6">
                Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.push}
                    onChange={() => handleNotificationChange('push')}
                  />
                }
                label="Push Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.sound}
                    onChange={() => handleNotificationChange('sound')}
                  />
                }
                label="Sound Notifications"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item md={6} xs={12}>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="h6">
                Display
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.display.darkMode}
                    onChange={() => handleDisplayChange('darkMode')}
                  />
                }
                label="Dark Mode"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.display.compactView}
                    onChange={() => handleDisplayChange('compactView')}
                  />
                }
                label="Compact View"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="h6">
                Betting Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid item sm={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Default Stake"
                    type="number"
                    value={settings.betting.defaultStake}
                    onChange={e => handleBettingChange('defaultStake', Number(e.target.value))}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Maximum Stake"
                    type="number"
                    value={settings.betting.maxStake}
                    onChange={e => handleBettingChange('maxStake', Number(e.target.value))}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      label="Currency"
                      value={settings.betting.currency}
                      onChange={e => handleBettingChange('currency', e.target.value)}
                    >
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="GBP">GBP</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="h6">
                Privacy
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy.sharePredictions}
                    onChange={() => handlePrivacyChange('sharePredictions')}
                  />
                }
                label="Share Predictions"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy.showStats}
                    onChange={() => handlePrivacyChange('showStats')}
                  />
                }
                label="Show Statistics"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button color="primary" variant="contained" onClick={handleSave}>
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar autoHideDuration={6000} open={snackbar.open} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
