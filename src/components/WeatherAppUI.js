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
  TableRow
} from '@mui/material';
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  WbSunny as SunnyIcon,
  Cloud as CloudIcon,
  Opacity as RainIcon,
  CloudQueue as CloudQueueIcon,
} from '@mui/icons-material';
import axios from 'axios';

const mockForecast = [
  { day: 'Today', icon: <SunnyIcon sx={{ color: '#f7b733' }} />, high: 22, low: 15 },
  { day: 'Tomorrow', icon: <CloudIcon sx={{ color: '#4a90e2' }} />, high: 20, low: 14 },
  { day: 'Wednesday', icon: <RainIcon sx={{ color: '#50a7c2' }} />, high: 18, low: 12 },
  { day: 'Thursday', icon: <SunnyIcon sx={{ color: '#f7b733' }} />, high: 23, low: 16 },
  { day: 'Friday', icon: <CloudIcon sx={{ color: '#4a90e2' }} />, high: 21, low: 15 }
];

const WeatherAppUI = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Demo: fetch for San Francisco on mount
  useEffect(() => {
    handleSearch('San Francisco');
    // eslint-disable-next-line
  }, []);

  const API_KEY = 'c2556409faf0be9cee983532d0cca677';
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  const fetchWeatherData = async (cityName) => {
    try {
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: cityName,
          appid: API_KEY,
          units: 'metric'
        }
      });
      const data = response.data;
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
            <IconButton size="small" sx={{ bgcolor: '#f2f4f8', ml: 1 }}>
              <SettingsIcon sx={{ color: '#222' }} />
            </IconButton>
            <Avatar alt="User" src="https://randomuser.me/api/portraits/women/44.jpg" sx={{ width: 36, height: 36, ml: 1 }} />
          </Box>
        </Toolbar>
      </AppBar>

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