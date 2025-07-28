'use client';

import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';

export default function FirebaseTestPage() {
  const [authState, setAuthState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔥 Firebase test page loaded');
    console.log('🔥 Auth object:', auth);
    console.log('🔥 Auth app:', auth.app);
    console.log('🔥 Current user:', auth.currentUser);
    
    try {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        console.log('🔥 Auth state changed in test page:', user);
        setAuthState(user);
      });
      
      return () => unsubscribe();
    } catch (err: any) {
      console.error('🔥 Error setting up auth listener:', err);
      setError(err.message);
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Test Page</h1>
      <div className="space-y-4">
        <div>
          <strong>Auth State:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-2">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>
        {error && (
          <div className="text-red-500">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}
