/* eslint-disable */

import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { MarkNode } from '@lexical/mark'
import { OverflowNode } from '@lexical/overflow'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { CollapsibleContainerNode } from '../plugins/CollapsiblePlugin/CollapsibleContainerNode'
import { CollapsibleContentNode } from '../plugins/CollapsiblePlugin/CollapsibleContentNode'
import { CollapsibleTitleNode } from '../plugins/CollapsiblePlugin/CollapsibleTitleNode'
import { ImageNode } from './ImageNode'
import { KeywordNode } from './KeywordNode'
import { LayoutContainerNode } from './LayoutContainerNode'
import { LayoutItemNode } from './LayoutItemNode'
import { PageBreakNode } from './PageBreakNode'

const Nodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  CodeHighlightNode,
  AutoLinkNode,
  LinkNode,
  OverflowNode,
  ImageNode,
  KeywordNode,
  HorizontalRuleNode,
  MarkNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
  PageBreakNode,
  LayoutContainerNode,
  LayoutItemNode,
]

export default Nodes
