import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const COLORS = ['1', '2', '5', 'dice', 'lucky', 'boom'];

export async function POST() {
  try {
    const wheel = await prisma.boomCity.findMany();
    const info = COLORS.map((coeff) => {
      const forCoff = wheel.filter((w) => String(w.coeff) === String(coeff));
      const uniqueUsers = new Set(forCoff.map((w) => w.user_id));
      const sum = forCoff.reduce((s, w) => s + Number(w.bet), 0);
      return { coeff, players: uniqueUsers.size, sum };
    });
    return NextResponse.json({ success: wheel, info });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
