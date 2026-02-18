import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const status = body.status !== undefined ? Number(body.status) : undefined;
    const page = Math.max(1, Number(body.page) || 1);
    const perPage = 15;
    const skip = (page - 1) * perPage;
    const where = status !== undefined ? { status } : {};
    const [withdraws, total] = await Promise.all([
      prisma.withdraw.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { id: 'desc' },
        include: { user: { select: { id: true, name: true } } },
      }),
      prisma.withdraw.count({ where }),
    ]);
    return NextResponse.json({ success: true, withdraws, total, page });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
