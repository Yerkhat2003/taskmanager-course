'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

interface Member {
  id: number;
  role: string;
  user: { id: number; name: string; email: string; avatarUrl?: string | null };
}

const ROLE_LABELS: Record<string, { label: string; desc: string; cls: string }> = {
  owner:  { label: 'Владелец',    desc: 'Полный доступ, управление участниками', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  editor: { label: 'Редактор',    desc: 'Создаёт задачи, двигает, удаляет свои', cls: 'text-brand-400 bg-brand-500/10 border-brand-500/30' },
  viewer: { label: 'Наблюдатель', desc: 'Только просмотр и комментарии',          cls: 'text-slate-400 bg-slate-700/40 border-slate-600/40' },
};

export function BoardMembers({
  boardId,
  currentUserId,
  isAppAdmin = false,
  onMembersChange,
}: {
  boardId: number;
  currentUserId?: number;
  isAppAdmin?: boolean;
  onMembersChange?: () => void;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const data = await apiRequest<Member[]>(`/boards/${boardId}/members`);
      setMembers(data);
    } catch {  }
  };

  useEffect(() => { if (open) load(); }, [open, boardId]);

  const isOwner = isAppAdmin || members.some((m) => m.user.id === currentUserId && m.role === 'owner');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    setError('');
    try {
      const m = await apiRequest<Member>(`/boards/${boardId}/members`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMembers((prev) => [...prev, m]);
      setEmail('');
      onMembersChange?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      const updated = await apiRequest<Member>(`/boards/${boardId}/members/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      setMembers((prev) => prev.map((m) => (m.user.id === userId ? updated : m)));
      onMembersChange?.();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleRemove = async (userId: number) => {
    try {
      await apiRequest(`/boards/${boardId}/members/${userId}`, { method: 'DELETE' });
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
      onMembersChange?.();
    } catch {  }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 transition hover:border-brand-500/60 hover:text-white"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Участники
        {members.length > 0 && (
          <span className="rounded-full bg-brand-500/20 px-1.5 text-[10px] text-brand-400">{members.length}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-40 w-80 rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
          <div className="border-b border-white/5 px-4 py-2.5">
            <p className="text-xs font-semibold text-slate-200">Участники доски</p>
            {isOwner && (
              <p className="text-[10px] text-slate-500 mt-0.5">Вы владелец — можете менять роли</p>
            )}
          </div>

          {}
          {isOwner && (
            <div className="border-b border-white/5 px-4 py-2 space-y-1">
              {Object.entries(ROLE_LABELS).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${cfg.cls}`}>{cfg.label}</span>
                  <span className="text-[10px] text-slate-500">{cfg.desc}</span>
                </div>
              ))}
            </div>
          )}

          <div className="max-h-52 overflow-y-auto p-2">
            {members.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">Нет участников</p>
            ) : (
              members.map((m) => {
                const roleCfg = ROLE_LABELS[m.role] ?? ROLE_LABELS.viewer;
                const isSelf = m.user.id === currentUserId;
                return (
                  <div key={m.id} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-800/50">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-[10px] font-bold text-white">
                      {m.user.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium text-slate-200">
                        {m.user.name}
                        {isSelf && <span className="ml-1 text-[10px] text-slate-500">(вы)</span>}
                      </p>
                      <p className="truncate text-[10px] text-slate-500">{m.user.email}</p>
                    </div>

                    {}
                    {isOwner && !(isSelf && m.role === 'owner') ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.user.id, e.target.value)}
                        className="rounded-md border border-slate-700/60 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 outline-none focus:border-brand-500/60"
                      >
                        <option value="owner">Владелец</option>
                        <option value="editor">Редактор</option>
                        <option value="viewer">Наблюдатель</option>
                      </select>
                    ) : (
                      <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${roleCfg.cls}`}>
                        {roleCfg.label}
                      </span>
                    )}

                    {isOwner && !isSelf && (
                      <button
                        onClick={() => handleRemove(m.user.id)}
                        className="shrink-0 text-slate-600 hover:text-red-400 transition"
                        title="Удалить участника"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {isOwner && (
            <form onSubmit={handleInvite} className="border-t border-white/5 p-3">
              <p className="mb-1.5 text-[10px] text-slate-500">Пригласить по email (добавится как Наблюдатель)</p>
              <div className="flex gap-1.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="flex-1 rounded-lg border border-slate-700/60 bg-slate-800/50 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-brand-500/60"
                />
                <button
                  type="submit"
                  disabled={inviting}
                  className="rounded-lg bg-brand-600/80 px-3 py-1.5 text-xs text-white transition hover:bg-brand-500 disabled:opacity-40"
                >
                  +
                </button>
              </div>
              {error && <p className="mt-1 text-[10px] text-red-400">{error}</p>}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
