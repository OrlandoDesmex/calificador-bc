'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const ROLE_LABEL: Record<string, string> = {
  admin:          'Administrador',
  gerente_ventas: 'Gerente de Ventas',
  vendedor:       'Vendedor',
};

const ROLE_STYLE: Record<string, string> = {
  admin:          'bg-red-100 text-desmex-red',
  gerente_ventas: 'bg-amber-100 text-amber-700',
  vendedor:       'bg-stone-100 text-stone-600',
};

export default function NavBar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();

  return (
    <header style={{ background: 'linear-gradient(to right, #B71C1C, #7F0000)' }} className="text-white shadow-lg">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="bg-white/20 rounded-lg p-1.5">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="leading-tight">
            <span className="text-xs text-red-200 block" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>DESMEX</span>
            <span className="text-sm font-bold">Calificador BC</span>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Admin link */}
          {userRole === 'admin' && (
            <Link
              href="/admin/usuarios"
              className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                pathname.startsWith('/admin')
                  ? 'bg-white/25 text-white'
                  : 'text-red-200 hover:bg-white/15 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              Usuarios
            </Link>
          )}

          {/* User info */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-right min-w-0 hidden sm:block">
              <div className="text-xs font-medium text-white truncate max-w-[120px]">{userName}</div>
              <div className={`text-xs px-1.5 py-0.5 rounded font-medium inline-block mt-0.5 ${ROLE_STYLE[userRole] ?? 'bg-white/20 text-white'}`}>
                {ROLE_LABEL[userRole] ?? userRole}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Cerrar sesión"
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 transition flex-shrink-0"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
