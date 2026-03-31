'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

interface Reaction {
  id: number;
  emoji: string;
  user: { id: number; name: string };
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '🎉', '🚀'];

export function CommentReactions({ commentId, currentUserId }: { commentId: number; currentUserId: number }) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    apiRequest<Reaction[]>(`/comments/${commentId}/reactions`)
      .then(setReactions)
      .catch(() => {});
  }, [commentId]);

  const grouped = EMOJIS.reduce<Record<string, { count: number; mine: boolean }>>((acc, e) => {
    const matching = reactions.filter((r) => r.emoji === e);
    if (matching.length > 0) {
      acc[e] = { count: matching.length, mine: matching.some((r) => r.user.id === currentUserId) };
    }
    return acc;
  }, {});

  const handleToggle = async (emoji: string) => {
    try {
      await apiRequest(`/comments/${commentId}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ emoji }),
      });
      const updated = await apiRequest<Reaction[]>(`/comments/${commentId}/reactions`);
      setReactions(updated);
    } catch {  }
    setShowPicker(false);
  };

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      {Object.entries(grouped).map(([emoji, { count, mine }]) => (
        <button
          key={emoji}
          onClick={() => handleToggle(emoji)}
          className={`flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[11px] transition ${
            mine
              ? 'border-brand-500/60 bg-brand-500/15 text-brand-300'
              : 'border-slate-700/60 bg-slate-800/50 text-slate-400 hover:border-slate-500'
          }`}
        >
          <span>{emoji}</span>
          <span>{count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowPicker((v) => !v)}
          className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-700/60 text-[10px] text-slate-500 transition hover:border-slate-500 hover:text-slate-300"
        >
          +
        </button>
        {showPicker && (
          <div className="absolute bottom-6 left-0 z-20 flex gap-1 rounded-xl border border-white/10 bg-slate-900 p-1.5 shadow-xl">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => handleToggle(e)}
                className="rounded-lg p-1 text-base transition hover:bg-slate-800"
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
