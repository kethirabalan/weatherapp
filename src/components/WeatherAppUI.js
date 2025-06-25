import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  Grid,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Drawer,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  CloudQueue as CloudQueueIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  BeachAccess as BeachAccessIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import axios from 'axios';
import { env } from '../env';

const mockForecast = [
  { day: 'Today', icon: <CloudQueueIcon sx={{ color: '#4a90e2' }} />, high: 22, low: 15 },
  { day: 'Tomorrow', icon: <CloudQueueIcon sx={{ color: '#4a90e2' }} />, high: 20, low: 14 },
  { day: 'Wednesday', icon: <CloudQueueIcon sx={{ color: '#4a90e2' }} />, high: 18, low: 12 },
  { day: 'Thursday', icon: <CloudQueueIcon sx={{ color: '#4a90e2' }} />, high: 23, low: 16 },
  { day: 'Friday', icon: <CloudQueueIcon sx={{ color: '#4a90e2' }} />, high: 21, low: 15 }
];

const mockUser = {
  name: 'Sophia Carter',
  subtitle: 'Weather enthusiast',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  locations: [
    { label: 'Home', icon: <HomeIcon />, place: 'Sunnyvale, CA' },
    { label: 'Work', icon: <WorkIcon />, place: 'San Francisco, CA' },
    { label: 'Vacation', icon: <BeachAccessIcon />, place: 'Lake Tahoe, CA' }
  ]
};

const WeatherAppUI = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drawer, setDrawer] = useState(null); // 'user' | 'settings' | null
  const [settings, setSettings] = useState({
    notifications: false,
    dailyForecasts: false,
    units: 'metric',
    language: 'en',
  });

  // Demo: fetch for San Francisco on mount
  useEffect(() => {
    handleSearch('Channai');
    // eslint-disable-next-line
  }, []);

  const API_KEY = env.REACT_APP_OPENWEATHER_KEY;
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  const fetchWeatherData = async (cityName) => {
    try {
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: cityName,
          appid: API_KEY,
          units: settings.units
        }
      });
      const data = response.data;
      console.log(data);
      return {
        city: data.name,
        temperature: Math.round(data.main.temp),
        weatherDescription: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        feelsLike: Math.round(data.main.feels_like)
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('City not found. Please check the spelling and try again.');
      } else if (error.response?.status === 401) {
        throw new Error('API key error. Please check your configuration.');
      } else {
        throw new Error('Failed to fetch weather data. Please try again later.');
      }
    }
  };

  const handleSearch = async (query) => {
    const city = typeof query === 'string' ? query : searchQuery;
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await fetchWeatherData(city);
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  // Drawer content for user/profile
  const UserDrawer = (
    <Box sx={{ width: { xs: 320, sm: 400 }, p: 4, pt: 6, bgcolor: '#f7f9fb', height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Avatar src={mockUser.avatar} sx={{ width: 96, height: 96, mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{mockUser.name}</Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>{mockUser.subtitle}</Typography>
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>My Locations</Typography>
      <List>
        {mockUser.locations.map((loc, idx) => (
          <ListItem key={loc.label} sx={{ mb: 1, borderRadius: 2, bgcolor: '#f2f4f8' }}>
            <ListItemIcon sx={{ minWidth: 36 }}>{loc.icon}</ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontWeight: 600 }}>{loc.label}</Typography>}
              secondary={<Typography sx={{ color: '#6b7280', fontSize: 14 }}>{loc.place}</Typography>}
            />
          </ListItem>
        ))}
      </List>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 4, mb: 2 }}>Settings</Typography>
      <List>
        <ListItem secondaryAction={<Switch edge="end" checked={settings.notifications} onChange={e => setSettings(s => ({ ...s, notifications: e.target.checked }))} />}>
          <ListItemText primary="Notifications" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Units" />
          <Typography sx={{ color: '#6b7280', fontWeight: 500 }}>{settings.units === 'metric' ? 'Metric' : 'Imperial'}</Typography>
        </ListItem>
        <ListItem>
          <ListItemText primary="Language" />
          <Typography sx={{ color: '#6b7280', fontWeight: 500 }}>{settings.language === 'en' ? 'English' : settings.language}</Typography>
        </ListItem>
        <ListItem button>
          <ListItemText primary="About" />
          <ChevronRightIcon />
        </ListItem>
      </List>
    </Box>
  );

  // Drawer content for settings
  const SettingsDrawer = (
    <Box sx={{ width: { xs: 340, sm: 500 }, p: 4, pt: 6, bgcolor: '#f7f9fb', height: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>Settings</Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Notifications</Typography>
      <List>
        <ListItem secondaryAction={<Switch edge="end" checked={settings.notifications} onChange={e => setSettings(s => ({ ...s, notifications: e.target.checked }))} />}>
          <ListItemText primary="Severe Weather Alerts" secondary="Receive alerts for severe weather conditions in your saved locations." />
        </ListItem>
        <ListItem secondaryAction={<Switch edge="end" checked={settings.dailyForecasts} onChange={e => setSettings(s => ({ ...s, dailyForecasts: e.target.checked }))} />}>
          <ListItemText primary="Daily Forecasts" secondary="Get daily weather forecasts delivered to your device." />
        </ListItem>
      </List>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 4, mb: 2 }}>Units</Typography>
      <List>
        <ListItem>
          <ListItemText primary="Temperature Units" secondary="Choose between Celsius and Fahrenheit for temperature readings." />
          <Typography sx={{ color: '#6b7280', fontWeight: 500 }}>{settings.units === 'metric' ? 'Celsius' : 'Fahrenheit'}</Typography>
        </ListItem>
        <ListItem>
          <ListItemText primary="Wind Speed Units" secondary="Select your preferred unit for measuring wind speed." />
          <Typography sx={{ color: '#6b7280', fontWeight: 500 }}>{settings.units === 'metric' ? 'km/h' : 'mph'}</Typography>
        </ListItem>
        <ListItem>
          <ListItemText primary="Precipitation Units" secondary="Choose between millimeters and inches for precipitation measurements." />
          <Typography sx={{ color: '#6b7280', fontWeight: 500 }}>{settings.units === 'metric' ? 'mm' : 'in'}</Typography>
        </ListItem>
      </List>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 4, mb: 2 }}>Locations</Typography>
      <List>
        <ListItem>
          <ListItemText primary="Current Location" />
          <LocationOnIcon sx={{ color: '#4a90e2' }} />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Manage Locations" />
          <EditIcon sx={{ color: '#4a90e2' }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#f7f9fb', minHeight: '100vh' }}>
      {/* Top Bar */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#f7f9fb', color: '#222', borderBottom: '1px solid #ececec' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudQueueIcon sx={{ color: '#222', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
              Weather Finder
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              sx={{
                bgcolor: '#f2f4f8',
                borderRadius: 2,
                minWidth: { xs: 120, sm: 200 },
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem',
                  borderRadius: 2,
                  p: 0.5
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#b0b8c1' }} />
                  </InputAdornment>
                )
              }}
            />
            <IconButton size="small" sx={{ bgcolor: '#f2f4f8', ml: 1 }} onClick={() => setDrawer('settings')}>
              <SettingsIcon sx={{ color: '#222' }} />
            </IconButton>
            <Avatar alt="User" src={mockUser.avatar} sx={{ width: 36, height: 36, ml: 1, cursor: 'pointer' }} onClick={() => setDrawer('user')} />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawers */}
      <Drawer anchor="right" open={drawer === 'user'} onClose={() => setDrawer(null)}>
        {UserDrawer}
      </Drawer>
      <Drawer anchor="right" open={drawer === 'settings'} onClose={() => setDrawer(null)}>
        {SettingsDrawer}
      </Drawer>

      <Container maxWidth="md" sx={{ mt: { xs: 3, sm: 6 }, mb: 6 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress size={48} />
          </Box>
        ) : weatherData && (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: '-1px' }}>
                {weatherData.city}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#6b7280', mb: 2, fontWeight: 400, textTransform: 'capitalize' }}>
                {weatherData.weatherDescription}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
                {weatherData.temperature}°C
              </Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center', minHeight: 80 }}>
                    <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 0.5 }}>Humidity</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{weatherData.humidity}%</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center', minHeight: 80 }}>
                    <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 0.5 }}>Wind</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{weatherData.windSpeed} km/h</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center', minHeight: 80 }}>
                    <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 0.5 }}>Feels Like</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{weatherData.feelsLike}°C</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Forecast</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table size="small" aria-label="forecast table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Day</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Weather</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>High</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Low</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockForecast.map((row, idx) => (
                    <TableRow key={row.day}>
                      <TableCell>{row.day}</TableCell>
                      <TableCell>{row.icon}</TableCell>
                      <TableCell sx={{ color: '#4a90e2', fontWeight: 600 }}>{row.high}°C</TableCell>
                      <TableCell sx={{ color: '#6b7280' }}>{row.low}°C</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Container>
    </Box>
  );
};

export default WeatherAppUI; 