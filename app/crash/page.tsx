'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const historyClass = (num: number) => {
  if (num < 1.5) return 'x1';
  if (num < 5) return 'x2';
  if (num < 10) return 'x3';
  if (num < 40) return 'x4';
  if (num < 70) return 'x5';
  return 'x6';
};

export default function CrashPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [balance, setBalance] = useState<string>('0');
  const [bet, setBet] = useState('1.00');
  const [auto, setAuto] = useState('2');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonMode, setButtonMode] = useState<'start' | 'cashout' | 'wait'>('start');
  const [displayMultiplier, setDisplayMultiplier] = useState('00:10');
  const [chartColor, setChartColor] = useState<{ border: string; bg: string }>({
    border: 'rgba(128, 179, 255)',
    bg: 'rgba(73, 134, 245, 0.65)',
  });
  const [historyScroll, setHistoryScroll] = useState<{ num: number }[]>([]);
  const [historyUsers, setHistoryUsers] = useState<
    { id: number; login: string; img: string; bet: number; result: number; win: number }[]
  >([]);
  const chartRef = useRef<ChartJS<'line'> | null>(null);
  const [chartData, setChartData] = useState<{ labels: number[]; data: number[] }>({ labels: [0], data: [0] });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/crash');
  }, [status, router]);

  const fetchBalance = async () => {
    const res = await fetch('/api/balance/get', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.success) setBalance(String(data.balance));
  };

  const fetchGet = useCallback(async () => {
    const res = await fetch('/api/crash/get', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.give === 1) {
      setBet(String(data.bet ?? 1));
      setAuto(String(data.auto ?? 2));
      setButtonMode('cashout');
      setDisplayMultiplier('0.00');
    } else if (data.give === 2) {
      setBet(String(data.bet ?? 1));
      setButtonMode('wait');
      setDisplayMultiplier('00:10');
    }
    if (data.last && Array.isArray(data.last)) {
      setHistoryScroll(data.last.map((e: { num: number }) => ({ num: e.num })));
    }
    if (data.history && Array.isArray(data.history)) {
      setHistoryUsers(
        data.history.map((e: { id: number; login: string; img: string; bet: number; result: number }) => ({
          id: e.id,
          login: e.login,
          img: e.img || '',
          bet: e.bet,
          result: e.result,
          win: e.result ? e.bet * e.result : 0,
        }))
      );
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBalance();
      fetchGet();
    }
  }, [session?.user?.id, fetchGet]);

  const updateBet = (fn: (v: number) => number) => {
    const v = parseFloat(bet) || 0;
    const next = Math.max(1, fn(v));
    setBet(next.toFixed(2));
  };

  const placeBet = async () => {
    const b = parseFloat(bet);
    const a = parseFloat(auto);
    if (isNaN(b) || b < 1 || isNaN(a) || a < 1.1) {
      setMessage('Bet from 1, auto from 1.1');
      return;
    }
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/crash/bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ bet: b, auto: a }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setBalance(String(data.newbalance));
      setButtonMode('cashout');
      setMessage('Bet placed');
      fetchGet();
    } else {
      setMessage(data.error || data.mess || 'Error');
    }
  };

  const cashout = async () => {
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/crash/give', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      if (data.newbalance != null) setBalance(String(data.newbalance));
      setButtonMode('start');
      setMessage('Cashed out');
      fetchGet();
    } else {
      setMessage(data.error || data.mess || 'Error');
    }
  };

  const handleMainButton = () => {
    if (buttonMode === 'start') placeBet();
    else if (buttonMode === 'cashout') cashout();
  };

  const chartOptions = {
    animation: false as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: {
        min: 1,
        max: Math.max(2, ...chartData.data) + 1,
        ticks: {
          color: '#7485b7',
          callback: function (this: { value: number }, value: number) {
            if (value === 1) return '';
            return value.toFixed(1) + 'x';
          },
        },
      },
    },
  };

  const chartDataset = {
    labels: chartData.labels,
    datasets: [
      {
        label: '',
        data: chartData.data,
        borderColor: chartColor.border,
        backgroundColor: chartColor.bg,
        pointRadius: 0,
        borderWidth: 1.4,
        fill: true,
      },
    ],
  };

  if (status === 'loading') {
    return (
      <div className="wrapper">
        <div style={{ marginTop: 35 }} className="crash">
          <p style={{ padding: '2rem', color: '#9EABCD' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <div style={{ marginTop: 35 }} className="crash">
        <div className="crash__top d-flex align-stretch justify-space-between">
          <div className="crash__left d-flex flex-column">
            <div className="bx-input d-flex flex-column">
              <div className="bx-input__input d-flex align-center justify-space-between">
                <input
                  className="fullInputWidth"
                  style={{ textAlign: 'left', color: '#fff', fontSize: 16 }}
                  placeholder="0.00"
                  type="text"
                  value={bet}
                  onChange={(e) => setBet(e.target.value)}
                  disabled={buttonMode === 'cashout'}
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
            <div className="bx-input d-flex flex-column">
              <div className="bx-input__input d-flex align-center justify-space-between">
                <label className="d-flex align-center">Auto cashout:</label>
                <div className="d-flex align-center">
                  <input
                    id="crashAuto"
                    style={{ color: '#fff', fontSize: 16 }}
                    type="text"
                    value={auto}
                    onChange={(e) => setAuto(e.target.value)}
                    placeholder="1.10"
                    disabled={buttonMode === 'cashout'}
                  />
                </div>
              </div>
            </div>
            <div className="bx-input d-flex flex-column">
              <button
                type="button"
                id="btnCrash"
                onClick={handleMainButton}
                disabled={loading || buttonMode === 'wait'}
                className="btn btn--blue is-ripples flare d-flex align-center justify-center"
              >
                <span>
                  {buttonMode === 'wait' && 'Waiting...'}
                  {buttonMode === 'start' && 'Start game'}
                  {buttonMode === 'cashout' && `Cash out ${(parseFloat(bet) * 1).toFixed(2)}`}
                </span>
              </button>
            </div>
            <div className="bx-input">
              <div className="crash__history">
                <div className="crash__scroll d-flex">
                  {historyScroll.map((h, i) => (
                    <a key={i} href="#" className={`crash__history-item ${historyClass(h.num)}`}>
                      <span>x{String(h.num.toFixed(2))}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="crash__right">
            <div className="crash__canvas">
              <div className="crash__x-number" style={{ color: '#fff' }}>
                <span>{displayMultiplier}</span>
              </div>
              <div style={{ position: 'relative', top: 10, left: 0, height: 280 }}>
                <Line ref={chartRef} data={chartDataset} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="crash__history-users history">
        {historyUsers.map((u) => (
          <div
            key={u.id}
            id={`game_crash_id_${u.id}`}
            className={`crash__history-item-user crash__history-item-user--${u.result ? 'win' : 'lose'} d-flex align-center justify-space-between`}
          >
            <div className="history__user d-flex align-center justify-center">
              <div
                className="history__user-avatar"
                style={{ background: `url(${u.img}) no-repeat center center / cover` }}
              />
              <span>{u.login}</span>
            </div>
            <div className="d-flex align-center">
              <div className="d-flex align-center">
                <span className="bx-input__text">{Number(u.bet).toFixed(2)}</span>
                <svg className="icon money">
                  <use xlinkHref="/images/symbols.svg#coins" />
                </svg>
              </div>
              <div className="crash__history-user-x d-flex align-center justify-space-between">
                <div className="d-flex align-center">
                  <span className="bx-input__text">{Number(u.win).toFixed(2)}</span>
                  <svg className="icon money">
                    <use xlinkHref="/images/symbols.svg#coins" />
                  </svg>
                </div>
                <a href="#" className={`crash__history-item ${u.result ? historyClass(u.result) : ''}`}>
                  <span>{u.result ? `x${Number(u.result).toFixed(2)}` : '-'}</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      {message && (
        <p style={{ marginTop: 8, color: message.startsWith('Error') ? '#f87171' : '#86efac' }}>{message}</p>
      )}
      <p style={{ marginTop: 8 }}>
        <Link href="/">← Back to home</Link>
      </p>
    </div>
  );
}
