import type { TEditor, TElement } from '@udecode/plate-common';

/** Get table column index of a cell node. */
export const getTableColumnIndex = (editor: TEditor, cellNode: TElement) => {
  const path = editor.api.findPath(cellNode);

  if (!path) return -1;

  const [trNode] = editor.api.parent(path) ?? [];

  if (!trNode) return -1;

  let colIndex = -1;

  trNode.children.some((item, index) => {
    if (item === cellNode) {
      colIndex = index;

      return true;
    }

    return false;
  });

  return colIndex;
};
