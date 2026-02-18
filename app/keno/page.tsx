'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const CELLS = 40;

export default function KenoPage() {
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState('');
  const [bet, setBet] = useState('10');
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [bank, setBank] = useState(0);
  const [users, setUsers] = useState(0);
  const [timer, setTimer] = useState(15);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/balance/get', { method: 'POST', credentials: 'include' })
        .then((r) => r.json())
        .then((d) => d.success && setBalance(String(d.balance)));
    }
    fetch('/api/keno/get', { method: 'POST', credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.bank != null) setBank(d.bank);
        if (d.users != null) setUsers(d.users);
        if (d.success && Array.isArray(d.selects)) {
          setSelected(d.selects);
          setBet(String(d.bet ?? 10));
          setBlocked(true);
        } else {
          setBlocked(false);
        }
      });
  }, [session?.user?.id]);

  useEffect(() => {
    const t = setInterval(() => setTimer((n) => (n <= 0 ? 15 : n - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const toggle = (n: number) => {
    if (blocked) return;
    if (selected.includes(n)) setSelected(selected.filter((x) => x !== n));
    else if (selected.length < 5) setSelected([...selected, n].sort((a, b) => a - b));
  };

  const clearSelection = () => {
    if (blocked) return;
    setSelected([]);
  };

  const placeBet = async () => {
    const b = parseFloat(bet);
    if (isNaN(b) || b < 1 || selected.length < 1 || selected.length > 5) {
      setMessage('Select 1–5 cells, minimum bet 1');
      return;
    }
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/keno/bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ selectsKeno: selected, bet: b }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setBalance(String(data.newbalance));
      setMessage('Bet placed');
      setBlocked(true);
    } else {
      setMessage(data.error || 'Error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="wrapper">
        <div className="keno">
          <p style={{ padding: '2rem', color: '#9EABCD' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <div className="keno">
        <div className="keno__title d-flex justify-center align-center">
          <div className="keno__title-bg d-flex justify-center align-center">
            <img src="/images/games/keno/keno.svg" alt="Keno" />
          </div>
        </div>
        <div className="keno__content">
          <div className="keno__round-info d-flex justify-space-between align-center">
            <div className="keno__round-info-item d-flex">
              <div className="d-flex flex-column">
                <span>Game bank</span>
                <b>
                  <b className="bankKeno">{Number(bank).toFixed(2)}</b>{' '}
                  <svg className="icon" style={{ width: 18, height: 18 }}>
                    <use xlinkHref="/images/symbols.svg#coins" />
                  </svg>
                </b>
              </div>
              <div className="d-flex flex-column" style={{ marginLeft: 20 }}>
                <span>Players</span>
                <b>
                  <b className="usersKeno">{users}</b>{' '}
                  <svg className="icon" style={{ width: 18, height: 18 }}>
                    <use xlinkHref="/images/symbols.svg#users" />
                  </svg>
                </b>
              </div>
            </div>
            <div className="keno__round-info-item d-flex flex-column align-end">
              <span>Until game starts</span>
              <b>00:<b className="timeKeno">{String(timer).padStart(2, '0')}</b></b>
            </div>
          </div>
          <div className="keno__mines d-flex justify-center align-center">
            <div className="keno__canvas d-flex justify-space-between flex-wrap">
              {Array.from({ length: CELLS }, (_, i) => i + 1).map((n) => (
                <div
                  key={n}
                  className={`keno__canvas-item d-flex align-center justify-center ${selected.includes(n) ? 'keno__canvas-item--is-selected' : ''} ${blocked ? 'blocked' : ''}`}
                  onClick={() => toggle(n)}
                  style={{ cursor: blocked ? 'default' : 'pointer' }}
                >
                  <div className="keno__canvas-users d-flex align-center" />
                  <span className="keno__canvas-number">{n}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="keno__bet">
            <div className="keno__bet-settings d-flex align-center justify-space-between flex-wrap">
              <div className="keno__bet-left d-flex align-center">
                <a
                  href="#"
                  className="keno__cancel-select d-flex align-center"
                  onClick={(e) => { e.preventDefault(); clearSelection(); }}
                  style={{ cursor: blocked ? 'not-allowed' : 'pointer' }}
                >
                  <svg style={{ height: 13, width: 13 }} className="icon">
                    <use xlinkHref="/images/symbols.svg#close" />
                  </svg>
                  <span>Clear selection</span>
                </a>
              </div>
              <div className="keno__bet-right d-flex align-center">
                <input
                  className="keno__bet-input"
                  type="text"
                  id="sumBetKeno"
                  placeholder="0.00"
                  value={bet}
                  onChange={(e) => setBet(e.target.value)}
                  disabled={blocked}
                />
                <button
                  type="button"
                  onClick={placeBet}
                  disabled={loading || blocked}
                  className="keno__bet-add is-ripples flare btn btn--blue d-flex align-center"
                >
                  <span>Place bet</span>
                </button>
              </div>
            </div>
            <div className="keno__coeff">
              <div className="keno__coeff-scroll d-flex align-center" />
            </div>
          </div>
        </div>
      </div>
      {message && (
        <p style={{ marginTop: 8, color: message.includes('Error') ? '#f87171' : '#86efac' }}>{message}</p>
      )}
      <p style={{ marginTop: 8 }}>
        <Link href="/">← Back to home</Link>
      </p>
    </div>
  );
}
