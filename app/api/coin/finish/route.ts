import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { appendHistoryBalance } from '@/lib/redis';
import { getCoinGame, delCoinGame } from '@/lib/coin-game-store';

async function getGameRaw(userId: number): Promise<string | null> {
  if (redis) {
    try {
      return await redis.get(`coinGame.user.${userId}.game`);
    } catch {
      //
    }
  }
  return getCoinGame(userId);
}

async function clearGame(userId: number): Promise<void> {
  if (redis) {
    try {
      await redis.del(`coinGame.user.${userId}.game`);
      await redis.set(`coinGame.user.${userId}.start`, '0');
      return;
    } catch {
      //
    }
  }
  await delCoinGame(userId);
}

export async function POST() {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);

    const gameRaw = await getGameRaw(userId);
    if (!gameRaw) return NextResponse.json({ success: false, mess: 'An unknown error occurred' }, { status: 400 });
    const game = JSON.parse(gameRaw);
    if (game.step < 1) return NextResponse.json({ success: false, mess: 'You have not completed any level' }, { status: 400 });

    const win = game.bet * game.coeff;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ success: false }, { status: 404 });
    const userBalance = user.type_balance === 0 ? Number(user.balance) : Number(user.demo_balance);

    try {
      await appendHistoryBalance(userId, {
        user_id: userId,
        type: 'Coin win',
        balance_before: userBalance,
        balance_after: userBalance + win,
        date: new Date().toLocaleString('ru-RU'),
      });
    } catch {
      // non-fatal
    }

    if (user.type_balance === 0) {
      await prisma.user.update({ where: { id: userId }, data: { balance: { increment: win } } });
    } else {
      await prisma.user.update({ where: { id: userId }, data: { demo_balance: { increment: win } } });
    }

    await clearGame(userId);

    return NextResponse.json({
      success: true,
      mess: 'You won ' + Math.round(win * 100) / 100,
      lastbalance: userBalance,
      newbalance: userBalance + win,
      coeffBonusCoin: game.coeffBonusCoin ?? 1,
    });
  } catch (e) {
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
