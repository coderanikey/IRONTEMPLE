import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/auth/useAuth';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.replace('/login');
    } else {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div>Loading...</div>
    </div>
  );
}

