import {
  type ReplaceNodeChildrenOptions,
  type SlateEditor,
  type TElement,
  getBlockAbove,
  replaceNode,
} from '@udecode/plate-common';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';
import { columnsToWidths } from '../utils/columnsToWidths';
import { setColumns } from './setColumns';

export const toggleColumnGroup = (
  editor: SlateEditor,
  {
    at,
    columns = 2,
    widths,
  }: Partial<Omit<ReplaceNodeChildrenOptions<TElement>, 'nodes'>> & {
    columns?: number;
    widths?: string[];
  } = {}
) => {
  const entry = getBlockAbove(editor, { at });
  const columnGroupEntry = getBlockAbove(editor, {
    at,
    match: { type: editor.getType(BaseColumnPlugin) },
  });

  if (!entry) return;

  const [node, path] = entry;

  // Check if the node is already a column_group
  if (columnGroupEntry) {
    // Node is already a column_group, just update the columns using setColumns
    setColumns(editor, { at: columnGroupEntry[1], columns, widths });
  } else {
    // Node is not a column_group, wrap it in a column_group
    const columnWidths = widths || columnsToWidths({ columns });

    const nodes = {
      children: Array(columns)
        .fill(null)
        .map((_, index) => ({
          children: [index === 0 ? node : editor.api.create.block()],
          type: BaseColumnItemPlugin.key,
          width: columnWidths[index],
        })),
      type: BaseColumnPlugin.key,
    } as TElement;

    replaceNode(editor, {
      at: path,
      nodes,
    });

    editor.tf.select(editor.api.start(path.concat([0]))!);
  }
};
