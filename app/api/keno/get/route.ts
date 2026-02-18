import { NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const bank = await prisma.keno.aggregate({ _sum: { bet: true } });
    const users = await prisma.keno.count();
    const history = await prisma.keno.findMany({ take: 50, orderBy: { id: 'desc' } });

    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please log in', bank: Number(bank._sum.bet ?? 0), users, history });
    }
    const userId = Number(session.user.id);
    const myKeno = await prisma.keno.findFirst({ where: { user_id: userId } });
    if (!myKeno) {
      return NextResponse.json({ error: 'Error', bank: Number(bank._sum.bet ?? 0), users, history });
    }
    const numbers = myKeno.numbers ? JSON.parse(myKeno.numbers) : [];
    return NextResponse.json({
      success: true,
      selects: numbers,
      bet: Number(myKeno.bet),
      bank: Number(bank._sum.bet ?? 0),
      users,
      history,
    });
  } catch (e) {
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
