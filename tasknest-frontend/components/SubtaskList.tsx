'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

export function SubtaskList({ taskId }: { taskId: number }) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    try {
      const data = await apiRequest<Subtask[]>(`/tasks/${taskId}/subtasks`);
      setSubtasks(data);
    } catch {  }
  };

  useEffect(() => { load(); }, [taskId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const sub = await apiRequest<Subtask>(`/tasks/${taskId}/subtasks`, {
        method: 'POST',
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      setSubtasks((prev) => [...prev, sub]);
      setNewTitle('');
    } finally { setAdding(false); }
  };

  const handleToggle = async (id: number) => {
    try {
      const updated = await apiRequest<Subtask>(`/subtasks/${id}/toggle`, { method: 'PATCH' });
      setSubtasks((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch {  }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiRequest(`/subtasks/${id}`, { method: 'DELETE' });
      setSubtasks((prev) => prev.filter((s) => s.id !== id));
    } catch {  }
  };

  const done = subtasks.filter((s) => s.completed).length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">
          Подзадачи {subtasks.length > 0 && <span className="text-slate-500">({done}/{subtasks.length})</span>}
        </span>
      </div>

      {subtasks.length > 0 && (
        <div className="mb-2 h-1 rounded-full bg-slate-700">
          <div
            className="h-1 rounded-full bg-brand-500 transition-all"
            style={{ width: `${subtasks.length > 0 ? (done / subtasks.length) * 100 : 0}%` }}
          />
        </div>
      )}

      <div className="space-y-1 mb-2">
        {subtasks.map((s) => (
          <div key={s.id} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-800/50">
            <button
              onClick={() => handleToggle(s.id)}
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                s.completed
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-slate-600 hover:border-brand-400'
              }`}
            >
              {s.completed && (
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className={`flex-1 text-xs ${s.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
              {s.title}
            </span>
            <button
              onClick={() => handleDelete(s.id)}
              className="hidden text-slate-600 hover:text-red-400 transition group-hover:block"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-1.5">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Добавить подзадачу..."
          className="flex-1 rounded-lg border border-slate-700/60 bg-slate-800/50 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-brand-500/60"
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          className="rounded-lg bg-brand-600/80 px-3 py-1.5 text-xs text-white transition hover:bg-brand-500 disabled:opacity-40"
        >
          +
        </button>
      </form>
    </div>
  );
}
