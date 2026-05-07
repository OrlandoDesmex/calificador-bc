import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import NavBar from '@/components/NavBar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        <NavBar userName={session.user.name ?? session.user.email} userRole={session.user.role} />
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-7">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
