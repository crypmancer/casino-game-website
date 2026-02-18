import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const list = await prisma.systemWithdraw.findMany({ orderBy: { id: 'asc' } });
    return NextResponse.json({ success: true, systems: list });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
