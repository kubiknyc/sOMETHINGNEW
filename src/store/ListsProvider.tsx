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
import * as ops from './operations';
import type { NewItem } from './operations';
import { loadLists, saveLists } from './storage';

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

/** Generate a unique id for a new list or item. */
function uid(): string {
  return Crypto.randomUUID();
}

/**
 * App-wide store for materials lists. Hydrates from device storage on mount and
 * persists every change back to it, exposing list/item actions via context.
 */
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
    const list = ops.buildList(name, uid(), Date.now());
    setLists((prev) => ops.prependList(prev, list));
    return list;
  }, []);

  const renameList = useCallback((id: string, name: string) => {
    setLists((prev) => ops.renameList(prev, id, name, Date.now()));
  }, []);

  const deleteList = useCallback((id: string) => {
    setLists((prev) => ops.deleteList(prev, id));
  }, []);

  const addItem = useCallback((listId: string, item: NewItem) => {
    const built = ops.buildItem(item, uid());
    if (!built) return;
    setLists((prev) => ops.addItem(prev, listId, built, Date.now()));
  }, []);

  const updateItem = useCallback(
    (listId: string, itemId: string, patch: Partial<MaterialItem>) => {
      setLists((prev) => ops.updateItem(prev, listId, itemId, patch, Date.now()));
    },
    [],
  );

  const toggleItem = useCallback((listId: string, itemId: string) => {
    setLists((prev) => ops.toggleItem(prev, listId, itemId, Date.now()));
  }, []);

  const deleteItem = useCallback((listId: string, itemId: string) => {
    setLists((prev) => ops.deleteItem(prev, listId, itemId, Date.now()));
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

/** Access the lists store. Must be called within a {@link ListsProvider}. */
export function useLists(): ListsContextValue {
  const ctx = useContext(ListsContext);
  if (!ctx) {
    throw new Error('useLists must be used within a ListsProvider');
  }
  return ctx;
}
