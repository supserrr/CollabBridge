'use client';

import { useEffect, useState } from 'react';

export default function AuthTestPage() {
  const [message, setMessage] = useState('Component initialized');

  useEffect(() => {
    console.log('🔥 AUTH TEST: useEffect is running!');
    setMessage('useEffect executed successfully');
  }, []);

  console.log('🔥 AUTH TEST: Component rendering, message:', message);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      <p>{message}</p>
    </div>
  );
}
