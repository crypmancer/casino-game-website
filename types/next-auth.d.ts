import 'next-auth';

declare module 'next-auth' {
  interface User {
    id?: string;
    admin?: number;
    type_balance?: number;
    balance?: string;
    demo_balance?: string;
  }

  interface Session {
    user: User & {
      id: string;
      admin: number;
      type_balance: number;
      balance: string;
      demo_balance: string;
    };
  }
}
