import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? Number(session.user.id) : null;

    const [setting, history, crash] = await Promise.all([
      prisma.setting.findFirst(),
      prisma.crashHistory.findMany({
        orderBy: { id: 'desc' },
        take: 7,
        select: { id: true, num: true },
      }),
      prisma.crash.findMany(),
    ]);

    let give = 0;
    let bet = 1;
    let auto = 2;
    if (userId) {
      const myCrash = crash.find((c) => c.user_id === userId);
      if (myCrash) {
        bet = Number(myCrash.bet);
        auto = Number(myCrash.auto);
        const status = setting?.crash_status ?? 0;
        if (status !== 0 && Number(myCrash.result) === 0) give = 1;
        else give = 2;
      }
    }

    const historyForFront = (history ?? []).map((h) => ({ num: Number(h.num) }));
    const historyUsers = (crash ?? []).map((c) => ({
      id: c.id,
      login: c.login ?? '',
      img: c.img ?? '',
      bet: Number(c.bet),
      result: Number(c.result),
      win: Number(c.result) ? Number(c.win) : 0,
    }));

    return NextResponse.json({
      success: true,
      give,
      bet,
      auto,
      last: historyForFront,
      history: historyUsers,
      status: setting?.crash_status ?? 0,
    });
  } catch (e) {
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
