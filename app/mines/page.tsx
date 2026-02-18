'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const BOMB_OPTIONS = [3, 5, 10, 24] as const;
const LEVEL_OPTIONS = [9, 16, 24] as const;
const LEVEL_CELLS: Record<number, number> = { 9: 9, 16: 16, 24: 24 };

export default function MinesPage() {
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState('');
  const [bet, setBet] = useState('1.00');
  const [bombs, setBombs] = useState(3);
  const [level, setLevel] = useState(16);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameOn, setGameOn] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [currentCoeff, setCurrentCoeff] = useState(1);

  const cells = LEVEL_CELLS[level] ?? 16;

  const fetchBalance = async () => {
    const res = await fetch('/api/balance/get', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.success) setBalance(String(data.balance));
  };
  const fetchGame = async () => {
    const res = await fetch('/api/newmines/get', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      setGameOn(true);
      setRevealed(data.click ?? []);
      setCurrentCoeff(data.coeff ?? 1);
    } else {
      setGameOn(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchBalance();
      fetchGame();
    }
  }, [session?.user?.id]);

  const updateBet = (fn: (v: number) => number) => {
    const v = parseFloat(bet) || 0;
    setBet(Math.max(1, fn(v)).toFixed(2));
  };

  const start = async () => {
    const b = parseFloat(bet);
    if (isNaN(b) || b < 1) {
      setMessage('Minimum bet 1');
      return;
    }
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/newmines/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ bet: b, level }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setBalance(String(data.newbalance));
      setGameOn(true);
      setRevealed([]);
      setCurrentCoeff(1);
    } else {
      setMessage(data.mess || 'Error');
    }
  };

  const click = async (cell: number) => {
    if (revealed.includes(cell)) return;
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/newmines/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ mine: cell }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      if (data.boom) {
        setGameOn(false);
        fetchBalance();
      } else {
        setRevealed((prev) => [...prev, data.num]);
        setCurrentCoeff(data.coeff ?? 1);
      }
    } else {
      setMessage(data.mess || 'Error');
    }
  };

  const finish = async () => {
    setLoading(true);
    const res = await fetch('/api/newmines/finish', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setBalance(String(data.newbalance));
      setGameOn(false);
      setRevealed([]);
    } else {
      setMessage(data.mess || 'Error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="wrapper">
        <div className="mines d-flex justify-center" style={{ marginTop: 35 }}>
          <p style={{ padding: '2rem', color: '#9EABCD' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mines d-flex justify-center" style={{ marginTop: 35 }}>
      <div className="mines__wrapper d-flex justify-space-between align-start flex-wrap">
        <div className="mines__left d-flex flex-column justify-center align-center">
          <div className="bx-input d-flex flex-column">
            <div className="bx-input__input d-flex justify-space-between align-center">
              <input
                className="fullInputWidth"
                style={{ textAlign: 'left' }}
                placeholder="0.00"
                type="text"
                value={bet}
                onChange={(e) => setBet(e.target.value)}
                disabled={gameOn}
              />
              <svg className="icon money">
                <use xlinkHref="/images/symbols.svg#coins" />
              </svg>
            </div>
            <div className="x30__bet-placed d-flex align-center justify-space-between">
              <a onClick={() => updateBet((v) => v + 10)}>+10</a>
              <a onClick={() => updateBet((v) => v + 100)}>+100</a>
              <a onClick={() => updateBet((v) => v + 1000)}>+1000</a>
              <a onClick={() => updateBet((v) => v * 2)}>x2</a>
              <a onClick={() => updateBet((v) => Math.max(v / 2, 1))}>1/2</a>
            </div>
          </div>
          <div className="bx-input">
            <div className="bx-input__input d-flex justify-space-between align-center">
              <label className="d-flex align-center">Bombs:</label>
              <div className="d-flex align-center">
                <input
                  type="text"
                  id="BombMines"
                  value={bombs}
                  onChange={(e) => setBombs(Number(e.target.value) || 3)}
                  style={{ width: 35, textAlign: 'center', paddingRight: 8 }}
                  disabled={gameOn}
                />
                <div className="mines__bomb Bomb d-flex align-center">
                  {BOMB_OPTIONS.map((n) => (
                    <a
                      key={n}
                      className={bombs === n ? 'mines__bomb--active' : ''}
                      onClick={() => !gameOn && setBombs(n)}
                      style={{ cursor: gameOn ? 'default' : 'pointer' }}
                    >
                      {n}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bx-input">
            <div className="bx-input__input d-flex justify-space-between align-center">
              <label className="d-flex align-center">Level:</label>
              <div className="mines__bomb Level d-flex align-center">
                {LEVEL_OPTIONS.map((lev, idx) => (
                  <a
                    key={lev}
                    className={`level_${lev} ${level === lev ? 'mines__bomb--active' : ''}`}
                    onClick={() => !gameOn && setLevel(lev)}
                    style={{ cursor: gameOn ? 'default' : 'pointer' }}
                  >
                    {idx + 1}
                  </a>
                ))}
              </div>
            </div>
          </div>
          {!gameOn && (
            <div className="bx-input start_block_mine">
              <button
                type="button"
                onClick={start}
                disabled={loading}
                className="btn btn--blue d-flex align-center justify-center is-ripples flare"
              >
                <span>Start game</span>
              </button>
            </div>
          )}
          {gameOn && (
            <div className="bx-input mines__buttons play_block_mine">
              <button
                type="button"
                onClick={finish}
                disabled={loading}
                className="btn btn--blue d-flex align-center justify-center is-ripples flare"
              >
                <span>Cash out <span id="winMine">{currentCoeff.toFixed(2)}</span></span>
              </button>
            </div>
          )}
          <div className="bx-input">
            <div className="mines__x">
              <div className="mines__scroll d-flex align-center" />
            </div>
          </div>
        </div>
        <div className="mines__right">
          <div className={`mines__path d-flex justify-space-between flex-wrap ${level === 24 ? 'level_25' : level === 9 ? 'level_16' : 'level_16'}`}>
            {Array.from({ length: cells }, (_, i) => i + 1).map((cell) => (
              <div
                key={cell}
                className={`mines__path-item d-flex align-center justify-center ${revealed.includes(cell) ? 'mines__path-item--revealed' : ''}`}
                onClick={() => gameOn && !revealed.includes(cell) && !loading && click(cell)}
                style={{
                  cursor: gameOn && !revealed.includes(cell) ? 'pointer' : 'default',
                  opacity: revealed.includes(cell) ? 0.6 : 1,
                }}
              >
                {revealed.includes(cell) ? '✓' : '?'}
              </div>
            ))}
          </div>
        </div>
      </div>
      {message && <p style={{ marginTop: 8, color: '#f87171' }}>{message}</p>}
      <p style={{ marginTop: 8 }}>
        <Link href="/">← Back to home</Link>
      </p>
    </div>
  );
}
