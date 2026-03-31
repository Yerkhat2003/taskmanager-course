'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    apiRequest<{ role: string }>('/auth/me')
      .then((me) => {
        router.replace(me.role === 'ADMIN' ? '/admin' : '/dashboard');
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  );
}
