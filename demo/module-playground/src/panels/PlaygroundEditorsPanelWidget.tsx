import * as React from 'react';
import { observer } from 'mobx-react';
import {
  CardWidget,
  MetaBarWidget,
  PanelButtonMode,
  PanelButtonWidget,
  ReactorPanelModel,
  SurfaceWidget,
  styled
} from '@journeyapps/reactor-mod';
import { DualEditorWidget, EditorWidget, MonacoLanguages } from '@journeyapps/reactor-mod-editor';
import { editor, Uri } from 'monaco-editor';
import { v4 } from 'uuid';

export interface PlaygroundEditorsPanelWidgetProps {
  model: ReactorPanelModel;
}

const TRIO_JSON_SNIPPET = `{
  "workspace": "editors",
  "features": ["json", "javascript", "markdown"],
  "theme": "reactor-dark"
}`;

const TRIO_JS_SNIPPET = `const createPanel = (name) => ({
  id: name.toLowerCase().replace(/\\s+/g, '-'),
  title: name,
  kind: 'demo'
});

console.log(createPanel('Editors playground'));`;

const TRIO_MD_SNIPPET = `# Editors playground

- JSON config preview
- JavaScript behavior snippet
- Markdown documentation note

\`\`\`ts
export const playgroundReady = true;
\`\`\`
`;

const DIFF_ORIGINAL = `function formatTodoLabel(label) {
  return label.trim();
}

const todo = formatTodoLabel("Write docs");
`;

const DIFF_UPDATED = `function formatTodoLabel(label) {
  return label.trim().toUpperCase();
}

const todo = formatTodoLabel("Write docs");
console.log({ todo });
`;

export const PlaygroundEditorsPanelWidget: React.FC<PlaygroundEditorsPanelWidgetProps> = observer(() => {
  const [trioJsonModel] = React.useState(() => {
    return editor.createModel(TRIO_JSON_SNIPPET, MonacoLanguages.JSON, Uri.parse(`${v4()}/playground/trio.json`));
  });
  const [trioJsModel] = React.useState(() => {
    return editor.createModel(TRIO_JS_SNIPPET, MonacoLanguages.JAVASCRIPT, Uri.parse(`${v4()}/playground/trio.js`));
  });
  const [trioMarkdownModel] = React.useState(() => {
    return editor.createModel(TRIO_MD_SNIPPET, MonacoLanguages.MARKDOWN, Uri.parse(`${v4()}/playground/trio.md`));
  });

  React.useEffect(() => {
    return () => {
      trioJsonModel.dispose();
      trioJsModel.dispose();
      trioMarkdownModel.dispose();
    };
  }, [trioJsonModel, trioJsModel, trioMarkdownModel]);

  const resetJsonModel = React.useCallback(() => {
    trioJsonModel.setValue(TRIO_JSON_SNIPPET);
  }, [trioJsonModel]);

  const resetJsModel = React.useCallback(() => {
    trioJsModel.setValue(TRIO_JS_SNIPPET);
  }, [trioJsModel]);

  const resetMarkdownModel = React.useCallback(() => {
    trioMarkdownModel.setValue(TRIO_MD_SNIPPET);
  }, [trioMarkdownModel]);

  return (
    <S.Container>
      <CardWidget
        title="Standard editor widgets"
        subHeading="Editable language playground for JSON, JavaScript and Markdown"
        sections={[
          {
            key: 'trio-editors',
            content: () => {
              return (
                <S.TrioGrid>
                  <S.TrioItem>
                    <S.TrioMeta>
                      <MetaBarWidget meta={[{ label: 'Language', value: 'JSON', color: 'cyan' }]} />
                    </S.TrioMeta>
                    <S.TrioFrame>
                      <EditorWidget
                        model={trioJsonModel}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false
                        }}
                      />
                    </S.TrioFrame>
                    <S.Buttons>
                      <PanelButtonWidget
                        label="Reset JSON"
                        icon="redo"
                        mode={PanelButtonMode.PRIMARY}
                        action={resetJsonModel}
                      />
                    </S.Buttons>
                  </S.TrioItem>
                  <S.TrioItem>
                    <S.TrioMeta>
                      <MetaBarWidget meta={[{ label: 'Language', value: 'JavaScript', color: 'green' }]} />
                    </S.TrioMeta>
                    <S.TrioFrame>
                      <EditorWidget
                        model={trioJsModel}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false
                        }}
                      />
                    </S.TrioFrame>
                    <S.Buttons>
                      <PanelButtonWidget
                        label="Reset JavaScript"
                        icon="redo"
                        mode={PanelButtonMode.PRIMARY}
                        action={resetJsModel}
                      />
                    </S.Buttons>
                  </S.TrioItem>
                  <S.TrioItem>
                    <S.TrioMeta>
                      <MetaBarWidget meta={[{ label: 'Language', value: 'Markdown', color: 'orange' }]} />
                    </S.TrioMeta>
                    <S.TrioFrame>
                      <EditorWidget
                        model={trioMarkdownModel}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          wordWrap: 'on'
                        }}
                      />
                    </S.TrioFrame>
                    <S.Buttons>
                      <PanelButtonWidget
                        label="Reset Markdown"
                        icon="redo"
                        mode={PanelButtonMode.PRIMARY}
                        action={resetMarkdownModel}
                      />
                    </S.Buttons>
                  </S.TrioItem>
                </S.TrioGrid>
              );
            }
          }
        ]}
      />

      <CardWidget
        title="Dual editor widget"
        subHeading="Side-by-side diff preview with custom headers"
        sections={[
          {
            key: 'dual-editor',
            content: () => {
              return (
                <S.DualEditorFrame>
                  <DualEditorWidget
                    original={DIFF_ORIGINAL}
                    value={DIFF_UPDATED}
                    language={MonacoLanguages.JAVASCRIPT}
                    options={{
                      readOnly: true,
                      minimap: {
                        enabled: false
                      },
                      renderOverviewRuler: false
                    }}
                    getLeftHeaderContent={() => (
                      <MetaBarWidget
                        meta={[
                          { label: 'Side', value: 'Original', color: 'orange' },
                          { label: 'State', value: 'Baseline', color: 'gray' }
                        ]}
                      />
                    )}
                    getRightHeaderContent={() => (
                      <MetaBarWidget
                        meta={[
                          { label: 'Side', value: 'Updated', color: 'cyan' },
                          { label: 'State', value: 'Proposed', color: 'green' }
                        ]}
                      />
                    )}
                  />
                </S.DualEditorFrame>
              );
            }
          }
        ]}
      />
    </S.Container>
  );
});

namespace S {
  export const Container = styled.div`
    padding: 12px;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    min-height: 100%;
    box-sizing: border-box;
  `;

  export const TrioGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;

    > * {
      min-width: 0;
    }

    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }
  `;

  export const TrioItem = styled.div`
    min-width: 0;
  `;

  export const TrioMeta = styled.div`
    margin-bottom: 6px;
  `;

  export const Buttons = styled.div`
    margin-top: 10px;
    display: flex;
    gap: 8px;
  `;

  export const TrioFrame = styled(SurfaceWidget)`
    position: relative;
    height: 200px;
    overflow: hidden;
  `;

  export const DualEditorFrame = styled(SurfaceWidget)`
    position: relative;
    height: 300px;
    overflow: hidden;
  `;
}
