import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { getCoinGame, setCoinGame, setCoinGameStart, delCoinGame } from '@/lib/coin-game-store';
import { z } from 'zod';

const bodySchema = z.object({ type: z.coerce.number().refine((n) => n === 1 || n === 2) }); // 1 or 2 = side

async function getGameRaw(userId: number): Promise<string | null> {
  if (redis) {
    try {
      const v = await redis.get(`coinGame.user.${userId}.game`);
      if (v) return v;
    } catch {
      //
    }
  }
  return getCoinGame(userId);
}

async function saveGame(userId: number, gameStr: string): Promise<void> {
  if (redis) {
    try {
      await redis.set(`coinGame.user.${userId}.game`, gameStr);
      return;
    } catch {
      //
    }
  }
  await setCoinGame(userId, gameStr);
  await setCoinGameStart(userId, '1');
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

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const body = await req.json();
    const { type } = bodySchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.ban === 1) return NextResponse.json({ success: false, mess: 'Error' }, { status: 403 });

    const gameRaw = await getGameRaw(userId);
    if (!gameRaw) return NextResponse.json({ success: false, mess: 'Error' }, { status: 400 });
    const game = JSON.parse(gameRaw);

    const side = Math.random() < 0.5 ? 1 : 2; // 1 or 2
    if (side === type) {
      const newCoeff = game.coeff === 0 ? 1.95 : game.coeff * 2;
      game.coeff = newCoeff;
      game.step += 1;
      await saveGame(userId, JSON.stringify(game));
      return NextResponse.json({
        success: true,
        off: 0,
        type: side,
        win: game.bet * game.coeff,
        coeff: game.coeff,
        step: game.step,
      });
    } else {
      await clearGame(userId);
      await prisma.user.update({
        where: { id: userId },
        data: { lose_games: { increment: 1 }, sum_to_withdraw: { decrement: game.bet } },
      });
      return NextResponse.json({ success: true, off: 1, type: side, coeffBonusCoin: game.coeffBonusCoin ?? 1 });
    }
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) return NextResponse.json({ success: false, mess: 'Invalid data' }, { status: 400 });
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
