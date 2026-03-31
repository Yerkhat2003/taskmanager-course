'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

const TEMPLATES = [
  {
    key: 'sprint',
    name: 'Sprint Board',
    icon: '⚡',
    desc: '7 задач: планирование, разработка, review, тестирование, деплой',
    color: 'from-brand-500/20 to-violet-500/20 border-brand-500/30',
  },
  {
    key: 'roadmap',
    name: 'Product Roadmap',
    icon: '🗺️',
    desc: '6 задач: исследование, MVP, бета, маркетинг, релиз, обратная связь',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
  },
  {
    key: 'bugtracker',
    name: 'Bug Tracker',
    icon: '🐛',
    desc: '5 задач с разными приоритетами: CRITICAL, HIGH, MEDIUM, LOW',
    color: 'from-red-500/20 to-orange-500/20 border-red-500/30',
  },
];

interface TemplateModalProps {
  onClose: () => void;
}

export function TemplateModal({ onClose }: TemplateModalProps) {
  const [creating, setCreating] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async (template: string) => {
    setCreating(template);
    try {
      const board = await apiRequest<{ id: number }>('/boards/from-template', {
        method: 'POST',
        body: JSON.stringify({ template }),
      });
      onClose();
      router.push(`/boards/${board.id}`);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-100">Создать из шаблона</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:text-slate-300 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2 p-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              onClick={() => handleCreate(t.key)}
              disabled={creating !== null}
              className={`w-full rounded-xl border bg-gradient-to-br p-4 text-left transition hover:scale-[1.01] disabled:opacity-60 ${t.color}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {creating === t.key ? 'Создаётся...' : t.name}
                  </p>
                  <p className="text-xs text-slate-400">{t.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
