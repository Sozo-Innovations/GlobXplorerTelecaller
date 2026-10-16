// Powered by OnSpace.AI
import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  SESSION: 'gx.session',
  USERS: 'gx.users',
  LEADS: 'gx.leads',
  STUDENTS: 'gx.students',
  CALLS: 'gx.calls',
  FOLLOWUPS: 'gx.followups',
  RECORDINGS: 'gx.recordings',
  NOTES: 'gx.notes',
  SEEDED: 'gx.seeded',
};

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.clear();
}
