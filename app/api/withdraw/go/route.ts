import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { appendHistoryBalance } from '@/lib/redis';
import { z } from 'zod';

const bodySchema = z.object({
  sum: z.number().min(1),
  wallet: z.string().min(1),
  system: z.number(),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const body = await req.json();
    const { sum, wallet, system } = bodySchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ success: false, mess: 'Please log in' }, { status: 401 });
    if (user.type_balance === 1) return NextResponse.json({ success: false, mess: 'Switch to real balance' }, { status: 400 });
    if (Number(user.sum_to_withdraw) > 0) return NextResponse.json({ success: false, mess: 'Wager required: ' + user.sum_to_withdraw }, { status: 400 });

    const systemWithdraw = await prisma.systemWithdraw.findFirst({ where: { id: system } });
    if (!systemWithdraw) return NextResponse.json({ success: false, mess: 'Specify withdrawal method' }, { status: 400 });
    const minSum = Number(systemWithdraw.min_sum ?? 0);
    if (sum < minSum) return NextResponse.json({ success: false, mess: 'Minimum withdrawal ' + minSum }, { status: 400 });
    if (Number(user.balance) < sum) return NextResponse.json({ success: false, mess: 'Insufficient funds' }, { status: 400 });

    const pending = await prisma.withdraw.count({ where: { user_id: userId, status: 0 } });
    if (pending > 0) return NextResponse.json({ success: false, mess: 'You have pending withdrawals' }, { status: 400 });

    const lastBalance = Number(user.balance);
    const newBalance = lastBalance - sum;
    await appendHistoryBalance(userId, {
      user_id: userId,
      type: 'Withdrawal request',
      balance_before: lastBalance,
      balance_after: newBalance,
      date: new Date().toLocaleString('ru-RU'),
    });

    await prisma.user.update({ where: { id: userId }, data: { balance: { decrement: sum } } });
    await prisma.withdraw.create({
      data: { user_id: userId, sum, status: 0, data: JSON.stringify({ wallet, system: systemWithdraw.name }) },
    });

    return NextResponse.json({ success: true, mess: 'Withdrawal requested', lastbalance: lastBalance, newbalance: newBalance });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) return NextResponse.json({ success: false, mess: 'Invalid data' }, { status: 400 });
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
