import { NextResponse } from 'next/server';

export async function GET() {
  const num = Math.floor(Math.random() * 100);
  const x100Data: Record<number, string> = {
    26: '100', 61: '20', 42: '20', 8: '20', 72: '20',
    4: '15', 10: '15', 16: '15', 36: '15', 54: '15', 66: '15', 76: '15',
    19: '10', 22: '10', 30: '10', 46: '10', 50: '10', 60: '10', 68: '10', 80: '10', 86: '10', 92: '10',
  };
  const coff = x100Data[num] ?? '2';
  return NextResponse.json({ number: num, coff, random: String(Date.now()), signature: '' });
}
