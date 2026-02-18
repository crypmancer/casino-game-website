import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const bodySchema = z.object({ id: z.number().min(1).max(64) });

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const body = await req.json();
    const { id } = bodySchema.parse(body);

    const setting = await prisma.setting.findFirst();
    if (setting?.status_jackpot !== 2) return NextResponse.json({ error: 'Bonus game has not started or has ended!' }, { status: 400 });
    const count = await prisma.jackpot.count({ where: { user_id: userId } });
    if (count === 0) return NextResponse.json({ error: 'You are not in this game' }, { status: 400 });

    await prisma.jackpot.updateMany({
      where: { user_id: userId },
      data: {}, // cashHuntNumber/cashHuntSelected not in schema - stub
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Error' }, { status: 400 });
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
