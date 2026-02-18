import { NextResponse } from 'next/server';

/** Promo code generation is disabled. */
export async function POST() {
  return NextResponse.json(
    { error: 'Promo codes are disabled' },
    { status: 400 }
  );
}
