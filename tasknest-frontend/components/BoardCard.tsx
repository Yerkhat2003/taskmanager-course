interface BoardCardProps {
  id: number;
  title: string;
  taskCount?: number;
  isAdmin?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

export function BoardCard({
  id,
  title,
  taskCount,
  isAdmin,
  onClick,
  onDelete,
}: BoardCardProps) {
  return (
    <div className="group relative flex flex-col items-start justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-4 shadow-lg shadow-black/40 transition hover:-translate-y-1 hover:border-brand-400/70 hover:shadow-brand-500/30">
      <button onClick={onClick} className="w-full text-left">
        <span className="mb-2 inline-flex rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
          Доска #{id}
        </span>
        <p className="text-sm font-semibold text-slate-50">{title}</p>
        {taskCount !== undefined && (
          <p className="mt-1 text-[11px] text-slate-500">
            {taskCount} {taskCount === 1 ? 'задача' : 'задач'}
          </p>
        )}
        <span className="mt-3 inline-block text-[11px] text-slate-400">
          Открыть &rarr;
        </span>
      </button>

      {isAdmin && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-3 top-3 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-medium text-red-400 opacity-0 transition hover:bg-red-500/20 group-hover:opacity-100"
        >
          Удалить
        </button>
      )}

      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand-500/10 to-violet-500/5 opacity-0 blur-sm transition group-hover:opacity-100" />
    </div>
  );
}
