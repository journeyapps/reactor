import * as monaco from 'monaco-editor';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as _ from 'lodash';
import { createRoot } from 'react-dom/client';
import { loadWASM } from 'onigasm';
import { Registry } from 'monaco-textmate';
import { wireTmGrammars } from 'monaco-editor-textmate';
import { GrammerMapping, GrammerMappingEntry, GrammerMappingType, MonacoLanguages } from '../languages/languages';
import { StandaloneServices } from 'monaco-editor/editor/standalone/browser/standaloneServices';
import { IThemeService } from 'monaco-editor/platform/theme/common/themeService';
import { AbstractStore, AbstractStoreListener } from '@journeyapps/reactor-mod';

export interface MonacoEditorType extends monaco.editor.IStandaloneCodeEditor {
  _standaloneKeybindingService: {
    updateResolver();
  };
  _actions: Map<
    string,
    {
      id: string;
      label: string;
    }
  >;

  _commandService: {
    executeCommand(id: string, ...args: any[]): Promise<any>;
  };
}

export interface MonacoStoreListener extends AbstractStoreListener {
  gotEditor: (editor: MonacoEditorType) => any;
}

export class MonacoStore extends AbstractStore<MonacoStoreListener> {
  editors: { [id: string]: MonacoEditorType };
  focusedEditor: MonacoEditorType;
  languages: GrammerMappingType;
  enabledLanguages: MonacoLanguages[];

  constructor() {
    super({
      name: 'MONACO_STORE'
    });
    this.editors = {};
    this.enabledLanguages = [];
    this.focusedEditor = null;
    this.languages = GrammerMapping;
  }

  registerLanguage(key: string, language: GrammerMappingEntry) {
    this.languages[key] = language;
  }

  enableLanguages(languages: MonacoLanguages[]) {
    this.enabledLanguages = languages;
  }

  getLanguage(languageID: MonacoLanguages) {
    const lang = _.find(this.languages, { monaco: languageID });
    if (!lang) {
      this.logger.error('Could not find Monaco language', languageID);
    }
    return lang;
  }

  getLanguageScope(languageID: MonacoLanguages) {
    return _.findKey(this.languages, { monaco: languageID });
  }

  protected async _init(): Promise<void> {
    // setup json
    await loadWASM(require('onigasm/lib/onigasm.wasm'));
    const registry = new Registry({
      getGrammarDefinition: async (scopeName) => {
        if (this.languages[scopeName]) {
          return {
            format: this.languages[scopeName].format,
            content: await (await fetch(this.languages[scopeName].url)).text()
          };
        }
        this.logger.error('Could not find TextMate scope mapping', scopeName);
      }
    });

    // map of monaco "language id's" to TextMate scopeNames
    const grammars = new Map();

    for (let language of this.enabledLanguages) {
      const mapping = this.getLanguage(language as MonacoLanguages);
      grammars.set(language, this.getLanguageScope(language as MonacoLanguages));

      if (mapping.language) {
        monaco.languages.register({
          id: mapping.monaco,
          ...mapping.language
        });
      }

      mapping.hook?.();
    }

    const themeService = StandaloneServices.get(IThemeService);

    // TextMate gives multiple scopes per token, but Monaco needs a single one.
    // wireTmGrammars needs access to the theme as a hack to get the correct tokens (returns the first token that is
    // matched in the theme).
    // If the editor is not provided, it doesn't break, but non-optimal tokens are returned.
    // We don't want to do this separately for each editor, so we setup a mock instance that provides access
    // to the global theme.
    const mockEditor = {
      _themeService: {
        getColorTheme() {
          return themeService._theme;
        }
      }
    } as any;
    await wireTmGrammars(monaco, registry, grammars, mockEditor);
  }

  async createHeadlessEditorInstance(): Promise<{ editor: MonacoEditorType; dispose: () => any }> {
    const m = document.createElement('div');
    m.style.display = 'none';
    document.body.append(m);
    const reactRoot = createRoot(m);
    const editor = await new Promise<MonacoEditorType>((resolve) => {
      reactRoot.render(
        <MonacoEditor
          editorDidMount={(editor) => {
            resolve(editor as unknown as MonacoEditorType);
          }}
        />
      );
    });
    return {
      editor,
      dispose: () => {
        reactRoot.unmount();
        m.remove();
      }
    };
  }

  registerEditor(editor: MonacoEditorType) {
    this.editors[editor.getId()] = editor;

    const listener1 = editor.onDidFocusEditorText(() => {
      this.focusedEditor = editor;
    });

    const listener2 = editor.onDidDispose(() => {
      listener1.dispose();
      listener2.dispose();
    });

    this.iterateListeners((list) => {
      list?.gotEditor(editor);
    });
  }

  deregisterEditor(editor: monaco.editor.IEditor) {
    delete this.editors[editor.getId()];
    if (this.focusedEditor === editor) {
      this.focusedEditor = null;
    }
  }
}
