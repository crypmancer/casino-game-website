'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

function percentToCoeff(percent: number, type: 0 | 1): number {
  if (type === 0) return percent >= 100 ? 1 : 99 / (100 - percent);
  return percent >= 100 ? 1 : 99 / percent;
}
function percentToWin(bet: number, percent: number, type: 0 | 1): number {
  return bet * percentToCoeff(percent, type);
}

export default function DicePage() {
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState('');
  const [bet, setBet] = useState('1.00');
  const [percent, setPercent] = useState(50);
  const [type, setType] = useState<0 | 1>(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{ numb?: number; win?: boolean } | null>(null);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch('/api/balance/get', { method: 'POST', credentials: 'include' })
      .then((r) => r.json())
      .then((d) => d.success && setBalance(String(d.balance)));
  }, [session?.user?.id]);

  const coeff = useMemo(() => percentToCoeff(percent, type), [percent, type]);
  const winAmount = useMemo(() => percentToWin(parseFloat(bet) || 0, percent, type), [bet, percent, type]);

  const updateBet = (fn: (v: number) => number) => {
    const v = parseFloat(bet) || 0;
    const next = Math.max(1, fn(v));
    setBet(next.toFixed(2));
  };

  const play = async () => {
    const b = parseFloat(bet);
    const p = percent;
    if (isNaN(b) || b < 1 || p < 1 || p > 95) {
      setMessage('Bet from 1, chance 1–95%');
      return;
    }
    setLoading(true);
    setMessage('');
    setLastResult(null);
    setRolling(true);
    const res = await fetch('/api/dice/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ bet: b, percent: p, type }),
    });
    const data = await res.json();
    setLoading(false);
    setRolling(false);
    if (data.success) {
      setBalance(String(data.newbalance));
      setLastResult({ numb: data.numb, win: data.win });
    } else {
      setMessage(data.mess || 'Error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="wrapper">
        <div style={{ marginTop: 35 }} className="dice">
          <p style={{ padding: '2rem', color: '#9EABCD' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const digits = lastResult?.numb != null ? String(lastResult.numb).padStart(4, '0').split('') : ['0', '0', '0', '0'];

  return (
    <div style={{ marginTop: 35 }} className="dice">
      <div className="dice__drum d-flex justify-center align-center" id="dice__result">
        <div className="dice__center">
          <div className="dice__timer">
            <span className="d-flex justify-center align-center">
              <div className="dice__slider">
                <div className="dice__slider-inner d-flex flex-column" id="dice_n_1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <div key={n} className="dice__slider-item d-flex align-center justify-center">
                      <span>{digits[0] ?? n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </span>
            <span className="d-flex justify-center align-center">
              <div className="dice__slider">
                <div className="dice__slider-inner d-flex flex-column" id="dice_n_2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <div key={n} className="dice__slider-item d-flex align-center justify-center">
                      <span>{digits[1] ?? n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </span>
            <span className="d-flex justify-center align-center">
              <div className="dice__slider">
                <div className="dice__slider-inner d-flex flex-column" id="dice_n_3">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <div key={n} className="dice__slider-item d-flex align-center justify-center">
                      <span>{digits[2] ?? n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </span>
            <span className="d-flex justify-center align-center">
              <div className="dice__slider">
                <div className="dice__slider-inner d-flex flex-column" id="dice_n_4">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <div key={n} className="dice__slider-item d-flex align-center justify-center">
                      <span>{digits[3] ?? n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </span>
          </div>
        </div>
        <div className="dice__result d-flex align-center justify-center">
          {lastResult != null && (
            <span>
              {lastResult.numb} — {lastResult.win ? 'Win' : 'Lose'}
            </span>
          )}
        </div>
      </div>
      <div className="wrapper">
        <div className="dice__bet">
          <div className="dice__procent">
            <div className="bx-input__input d-flex align-center justify-space-between">
              <label className="d-flex align-center">Chance %:</label>
              <input
                readOnly
                style={{ cursor: 'default' }}
                type="text"
                value={percent.toFixed(2)}
                className="fullInputWidth"
              />
            </div>
          </div>
          <div className="dice__chance">
            <input
              type="range"
              min={1}
              max={95}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="dice__range"
            />
            <div className="dice__select-chance d-flex align-center justify-space-between">
              <a
                className={type === 0 ? 'active btn_min_change' : ''}
                onClick={() => setType(0)}
                style={{ cursor: 'pointer' }}
              >
                Under
              </a>
              <a
                className={type === 1 ? 'active' : ''}
                onClick={() => setType(1)}
                style={{ cursor: 'pointer' }}
              >
                Over
              </a>
            </div>
          </div>
          <div className="dice__x">
            <div className="bx-input__input d-flex align-center justify-space-between">
              <label className="d-flex align-center">Multiplier:</label>
              <input readOnly style={{ cursor: 'default' }} type="text" value={coeff.toFixed(2)} />
            </div>
          </div>
          <div className="dice__betting">
            <div className="bx-input__input d-flex align-center justify-space-between">
              <input
                className="fullInputWidth"
                style={{ textAlign: 'left' }}
                type="text"
                value={bet}
                onChange={(e) => setBet(e.target.value)}
                placeholder="0.00"
              />
              <svg className="icon money">
                <use xlinkHref="/images/symbols.svg#coins" />
              </svg>
            </div>
          </div>
          <div className="dice__betting">
            <div className="x30__bet-placed d-flex align-center justify-space-between">
              <a onClick={() => setBet('1.00')}>Min</a>
              <a onClick={() => updateBet(() => (balance ? parseFloat(balance) : 1))}>Max</a>
              <a onClick={() => updateBet((v) => v * 2)}>x2</a>
              <a onClick={() => updateBet((v) => Math.max(v / 2, 1))}>1/2</a>
            </div>
          </div>
          <div className="dice__win">
            <div className="bx-input__input d-flex align-center justify-space-between">
              <label className="d-flex align-center">Win:</label>
              <div className="d-flex align-center">
                <input readOnly style={{ cursor: 'default' }} type="text" value={winAmount.toFixed(2)} />
                <svg className="icon money">
                  <use xlinkHref="/images/symbols.svg#coins" />
                </svg>
              </div>
            </div>
          </div>
          <div className="dice__play d-flex justify-center align-center" style={{ gridColumn: '1 / 4' }}>
            <button
              type="button"
              className="btn is-ripples flare btn--blue d-flex align-center"
              onClick={play}
              disabled={loading}
              id="dice__play"
            >
              <span>{rolling ? '...' : 'Roll'}</span>
            </button>
            {lastResult != null && (
              <button
                type="button"
                className="btn is-ripples flare btn--red d-flex align-center"
                onClick={() => setLastResult(null)}
                id="dice__replay"
                style={{ marginLeft: 12 }}
              >
                <span>Play again</span>
              </button>
            )}
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
