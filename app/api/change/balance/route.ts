import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const bodySchema = z.object({ type: z.union([z.literal(0), z.literal(1)]) });

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const body = await req.json();
    const { type } = bodySchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ success: false, mess: 'User not found' }, { status: 404 });

    // Check active games (simplified - can add caches later)
    const [crashCount, wheelCount, x100Count] = await Promise.all([
      prisma.crash.count({ where: { user_id: userId } }),
      prisma.wheel.count({ where: { user_id: userId } }),
      prisma.x100.count({ where: { user_id: userId } }),
    ]);
    const gamesOn = crashCount + wheelCount + x100Count;
    if (gamesOn > 0) {
      return NextResponse.json({ success: false, mess: 'You have active games' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { type_balance: type },
    });

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true, demo_balance: true, type_balance: true },
    });
    const balance = updated!.type_balance === 0 ? Number(updated!.balance) : Number(updated!.demo_balance);
    return NextResponse.json({ success: true, balance });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, mess: 'Invalid data' }, { status: 400 });
    }
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
