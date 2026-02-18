import { NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({ name: z.string().min(1) });

/** Promo codes are disabled. Returns a clear message so clients do not rely on activation. */
export async function POST(req: Request) {
  try {
    await bodySchema.parse(await req.json());
    return NextResponse.json(
      { success: false, mess: 'Promo codes are disabled' },
      { status: 400 }
    );
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ success: false, mess: 'Invalid data' }, { status: 400 });
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
