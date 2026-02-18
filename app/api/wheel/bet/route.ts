import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { appendHistoryBalance } from '@/lib/redis';
import { z } from 'zod';

const bodySchema = z.object({
  coff: z.coerce.number().min(1).max(30),
  bet: z.coerce.number().min(1),
  demo: z.coerce.number().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const body = await req.json();
    const { coff, bet, demo = 0 } = bodySchema.parse(body);

    const [user, setting] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.setting.findFirst(),
    ]);
    if (!user) {
      return NextResponse.json({ success: false, mess: 'Error' }, { status: 400 });
    }
    if (setting?.status_wheel != null && setting.status_wheel !== 0) {
      return NextResponse.json({ success: false, mess: 'Betting closed' }, { status: 400 });
    }
    const typeBalance = user.type_balance ?? 0;
    const balance = typeBalance === 0 ? Number(user.balance) : Number(user.demo_balance);
    if (balance < bet) {
      return NextResponse.json({ success: false, mess: 'Insufficient funds' }, { status: 400 });
    }

    const existing = await prisma.wheel.count({ where: { user_id: userId } });
    if (existing > 0) {
      return NextResponse.json({ success: false, mess: 'You have already placed a bet' }, { status: 400 });
    }

    const lastBalance = balance;
    const newBalance = balance - bet;

    await appendHistoryBalance(userId, {
      user_id: userId,
      type: 'Wheel bet',
      balance_before: lastBalance,
      balance_after: newBalance,
      date: new Date().toLocaleString('ru-RU'),
    });

    if (typeBalance === 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: bet }, sum_bet: { increment: bet } },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { demo_balance: { decrement: bet }, sum_bet: { increment: bet } },
      });
    }

    const wheel = await prisma.wheel.create({
      data: {
        user_id: userId,
        coff,
        login: user.name,
        bet,
        img: user.avatar ?? undefined,
        demo: demo ?? 0,
      },
    });

    return NextResponse.json({
      success: true,
      lastbalance: lastBalance,
      newbalance: newBalance,
    });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, mess: 'Invalid data' }, { status: 400 });
    }
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
