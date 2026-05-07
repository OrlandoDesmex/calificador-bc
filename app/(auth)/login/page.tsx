'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get('callbackUrl') ?? '/';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError('Email o contraseña incorrectos');
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div className="min-h-screen bg-desmex-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center rounded-2xl mb-4 shadow-lg w-16 h-16"
            style={{ background: 'linear-gradient(135deg, #B71C1C, #7F0000)' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-xs font-bold tracking-widest text-desmex-red uppercase mb-1">Desmex</p>
          <h1 className="text-2xl font-bold text-stone-800">Calificador BC</h1>
          <p className="text-stone-500 text-sm mt-1">Bombas de Calor — Precalificación</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-desmex-border p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-desmex-border px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-desmex-red/30 focus:border-desmex-red transition"
                placeholder="tu@desmex.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-desmex-border px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-desmex-red/30 focus:border-desmex-red transition"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-desmex-red text-white font-semibold text-sm
                         hover:bg-desmex-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          ¿Problemas para entrar? Contacta al administrador del sistema.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
