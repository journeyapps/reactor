import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { MonacoDiffEditor, MonacoDiffEditorProps } from 'react-monaco-editor';
import { styled } from '@journeyapps/reactor-mod';
import { themed } from '../theme-reactor/editor-theme-fragment';
import { IDisposable } from 'monaco-editor';
import { DARK_THEME } from '../theme/theme-utils';
import _ from 'lodash';

export interface DualEditorWidgetProps extends MonacoDiffEditorProps {
  getLeftHeaderContent: () => React.JSX.Element;
  getRightHeaderContent: () => React.JSX.Element;
}

export const DualEditorWidget: React.FC<DualEditorWidgetProps> = (props) => {
  const [listener, setListener] = useState<IDisposable>();
  const leftRef = useRef<HTMLDivElement>(null);

  const ref = React.useRef<HTMLDivElement>(null);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    return () => {
      listener?.dispose();
    };
  }, []);

  return (
    <S.Container>
      {!compactMode ? (
        <S.Header>
          <S.Part ref={leftRef}>{props.getLeftHeaderContent?.()}</S.Part>
          <S.Part2>{props.getRightHeaderContent?.()}</S.Part2>
        </S.Header>
      ) : null}
      <S.EditorContainer ref={ref}>
        <MonacoDiffEditor
          {...props}
          options={{
            ...props.options,
            renderSideBySide: true,
            automaticLayout: true
          }}
          theme={DARK_THEME}
          editorDidMount={(editor, monaco) => {
            props.editorDidMount?.(editor, monaco);
            _.defer(() => {
              monaco.editor.setTheme(DARK_THEME);
            });

            const doLayout = () => {
              const info = editor.getOriginalEditor().getLayoutInfo();

              // this is the only way i can see to detect if it's changed to an inline mode
              setCompactMode(info.viewportColumn === 1);

              if (!leftRef.current) {
                return;
              }
              leftRef.current.style.width = `${info.width}px`;
            };

            const dispose1 = editor.getOriginalEditor().onDidLayoutChange((e) => {
              doLayout();
            });
            doLayout();
            setListener(dispose1);
          }}
        />
      </S.EditorContainer>
    </S.Container>
  );
};

namespace S {
  export const EditorContainer = themed.div`
    position: relative;
    flex-grow: 1;
    overflow: hidden;
  `;

  export const Container = themed.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: absolute;

    .monaco-editor {
      outline: none;
    }
  `;

  export const Header = styled.div`
    display: flex;
    align-items: center;
    flex-grow: 0;
    color: ${(p) => p.theme.panels.titleBackground};
  `;

  export const Part = styled.div`
    display: flex;
    align-items: center;
    box-sizing: border-box;
    border-right: solid 2px ${(p) => p.theme.panels.divider};

    &:last-of-type {
      border-right: 0;
    }
  `;

  export const Part2 = styled(Part)`
    flex-grow: 1;
  `;
}
