import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const jackpot = await prisma.jackpotHistory.findMany({
      orderBy: { id: 'desc' },
      take: 10,
    });
    return NextResponse.json({ success: 'success', jackpot });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
