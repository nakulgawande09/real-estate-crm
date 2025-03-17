'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export const runtime = 'edge';

export default function TestLoginPage() {
  const [email, setEmail] = useState('demo@realestatecrm.com');
  const [password, setPassword] = useState('demo123456');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setResult('Trying to sign in...');
    
    try {
      // First, ensure the demo user exists
      const demoResponse = await fetch('/api/auth/demo-user');
      const demoData = await demoResponse.json();
      
      setResult(prev => prev + '\nDemo user API response: ' + JSON.stringify(demoData));
      
      // Test credentials
      const testResponse = await fetch('/api/auth/test-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const testData = await testResponse.json();
      setResult(prev => prev + '\nCredential test response: ' + JSON.stringify(testData));
      
      // Attempt actual sign in
      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      setResult(prev => prev + '\nSign-in result: ' + JSON.stringify(signInResult));
    } catch (error) {
      setResult(prev => prev + '\nError: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Test Login Page</h1>
      
      <div className="mb-4">
        <label className="block mb-2">Email:</label>
        <input
          type="email"
          className="border p-2 w-full max-w-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">Password:</label>
        <input
          type="text" // Using text instead of password for debugging
          className="border p-2 w-full max-w-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test Login'}
      </button>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Results:</h2>
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{result || 'No results yet'}</pre>
      </div>
    </div>
  );
} 