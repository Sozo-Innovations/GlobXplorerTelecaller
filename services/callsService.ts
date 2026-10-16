// Powered by OnSpace.AI
import { StorageKeys, readJson, writeJson } from './storage';
import { Outcome } from '@/constants/outcomes';

export type CallEntry = {
  id: string;
  leadId: string;
  leadName: string;
  phone: string;
  userId: string;
  startedAt: string;
  durationSec: number;
  outcome?: Outcome;
  note?: string;
  followUpAt?: string;
  recordingUri?: string;
};

export async function getCalls(): Promise<CallEntry[]> {
  return readJson<CallEntry[]>(StorageKeys.CALLS, []);
}

export async function logCallStart(partial: Omit<CallEntry, 'id' | 'durationSec'>): Promise<CallEntry> {
  const entry: CallEntry = {
    ...partial,
    id: 'c' + Date.now(),
    durationSec: 0,
  };
  const all = await getCalls();
  await writeJson(StorageKeys.CALLS, [entry, ...all]);
  return entry;
}

export async function finalizeCall(id: string, patch: Partial<CallEntry>): Promise<void> {
  const all = await getCalls();
  const next = all.map((c) => (c.id === id ? { ...c, ...patch } : c));
  await writeJson(StorageKeys.CALLS, next);
}

export async function removeCall(id: string): Promise<void> {
  const all = await getCalls();
  await writeJson(StorageKeys.CALLS, all.filter((c) => c.id !== id));
}

// Mock "read phone call log" — in real app this would use native call log API.
// Returns a plausible duration based on elapsed time since start.
export async function readLatestCallLogDuration(startedAtIso: string): Promise<number> {
  const started = new Date(startedAtIso).getTime();
  const now = Date.now();
  const elapsed = Math.max(0, Math.round((now - started) / 1000));
  // Clamp to reasonable call duration
  return Math.min(elapsed, 1800);
}
