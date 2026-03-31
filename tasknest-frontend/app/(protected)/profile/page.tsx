'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Navbar } from '@/components/Navbar';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  useEffect(() => {
    apiRequest<UserProfile>('/users/me')
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setBio(data.bio ?? '');
        setAvatarUrl(data.avatarUrl ?? '');
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await apiRequest<UserProfile>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim() || undefined,
          bio: bio.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
        }),
      });
      setProfile(updated);
      setSuccess('Профиль сохранён!');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      setError('Новые пароли не совпадают');
      return;
    }
    if (newPwd.length < 6) {
      setError('Новый пароль слишком короткий (минимум 6 символов)');
      return;
    }
    setSavingPwd(true);
    setError('');
    setSuccess('');
    try {
      await apiRequest('/users/me/password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }),
      });
      setOldPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setSuccess('Пароль изменён!');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar userEmail={profile?.email} userRole={profile?.role} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex w-fit items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-brand-400 hover:bg-brand-500/10"
        >
          &larr; Назад
        </button>

        <h1 className="text-2xl font-bold text-slate-50">Профиль</h1>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {}
            <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-900/60 p-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-brand-500/30"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-xl font-bold text-slate-950">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-100">{profile?.name}</p>
                <p className="text-sm text-slate-400">{profile?.email}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  profile?.role === 'ADMIN'
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'bg-slate-700/60 text-slate-400'
                }`}>
                  {profile?.role}
                </span>
              </div>
            </div>

            {(success || error) && (
              <div className={`rounded-lg px-4 py-2.5 text-sm ${success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {success || error}
              </div>
            )}

            {}
            <form onSubmit={handleSave} className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-300 uppercase tracking-wide">Редактировать профиль</h2>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Имя</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">О себе</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Расскажи немного о себе..."
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">URL аватара</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Email:</label>
                  <span className="text-xs text-slate-500">{profile?.email}</span>
                  <span className="text-[10px] text-slate-600">(нельзя изменить)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-4 rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-slate-950 transition hover:bg-brand-600 disabled:opacity-50"
              >
                {saving ? 'Сохраняем...' : 'Сохранить'}
              </button>
            </form>

            {}
            <form onSubmit={handleChangePassword} className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-300 uppercase tracking-wide">Сменить пароль</h2>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Текущий пароль</label>
                  <input
                    type="password"
                    value={oldPwd}
                    onChange={(e) => setOldPwd(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Новый пароль</label>
                  <input
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Повторите новый пароль</label>
                  <input
                    type="password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPwd}
                className="mt-4 rounded-lg border border-slate-600 bg-slate-800 px-5 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
              >
                {savingPwd ? 'Меняем...' : 'Изменить пароль'}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
