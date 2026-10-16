// Powered by OnSpace.AI
import { StorageKeys, readJson, writeJson } from './storage';

export type Note = {
  id: string;
  leadId: string;
  userId: string;
  userGxId: string;
  text: string;
  attachmentUri?: string;
  attachmentName?: string;
  createdAt: string;
};

export async function getNotes(): Promise<Note[]> {
  return readJson<Note[]>(StorageKeys.NOTES, []);
}

export async function getNotesForLead(leadId: string): Promise<Note[]> {
  const all = await getNotes();
  return all
    .filter((n) => n.leadId === leadId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addNote(data: Omit<Note, 'id' | 'createdAt'>): Promise<Note> {
  const note: Note = { ...data, id: 'n' + Date.now(), createdAt: new Date().toISOString() };
  const all = await getNotes();
  await writeJson(StorageKeys.NOTES, [note, ...all]);
  return note;
}
