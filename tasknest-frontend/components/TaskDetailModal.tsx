'use client';

import { useEffect, useState, useRef } from 'react';
import { apiRequest } from '@/lib/api';
import { SubtaskList } from './SubtaskList';
import { TimeTracker } from './TimeTracker';
import { CommentReactions } from './CommentReactions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface TaskUser {
  id: number;
  name: string;
  email: string;
}

interface Attachment {
  id: number;
  filename: string;
  url: string;
}

interface Comment {
  id: number;
  content: string;
  userId: number;
  createdAt: string;
  user: { id: number; name: string; email: string; avatarUrl?: string | null };
}

interface AuditEntry {
  id: number;
  action: string;
  details: string;
  createdAt: string;
  user: { id: number; name: string; email: string };
}

interface UserOption {
  id: number;
  name: string;
  email: string;
}

interface TaskDetailModalProps {
  taskId: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string | null;
  assignee?: { id: number; name: string } | null;
  attachments?: Attachment[];
  currentUser: TaskUser;
  users?: UserOption[];
  initialTab?: string;
  onClose: () => void;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

const PRIORITY_CONFIG: Record<string, { label: string; cls: string }> = {
  low: { label: 'Low', cls: 'bg-emerald-500/15 text-emerald-400' },
  medium: { label: 'Medium', cls: 'bg-amber-500/15 text-amber-400' },
  high: { label: 'High', cls: 'bg-red-500/15 text-red-400' },
};

const STATUS_LABELS: Record<string, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
};

type Tab = 'comments' | 'subtasks' | 'timer' | 'attachments' | 'history';

function isImage(filename: string) {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(filename);
}

function AttachmentItem({ file }: { file: Attachment }) {
  const fullUrl = file.url.startsWith('http') ? file.url : `${API_URL}${file.url}`;
  const [expanded, setExpanded] = useState(false);

  if (isImage(file.filename)) {
    return (
      <div className="rounded-xl overflow-hidden border border-white/10">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full text-left"
        >
          {expanded ? (
            <img
              src={fullUrl}
              alt={file.filename}
              className="max-h-64 w-full object-contain bg-slate-950"
            />
          ) : (
            <div className="relative h-24 w-full bg-slate-800/60">
              <img
                src={fullUrl}
                alt={file.filename}
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                </svg>
              </div>
            </div>
          )}
        </button>
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-800/40">
          <span className="truncate text-xs text-slate-400">{file.filename}</span>
          <a
            href={fullUrl}
            download={file.filename}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-[10px] text-brand-400 hover:text-brand-300 transition"
            onClick={(e) => e.stopPropagation()}
          >
            Скачать
          </a>
        </div>
      </div>
    );
  }


  const ext = file.filename.split('.').pop()?.toUpperCase() ?? 'FILE';
  return (
    <a
      href={fullUrl}
      download={file.filename}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-800/40 px-3 py-2.5 transition hover:border-brand-500/40 hover:bg-slate-800/70"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-[10px] font-bold text-brand-300">
        {ext}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs text-slate-200">{file.filename}</p>
        <p className="text-[10px] text-slate-500">Нажми для скачивания</p>
      </div>
      <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </a>
  );
}

export function TaskDetailModal({
  taskId,
  title,
  description,
  status,
  priority,
  dueDate,
  assignee,
  attachments = [],
  currentUser,
  users = [],
  initialTab,
  onClose,
  onDeleted,
  onUpdated,
}: TaskDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<AuditEntry[]>([]);


  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDesc, setEditDesc] = useState(description ?? '');
  const [editPriority, setEditPriority] = useState(priority);
  const [editDueDate, setEditDueDate] = useState(
    dueDate ? new Date(dueDate).toISOString().split('T')[0] : ''
  );
  const [editAssigneeId, setEditAssigneeId] = useState<number | ''>(assignee?.id ?? '');
  const [saving, setSaving] = useState(false);

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editTitle.trim() || title,
          description: editDesc,
          priority: editPriority,
          dueDate: editDueDate || null,
          assigneeId: editAssigneeId || null,
        }),
      });
      setEditing(false);
      onUpdated?.();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const resolveInitialTab = (): Tab => {
    if (initialTab === 'comments') return 'comments';
    if (initialTab === 'history') return 'history';
    if (initialTab === 'attachments') return 'attachments';
    if (initialTab === 'subtasks') return 'subtasks';
    if (initialTab === 'timer') return 'timer';
    return attachments.length > 0 ? 'attachments' : 'comments';
  };

  const [tab, setTab] = useState<Tab>(resolveInitialTab);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    apiRequest<Comment[]>(`/tasks/${taskId}/comments`).then(setComments).catch(() => {});
    apiRequest<AuditEntry[]>(`/tasks/${taskId}/history`).then(setHistory).catch(() => {});
  }, [taskId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const comment = await apiRequest<Comment>(`/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment.trim() }),
      });
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch {

    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (id: number) => {
    try {
      await apiRequest(`/comments/${id}`, { method: 'DELETE' });
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {

    }
  };

  const pCfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'comments', label: '💬', count: comments.length },
    { key: 'subtasks', label: '✅' },
    { key: 'timer', label: '⏱' },
    { key: 'attachments', label: '📎', count: attachments.length },
    { key: 'history', label: '📋', count: history.length },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div className="flex items-start justify-between gap-3 border-b border-white/5 p-5">
          {editing ? (
            <div className="flex-1 space-y-3">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-lg border border-brand-500/40 bg-slate-800/60 px-3 py-2 text-sm font-semibold text-slate-100 outline-none"
                placeholder="Название задачи"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-slate-700/60 bg-slate-800/50 px-3 py-2 text-sm text-slate-300 placeholder-slate-500 outline-none focus:border-brand-500/60"
                placeholder="Описание (необязательно)"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] text-slate-500">Приоритет</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full rounded-lg border border-slate-700/60 bg-slate-800/50 px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-brand-500/60"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-slate-500">Дедлайн</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-700/60 bg-slate-800/50 px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-brand-500/60"
                  />
                </div>
              </div>
              {users.length > 0 && (
                <div>
                  <label className="mb-1 block text-[10px] text-slate-500">Исполнитель</label>
                  <select
                    value={editAssigneeId}
                    onChange={(e) => setEditAssigneeId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-lg border border-slate-700/60 bg-slate-800/50 px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-brand-500/60"
                  >
                    <option value="">Без исполнителя</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="rounded-lg bg-brand-500 px-4 py-1.5 text-xs font-medium text-slate-950 transition hover:bg-brand-600 disabled:opacity-50"
                >
                  {saving ? 'Сохраняю...' : 'Сохранить'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-slate-700 px-4 py-1.5 text-xs text-slate-400 transition hover:text-slate-200"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${pCfg.cls}`}>
                  {pCfg.label}
                </span>
                <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-[9px] text-slate-400">
                  {STATUS_LABELS[status] ?? status}
                </span>
                {dueDate && (
                  <span className={`text-[10px] ${new Date(dueDate) < new Date() && status !== 'done' ? 'text-red-400' : 'text-slate-500'}`}>
                    до {new Date(dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-slate-100">{title}</h3>
              {description && (
                <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{description}</p>
              )}
              {assignee && (
                <p className="mt-2 text-xs text-slate-500">
                  Исполнитель: <span className="text-slate-300">{assignee.name}</span>
                </p>
              )}
            </div>
          )}
          <div className="flex shrink-0 items-center gap-1">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-brand-300"
                title="Редактировать задачу"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {}
        <div className="flex border-b border-white/5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-xs font-medium transition ${
                tab === t.key
                  ? 'border-b-2 border-brand-500 text-brand-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className="ml-1 rounded-full bg-slate-700/60 px-1.5 py-0.5 text-[9px]">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {}
        <div className="max-h-72 overflow-y-auto p-4">
          {}
          {tab === 'attachments' && (
            <div className="flex flex-col gap-3">
              {attachments.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                  </svg>
                  <p className="text-xs text-slate-500">Нет вложений</p>
                  <p className="text-[10px] text-slate-600">Прикрепи файл при создании задачи</p>
                </div>
              ) : (
                attachments.map((file) => (
                  <AttachmentItem key={file.id} file={file} />
                ))
              )}
            </div>
          )}

          {}
          {tab === 'comments' && (
            <div className="flex flex-col gap-3">
              {comments.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-4">Нет комментариев. Напиши первый!</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="group flex gap-2.5">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-[9px] font-bold text-brand-300">
                    {c.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-slate-300">{c.user.name}</span>
                      <span className="text-[10px] text-slate-600">
                        {new Date(c.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-400 leading-snug whitespace-pre-wrap">
                      {c.content.replace(/@(\S+)/g, (_, name) => `@${name}`).split(/(@\S+)/).map((part, i) =>
                        part.startsWith('@')
                          ? <span key={i} className="text-brand-400 font-medium">{part}</span>
                          : part
                      )}
                    </p>
                    <CommentReactions commentId={c.id} currentUserId={currentUser.id} />
                  </div>
                  {c.userId === currentUser.id && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="shrink-0 self-start text-[10px] text-red-400/60 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                    >
                      удалить
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {}
          {tab === 'subtasks' && (
            <SubtaskList taskId={taskId} />
          )}

          {}
          {tab === 'timer' && (
            <TimeTracker taskId={taskId} />
          )}

          {}
          {tab === 'history' && (
            <div className="flex flex-col gap-2">
              {history.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-4">История пуста</p>
              )}
              {history.map((h) => {
                const actionIcons: Record<string, string> = {
                  created: '✨',
                  updated: '✏️',
                  deleted: '🗑️',
                  status_changed: '🔄',
                };
                return (
                  <div key={h.id} className="flex items-start gap-2.5 text-xs">
                    <span className="mt-0.5 text-sm">{actionIcons[h.action] ?? '📝'}</span>
                    <div>
                      <span className="text-slate-300 font-medium">{h.user.name}</span>
                      <span className="text-slate-500"> · {h.action}</span>
                      {h.details && <span className="text-slate-500"> — {h.details}</span>}
                      <p className="text-[10px] text-slate-600">
                        {new Date(h.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {}
        {tab === 'comments' && (
          <form onSubmit={handlePostComment} className="border-t border-white/5 p-4">
            <div className="flex gap-2">
              <textarea
                ref={textRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Напиши комментарий..."
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePostComment(e as any);
                  }
                }}
                className="flex-1 resize-none rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={posting || !newComment.trim()}
                className="self-end rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-brand-600 disabled:opacity-40"
              >
                {posting ? '...' : 'Отправить'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
