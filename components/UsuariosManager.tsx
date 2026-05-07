'use client';

import { useState } from 'react';

export type BCRole = 'admin' | 'vendedor' | 'gerente_ventas';

export type BCUser = {
  id: string;
  name: string;
  email: string;
  role: BCRole;
};

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: BCRole;
};

type Mode = 'idle' | 'new' | `edit-${string}` | `del-${string}`;

const ROLE_LABEL: Record<BCRole, string> = {
  admin:          'Administrador',
  gerente_ventas: 'Gerente de Ventas',
  vendedor:       'Vendedor',
};

const ROLE_STYLE: Record<BCRole, string> = {
  admin:          'bg-red-100 text-desmex-red border border-red-200',
  gerente_ventas: 'bg-amber-100 text-amber-700 border border-amber-200',
  vendedor:       'bg-stone-100 text-stone-600 border border-stone-200',
};

const EMPTY_FORM: UserForm = { name: '', email: '', password: '', role: 'vendedor' };

// ── UserFormPanel ─────────────────────────────────────────────────────────────
function UserFormPanel({
  form, setForm, onSave, onCancel, saving, error, isEdit,
}: {
  form: UserForm;
  setForm: (f: UserForm) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string;
  isEdit: boolean;
}) {
  return (
    <div className="bg-desmex-bg border border-desmex-border rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Nombre completo</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej. Juan Pérez"
            className="w-full rounded-lg border border-desmex-border px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-desmex-red/30 focus:border-desmex-red transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="usuario@desmex.com"
            className="w-full rounded-lg border border-desmex-border px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-desmex-red/30 focus:border-desmex-red transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Contraseña {isEdit && <span className="text-stone-400 font-normal">(dejar vacío para no cambiar)</span>}
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={isEdit ? '••••••' : 'Mínimo 6 caracteres'}
            className="w-full rounded-lg border border-desmex-border px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-desmex-red/30 focus:border-desmex-red transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Rol</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as BCRole })}
            className="w-full rounded-lg border border-desmex-border px-3 py-2 text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-desmex-red/30 focus:border-desmex-red transition"
          >
            <option value="vendedor">Vendedor</option>
            <option value="gerente_ventas">Gerente de Ventas</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 bg-desmex-red text-white text-sm font-medium rounded-lg
                     hover:bg-desmex-red-dark transition disabled:opacity-50"
        >
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white border border-desmex-border text-stone-600 text-sm font-medium rounded-lg
                     hover:bg-desmex-bg transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function UsuariosManager({
  initialUsers,
  currentUserId,
}: {
  initialUsers: BCUser[];
  currentUserId: string;
}) {
  const [users,   setUsers]   = useState<BCUser[]>(initialUsers);
  const [mode,    setMode]    = useState<Mode>('idle');
  const [form,    setForm]    = useState<UserForm>(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  function openNew() {
    setForm(EMPTY_FORM);
    setError('');
    setMode('new');
  }

  function openEdit(user: BCUser) {
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setError('');
    setMode(`edit-${user.id}`);
  }

  function openDel(user: BCUser) {
    setError('');
    setMode(`del-${user.id}`);
  }

  function cancel() {
    setMode('idle');
    setError('');
  }

  async function saveNew() {
    setError('');
    if (!form.name.trim() || !form.email.trim()) { setError('Nombre y email son obligatorios'); return; }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }

    setSaving(true);
    try {
      const res  = await fetch('/api/admin/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error al crear usuario'); return; }
      setUsers((u) => [...u, data.user]);
      setMode('idle');
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(id: string) {
    setError('');
    if (!form.name.trim() || !form.email.trim()) { setError('Nombre y email son obligatorios'); return; }
    if (form.password && form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }

    setSaving(true);
    const body: Partial<UserForm> = { name: form.name, email: form.email, role: form.role };
    if (form.password) body.password = form.password;

    try {
      const res  = await fetch(`/api/admin/usuarios/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error al actualizar usuario'); return; }
      setUsers((u) => u.map((x) => (x.id === id ? data.user : x)));
      setMode('idle');
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(id: string) {
    setSaving(true);
    try {
      const res  = await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error al eliminar usuario'); return; }
      setUsers((u) => u.filter((x) => x.id !== id));
      setMode('idle');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">

      {/* Add button */}
      {mode === 'idle' && (
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-desmex-red text-white text-sm font-medium rounded-lg
                     hover:bg-desmex-red-dark transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo usuario
        </button>
      )}

      {/* New user form */}
      {mode === 'new' && (
        <UserFormPanel
          form={form} setForm={setForm}
          onSave={saveNew} onCancel={cancel}
          saving={saving} error={error} isEdit={false}
        />
      )}

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-desmex-border shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">No hay usuarios registrados</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-desmex-border bg-desmex-bg">
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Rol</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-desmex-border">
              {users.map((user) => {
                const isMe     = user.id === currentUserId;
                const editMode = mode === `edit-${user.id}`;
                const delMode  = mode === `del-${user.id}`;

                return (
                  <tr key={user.id} className={editMode || delMode ? 'bg-desmex-bg' : 'hover:bg-desmex-bg/50 transition-colors'}>
                    <td colSpan={editMode ? 4 : 1} className="px-4 py-3">
                      {editMode ? (
                        <UserFormPanel
                          form={form} setForm={setForm}
                          onSave={() => saveEdit(user.id)} onCancel={cancel}
                          saving={saving} error={error} isEdit
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-800">{user.name}</span>
                          {isMe && (
                            <span className="text-xs bg-desmex-border text-stone-500 px-1.5 py-0.5 rounded">tú</span>
                          )}
                        </div>
                      )}
                    </td>
                    {!editMode && (
                      <>
                        <td className="px-4 py-3 text-stone-500 hidden sm:table-cell">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_STYLE[user.role]}`}>
                            {ROLE_LABEL[user.role]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {delMode ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-red-700 mr-1">¿Eliminar?</span>
                              <button
                                onClick={() => deleteUser(user.id)}
                                disabled={saving}
                                className="text-xs px-2 py-1 bg-desmex-red text-white rounded hover:bg-desmex-red-dark transition disabled:opacity-50"
                              >
                                Sí
                              </button>
                              <button onClick={cancel} className="text-xs px-2 py-1 bg-white border border-desmex-border text-stone-600 rounded hover:bg-desmex-bg transition">
                                No
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                onClick={() => openEdit(user)}
                                disabled={mode !== 'idle'}
                                className="p-1.5 text-stone-400 hover:text-desmex-red hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                                title="Editar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                              </button>
                              {!isMe && (
                                <button
                                  onClick={() => openDel(user)}
                                  disabled={mode !== 'idle'}
                                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                                  title="Eliminar"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {error && mode === 'idle' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
    </div>
  );
}
