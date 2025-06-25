import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Container,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Chip,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  WbSunny as SunnyIcon,
  Cloud as CloudIcon,
  Opacity as RainIcon,
  AcUnit as SnowIcon,
  Visibility as FogIcon,
  Thunderstorm as ThunderIcon,
  LocationOn as LocationIcon,
  Thermostat as TempIcon,
  Air as WindIcon,
  Opacity as HumidityIcon
} from '@mui/icons-material';
import { gsap } from 'gsap';
import axios from 'axios';

const WeatherAppUI = ({ 
  weatherData = null,
  loading = false,
  error = '',
  onSearch = null
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [internalWeatherData, setInternalWeatherData] = useState(weatherData);
  const [internalLoading, setInternalLoading] = useState(loading);
  const [internalError, setInternalError] = useState(error);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Refs for GSAP animations
  const backgroundRef = useRef(null);
  const searchRef = useRef(null);
  const weatherCardRef = useRef(null);

  // OpenWeather API configuration
  const API_KEY = 'c2556409faf0be9cee983532d0cca677';
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  // Update internal state when props change
  useEffect(() => {
    setInternalWeatherData(weatherData);
  }, [weatherData]);

  useEffect(() => {
    setInternalLoading(loading);
  }, [loading]);

  useEffect(() => {
    setInternalError(error);
  }, [error]);

  // Animated liquid glass background (Apple style)
  const getBackgroundStyle = () => ({
    position: 'fixed',
    zIndex: 0,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)',
    animation: 'liquidBG 16s ease-in-out infinite',
    backgroundSize: '200% 200%'
  });

  // Weather icon component with responsive sizing
  const getWeatherIcon = (description) => {
    const desc = description?.toLowerCase();
    const iconStyle = { 
      fontSize: isMobile ? 48 : isTablet ? 64 : 80, 
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
      marginBottom: 1
    };
    if (desc?.includes('clear')) return <SunnyIcon sx={{ ...iconStyle, color: '#FFD700' }} />;
    if (desc?.includes('cloud')) return <CloudIcon sx={{ ...iconStyle, color: '#87CEEB' }} />;
    if (desc?.includes('rain')) return <RainIcon sx={{ ...iconStyle, color: '#4682B4' }} />;
    if (desc?.includes('snow')) return <SnowIcon sx={{ ...iconStyle, color: '#F0F8FF' }} />;
    if (desc?.includes('fog') || desc?.includes('mist')) return <FogIcon sx={{ ...iconStyle, color: '#D3D3D3' }} />;
    if (desc?.includes('thunder')) return <ThunderIcon sx={{ ...iconStyle, color: '#FFD700' }} />;
    return <SunnyIcon sx={{ ...iconStyle, color: '#FFD700' }} />;
  };

  // GSAP animations
  useEffect(() => {
    gsap.fromTo(searchRef.current, 
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    if (internalWeatherData) {
      gsap.fromTo(weatherCardRef.current,
        { opacity: 0, scale: 0.9, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
      );
    }
  }, [internalWeatherData]);

  // Fetch weather data
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
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        weatherDescription: data.weather[0].main,
        weatherDetail: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        minTemp: Math.round(data.main.temp_min),
        maxTemp: Math.round(data.main.temp_max),
        feelsLike: Math.round(data.main.feels_like),
        pressure: data.main.pressure,
        iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setInternalError('Please enter a city name');
      return;
    }
    setInternalError('');
    if (onSearch) {
      onSearch(searchQuery);
      return;
    }
    setInternalLoading(true);
    try {
      const weatherData = await fetchWeatherData(searchQuery);
      setInternalWeatherData(weatherData);
    } catch (error) {
      setInternalError(error.message);
    } finally {
      setInternalLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Animated Liquid Glass Background */}
      <Box sx={getBackgroundStyle()} />
      {/* Glass highlight overlays */}
      <Box sx={{
        position: 'fixed',
        zIndex: 1,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 60% 10%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 80%, transparent 100%)',
        mixBlendMode: 'screen',
      }} />
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 2,
          px: { xs: 1, sm: 2, md: 3 },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Header */}
        <Box ref={searchRef} sx={{ textAlign: 'center', mb: { xs: 2, sm: 3, md: 4 } }}>
          <Typography
            variant={isMobile ? "h4" : isTablet ? "h3" : "h2"}
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 1,
              textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3.75rem' }
            }}
          >
            Weather Finder
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: { xs: 2, sm: 3, md: 4 },
              fontWeight: 300,
              fontSize: { xs: '0.875rem', sm: '1.25rem' }
            }}
          >
            Discover the weather anywhere in the world
          </Typography>
          {/* Search Bar */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              borderRadius: { xs: 2, sm: 3 },
              background: 'rgba(255,255,255,0.18)',
              boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              maxWidth: { xs: '100%', sm: 500, md: 600 },
              mx: 'auto',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Grid container spacing={{ xs: 1, sm: 2 }} justifyContent="space-between">
              <Grid item xs={12} sm={8} width="390px">
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder={isMobile ? "City name..." : "Enter city name..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: { xs: 1.5, sm: 2 },
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      background: 'rgba(255,255,255,0.5)',
                      boxShadow: '0 1.5px 6px 0 rgba(31,38,135,0.08)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(8px)',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSearch}
                  disabled={internalLoading}
                  startIcon={internalLoading ? <CircularProgress size={isMobile ? 16 : 20} /> : <SearchIcon />}
                  sx={{
                    borderRadius: { xs: 1.5, sm: 2 },
                    py: { xs: 1.2, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 600,
                    background: 'linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)',
                    color: '#222',
                    boxShadow: '0 2px 8px 0 rgba(161,196,253,0.18)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #fbc2eb 0%, #a6c1ee 100%)',
                      color: '#222',
                    }
                  }}
                >
                  {internalLoading ? (isMobile ? 'Searching...' : 'Searching...') : 'Search'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        {/* Error Message */}
        {internalError && (
          <Box sx={{ 
            mb: { xs: 2, sm: 3 }, 
            maxWidth: { xs: '100%', sm: 500, md: 600 }, 
            mx: 'auto' 
          }}>
            <Alert severity="error" sx={{ 
              borderRadius: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}>
              {internalError}
            </Alert>
          </Box>
        )}
        {/* Weather Card */}
        {internalWeatherData && (
          <Box ref={weatherCardRef}>
            <Card
              elevation={0}
              sx={{
                borderRadius: { xs: 3, sm: 4 },
                background: 'rgba(255,255,255,0.22)',
                boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                overflow: 'visible',
                maxWidth: { xs: '100%', sm: 600, md: 800 },
                mx: 'auto',
                position: 'relative',
                mt: { xs: 2, sm: 3 },
                p: 0,
              }}
            >
              {/* Glass highlight overlay */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                background: 'radial-gradient(ellipse at 60% 0%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 80%, transparent 100%)',
                zIndex: 1,
              }} />
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 2 }}>
                {/* Main Weather Info */}
                <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3, md: 4 } }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mb: { xs: 1, sm: 2 },
                    flexWrap: 'wrap',
                    gap: 1
                  }}>
                    <LocationIcon sx={{ 
                      color: '#667eea', 
                      mr: 1,
                      fontSize: { xs: 20, sm: 24 }
                    }} />
                    <Typography 
                      variant={isMobile ? "h5" : isTablet ? "h4" : "h4"} 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.125rem' }
                      }}
                    >
                      {internalWeatherData.city}
                    </Typography>
                    {internalWeatherData.country && (
                      <Chip
                        label={internalWeatherData.country}
                        size={isMobile ? "small" : "medium"}
                        sx={{ 
                          ml: { xs: 1, sm: 2 }, 
                          background: '#667eea', 
                          color: 'white',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mb: { xs: 1, sm: 2 }
                  }}>
                    {getWeatherIcon(internalWeatherData.weatherDescription)}
                  </Box>
                  <Typography
                    variant={isMobile ? "h2" : isTablet ? "h1" : "h1"}
                    sx={{
                      fontWeight: 300,
                      color: '#2c3e50',
                      mb: 1,
                      fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' }
                    }}
                  >
                    {internalWeatherData.temperature}°
                  </Typography>
                  <Typography
                    variant={isMobile ? "h6" : "h5"}
                    sx={{
                      color: '#7f8c8d',
                      textTransform: 'capitalize',
                      mb: 1,
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}
                  >
                    {internalWeatherData.weatherDetail}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "body2" : "body1"} 
                    sx={{ 
                      color: '#95a5a6',
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Feels like {internalWeatherData.feelsLike}°
                  </Typography>
                </Box>
                <Divider sx={{ my: { xs: 2, sm: 3 } }} />
                {/* Weather Details */}
                <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} justifyContent="space-around">
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <HumidityIcon sx={{ 
                        fontSize: { xs: 24, sm: 28 }, 
                        color: '#667eea', 
                        mb: 1 
                      }} />
                      <Typography 
                        variant={isMobile ? "h6" : "h6"} 
                        sx={{ 
                          color: '#2c3e50', 
                          fontWeight: 600,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        {internalWeatherData.humidity}%
                      </Typography>
                      <Typography 
                        variant={isMobile ? "caption" : "body2"} 
                        sx={{ 
                          color: '#7f8c8d',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        Humidity
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <WindIcon sx={{ 
                        fontSize: { xs: 24, sm: 28 }, 
                        color: '#667eea', 
                        mb: 1 
                      }} />
                      <Typography 
                        variant={isMobile ? "h6" : "h6"} 
                        sx={{ 
                          color: '#2c3e50', 
                          fontWeight: 600,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        {internalWeatherData.windSpeed}
                      </Typography>
                      <Typography 
                        variant={isMobile ? "caption" : "body2"} 
                        sx={{ 
                          color: '#7f8c8d',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        km/h
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <TempIcon sx={{ 
                        fontSize: { xs: 24, sm: 28 }, 
                        color: '#667eea', 
                        mb: 1 
                      }} />
                      <Typography 
                        variant={isMobile ? "h6" : "h6"} 
                        sx={{ 
                          color: '#2c3e50', 
                          fontWeight: 600,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        {internalWeatherData.minTemp}°
                      </Typography>
                      <Typography 
                        variant={isMobile ? "caption" : "body2"} 
                        sx={{ 
                          color: '#7f8c8d',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        Min Temp
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <TempIcon sx={{ 
                        fontSize: { xs: 24, sm: 28 }, 
                        color: '#667eea', 
                        mb: 1 
                      }} />
                      <Typography 
                        variant={isMobile ? "h6" : "h6"} 
                        sx={{ 
                          color: '#2c3e50', 
                          fontWeight: 600,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        {internalWeatherData.maxTemp}°
                      </Typography>
                      <Typography 
                        variant={isMobile ? "caption" : "body2"} 
                        sx={{ 
                          color: '#7f8c8d',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        Max Temp
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}
        {/* Loading State */}
        {internalLoading && (
          <Box sx={{ 
            textAlign: 'center', 
            mt: { xs: 2, sm: 3, md: 4 },
            p: { xs: 2, sm: 3 },
            borderRadius: { xs: 2, sm: 3 },
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            maxWidth: { xs: '100%', sm: 400 },
            mx: 'auto'
          }}>
            <CircularProgress 
              size={isMobile ? 40 : 60} 
              sx={{ color: 'white' }} 
            />
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              sx={{ 
                color: 'white', 
                mt: { xs: 1, sm: 2 },
                fontSize: { xs: '0.875rem', sm: '1.25rem' }
              }}
            >
              Fetching weather data...
            </Typography>
          </Box>
        )}
      </Container>
      {/* Liquid glass background animation keyframes */}
      <style>{`
        @keyframes liquidBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </Box>
  );
};

export default WeatherAppUI; 