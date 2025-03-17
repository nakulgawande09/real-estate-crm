'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaHome, FaArrowLeft } from 'react-icons/fa';

export const runtime = 'edge';

// Client component for the button
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
    >
      <FaArrowLeft className="mr-2" />
      Go Back
    </button>
  );
}

export default function NotFound() {
  const router = useRouter();
  
  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-center max-w-lg p-8 bg-white rounded-lg shadow-md">
        <div className="mb-6 text-indigo-500">
          <FaHome className="inline-block h-16 w-16" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="inline-block">
            <Link
              href="/"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 inline-flex items-center justify-center"
            >
              Go Home
            </Link>
          </div>
          <BackButton onClick={handleGoBack} />
        </div>
      </div>
    </div>
  );
} 