import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { appendHistoryBalance } from '@/lib/redis';

const X100_COFF: Record<string, number> = {
  '2': 2, '3': 3, '10': 10, '15': 15, '20': 20, '100': 100,
};

export async function GET() {
  try {
    const setting = await prisma.setting.findFirst();
    if (!setting) return NextResponse.json({ ok: false }, { status: 400 });
    const winNumber = Number(setting.x100WinNumber) || 2;
    const coeff = X100_COFF[String(winNumber)] ?? 2;

    const bets = await prisma.x100.findMany();
    for (const w of bets) {
      const user = await prisma.user.findUnique({ where: { id: w.user_id } });
      if (!user) continue;
      const bet = Number(w.bet);
      const win = bet * coeff;
      const userBalance = user.type_balance === 0 ? Number(user.balance) : Number(user.demo_balance);
      await appendHistoryBalance(user.id, {
        user_id: user.id,
        type: `X100 win x${coeff}`,
        balance_before: userBalance,
        balance_after: userBalance + win,
        date: new Date().toLocaleString('ru-RU'),
      });
      if (user.type_balance === 0) {
        await prisma.user.update({ where: { id: user.id }, data: { balance: { increment: win } } });
      } else {
        await prisma.user.update({ where: { id: user.id }, data: { demo_balance: { increment: win } } });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
