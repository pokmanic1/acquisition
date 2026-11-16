'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { Alert, Avatar, Icon, RoleBadge, Spinner } from '@/components/ui';

const fmt = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Dashboard() {
  const router = useRouter();
  const { user, ready, updateSelf, signOut } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.users();
      setUsers(res.users);
    } catch (e) {
      if (e.status === 401) {
        await signOut();
        router.push('/sign-in');
        return;
      }
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [router, signOut]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.push('/sign-in');
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user?.id]);

  const flash = msg => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const filtered = useMemo(
    () =>
      users
        .filter(u => roleFilter === 'all' || u.role === roleFilter)
        .filter(u => `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => a.id - b.id),
    [users, query, roleFilter]
  );

  if (!ready || !user) return null;

  const isAdmin = user.role === 'admin';
  const admins = users.filter(u => u.role === 'admin').length;
  const newest = users.reduce((a, u) => (!a || new Date(u.created_at) > new Date(a.created_at) ? u : a), null);
  const canManage = u => isAdmin || u.id === user.id;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-[calc(100vh-52px)] bg-paper">
      <div className="rise mx-auto max-w-[1080px] px-5 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[17px] text-mute">
              {greeting}, {user.name.split(' ')[0]}.
            </p>
            <h1 className="headline mt-1 text-[40px] leading-tight sm:text-[48px]">Users</h1>
          </div>
          <button onClick={load} className="btn-quiet bg-white! shadow-sm hover:bg-white/70!">
            {loading ? <Spinner light={false} /> : <Icon d={['M20 11a8 8 0 1 0-2.3 5.7', 'M20 5v6h-6']} className="size-4" stroke={2} />}
            Refresh
          </button>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total users" value={users.length} />
          <Stat label="Administrators" value={admins} />
          <Stat label="Members" value={users.length - admins} />
          <Stat label="Newest member" value={newest?.name.split(' ')[0] ?? '—'} sub={newest ? `Joined ${fmt(newest.created_at)}` : ''} />
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-[14px] text-ink-2 shadow-sm">
          <span
            className={`grid size-8 shrink-0 place-items-center rounded-full ${isAdmin ? 'bg-[#f3ecff] text-[#7a3ee0]' : 'bg-[#e8f2ff] text-[#0066cc]'}`}
          >
            <Icon d={['M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z']} className="size-4" stroke={2} />
          </span>
          <span>
            <span className="font-medium text-ink">Signed in as {isAdmin ? 'administrator' : 'member'}.</span>{' '}
            {isAdmin
              ? 'You can edit any account, change roles and remove users.'
              : 'You can view everyone, and edit or delete only your own account.'}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <Alert>{error}</Alert>
          <Alert kind="success">{notice}</Alert>
        </div>

        <div className="tile mt-5 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-6 py-5">
            <div className="relative w-full max-w-[280px]">
              <Icon d={['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'm20 20-3.5-3.5']} className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mute-2" stroke={2} />
              <input className="input rounded-[10px]! border-0! bg-paper! py-2! pl-9! text-[14px]!" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <div className="segmented">
              {['all', 'admin', 'user'].map(r => (
                <button key={r} data-active={roleFilter === r} onClick={() => setRoleFilter(r)}>
                  {r === 'all' ? 'All' : r === 'admin' ? 'Admins' : 'Members'}
                </button>
              ))}
            </div>
            <span className="ml-auto text-[13px] text-mute">
              {filtered.length} of {users.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="border-y border-hair bg-[#fafafc] text-[12px] text-mute">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 font-medium">Last updated</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {loading && !users.length ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-mute">
                      Loading…
                    </td>
                  </tr>
                ) : (
                  filtered.map(u => (
                    <tr key={u.id} className="group transition hover:bg-[#fafafc]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <Avatar name={u.name} size="size-10" />
                          <div>
                            <div className="font-medium text-ink">
                              {u.name}
                              {u.id === user.id && <span className="ml-2 text-[12px] font-normal text-mute-2">(you)</span>}
                            </div>
                            <div className="text-[13px] text-mute">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-6 py-4 text-ink-2">{fmt(u.created_at)}</td>
                      <td className="px-6 py-4 text-ink-2">{fmt(u.updated_at)}</td>
                      <td className="px-6 py-4">
                        {canManage(u) ? (
                          <div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100">
                            <button onClick={() => setEditing(u)} className="rounded-full px-3 py-1.5 text-[13px] text-link transition hover:bg-[#e8f2ff]">
                              Edit
                            </button>
                            <button onClick={() => setDeleting(u)} className="rounded-full px-3 py-1.5 text-[13px] text-[#c4112f] transition hover:bg-[#fff2f2]">
                              Delete
                            </button>
                          </div>
                        ) : (
                          <div className="text-right text-[12px] text-mute-2">View only</div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
                {!loading && !filtered.length && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-mute">
                      No results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editing && (
        <EditModal
          target={editing}
          isAdmin={isAdmin}
          onClose={() => setEditing(null)}
          onSaved={updated => {
            setUsers(list => list.map(u => (u.id === updated.id ? updated : u)));
            if (updated.id === user.id) updateSelf({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
            setEditing(null);
            flash(`${updated.name} was updated.`);
          }}
        />
      )}

      {deleting && (
        <ConfirmDelete
          target={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={async id => {
            setDeleting(null);
            if (id === user.id) {
              await signOut();
              router.push('/sign-up');
              return;
            }
            setUsers(list => list.filter(u => u.id !== id));
            flash('User removed.');
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="tile p-6">
      <div className="text-[13px] text-mute">{label}</div>
      <div className="headline mt-2 text-[40px] leading-none">{value}</div>
      {sub && <div className="mt-2 text-[12px] text-mute-2">{sub}</div>}
    </div>
  );
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-5 backdrop-blur-md" onClick={onClose}>
      <div className="rise w-full max-w-[420px] rounded-[24px] bg-white p-7 shadow-[0_30px_80px_rgba(0,0,0,0.25)] [animation-duration:0.35s]" onClick={e => e.stopPropagation()}>
        <h2 className="headline text-[24px]">{title}</h2>
        {subtitle && <p className="mt-1 text-[14px] text-mute">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

function EditModal({ target, isAdmin, onClose, onSaved }) {
  const [form, setForm] = useState({ name: target.name, email: target.email, role: target.role });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async e => {
    e.preventDefault();
    const changes = Object.fromEntries(Object.entries(form).filter(([k, v]) => v !== target[k]));
    if (!Object.keys(changes).length) return onClose();
    setSaving(true);
    setError('');
    try {
      const res = await api.updateUser(target.id, changes);
      onSaved(res.user);
    } catch (err) {
      setError(err.body?.details || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit profile" subtitle={`User #${target.id}`} onClose={onClose}>
      <form onSubmit={save} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-ink-2">Name</span>
          <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </label>
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-ink-2">Email</span>
          <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </label>
        <div>
          <span className="mb-2 flex justify-between text-[13px] font-medium text-ink-2">
            Role {!isAdmin && <span className="font-normal text-mute-2">Admins only</span>}
          </span>
          <div className={`segmented w-full ${!isAdmin ? 'pointer-events-none opacity-50' : ''}`}>
            {['user', 'admin'].map(r => (
              <button type="button" key={r} data-active={form.role === r} onClick={() => setForm(f => ({ ...f, role: r }))} className="flex-1">
                {r}
              </button>
            ))}
          </div>
        </div>
        <Alert>{error}</Alert>
        <div className="flex gap-3 pt-3">
          <button type="button" onClick={onClose} className="btn-quiet flex-1 py-2.5!">
            Cancel
          </button>
          <button className="btn-primary flex-1" disabled={saving}>
            {saving && <Spinner />} Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ConfirmDelete({ target, onClose, onDeleted }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await api.deleteUser(target.id);
      onDeleted(target.id);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={`Delete ${target.name}?`} subtitle={`${target.email} will be removed permanently. This can’t be undone.`} onClose={onClose}>
      <div className="mt-4">
        <Alert>{error}</Alert>
      </div>
      <div className="mt-6 flex gap-3">
        <button onClick={onClose} className="btn-quiet flex-1 py-2.5!">
          Cancel
        </button>
        <button onClick={remove} disabled={busy} className="btn-primary flex-1 bg-[#e30000]! hover:bg-[#c40000]!">
          {busy && <Spinner />} Delete
        </button>
      </div>
    </Modal>
  );
}
