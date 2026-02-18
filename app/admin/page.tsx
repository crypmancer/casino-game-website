import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.admin !== 1) redirect('/');

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin panel</h1>
      <p><Link href="/">← Back to home</Link></p>
      <ul style={{ marginTop: '1rem', listStyle: 'none' }}>
        <li><Link href="/admin/users" style={{ color: '#a78bfa' }}>Users</Link></li>
        <li><Link href="/admin/withdraws" style={{ color: '#a78bfa' }}>Withdrawals</Link></li>
        <li><Link href="/admin/settings" style={{ color: '#a78bfa' }}>Settings</Link></li>
      </ul>
      <p style={{ marginTop: '2rem', color: '#71717a' }}>Admin API routes live in app/api/admin/.</p>
    </div>
  );
}
