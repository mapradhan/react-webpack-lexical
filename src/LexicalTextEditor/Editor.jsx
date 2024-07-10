/* eslint-disable */

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
// import { useLexicalEditable } from "@lexical/react/useLexicalEditable"
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { CAN_USE_DOM } from './shared/canUseDOM'
import { useSettings } from './context/SettingsContext'
import { useSharedHistoryContext } from './context/SharedHistoryContext'
import AutoLinkPlugin from './plugins/AutoLinkPlugin'
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin'
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin'
import CollapsiblePlugin from './plugins/CollapsiblePlugin'
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin'
import ContextMenuPlugin from './plugins/ContextMenuPlugin'
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin'
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin'
import ImagesPlugin from './plugins/ImagesPlugin'
import KeywordsPlugin from './plugins/KeywordsPlugin'
import { LayoutPlugin } from './plugins/LayoutPlugin/LayoutPlugin'
import LinkPlugin from './plugins/LinkPlugin'
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin'
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin'
import { MaxLengthPlugin } from './plugins/MaxLengthPlugin'
import PageBreakPlugin from './plugins/PageBreakPlugin'
import TabFocusPlugin from './plugins/TabFocusPlugin'
import TableHoverActionsPlugin from './plugins/TableHoverActionsPlugin'
import ToolbarPlugin from './plugins/ToolbarPlugin'
import ContentEditable from './ui/ContentEditable'
import Placeholder from './ui/Placeholder'

export default function Editor() {
  const { historyState } = useSharedHistoryContext()
  const {
    settings: {
      isCollab,
      isMaxLength,
      isCharLimit,
      isCharLimitUtf8,
      isRichText,
      shouldUseLexicalContextMenu,
      tableCellMerge,
      tableCellBackgroundColor,
    },
  } = useSettings()
  // const isEditable = useLexicalEditable()
  const text = isCollab
    ? 'Enter some collaborative rich text...'
    : isRichText
    ? 'Enter some rich text...'
    : 'Enter some plain text...'
  const placeholder = <Placeholder>{text}</Placeholder>
  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null)
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState(false)
  const [isLinkEditMode, setIsLinkEditMode] = useState(false)

  const onRef = (_floatingAnchorElem) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport)
      }
    }
    updateViewPortWidth()
    window.addEventListener('resize', updateViewPortWidth)

    return () => {
      window.removeEventListener('resize', updateViewPortWidth)
    }
  }, [isSmallWidthViewport])

  return (
    <>
      {isRichText && <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />}
      <div className={`editor-container ${!isRichText ? 'plain-text' : ''}`}>
        {isMaxLength && <MaxLengthPlugin maxLength={30} />}
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <ComponentPickerPlugin />
        <KeywordsPlugin />
        <AutoLinkPlugin />
        {isRichText ? (
          <>
            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor" ref={onRef}>
                    <ContentEditable />
                  </div>
                </div>
              }
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <MarkdownShortcutPlugin />
            <CodeHighlightPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <TablePlugin
              hasCellMerge={tableCellMerge}
              hasCellBackgroundColor={tableCellBackgroundColor}
            />
            {/* <TableCellResizer /> */}
            <TableHoverActionsPlugin />
            <ImagesPlugin />
            <LinkPlugin />
            <HorizontalRulePlugin />
            <TabFocusPlugin />
            <TabIndentationPlugin />
            <CollapsiblePlugin />
            <PageBreakPlugin />
            <LayoutPlugin />
            {floatingAnchorElem && !isSmallWidthViewport && (
              <>
                <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                <FloatingLinkEditorPlugin
                  anchorElem={floatingAnchorElem}
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
                <FloatingTextFormatToolbarPlugin
                  anchorElem={floatingAnchorElem}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
              </>
            )}
          </>
        ) : (
          <>
            <PlainTextPlugin
              contentEditable={<ContentEditable />}
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin externalHistoryState={historyState} />
          </>
        )}
        {(isCharLimit || isCharLimitUtf8) && (
          <CharacterLimitPlugin
            charset={isCharLimit ? 'UTF-16' : 'UTF-8'}
            maxLength={5}
          />
        )}
        {shouldUseLexicalContextMenu && <ContextMenuPlugin />}
      </div>
    </>
  )
}
