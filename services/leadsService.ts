// Powered by OnSpace.AI
import { StorageKeys, readJson, writeJson } from './storage';

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  course: string;
  intake: string;
  budget: string;
  assignedTo: string | null; // user id
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'closed';
  lastOutcome?: string;
  lastContactedAt?: string;
  consentRecording: boolean;
  createdAt: string;
};

export type Student = {
  id: string;
  leadId: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  course: string;
  intake: string;
  convertedBy: string;
  convertedAt: string;
};

const SAMPLE_LEADS: Omit<Lead, 'id' | 'assignedTo' | 'createdAt'>[] = [
  {
    name: 'Ravi Kumar',
    phone: '+919876543210',
    email: 'ravi.kumar@gmail.com',
    country: 'Canada',
    course: 'MS Computer Science',
    intake: 'Fall 2026',
    budget: '₹25-30 L',
    status: 'new',
    consentRecording: true,
  },
  {
    name: 'Ananya Reddy',
    phone: '+919812345678',
    email: 'ananya.reddy@yahoo.com',
    country: 'UK',
    course: 'MBA',
    intake: 'Jan 2027',
    budget: '₹35-40 L',
    status: 'contacted',
    consentRecording: true,
  },
  {
    name: 'Imran Sheikh',
    phone: '+919988776655',
    email: 'imran.sheikh@outlook.com',
    country: 'Australia',
    course: 'MS Data Science',
    intake: 'Fall 2026',
    budget: '₹30-35 L',
    status: 'interested',
    consentRecording: false,
  },
  {
    name: 'Meera Nair',
    phone: '+919765432109',
    email: 'meera.nair@gmail.com',
    country: 'USA',
    course: 'MS AI & ML',
    intake: 'Fall 2026',
    budget: '₹40-50 L',
    status: 'new',
    consentRecording: true,
  },
  {
    name: 'Karthik Rao',
    phone: '+919654321098',
    email: 'karthik.rao@gmail.com',
    country: 'Germany',
    course: 'MS Mechanical Engineering',
    intake: 'Summer 2026',
    budget: '₹15-20 L',
    status: 'contacted',
    consentRecording: true,
  },
];

export async function seedLeadsIfEmpty(currentUserId: string): Promise<void> {
  const seeded = await readJson<boolean>(StorageKeys.SEEDED, false);
  if (seeded) return;
  const now = new Date();
  const leads: Lead[] = SAMPLE_LEADS.map((l, idx) => ({
    ...l,
    id: 'l' + (idx + 1),
    assignedTo: idx % 2 === 0 ? currentUserId : null,
    createdAt: new Date(now.getTime() - idx * 86400000).toISOString(),
  }));
  await writeJson(StorageKeys.LEADS, leads);
  await writeJson(StorageKeys.SEEDED, true);
}

export async function getAllLeads(): Promise<Lead[]> {
  return readJson<Lead[]>(StorageKeys.LEADS, []);
}

export async function getMyLeads(userId: string): Promise<Lead[]> {
  const all = await getAllLeads();
  return all.filter((l) => l.assignedTo === userId);
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const all = await getAllLeads();
  return all.find((l) => l.id === id) ?? null;
}

export async function addLead(data: Omit<Lead, 'id' | 'createdAt' | 'status'>): Promise<Lead> {
  const all = await getAllLeads();
  const lead: Lead = {
    ...data,
    id: 'l' + Date.now(),
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  await writeJson(StorageKeys.LEADS, [lead, ...all]);
  return lead;
}

export async function updateLead(id: string, patch: Partial<Lead>): Promise<void> {
  const all = await getAllLeads();
  const next = all.map((l) => (l.id === id ? { ...l, ...patch } : l));
  await writeJson(StorageKeys.LEADS, next);
}

export async function removeLead(id: string): Promise<void> {
  const all = await getAllLeads();
  await writeJson(StorageKeys.LEADS, all.filter((l) => l.id !== id));
}

export async function bulkAddLeads(rows: Array<Partial<Lead>>, assignedTo: string | null): Promise<number> {
  const all = await getAllLeads();
  const toAdd: Lead[] = rows
    .filter((r) => r.name && r.phone)
    .map((r, idx) => ({
      id: 'l' + Date.now() + idx,
      name: r.name!,
      phone: r.phone!,
      email: r.email ?? '',
      country: r.country ?? '',
      course: r.course ?? '',
      intake: r.intake ?? '',
      budget: r.budget ?? '',
      status: 'new',
      assignedTo,
      consentRecording: false,
      createdAt: new Date().toISOString(),
    }));
  await writeJson(StorageKeys.LEADS, [...toAdd, ...all]);
  return toAdd.length;
}

export async function convertToStudent(leadId: string, convertedBy: string): Promise<Student | null> {
  const lead = await getLeadById(leadId);
  if (!lead) return null;
  const student: Student = {
    id: 's' + Date.now(),
    leadId: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    country: lead.country,
    course: lead.course,
    intake: lead.intake,
    convertedBy,
    convertedAt: new Date().toISOString(),
  };
  const students = await readJson<Student[]>(StorageKeys.STUDENTS, []);
  await writeJson(StorageKeys.STUDENTS, [student, ...students]);
  await removeLead(leadId);
  return student;
}

export async function getStudents(): Promise<Student[]> {
  return readJson<Student[]>(StorageKeys.STUDENTS, []);
}

export function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? '';
    });
    return row;
  });
}
