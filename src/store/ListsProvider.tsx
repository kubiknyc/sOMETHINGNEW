import * as Crypto from 'expo-crypto';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { MaterialItem, MaterialList } from '../types';
import { loadLists, saveLists } from './storage';

type NewItem = {
  name: string;
  quantity?: number;
  unit?: string;
  note?: string;
};

type ListsContextValue = {
  lists: MaterialList[];
  loading: boolean;
  getList: (id: string) => MaterialList | undefined;
  createList: (name: string) => MaterialList;
  renameList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  addItem: (listId: string, item: NewItem) => void;
  updateItem: (listId: string, itemId: string, patch: Partial<MaterialItem>) => void;
  toggleItem: (listId: string, itemId: string) => void;
  deleteItem: (listId: string, itemId: string) => void;
};

const ListsContext = createContext<ListsContextValue | null>(null);

function uid(): string {
  return Crypto.randomUUID();
}

export function ListsProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = useState<MaterialList[]>([]);
  const [loading, setLoading] = useState(true);
  const hydrated = useRef(false);

  // Load once on mount.
  useEffect(() => {
    let active = true;
    loadLists().then((loaded) => {
      if (!active) return;
      setLists(loaded);
      setLoading(false);
      hydrated.current = true;
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist on every change, but only after the initial load to avoid
  // overwriting stored data with the empty initial state.
  useEffect(() => {
    if (!hydrated.current) return;
    saveLists(lists);
  }, [lists]);

  const getList = useCallback(
    (id: string) => lists.find((l) => l.id === id),
    [lists],
  );

  const createList = useCallback((name: string) => {
    const now = Date.now();
    const list: MaterialList = {
      id: uid(),
      name: name.trim() || 'Untitled list',
      items: [],
      createdAt: now,
      updatedAt: now,
    };
    setLists((prev) => [list, ...prev]);
    return list;
  }, []);

  const renameList = useCallback((id: string, name: string) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, name: name.trim() || l.name, updatedAt: Date.now() }
          : l,
      ),
    );
  }, []);

  const deleteList = useCallback((id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const addItem = useCallback((listId: string, item: NewItem) => {
    const newItem: MaterialItem = {
      id: uid(),
      name: item.name.trim(),
      quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
      unit: (item.unit ?? '').trim(),
      checked: false,
      note: item.note?.trim() || undefined,
    };
    if (!newItem.name) return;
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? { ...l, items: [...l.items, newItem], updatedAt: Date.now() }
          : l,
      ),
    );
  }, []);

  const updateItem = useCallback(
    (listId: string, itemId: string, patch: Partial<MaterialItem>) => {
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? {
                ...l,
                items: l.items.map((it) =>
                  it.id === itemId ? { ...it, ...patch } : it,
                ),
                updatedAt: Date.now(),
              }
            : l,
        ),
      );
    },
    [],
  );

  const toggleItem = useCallback((listId: string, itemId: string) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: l.items.map((it) =>
                it.id === itemId ? { ...it, checked: !it.checked } : it,
              ),
              updatedAt: Date.now(),
            }
          : l,
      ),
    );
  }, []);

  const deleteItem = useCallback((listId: string, itemId: string) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: l.items.filter((it) => it.id !== itemId),
              updatedAt: Date.now(),
            }
          : l,
      ),
    );
  }, []);

  const value = useMemo<ListsContextValue>(
    () => ({
      lists,
      loading,
      getList,
      createList,
      renameList,
      deleteList,
      addItem,
      updateItem,
      toggleItem,
      deleteItem,
    }),
    [
      lists,
      loading,
      getList,
      createList,
      renameList,
      deleteList,
      addItem,
      updateItem,
      toggleItem,
      deleteItem,
    ],
  );

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}

export function useLists(): ListsContextValue {
  const ctx = useContext(ListsContext);
  if (!ctx) {
    throw new Error('useLists must be used within a ListsProvider');
  }
  return ctx;
}
