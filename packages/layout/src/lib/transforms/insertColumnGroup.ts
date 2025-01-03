import {
  type InsertNodesOptions,
  type SlateEditor,
  findNode,
} from '@udecode/plate-common';

import type { TColumnGroupElement } from '../types';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';

export const insertColumnGroup = (
  editor: SlateEditor,
  {
    columns = 2,
    select: selectProp,
    ...options
  }: InsertNodesOptions & {
    columns?: number;
  } = {}
) => {
  const width = 100 / columns;

  editor.tf.withoutNormalizing(() => {
    editor.tf.insertNodes<TColumnGroupElement>(
      {
        children: Array(columns)
          .fill(null)
          .map(() => ({
            children: [editor.api.create.block()],
            type: BaseColumnItemPlugin.key,
            width: `${width}%`,
          })),
        type: BaseColumnPlugin.key,
      },
      options
    );

    if (selectProp) {
      const entry = findNode(editor, {
        at: options.at,
        match: { type: editor.getType(BaseColumnPlugin) },
      });

      if (!entry) return;

      editor.tf.select(entry[1].concat([0]));
    }
  });
};
