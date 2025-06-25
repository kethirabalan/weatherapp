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
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  CloudQueue as CloudQueueIcon,
  Edit as EditIcon,
  LocationOn as LocationOnIcon,
  Logout as LogoutIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { auth, signInWithGoogle, signOutUser, db, setDoc, doc, getDoc } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { env } from '../env';
import ExploreIcon from '@mui/icons-material/Explore';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { serverTimestamp } from 'firebase/firestore';

const SEARCH_LIMIT = 3;

const defaultSettings = {
  notifications: false,
  dailyForecasts: false,
  units: 'metric',
  language: 'en',
};

const WeatherAppUI = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drawer, setDrawer] = useState(null); // 'user' | 'settings' | null
  const [settings, setSettings] = useState(defaultSettings);
  const [user, setUser] = useState(null);
  const [searchCount, setSearchCount] = useState(0);
  const [searchLimitReached, setSearchLimitReached] = useState(false);
  const [forecastData, setForecastData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  // const [notifStatus, setNotifStatus] = useState('default'); // 'default' | 'granted' | 'denied'
  // const [notifToken, setNotifToken] = useState(null);

  // Track search count for not-logged-in users (localStorage, per day)
  useEffect(() => {
    if (user) {
      setSearchLimitReached(false);
      setSearchCount(0);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const saved = JSON.parse(localStorage.getItem('weather_searches') || '{}');
    if (saved.date === today) {
      setSearchCount(saved.count);
      setSearchLimitReached(saved.count >= SEARCH_LIMIT);
    } else {
      setSearchCount(0);
      setSearchLimitReached(false);
      localStorage.setItem('weather_searches', JSON.stringify({ date: today, count: 0 }));
    }
  }, [user]);

  // Save user info and settings to Firestore on login, and load settings
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        const now = serverTimestamp();
        const meta = {
          cancelTrigger: false,
          createdAt: userSnap.exists() && userSnap.data()._meta?.createdAt ? userSnap.data()._meta.createdAt : now,
          id: firebaseUser.uid,
          path: `users/${firebaseUser.uid}`,
          status: 'live',
          updatedAt: now,
        };
        await setDoc(userRef, {
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          lastLogin: new Date().toISOString(),
          photoURL: firebaseUser.photoURL,
          providerId: firebaseUser.providerData[0]?.providerId || '',
          uid: firebaseUser.uid,
          _meta: meta,
        }, { merge: true });
        // Load settings
        if (userSnap.exists() && userSnap.data().settings) {
          setSettings({ ...defaultSettings, ...userSnap.data().settings });
        } else {
          setSettings(defaultSettings);
        }
        // Load favorites
        if (userSnap.exists() && userSnap.data().favorites) {
          setFavorites(userSnap.data().favorites);
        } else {
          setFavorites([]);
        }
      } else {
        setSettings(defaultSettings);
        setFavorites([]);
      }
    });
    return () => unsub();
  }, []);

  // Save settings to Firestore whenever they change (if logged in)
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, { settings }, { merge: true });
    }
    // eslint-disable-next-line
  }, [settings, user]);

  // Fetch weather for default city if logged in
  useEffect(() => {
    if (user) handleSearch('chennai');
    // eslint-disable-next-line
  }, [user]);

  // Load favorites on login
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then(snap => {
        setFavorites(snap.exists() && snap.data().favorites ? snap.data().favorites : []);
      });
    } else {
      setFavorites([]);
    }
  }, [user]);

  // Notification permission logic
  // useEffect(() => {
  //   if (settings.notifications && user) {
  //     Notification.requestPermission().then(status => {
  //       setNotifStatus(status);
  //       if (status === 'granted') {
  //         getToken(messaging, { vapidKey: 'BLekQ8UDkm2AbgVwc19SXEwgJTl4d6g6cM-Qeadx9fM8yno556UoEmSzLH7_xVsdNZ5RVVT10G3Y_v_BAaysltI' })
  //           .then(token => {
  //             setNotifToken(token);
  //             setDoc(doc(db, 'users', user.uid), { fcmToken: token }, { merge: true });
  //           });
  //       }
  //     });
  //   }
  // }, [settings.notifications, user]);

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

  // Fetch forecast data
  const fetchForecastData = async (cityName) => {
    try {
      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          q: cityName,
          appid: API_KEY,
          units: settings.units
        }
      });
      const data = response.data;
      // Group by day, get high/low for each day
      const days = {};
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        if (!days[day]) {
          days[day] = {
            day,
            icon: item.weather[0].icon,
            high: item.main.temp_max,
            low: item.main.temp_min
          };
        } else {
          days[day].high = Math.max(days[day].high, item.main.temp_max);
          days[day].low = Math.min(days[day].low, item.main.temp_min);
        }
      });
      // Only next 5 days
      const forecastArr = Object.values(days).slice(0, 5).map(d => ({
        ...d,
        icon: <img src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`} alt="icon" style={{ width: 32, height: 32 }} />,
        high: Math.round(d.high),
        low: Math.round(d.low)
      }));
      setForecastData(forecastArr);
    } catch (error) {
      setForecastData([]);
    }
  };

  // Update handleSearch to fetch forecast
  const handleSearch = async (query) => {
    const city = typeof query === 'string' ? query : searchQuery;
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }
    if (!user) {
      // Not logged in: check search limit
      if (searchCount >= SEARCH_LIMIT) {
        setSearchLimitReached(true);
        setError('Search limit reached. Login for unlimited searches.');
        return;
      }
    }
    setError('');
    setLoading(true);
    try {
      const data = await fetchWeatherData(city);
      setWeatherData(data);
      await fetchForecastData(city);
      // Increment search count for not-logged-in users
      if (!user) {
        const today = new Date().toISOString().slice(0, 10);
        const saved = JSON.parse(localStorage.getItem('weather_searches') || '{}');
        const newCount = (saved.date === today ? saved.count : 0) + 1;
        localStorage.setItem('weather_searches', JSON.stringify({ date: today, count: newCount }));
        setSearchCount(newCount);
        setSearchLimitReached(newCount >= SEARCH_LIMIT);
      }
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
      setForecastData([]);
    } finally {
      setLoading(false);
    }
  };

  // Add/remove favorite
  const toggleFavorite = async () => {
    if (!user || !weatherData) return;
    const city = weatherData.city;
    let newFavs;
    if (favorites.includes(city)) {
      newFavs = favorites.filter(f => f !== city);
    } else {
      newFavs = [...favorites, city];
    }
    setFavorites(newFavs);
    await setDoc(doc(db, 'users', user.uid), { favorites: newFavs }, { merge: true });
  };

  // After weatherData is set, check for severe weather
  const isSevere = weatherData && weatherData.weatherDescription && weatherData.weatherDescription.match(/rain|storm|snow|thunder|hail/i);

  // Drawer content for user/profile
  const UserDrawer = user && (
    <Box sx={{ width: { xs: 320, sm: 400 }, p: 4, pt: 6, bgcolor: '#f7f9fb', height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Avatar src={user.photoURL} sx={{ width: 96, height: 96, mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{user.displayName}</Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>{user.email}</Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Button variant="outlined" color="error" startIcon={<LogoutIcon />} fullWidth onClick={() => { signOutUser(); setDrawer(null); }}>
        Logout
      </Button>
      {favorites.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Favorites</Typography>
          <List>
            {favorites.map(city => (
              <ListItem key={city} button onClick={() => { setDrawer(null); handleSearch(city); }}>
                <ListItemText primary={city} />
                <IconButton edge="end" onClick={async e => { e.stopPropagation(); setFavorites(favorites.filter(f => f !== city)); await setDoc(doc(db, 'users', user.uid), { favorites: favorites.filter(f => f !== city) }, { merge: true }); }}>
                  <FavoriteIcon color="error" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
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
      {/* <Box sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ color: notifStatus === 'granted' ? 'green' : notifStatus === 'denied' ? 'red' : 'gray' }}>
          Notification permission: {notifStatus}
        </Typography>
      </Box> */}
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#f7f9fb', minHeight: '100vh' }}>
      {/* Top Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: '#f7f9fb',
          color: '#222',
          borderBottom: '1px solid #ececec',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', px: { xs: 1, sm: 3 } }}>

          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <CloudQueueIcon sx={{ color: '#222', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
              Weather Finder
            </Typography>
          </Box>

          {/* Right-side Controls */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: { xs: 1, sm: 0 },
              width: { xs: '100%', sm: 'auto' },
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            {/* Search Field */}
            {(!user && !searchLimitReached) && (
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, textAlign: 'center' }}>
                Searches left today: {3 - searchCount} / 3
              </Typography>
            )}

            {(user || (!user && !searchLimitReached)) && (
              <TextField
                size="small"
                placeholder="Search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                sx={{
                  bgcolor: '#f2f4f8',
                  borderRadius: 2,
                  minWidth: { xs: 160, sm: 200 },
                  width: { xs: '100%', sm: 'auto' },
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1rem',
                    borderRadius: 2,
                    p: 0.5,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#b0b8c1' }} />
                    </InputAdornment>
                  ),
                }}
                disabled={searchLimitReached && !user}
              />
            )}

            {/* Icons & Auth */}
            {user ? (
              <>
                <IconButton size="small" sx={{ bgcolor: '#f2f4f8' }} onClick={() => setDrawer('settings')}>
                  <SettingsIcon sx={{ color: '#222' }} />
                </IconButton>
                <Avatar
                  alt={user.displayName}
                  src={user.photoURL}
                  sx={{ width: 36, height: 36, cursor: 'pointer' }}
                  onClick={() => setDrawer('user')}
                />
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                sx={{ fontWeight: 600, borderRadius: 2, width: { xs: '100%', sm: 'auto' } }}
                onClick={signInWithGoogle}
              >
                Login
              </Button>
            )}
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
        ) : (
          <>
            {/* Feature section for not-logged-in, no searches yet */}
            {(!user && searchCount === 0 && !searchLimitReached) && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '80vh',
                  px: 2, // for mobile padding
                }}
              >
                <Box sx={{ textAlign: 'center', maxWidth: 800 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    Welcome to Weather Finder
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
                    Accurate forecasts, saved locations, and alerts — log in for full access.
                  </Typography>

                  <Grid container spacing={2} justifyContent="center">
                    {[
                      { icon: <ExploreIcon sx={{ fontSize: 36, color: '#4a90e2' }} />, title: 'Global Search', desc: 'Find weather for any city.' },
                      { icon: <FavoriteIcon sx={{ fontSize: 36, color: '#e57373' }} />, title: 'Save Locations', desc: 'Bookmark favorites (login).' },
                      { icon: <NotificationsActiveIcon sx={{ fontSize: 36, color: '#ffb300' }} />, title: 'Alerts', desc: 'Severe weather notifications.' },
                      { icon: <CloudDoneIcon sx={{ fontSize: 36, color: '#81c784' }} />, title: 'Forecasts', desc: 'Real-time and accurate.' }
                    ].map((item, i) => (
                      <Grid item xs={6} sm={3} key={i}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          {item.icon}
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280', textAlign: 'center' }}>{item.desc}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            )}
            {/* Weather result: only show if user is logged in, or not logged in and has searched at least once and not at limit */}
            {(user || (!user && searchCount > 0 && !searchLimitReached)) && weatherData && (
              <>
                {isSevere && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Severe Weather Alert: {weatherData.weatherDescription}
                  </Alert>
                )}
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
                  {user && (
                    <IconButton onClick={toggleFavorite} sx={{ ml: 1 }} color={favorites.includes(weatherData.city) ? 'error' : 'default'}>
                      <FavoriteIcon />
                    </IconButton>
                  )}
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
                      {forecastData.map((row, idx) => (
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
            {/* Only show this if not logged in and search limit reached */}
            {(!user && searchLimitReached) && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Please log in to view weather details
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default WeatherAppUI; 