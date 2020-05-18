/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { idCreatorFixture } from '__tests__/node-id/withNodeID/fixtures';
import { withNodeID } from 'node';
import { Editor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { HistoryEditor } from 'slate-history/dist/history-editor';

const input = ((
  <editor>
    <hp>
      <htext id={1}>tes</htext>
      <htext id={2}>t</htext>
    </hp>
  </editor>
) as any) as Editor;

const output = (
  <editor>
    <hp>
      <htext id={1}>tes</htext>
      <htext id={2}>t</htext>
    </hp>
  </editor>
) as any;

it('should recover the ids', () => {
  const editor: HistoryEditor = withNodeID({
    idCreator: idCreatorFixture,
    filterText: false,
  })(withHistory(input));

  Transforms.mergeNodes(editor, { at: [0, 1] });
  editor.undo();

  expect(input.children).toEqual(output.children);
});
