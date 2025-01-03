import type { Location } from 'slate';

import {
  type SlateEditor,
  BaseParagraphPlugin,
  getChildren,
} from '@udecode/plate-common';

import { BaseCodeBlockPlugin } from '../BaseCodeBlockPlugin';

export const unwrapCodeBlock = (editor: SlateEditor) => {
  if (!editor.selection) return;

  const codeBlockType = editor.getType(BaseCodeBlockPlugin);
  const defaultType = editor.getType(BaseParagraphPlugin);

  editor.tf.withoutNormalizing(() => {
    const codeBlockEntries = editor.api.nodes({
      at: editor.selection as Location,
      match: { type: codeBlockType },
    });

    const reversedCodeBlockEntries = Array.from(codeBlockEntries).reverse();

    for (const codeBlockEntry of reversedCodeBlockEntries) {
      const codeLineEntries = getChildren(codeBlockEntry);

      for (const [, path] of codeLineEntries) {
        editor.tf.setNodes({ type: defaultType }, { at: path });
      }

      editor.tf.unwrapNodes({
        at: codeBlockEntry[1],
        match: { type: codeBlockType },
        split: true,
      });
    }
  });
};
