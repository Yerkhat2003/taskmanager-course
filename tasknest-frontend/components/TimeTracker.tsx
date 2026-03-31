'use client';

import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/api';

interface TimerStatus {
  running: boolean;
  startedAt: string | null;
  totalMinutes: number;
  logs: { id: number; duration: number | null; startedAt: string; user: { name: string } }[];
}

function formatMinutes(min: number) {
  if (min < 60) return `${min}м`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}ч ${m}м` : `${h}ч`;
}

function formatElapsed(startedAt: string) {
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function TimeTracker({ taskId }: { taskId: number }) {
  const [status, setStatus] = useState<TimerStatus | null>(null);
  const [elapsed, setElapsed] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
    try {
      const data = await apiRequest<TimerStatus>(`/tasks/${taskId}/timer`);
      setStatus(data);
    } catch {  }
  };

  useEffect(() => { load(); }, [taskId]);

  useEffect(() => {
    if (status?.running && status.startedAt) {
      intervalRef.current = setInterval(() => setElapsed(formatElapsed(status.startedAt!)), 1000);
      setElapsed(formatElapsed(status.startedAt));
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed('');
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status?.running, status?.startedAt]);

  const handleStart = async () => {
    try {
      await apiRequest(`/tasks/${taskId}/timer/start`, { method: 'POST' });
      await load();
    } catch (err) { alert((err as Error).message); }
  };

  const handleStop = async () => {
    try {
      await apiRequest(`/tasks/${taskId}/timer/stop`, { method: 'POST' });
      await load();
    } catch (err) { alert((err as Error).message); }
  };

  if (!status) return null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">Трекинг времени</span>
        {status.totalMinutes > 0 && (
          <span className="text-[10px] text-slate-500">
            Итого: <span className="text-slate-300">{formatMinutes(status.totalMinutes)}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {status.running ? (
          <>
            <div className="flex items-center gap-1.5 flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="font-mono text-xs text-emerald-400">{elapsed || '00:00'}</span>
            </div>
            <button
              onClick={handleStop}
              className="rounded-lg bg-red-600/80 px-3 py-1.5 text-xs text-white transition hover:bg-red-500"
            >
              Стоп
            </button>
          </>
        ) : (
          <button
            onClick={handleStart}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600/80 px-3 py-1.5 text-xs text-white transition hover:bg-brand-500"
          >
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Запустить таймер
          </button>
        )}
      </div>

      {status.logs.length > 0 && (
        <div className="mt-2 space-y-1">
          {status.logs.slice(0, 3).map((log) => (
            <div key={log.id} className="flex items-center justify-between text-[10px] text-slate-500">
              <span>{log.user.name}</span>
              <span>{log.duration != null ? formatMinutes(log.duration) : '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
