'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Get error from URL parameters
    const error = searchParams.get('error');
    
    if (error) {
      switch (error) {
        case 'Configuration':
          setErrorMessage('There is a problem with the server configuration.');
          break;
        case 'AccessDenied':
          setErrorMessage('You do not have permission to access this resource.');
          break;
        case 'Verification':
          setErrorMessage('The verification link has expired or is invalid.');
          break;
        case 'OAuthSignin':
          setErrorMessage('Error in the OAuth sign-in process.');
          break;
        case 'OAuthCallback':
          setErrorMessage('Error in the OAuth callback process.');
          break;
        case 'OAuthCreateAccount':
          setErrorMessage('Error creating an account with the OAuth provider.');
          break;
        case 'EmailCreateAccount':
          setErrorMessage('Error creating an account with the email provider.');
          break;
        case 'Callback':
          setErrorMessage('Error in the authentication callback process.');
          break;
        case 'OAuthAccountNotLinked':
          setErrorMessage('This email is already associated with another account.');
          break;
        case 'EmailSignin':
          setErrorMessage('Error sending the email for sign-in.');
          break;
        case 'CredentialsSignin':
          setErrorMessage('The email or password you entered is incorrect.');
          break;
        case 'SessionRequired':
          setErrorMessage('You must be signed in to access this page.');
          break;
        default:
          setErrorMessage('An unknown error occurred during authentication.');
      }
    } else {
      setErrorMessage('An unknown error occurred during authentication.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {errorMessage}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <Link
              href="/login"
              className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaArrowLeft className="mr-2 h-5 w-5" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
} 