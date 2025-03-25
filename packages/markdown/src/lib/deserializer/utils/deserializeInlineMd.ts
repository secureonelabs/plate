import type { Descendant, SlateEditor } from '@udecode/plate';

import { MarkdownPlugin } from '../../MarkdownPlugin';
import { stripMarkdownBlocks } from './stripMarkdown';

export const deserializeInlineMd = (editor: SlateEditor, text: string) => {
  const leadingSpaces = /^\s*/.exec(text)?.[0] || '';
  const trailingSpaces = /\s*$/.exec(text)?.[0] || '';

  const strippedText = stripMarkdownBlocks(text.trim());

  const fragment: Descendant[] = [];

  if (leadingSpaces) {
    fragment.push({ text: leadingSpaces });
  }
  if (strippedText) {
    fragment.push(
      ...editor.getApi(MarkdownPlugin).markdown.deserialize(strippedText)[0]
        .children
    );
  }
  if (trailingSpaces) {
    fragment.push({ text: trailingSpaces });
  }

  return fragment;
};
