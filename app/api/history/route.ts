import { NextResponse } from 'next/server';
import dbConnect, { isMongoConnected, getMongoConnectionError } from '@/lib/mongodb';
import Recommendation from '@/models/Recommendation';

// GET /api/history - Get all recommendations
export async function GET() {
  try {
    // Connect to the database
    await dbConnect();
    
    // Check if MongoDB is connected
    if (!isMongoConnected()) {
      const error = getMongoConnectionError();
      console.error('MongoDB connection error:', error);
      return NextResponse.json(
        { 
          error: 'Database connection error', 
          details: error ? error.message : 'Failed to connect to MongoDB',
          connectionStatus: 'disconnected'
        },
        { status: 503 }
      );
    }
    
    // Check if the Recommendation model is available
    if (!Recommendation) {
      console.error('Recommendation model is not available');
      return NextResponse.json(
        { error: 'Database model not available' },
        { status: 500 }
      );
    }
    
    // Get all recommendations, sorted by createdAt in descending order (newest first)
    const recommendations = await Recommendation.find({}).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch recommendations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/history - Save a new recommendation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventTitle, eventType, eventDate, eventLocation, clothing, weather, outfit } = body;

    // Validate required fields
    if (!eventTitle || !eventType || !eventDate || !eventLocation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();
    
    // Check if MongoDB is connected
    if (!isMongoConnected()) {
      const error = getMongoConnectionError();
      console.error('MongoDB connection error:', error);
      return NextResponse.json(
        { 
          error: 'Database connection error', 
          details: error ? error.message : 'Failed to connect to MongoDB',
          connectionStatus: 'disconnected'
        },
        { status: 503 }
      );
    }
    
    // Check if the Recommendation model is available
    if (!Recommendation) {
      console.error('Recommendation model is not available');
      return NextResponse.json(
        { error: 'Database model not available' },
        { status: 500 }
      );
    }
    
    // Create a new recommendation
    const recommendation = await Recommendation.create({
      eventTitle,
      eventType,
      eventDate,
      eventLocation,
      clothing,
      weather,
      outfit,
    });

    return NextResponse.json(recommendation, { status: 201 });
  } catch (error) {
    console.error('Error saving recommendation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save recommendation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/history?id=xxx - Delete a recommendation
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Recommendation ID is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();
    
    // Check if MongoDB is connected
    if (!isMongoConnected()) {
      const error = getMongoConnectionError();
      console.error('MongoDB connection error:', error);
      return NextResponse.json(
        { 
          error: 'Database connection error', 
          details: error ? error.message : 'Failed to connect to MongoDB',
          connectionStatus: 'disconnected'
        },
        { status: 503 }
      );
    }
    
    // Check if the Recommendation model is available
    if (!Recommendation) {
      console.error('Recommendation model is not available');
      return NextResponse.json(
        { error: 'Database model not available' },
        { status: 500 }
      );
    }
    
    // Find and delete the recommendation
    const deletedRecommendation = await Recommendation.findByIdAndDelete(id);
    
    if (!deletedRecommendation) {
      return NextResponse.json(
        { error: 'Recommendation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete recommendation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 