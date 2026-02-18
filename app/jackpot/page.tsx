'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function JackpotPage() {
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState('');
  const [bet, setBet] = useState('10');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sumBetUser, setSumBetUser] = useState(0);
  const [maxWin, setMaxWin] = useState(0);

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/balance/get', { method: 'POST', credentials: 'include' }).then((r) => r.json()).then((d) => d.success && setBalance(String(d.balance)));
    }
    fetch('/api/jackpot/get', { method: 'POST', credentials: 'include' }).then((r) => r.json()).then((d) => {
      if (d.sumBetUser != null) setSumBetUser(d.sumBetUser);
      if (d.maxWin != null) setMaxWin(d.maxWin);
    });
  }, [session?.user?.id]);

  const placeBet = async () => {
    const b = parseFloat(bet);
    if (isNaN(b) || b < 1) {
      setMessage('Minimum bet 1');
      return;
    }
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/jackpot/bet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ bet: b }) });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setBalance(String(data.newbalance));
      setSumBetUser((prev) => prev + b);
      setMessage('Bet placed');
    } else {
      setMessage(data.error || 'Error');
    }
  };

  if (status === 'loading') return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem' }}>
      <p><Link href="/">← Back to home</Link></p>
      <h1>Jackpot</h1>
      <p>Max win: {maxWin} ₽</p>
      {session && (
        <>
          <p>Balance: <strong>{balance}</strong> ₽ | Your bet this round: {sumBetUser} ₽</p>
          <div style={{ marginTop: '1rem' }}>
            <input type="number" min={1} value={bet} onChange={(e) => setBet(e.target.value)} style={{ padding: '0.5rem', width: '100px', marginRight: '0.5rem', borderRadius: '6px', border: '1px solid #3f3f46', background: '#18181b', color: '#fff' }} />
            <button onClick={placeBet} disabled={loading} style={{ padding: '0.5rem 1rem', background: '#16a34a', borderRadius: '6px', color: '#fff', border: 'none' }}>{loading ? '...' : 'Place bet'}</button>
          </div>
          {message && <p style={{ marginTop: '0.5rem', color: message.includes('Error') ? '#f87171' : '#86efac' }}>{message}</p>}
        </>
      )}
      {!session && <p style={{ marginTop: '1rem' }}>Log in to participate.</p>}
    </div>
  );
}
