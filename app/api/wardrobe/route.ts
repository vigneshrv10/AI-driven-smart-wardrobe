import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import WardrobeItem from '@/models/Wardrobe';
import User from '@/models/User';

// Get all wardrobe items for the current user
export async function GET() {
  try {
    const sessionId = cookies().get('session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find user by session ID
    const user = await User.findById(sessionId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await WardrobeItem.find({ userId: user._id })
      .sort({ createdAt: -1 });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching wardrobe items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wardrobe items' },
      { status: 500 }
    );
  }
}

// Add a new wardrobe item
export async function POST(request: Request) {
  try {
    const sessionId = cookies().get('session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find user by session ID
    const user = await User.findById(sessionId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.category || !data.color || !data.season || !data.occasion || !data.imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'];
    if (!validCategories.includes(data.category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate seasons
    const validSeasons = ['spring', 'summer', 'fall', 'winter'];
    const invalidSeasons = data.season.filter((s: string) => !validSeasons.includes(s));
    if (invalidSeasons.length > 0) {
      return NextResponse.json(
        { error: `Invalid seasons: ${invalidSeasons.join(', ')}. Valid seasons are: ${validSeasons.join(', ')}` },
        { status: 400 }
      );
    }

    const item = await WardrobeItem.create({
      ...data,
      userId: user._id,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error adding wardrobe item:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to add wardrobe item' },
      { status: 500 }
    );
  }
}

// Delete a wardrobe item
export async function DELETE(request: Request) {
  try {
    const sessionId = cookies().get('session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find user by session ID
    const user = await User.findById(sessionId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const item = await WardrobeItem.findOneAndDelete({
      _id: itemId,
      userId: user._id,
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting wardrobe item:', error);
    return NextResponse.json(
      { error: 'Failed to delete wardrobe item' },
      { status: 500 }
    );
  }
} 