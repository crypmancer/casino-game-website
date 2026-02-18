import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { appendHistoryBalance } from '@/lib/redis';
import { z } from 'zod';

const VALID_COFF = [2, 3, 10, 15, 20, 100];
const bodySchema = z.object({ coff: z.coerce.number(), bet: z.coerce.number().min(1).max(100000) });

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const body = await req.json();
    const { coff, bet } = bodySchema.parse(body);
    if (!VALID_COFF.includes(coff)) return NextResponse.json({ error: 'Error' }, { status: 400 });

    const [user, setting] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.setting.findFirst(),
    ]);
    if (!user || user.ban === 1) return NextResponse.json({ error: 'Error' }, { status: 403 });
    if (setting != null && setting.status_x100 != null && setting.status_x100 !== 0) return NextResponse.json({ error: 'Betting closed' }, { status: 400 });

    const otherCoffCount = await prisma.x100.count({
      where: { user_id: userId, coff: { not: coff } },
    });
    if (otherCoffCount >= 3) return NextResponse.json({ error: 'Maximum 3 bets on other coefficients' }, { status: 400 });

    const typeBalance = user.type_balance ?? 0;
    const balance = typeBalance === 0 ? Number(user.balance) : Number(user.demo_balance);
    if (balance < bet) return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });

    const lastBalance = balance;
    const newBalance = balance - bet;
    await appendHistoryBalance(userId, {
      user_id: userId,
      type: 'X100 bet',
      balance_before: lastBalance,
      balance_after: newBalance,
      date: new Date().toLocaleString('ru-RU'),
    });

    if (typeBalance === 0) {
      await prisma.user.update({ where: { id: userId }, data: { balance: { decrement: bet } } });
    } else {
      await prisma.user.update({ where: { id: userId }, data: { demo_balance: { decrement: bet } } });
    }

    await prisma.x100.create({
      data: { user_id: userId, coff, bet, img: user.avatar ?? undefined, login: user.name },
    });

    return NextResponse.json({ success: true, lastbalance: lastBalance, newbalance: newBalance });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
