import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as { admin?: number }).admin !== 1) {
    throw new Response(JSON.stringify({ success: false, mess: 'Access denied' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return session;
}
