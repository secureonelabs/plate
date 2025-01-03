import { Path, Range } from 'slate';

import type { TEditor, ValueOf } from '../interfaces';
import type { GetAboveNodeOptions } from '../interfaces/editor/editor-types';

import { getBlockAbove } from './getBlockAbove';

/**
 * Is the range (default: selection) across blocks.
 *
 * - Return undefined if block not found
 * - Return boolean whether one of the block is not found, but the other is found
 * - Return boolean whether block paths are unequal
 */
export const isRangeAcrossBlocks = <E extends TEditor>(
  editor: E,
  {
    at,
    ...options
  }: { at?: Range | null } & Omit<GetAboveNodeOptions<ValueOf<E>>, 'at'> = {}
) => {
  if (!at) at = editor.selection;
  if (!at) return;

  const [start, end] = Range.edges(at);
  const startBlock = getBlockAbove(editor, {
    at: start,
    ...options,
  });
  const endBlock = getBlockAbove(editor, {
    at: end,
    ...options,
  });

  if (!startBlock && !endBlock) return;
  if (!startBlock || !endBlock) return true;

  return !Path.equals(startBlock[1], endBlock[1]);
};
