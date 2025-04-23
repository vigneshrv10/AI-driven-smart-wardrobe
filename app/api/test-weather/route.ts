import { NextResponse } from 'next/server';

// Use the hardcoded API key for testing
const OPENWEATHER_API_KEY = '0653067dea7dd29420b5a88e859a0d0a';

export async function GET() {
  // Use a known working location
  const location = 'London';

  try {
    console.log(`Testing weather API with location: ${location}`);
    
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
      success: true,
      location: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description
      }
    });
  } catch (error) {
    console.error('Error testing weather API:', error);
    return NextResponse.json(
      { error: 'Failed to test weather API' },
      { status: 500 }
    );
  }
} 