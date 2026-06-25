import type { MaterialItem, MaterialList } from '../types';

export type NewItem = {
  name: string;
  quantity?: number;
  unit?: string;
  note?: string;
};

/** Normalize raw input into a stored item. Returns null when the name is empty. */
export function buildItem(input: NewItem, id: string): MaterialItem | null {
  const name = input.name.trim();
  if (!name) return null;
  return {
    id,
    name,
    quantity: input.quantity && input.quantity > 0 ? input.quantity : 1,
    unit: (input.unit ?? '').trim(),
    checked: false,
    note: input.note?.trim() || undefined,
  };
}

export function buildList(name: string, id: string, now: number): MaterialList {
  return {
    id,
    name: name.trim() || 'Untitled list',
    items: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** New lists go to the top. */
export function prependList(lists: MaterialList[], list: MaterialList): MaterialList[] {
  return [list, ...lists];
}

export function renameList(
  lists: MaterialList[],
  id: string,
  name: string,
  now: number,
): MaterialList[] {
  return lists.map((l) =>
    l.id === id ? { ...l, name: name.trim() || l.name, updatedAt: now } : l,
  );
}

export function deleteList(lists: MaterialList[], id: string): MaterialList[] {
  return lists.filter((l) => l.id !== id);
}

/** Apply a transform to a single list's items and bump its updatedAt. */
function mapItems(
  lists: MaterialList[],
  listId: string,
  now: number,
  fn: (items: MaterialItem[]) => MaterialItem[],
): MaterialList[] {
  return lists.map((l) =>
    l.id === listId ? { ...l, items: fn(l.items), updatedAt: now } : l,
  );
}

export function addItem(
  lists: MaterialList[],
  listId: string,
  item: MaterialItem,
  now: number,
): MaterialList[] {
  return mapItems(lists, listId, now, (items) => [...items, item]);
}

export function updateItem(
  lists: MaterialList[],
  listId: string,
  itemId: string,
  patch: Partial<MaterialItem>,
  now: number,
): MaterialList[] {
  return mapItems(lists, listId, now, (items) =>
    items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
  );
}

export function toggleItem(
  lists: MaterialList[],
  listId: string,
  itemId: string,
  now: number,
): MaterialList[] {
  return mapItems(lists, listId, now, (items) =>
    items.map((it) => (it.id === itemId ? { ...it, checked: !it.checked } : it)),
  );
}

export function deleteItem(
  lists: MaterialList[],
  listId: string,
  itemId: string,
  now: number,
): MaterialList[] {
  return mapItems(lists, listId, now, (items) => items.filter((it) => it.id !== itemId));
}
