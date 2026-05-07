import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { readUsers } from '@/lib/usersDb';
import UsuariosManager from '@/components/UsuariosManager';
import type { BCUser } from '@/components/UsuariosManager';

export default async function AdminUsuariosPage() {
  const session = await auth();
  if (!session || session.user.role !== 'admin') redirect('/');

  const raw   = await readUsers();
  const users: BCUser[] = raw.map(({ password: _p, ...u }) => ({ ...u, role: u.role as BCUser['role'] }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Gestión de Usuarios</h1>
        <p className="text-sm text-stone-500 mt-0.5">Administra los accesos al Calificador BC</p>
      </div>
      <UsuariosManager initialUsers={users} currentUserId={session.user.id ?? ''} />
    </div>
  );
}
