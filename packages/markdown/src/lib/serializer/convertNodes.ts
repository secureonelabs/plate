import {
  type Descendant,
  type TElement,
  type TText,
  NodeApi,
  TextApi,
} from '@udecode/plate';

import type { Components } from '../MarkdownPlugin';
import type { mdast, mdastUtilMath, unistLib } from './types';

import { convertTexts } from './convertTexts';
import { indentListToMdastTree } from './indentListToMdastTree';
import { unreachable } from './utils/unreachable';

export const convertNodes = (
  nodes: Descendant[],
  components?: Components
): unistLib.Node[] => {
  const mdastNodes: unistLib.Node[] = [];
  let textQueue: TText[] = [];

  const listBlock: TElement[] = [];

  for (let i = 0; i <= nodes.length; i++) {
    const n = nodes[i] as any;

    if (n && TextApi.isText(n)) {
      textQueue.push(n);
    } else {
      mdastNodes.push(...(convertTexts(textQueue) as any as unistLib.Node[]));
      textQueue = [];
      if (!n) continue;

      if (n?.type === 'p' && 'listStyleType' in n) {
        listBlock.push(n);

        const next = nodes[i + 1] as TElement;
        const isNextIndent =
          next && next.type === 'p' && 'listStyleType' in next;

        if (!isNextIndent) {
          mdastNodes.push(indentListToMdastTree(listBlock as any, components));
          listBlock.length = 0;
        }
      } else {
        const node = buildMdastNode(n, components);

        if (node) {
          mdastNodes.push(node as unistLib.Node);
        }
      }
    }
  }

  return mdastNodes;
};

export const buildMdastNode = (node: any, components?: Components) => {
  const component = components?.[node.type];

  if (component) {
    return component.serialize(node, components);
  }

  switch (node.type) {
    case 'a': {
      return buildLink(node, components);
    }
    case 'blockquote': {
      return buildBlockquote(node, components);
    }
    case 'code_block': {
      return buildCodeBlock(node);
    }
    case 'date': {
      return buildDate(node);
    }
    case 'equation': {
      return buildEquation(node);
    }
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      return buildHeading(node);
    }
    case 'hr': {
      return buildThematicBreak(node);
    }

    case 'img': {
      return buildImage(node);
    }
    case 'inline_equation': {
      return buildInlineEquation(node);
    }
    case 'mention': {
      return buildMention(node);
    }
    case 'p': {
      return buildParagraph(node);
    }
    case 'table': {
      return buildTable(node);
    }
    case 'td': {
      return buildTableCell(node);
    }
    case 'th':
    case 'tr': {
      return buildTableRow(node);
    }
    default: {
      unreachable(node);
    }
  }
};

export type TParagraph = {
  children: Descendant[];
  type: 'p';
};
const buildParagraph = (
  { children, type }: TParagraph,
  components?: Components
): mdast.Paragraph => {
  return {
    children: convertNodes(children, components) as mdast.Paragraph['children'],
    type: 'paragraph',
  };
};

type THeading = {
  children: Descendant[];
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

const buildHeading = (
  { children, type }: THeading,
  components?: Components
): mdast.Heading => {
  const depth = (Number.parseInt(type.slice(1)) || 1) as 1 | 2 | 3 | 4 | 5 | 6;

  return {
    children: convertNodes(children, components) as mdast.Heading['children'],
    depth,
    type: 'heading',
  };
};

type TThematicBreak = {
  children: Descendant[];
  type: 'hr';
};

const buildThematicBreak = (node: TThematicBreak): mdast.ThematicBreak => {
  return { type: 'thematicBreak' };
};

type TBlockquote = {
  children: Descendant[];
  type: 'blockquote';
};

const buildBlockquote = (
  node: TBlockquote,
  components?: Components
): mdast.Blockquote => {
  return {
    children: convertNodes(
      node.children,
      components
    ) as mdast.Blockquote['children'],
    type: 'blockquote',
  };
};

type TTable = {
  children: Descendant[];
  type: 'table';
  colSizes?: number[];
  marginLeft?: number;
};

const buildTable = (node: TTable, components?: Components): mdast.Table => {
  return {
    children: convertNodes(
      node.children,
      components
    ) as mdast.Table['children'],
    type: 'table',
  };
};

type TTableRow = {
  children: Descendant[];
  type: 'tr';
  size?: number;
};

const buildTableRow = (
  node: TTableRow,
  components?: Components
): mdast.TableRow => {
  return {
    children: convertNodes(
      node.children,
      components
    ) as mdast.TableRow['children'],
    type: 'tableRow',
  };
};

interface BorderStyle {
  color?: string;
  size?: number;
  // https://docx.js.org/api/enums/BorderStyle.html
  style?: string;
}

type TTableCell = {
  children: Descendant[];
  type: 'td';
  id?: string;
  attributes?: {
    colspan?: string;
    rowspan?: string;
  };
  background?: string;
  borders?: {
    /** Only the last row cells have a bottom border. */
    bottom?: BorderStyle;
    left?: BorderStyle;
    /** Only the last column cells have a right border. */
    right?: BorderStyle;
    top?: BorderStyle;
  };
  colSpan?: number;
  rowSpan?: number;
  size?: number;
};

const buildTableCell = (node: TTableCell, overrides?: any): mdast.TableCell => {
  return {
    children: convertNodes(
      node.children,
      overrides
    ) as mdast.TableCell['children'],
    type: 'tableCell',
  };
};

type TSlateImage = {
  children: Descendant[];
  type: 'img';
  url: string;
  id?: string;
  align?: 'center' | 'left' | 'right';
  caption?: Descendant[];
  isUpload?: boolean;
  name?: string;
  placeholderId?: string;
};

const buildImage = ({ caption, type, url }: TSlateImage): mdast.Paragraph => {
  const image: mdast.Image = {
    alt: caption ? NodeApi.string({ children: caption } as any) : undefined,
    title: caption ? NodeApi.string({ children: caption } as any) : undefined,
    type: 'image',
    url,
  };

  return { children: [image], type: 'paragraph' };
};

type TLink = {
  children: Descendant[];
  type: 'link';
  url: string;
  target?: string;
};

const buildLink = (node: TLink, components?: Components): mdast.Link => {
  return {
    children: convertNodes(node.children, components) as mdast.Link['children'],
    type: 'link',
    url: node.url,
  };
};

type TCodeBlock = {
  children: TCodeLine[];
  type: 'code_block';
  lang?: string;
};

type TCodeLine = {
  children: Descendant[];
  type: 'code_line';
};

const buildCodeBlock = ({ children, lang }: TCodeBlock): mdast.Code => {
  return {
    lang: lang,
    type: 'code',
    value: children
      .map((child) => child.children.map((c) => c.text).join(''))
      .join('\n'),
  };
};

type TEquation = {
  children: Descendant[];
  texExpression: string;
  type: 'equation';
};

const buildEquation = ({ texExpression }: TEquation): mdastUtilMath.Math => {
  return {
    type: 'math',
    value: texExpression,
  };
};

type TInlineEquation = {
  children: Descendant[];
  texExpression: string;
  type: 'inline_equation';
};

const buildInlineEquation = ({
  texExpression,
}: TInlineEquation): mdastUtilMath.InlineMath => {
  return {
    type: 'inlineMath',
    value: texExpression,
  };
};

type TMention = {
  id: string;
  children: Descendant[];
  type: 'mention';
  value: string;
};

const buildMention = ({ value }: TMention, overrides?: any): mdast.Text => {
  return {
    type: 'text',
    value,
  };
};

type TDate = {
  children: Descendant[];
  date: string;
  type: 'date';
};

const buildDate = ({ date }: TDate): mdast.Text => {
  return {
    type: 'text',
    value: date,
  };
};
