import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const page = Math.max(1, Number(body.page) || 1);
    const perPage = Math.min(50, Math.max(5, Number(body.perPage) || 15));
    const skip = (page - 1) * perPage;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: perPage,
        orderBy: { id: 'desc' },
        select: { id: true, name: true, email: true, balance: true, demo_balance: true, admin: true, ban: true, created_at: true },
      }),
      prisma.user.count(),
    ]);
    return NextResponse.json({ success: true, users, total, page, perPage });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
