'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

interface SearchTask {
  id: number;
  title: string;
  status: string;
  priority: string;
  board: { id: number; title: string };
}

const STATUS_LABEL: Record<string, string> = { todo: 'Todo', in_progress: 'In Progress', done: 'Done' };
const PRIORITY_COLOR: Record<string, string> = {
  low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-red-400',
};

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchTask[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await apiRequest<SearchTask[]>(`/tasks/search?q=${encodeURIComponent(query)}`);
        setResults(data);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (task: SearchTask) => {
    setOpen(false);
    setQuery('');
    router.push(`/boards/${task.board.id}?task=${task.id}`);
  };

  return (
    <div ref={ref} className="relative w-56">
      <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 text-xs focus-within:border-brand-500/60">
        <svg className="h-3.5 w-3.5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск задач..."
          className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none"
        />
        {loading && (
          <svg className="h-3 w-3 animate-spin text-slate-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
          <p className="px-3 py-2 text-[10px] text-slate-500 border-b border-white/5">
            {results.length} результат(ов)
          </p>
          <div className="max-h-64 overflow-y-auto">
            {results.map((t) => (
              <button
                key={t.id}
                onClick={() => go(t)}
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-slate-800/70 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium text-slate-200">{t.title}</p>
                  <p className="text-[10px] text-slate-500">{t.board.title} · {STATUS_LABEL[t.status] ?? t.status}</p>
                </div>
                <span className={`text-[10px] font-medium shrink-0 mt-0.5 ${PRIORITY_COLOR[t.priority] ?? ''}`}>
                  {t.priority}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {open && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-white/10 bg-slate-900 px-4 py-6 text-center shadow-2xl">
          <p className="text-xs text-slate-500">Ничего не найдено</p>
        </div>
      )}
    </div>
  );
}
