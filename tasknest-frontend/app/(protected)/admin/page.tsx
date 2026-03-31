'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Navbar } from '@/components/Navbar';

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface StatsData {
  users: { total: number };
  boards: { total: number; active: number; completed: number };
  tasks: { total: number; todo: number; inProgress: number; done: number };
  recentBoards: Array<{
    id: number;
    title: string;
    completed: boolean;
    createdAt: string;
    _count: { tasks: number };
  }>;
  recentUsers: UserRow[];
}

interface MeResponse {
  userId: number;
  email: string;
  role: string;
}


function DonutChart({
  segments,
}: {
  segments: { value: number; color: string; label: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <p className="text-xs text-slate-500">Нет данных</p>;

  const R = 40;
  const cx = 60;
  const cy = 60;
  let startAngle = -90;

  const paths = segments.map((seg) => {
    const pct = seg.value / total;
    const angle = pct * 360;
    const endAngle = startAngle + angle;
    const largeArc = angle > 180 ? 1 : 0;

    const rad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + R * Math.cos(rad(startAngle));
    const y1 = cy + R * Math.sin(rad(startAngle));
    const x2 = cx + R * Math.cos(rad(endAngle));
    const y2 = cy + R * Math.sin(rad(endAngle));

    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    startAngle = endAngle;
    return { d, color: seg.color };
  });

  return (
    <div className="flex items-center gap-5">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} opacity="0.85" />
        ))}
        <circle cx={cx} cy={cy} r="22" fill="#0f172a" />
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-bold"
          fill="#f1f5f9"
          fontSize="14"
          fontWeight="bold"
        >
          {total}
        </text>
      </svg>
      <ul className="flex flex-col gap-1.5">
        {segments.map((seg, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: seg.color }}
            />
            {seg.label}:{' '}
            <span className="font-semibold text-slate-100">{seg.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


function BarChart({
  bars,
  max,
}: {
  bars: { label: string; value: number; color: string }[];
  max: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      {bars.map((bar, i) => (
        <div key={i}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-400">{bar.label}</span>
            <span className="font-semibold text-slate-200">{bar.value}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: max > 0 ? `${(bar.value / max) * 100}%` : '0%',
                background: bar.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}


function StatCard({
  label,
  value,
  sub,
  gradient,
}: {
  label: string;
  value: number | string;
  sub?: string;
  gradient: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} p-5 shadow-lg`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-white/60">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/50">{sub}</p>}
    </div>
  );
}

const ROLE_LABELS: Record<string, string> = {
  USER: 'Пользователь',
  ADMIN: 'Администратор',
  SUPERADMIN: 'Суперадмин',
};

const ROLE_COLORS: Record<string, string> = {
  USER: 'bg-slate-700/60 text-slate-400',
  ADMIN: 'bg-violet-500/20 text-violet-300',
  SUPERADMIN: 'bg-amber-500/20 text-amber-300',
};

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleChanging, setRoleChanging] = useState<number | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  const loadStats = async () => {
    const [me, data] = await Promise.all([
      apiRequest<MeResponse>('/auth/me'),
      apiRequest<StatsData>('/stats'),
    ]);
    return { me, data };
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { me, data } = await loadStats();
        if (cancelled) return;
        setUser(me);
        setStats(data);
        setUsers(data.recentUsers);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleRoleChange = async (targetId: number, newRole: string) => {
    setRoleChanging(targetId);
    setRoleError(null);
    try {
      const updated = await apiRequest<UserRow>(`/users/${targetId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      setUsers((prev) => prev.map((u) => u.id === updated.id ? { ...u, role: updated.role } : u));
    } catch (err) {
      setRoleError((err as Error).message);
    } finally {
      setRoleChanging(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const taskMax = stats
    ? Math.max(stats.tasks.todo, stats.tasks.inProgress, stats.tasks.done, 1)
    : 1;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar userEmail={user?.email} userRole={user?.role} adminHref="/admin" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">
            Панель администратора
          </h1>
          <p className="text-sm text-slate-400">
            Сводная статистика по всей системе
          </p>
        </div>

        {loading && (
          <p className="text-sm text-slate-400">Загружаем статистику...</p>
        )}
        {error && (
          <p className="text-sm text-red-300">Ошибка: {error}</p>
        )}

        {stats && (
          <>
            {}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Пользователей"
                value={stats.users.total}
                sub="зарегистрировано"
                gradient="from-violet-600/60 to-violet-800/40"
              />
              <StatCard
                label="Всего досок"
                value={stats.boards.total}
                sub={`${stats.boards.active} активных · ${stats.boards.completed} завершённых`}
                gradient="from-sky-600/60 to-sky-800/40"
              />
              <StatCard
                label="Всего задач"
                value={stats.tasks.total}
                sub="по всем доскам"
                gradient="from-amber-600/60 to-amber-800/40"
              />
              <StatCard
                label="Выполнено"
                value={
                  stats.tasks.total > 0
                    ? `${Math.round((stats.tasks.done / stats.tasks.total) * 100)}%`
                    : '—'
                }
                sub={`${stats.tasks.done} из ${stats.tasks.total} задач`}
                gradient="from-emerald-600/60 to-emerald-800/40"
              />
            </div>

            {}
            <div className="grid gap-4 lg:grid-cols-2">
              {}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <p className="mb-4 text-sm font-semibold text-slate-200">
                  Задачи по статусу
                </p>
                <DonutChart
                  segments={[
                    { value: stats.tasks.todo, color: '#38bdf8', label: 'Todo' },
                    { value: stats.tasks.inProgress, color: '#f59e0b', label: 'In Progress' },
                    { value: stats.tasks.done, color: '#34d399', label: 'Done' },
                  ]}
                />
              </div>

              {}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <p className="mb-4 text-sm font-semibold text-slate-200">
                  Доски по статусу
                </p>
                <DonutChart
                  segments={[
                    { value: stats.boards.active, color: '#818cf8', label: 'Активные' },
                    { value: stats.boards.completed, color: '#34d399', label: 'Завершённые' },
                  ]}
                />
              </div>

              {}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <p className="mb-4 text-sm font-semibold text-slate-200">
                  Распределение задач
                </p>
                <BarChart
                  max={taskMax}
                  bars={[
                    { label: 'Todo', value: stats.tasks.todo, color: '#38bdf8' },
                    { label: 'In Progress', value: stats.tasks.inProgress, color: '#f59e0b' },
                    { label: 'Done', value: stats.tasks.done, color: '#34d399' },
                  ]}
                />
              </div>

          </div>

            {}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-200">
                  Управление пользователями
                </p>
                <input
                  type="text"
                  placeholder="Поиск по имени или email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-violet-500"
                />
              </div>
              {roleError && (
                <p className="mb-3 text-xs text-red-400">{roleError}</p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-500">
                      <th className="pb-2 text-left font-medium">Пользователь</th>
                      <th className="pb-2 text-center font-medium">Текущая роль</th>
                      <th className="pb-2 text-center font-medium">Зарегистрирован</th>
                      <th className="pb-2 text-right font-medium">Изменить роль</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isMe = u.id === user?.userId;
                      const canEdit = !isMe && (isSuperAdmin || u.role !== 'SUPERADMIN');
                      const availableRoles = isSuperAdmin
                        ? ['USER', 'ADMIN', 'SUPERADMIN']
                        : ['USER', 'ADMIN'];
                      return (
                        <tr key={u.id} className="border-b border-white/5 transition hover:bg-white/5">
                          <td className="py-2.5 pr-4">
                            <p className="font-medium text-slate-200">{u.name}</p>
                            <p className="text-[10px] text-slate-500">{u.email}</p>
                          </td>
                          <td className="py-2.5 text-center">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[u.role] ?? 'bg-slate-700/60 text-slate-400'}`}>
                              {ROLE_LABELS[u.role] ?? u.role}
                            </span>
                          </td>
                          <td className="py-2.5 text-center text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="py-2.5 text-right">
                            {isMe ? (
                              <span className="text-[10px] text-slate-600">вы</span>
                            ) : !canEdit ? (
                              <span className="text-[10px] text-slate-600">нет доступа</span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                {availableRoles.filter((r) => r !== u.role).map((r) => (
                                  <button
                                    key={r}
                                    disabled={roleChanging === u.id}
                                    onClick={() => handleRoleChange(u.id, r)}
                                    className={`rounded-md px-2 py-1 text-[10px] font-semibold transition disabled:opacity-50 ${
                                      r === 'SUPERADMIN'
                                        ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                        : r === 'ADMIN'
                                        ? 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
                                        : 'bg-slate-700/60 text-slate-400 hover:bg-slate-700'
                                    }`}
                                  >
                                    {roleChanging === u.id ? '...' : `→ ${ROLE_LABELS[r]}`}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-500">
                          Пользователи не найдены
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <p className="mb-4 text-sm font-semibold text-slate-200">
                Последние доски
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-500">
                      <th className="pb-2 text-left font-medium">Доска</th>
                      <th className="pb-2 text-center font-medium">Задач</th>
                      <th className="pb-2 text-center font-medium">Статус</th>
                      <th className="pb-2 text-right font-medium">Создана</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBoards.map((b) => (
                      <tr
                        key={b.id}
                        onClick={() => router.push(`/boards/${b.id}`)}
                        className="cursor-pointer border-b border-white/5 transition hover:bg-white/5"
                      >
                        <td className="py-2 pr-4 font-medium text-slate-200">
                          {b.title}
                        </td>
                        <td className="py-2 text-center text-slate-400">
                          {b._count.tasks}
                        </td>
                        <td className="py-2 text-center">
                          <span
                            className={`rounded-full px-2 py-0.5 font-semibold ${
                              b.completed
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-sky-500/15 text-sky-400'
                            }`}
                          >
                            {b.completed ? 'Завершена' : 'Активна'}
                          </span>
                        </td>
                        <td className="py-2 text-right text-slate-500">
                          {new Date(b.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                    {stats.recentBoards.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-4 text-center text-slate-500"
                        >
                          Досок нет
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
