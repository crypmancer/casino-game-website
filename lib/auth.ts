import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/', error: '/' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) return null;
        const ok = await compare(credentials.password, user.password);
        if (!ok) return null;
        if (user.ban === 1) return null;
        return {
          id: String(user.id),
          email: user.email ?? undefined,
          name: user.name,
          image: user.avatar ?? undefined,
          admin: user.admin,
          type_balance: user.type_balance,
          balance: String(user.balance),
          demo_balance: String(user.demo_balance),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.admin = (user as { admin?: number }).admin ?? 0;
        token.type_balance = (user as { type_balance?: number }).type_balance ?? 0;
        token.balance = (user as { balance?: string }).balance;
        token.demo_balance = (user as { demo_balance?: string }).demo_balance;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { admin?: number }).admin = token.admin as number;
        (session.user as { type_balance?: number }).type_balance = token.type_balance as number;
        (session.user as { balance?: string }).balance = token.balance as string;
        (session.user as { demo_balance?: string }).demo_balance = token.demo_balance as string;
      }
      return session;
    },
  },
};
