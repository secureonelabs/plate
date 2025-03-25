import { createSlateEditor } from '@udecode/plate';
import { BaseIndentListPlugin } from '@udecode/plate-indent-list';

import { markdownPlugins } from '../../../../../../apps/www/src/registry/default/components/editor/plugins/markdown-plugins';
import { BaseSuggestionPlugin } from '@udecode/plate-suggestion';

export const createTestEditor = (plugins: any[] = []) =>
  createSlateEditor({
    plugins: [markdownPlugins, ...plugins, BaseSuggestionPlugin],
  });
