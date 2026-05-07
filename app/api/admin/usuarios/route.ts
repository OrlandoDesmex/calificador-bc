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
function nextId(users: StoredUser[]): string {
  return String(users.reduce((m, u) => Math.max(m, parseInt(u.id) || 0), 0) + 1);
}

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== 'admin') return null;
  return session;
}

function fsError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('EROFS') || msg.includes('read-only')) {
    return Response.json({
      error: 'Sistema de archivos de solo lectura en producción. Edita users.json localmente y haz git push.',
    }, { status: 503 });
  }
  return Response.json({ error: msg }, { status: 500 });
}

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'No autorizado' }, { status: 403 });
  try {
    const users = readUsers().map(({ password: _, ...u }) => u);
    return Response.json({ items: users });
  } catch (err) {
    return fsError(err);
  }
}

const createSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(6),
  role:     z.enum(['admin', 'vendedor', 'gerente_ventas']),
});

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'No autorizado' }, { status: 403 });

  const body   = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });

  const { name, email, password, role } = parsed.data;

  try {
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return Response.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
    }
    const newUser: StoredUser = {
      id:       nextId(users),
      name,
      email:    email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role,
    };
    writeUsers([...users, newUser]);
    const { password: _, ...safe } = newUser;
    return Response.json({ user: safe }, { status: 201 });
  } catch (err) {
    return fsError(err);
  }
}
