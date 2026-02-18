import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { z } from 'zod';

const bodySchema = z.object({ message: z.string().min(1).max(500) });

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const body = await req.json();
    const { message } = bodySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, avatar: true, ban: true },
    });
    if (!user || user.ban === 1) {
      return NextResponse.json({ success: false, mess: 'Error' }, { status: 403 });
    }

    const msg = await prisma.message.create({
      data: { user_id: userId, message },
    });

    const payload = JSON.stringify({
      id: msg.id,
      user_id: userId,
      name: user.name,
      avatar: user.avatar,
      message,
      created_at: msg.created_at,
    });
    if (redis) await redis.publish('message', payload);

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, mess: 'Invalid data' }, { status: 400 });
    }
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
