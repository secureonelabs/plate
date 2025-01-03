import {
  type SlateEditor,
  type TText,
  replaceNodeChildren,
} from '@udecode/plate-common';

import type { TLinkElement } from '../types';
import type { UpsertLinkOptions } from './upsertLink';

import { BaseLinkPlugin } from '../BaseLinkPlugin';

/**
 * If the text is different than the link above text, replace link children by a
 * new text. The new text has the same marks than the first text replaced.
 */
export const upsertLinkText = (
  editor: SlateEditor,
  { text }: UpsertLinkOptions
) => {
  const newLink = editor.api.above<TLinkElement>({
    match: { type: editor.getType(BaseLinkPlugin) },
  });

  if (newLink) {
    const [newLinkNode, newLinkPath] = newLink;

    if (text?.length && text !== editor.api.string(newLinkPath)) {
      const firstText = newLinkNode.children[0];

      // remove link children
      replaceNodeChildren<TText>(editor, {
        at: newLinkPath,
        insertOptions: {
          select: true,
        },
        nodes: { ...firstText, text },
      });
    }
  }
};
