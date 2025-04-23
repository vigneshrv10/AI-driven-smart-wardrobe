import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb-client";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";
import { cookies } from "next/headers";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

interface GoogleUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

interface GoogleAccount {
  provider: string;
  [key: string]: any;
}

// Extend the Session type to include user ID
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async signIn({ user, account }: { user: GoogleUser; account: GoogleAccount | null }) {
      if (account?.provider === "google") {
        await dbConnect();
        
        // Check if user exists with this Google ID
        let dbUser = await User.findOne({ googleId: user.id });
        
        // If not, check if email exists
        if (!dbUser) {
          dbUser = await User.findOne({ email: user.email });
          
          // If email exists but no Google ID, update the user
          if (dbUser) {
            dbUser.googleId = user.id;
            dbUser.authProvider = 'google';
            if (user.image) dbUser.profilePicture = user.image;
            await dbUser.save();
          } else {
            // Create new user
            dbUser = await User.create({
              googleId: user.id,
              email: user.email,
              name: user.name,
              username: user.email?.split('@')[0] || `user_${Date.now()}`,
              password: Math.random().toString(36).slice(-10), // Random password
              authProvider: 'google',
              profilePicture: user.image || '',
            });
          }
        }
        
        // Set session cookie to maintain compatibility with existing auth system
        cookies().set('session', dbUser._id.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });
      }
      return true;
    },
    async session({ session, user }: { session: Session; user: AdapterUser }) {
      // Add user ID to session
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
