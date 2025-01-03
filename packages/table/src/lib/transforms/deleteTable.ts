import { type SlateEditor, someNode } from '@udecode/plate-common';

import { BaseTablePlugin } from '../BaseTablePlugin';

export const deleteTable = (editor: SlateEditor) => {
  if (
    someNode(editor, {
      match: { type: editor.getType(BaseTablePlugin) },
    })
  ) {
    const tableItem = editor.api.above({
      match: { type: editor.getType(BaseTablePlugin) },
    });

    if (tableItem) {
      editor.tf.removeNodes({
        at: tableItem[1],
      });
    }
  }
};
