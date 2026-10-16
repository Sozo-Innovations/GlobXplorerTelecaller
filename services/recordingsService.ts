// Powered by OnSpace.AI
import { StorageKeys, readJson, writeJson } from './storage';

export type Recording = {
  id: string;
  leadId: string;
  leadName: string;
  uri: string;
  durationSec: number;
  createdAt: string;
};

export async function getRecordings(): Promise<Recording[]> {
  return readJson<Recording[]>(StorageKeys.RECORDINGS, []);
}

export async function addRecording(data: Omit<Recording, 'id' | 'createdAt'>): Promise<Recording> {
  const rec: Recording = { ...data, id: 'r' + Date.now(), createdAt: new Date().toISOString() };
  const all = await getRecordings();
  await writeJson(StorageKeys.RECORDINGS, [rec, ...all]);
  return rec;
}

export async function removeRecording(id: string): Promise<void> {
  const all = await getRecordings();
  await writeJson(StorageKeys.RECORDINGS, all.filter((r) => r.id !== id));
}

export async function getRecordingsForLead(leadId: string): Promise<Recording[]> {
  const all = await getRecordings();
  return all.filter((r) => r.leadId === leadId);
}
