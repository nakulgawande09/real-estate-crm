'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserTie } from 'react-icons/fa';
import { signIn } from 'next-auth/react';

export const runtime = 'edge';

function SignInContent() {
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setError('');

    try {
      console.log('Demo login button clicked, authenticating as demo user...');
      
      // First, ensure the demo user exists via the demo-user API
      const response = await fetch('/api/auth/demo-user');
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create demo user');
      }

      // Get the demo user credentials from the API response
      const demoEmail = data.user.email;
      const demoPassword = data.user.password;
      
      // Use NextAuth's signIn function with the demo credentials
      const result = await signIn('credentials', {
        redirect: false,
        email: demoEmail,
        password: demoPassword,
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error in demo login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to login with demo account. Please try again.';
      setError(errorMessage);
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            Real Estate CRM
          </h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Welcome to the Demo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Click the button below to sign in with the demo account
          </p>
        </div>

        {error && (
          <div className="text-red-500 text-sm font-medium text-center p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-col space-y-4">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isDemoLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isDemoLoading ? (
              <>
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </span>
                Preparing demo...
              </>
            ) : (
              <>
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <FaUserTie className="h-5 w-5 text-green-500 group-hover:text-green-400" />
                </span>
                Login as Demo CEO
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
} 