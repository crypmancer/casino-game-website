import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Wheel x30: 0-29 map to coefficients. Match Laravel doubleData.
const DOUBLE_DATA: Record<number, string> = {
  0: '30', 1: '7', 2: '3', 3: '2', 4: '3', 5: '2', 6: '5', 7: '3', 8: '2', 9: '5',
  10: '2', 11: '14', 12: '2', 13: '3', 14: '2', 15: 'bonus', 16: '7', 17: '5', 18: '2', 19: '5',
  20: '7', 21: '2', 22: '14', 23: '2', 24: '3', 25: '5', 26: '7', 27: '3', 28: '2', 29: '3',
};

export async function GET() {
  try {
    const num = Math.floor(Math.random() * 30);
    const coff = DOUBLE_DATA[num] ?? '2';
    return NextResponse.json({ number: num, coff, random: String(Date.now()), signature: '' });
  } catch (e) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
