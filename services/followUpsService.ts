// Powered by OnSpace.AI
import { StorageKeys, readJson, writeJson } from './storage';

export type FollowUp = {
  id: string;
  leadId: string;
  leadName: string;
  phone: string;
  userId: string;
  scheduledAt: string;
  note?: string;
  done: boolean;
};

export async function getFollowUps(): Promise<FollowUp[]> {
  return readJson<FollowUp[]>(StorageKeys.FOLLOWUPS, []);
}

export async function scheduleFollowUp(data: Omit<FollowUp, 'id' | 'done'>): Promise<FollowUp> {
  const fu: FollowUp = { ...data, id: 'f' + Date.now(), done: false };
  const all = await getFollowUps();
  await writeJson(StorageKeys.FOLLOWUPS, [fu, ...all]);
  return fu;
}

export async function completeFollowUp(id: string): Promise<void> {
  const all = await getFollowUps();
  await writeJson(StorageKeys.FOLLOWUPS, all.map((f) => (f.id === id ? { ...f, done: true } : f)));
}

export function groupFollowUps(all: FollowUp[]): { overdue: FollowUp[]; today: FollowUp[]; tomorrow: FollowUp[] } {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + 86400000;
  const endOfTomorrow = endOfToday + 86400000;
  const overdue: FollowUp[] = [];
  const today: FollowUp[] = [];
  const tomorrow: FollowUp[] = [];
  all.filter((f) => !f.done).forEach((f) => {
    const t = new Date(f.scheduledAt).getTime();
    if (t < startOfToday) overdue.push(f);
    else if (t < endOfToday) today.push(f);
    else if (t < endOfTomorrow) tomorrow.push(f);
  });
  return { overdue, today, tomorrow };
}
