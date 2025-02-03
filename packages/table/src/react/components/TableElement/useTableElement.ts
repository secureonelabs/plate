import { useEditorPlugin, useElement } from '@udecode/plate/react';

import type { TTableElement } from '../../../lib';

import { useTableStore } from '../../stores';
import { TablePlugin } from '../../TablePlugin';
import { useSelectedCells } from './useSelectedCells';

export const useTableElement = () => {
  const { editor, getOptions } = useEditorPlugin(TablePlugin);

  const { disableMarginLeft } = getOptions();

  const element = useElement<TTableElement>();
  const selectedCells = useTableStore().useSelectedCellsValue();
  const marginLeftOverride = useTableStore().useMarginLeftOverrideValue();

  const marginLeft = disableMarginLeft
    ? 0
    : (marginLeftOverride ?? element.marginLeft ?? 0);

  useSelectedCells();

  return {
    isSelectingCell: !!selectedCells,
    marginLeft,
    props: {
      onMouseDown: () => {
        // until cell dnd is supported, we collapse the selection on mouse down
        if (selectedCells) {
          editor.tf.collapse();
        }
      },
    },
  };
};
