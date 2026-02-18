import { NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const maxWin = await prisma.jackpotHistory.aggregate({ _max: { win: true } });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const gamesToday = await prisma.jackpotHistory.count({
      where: { created_at: { gte: today } },
    });
    const jackpot = await prisma.jackpot.findMany();
    const uniqueByUser = Array.from(
      new Map(jackpot.map((j) => [j.user_id, j])).values()
    ).sort((a, b) => Number(a.chance ?? 0) - Number(b.chance ?? 0));

    let sumBetUser = 0;
    const session = await getSession();
    if (session?.user?.id) {
      const sum = await prisma.jackpot.aggregate({
        where: { user_id: Number(session.user.id) },
        _sum: { bet: true },
      });
      sumBetUser = Number(sum._sum.bet ?? 0);
    }

    return NextResponse.json({
      success: 'success',
      jackpot,
      players: uniqueByUser,
      gamesToday,
      maxWin: Number(maxWin._max.win ?? 0),
      sumBetUser,
    });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
