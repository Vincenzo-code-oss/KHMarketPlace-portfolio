'use client';

import { useState, type FormEvent } from 'react';

type AuthUser = {
  id: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
};

function getPostAuthDestination(user: AuthUser) {
  const requested = new URLSearchParams(window.location.search).get('next');
  if (requested?.startsWith('/') && !requested.startsWith('//') && !requested.startsWith('/login')) return requested;
  if (user.role === 'ADMIN') return '/admin';
  if (user.role === 'SELLER') return '/dashboard/seller';
  return '/';
}

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const identifier = email.trim().toLowerCase();
    if (!identifier) {
      setError('Email is required.');
      return;
    }
    if ((mode === 'register' || identifier.includes('@')) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    const isRegistering = mode === 'register';
    const payload = isRegistering
      ? { name: name.trim(), username: username.trim().toLowerCase(), email: identifier, password }
      : { email: identifier, password };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string; user?: AuthUser };

      if (!response.ok) {
        setError(result.error ?? (response.status === 401 ? 'Invalid email or password' : 'Unable to authenticate. Please try again.'));
        return;
      }

      if (!result.user?.id) {
        setError('Invalid email or password');
        return;
      }

      const sessionResponse = await fetch('/api/auth/me', { cache: 'no-store' });
      const sessionResult = (await sessionResponse.json().catch(() => ({}))) as { user?: AuthUser | null };
      if (!sessionResponse.ok || sessionResult.user?.id !== result.user.id) {
        setError('Unable to establish a session. Please try again.');
        return;
      }

      window.location.assign(getPostAuthDestination(sessionResult.user));
    } catch {
      setError('Unable to reach KHMarket. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="grid lg:grid-cols-2">
          <div className="bg-slate-900 p-8 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-orange-300">Join KHMarket</p>
            <h1 className="mt-4 text-4xl font-black">Start selling and buying in Cambodia.</h1>
            <p className="mt-4 text-slate-300">Create an account to list items, track orders, and message sellers securely.</p>
          </div>

          <div className="p-8">
            <div className="mb-6 flex gap-3 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                aria-pressed={mode === 'login'}
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 rounded-lg px-4 py-3 font-semibold ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Login
              </button>
              <button
                type="button"
                aria-pressed={mode === 'register'}
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 rounded-lg px-4 py-3 font-semibold ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Register
              </button>
            </div>

            <form action={`/api/auth/${mode}`} method="post" className="space-y-4" noValidate onSubmit={handleSubmit}>
              {mode === 'register' && (
                <>
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                    <input
                      id="name"
                      name="name"
                      autoComplete="name"
                      required
                      minLength={2}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-700">Username</label>
                    <input
                      id="username"
                      name="username"
                      autoComplete="username"
                      required
                      minLength={3}
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                      placeholder="Choose a username"
                    />
                  </div>
                </>
              )}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  {mode === 'register' ? 'Email' : 'Email or username'}
                </label>
                <input
                  id="email"
                  name="email"
                  type={mode === 'register' ? 'email' : 'text'}
                  autoComplete={mode === 'register' ? 'email' : 'username'}
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                  placeholder={mode === 'register' ? 'hello@example.com' : 'Email or username'}
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                  placeholder="At least 6 characters"
                />
              </div>
              {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (mode === 'register' ? 'Creating account...' : 'Signing in...') : mode === 'register' ? 'Create account' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
