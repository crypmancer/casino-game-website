import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Response(JSON.stringify({ success: false, mess: 'Please log in' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return session;
}
