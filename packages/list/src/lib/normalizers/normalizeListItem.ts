import {
  type SlateEditor,
  type TDescendant,
  type TElement,
  type TElementEntry,
  type TNodeEntry,
  getChildren,
  insertEmptyElement,
  match,
} from '@udecode/plate-common';
import { type PathRef, Path } from 'slate';

import {
  type ListPluginOptions,
  BaseBulletedListPlugin,
  BaseListItemContentPlugin,
  BaseNumberedListPlugin,
} from '../BaseListPlugin';
import { getListTypes } from '../queries/index';
import { moveListItemUp } from '../transforms/index';

/**
 * Recursively get all the:
 *
 * - Block children
 * - Inline children except those at excludeDepth
 */
export const getDeepInlineChildren = (
  editor: SlateEditor,
  {
    children,
  }: {
    children: TNodeEntry<TDescendant>[];
  }
) => {
  const inlineChildren: TNodeEntry<TDescendant>[] = [];

  for (const child of children) {
    if (editor.api.isBlock(child[0])) {
      inlineChildren.push(
        ...getDeepInlineChildren(editor, {
          children: getChildren(child),
        })
      );
    } else {
      inlineChildren.push(child);
    }
  }

  return inlineChildren;
};

/**
 * If the list item has no child: insert an empty list item container. Else:
 * move the children that are not valid to the list item container.
 */
export const normalizeListItem = (
  editor: SlateEditor,
  {
    listItem,
    validLiChildrenTypes = [],
  }: { listItem: TElementEntry } & ListPluginOptions
) => {
  let changed = false;

  const allValidLiChildrenTypes = new Set([
    editor.getType(BaseBulletedListPlugin),
    editor.getType(BaseListItemContentPlugin),
    editor.getType(BaseNumberedListPlugin),
    ...validLiChildrenTypes,
  ]);

  const [, liPath] = listItem;
  const liChildren = getChildren<TElement>(listItem);

  // Get invalid (type) li children path refs to be moved
  const invalidLiChildrenPathRefs = liChildren
    .filter(([child]) => !allValidLiChildrenTypes.has(child.type))
    .map(([, childPath]) => editor.api.pathRef(childPath));

  const firstLiChild: TElementEntry | undefined = liChildren[0];
  const [firstLiChildNode, firstLiChildPath] = firstLiChild ?? [];

  // If li has no child or inline child, insert lic
  if (!firstLiChild || !editor.api.isBlock(firstLiChildNode)) {
    insertEmptyElement(editor, editor.getType(BaseListItemContentPlugin), {
      at: liPath.concat([0]),
    });

    return true;
  }
  // If first li child is a block but not lic, set it to lic
  if (
    editor.api.isBlock(firstLiChildNode) &&
    !match(firstLiChildNode, [], {
      type: editor.getType(BaseListItemContentPlugin),
    })
  ) {
    if (
      match(firstLiChildNode, [], {
        type: getListTypes(editor),
      })
    ) {
      // the listItem has no lic so we move the children up a level
      const parent = editor.api.parent(listItem[1]);
      const sublist = firstLiChild;
      const children = getChildren<TElement>(firstLiChild).reverse();
      children.forEach((c) => {
        moveListItemUp(editor, {
          list: sublist,
          listItem: c,
        });
      });

      editor.tf.removeNodes({ at: [...parent![1], 0] });

      return true;
    }
    // Allow block elements listed as valid li children types to be a first child instead of LIC
    if (validLiChildrenTypes.includes(firstLiChildNode.type)) {
      return true;
    }

    editor.tf.setNodes(
      {
        type: editor.getType(BaseListItemContentPlugin),
      },
      {
        at: firstLiChildPath,
      }
    );

    changed = true;
  }

  const licChildren = getChildren(firstLiChild);

  if (licChildren.length > 0) {
    const blockPathRefs: PathRef[] = [];
    const inlineChildren: TNodeEntry[] = [];

    // Check that lic has no block children
    for (const licChild of licChildren) {
      if (!editor.api.isBlock(licChild[0])) {
        break;
      }

      blockPathRefs.push(editor.api.pathRef(licChild[1]));

      inlineChildren.push(
        ...getDeepInlineChildren(editor, {
          children: getChildren(licChild),
        })
      );
    }

    const to = Path.next(licChildren.at(-1)![1]);

    // Move lic nested inline children to its children
    inlineChildren.reverse().forEach(([, path]) => {
      editor.tf.moveNodes({
        at: path,
        to,
      });
    });

    // Remove lic block children
    blockPathRefs.forEach((pathRef) => {
      const path = pathRef.unref();

      path &&
        editor.tf.removeNodes({
          at: path,
        });
    });

    if (blockPathRefs.length > 0) {
      changed = true;
    }
  }
  if (changed) return true;

  // Ensure that any text nodes under the list are inside the list item container
  invalidLiChildrenPathRefs.reverse().forEach((ref) => {
    const path = ref.unref();

    path &&
      editor.tf.moveNodes({
        at: path,
        to: firstLiChildPath.concat([0]),
      });
  });

  return invalidLiChildrenPathRefs.length > 0;
};
