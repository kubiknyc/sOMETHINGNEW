import { describe, expect, it } from '@jest/globals';
import { escapeHtml, itemLine, listToHtml, listToText } from '../format';
import type { MaterialList } from '../types';

function makeList(overrides: Partial<MaterialList> = {}): MaterialList {
  return {
    id: 'l1',
    name: '123 Main St — framing',
    createdAt: 0,
    updatedAt: 0,
    items: [],
    ...overrides,
  };
}

describe('itemLine', () => {
  it('renders an unchecked item with quantity and unit', () => {
    expect(
      itemLine({ checked: false, quantity: 20, unit: 'bags', name: 'Quikrete' }),
    ).toBe('[ ] 20 bags  Quikrete');
  });

  it('marks checked items with [x]', () => {
    expect(
      itemLine({ checked: true, quantity: 5, unit: 'sheets', name: 'plywood' }),
    ).toBe('[x] 5 sheets  plywood');
  });

  it('omits the unit when empty', () => {
    expect(itemLine({ checked: false, quantity: 3, unit: '', name: 'doors' })).toBe(
      '[ ] 3  doors',
    );
  });
});

describe('listToText', () => {
  it('shows a placeholder for an empty list', () => {
    const text = listToText(makeList({ name: 'Empty' }));
    expect(text).toContain('Empty');
    expect(text).toContain('(no items yet)');
  });

  it('lists items and a remaining-count footer', () => {
    const text = listToText(
      makeList({
        items: [
          { id: 'a', name: 'studs', quantity: 30, unit: 'pcs', checked: false },
          { id: 'b', name: 'screws', quantity: 2, unit: 'boxes', checked: true },
        ],
      }),
    );
    expect(text).toContain('[ ] 30 pcs  studs');
    expect(text).toContain('[x] 2 boxes  screws');
    expect(text).toContain('1 of 2 still needed');
  });

  it('falls back to a default header when name is blank', () => {
    expect(listToText(makeList({ name: '   ' }))).toContain('Materials list');
  });
});

describe('escapeHtml', () => {
  it('escapes &, < and >', () => {
    expect(escapeHtml('Tom & Jerry <b>')).toBe('Tom &amp; Jerry &lt;b&gt;');
  });
});

describe('listToHtml', () => {
  it('escapes item names to avoid HTML injection', () => {
    const html = listToHtml(
      makeList({
        items: [
          { id: 'a', name: '<script>x</script>', quantity: 1, unit: '', checked: false },
        ],
      }),
    );
    expect(html).toContain('&lt;script&gt;x&lt;/script&gt;');
    expect(html).not.toContain('<script>x</script>');
  });
});
