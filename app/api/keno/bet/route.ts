import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { appendHistoryBalance } from '@/lib/redis';
import { z } from 'zod';

const KENO_COEFS: number[][] = [[5.92], [3.6, 9.6], [2.2, 5.3, 100], [1.5, 3.24, 20, 200], [1.1, 2.8, 7.5, 28, 780]];
const bodySchema = z.object({
  selectsKeno: z.array(z.coerce.number()).min(1).max(5),
  bet: z.coerce.number().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const body = await req.json();
    const { selectsKeno, bet } = bodySchema.parse(body);

    const [user, setting] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.setting.findFirst(),
    ]);
    if (!user || user.ban === 1) {
      return NextResponse.json({ error: 'Error' }, { status: 403 });
    }
    if (setting?.status_keno != null && setting.status_keno !== 0) {
      return NextResponse.json({ error: 'Betting closed' }, { status: 400 });
    }
    const existing = await prisma.keno.count({ where: { user_id: userId } });
    if (existing > 0) return NextResponse.json({ error: 'You have already placed a bet' }, { status: 400 });

    const typeBalance = user.type_balance ?? 0;
    const balance = typeBalance === 0 ? Number(user.balance) : Number(user.demo_balance);
    if (balance < bet) return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });

    const lastBalance = balance;
    const newBalance = balance - bet;
    await appendHistoryBalance(userId, {
      user_id: userId,
      type: 'Keno bet',
      balance_before: lastBalance,
      balance_after: newBalance,
      date: new Date().toLocaleString('ru-RU'),
    });

    if (typeBalance === 0) {
      await prisma.user.update({ where: { id: userId }, data: { balance: { decrement: bet }, sum_bet: { increment: bet } } });
    } else {
      await prisma.user.update({ where: { id: userId }, data: { demo_balance: { decrement: bet }, sum_bet: { increment: bet } } });
    }

    await prisma.keno.create({
      data: {
        user_id: userId,
        bet,
        numbers: JSON.stringify(selectsKeno),
        img: user.avatar ?? undefined,
        login: user.name,
      },
    });

    return NextResponse.json({ success: true, lastbalance: lastBalance, newbalance: newBalance });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
