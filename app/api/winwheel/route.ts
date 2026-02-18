import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { appendHistoryBalance } from '@/lib/redis';

export async function GET() {
  try {
    const setting = await prisma.setting.findFirst();
    if (!setting) return NextResponse.json({ ok: false }, { status: 400 });
    const wheelYmn = Number(setting.wheelYmn) || 1;
    const wheelWinNumber = Number(setting.wheel_win_number) ?? 2;

    const wheels = await prisma.wheel.findMany({ where: { coff: wheelWinNumber } });
    for (const w of wheels) {
      const user = await prisma.user.findUnique({ where: { id: w.user_id } });
      if (!user) continue;
      const bet = Number(w.bet);
      const win = bet * wheelWinNumber * wheelYmn;
      const userBalance = user.type_balance === 0 ? Number(user.balance) : Number(user.demo_balance);
      await appendHistoryBalance(user.id, {
        user_id: user.id,
        type: `Wheel win x${wheelWinNumber} x${wheelYmn}`,
        balance_before: userBalance,
        balance_after: userBalance + win,
        date: new Date().toLocaleString('ru-RU'),
      });
      if (user.type_balance === 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { balance: { increment: win } },
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { demo_balance: { increment: win } },
        });
      }
    }
    const wheelLose = await prisma.wheel.findMany({ where: { coff: { not: wheelWinNumber } } });
    for (const w of wheelLose) {
      await prisma.user.update({
        where: { id: w.user_id },
        data: { lose_games: { increment: 1 } },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
