import axios from 'axios';
import { WeatherData } from '@shared/schema';

// Weather API keys should be stored in environment variables
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'demo_key';
const WINDY_API_KEY = process.env.WINDY_API_KEY || 'demo_key';
const STORMGLASS_API_KEY = process.env.STORMGLASS_API_KEY || 'demo_key';
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY || 'demo_key';

// Convert direction from degrees to cardinal direction
function degreesToCardinal(degrees: number): string {
  const cardinals = [
    'North', 'North-Northeast', 'Northeast', 'East-Northeast',
    'East', 'East-Southeast', 'Southeast', 'South-Southeast',
    'South', 'South-Southwest', 'Southwest', 'West-Southwest',
    'West', 'West-Northwest', 'Northwest', 'North-Northwest',
    'North'
  ];
  
  // Convert degrees to 0-16 index
  const index = Math.round(degrees / 22.5);
  return cardinals[index];
}

export async function getWindData(lat: number, lon: number): Promise<{ direction: string, speed: number }> {
  try {
    // Try WeatherAPI first
    const weatherApiResponse = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}`
    );
    
    if (weatherApiResponse.data?.current) {
      return {
        direction: degreesToCardinal(weatherApiResponse.data.current.wind_degree),
        speed: weatherApiResponse.data.current.wind_kph
      };
    }
  } catch (error) {
    console.error('WeatherAPI request failed, trying OpenWeatherMap:', error);
  }
  
  // Fallback to OpenWeatherMap
  try {
    const openWeatherMapResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}`
    );
    
    if (openWeatherMapResponse.data) {
      return {
        direction: degreesToCardinal(openWeatherMapResponse.data.wind.deg),
        speed: openWeatherMapResponse.data.wind.speed * 3.6 // Convert m/s to km/h
      };
    }
  } catch (error) {
    console.error('OpenWeatherMap request failed:', error);
  }
  
  // Default fallback values
  return {
    direction: 'North-East',
    speed: 12
  };
}

export async function getSolarData(lat: number, lon: number): Promise<number> {
  try {
    // Try WeatherAPI first for data that can help us estimate solar irradiance
    const weatherApiResponse = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}`
    );
    
    if (weatherApiResponse.data?.current) {
      // Simple estimate based on cloud cover and UV index
      const cloudCover = weatherApiResponse.data.current.cloud;
      const uvIndex = weatherApiResponse.data.current.uv;
      
      // Approximate solar irradiance (kWh/m²) based on UV and cloud cover
      // This is a very simplistic model
      const baseIrradiance = 5.0 * (uvIndex / 10);
      const cloudFactor = 1 - (cloudCover / 100) * 0.7;
      
      return parseFloat((baseIrradiance * cloudFactor).toFixed(1));
    }
  } catch (error) {
    console.error('WeatherAPI request failed for solar data:', error);
  }
  
  // Default fallback value
  return 5.8;
}

export async function getEnvironmentalData(lat: number, lon: number): Promise<WeatherData> {
  // Get wind data
  const windData = await getWindData(lat, lon);
  
  // Get solar irradiance
  const solarIrradiance = await getSolarData(lat, lon);
  
  // Try to get additional weather data
  let temperature = 25;
  let humidity = 50;
  let locationName = 'Egypt';
  
  try {
    const weatherApiResponse = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}`
    );
    
    if (weatherApiResponse.data?.current) {
      temperature = weatherApiResponse.data.current.temp_c;
      humidity = weatherApiResponse.data.current.humidity;
    }
    
    if (weatherApiResponse.data?.location) {
      locationName = weatherApiResponse.data.location.name;
    }
  } catch (error) {
    console.error('Failed to get additional weather data:', error);
  }
  
  // Compile all the data
  return {
    windDirection: windData.direction,
    windSpeed: windData.speed,
    solarIrradiance,
    temperature,
    humidity,
    location: {
      lat,
      lon,
      name: locationName
    },
    timestamp: new Date()
  };
}
