import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    await requireAdmin();
    const promo = await prisma.promo.findMany({ orderBy: { id: 'desc' }, take: 50 });
    return NextResponse.json({ success: true, promo });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
