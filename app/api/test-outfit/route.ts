import { NextResponse } from 'next/server';

// Use hardcoded API keys for testing
const GEMINI_API_KEY = 'AIzaSyDdeJjL8-7b3GDtfjcv4uTKjZL99IgB39E';
const STABILITY_API_KEY = process.env.STABILITY_API_KEY // 'sk-f1dmq0VDW8BgSXUEiuEd1FxnMyeBq5zihG9lPODJDSXZDl8m';
const OPENWEATHER_API_KEY = '0653067dea7dd29420b5a88e859a0d0a';

export async function GET() {
  try {
    // Use known working values
    const eventType = 'wedding';
    const eventLocation = 'London';
    const eventDate = 'March 10, 2025';
    const clothing = 'red shirt';

    console.log('Testing outfit API with:', { eventType, eventLocation, eventDate });

    // Step 1: Get weather data for the event location
    console.log(`Fetching weather for location: ${eventLocation}`);
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(eventLocation)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.json();
      console.error('Weather API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch weather data for the location' },
        { status: weatherResponse.status }
      );
    }

    const weatherData = await weatherResponse.json();
    const temperature = weatherData.main.temp;
    const weatherDescription = weatherData.weather[0].description;

    return NextResponse.json({
      success: true,
      message: 'Weather data fetched successfully',
      weather: {
        location: weatherData.name,
        country: weatherData.sys.country,
        temperature,
        description: weatherDescription
      }
    });
  } catch (error) {
    console.error('Error testing outfit API:', error);
    return NextResponse.json(
      { error: 'Failed to test outfit API' },
      { status: 500 }
    );
  }
} 