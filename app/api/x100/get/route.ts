import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const COLORS = [2, 3, 10, 15, 20, 100];

export async function POST() {
  try {
    const [x100s, history] = await Promise.all([
      prisma.x100.findMany(),
      prisma.x100History.findMany({
        orderBy: { id: 'desc' },
        take: 50,
        select: { id: true, coff: true, number: true, random: true, signature: true },
      }),
    ]);
    const info = COLORS.map((coff) => {
      const forCoff = x100s.filter((w) => w.coff === coff);
      const uniqueUsers = new Set(forCoff.map((w) => w.user_id));
      const sum = forCoff.reduce((s, w) => s + Number(w.bet), 0);
      return { coff, players: uniqueUsers.size, sum };
    });
    return NextResponse.json({ success: x100s, info, history });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
