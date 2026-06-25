import type { MaterialItem, MaterialList } from './types';

/** Format a single item line, e.g. "[ ] 20 bags  Quikrete". */
export function itemLine(item: Pick<MaterialItem, 'checked' | 'quantity' | 'unit' | 'name'>): string {
  const box = item.checked ? '[x]' : '[ ]';
  const qty = `${item.quantity}${item.unit ? ' ' + item.unit : ''}`;
  return `${box} ${qty}  ${item.name}`.trimEnd();
}

/** Build a plain-text representation of a list, suitable for messaging. */
export function listToText(list: MaterialList): string {
  const header = list.name.trim() || 'Materials list';
  const rule = '-'.repeat(Math.min(header.length, 40));
  if (list.items.length === 0) {
    return `${header}\n${rule}\n(no items yet)`;
  }
  const lines = list.items.map(itemLine);
  const remaining = list.items.filter((i) => !i.checked).length;
  const footer = `\n${remaining} of ${list.items.length} still needed`;
  return `${header}\n${rule}\n${lines.join('\n')}\n${footer}`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Build printable HTML for the list. */
export function listToHtml(list: MaterialList): string {
  const rows = list.items
    .map((it) => {
      const mark = it.checked ? '&#10003;' : '&#9744;';
      const qty = `${it.quantity}${it.unit ? ' ' + escapeHtml(it.unit) : ''}`;
      const name =
        escapeHtml(it.name) +
        (it.note ? ` <span class="note">(${escapeHtml(it.note)})</span>` : '');
      return `<tr class="${it.checked ? 'done' : ''}"><td class="mark">${mark}</td><td class="qty">${qty}</td><td class="name">${name}</td></tr>`;
    })
    .join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, Roboto, sans-serif; padding: 24px; color: #11181C; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .sub { color: #6B7785; margin: 0 0 16px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 6px; border-bottom: 1px solid #E2E6EA; font-size: 16px; vertical-align: top; }
    .mark { width: 24px; font-size: 18px; }
    .qty { width: 90px; color: #0A66C2; font-weight: 600; white-space: nowrap; }
    .done .name { text-decoration: line-through; color: #6B7785; }
    .note { color: #6B7785; font-size: 13px; }
  </style></head><body>
  <h1>${escapeHtml(list.name || 'Materials list')}</h1>
  <p class="sub">${list.items.filter((i) => !i.checked).length} of ${list.items.length} still needed</p>
  <table>${rows || '<tr><td colspan="3">(no items yet)</td></tr>'}</table>
  </body></html>`;
}
