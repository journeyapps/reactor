import * as React from 'react';
import { useEffect, useState } from 'react';
import { ioc, ThemeStore } from '@journeyapps/reactor-mod';
import * as monaco from 'monaco-editor';
import { MonacoEditorType, MonacoStore } from '../stores/MonacoStore';
import { EnableVimSetting } from '../settings/VimSupportSetting';
import { observer } from 'mobx-react';
import * as vim from 'monaco-vim';
import { theme, themed } from '../theme-reactor/editor-theme-fragment';
import { MonacoEditorWidget } from './MonacoEditorWidget';

export interface OxideEditorEvents {
  gotFocus?: (editor: monaco.editor.IStandaloneCodeEditor) => any;
  getEditor?: (editor: monaco.editor.IStandaloneCodeEditor) => any;
}

export interface EditorWidgetProps {
  options?: Partial<monaco.editor.IEditorConstructionOptions>;
  model: monaco.editor.ITextModel;
  events?: OxideEditorEvents;
  patchOxideShortcuts?: boolean;
  forwardRef?: React.RefObject<HTMLDivElement>;
}

namespace S {
  export const Background = themed.div`
    display: flex;
    height: 100%;
    width: 100%;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  `;

  export const Monaco = themed.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    // note: there is really no other way to do this
    // note: we have this code since we have the monaco editor background
    // set as transparent for a plethora of other reasons not listed here
    .sticky-widget,.monaco-quick-open-widget {
      background-color: ${(p) => p.theme.editor.backgroundSticky} !important;
    }
  `;
}

export const EditorWidget: React.FC<EditorWidgetProps> = observer((props) => {
  const monacoStore = ioc.get(MonacoStore);
  const mergedSuggestOptions = {
    showInlineDetails: true,
    ...(props.options?.suggest || {})
  };
  const { suggest: _ignoredSuggest, ...restOptions } = props.options || {};

  const ref = props.forwardRef || React.useRef<HTMLDivElement>(null);
  const [focusDisposer, setFocusDisposer] = useState(null);
  const e = React.useRef<any>(null);

  useEffect(() => {
    return () => {
      if (e.current) {
        monacoStore.deregisterEditor(e.current);
      }
      focusDisposer?.dispose();
    };
  }, []);

  return (
    <S.Background ref={ref}>
      <S.Monaco>
        <MonacoEditorWidget
          model={props.model}
          options={{
            minimap: {
              enabled: false
            },
            suggest: mergedSuggestOptions,
            automaticLayout: true,
            // https://github.com/microsoft/monaco-editor/issues/1993
            // this was default true, which caused the model drift monitor to kick in and report errors (correctly)
            trimAutoWhitespace: false,
            // autoIndent is required for XML files, not necessarily for others
            autoIndent: 'full',
            fixedOverflowWidgets: true,
            ...restOptions
          }}
          editorDidMount={(editor: MonacoEditorType) => {
            e.current = editor;
            // !------ react-monaco fixes their API (it broke after upgrade) -----
            requestAnimationFrame(() => {
              /**
               * There are certain conditions where patching the monaco shortcuts is not required.
               * (patching shortcuts also introduces a slight overhead, which is why we allow this to be configurable)
               * furthermore: some editors will always be readonly such as search previews and dont need these shortcuts
               */
              if (props.patchOxideShortcuts == null || props.patchOxideShortcuts === true) {
                monacoStore.registerEditor(editor);
              }

              props.events?.getEditor?.(editor);
              // !------------------------------------------------------------------

              if (props.events?.gotFocus) {
                const focusDisposer = editor.onDidFocusEditorWidget(() => {
                  props.events.gotFocus(editor);
                });
                setFocusDisposer(focusDisposer);
              }

              if (EnableVimSetting.enabled()) {
                vim.initVimMode(editor);
              }
            });
          }}
        />
      </S.Monaco>
    </S.Background>
  );
});
