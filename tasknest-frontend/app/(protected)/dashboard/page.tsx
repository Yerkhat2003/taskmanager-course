'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { BoardCard } from '@/components/BoardCard';
import { TemplateModal } from '@/components/TemplateModal';

interface Board {
  id: number;
  title: string;
  completed: boolean;
  _count?: { tasks: number };
}

interface MeResponse {
  userId: number;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const loadBoards = async () => {
    const data = await apiRequest<Board[]>('/boards');
    setBoards(data);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const me = await apiRequest<MeResponse>('/auth/me');
        if (cancelled) return;
        setUser(me);
        const data = await apiRequest<Board[]>('/boards');
        if (cancelled) return;
        setBoards(data);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = boards.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()),
  );
  const activeBoards = filtered.filter((b) => !b.completed);
  const completedBoards = filtered.filter((b) => b.completed);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await apiRequest('/boards', {
        method: 'POST',
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      setNewTitle('');
      await loadBoards();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiRequest(`/boards/${id}`, { method: 'DELETE' });
      await loadBoards();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await apiRequest(`/boards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: false }),
      });
      await loadBoards();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar userEmail={user?.email} userRole={user?.role} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
        {}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-50">Твои доски</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {}
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Поиск досок..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800/50 pl-8 pr-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500"
              />
            </div>

            {}
            <input
              type="text"
              placeholder="Название доски"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newTitle.trim()}
              className="rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-medium text-slate-950 transition hover:bg-brand-600 disabled:opacity-40"
            >
              {creating ? '...' : '+ Создать'}
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              className="rounded-lg border border-slate-600/60 bg-slate-800/50 px-3 py-1.5 text-sm text-slate-300 transition hover:border-brand-400 hover:bg-brand-500/10"
              title="Создать из шаблона"
            >
              📋 Шаблон
            </button>
          </div>
        </div>

        {showTemplates && <TemplateModal onClose={() => setShowTemplates(false)} />}

        {loading && <p className="text-sm text-slate-400">Загружаем вселенную досок...</p>}
        {error && <p className="text-sm text-red-300">Не удалось загрузить доски: {error}</p>}

        {!loading && !error && (
          <>
            {}
            {boards.length > 0 && (
              <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-slate-900/50 px-4 py-2.5">
                <span className="text-xs text-slate-500">
                  Всего: <span className="text-slate-300 font-medium">{boards.length}</span>
                </span>
                <span className="text-xs text-slate-500">
                  Активных: <span className="text-brand-300 font-medium">{boards.filter((b) => !b.completed).length}</span>
                </span>
                <span className="text-xs text-slate-500">
                  Завершённых: <span className="text-emerald-400 font-medium">{boards.filter((b) => b.completed).length}</span>
                </span>
              </div>
            )}

            {}
            <div className="grid gap-4 md:grid-cols-3">
              {activeBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  id={board.id}
                  title={board.title}
                  taskCount={board._count?.tasks}
                  isAdmin={true}
                  onClick={() => router.push(`/boards/${board.id}`)}
                  onDelete={() => handleDelete(board.id)}
                />
              ))}
              {activeBoards.length === 0 && !search && (
                <p className="col-span-full text-sm text-slate-400">
                  Активных досок нет — создай первую выше.
                </p>
              )}
              {activeBoards.length === 0 && search && (
                <p className="col-span-full text-sm text-slate-400">
                  Ничего не найдено по запросу «{search}».
                </p>
              )}
            </div>

            {}
            {completedBoards.length > 0 && (
              <div>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-300">
                  Завершённые доски
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-normal text-emerald-400">
                    {completedBoards.length}
                  </span>
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {completedBoards.map((board) => (
                    <div
                      key={board.id}
                      className="group relative flex flex-col items-start rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900/60 to-emerald-950/30 p-4 shadow-lg shadow-black/30"
                    >
                      <span className="mb-2 inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-400">
                        Завершена
                      </span>
                      <button
                        onClick={() => router.push(`/boards/${board.id}`)}
                        className="w-full text-left"
                      >
                        <p className="text-sm font-semibold text-slate-200">{board.title}</p>
                        {board._count && (
                          <p className="mt-1 text-[11px] text-slate-500">
                            {board._count.tasks} {board._count.tasks === 1 ? 'задача' : 'задач'}
                          </p>
                        )}
                        <span className="mt-2 inline-block text-[11px] text-slate-500">
                          Посмотреть &rarr;
                        </span>
                      </button>

                      <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => handleRestore(board.id)}
                          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400 hover:bg-emerald-500/20"
                        >
                          Вернуть
                        </button>
                        <button
                          onClick={() => handleDelete(board.id)}
                          className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-medium text-red-400 hover:bg-red-500/20"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
