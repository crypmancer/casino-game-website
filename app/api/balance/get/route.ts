import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true, demo_balance: true, type_balance: true },
    });
    if (!user) return NextResponse.json({ success: false, mess: 'User not found' }, { status: 404 });
    const balance = user.type_balance === 0 ? Number(user.balance) : Number(user.demo_balance);
    return NextResponse.json({ success: true, balance });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
