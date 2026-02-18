'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const CoinHeadsSvg = () => (
  <svg className="icon coinflip__place-img" width={70} height={70} viewBox="0 0 70 70" fill="none">
    <path d="M14.2931 8.25769C13.9213 7.19128 12.7225 6.65808 11.6479 7.02722C10.5736 7.39622 10.0361 8.58581 10.408 9.65222C10.8626 10.8827 11.3587 12.072 11.9372 13.2206C12.7225 11.8259 13.6733 10.5544 14.7478 9.36511C14.5824 8.99597 14.4172 8.62696 14.2931 8.25769Z" fill="#2C3349" />
    <path d="M59.5927 9.65235C59.9646 8.58594 59.4273 7.39635 58.3528 7.02735C57.2782 6.65807 56.0794 7.19127 55.7076 8.25782C55.5834 8.62709 55.4183 8.9961 55.2529 9.36538C56.3273 10.5547 57.2782 11.8262 58.0635 13.2208C58.642 12.0721 59.1382 10.8828 59.5927 9.65235Z" fill="#2C3349" />
    <path d="M26.9759 24.519C28.8712 22.1766 31.7447 20.6445 35.0005 20.6445C38.2563 20.6445 41.1298 22.1766 43.0251 24.519C48.4957 20.7398 52.8112 15.5155 55.253 9.36523C50.3345 3.70508 43.1016 0 35.0005 0C26.8994 0 19.6665 3.70508 14.748 9.36523C17.1898 15.5155 21.5053 20.74 26.9759 24.519Z" fill="#2C3349" />
    <path d="M61.8653 57.9276V26.7969C61.8653 21.8338 60.5012 17.1991 58.0629 13.2207C56.948 15.5504 55.5118 17.6978 53.9404 19.7445C55.0451 21.1638 55.6656 22.9053 55.6656 24.7461C55.6656 29.2703 51.9583 32.9492 47.3993 32.9492C46.767 32.9492 46.1508 32.8583 45.5477 32.7212C45.7608 34.4628 46.1723 36.1817 46.9634 37.7517L49.2479 42.2859C49.9367 43.6483 48.9298 45.2539 47.3993 45.2539H44.3721L36.7193 56.6453C36.4279 57.0804 35.708 57.5586 34.9999 57.5586C34.3228 57.5586 33.5911 57.1089 33.2806 56.6453L25.6278 45.2539H22.6006C21.0703 45.2539 20.0632 43.6484 20.752 42.2859L23.0365 37.7517C23.8276 36.1817 24.2391 34.4628 24.4522 32.7212C23.849 32.8583 23.2329 32.9492 22.6006 32.9492C18.0416 32.9492 14.3343 29.2703 14.3343 24.7461C14.3343 22.905 14.9551 21.1638 16.0598 19.7445C14.4885 17.698 13.0521 15.5504 11.937 13.2207C9.49869 17.1991 8.13462 21.8338 8.13462 26.7969V57.9276C8.13462 61.0448 6.85335 64.2577 4.6216 66.5135C4.0015 67.0878 3.83631 67.9492 4.16682 68.7285C4.49747 69.5078 5.24144 70 6.06806 70H10.2012C14.4171 70 18.0953 67.457 19.6659 63.8477L25.2871 69.3846C26.0724 70.2049 27.3947 70.2049 28.1801 69.3846L34.9999 62.6581L41.8197 69.3846C42.5632 70.2048 43.9691 70.2052 44.7128 69.3846L50.334 63.8477C51.9046 67.457 55.5829 70 59.7987 70H63.9318C64.7585 70 65.5024 69.5078 65.8332 68.7285C66.1637 67.9492 65.9984 67.0878 65.3784 66.5135C63.1465 64.2577 61.8653 61.0448 61.8653 57.9276Z" fill="#2C3349" />
  </svg>
);
const CoinTailsSvg = () => (
  <svg className="icon coinflip__place-img" width={70} height={70} viewBox="0 0 70 70" fill="none">
    <path d="M41.0342 9.15693C37.9289 9.5866 35.6537 10.4153 30.5806 12.9319C27.5368 14.4357 23.8166 16.0623 22.2793 16.5227C19.7582 17.2593 19.051 17.3514 14.4392 17.3514C9.64287 17.382 9.24318 17.3207 7.3062 16.5534C6.16861 16.093 4.72357 15.3872 4.07791 14.9268L2.90958 14.1595L2.78659 14.8347C2.63287 15.9089 3.34002 18.7324 4.20089 20.4204C5.27699 22.5381 7.95186 25.2696 10.1041 26.4051C14.8389 28.9218 19.7582 28.8604 24.5238 26.2824C25.5691 25.6992 26.43 25.3309 26.43 25.4844C26.43 26.0061 23.9396 28.9218 22.7713 29.7504C22.1256 30.2108 21.0495 30.8553 20.3424 31.1622C19.297 31.6532 19.0203 31.9294 18.8666 32.8195C18.6821 33.8016 18.8666 36.9013 19.2355 39.3259L19.42 40.4308L17.1141 41.5663C13.7013 43.285 10.35 44.0216 6.87576 43.8681C4.41611 43.7761 3.77045 43.6226 1.89497 42.6712C-0.195732 41.6584 -0.257223 41.6277 0.296198 42.395C1.34155 43.8681 4.78506 46.9372 6.90651 48.2876C9.7966 50.1597 12.5637 51.2032 16.1917 51.817C18.8666 52.2774 19.9427 52.2774 25.8151 51.9705C33.1325 51.5408 35.2847 51.725 38.0518 52.9833C38.9127 53.3823 39.6506 53.7812 39.6506 53.8733C39.6506 53.9347 38.6053 54.0268 37.3139 54.0268C34.9773 54.0268 30.1195 55.1009 30.1195 55.6227C30.1195 56.1137 35.8074 58.6611 38.4208 59.3363C41.9565 60.2263 47.0603 60.2263 50.5653 59.3056C60.9573 56.5741 68.3978 48.1955 69.8121 37.6686C70.1195 35.1827 70.058 32.6046 69.5661 29.4128L69.3816 28.2773H54.9927L40.573 34.5477V34.5689V34.59L55.6691 40.8604L55.1157 41.8119C54.2548 43.285 52.0103 45.1572 49.7967 46.2006C47.9212 47.0907 47.5522 47.152 44.4162 47.152C41.3724 47.152 40.8497 47.06 39.2509 46.3234C36.945 45.2492 35.3462 43.9602 34.0242 42.1495C30.3039 37.0241 30.7036 30.2721 35.0388 25.6992C39.0357 21.4639 45.4308 20.359 50.3808 23.0598L52.0411 23.9806H59.8812C68.736 23.9806 68.0903 24.2568 66.3071 21.2798C61.8182 13.7912 52.9942 8.85002 44.4162 9.00348C43.0634 9.00348 41.5568 9.09555 41.0342 9.15693Z" fill="#2C3349" />
  </svg>
);

export default function CoinflipPage() {
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState('');
  const [bet, setBet] = useState('1.00');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameOn, setGameOn] = useState(false);
  const [step, setStep] = useState(0);
  const [coeff, setCoeff] = useState(0);

  const fetchBalance = async () => {
    const res = await fetch('/api/balance/get', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.success) setBalance(String(data.balance));
  };
  const fetchGame = async () => {
    const res = await fetch('/api/coin/get', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      setGameOn(true);
      setStep(data.step ?? 0);
      setCoeff(data.coeff ?? 0);
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

  const placeBet = async () => {
    const b = parseFloat(bet);
    if (isNaN(b) || b < 1) {
      setMessage('Minimum bet 1');
      return;
    }
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/coin/bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ bet: b }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setBalance(String(data.newbalance));
      setGameOn(true);
      setStep(0);
      setCoeff(0);
    } else {
      setMessage(data.mess || 'Error');
    }
  };

  const play = async (side: 1 | 2) => {
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/coin/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ type: side }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      if (data.off === 0) {
        setStep(data.step ?? 0);
        setCoeff(data.coeff ?? 0);
        fetchBalance();
      } else {
        setGameOn(false);
        fetchBalance();
      }
    } else {
      setMessage(data.mess || 'Error');
    }
  };

  const finish = async () => {
    setLoading(true);
    const res = await fetch('/api/coin/finish', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setBalance(String(data.newbalance));
      setGameOn(false);
    } else {
      setMessage(data.mess || 'Error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="wrapper">
        <div style={{ marginTop: 35 }} className="crash coinflip">
          <p style={{ padding: '2rem', color: '#9EABCD' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const winAmount = (parseFloat(bet) || 0) * coeff;

  return (
    <div className="wrapper">
      <div style={{ marginTop: 35 }} className="crash coinflip">
        <div className="crash__top d-flex align-stretch justify-space-between">
          <div className="crash__left d-flex flex-column">
            <div className="bx-input d-flex flex-column" style={{ marginBottom: 0 }}>
              <div className="bx-input__input d-flex align-center justify-space-between">
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
            {gameOn && (
              <div className="bx-input d-flex flex-column" id="playCoin">
                <div className="coinflip__placed d-flex align-center justify-space-between">
                  <div
                    className="coinflip__place d-flex align-center justify-center"
                    onClick={() => !loading && play(1)}
                    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                  >
                    <div>
                      <b>Heads</b>
                      <CoinHeadsSvg />
                    </div>
                  </div>
                  <div
                    className="coinflip__place d-flex align-center justify-center"
                    onClick={() => !loading && play(2)}
                    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                  >
                    <div>
                      <b>Tails</b>
                      <CoinTailsSvg />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  style={{ marginTop: 15 }}
                  id="finishCoinBtn"
                  onClick={finish}
                  disabled={loading}
                  className="btn btn--blue is-ripples flare d-flex align-center justify-center"
                >
                  <span>Cash out <span id="winCoin">{winAmount.toFixed(2)}</span></span>
                </button>
              </div>
            )}
            {!gameOn && (
              <div className="bx-input d-flex flex-column" id="startCoin">
                <button
                  type="button"
                  onClick={placeBet}
                  disabled={loading}
                  className="btn btn--blue is-ripples flare d-flex align-center justify-center"
                >
                  <span>Start game</span>
                </button>
              </div>
            )}
          </div>
          <div className="crash__right d-flex flex-column justify-space-between">
            <div className="coinflip__results d-flex align-center justify-space-between">
              <div className="coinflip__result d-flex align-center justify-space-between">
                <span>Step:</span>
                <b id="coinStep">{step}</b>
              </div>
              <div className="coinflip__result d-flex align-center justify-space-between">
                <span>Multiplier:</span>
                <b id="coinCoeff">x{coeff.toFixed(2)}</b>
              </div>
            </div>
            <div className="coinflip__game d-flex align-center justify-center">
              <div className="coinflip__wrapper" id="game">
                <div className="side-a" />
                <div className="side-b" />
              </div>
            </div>
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
