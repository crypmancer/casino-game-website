import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Stub: process Keno wins when game server calls this
    await prisma.setting.updateMany({ data: { numberBonusKeno: 0, coeffBonusKeno: 0 } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
