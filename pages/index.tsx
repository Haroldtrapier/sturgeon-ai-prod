import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/chat');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      fontFamily: 'sans-serif',
      flexDirection: 'column'
    }}>
      <h1>🐟 Sturgeon AI</h1>
      <p>Loading...</p>
    </div>
  );
}
