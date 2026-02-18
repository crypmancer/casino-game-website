'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.success) {
      setError(data.mess || 'Error');
      return;
    }
    router.push('/login');
    router.refresh();
  }

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Register</h1>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #3f3f46', background: '#18181b', color: '#fff' }}
        />
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
          placeholder="Password (min. 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #3f3f46', background: '#18181b', color: '#fff' }}
        />
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.75rem', background: '#5b21b6', borderRadius: '6px', color: '#fff', border: 'none' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
