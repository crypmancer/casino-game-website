import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Profile</h1>
      <p><strong>Name:</strong> {session.user.name}</p>
      <p><strong>Email:</strong> {session.user.email}</p>
      <p><strong>Balance (real):</strong> {session.user.balance} ₽</p>
      <p><strong>Demo balance:</strong> {session.user.demo_balance} ₽</p>
      <ProfileClient />
      <p style={{ marginTop: '1.5rem' }}><Link href="/">← Back to home</Link></p>
    </div>
  );
}
