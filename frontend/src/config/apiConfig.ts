// Centralized API config for all integrations
export const API_CONFIG = {
  SPORTS_DATA: {
    BASE_URL: process.env.VITE_SPORTS_API_URL || '',
    API_KEY: process.env.VITE_SPORTS_API_KEY || '',
  },
  ODDS_DATA: {
    BASE_URL: process.env.VITE_ODDS_API_URL || '',
    API_KEY: process.env.VITE_ODDS_API_KEY || '',
  },
  SENTIMENT: {
    BASE_URL: process.env.VITE_SENTIMENT_API_URL || '',
    API_KEY: process.env.VITE_SENTIMENT_API_KEY || '',
  },
  NEWS: {
    BASE_URL: process.env.VITE_NEWS_API_URL || '',
    API_KEY: process.env.VITE_NEWS_API_KEY || '',
  },
  WEATHER: {
    BASE_URL: process.env.VITE_WEATHER_API_URL || '',
    API_KEY: process.env.VITE_WEATHER_API_KEY || '',
  },
  INJURY: {
    BASE_URL: process.env.VITE_INJURY_API_URL || '',
    API_KEY: process.env.VITE_INJURY_API_KEY || '',
  },
};
