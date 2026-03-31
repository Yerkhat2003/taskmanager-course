'use client';

import { useEffect, useState, useCallback, DragEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { TaskCard } from '@/components/TaskCard';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { BoardMembers } from '@/components/BoardMembers';

interface TaskUser {
  id: number;
  name: string;
  email: string;
}

interface TaskAssignee {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

interface TaskAttachment {
  id: number;
  filename: string;
  url: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string | null;
  userId: number;
  user?: TaskUser;
  assignee?: TaskAssignee | null;
  assigneeId?: number | null;
  attachments?: TaskAttachment[];
  _count?: { comments: number };
}

interface Board {
  id: number;
  title: string;
  completed: boolean;
  tasks: Task[];
}

interface MeResponse {
  userId: number;
  email: string;
  role: string;
  name: string;
}

interface UserOption {
  id: number;
  name: string;
  email: string;
}

const COLUMNS = [
  { key: 'todo', label: 'Todo', accent: 'border-sky-500/40', dropHighlight: 'ring-sky-400/50' },
  { key: 'in_progress', label: 'In Progress', accent: 'border-amber-500/40', dropHighlight: 'ring-amber-400/50' },
  { key: 'done', label: 'Done', accent: 'border-emerald-500/40', dropHighlight: 'ring-emerald-400/50' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function BoardPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [board, setBoard] = useState<Board | null>(null);
  const [user, setUser] = useState<MeResponse | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [myBoardRole, setMyBoardRole] = useState<string>('member');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState<number | ''>('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [initialModalTab, setInitialModalTab] = useState<string | undefined>(undefined);


  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterOverdue, setFilterOverdue] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isBoardOwner = myBoardRole === 'owner';

  const isBoardEditor = myBoardRole === 'editor' || myBoardRole === 'member' || isBoardOwner;
  const isBoardViewer = myBoardRole === 'viewer';
  const isBoardCompleted = board?.completed === true;
  const tasks = board?.tasks || [];
  const allDone = tasks.length > 0 && tasks.every((t) => t.status === 'done');

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterAssignee && String(t.assigneeId) !== filterAssignee) return false;
    if (filterOverdue && (!t.dueDate || new Date(t.dueDate) >= new Date() || t.status === 'done')) return false;
    return true;
  });

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  const loadBoard = useCallback(async () => {
    const data = await apiRequest<Board>(`/boards/${params.id}`);
    setBoard(data);
  }, [params.id]);

  const loadMembers = useCallback(async (meId?: number) => {
    try {
      const members = await apiRequest<{ role: string; user: UserOption }[]>(`/boards/${params.id}/members`);
      setUsers(members.map((m) => m.user));
      const myId = meId ?? user?.userId;
      if (myId) {

        const me = members.find((m) => m.user.id == myId);
        if (me) setMyBoardRole(me.role);
      }
    } catch {  }
  }, [params.id, user?.userId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [me, boardData, members] = await Promise.all([
          apiRequest<MeResponse>('/auth/me'),
          apiRequest<Board>(`/boards/${params.id}`),

          apiRequest<{ id: number; role: string; user: UserOption }[]>(`/boards/${params.id}/members`),
        ]);
        if (cancelled) return;
        setUser(me);
        setBoard(boardData);
        setUsers(members.map((m) => m.user));

        const myMembership = members.find((m) => m.user.id == me.userId);
        if (myMembership) {
          setMyBoardRole(myMembership.role);
        }


        const taskIdParam = searchParams.get('task');
        const tabParam = searchParams.get('tab');
        if (taskIdParam) {
          const taskId = parseInt(taskIdParam, 10);
          if (!isNaN(taskId)) {
            setSelectedTaskId(taskId);
            if (tabParam) setInitialModalTab(tabParam);
          }
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [params.id, searchParams]);


  useEffect(() => {
    if (typeof window === 'undefined') return;
    let socket: any = null;

    const connect = async () => {
      try {
        const { io } = await import('socket.io-client');
        socket = io(API_URL, { withCredentials: true });
        socket.emit('join:board', Number(params.id));
        socket.on('task:created', () => { loadBoard(); });
        socket.on('task:updated', () => { loadBoard(); });
        socket.on('task:deleted', () => { loadBoard(); });
      } catch {

      }
    };

    connect();
    return () => { if (socket) socket.disconnect(); };
  }, [params.id, loadBoard]);

  const handleCreateTask = async () => {
    if (!newTitle.trim() || isBoardCompleted) return;
    setCreating(true);
    try {
      let fileUrl: string | undefined;
      if (newFile) {
        const formData = new FormData();
        formData.append('file', newFile);
        const resp = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        const fileData = await resp.json();
        fileUrl = fileData.url;
      }

      await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          boardId: Number(params.id),
          priority: newPriority,
          dueDate: newDueDate || undefined,
          assigneeId: newAssigneeId || undefined,
          fileUrl: fileUrl || undefined,
          filename: newFile?.name || undefined,
        }),
      });

      setNewTitle('');
      setNewDesc('');
      setNewPriority('medium');
      setNewDueDate('');
      setNewAssigneeId('');
      setNewFile(null);
      await loadBoard();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    if (!board || isBoardCompleted) return;
    setBoard({ ...board, tasks: board.tasks.map((t) => t.id === taskId ? { ...t, status: newStatus } : t) });
    try {
      await apiRequest(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
      await loadBoard();
    } catch (err) {
      setError((err as Error).message);
      await loadBoard();
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (isBoardCompleted) return;
    try {
      await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' });
      await loadBoard();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetStatus: string) => {
    e.preventDefault();
    setDragOverCol(null);
    if (isBoardCompleted) return;
    const taskId = Number(e.dataTransfer.getData('taskId'));
    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;
    handleStatusChange(taskId, targetStatus);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, colKey: string) => {
    if (isBoardCompleted) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colKey) setDragOverCol(colKey);
  };

  const handleCompleteBoard = async () => {
    setCompleting(true);
    try {
      await apiRequest(`/boards/${params.id}`, { method: 'PATCH', body: JSON.stringify({ completed: true }) });
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
      setCompleting(false);
    }
  };

  const handleRestoreBoard = async () => {
    setCompleting(true);
    try {
      await apiRequest(`/boards/${params.id}`, { method: 'PATCH', body: JSON.stringify({ completed: false }) });
      await loadBoard();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCompleting(false);
    }
  };



  const canMoveTask = (_task: Task) => !isBoardCompleted && (isAdmin || isBoardEditor);

  const canDeleteTask = (task: Task) =>
    !isBoardCompleted && (isAdmin || isBoardOwner || task.userId === user?.userId);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar userEmail={user?.email} userRole={user?.role} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6">
        {}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-brand-400 hover:bg-brand-500/10"
          >
            &larr; Назад к доскам
          </button>

          <div className="flex items-center gap-2">
            <BoardMembers
              boardId={Number(params.id)}
              currentUserId={user?.userId}
              isAppAdmin={isAdmin}
              onMembersChange={loadMembers}
            />

            {}
            <a
              href={`${API_URL}/boards/${params.id}/export`}
              className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300"
              title="Экспорт в Excel"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 18l-1.5-2.5L5.5 18H4l2.25-3.5L4 11h1.5l1.5 2.5L8.5 11H10l-2.25 3.5L10 18H8.5zm5.5 0h-1.5l-1.5-5H12l1 3.5 1-3.5h1.5l-1.5 5zm4-5h-1v5h-1v-5h-1v-1h3v1z"/>
              </svg>
              Excel
            </a>

            {!isBoardCompleted && (
              <button
                onClick={handleCompleteBoard}
                disabled={!allDone || completing}
                title={!allDone ? 'Все задачи должны быть в Done' : 'Завершить доску'}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                  allDone
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/25'
                    : 'cursor-not-allowed border border-slate-700 bg-slate-800/40 text-slate-500'
                } disabled:opacity-60`}
              >
                {completing ? '...' : 'Завершить доску'}
              </button>
            )}
            {isBoardCompleted && (
              <button
                onClick={handleRestoreBoard}
                disabled={completing}
                className="rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-medium text-slate-950 transition hover:bg-brand-600 disabled:opacity-60"
              >
                {completing ? '...' : 'Вернуть доску'}
              </button>
            )}
          </div>
        </div>

        {}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Фильтр:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-lg border border-slate-700/60 bg-slate-800/50 px-2.5 py-1 text-xs text-slate-300 outline-none focus:border-brand-500/60"
          >
            <option value="">Все приоритеты</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="rounded-lg border border-slate-700/60 bg-slate-800/50 px-2.5 py-1 text-xs text-slate-300 outline-none focus:border-brand-500/60"
          >
            <option value="">Все исполнители</option>
            {users.map((u) => (
              <option key={u.id} value={String(u.id)}>{u.name}</option>
            ))}
          </select>
          <button
            onClick={() => setFilterOverdue((v) => !v)}
            className={`rounded-lg border px-2.5 py-1 text-xs transition ${
              filterOverdue
                ? 'border-red-500/60 bg-red-500/15 text-red-400'
                : 'border-slate-700/60 bg-slate-800/50 text-slate-400 hover:border-slate-600'
            }`}
          >
            ⏰ Просроченные
          </button>
          {(filterPriority || filterAssignee || filterOverdue) && (
            <button
              onClick={() => { setFilterPriority(''); setFilterAssignee(''); setFilterOverdue(false); }}
              className="text-[10px] text-slate-500 hover:text-slate-300 transition"
            >
              ✕ Сбросить
            </button>
          )}
          {filteredTasks.length !== tasks.length && (
            <span className="text-[10px] text-slate-500">
              {filteredTasks.length} из {tasks.length}
            </span>
          )}
        </div>

        {loading && <p className="text-sm text-slate-400">Загружаем доску...</p>}
        {error && <p className="text-sm text-red-300">Ошибка: {error}</p>}

        {board && (
          <>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-slate-50">{board.title}</h1>
              {isBoardCompleted && (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-400/30">
                  Завершена
                </span>
              )}
            </div>

            {}
            {tasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Прогресс</span>
                  <span>{doneCount}/{tasks.length} задач выполнено — {progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {isBoardCompleted && (
              <p className="text-sm text-slate-500">Доска завершена. Задачи доступны только для просмотра.</p>
            )}

            {}
            {!isBoardCompleted && (isAdmin || isBoardEditor) && (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Новая задача</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Название *"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
                    className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500 sm:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Описание"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500 sm:col-span-2"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-sm text-slate-100 outline-none transition focus:border-brand-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-sm text-slate-300 outline-none transition focus:border-brand-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newAssigneeId}
                      onChange={(e) => setNewAssigneeId(e.target.value ? Number(e.target.value) : '')}
                      disabled={users.length === 0}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-sm text-slate-100 outline-none transition focus:border-brand-500 disabled:opacity-50"
                      title={users.length === 0 ? 'Сначала добавьте участников через кнопку «Участники»' : undefined}
                    >
                      <option value="">{users.length === 0 ? 'Нет участников' : 'Исполнитель'}</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                    <label className="flex flex-1 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-400 transition hover:border-brand-500">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {newFile ? newFile.name.substring(0, 12) + '...' : 'Файл'}
                      <input type="file" className="hidden" onChange={(e) => setNewFile(e.target.files?.[0] ?? null)} />
                    </label>
                  </div>
                </div>
                <button
                  onClick={handleCreateTask}
                  disabled={creating || !newTitle.trim()}
                  className="mt-3 rounded-lg bg-brand-500 px-5 py-1.5 text-sm font-medium text-slate-950 transition hover:bg-brand-600 disabled:opacity-40"
                >
                  {creating ? '...' : 'Добавить задачу'}
                </button>
              </div>
            )}

            {}
            <div className="mt-2 grid gap-4 md:grid-cols-3">
              {COLUMNS.map((col) => {
                const colTasks = filteredTasks.filter((t) => t.status === col.key);
                const isOver = dragOverCol === col.key;
                return (
                  <div
                    key={col.key}
                    onDrop={(e) => handleDrop(e, col.key)}
                    onDragOver={(e) => handleDragOver(e, col.key)}
                    onDragLeave={() => setDragOverCol(null)}
                    className={`min-h-[120px] rounded-2xl border-t-2 ${col.accent} border border-white/10 bg-slate-900/60 p-4 transition-all ${
                      isOver ? `ring-2 ${col.dropHighlight} bg-slate-800/70` : ''
                    } ${isBoardCompleted ? 'opacity-75' : ''}`}
                  >
                    <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {col.label}
                      <span className="rounded-full bg-slate-700/60 px-1.5 py-0.5 text-[10px] text-slate-500">
                        {colTasks.length}
                      </span>
                    </h2>
                    <div className="flex flex-col gap-2">
                      {colTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          id={task.id}
                          title={task.title}
                          description={task.description}
                          status={task.status}
                          priority={task.priority}
                          dueDate={task.dueDate}
                          user={task.user}
                          assignee={task.assignee}
                          commentsCount={task._count?.comments}
                          attachmentsCount={task.attachments?.length}
                          canMove={canMoveTask(task)}
                          canDelete={canDeleteTask(task)}
                          onStatusChange={(s) => handleStatusChange(task.id, s)}
                          onDelete={() => handleDeleteTask(task.id)}
                          onClick={() => setSelectedTaskId(task.id)}
                        />
                      ))}
                      {colTasks.length === 0 && (
                        <p className={`text-xs transition ${isOver ? 'text-slate-400' : 'text-slate-600'}`}>
                          {isOver ? 'Отпусти здесь' : 'Пусто'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {}
      {selectedTask && user && (
        <TaskDetailModal
          taskId={selectedTask.id}
          title={selectedTask.title}
          description={selectedTask.description}
          status={selectedTask.status}
          priority={selectedTask.priority}
          dueDate={selectedTask.dueDate}
          assignee={selectedTask.assignee}
          attachments={selectedTask.attachments}
          currentUser={{ id: user.userId, name: user.name, email: user.email }}
          users={users}
          initialTab={initialModalTab}
          onClose={() => { setSelectedTaskId(null); setInitialModalTab(undefined); }}
          onDeleted={() => { setSelectedTaskId(null); setInitialModalTab(undefined); loadBoard(); }}
          onUpdated={() => loadBoard()}
        />
      )}
    </div>
  );
}
