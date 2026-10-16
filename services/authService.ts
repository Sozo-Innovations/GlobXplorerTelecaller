// Powered by OnSpace.AI
import { StorageKeys, readJson, writeJson } from './storage';

export type User = {
  id: string;
  gxId: string;
  name: string;
  email: string;
  phone: string;
  role: 'telecaller' | 'admin';
  password: string;
};

export type Session = {
  userId: string;
  signedInAt: string;
};

const DEFAULT_USERS: User[] = [
  {
    id: 'u1',
    gxId: 'GX-TC-001',
    name: 'Priya Sharma',
    email: 'priya@globxplorer.com',
    phone: '+919876500001',
    role: 'telecaller',
    password: '123456',
  },
  {
    id: 'u2',
    gxId: 'GX-TC-002',
    name: 'Rahul Verma',
    email: 'rahul@globxplorer.com',
    phone: '+919876500002',
    role: 'telecaller',
    password: '123456',
  },
];

export async function ensureUsers(): Promise<void> {
  const users = await readJson<User[]>(StorageKeys.USERS, []);
  if (users.length === 0) {
    await writeJson(StorageKeys.USERS, DEFAULT_USERS);
  }
}

export async function signIn(identifier: string, password: string): Promise<User | null> {
  await ensureUsers();
  const users = await readJson<User[]>(StorageKeys.USERS, []);
  const id = identifier.trim().toLowerCase();
  const user = users.find(
    (u) =>
      u.gxId.toLowerCase() === id ||
      u.email.toLowerCase() === id ||
      u.phone.replace(/\s/g, '') === id.replace(/\s/g, '')
  );
  if (!user) return null;
  if (user.password !== password) return null;
  const session: Session = { userId: user.id, signedInAt: new Date().toISOString() };
  await writeJson(StorageKeys.SESSION, session);
  return user;
}

export async function signOut(): Promise<void> {
  await writeJson(StorageKeys.SESSION, null);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await readJson<Session | null>(StorageKeys.SESSION, null);
  if (!session) return null;
  const users = await readJson<User[]>(StorageKeys.USERS, []);
  return users.find((u) => u.id === session.userId) ?? null;
}
