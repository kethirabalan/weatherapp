# Weather App

A modern, responsive weather application built with React, Material UI, and GSAP animations. Features a beautiful single-page UI with dynamic backgrounds based on weather conditions.

## ✨ Features

### Core Features
- **Responsive Design**: Works perfectly on mobile and desktop devices
- **Search Functionality**: Search for any city's weather information
- **Modern Card UI**: Clean, glassmorphism design with weather information display
- **Error Handling**: User-friendly error messages for invalid cities
- **Loading States**: Smooth loading animations while fetching data

### Weather Information Display
- City name
- Current temperature (°C)
- Weather description (Cloudy, Rainy, Sunny, etc.)
- Weather icon (Material UI icons)
- Humidity percentage
- Wind speed (km/h)
- Minimum and maximum temperature

### Bonus Features
- **Dynamic Backgrounds**: Background changes based on weather conditions
  - Clear weather: Blue gradient
  - Cloudy weather: Gray gradient
  - Rainy weather: Dark blue gradient
  - Snowy weather: Light blue gradient
  - Foggy weather: Gray gradient
  - Thunderstorm: Dark gradient

- **GSAP Animations**:
  - Smooth entrance animations for search bar
  - Card entrance with scale and fade effects
  - Background transitions when weather changes
  - Smooth loading states

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd weather-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## 📦 Dependencies

- **React**: UI library
- **Material UI**: Component library and styling
- **GSAP**: Animation library
- **Axios**: HTTP client (for API integration)

## 🎨 Component Usage

### WeatherAppUI Component

The main component accepts the following props:

```jsx
<WeatherAppUI
  weatherData={weatherData}    // Weather data object
  loading={loading}            // Loading state boolean
  error={error}               // Error message string
  onSearch={handleSearch}     // Search callback function
/>
```

### Weather Data Structure

The component expects weather data in this format:

```javascript
const weatherData = {
  city: "London",
  temperature: 22,
  weatherDescription: "Cloudy",
  humidity: 65,
  windSpeed: 12,
  minTemp: 18,
  maxTemp: 25,
  iconUrl: "https://openweathermap.org/img/wn/03d@2x.png"
};
```

### API Integration Example

```jsx
import React, { useState } from 'react';
import WeatherAppUI from './components/WeatherAppUI';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (cityName) => {
    setLoading(true);
    setError('');
    
    try {
      // Your API call here
      const response = await fetchWeatherData(cityName);
      setWeatherData(response);
    } catch (err) {
      setError('City not found. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WeatherAppUI
      weatherData={weatherData}
      loading={loading}
      error={error}
      onSearch={handleSearch}
    />
  );
}
```

## 🎯 Weather Description Mapping

The component automatically maps weather descriptions to backgrounds and icons:

| Weather Description | Background | Icon |
|-------------------|------------|------|
| Clear | Blue gradient | ☀️ Sunny |
| Cloudy | Gray gradient | ☁️ Cloud |
| Rain | Dark blue gradient | 🌧️ Rain |
| Snow | Light blue gradient | ❄️ Snow |
| Fog/Mist | Gray gradient | 🌫️ Fog |
| Thunderstorm | Dark gradient | ⚡ Thunder |

## 📱 Responsive Design

The app is fully responsive with breakpoints:
- **Mobile**: Single column layout, smaller text
- **Tablet**: Adjusted spacing and sizing
- **Desktop**: Full layout with optimal spacing

## 🎨 Customization

### Theme Customization

You can customize the Material UI theme in `App.js`:

```jsx
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  // ... more theme options
});
```

### Background Customization

Modify the `getBackgroundStyle` function in `WeatherAppUI.js` to add new weather conditions or change existing backgrounds.

## 🔧 Development

### Project Structure
```
src/
├── components/
│   └── WeatherAppUI.js    # Main weather component
├── App.js                 # App entry point
└── index.js              # React entry point
```

### Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

## 🚀 Deployment

Build the app for production:

```bash
npm run build
```

The build files will be in the `build/` directory, ready for deployment.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.
