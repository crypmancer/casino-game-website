import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { appendHistoryBalance } from '@/lib/redis';
import { z } from 'zod';

const bodySchema = z.object({ bet: z.coerce.number().min(1) });

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const body = await req.json();
    const { bet } = bodySchema.parse(body);

    const [user, setting] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.setting.findFirst(),
    ]);
    if (!user || user.ban === 1) return NextResponse.json({ error: 'Error' }, { status: 403 });
    if (setting?.status_jackpot != null && setting.status_jackpot !== 0 && setting.status_jackpot !== 3) {
      return NextResponse.json({ error: 'Betting closed' }, { status: 400 });
    }

    const typeBalance = user.type_balance ?? 0;
    const balance = typeBalance === 0 ? Number(user.balance) : Number(user.demo_balance);
    if (balance < bet) return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });

    const sumBetsRound = await prisma.jackpot.aggregate({ _sum: { bet: true } });
    const total = Number(sumBetsRound._sum.bet ?? 0);
    const sumBetsUser = await prisma.jackpot.aggregate({
      where: { user_id: userId },
      _sum: { bet: true },
    });
    const mySum = Number(sumBetsUser._sum.bet ?? 0) + bet;
    const chance = total + bet > 0 ? 100 / ((total + bet) / mySum) : 100;

    const lastBalance = balance;
    const newBalance = balance - bet;
    await appendHistoryBalance(userId, {
      user_id: userId,
      type: 'Jackpot bet',
      balance_before: lastBalance,
      balance_after: newBalance,
      date: new Date().toLocaleString('ru-RU'),
    });

    if (typeBalance === 0) {
      await prisma.user.update({ where: { id: userId }, data: { balance: { decrement: bet } } });
    } else {
      await prisma.user.update({ where: { id: userId }, data: { demo_balance: { decrement: bet } } });
    }

    const maxTick = await prisma.jackpot.aggregate({ _max: { tick_two: true } });
    const tickTwo = (maxTick._max.tick_two ?? 0) + 100;
    const tickOne = tickTwo - 99;

    await prisma.jackpot.create({
      data: {
        user_id: userId,
        bet,
        img: user.avatar ?? undefined,
        login: user.name,
        chance,
        tick_one: tickOne,
        tick_two: tickTwo,
      },
    });

    return NextResponse.json({ success: true, lastbalance: lastBalance, newbalance: newBalance });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
