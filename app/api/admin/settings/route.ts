import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    await requireAdmin();
    const setting = await prisma.setting.findFirst();
    return NextResponse.json({ success: true, setting });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const first = await prisma.setting.findFirst();
    if (!first) return NextResponse.json({ success: false, mess: 'No settings' }, { status: 400 });
    const { name, theme, crash_bank, status_wheel, status_x100, status_keno, status_jackpot, crash_status } = body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (theme !== undefined) data.theme = theme;
    if (crash_bank !== undefined) data.crash_bank = crash_bank;
    if (status_wheel !== undefined) data.status_wheel = status_wheel;
    if (status_x100 !== undefined) data.status_x100 = status_x100;
    if (status_keno !== undefined) data.status_keno = status_keno;
    if (status_jackpot !== undefined) data.status_jackpot = status_jackpot;
    if (crash_status !== undefined) data.crash_status = crash_status;
    await prisma.setting.update({ where: { id: first.id }, data });
    return NextResponse.json({ success: true, mess: 'Saved' });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
