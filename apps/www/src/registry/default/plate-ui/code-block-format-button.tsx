'use client';

import type { TElement } from '@udecode/plate';

import { useCodeBlockFormat } from '@udecode/plate-code-block/react';
import { BracesIcon } from 'lucide-react';

import { Button } from './button';

export function CodeBlockFormatButton({ element }: { element: TElement }) {

  if (!isLangSupported(element.lang)) {
    return null;
  }

  return (
    <Button
      size="xs"
      variant="ghost"
      className="h-5 justify-between px-1 text-xs"
      disabled={!validSyntax}
      onClick={() => formatCodeBlock(editor, { element })}
      title="Format code"
    >
      <BracesIcon className="text-gray-500" />
    </Button>
  );
}
