'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password');
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Log in</h1>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #3f3f46', background: '#18181b', color: '#fff' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #3f3f46', background: '#18181b', color: '#fff' }}
        />
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.75rem', background: '#5b21b6', borderRadius: '6px', color: '#fff', border: 'none' }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        No account? <Link href="/register">Register</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
