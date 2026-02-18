import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { id: 'desc' },
      take: 100,
    });
    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(new Set(messages.map((m) => m.user_id))) } },
      select: { id: true, name: true, avatar: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
    const list = messages.reverse().map((m) => ({
      id: m.id,
      user_id: m.user_id,
      message: m.message,
      created_at: m.created_at,
      name: userMap[m.user_id]?.name,
      avatar: userMap[m.user_id]?.avatar,
    }));
    return NextResponse.json({ success: true, messages: list });
  } catch (e) {
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
