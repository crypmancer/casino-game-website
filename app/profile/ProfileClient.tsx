'use client';

import { useState, useEffect } from 'react';

type SystemDep = { id: number; name: string | null; min_sum: number | string; sort: number };

export default function ProfileClient() {
  const [history, setHistory] = useState<{ type: string; balance_before: number; balance_after: number; date: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [systems, setSystems] = useState<SystemDep[]>([]);
  const [depositSum, setDepositSum] = useState('100');
  const [depositSystem, setDepositSystem] = useState<number>(0);
  const [depositMsg, setDepositMsg] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  useEffect(() => {
    fetch('/api/systems/deposit', { method: 'POST', credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.systems)) {
          setSystems(d.systems);
          if (d.systems.length > 0 && !depositSystem) setDepositSystem(Number(d.systems[0].id));
        }
      });
  }, []);

  const loadHistory = async () => {
    const res = await fetch('/api/wallet/gethistory', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.success && Array.isArray(data.history)) setHistory(data.history);
    setShowHistory(true);
  };

  const startDeposit = async () => {
    const sum = parseFloat(depositSum);
    if (isNaN(sum) || sum < 1) {
      setDepositMsg('Enter a valid amount (min 1)');
      return;
    }
    if (!depositSystem) {
      setDepositMsg('Select a payment method');
      return;
    }
    setDepositLoading(true);
    setDepositMsg('');
    try {
      const res = await fetch('/api/deposit/go', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sum, system: depositSystem }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
        return;
      }
      setDepositMsg(data.mess || data.error || 'Error');
    } catch {
      setDepositMsg('Request failed');
    } finally {
      setDepositLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Deposit</h3>
        {systems.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No payment methods available.</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <label>Amount</label>
              <input
                type="number"
                min={1}
                value={depositSum}
                onChange={(e) => setDepositSum(e.target.value)}
                style={{ padding: '0.5rem', width: '120px', borderRadius: '6px', border: '1px solid #3f3f46', background: '#18181b', color: '#fff' }}
              />
              <label style={{ marginLeft: '0.5rem' }}>Method</label>
              <select
                value={depositSystem}
                onChange={(e) => setDepositSystem(Number(e.target.value))}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #3f3f46', background: '#18181b', color: '#fff' }}
              >
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>{s.name || `System ${s.id}`}</option>
                ))}
              </select>
              <button
                onClick={startDeposit}
                disabled={depositLoading}
                style={{ padding: '0.5rem 1rem', background: '#16a34a', borderRadius: '6px', color: '#fff', border: 'none', cursor: depositLoading ? 'wait' : 'pointer' }}
              >
                {depositLoading ? '...' : 'Deposit'}
              </button>
            </div>
            {depositMsg && <p style={{ fontSize: '0.9rem', color: '#f87171' }}>{depositMsg}</p>}
          </>
        )}
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <button onClick={loadHistory} style={{ padding: '0.5rem 1rem', background: '#374151', borderRadius: '6px', color: '#fff', border: 'none' }}>Transaction history</button>
        {showHistory && (
          <ul style={{ listStyle: 'none', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {history.slice(0, 20).map((h, i) => (
              <li key={i} style={{ padding: '0.25rem 0', borderBottom: '1px solid #27272a' }}>{h.type} — {h.balance_before} → {h.balance_after} ({h.date})</li>
            ))}
            {history.length === 0 && <li>No records</li>}
          </ul>
        )}
      </div>
    </div>
  );
}
