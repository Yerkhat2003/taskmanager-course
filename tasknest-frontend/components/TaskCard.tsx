'use client';

import { DragEvent } from 'react';

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

interface TaskCardProps {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string | null;
  user?: TaskUser;
  assignee?: TaskAssignee | null;
  commentsCount?: number;
  attachmentsCount?: number;
  canMove: boolean;
  canDelete: boolean;
  onStatusChange?: (newStatus: string) => void;
  onDelete?: () => void;
  onClick?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'Todo',
  in_progress: 'In progress',
  done: 'Done',
};

const STATUS_NEXT: Record<string, string> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

const PRIORITY_CONFIG: Record<string, { label: string; cls: string }> = {
  low: { label: 'Low', cls: 'bg-emerald-500/15 text-emerald-400' },
  medium: { label: 'Medium', cls: 'bg-amber-500/15 text-amber-400' },
  high: { label: 'High', cls: 'bg-red-500/15 text-red-400' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function isOverdue(iso: string) {
  return new Date(iso) < new Date();
}

export function TaskCard({
  id,
  title,
  description,
  status,
  priority = 'medium',
  dueDate,
  user,
  assignee,
  commentsCount = 0,
  attachmentsCount = 0,
  canMove,
  canDelete,
  onStatusChange,
  onDelete,
  onClick,
}: TaskCardProps) {
  const nextStatus = STATUS_NEXT[status] || 'todo';
  const pCfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const overdue = dueDate && status !== 'done' && isOverdue(dueDate);

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', String(id));
    e.dataTransfer.effectAllowed = 'move';
    (e.target as HTMLElement).style.opacity = '0.4';
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).style.opacity = '1';
  };

  return (
    <div
      draggable={canMove}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className={`rounded-xl border border-white/5 bg-slate-800/50 p-3 transition hover:border-white/10 ${
        canMove ? 'cursor-grab active:cursor-grabbing' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-100 leading-snug">{title}</p>
        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${pCfg.cls}`}>
          {pCfg.label}
        </span>
      </div>

      {description && (
        <p className="mt-1 text-xs text-slate-400 line-clamp-2">{description}</p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {dueDate && (
          <span className={`flex items-center gap-0.5 text-[10px] ${overdue ? 'text-red-400' : 'text-slate-500'}`}>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(dueDate)}
            {overdue && ' просрочено'}
          </span>
        )}

        {assignee && (
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500/20 text-[8px] font-bold text-brand-300">
              {assignee.name.charAt(0).toUpperCase()}
            </span>
            {assignee.name}
          </span>
        )}

        {commentsCount > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-slate-500">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
            </svg>
            {commentsCount}
          </span>
        )}
        {attachmentsCount > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-slate-500">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {attachmentsCount}
          </span>
        )}

        {user && !assignee && (
          <span className="text-[10px] text-slate-500">{user.name}</span>
        )}
      </div>

      {(canMove || canDelete) && (
        <div className="mt-2 flex items-center gap-1.5">
          {canMove && (
            <button
              onClick={(e) => { e.stopPropagation(); onStatusChange?.(nextStatus); }}
              className="rounded-md bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-300 transition hover:bg-brand-500/20 hover:text-brand-300"
            >
              &rarr; {STATUS_LABELS[nextStatus]}
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400 transition hover:bg-red-500/20"
            >
              Удалить
            </button>
          )}
        </div>
      )}
    </div>
  );
}
