import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { appendHistoryBalance } from '@/lib/redis';

export async function POST() {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    if (!redis) return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });

    const gameRaw = await redis.get(`minesGame.user.${userId}.game`);
    if (!gameRaw) return NextResponse.json({ success: false, mess: 'Error' }, { status: 400 });
    const game = JSON.parse(gameRaw);
    if ((game.click?.length ?? 0) < 1) return NextResponse.json({ success: false, mess: 'Make at least one move' }, { status: 400 });

    const win = game.bet * (game.coeff ?? 1);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ success: false }, { status: 404 });
    const userBalance = user.type_balance === 0 ? Number(user.balance) : Number(user.demo_balance);

    await appendHistoryBalance(userId, {
      user_id: userId,
      type: 'Mines win',
      balance_before: userBalance,
      balance_after: userBalance + win,
      date: new Date().toLocaleString('ru-RU'),
    });
    if (user.type_balance === 0) {
      await prisma.user.update({ where: { id: userId }, data: { balance: { increment: win } } });
    } else {
      await prisma.user.update({ where: { id: userId }, data: { demo_balance: { increment: win } } });
    }

    await redis.del(`minesGame.user.${userId}.game`);
    await redis.set(`minesGame.user.${userId}.start`, '0');
    return NextResponse.json({ success: true, lastbalance: userBalance, newbalance: userBalance + win, win });
  } catch (e) {
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
