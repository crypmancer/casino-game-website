import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);

    const myCrash = await prisma.crash.findFirst({ where: { user_id: userId } });
    if (!myCrash) {
      return NextResponse.json({ success: false, error: 'No active bet' }, { status: 400 });
    }
    if (Number(myCrash.result) !== 0) {
      return NextResponse.json({ success: false, error: 'Already cashed out' }, { status: 400 });
    }

    const coeff = Number(myCrash.auto);
    const win = Number(myCrash.win);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 });

    const typeBalance = user.type_balance ?? 0;
    const currentBalance = typeBalance === 0 ? Number(user.balance) : Number(user.demo_balance);
    const newbalance = currentBalance + win;

    await prisma.$transaction([
      prisma.crash.update({
        where: { id: myCrash.id },
        data: { result: coeff },
      }),
      typeBalance === 0
        ? prisma.user.update({
            where: { id: userId },
            data: { balance: { increment: win } },
          })
        : prisma.user.update({
            where: { id: userId },
            data: { demo_balance: { increment: win } },
          }),
    ]);

    return NextResponse.json({
      success: true,
      newbalance,
      win,
      coeff,
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 });
  }
}
