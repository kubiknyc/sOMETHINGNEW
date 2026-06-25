export type MaterialItem = {
  id: string;
  name: string;
  quantity: number;
  /** Free-text unit, e.g. "bags", "sheets", "ft". May be empty. */
  unit: string;
  /** "Got it" — purchased / loaded. */
  checked: boolean;
  note?: string;
};

export type MaterialList = {
  id: string;
  /** e.g. "123 Main St — framing". */
  name: string;
  items: MaterialItem[];
  createdAt: number;
  updatedAt: number;
};
