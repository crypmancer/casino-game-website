import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { appendHistoryBalance } from '@/lib/redis';
import { z } from 'zod';

function getCoeff(count: number, steps: number, level: number): number {
  let coeff = 1;
  for (let i = 0; i < level - count && steps > i; i++) {
    coeff *= (level - i) / (level - count - i);
  }
  return coeff;
}

const bodySchema = z.object({ mine: z.coerce.number().min(1) });

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const body = await req.json();
    const { mine } = bodySchema.parse(body);

    if (!redis) return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
    const gameRaw = await redis.get(`minesGame.user.${userId}.game`);
    if (!gameRaw) return NextResponse.json({ success: false, mess: 'Error' }, { status: 400 });
    const game = JSON.parse(gameRaw);
    const click: number[] = game.click ?? [];
    if (click.includes(mine)) return NextResponse.json({ success: false, mess: 'Already revealed' }, { status: 400 });

    const mines: number[] = game.mines ?? [];
    if (mines.includes(mine)) {
      await redis.del(`minesGame.user.${userId}.game`);
      await redis.set(`minesGame.user.${userId}.start`, '0');
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await prisma.user.update({
          where: { id: userId },
          data: { lose_games: { increment: 1 }, sum_to_withdraw: { decrement: game.bet } },
        });
      }
      return NextResponse.json({ success: true, boom: true, num: mine });
    }

    click.push(mine);
    const newCoeff = getCoeff(click.length, 3, game.level);
    game.click = click;
    game.coeff = newCoeff;
    await redis.set(`minesGame.user.${userId}.game`, JSON.stringify(game));
    return NextResponse.json({ success: true, num: mine, coeff: newCoeff, step: click.length });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) return NextResponse.json({ success: false, mess: 'Invalid data' }, { status: 400 });
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
