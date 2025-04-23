import { NextResponse } from 'next/server';

// Try using the environment variable first, fall back to hardcoded key if not available
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '0653067dea7dd29420b5a88e859a0d0a';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let location = searchParams.get('location');

  // Debug: Log the API key (first few characters only for security)
  console.log('API Key available:', !!OPENWEATHER_API_KEY);
  if (OPENWEATHER_API_KEY) {
    console.log('API Key starts with:', OPENWEATHER_API_KEY.substring(0, 5) + '...');
  }

  if (!location) {
    return NextResponse.json(
      { error: 'Location parameter is required' },
      { status: 400 }
    );
  }

  // Ensure location is properly formatted
  location = location.trim();
  
  // Try with a known working location if needed for testing
  // const testLocation = 'London'; // Uncomment for testing

  try {
    // Log the full URL (without the API key) for debugging
    console.log(`Fetching weather for: ${location}`);
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Weather API error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch weather data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      location: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      },
      wind: {
        speed: data.wind.speed,
        deg: data.wind.deg
      }
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
} 