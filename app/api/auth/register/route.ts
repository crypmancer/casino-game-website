import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const bodySchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = bodySchema.parse(body);

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ success: false, mess: 'Email already taken' }, { status: 400 });
    }

    const hashed = await hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        balance: 0,
        demo_balance: 0,
        type_balance: 0,
      },
    });
    return NextResponse.json({ success: true, mess: 'Registration successful' });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, mess: 'Invalid data' }, { status: 400 });
    }
    return NextResponse.json({ success: false, mess: 'Error' }, { status: 500 });
  }
}
