import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Get the authenticated user from either NextAuth session or cookie-based session
 * This provides backward compatibility with the existing authentication system
 */
export async function getAuthenticatedUser() {
  // Try to get user from NextAuth session first
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    await dbConnect();
    const user = await User.findOne({ email: session.user.email }).select('-password');
    if (user) return user;
  }

  // Fall back to cookie-based authentication
  const sessionId = cookies().get('session')?.value;
  if (sessionId) {
    await dbConnect();
    const user = await User.findById(sessionId).select('-password');
    if (user) return user;
  }

  return null;
}

/**
 * Check if the user is authenticated
 * Returns true if the user is authenticated via either method
 */
export async function isAuthenticated() {
  const user = await getAuthenticatedUser();
  return !!user;
}
