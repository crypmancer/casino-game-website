import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/get-session';
import { redis } from '@/lib/redis';

export async function POST() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    if (!redis) return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
    const start = await redis.get(`minesGame.user.${userId}.start`);
    if (!start || start === '0') return NextResponse.json({ success: false, mess: 'Error' });
    const gameRaw = await redis.get(`minesGame.user.${userId}.game`);
    if (!gameRaw) return NextResponse.json({ success: false, mess: 'Error' });
    const game = JSON.parse(gameRaw);
    return NextResponse.json({ success: true, bet: game.bet, level: game.level, click: game.click ?? [], coeff: game.coeff ?? 1 });
  } catch (e) {
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
