import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const bodySchema = z.object({
  sum: z.coerce.number().min(1),
  system: z.coerce.number(),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const body = await req.json();
    const { sum, system } = bodySchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ success: false, mess: 'Please log in' }, { status: 401 });
    if (user.type_balance === 1) return NextResponse.json({ success: false, mess: 'Switch to real balance' }, { status: 400 });

    const systemDep = await prisma.systemDep.findFirst({ where: { id: system } });
    if (!systemDep) return NextResponse.json({ success: false, mess: 'Error' }, { status: 400 });
    const minDep = Number(systemDep.min_sum ?? 0);
    if (sum < minDep) return NextResponse.json({ success: false, mess: `Minimum deposit ${minDep}` }, { status: 400 });

    const payment = await prisma.payment.create({
      data: {
        user_id: userId,
        login: user.name,
        avatar: user.avatar ?? undefined,
        sum,
        status: 0,
        img_system: systemDep.img ?? undefined,
        data: JSON.stringify({ wallet: '', system: systemDep.ps }),
      },
    });
    return NextResponse.json({
      success: true,
      url: `/deposit/result?order=${payment.id}`,
      order_id: payment.id,
    });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) return NextResponse.json({ success: false, mess: 'Invalid data' }, { status: 400 });
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
