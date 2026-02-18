import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { appendHistoryBalance } from '@/lib/redis';

export async function GET() {
  try {
    const crashList = await prisma.crash.findMany();
    for (const c of crashList) {
      const user = await prisma.user.findUnique({ where: { id: c.user_id } });
      if (!user) continue;
      const bet = Number(c.bet);
      const result = Number(c.result);
      if (result === 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { sum_to_withdraw: { decrement: bet }, lose_games: { increment: 1 } },
        });
      } else {
        const winUser = result * bet;
        const userBalance = user.type_balance === 0 ? Number(user.balance) : Number(user.demo_balance);
        await appendHistoryBalance(user.id, {
          user_id: user.id,
          type: `Crash win x${result}`,
          balance_before: userBalance,
          balance_after: userBalance + winUser,
          date: new Date().toLocaleString('ru-RU'),
        });
        if (user.type_balance === 0) {
          await prisma.user.update({ where: { id: user.id }, data: { balance: { increment: winUser } } });
        } else {
          await prisma.user.update({ where: { id: user.id }, data: { demo_balance: { increment: winUser } } });
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
