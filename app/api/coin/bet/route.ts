import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { appendHistoryBalance } from '@/lib/redis';
import { getCoinGameStart, setCoinGame, setCoinGameStart } from '@/lib/coin-game-store';
import { z } from 'zod';

const bodySchema = z.object({ bet: z.coerce.number().min(1) });

async function getHasStart(userId: number): Promise<string | null> {
  if (redis) {
    try {
      return await redis.get(`coinGame.user.${userId}.start`);
    } catch {
      return getCoinGameStart(userId);
    }
  }
  return getCoinGameStart(userId);
}

async function setGameState(userId: number, game: object): Promise<void> {
  const gameStr = JSON.stringify(game);
  if (redis) {
    try {
      await redis.set(`coinGame.user.${userId}.game`, gameStr);
      await redis.set(`coinGame.user.${userId}.start`, '1');
      return;
    } catch {
      // fallback to memory
    }
  }
  await setCoinGame(userId, gameStr);
  await setCoinGameStart(userId, '1');
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const body = await req.json();
    const { bet } = bodySchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.ban === 1) return NextResponse.json({ success: false, mess: 'Error' }, { status: 403 });

    const hasStart = await getHasStart(userId);
    if (hasStart && hasStart !== '0') return NextResponse.json({ success: false, mess: 'Already in game' }, { status: 400 });

    const typeBalance = user.type_balance ?? 0;
    const balance = typeBalance === 0 ? Number(user.balance) : Number(user.demo_balance);
    if (balance < bet) return NextResponse.json({ success: false, mess: 'Insufficient funds' }, { status: 400 });

    const lastBalance = balance;
    const newBalance = balance - bet;
    try {
      await appendHistoryBalance(userId, {
        user_id: userId,
        type: 'Coin bet',
        balance_before: lastBalance,
        balance_after: newBalance,
        date: new Date().toLocaleString('ru-RU'),
      });
    } catch {
      // non-fatal: balance history may be skipped
    }

    if (typeBalance === 0) {
      await prisma.user.update({ where: { id: userId }, data: { balance: { decrement: bet } } });
    } else {
      await prisma.user.update({ where: { id: userId }, data: { demo_balance: { decrement: bet } } });
    }

    const game = { bet, coeff: 0, step: 0, coeffBonusCoin: 1, bonusCoin: null };
    await setGameState(userId, game);

    return NextResponse.json({ success: true, lastbalance: lastBalance, newbalance: newBalance });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) return NextResponse.json({ success: false, mess: 'Invalid data' }, { status: 400 });
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
