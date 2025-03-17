import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import clientPromise from '@/lib/mongodb-client';
import User from '@/models/User';
import { NextAuthOptions } from 'next-auth';
import { mockUsers } from '@/lib/mockData';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

export const authOptions: NextAuthOptions = {
  adapter: USE_MOCK_DATA ? undefined : MongoDBAdapter(clientPromise),
  debug: true,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('Missing credentials');
            throw new Error('Email and password are required');
          }

          if (USE_MOCK_DATA) {
            console.log('Using mock data for authentication');
            const user = mockUsers.find(u => u.email === credentials.email);

            if (!user) {
              console.log('No user found with email:', credentials.email);
              throw new Error('No user found with this email');
            }

            console.log('User found, checking password');
            const isPasswordValid = user.password === credentials.password;

            if (!isPasswordValid) {
              console.log('Password invalid for user:', credentials.email);
              throw new Error('Invalid password');
            }

            console.log('Authentication successful for user:', credentials.email);
            return {
              id: user._id,
              email: user.email,
              name: user.name,
              role: user.role,
              image: null
            };
          }

          await connectToDatabase();

          console.log('Looking up user with email:', credentials.email);
          // Find user by email - use a more reliable approach to handle TypeScript issues
          // Cast to any to avoid TypeScript errors with Mongoose models
          const user = await (User as any).findOne({ email: credentials.email });

          if (!user) {
            console.log('No user found with email:', credentials.email);
            throw new Error('No user found with this email');
          }

          console.log('User found, checking password');
          // Check if password matches
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('Password check result:', isPasswordValid ? 'valid' : 'invalid');

          if (!isPasswordValid) {
            console.log('Password invalid for user:', credentials.email);
            throw new Error('Invalid password');
          }

          console.log('Authentication successful for user:', credentials.email);
          // Return user object without password
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.profileImage || null
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('Adding user data to JWT token:', user.id);
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        console.log('Adding user data to session for user ID:', token.id);
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 