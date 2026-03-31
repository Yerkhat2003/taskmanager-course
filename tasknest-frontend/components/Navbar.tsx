'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { NotificationsBell } from './NotificationsBell';
import { GlobalSearch } from './GlobalSearch';

interface NavbarProps {
  userEmail?: string;
  userRole?: string;
  adminHref?: string;
}

export function Navbar({ userEmail, userRole, adminHref }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const initial = stored ?? 'dark';
    setTheme(initial);
    if (initial === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    if (next === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {

    } finally {
      router.push('/login');
    }
  };

  const isAdmin = userRole === 'ADMIN';
  const onAdminPage = pathname?.startsWith('/admin');

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur [data-theme=light]:bg-white/80 [data-theme=light]:border-black/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(isAdmin ? '/admin' : '/dashboard')}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-xs font-bold text-slate-950">
              TN
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-50 [data-theme=light]:text-slate-900">TaskNest</p>
            </div>
          </button>

          {}
          {isAdmin && (
            <nav className="flex items-center gap-1">
              <button
                onClick={() => router.push('/admin')}
                className={`rounded-lg px-3 py-1 text-xs transition ${
                  onAdminPage
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Аналитика
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className={`rounded-lg px-3 py-1 text-xs transition ${
                  !onAdminPage
                    ? 'bg-slate-700/60 text-slate-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Доски
              </button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <GlobalSearch />
          {}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            className="rounded-full border border-slate-600/60 p-1.5 text-slate-400 transition hover:border-brand-400 hover:bg-brand-500/10"
          >
            {theme === 'dark' ? (
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {}
          <NotificationsBell />

          {isAdmin && (
            <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 font-semibold text-violet-300 ring-1 ring-violet-400/30">
              ADMIN
            </span>
          )}
          {userEmail && (
            <button
              onClick={() => router.push('/profile')}
              className="rounded-full bg-slate-800/80 px-3 py-1 text-slate-200 transition hover:bg-slate-700/80"
            >
              {userEmail}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-600/60 px-3 py-1 text-slate-200 transition hover:border-brand-400 hover:bg-brand-500/10"
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}
