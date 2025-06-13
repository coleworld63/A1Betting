import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  SportsSoccer as SportsIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';

const mockUserData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 234 567 890',
  location: 'New York, USA',
  avatar: 'JD',
  joinDate: 'January 2024',
  stats: {
    totalPredictions: 1234,
    successRate: 78.5,
    winStreak: 5,
    totalWinnings: 5678.9,
  },
  favoriteSports: ['Football', 'Basketball', 'Tennis'],
};

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(mockUserData);
  const [editedData, setEditedData] = useState(mockUserData);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(userData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(userData);
  };

  const handleSave = () => {
    setUserData(editedData);
    setIsEditing(false);
    setSnackbar({
      open: true,
      message: 'Profile updated successfully',
      severity: 'success',
    });
  };

  const handleChange = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography gutterBottom variant="h4">
        Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item md={4} xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  margin: '0 auto 1rem',
                  bgcolor: 'primary.main',
                }}
              >
                {userData.avatar}
              </Avatar>
              <Typography gutterBottom variant="h5">
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={editedData.name}
                    onChange={e => handleChange('name', e.target.value)}
                  />
                ) : (
                  userData.name
                )}
              </Typography>
              <Typography gutterBottom color="textSecondary">
                Member since {userData.joinDate}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {isEditing ? (
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      color="primary"
                      startIcon={<SaveIcon />}
                      variant="contained"
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                    <Button
                      color="error"
                      startIcon={<CancelIcon />}
                      variant="outlined"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <Button startIcon={<EditIcon />} variant="outlined" onClick={handleEdit}>
                    Edit Profile
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography gutterBottom variant="h6">
                Contact Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={
                      isEditing ? (
                        <TextField
                          fullWidth
                          value={editedData.email}
                          onChange={e => handleChange('email', e.target.value)}
                        />
                      ) : (
                        userData.email
                      )
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={
                      isEditing ? (
                        <TextField
                          fullWidth
                          value={editedData.phone}
                          onChange={e => handleChange('phone', e.target.value)}
                        />
                      ) : (
                        userData.phone
                      )
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Location"
                    secondary={
                      isEditing ? (
                        <TextField
                          fullWidth
                          value={editedData.location}
                          onChange={e => handleChange('location', e.target.value)}
                        />
                      ) : (
                        userData.location
                      )
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item md={8} xs={12}>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="h6">
                Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item sm={6} xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SportsIcon sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="subtitle2">Total Predictions</Typography>
                      <Typography variant="h6">{userData.stats.totalPredictions}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="subtitle2">Success Rate</Typography>
                      <Typography variant="h6">{userData.stats.successRate}%</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="subtitle2">Current Win Streak</Typography>
                      <Typography variant="h6">{userData.stats.winStreak}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalanceIcon sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="subtitle2">Total Winnings</Typography>
                      <Typography variant="h6">${userData.stats.totalWinnings}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography gutterBottom variant="h6">
                Favorite Sports
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {userData.favoriteSports.map(sport => (
                  <Chip key={sport} label={sport} />
                ))}
              </Box>
            </CardContent>
          </Card>
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

export default Profile;
