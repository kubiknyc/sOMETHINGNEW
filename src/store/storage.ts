import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MaterialList } from '../types';

const STORAGE_KEY = '@site-materials/lists';

/** Load all lists from device storage. Returns [] on first run or on error. */
export async function loadLists(): Promise<MaterialList[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MaterialList[]) : [];
  } catch (err) {
    console.warn('Failed to load lists', err);
    return [];
  }
}

/** Persist all lists to device storage. */
export async function saveLists(lists: MaterialList[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch (err) {
    console.warn('Failed to save lists', err);
  }
}
