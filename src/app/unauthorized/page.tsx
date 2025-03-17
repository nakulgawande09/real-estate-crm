'use client';

import Link from 'next/link';
import { FaExclamationTriangle, FaSignInAlt } from 'react-icons/fa';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You do not have permission to access this page. Please sign in with an account that has the appropriate permissions.
          </p>
        </div>
        <div className="mt-8">
          <Link 
            href="/auth/signin"
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaSignInAlt className="mr-2" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 