import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { join } from 'path';

type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
};

function loadUsers(): StoredUser[] {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'users.json'), 'utf-8')) as StoredUser[];
  } catch {
    return [];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',      type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const email    = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const users = loadUsers();
        const user  = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as StoredUser).role;
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role as string;
      return session;
    },
  },
  pages:   { signIn: '/login' },
  session: { strategy: 'jwt' },
});
