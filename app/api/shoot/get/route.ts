import { NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

export async function POST() {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ success: false, mess: 'Please log in' }, { status: 401 });
  return NextResponse.json({ success: false, mess: 'No active game' });
}
