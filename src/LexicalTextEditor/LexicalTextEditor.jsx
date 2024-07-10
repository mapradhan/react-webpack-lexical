/* eslint-disable */
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import React from 'react'
import {  useSettings } from './context/SettingsContext'
import Editor from './Editor'
import Nodes from './nodes/Nodes'
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme'
import './index.css'

function LexicalTextEditor() {
  const {
    settings: { isCollab, emptyEditor },
  } = useSettings()

  const initialConfig = {
    namespace: 'Playground',
    nodes: [...Nodes],
    onError: (error) => {
      throw error
    },
    theme: PlaygroundEditorTheme,
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
          <div className="editor-shell">
              <Editor />
            </div>
    </LexicalComposer>
  )
}

export default function PlaygroundApp() {
  return (
        <LexicalTextEditor />
  )
}
