import { NextResponse } from 'next/server';

export async function GET() {
  // Check if environment variables are available
  const envVars = {
    openweatherKeyAvailable: !!process.env.OPENWEATHER_API_KEY,
    geminiKeyAvailable: !!process.env.GEMINI_API_KEY,
    stabilityKeyAvailable: !!process.env.STABILITY_API_KEY,
    // Show first few characters of the OpenWeather API key for verification
    openweatherKeyPrefix: process.env.OPENWEATHER_API_KEY 
      ? process.env.OPENWEATHER_API_KEY.substring(0, 5) + '...' 
      : 'not available',
    // Include Next.js environment
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json(envVars);
} 