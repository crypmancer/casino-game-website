'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const COEFFS = [2, 3, 10, 15, 20, 100] as const;

export default function X100Page() {
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState('');
  const [bet, setBet] = useState('1.00');
  const [coff, setCoff] = useState<number>(2);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [history, setHistory] = useState<{ id: number; coff: string | null }[]>([]);
  const [betsByCoff, setBetsByCoff] = useState<Record<number, { user_id: number; login: string; img: string; bet: number }[]>>({});
  const [sumBets, setSumBets] = useState<Record<number, number>>({});
  const [players, setPlayers] = useState<Record<number, number>>({});

  const fetchBalance = async () => {
    const res = await fetch('/api/balance/get', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.success) setBalance(String(data.balance));
  };
  const fetchData = async () => {
    const res = await fetch('/api/x100/get', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.history) setHistory(data.history);
    if (data.success && Array.isArray(data.success)) {
      const byCoff: Record<number, { user_id: number; login: string; img: string; bet: number }[]> = {};
      const sums: Record<number, number> = {};
      const counts: Record<number, number> = {};
      COEFFS.forEach((c) => {
        byCoff[c] = [];
        sums[c] = 0;
        counts[c] = 0;
      });
      data.success.forEach((e: { coff: number; user_id: number; login?: string; img?: string; bet: number }) => {
        const c = Number(e.coff);
        if (COEFFS.includes(c as typeof COEFFS[number])) {
          byCoff[c].push({ user_id: e.user_id, login: e.login ?? '', img: e.img ?? '', bet: Number(e.bet) });
          sums[c] = (sums[c] || 0) + Number(e.bet);
          counts[c] = (counts[c] || 0) + 1;
        }
      });
      setBetsByCoff(byCoff);
      setSumBets(sums);
      setPlayers(counts);
    }
    if (data.info && Array.isArray(data.info)) {
      data.info.forEach((e: { coff: number; sum: number; players: number }) => {
        const c = Number(e.coff);
        if (COEFFS.includes(c as typeof COEFFS[number])) {
          setSumBets((prev) => ({ ...prev, [c]: e.sum ?? 0 }));
          setPlayers((prev) => ({ ...prev, [c]: e.players ?? 0 }));
        }
      });
    }
  };

  useEffect(() => {
    if (session?.user?.id) fetchBalance();
  }, [session?.user?.id]);
  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 5000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setTimer((n) => (n <= 0 ? 30 : n - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const updateBet = (fn: (v: number) => number) => {
    const v = parseFloat(bet) || 0;
    setBet(Math.max(1, fn(v)).toFixed(2));
  };

  const placeBet = async (selectedCoff: number) => {
    const b = parseFloat(bet);
    if (isNaN(b) || b < 1) {
      setMessage('Minimum bet 1');
      return;
    }
    setLoading(true);
    setMessage('');
    setCoff(selectedCoff);
    const res = await fetch('/api/x100/bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ coff: selectedCoff, bet: b }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setBalance(String(data.newbalance));
      setMessage('Bet placed');
      fetchData();
    } else {
      setMessage(data.error || 'Error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="wrapper">
        <div style={{ marginTop: 35 }} className="x30 x100">
          <p style={{ padding: '2rem', color: '#9EABCD' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 35 }} className="x30 x100">
      <div className="x30__wheel d-flex justify-center flex-column align-center">
        <div className="x30__wheels d-flex justify-center align-end">
          <div className="x30__wheel-center d-flex justify-center align-start">
            <div className="x30__timer TimerBlock d-flex flex-column justify-center align-center">
              <b id="x100__text">Starting in</b>
              <span id="x100__timer">{timer}</span>
            </div>
          </div>
          <div className="x30__wheel-image">
            <img src="/images/games/x100/wheel.svg" id="x100__wheel" alt="wheel" style={{ transition: 'all 30s ease 0s' }} />
          </div>
          <div className="x30__wheel-border" />
        </div>
        <div className="x30__cursor" />
      </div>
      <div className="wrapper">
        <div className="x30__top">
          <div className="x30__rocket d-flex align-center" id="x100__status">
            <img className="x30__rocket-img" src="/images/rocket.png" alt="rocket" />
            <div className="x30__rocket-coins" />
          </div>
        </div>
        <div className="x30__bottom">
          <div className="x30__bet d-flex align-center justify-space-between">
            <div className="x30__history">
              <div className="bx-input__input d-flex align-center justify-space-between pd10-20">
                <label className="d-flex align-center">History:</label>
                <div className="x100__history-items">
                  <div className="x100__history-scroll d-flex align-center">
                    {history.slice(0, 12).map((h) => (
                      <span key={h.id}>x{h.coff ?? '?'}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="x30__bet-game">
              <div className="bx-input__input d-flex align-center justify-space-between flex-wrap pd10-20">
                <div className="d-flex align-center justify-space-between">
                  <input
                    style={{ textAlign: 'left' }}
                    type="text"
                    id="sumBetX100"
                    placeholder="0.00"
                    value={bet}
                    onChange={(e) => setBet(e.target.value)}
                  />
                  <svg className="icon money">
                    <use xlinkHref="/images/symbols.svg#coins" />
                  </svg>
                </div>
                <div className="x30__bet-placed d-flex align-center justify-space-between">
                  <a onClick={() => setBet('1')}>Min</a>
                  <a onClick={() => updateBet(() => (balance ? parseFloat(balance) : 1))}>Max</a>
                  <a onClick={() => updateBet((v) => v + 10)}>+10</a>
                  <a onClick={() => updateBet((v) => v + 100)}>+100</a>
                  <a onClick={() => updateBet((v) => v * 2)}>x2</a>
                  <a onClick={() => updateBet((v) => Math.max(v / 2, 1))}>1/2</a>
                </div>
              </div>
            </div>
          </div>
          <div className="x30__bets">
            {COEFFS.map((c) => (
              <div key={c} className="x30__bet">
                <div
                  onClick={() => !loading && placeBet(c)}
                  className={`x30__bet-heading is-ripples flare x${c} d-flex align-center justify-space-between`}
                  style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  <span>X{c}</span>
                </div>
                <div className="x30__bet-info d-flex align-center justify-space-between">
                  <span className="d-flex align-center" style={{ color: '#9EABCD' }}>
                    <svg className="icon small" style={{ marginRight: 8 }}>
                      <use xlinkHref="/images/symbols.svg#users" />
                    </svg>
                    <span data-playersX100={c}>{players[c] ?? 0}</span>
                  </span>
                  <span className="d-flex align-center" style={{ fontWeight: 600 }}>
                    <span data-sumBetsX100={c}>{(sumBets[c] ?? 0).toFixed(0)}</span>
                    <svg className="icon money" style={{ marginLeft: 8 }}>
                      <use xlinkHref="/images/symbols.svg#coins" />
                    </svg>
                  </span>
                </div>
                <div className="x100__bet-users">
                  {(betsByCoff[c] ?? []).slice(0, 3).map((u) => (
                    <div key={u.user_id} className="x30__bet-user d-flex align-center justify-space-between">
                      <div className="history__user d-flex align-center justify-center">
                        <div className="history__user-avatar" style={{ background: `url(${u.img}) no-repeat center center / cover` }} />
                        <span>{u.login}</span>
                      </div>
                      <div className="x30__bet-sum d-flex align-center">
                        <span>{Number(u.bet).toFixed(2)}</span>
                        <svg className="icon money" style={{ marginLeft: 8 }}>
                          <use xlinkHref="/images/symbols.svg#coins" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {message && <p style={{ marginTop: 8, color: message.includes('Error') ? '#f87171' : '#86efac' }}>{message}</p>}
      <p style={{ marginTop: 8 }}>
        <Link href="/">← Back to home</Link>
      </p>
    </div>
  );
}
