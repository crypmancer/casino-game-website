import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { getHistoryBalance } from '@/lib/redis';

export async function POST() {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);
    const history = await getHistoryBalance(userId);
    return NextResponse.json({ success: true, history: history.reverse() });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
