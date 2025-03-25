import type { Descendant, TElement } from '@udecode/plate';

export interface TCodeBlockElement extends TElement {
  lang?: string;
}

export interface TDateElement extends TElement {
  date?: string;
}

export interface TEquationElement extends TElement {
  texExpression: string;
}

export interface TImageElement extends TElement {
  url: string;
  id?: string;
  align?: 'center' | 'left' | 'right';
  caption?: Descendant[];
  isUpload?: boolean;
  name?: string;
  placeholderId?: string;
}

export interface TLinkElement extends TElement {
  url: string;
  target?: string;
}

export interface TMentionElement extends TElement {
  value: string;
}

export interface TTableCellElement extends TElement {
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
}
export interface TTableElement extends TElement {
  colSizes?: number[];
  marginLeft?: number;
}
export interface TTableRowElement extends TElement {
  size?: number;
}

interface BorderStyle {
  color?: string;
  size?: number;
  style?: string;
}
