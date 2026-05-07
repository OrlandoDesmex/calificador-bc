import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { readUsers, writeUsers, nextId } from '@/lib/usersDb';

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== 'admin') return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'No autorizado' }, { status: 403 });
  try {
    const users = (await readUsers()).map(({ password: _, ...u }) => u);
    return Response.json({ items: users });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
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

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });

  const { name, email, password, role } = parsed.data;

  try {
    const users = await readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return Response.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
    }
    const newUser = {
      id:       nextId(users),
      name,
      email:    email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role,
    };
    await writeUsers([...users, newUser]);
    const { password: _, ...safe } = newUser;
    return Response.json({ user: safe }, { status: 201 });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
