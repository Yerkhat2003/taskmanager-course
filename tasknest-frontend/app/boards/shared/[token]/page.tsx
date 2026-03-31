'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface TaskUser {
  id: number;
  name: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string | null;
  user?: TaskUser;
  assignee?: { id: number; name: string } | null;
}

interface Board {
  id: number;
  title: string;
  completed: boolean;
  tasks: Task[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const PRIORITY_CONFIG: Record<string, { label: string; cls: string }> = {
  low: { label: 'Low', cls: 'bg-emerald-500/15 text-emerald-400' },
  medium: { label: 'Medium', cls: 'bg-amber-500/15 text-amber-400' },
  high: { label: 'High', cls: 'bg-red-500/15 text-red-400' },
};

const COLUMNS = [
  { key: 'todo', label: 'Todo', accent: 'border-sky-500/40' },
  { key: 'in_progress', label: 'In Progress', accent: 'border-amber-500/40' },
  { key: 'done', label: 'Done', accent: 'border-emerald-500/40' },
];

export default function SharedBoardPage() {
  const params = useParams<{ token: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/boards/shared/${params.token}`)
      .then((r) => {
        if (!r.ok) throw new Error('Доска не найдена или ссылка устарела');
        return r.json();
      })
      .then(setBoard)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.token]);

  const doneCount = board?.tasks.filter((t) => t.status === 'done').length ?? 0;
  const progress = board && board.tasks.length > 0
    ? Math.round((doneCount / board.tasks.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.22),_transparent_55%)]" />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-xs font-bold text-slate-950">
              TN
            </div>
            <span className="text-sm font-semibold text-slate-100">TaskNest</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-[10px] font-medium text-brand-300 ring-1 ring-brand-400/20">
              Публичный просмотр
            </span>
            <Link
              href="/login"
              className="rounded-full border border-slate-600/60 px-3 py-1 text-xs text-slate-300 transition hover:border-brand-400 hover:bg-brand-500/10"
            >
              Войти
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
            <p className="text-red-300">{error}</p>
            <Link href="/login" className="mt-3 inline-block text-xs text-brand-400 hover:text-brand-300">
              Перейти к входу
            </Link>
          </div>
        )}

        {board && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-50">{board.title}</h1>
              <p className="mt-1 text-sm text-slate-400">
                {board.tasks.length} задач · только для просмотра
              </p>

              {board.tasks.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Прогресс</span>
                    <span>{doneCount}/{board.tasks.length} — {progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {COLUMNS.map((col) => {
                const colTasks = board.tasks.filter((t) => t.status === col.key);
                return (
                  <div
                    key={col.key}
                    className={`rounded-2xl border-t-2 ${col.accent} border border-white/10 bg-slate-900/60 p-4`}
                  >
                    <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {col.label}
                      <span className="rounded-full bg-slate-700/60 px-1.5 py-0.5 text-[10px] text-slate-500">
                        {colTasks.length}
                      </span>
                    </h2>
                    <div className="flex flex-col gap-2">
                      {colTasks.map((task) => {
                        const pCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                        return (
                          <div
                            key={task.id}
                            className="rounded-xl border border-white/5 bg-slate-800/50 p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-slate-100">{task.title}</p>
                              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ${pCfg.cls}`}>
                                {pCfg.label}
                              </span>
                            </div>
                            {task.description && (
                              <p className="mt-1 text-xs text-slate-400 line-clamp-2">{task.description}</p>
                            )}
                            {task.dueDate && (
                              <p className="mt-1.5 text-[10px] text-slate-500">
                                до {new Date(task.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                              </p>
                            )}
                            {task.assignee && (
                              <p className="mt-1 text-[10px] text-slate-500">{task.assignee.name}</p>
                            )}
                          </div>
                        );
                      })}
                      {colTasks.length === 0 && (
                        <p className="text-xs text-slate-600">Пусто</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
