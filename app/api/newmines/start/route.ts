import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { appendHistoryBalance } from '@/lib/redis';
import { z } from 'zod';

const bodySchema = z.object({ bet: z.coerce.number().min(1), level: z.coerce.number().min(3).max(24) });

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const body = await req.json();
    const { bet, level } = bodySchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.ban === 1) return NextResponse.json({ success: false, mess: 'Error' }, { status: 403 });
    if (!redis) return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });

    const hasStart = await redis.get(`minesGame.user.${userId}.start`);
    if (hasStart && hasStart !== '0') return NextResponse.json({ success: false, mess: 'Game already started' }, { status: 400 });

    const balance = user.type_balance === 0 ? Number(user.balance) : Number(user.demo_balance);
    if (balance < bet) return NextResponse.json({ success: false, mess: 'Insufficient funds' }, { status: 400 });

    const lastBalance = balance;
    const newBalance = balance - bet;
    await appendHistoryBalance(userId, {
      user_id: userId,
      type: 'Mines bet',
      balance_before: lastBalance,
      balance_after: newBalance,
      date: new Date().toLocaleString('ru-RU'),
    });

    if (user.type_balance === 0) {
      await prisma.user.update({ where: { id: userId }, data: { balance: { decrement: bet } } });
    } else {
      await prisma.user.update({ where: { id: userId }, data: { demo_balance: { decrement: bet } } });
    }

    const mines = new Set<number>();
    while (mines.size < 3) mines.add(Math.floor(Math.random() * level) + 1);
    const game = { bet, level, click: [], mines: Array.from(mines), coeff: 1 };
    await redis.set(`minesGame.user.${userId}.game`, JSON.stringify(game));
    await redis.set(`minesGame.user.${userId}.start`, '1');

    return NextResponse.json({ success: true, lastbalance: lastBalance, newbalance: newBalance });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) return NextResponse.json({ success: false, mess: 'Invalid data' }, { status: 400 });
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
