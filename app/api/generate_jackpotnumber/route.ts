import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const r = Math.floor(Math.random() * 100);
    await prisma.setting.updateMany({
      data: {
        jackpot_rand: r,
        jackpot_random: String(Date.now()),
        jackpot_signature: '',
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
