import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/' },
});

// Protect only profile and admin; game pages can show "log in to play" inside
export const config = {
  matcher: ['/profile', '/admin/:path*'],
};
