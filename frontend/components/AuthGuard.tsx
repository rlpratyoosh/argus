'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Assuming you have a hook/context

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return <>{children}</>;
}