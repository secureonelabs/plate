import {
  type SlateEditor,
  insertElements,
  isBlockTextEmptyAfterSelection,
} from '@udecode/plate-common';
import { Path, Range } from 'slate';

import { type TodoListConfig, BaseTodoListPlugin } from '../BaseTodoListPlugin';

/** Insert todo list item if selection in li>p. TODO: test */
export const insertTodoListItem = (
  editor: SlateEditor,
  {
    inheritCheckStateOnLineEndBreak = false,
    inheritCheckStateOnLineStartBreak = false,
  }: TodoListConfig['options']
): boolean => {
  const todoType = editor.getType(BaseTodoListPlugin);

  if (!editor.selection) {
    return false;
  }

  const todoEntry = editor.api.above({ match: { type: todoType } });

  if (!todoEntry) return false;

  const [todo, paragraphPath] = todoEntry;

  let success = false;

  editor.tf.withoutNormalizing(() => {
    if (!Range.isCollapsed(editor.selection!)) {
      editor.tf.delete();
    }

    const isStart = editor.api.isStart(editor.selection!.focus, paragraphPath);
    const isEnd = isBlockTextEmptyAfterSelection(editor);

    const nextParagraphPath = Path.next(paragraphPath);

    /** If start, insert a list item before */
    if (isStart) {
      insertElements(
        editor,
        {
          checked: inheritCheckStateOnLineStartBreak ? todo.checked : false,
          children: [{ text: '' }],
          type: todoType,
        },
        { at: paragraphPath }
      );

      success = true;

      return;
    }
    /** If not end, split the nodes */
    if (isEnd) {
      /** If end, insert a list item after and select it */
      const marks = editor.api.marks() || {};
      insertElements(
        editor,
        {
          checked: inheritCheckStateOnLineEndBreak ? todo.checked : false,
          children: [{ text: '', ...marks }],
          type: todoType,
        },
        { at: nextParagraphPath }
      );
      editor.tf.select(nextParagraphPath);
    } else {
      editor.tf.withoutNormalizing(() => {
        editor.tf.splitNodes();
      });
    }

    success = true;
  });

  return success;
};
