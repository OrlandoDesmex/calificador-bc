import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const USERS_PATH = join(process.cwd(), 'users.json');

type StoredUser = { id: string; name: string; email: string; password: string; role: string };

function readUsers(): StoredUser[] {
  return JSON.parse(readFileSync(USERS_PATH, 'utf-8')) as StoredUser[];
}
function writeUsers(users: StoredUser[]) {
  writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8');
}

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== 'admin') return null;
  return session;
}

const updateSchema = z.object({
  name:     z.string().min(2).optional(),
  email:    z.string().email().optional(),
  password: z.string().min(6).optional().or(z.literal('')),
  role:     z.enum(['admin', 'vendedor', 'gerente_ventas']).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 403 });

  const { id } = await params;
  const parsed  = updateSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: 'Datos inválidos' }, { status: 400 });

  const { name, email, password, role } = parsed.data;

  try {
    const users = readUsers();
    const idx   = users.findIndex((u) => u.id === id);
    if (idx === -1) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });

    if (role && role !== 'admin' && users[idx].role === 'admin') {
      if (users.filter((u) => u.role === 'admin').length <= 1) {
        return Response.json({ error: 'Debe existir al menos un administrador' }, { status: 400 });
      }
    }
    if (email && email.toLowerCase() !== users[idx].email.toLowerCase()) {
      if (users.some((u, i) => i !== idx && u.email.toLowerCase() === email.toLowerCase())) {
        return Response.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
      }
    }

    const updated: StoredUser = { ...users[idx] };
    if (name)     updated.name     = name;
    if (email)    updated.email    = email.toLowerCase();
    if (password) updated.password = await bcrypt.hash(password, 10);
    if (role)     updated.role     = role;

    users[idx] = updated;
    writeUsers(users);
    const { password: _, ...safe } = updated;
    return Response.json({ user: safe });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 403 });

  const { id } = await params;
  if (session.user.id === id) {
    return Response.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 });
  }

  try {
    const users  = readUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });

    if (target.role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1) {
      return Response.json({ error: 'Debe existir al menos un administrador' }, { status: 400 });
    }

    writeUsers(users.filter((u) => u.id !== id));
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
