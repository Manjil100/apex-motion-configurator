import { categories, defaultSelection, findOption, type CategoryId, type Selection } from "@/lib/customisation/options";

export interface OptionRow {
  category_id: string;
  option_id: string;
}

/** Rebuilds a selection from database rows, ignoring anything the catalogue no longer knows. */
export function rowsToSelection(rows: OptionRow[]): Selection {
  const selection = defaultSelection();
  for (const c of categories) {
    const ids = rows
      .filter((r) => r.category_id === c.id && findOption(c.id, r.option_id))
      .map((r) => r.option_id);
    if (c.multi) selection[c.id] = [...new Set(ids)];
    else if (ids[0]) selection[c.id] = [ids[0]];
  }
  return selection;
}

/** The JSON object save_configuration() expects: category id to an array of option ids. */
export function selectionToPayload(selection: Selection): Record<CategoryId, string[]> {
  return Object.fromEntries(categories.map((c) => [c.id, [...new Set(selection[c.id] ?? [])]])) as Record<CategoryId, string[]>;
}
