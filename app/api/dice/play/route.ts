import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { appendHistoryBalance } from '@/lib/redis';
import { z } from 'zod';

const bodySchema = z.object({
  bet: z.coerce.number().min(1),
  percent: z.coerce.number().min(1).max(95),
  type: z.coerce.number(), // 0 = under, 1 = over
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const body = await req.json();
    const { bet, percent, type } = bodySchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.ban === 1) return NextResponse.json({ success: false, mess: 'Error' }, { status: 403 });

    const balance = user.type_balance === 0 ? Number(user.balance) : Number(user.demo_balance);
    if (balance < bet) return NextResponse.json({ success: false, mess: 'Insufficient funds' }, { status: 400 });

    const numb = Math.round(Math.random() * 9999) / 100; // 0-99.99
    const target = percent;
    const win = type === 0 ? (numb < target) : (numb > target);
    const coeff = type === 0 ? (100 / target) : (100 / (100 - target));
    const winAmount = win ? bet * coeff : 0;

    const lastBalance = balance;
    let newBalance = balance;
    if (win) {
      newBalance = balance + winAmount;
      await appendHistoryBalance(userId, {
        user_id: userId,
        type: 'Dice win',
        balance_before: lastBalance,
        balance_after: newBalance,
        date: new Date().toLocaleString('ru-RU'),
      });
      if (user.type_balance === 0) {
        await prisma.user.update({ where: { id: userId }, data: { balance: { increment: winAmount } } });
      } else {
        await prisma.user.update({ where: { id: userId }, data: { demo_balance: { increment: winAmount } } });
      }
    } else {
      newBalance = balance - bet;
      await appendHistoryBalance(userId, {
        user_id: userId,
        type: 'Dice loss',
        balance_before: lastBalance,
        balance_after: newBalance,
        date: new Date().toLocaleString('ru-RU'),
      });
      if (user.type_balance === 0) {
        await prisma.user.update({ where: { id: userId }, data: { balance: { decrement: bet } } });
      } else {
        await prisma.user.update({ where: { id: userId }, data: { demo_balance: { decrement: bet } } });
      }
    }

    return NextResponse.json({
      success: true,
      win,
      numb: Number(numb.toFixed(2)),
      lastbalance: lastBalance,
      newbalance: newBalance,
      winAmount: win ? winAmount : 0,
    });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) return NextResponse.json({ success: false, mess: 'Invalid data' }, { status: 400 });
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
