import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { redis } from '@/lib/redis';
import { getCoinGameStart, getCoinGame } from '@/lib/coin-game-store';

export async function POST() {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    let start: string | null;
    let gameRaw: string | null;
    if (redis) {
      try {
        start = await redis.get(`coinGame.user.${userId}.start`);
        gameRaw = await redis.get(`coinGame.user.${userId}.game`);
      } catch {
        start = await getCoinGameStart(userId);
        gameRaw = await getCoinGame(userId);
      }
    } else {
      start = await getCoinGameStart(userId);
      gameRaw = await getCoinGame(userId);
    }
    if (!start || start === '0') return NextResponse.json({ success: false, mess: 'An unknown error occurred' });
    if (!gameRaw) return NextResponse.json({ success: false, mess: 'Error' });
    const game = JSON.parse(gameRaw);
    return NextResponse.json({
      success: true,
      bet: game.bet,
      coeff: game.coeff,
      step: game.step,
      coeffBonusCoin: game.coeffBonusCoin ?? 1,
      bonusCoin: game.bonusCoin ? (typeof game.bonusCoin === 'string' ? JSON.parse(game.bonusCoin) : game.bonusCoin) : null,
    });
  } catch (e) {
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
