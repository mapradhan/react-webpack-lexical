/* eslint-disable */

import {
  $createCodeNode,
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from '@lexical/code'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
} from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $isDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode'
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from '@lexical/rich-text'
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
  $setBlocksType,
} from '@lexical/selection'
import { $isTableNode, $isTableSelection } from '@lexical/table'
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  $isEditorIsNestedEditor,
  mergeRegister,
} from '@lexical/utils'
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  KEY_MODIFIER_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import { useCallback, useEffect, useState } from 'react'
import * as React from 'react'
import { IS_APPLE } from '../../shared/environment'
import useModal from '../../hooks/useModal'
import DropDown, { DropDownItem } from '../../ui/DropDown'
import DropdownColorPicker from '../../ui/DropdownColorPicker'
import { getSelectedNode } from '../../utils/getSelectedNode'
import { sanitizeUrl } from '../../utils/url'
import { INSERT_IMAGE_COMMAND, InsertImageDialog } from '../ImagesPlugin'
import InsertLayoutDialog from '../LayoutPlugin/InsertLayoutDialog'
import { InsertTableDialog } from '../TablePlugin'
import FontSize from './fontSize'
import Icon from '../../../Icon/Icon'
import Redo from '../../images/icons/arrow-clockwise.svg'
import Undo from '../../images/icons/arrow-counterclockwise.svg'
import Bold from '../../images/icons/type-bold.svg'
import Italic from '../../images/icons/type-italic.svg'
import Underline from '../../images/icons/type-underline.svg'
import Link from '../../images/icons/link.svg'
import Code from '../../images/icons/code.svg'
import Strikethrough from '../../images/icons/type-strikethrough.svg'
import Subscript from '../../images/icons/type-subscript.svg'
import Superscript from '../../images/icons/type-superscript.svg'
import Table from '../../images/icons/table.svg'
import Clear from '../../images/icons/trash.svg'
import H1 from '../../images/icons/type-h1.svg'
import H2 from '../../images/icons/type-h2.svg'
import H3 from '../../images/icons/type-h3.svg'
import Paragraph from '../../images/icons/text-paragraph.svg'
import BulletList from '../../images/icons/list-ul.svg'
import NumberList from '../../images/icons/list-ol.svg'
import Quote from '../../images/icons/chat-square-quote.svg'
import CheckList from '../../images/icons/square-check.svg'
import TextLeft from '../../images/icons/text-left.svg'
import TextCenter from '../../images/icons/text-center.svg'
import TextRight from '../../images/icons/text-right.svg'
import Justify from '../../images/icons/justify.svg'
import FontColorIcon from '../../images/icons/font-color.svg'
import DropdownMoreIcon from '../../images/icons/dropdown-more.svg'
import BackGroundColorIcon from '../../images/icons/bg-color.svg'
import Image from '../../images/icons/file-image.svg'
import Columns from '../../images/icons/3-columns.svg'
import FontFamily from '../../images/icons/font-family.svg'
import AddIcon from '../../images/icons/add-sign.svg'

const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
}

const dropDownIcon = {
  h1: H1,
  h2: H2,
  h3: H3,
  paragraph: Paragraph,
  bullet: BulletList,
  number: NumberList,
  quote: Quote,
  check: CheckList,
}

const rootTypeToRootName = {
  root: 'Root',
  table: 'Table',
}

function getCodeLanguageOptions() {
  const options = []

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP
  )) {
    options.push([lang, friendlyName])
  }

  return options
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions()

const FONT_FAMILY_OPTIONS = [
  ['Arial', 'Arial'],
  ['Arial Black', 'Arial Black'],
  ['Andale Mono', 'Andale Mono'],
  ['Book Antiqua', 'Book Antiqua'],
  ['Comic Sans MS', 'Comic Sans MS'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Helvetica', 'Helvetica'],
  ['Impact', 'Impact'],
  ['Symbol', 'Symbol'],
  ['Tahoma', 'Tahoma'],
  ['Terminal', 'Terminal'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
  ['Webdings', 'Webdings'],
  ['Wingdings', 'Wingdings'],
]

const FONT_SIZE_OPTIONS = [
  ['10px', '10px'],
  ['11px', '11px'],
  ['12px', '12px'],
  ['13px', '13px'],
  ['14px', '14px'],
  ['15px', '15px'],
  ['16px', '16px'],
  ['17px', '17px'],
  ['18px', '18px'],
  ['19px', '19px'],
  ['20px', '20px'],
]

const ELEMENT_FORMAT_OPTIONS = {
  center: {
    icon: 'center-align',
    iconRTL: 'center-align',
    name: 'Center Align',
    image: TextCenter,
  },
  end: {
    icon: 'right-align',
    iconRTL: 'left-align',
    name: 'End Align',
    image: TextRight,
  },
  justify: {
    icon: 'justify-align',
    iconRTL: 'justify-align',
    name: 'Justify Align',
    image: Justify,
  },
  left: {
    icon: 'left-align',
    iconRTL: 'left-align',
    name: 'Left Align',
    image: TextLeft,
  },
  right: {
    icon: 'right-align',
    iconRTL: 'right-align',
    name: 'Right Align',
    image: TextRight,
  },
  start: {
    icon: 'left-align',
    iconRTL: 'right-align',
    name: 'Start Align',
    image: TextLeft,
  },
}

function dropDownActiveClass(active) {
  if (active) {
    return 'active dropdown-item-active'
  } else {
    return ''
  }
}

function BlockFormatDropDown({
  editor,
  blockType,
  rootType,
  disabled = false,
}) {
  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode())
      }
    })
  }

  const formatHeading = (headingSize) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection()
        $setBlocksType(selection, () => $createHeadingNode(headingSize))
      })
    }
  }

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    } else {
      formatParagraph()
    }
  }

  const formatCheckList = () => {
    if (blockType !== 'check') {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
    } else {
      formatParagraph()
    }
  }

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    } else {
      formatParagraph()
    }
  }

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection()
        $setBlocksType(selection, () => $createQuoteNode())
      })
    }
  }

  const formatCode = () => {
    if (blockType !== 'code') {
      editor.update(() => {
        let selection = $getSelection()

        if (selection !== null) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode())
          } else {
            const textContent = selection.getTextContent()
            const codeNode = $createCodeNode()
            selection.insertNodes([codeNode])
            selection = $getSelection()
            if ($isRangeSelection(selection)) {
              selection.insertRawText(textContent)
            }
          }
        }
      })
    }
  }

  return (
    <DropDown
      disabled={disabled}
      buttonClassName="toolbar-item block-controls"
      buttonIconClassName={'icon block-type '}
      buttonLabel={blockTypeToBlockName[blockType]}
      buttonAriaLabel="Formatting options for text style"
      buttonIconName={dropDownIcon[blockType]}
    >
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'paragraph')}
        onClick={formatParagraph}
      >
        <Icon icon={Paragraph} className="icon" />
        <span className="text">Normal</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h1')}
        onClick={() => formatHeading('h1')}
      >
        <Icon icon={H1} className="icon" />
        <span className="text">Heading 1</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h2')}
        onClick={() => formatHeading('h2')}
      >
        <Icon icon={H2} className="icon" />
        <span className="text">Heading 2</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h3')}
        onClick={() => formatHeading('h3')}
      >
        <Icon icon={H3} className="icon" />
        <span className="text">Heading 3</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'bullet')}
        onClick={formatBulletList}
      >
        <Icon icon={BulletList} className="icon" />
        <span className="text">Bullet List</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'number')}
        onClick={formatNumberedList}
      >
        <Icon icon={NumberList} className="icon" />
        <span className="text">Numbered List</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'check')}
        onClick={formatCheckList}
      >
        <Icon icon={CheckList} className="icon" />
        <span className="text">Check List</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'quote')}
        onClick={formatQuote}
      >
        <Icon icon={Quote} className="icon" />
        <span className="text">Quote</span>
      </DropDownItem>
    </DropDown>
  )
}

function Divider() {
  return <div className="divider" />
}

function FontDropDown({ editor, value, style, disabled = false }) {
  const handleClick = useCallback(
    (option) => {
      editor.update(() => {
        const selection = $getSelection()
        if (selection !== null) {
          $patchStyleText(selection, {
            [style]: option,
          })
        }
      })
    },
    [editor, style]
  )

  const buttonAriaLabel =
    style === 'font-family'
      ? 'Formatting options for font family'
      : 'Formatting options for font size'

  return (
    <DropDown
      disabled={disabled}
      buttonClassName={'toolbar-item ' + style}
      buttonLabel={value}
      buttonIconClassName={
        style === 'font-family' ? 'icon block-type font-family' : ''
      }
      buttonAriaLabel={buttonAriaLabel}
      buttonIconName={FontFamily}
    >
      {(style === 'font-family' ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(
        ([option, text]) => (
          <DropDownItem
            className={`item ${dropDownActiveClass(value === option)} ${
              style === 'font-size' ? 'fontsize-item' : ''
            }`}
            onClick={() => handleClick(option)}
            key={option}
          >
            <span className="text">{text}</span>
          </DropDownItem>
        )
      )}
    </DropDown>
  )
}

function ElementFormatDropdown({ editor, value, isRTL, disabled = false }) {
  const formatOption = ELEMENT_FORMAT_OPTIONS[value || 'left']

  return (
    <DropDown
      disabled={disabled}
      buttonLabel={formatOption.name}
      buttonIconClassName={`icon ${
        isRTL ? formatOption.iconRTL : formatOption.icon
      }`}
      buttonClassName="toolbar-item spaced alignment"
      buttonAriaLabel="Formatting options for text alignment"
      buttonIconName={formatOption.image}
    >
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')
        }}
        className="item"
      >
        <Icon icon={TextLeft} className="icon" />
        <span className="text">Left Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')
        }}
        className="item"
      >
        <Icon icon={TextCenter} className="icon" />
        <span className="text">Center Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')
        }}
        className="item"
      >
        <Icon icon={TextRight} className="icon" />
        <span className="text">Right Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')
        }}
        className="item"
      >
        <Icon icon={Justify} className="icon" />
        <span className="text">Justify Align</span>
      </DropDownItem>

      <Divider />
    </DropDown>
  )
}

export default function ToolbarPlugin({ setIsLinkEditMode }) {
  const [editor] = useLexicalComposerContext()
  const [activeEditor, setActiveEditor] = useState(editor)
  const [blockType, setBlockType] = useState('paragraph')
  const [rootType, setRootType] = useState('root')
  const [selectedElementKey, setSelectedElementKey] = useState(null)
  const [fontSize, setFontSize] = useState('12px')
  const [fontColor, setFontColor] = useState('#000')
  const [bgColor, setBgColor] = useState('#fff')
  const [fontFamily, setFontFamily] = useState('Arial')
  const [elementFormat, setElementFormat] = useState('left')
  const [isLink, setIsLink] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isSubscript, setIsSubscript] = useState(false)
  const [isSuperscript, setIsSuperscript] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [modal, showModal] = useModal()
  const [isRTL, setIsRTL] = useState(false)
  const [codeLanguage, setCodeLanguage] = useState('')
  const [isEditable, setIsEditable] = useState(() => editor.isEditable())
  const [isImageCaption, setIsImageCaption] = useState(false)

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      if (activeEditor !== editor && $isEditorIsNestedEditor(activeEditor)) {
        const rootElement = activeEditor.getRootElement()
        setIsImageCaption(
          !!rootElement?.parentElement?.classList.contains(
            'image-caption-container'
          )
        )
      } else {
        setIsImageCaption(false)
      }

      const anchorNode = selection.anchor.getNode()
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent()
              return parent !== null && $isRootOrShadowRoot(parent)
            })

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow()
      }

      const elementKey = element.getKey()
      const elementDOM = activeEditor.getElementByKey(elementKey)

      // Update text format
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      setIsSubscript(selection.hasFormat('subscript'))
      setIsSuperscript(selection.hasFormat('superscript'))
      setIsCode(selection.hasFormat('code'))
      setIsRTL($isParentElementRTL(selection))

      // Update links
      const node = getSelectedNode(selection)
      const parent = node.getParent()
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true)
      } else {
        setIsLink(false)
      }

      const tableNode = $findMatchingParent(node, $isTableNode)
      if ($isTableNode(tableNode)) {
        setRootType('table')
      } else {
        setRootType('root')
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey)
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode)
          const type = parentList
            ? parentList.getListType()
            : element.getListType()
          setBlockType(type)
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType()
          if (type in blockTypeToBlockName) {
            setBlockType(type)
          }
          if ($isCodeNode(element)) {
            const language = element.getLanguage()
            setCodeLanguage(
              language ? CODE_LANGUAGE_MAP[language] || language : ''
            )
            return
          }
        }
      }
      // Handle buttons
      setFontColor(
        $getSelectionStyleValueForProperty(selection, 'color', '#000')
      )
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          'background-color',
          '#fff'
        )
      )
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial')
      )
      let matchingParent
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
        )
      }

      // If matchingParent is a valid node, pass it's format type
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
          ? node.getFormatType()
          : parent?.getFormatType() || 'left'
      )
    }
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      setFontSize(
        $getSelectionStyleValueForProperty(selection, 'font-size', '12px')
      )
    }
  }, [activeEditor, editor])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor)
        $updateToolbar()
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor, $updateToolbar])

  useEffect(() => {
    activeEditor.getEditorState().read(() => {
      $updateToolbar()
    })
  }, [activeEditor, $updateToolbar])

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable)
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar()
        })
      }),
      activeEditor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        COMMAND_PRIORITY_CRITICAL
      )
    )
  }, [$updateToolbar, activeEditor, editor])

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event = payload
        const { code, ctrlKey, metaKey } = event

        if (code === 'KeyK' && (ctrlKey || metaKey)) {
          event.preventDefault()
          let url
          if (!isLink) {
            setIsLinkEditMode(true)
            url = sanitizeUrl('https://')
          } else {
            setIsLinkEditMode(false)
            url = null
          }
          return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
        }
        return false
      },
      COMMAND_PRIORITY_NORMAL
    )
  }, [activeEditor, isLink, setIsLinkEditMode])

  const applyStyleText = useCallback(
    (styles, skipHistoryStack) => {
      activeEditor.update(
        () => {
          const selection = $getSelection()
          if (selection !== null) {
            $patchStyleText(selection, styles)
          }
        },
        skipHistoryStack ? { tag: 'historic' } : {}
      )
    },
    [activeEditor]
  )

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        const anchor = selection.anchor
        const focus = selection.focus
        const nodes = selection.getNodes()
        const extractedNodes = selection.extract()

        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          return
        }

        nodes.forEach((node, idx) => {
          // We split the first and last node by the selection
          // So that we don't format unselected text inside those nodes
          if ($isTextNode(node)) {
            // Use a separate variable to ensure TS does not lose the refinement
            let textNode = node
            if (idx === 0 && anchor.offset !== 0) {
              textNode = textNode.splitText(anchor.offset)[1] || textNode
            }
            if (idx === nodes.length - 1) {
              textNode = textNode.splitText(focus.offset)[0] || textNode
            }
            /**
             * If the selected text has one format applied
             * selecting a portion of the text, could
             * clear the format to the wrong portion of the text.
             *
             * The cleared text is based on the length of the selected text.
             */
            // We need this in case the selected text only has one format
            const extractedTextNode = extractedNodes[0]
            if (nodes.length === 1 && $isTextNode(extractedTextNode)) {
              textNode = extractedTextNode
            }

            if (textNode.__style !== '') {
              textNode.setStyle('')
            }
            if (textNode.__format !== 0) {
              textNode.setFormat(0)
              $getNearestBlockElementAncestorOrThrow(textNode).setFormat('')
            }
            node = textNode
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true)
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat('')
          }
        })
      }
    })
  }, [activeEditor])

  const onFontColorSelect = useCallback(
    (value, skipHistoryStack) => {
      applyStyleText({ color: value }, skipHistoryStack)
    },
    [applyStyleText]
  )

  const onBgColorSelect = useCallback(
    (value, skipHistoryStack) => {
      applyStyleText({ 'background-color': value }, skipHistoryStack)
    },
    [applyStyleText]
  )

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true)
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'))
    } else {
      setIsLinkEditMode(false)
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [activeEditor, isLink, setIsLinkEditMode])

  const onCodeLanguageSelect = useCallback(
    (value) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey)
          if ($isCodeNode(node)) {
            node.setLanguage(value)
          }
        }
      })
    },
    [activeEditor, selectedElementKey]
  )
  const insertGifOnClick = (payload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload)
  }

  const canViewerSeeInsertDropdown = !isImageCaption
  const canViewerSeeInsertCodeButton = !isImageCaption

  return (
    <div className="toolbar">
      <button
        disabled={!canUndo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(UNDO_COMMAND, undefined)
        }}
        title={IS_APPLE ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)'}
        type="button"
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <Icon icon={Undo} className="format" />
      </button>
      <button
        disabled={!canRedo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(REDO_COMMAND, undefined)
        }}
        title={IS_APPLE ? 'Redo (⌘Y)' : 'Redo (Ctrl+Y)'}
        type="button"
        className="toolbar-item"
        aria-label="Redo"
      >
        <Icon icon={Redo} className="format" />
      </button>
      <Divider />
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <>
          <BlockFormatDropDown
            disabled={!isEditable}
            blockType={blockType}
            rootType={rootType}
            editor={activeEditor}
          />
          <Divider />
        </>
      )}
      {blockType === 'code' ? (
        <DropDown
          disabled={!isEditable}
          buttonClassName="toolbar-item code-language"
          buttonLabel={getLanguageFriendlyName(codeLanguage)}
          buttonAriaLabel="Select language"
        >
          {CODE_LANGUAGE_OPTIONS.map(([value, name]) => {
            return (
              <DropDownItem
                className={`item ${dropDownActiveClass(
                  value === codeLanguage
                )}`}
                onClick={() => onCodeLanguageSelect(value)}
                key={value}
              >
                <span className="text">{name}</span>
              </DropDownItem>
            )
          })}
        </DropDown>
      ) : (
        <>
          <FontDropDown
            disabled={!isEditable}
            style={'font-family'}
            value={fontFamily}
            editor={activeEditor}
          />
          <Divider />
          <FontSize
            selectionFontSize={fontSize.slice(0, -2)}
            editor={activeEditor}
            disabled={!isEditable}
          />
          <Divider />
          <button
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
            }}
            className={'toolbar-item spaced ' + (isBold ? 'active' : '')}
            title={IS_APPLE ? 'Bold (⌘B)' : 'Bold (Ctrl+B)'}
            type="button"
            aria-label={`Format text as bold. Shortcut: ${
              IS_APPLE ? '⌘B' : 'Ctrl+B'
            }`}
          >
            <Icon icon={Bold} className="format" />
          </button>
          <button
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
            }}
            className={'toolbar-item spaced ' + (isItalic ? 'active' : '')}
            title={IS_APPLE ? 'Italic (⌘I)' : 'Italic (Ctrl+I)'}
            type="button"
            aria-label={`Format text as italics. Shortcut: ${
              IS_APPLE ? '⌘I' : 'Ctrl+I'
            }`}
          >
            <Icon icon={Italic} className="format" />
          </button>
          <button
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
            }}
            className={'toolbar-item spaced ' + (isUnderline ? 'active' : '')}
            title={IS_APPLE ? 'Underline (⌘U)' : 'Underline (Ctrl+U)'}
            type="button"
            aria-label={`Format text to underlined. Shortcut: ${
              IS_APPLE ? '⌘U' : 'Ctrl+U'
            }`}
          >
            <Icon icon={Underline} className="format" />
          </button>
          {canViewerSeeInsertCodeButton && (
            <button
              disabled={!isEditable}
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
              }}
              className={'toolbar-item spaced ' + (isCode ? 'active' : '')}
              title="Insert code block"
              type="button"
              aria-label="Insert code block"
            >
              <Icon icon={Code} className="format" />
            </button>
          )}
          <button
            disabled={!isEditable}
            onClick={insertLink}
            className={'toolbar-item spaced ' + (isLink ? 'active' : '')}
            aria-label="Insert link"
            title="Insert link"
            type="button"
          >
            <Icon icon={Link} className="format" />
          </button>
          <DropdownColorPicker
            disabled={!isEditable}
            buttonClassName="toolbar-item color-picker"
            buttonAriaLabel="Formatting text color"
            buttonIconName={FontColorIcon}
            color={fontColor}
            onChange={onFontColorSelect}
            title="text color"
          />
          <DropdownColorPicker
            disabled={!isEditable}
            buttonClassName="toolbar-item color-picker"
            buttonAriaLabel="Formatting background color"
            buttonIconName={BackGroundColorIcon}
            color={bgColor}
            onChange={onBgColorSelect}
            title="bg color"
          />
          <DropDown
            disabled={!isEditable}
            buttonClassName="toolbar-item spaced"
            buttonLabel=""
            buttonAriaLabel="Formatting options for additional text styles"
            buttonIconName={DropdownMoreIcon}
          >
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(
                  FORMAT_TEXT_COMMAND,
                  'strikethrough'
                )
              }}
              className={'item ' + dropDownActiveClass(isStrikethrough)}
              title="Strikethrough"
              aria-label="Format text with a strikethrough"
            >
              <Icon icon={Strikethrough} className="dropdown-icons" />
              <span className="text">Strikethrough</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')
              }}
              className={'item ' + dropDownActiveClass(isSubscript)}
              title="Subscript"
              aria-label="Format text with a subscript"
            >
              <Icon icon={Subscript} className="dropdown-icons" />
              <span className="text">Subscript</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')
              }}
              className={'item ' + dropDownActiveClass(isSuperscript)}
              title="Superscript"
              aria-label="Format text with a superscript"
            >
              <Icon icon={Superscript} className="dropdown-icons" />
              <span className="text">Superscript</span>
            </DropDownItem>
            <DropDownItem
              onClick={clearFormatting}
              className="item"
              title="Clear text formatting"
              aria-label="Clear all text formatting"
            >
              <Icon icon={Clear} className="dropdown-icons" />
              <span className="text">Clear Formatting</span>
            </DropDownItem>
          </DropDown>
          {canViewerSeeInsertDropdown && (
            <>
              <Divider />
              <DropDown
                disabled={!isEditable}
                buttonClassName="toolbar-item spaced"
                buttonLabel="Insert"
                buttonAriaLabel="Insert specialized editor node"
                buttonIconClassName="icon plus"
                buttonIconName={AddIcon}
              >
                <DropDownItem
                  onClick={() => {
                    showModal('Insert Image', (onClose) => (
                      <InsertImageDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ))
                  }}
                  className="item"
                >
                  <Icon icon={Image} className="dropdown-icons" />
                  <span className="text">Image</span>
                </DropDownItem>

                <DropDownItem
                  onClick={() => {
                    showModal('Insert Table', (onClose) => (
                      <InsertTableDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ))
                  }}
                  className="item"
                >
                  <Icon icon={Table} className="dropdown-icons" />
                  <span className="text">Table</span>
                </DropDownItem>

                <DropDownItem
                  onClick={() => {
                    showModal('Insert Columns Layout', (onClose) => (
                      <InsertLayoutDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ))
                  }}
                  className="item"
                >
                  <Icon icon={Columns} className="dropdown-icons" />
                  <span className="text">Columns Layout</span>
                </DropDownItem>
              </DropDown>
            </>
          )}
        </>
      )}
      <Divider />
      <ElementFormatDropdown
        disabled={!isEditable}
        value={elementFormat}
        editor={activeEditor}
        isRTL={isRTL}
      />

      {modal}
    </div>
  )
}
