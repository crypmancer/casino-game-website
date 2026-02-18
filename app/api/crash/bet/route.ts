import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { appendHistoryBalance } from '@/lib/redis';
import { z } from 'zod';

const bodySchema = z.object({
  bet: z.coerce.number().min(1).max(10000),
  auto: z.coerce.number().min(1.1),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const body = await req.json();
    const { bet, auto } = bodySchema.parse(body);

    const [user, setting] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.setting.findFirst(),
    ]);
    if (!user) {
      return NextResponse.json({ success: false, mess: 'Error' }, { status: 400 });
    }
    if (setting?.crash_status != null && setting.crash_status !== 0) {
      return NextResponse.json({ success: false, error: 'Round ended or already started' }, { status: 400 });
    }

    const typeBalance = user.type_balance ?? 0;
    const userBalance = typeBalance === 0 ? Number(user.balance) : Number(user.demo_balance);
    if (userBalance < bet) {
      return NextResponse.json({ success: false, error: 'Insufficient funds' }, { status: 400 });
    }

    const existing = await prisma.crash.count({ where: { user_id: userId } });
    if (existing >= 1) {
      return NextResponse.json({ success: false, error: 'Maximum 1 bet per round' }, { status: 400 });
    }

    const lastbalance = userBalance;
    const newbalance = userBalance - bet;

    await appendHistoryBalance(userId, {
      user_id: userId,
      type: 'Crash bet',
      balance_before: lastbalance,
      balance_after: newbalance,
      date: new Date().toLocaleString('ru-RU'),
    });

    if (typeBalance === 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: bet },
          sum_bet: { increment: bet },
        },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          demo_balance: { decrement: bet },
          sum_bet: { increment: bet },
        },
      });
    }

    let crashBank = setting ? Number(setting.crash_bank) : 0;
    if (setting) {
      if (typeBalance === 0) {
        crashBank += bet * 0.9;
        await prisma.setting.update({
          where: { id: setting.id },
          data: {
            crash_bank: crashBank,
            crash_profit: { increment: bet * 0.1 },
          },
        });
      } else {
        await prisma.setting.update({
          where: { id: setting.id },
          data: { youtube_crash: 1 },
        });
      }
    }
    if (setting && crashBank < 0) {
      await prisma.setting.update({
        where: { id: setting.id },
        data: { crash_bank: 150 },
      });
    }

    const win = auto * bet;
    const zal = await prisma.crash.create({
      data: {
        user_id: userId,
        bet,
        img: user.avatar ?? undefined,
        login: user.name,
        auto,
        win,
      },
    });

    return NextResponse.json({
      success: 'Bet placed',
      lastbalance: lastbalance,
      newbalance: newbalance,
      id: zal.id,
      bet,
      img: user.avatar,
      login: user.name,
    });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 });
  }
}
