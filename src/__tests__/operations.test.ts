import { describe, expect, it } from '@jest/globals';
import * as ops from '../store/operations';
import type { MaterialItem, MaterialList } from '../types';

const NOW = 1000;

function list(id: string, items: MaterialItem[] = []): MaterialList {
  return { id, name: id, items, createdAt: 0, updatedAt: 0 };
}

function item(id: string, over: Partial<MaterialItem> = {}): MaterialItem {
  return { id, name: id, quantity: 1, unit: '', checked: false, ...over };
}

describe('buildItem', () => {
  it('trims fields and defaults quantity to 1', () => {
    const built = ops.buildItem({ name: '  2x4  ', unit: '  pcs ' }, 'i1');
    expect(built).toEqual({
      id: 'i1',
      name: '2x4',
      quantity: 1,
      unit: 'pcs',
      checked: false,
      note: undefined,
    });
  });

  it('keeps positive quantities and drops empty notes', () => {
    expect(ops.buildItem({ name: 'nails', quantity: 5, note: '  ' }, 'i2')).toMatchObject({
      quantity: 5,
      note: undefined,
    });
  });

  it('coerces non-positive quantity to 1', () => {
    expect(ops.buildItem({ name: 'x', quantity: 0 }, 'i3')?.quantity).toBe(1);
  });

  it('returns null for a blank name', () => {
    expect(ops.buildItem({ name: '   ' }, 'i4')).toBeNull();
  });
});

describe('buildList', () => {
  it('trims the name and seeds timestamps', () => {
    expect(ops.buildList('  Garage  ', 'l1', NOW)).toEqual({
      id: 'l1',
      name: 'Garage',
      items: [],
      createdAt: NOW,
      updatedAt: NOW,
    });
  });

  it('falls back to "Untitled list" when blank', () => {
    expect(ops.buildList('   ', 'l2', NOW).name).toBe('Untitled list');
  });
});

describe('list operations', () => {
  it('prepends new lists', () => {
    const result = ops.prependList([list('a')], list('b'));
    expect(result.map((l) => l.id)).toEqual(['b', 'a']);
  });

  it('renames a list and bumps updatedAt', () => {
    const result = ops.renameList([list('a')], 'a', 'Renamed', NOW);
    expect(result[0]).toMatchObject({ name: 'Renamed', updatedAt: NOW });
  });

  it('keeps the old name when the new one is blank', () => {
    const result = ops.renameList([list('a')], 'a', '   ', NOW);
    expect(result[0].name).toBe('a');
  });

  it('deletes a list by id', () => {
    expect(ops.deleteList([list('a'), list('b')], 'a').map((l) => l.id)).toEqual(['b']);
  });
});

describe('item operations', () => {
  const base = [list('a', [item('x'), item('y')])];

  it('adds an item to the right list', () => {
    const result = ops.addItem(base, 'a', item('z'), NOW);
    expect(result[0].items.map((i) => i.id)).toEqual(['x', 'y', 'z']);
    expect(result[0].updatedAt).toBe(NOW);
  });

  it('updates only the targeted item', () => {
    const result = ops.updateItem(base, 'a', 'x', { quantity: 9 }, NOW);
    expect(result[0].items.find((i) => i.id === 'x')?.quantity).toBe(9);
    expect(result[0].items.find((i) => i.id === 'y')?.quantity).toBe(1);
  });

  it('toggles checked state', () => {
    const once = ops.toggleItem(base, 'a', 'x', NOW);
    expect(once[0].items.find((i) => i.id === 'x')?.checked).toBe(true);
    const twice = ops.toggleItem(once, 'a', 'x', NOW);
    expect(twice[0].items.find((i) => i.id === 'x')?.checked).toBe(false);
  });

  it('deletes an item', () => {
    const result = ops.deleteItem(base, 'a', 'x', NOW);
    expect(result[0].items.map((i) => i.id)).toEqual(['y']);
  });

  it('does not mutate the input list', () => {
    const before = JSON.stringify(base);
    ops.addItem(base, 'a', item('z'), NOW);
    expect(JSON.stringify(base)).toBe(before);
  });
});
