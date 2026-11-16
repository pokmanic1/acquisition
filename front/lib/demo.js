// In-browser stand-in for the Express API, used when the backend is not
// reachable (or demo mode is switched on). It mirrors the real responses and
// the same permission rules as src/controller/users.controller.js.
const KEY = 'acq-demo-users';

const seed = () => {
  const day = 24 * 60 * 60 * 1000;
  const at = d => new Date(Date.now() - d * day).toISOString();
  return [
    { id: 1, name: 'Admin Acquisitions', email: 'admin@acquisitions.dev', role: 'admin', created_at: at(42), updated_at: at(3) },
    { id: 2, name: 'Ana Popescu', email: 'ana.popescu@mail.com', role: 'user', created_at: at(30), updated_at: at(30) },
    { id: 3, name: 'Mihai Rusu', email: 'mihai.rusu@mail.com', role: 'user', created_at: at(21), updated_at: at(9) },
    { id: 4, name: 'Elena Ceban', email: 'elena.ceban@mail.com', role: 'admin', created_at: at(14), updated_at: at(2) },
    { id: 5, name: 'Andrei Lungu', email: 'andrei.lungu@mail.com', role: 'user', created_at: at(6), updated_at: at(6) },
    { id: 6, name: 'Cristina Moraru', email: 'cristina.moraru@mail.com', role: 'user', created_at: at(1), updated_at: at(1) },
  ];
};

const save = users => {
  try {
    localStorage.setItem(KEY, JSON.stringify(users));
  } catch {}
};

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const users = seed();
  save(users);
  return users;
};

export const resetDemo = () => save(seed());

const reply = (status, body) => ({ status, body });
const startedAt = Date.now() - 3 * 60 * 60 * 1000;
const publicUser = ({ created_at, updated_at, ...rest }) => rest;

export function demoRequest(method, path, body, currentUser) {
  const users = load();

  if (path === '/health') {
    return reply(200, {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: (Date.now() - startedAt) / 1000,
    });
  }

  if (path === '/api/auth/sign-up' && method === 'POST') {
    const errors = [];
    if (!body.name || body.name.trim().length < 2) errors.push('name: Too small: expected string to have >=2 characters');
    if (!/^\S+@\S+\.\S+$/.test(body.email || '')) errors.push('email: Invalid email address');
    if (!body.password || body.password.length < 6) errors.push('password: Too small: expected string to have >=6 characters');
    if (errors.length) return reply(400, { error: 'Validation failed', details: errors.join(', ') });

    const email = body.email.toLowerCase().trim();
    if (users.some(u => u.email === email)) return reply(409, { error: 'Email already exist' });

    const now = new Date().toISOString();
    const user = {
      id: Math.max(0, ...users.map(u => u.id)) + 1,
      name: body.name.trim(),
      email,
      role: body.role || 'user',
      created_at: now,
      updated_at: now,
    };
    save([...users, user]);
    return reply(201, { message: 'User registered', user: publicUser(user) });
  }

  if (path === '/api/auth/sign-in' && method === 'POST') {
    const user = users.find(u => u.email === (body.email || '').toLowerCase().trim());
    if (!user || !body.password) return reply(401, { error: 'Invalid credentials' });
    return reply(200, { message: 'User signed in successfully', user: publicUser(user) });
  }

  if (path === '/api/auth/sign-out') return reply(200, { message: 'User signed out successfully' });

  if (path.startsWith('/api/users')) {
    if (!currentUser) return reply(401, { error: 'Unauthorized', message: 'Authentication required' });

    const id = Number(path.split('/')[3]);
    const isAdmin = currentUser.role === 'admin';
    const isSelf = currentUser.id === id;

    if (!id && method === 'GET') {
      return reply(200, { message: 'Successfully retrieved users', users, count: users.length });
    }

    const target = users.find(u => u.id === id);
    if (!target) return reply(404, { error: 'User not found' });

    if (method === 'GET') return reply(200, { message: 'Successfully retrieved user', user: target });

    if (method === 'PUT') {
      if (!isAdmin && !isSelf) return reply(403, { error: 'Forbidden', message: 'You can only update your own information' });
      if (body.role !== undefined && !isAdmin) return reply(403, { error: 'Forbidden', message: 'Only admins can change user roles' });
      if (body.email && users.some(u => u.email === body.email && u.id !== id)) return reply(409, { error: 'Email already in use' });
      const updated = { ...target, ...body, updated_at: new Date().toISOString() };
      save(users.map(u => (u.id === id ? updated : u)));
      return reply(200, { message: 'User updated successfully', user: updated });
    }

    if (method === 'DELETE') {
      if (!isAdmin && !isSelf) return reply(403, { error: 'Forbidden', message: 'You can only delete your own account' });
      save(users.filter(u => u.id !== id));
      return reply(200, { message: 'User deleted successfully', id });
    }
  }

  return reply(404, { error: 'Not Found', message: 'Route not found' });
}
