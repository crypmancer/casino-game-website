import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const COLORS = [2, 3, 5, 7, 14, 30];

export async function POST() {
  try {
    const [wheels, history] = await Promise.all([
      prisma.wheel.findMany(),
      prisma.wheelHistory.findMany({
        orderBy: { id: 'desc' },
        take: 50,
        select: { id: true, coff: true, number: true, random: true, signature: true },
      }),
    ]);

    const info = COLORS.map((coff) => {
      const forCoff = wheels.filter((w) => w.coff === coff);
      const uniqueUsers = new Set(forCoff.map((w) => w.user_id));
      const sum = forCoff.reduce((s, w) => s + Number(w.bet), 0);
      return { coff, players: uniqueUsers.size, sum };
    });

    return NextResponse.json({ success: wheels, info, history });
  } catch (e) {
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
