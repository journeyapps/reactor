import { DARK_THEME, normalizeVSCodeTheme, VSIXTheme } from '../theme/theme-utils';
import { AbstractStore, EntitySetting, EntitySettingOptions, ioc, Themes, ThemeStore } from '@journeyapps/reactor-mod';
import * as _ from 'lodash';
import * as monaco from 'monaco-editor';
import { editor } from 'monaco-editor';
import { StoredThemesSettings } from '../settings/StoredThemesSettings';
import * as uuid from 'uuid';
import { EditorEntities } from '../entities/EditorEntities';
import { MonacoSystemThemeStore } from './MonacoSystemThemeStore';
import IStandaloneThemeData = editor.IStandaloneThemeData;

export interface EditorTheme {
  label: string;
  theme: monaco.editor.IStandaloneThemeData;
  key: string;
  system: boolean;
  compatibility: boolean;
}

export class EditorThemeControl extends EntitySetting<EditorTheme> {
  store: MonacoThemeStore;

  constructor(options: EntitySettingOptions<EditorTheme>, store: MonacoThemeStore) {
    super(options);
    this.store = store;
  }

  async reset() {
    // this ensures that resets cause the editor theme to follow the selected IDE theme
    const selectedTheme = await ioc.get(ThemeStore).selectedTheme.waitForReady();
    const monacoTheme = this.store.getMonacoThemeForReactorTheme(selectedTheme.entity.key);
    this.setItem(monacoTheme);
  }
}

export class MonacoThemeStore extends AbstractStore {
  selectedTheme: EntitySetting<EditorTheme>;
  storedThemes: StoredThemesSettings;
  systemThemeStore: MonacoSystemThemeStore;

  constructor(systemThemeStore?: MonacoSystemThemeStore) {
    super({
      name: 'MONACO_THEME_STORE'
    });
    this.systemThemeStore = systemThemeStore || new MonacoSystemThemeStore();
    const systemThemes = this.systemThemeStore.getSystemThemes();
    const defaultTheme = systemThemes[Themes.REACTOR];
    this.selectedTheme = this.addControl(
      new EditorThemeControl(
        {
          type: EditorEntities.THEME,
          defaultEntity: defaultTheme,
          category: 'User',
          key: 'selected-editor-theme',
          name: 'Selected code theme',
          description: 'This is the syntax-color theme in the IDE',
          changed: (item) => {
            if (!!item) {
              this.applyTheme(item.theme);
            }
          }
        },
        this
      )
    );
    this.storedThemes = this.addControl(new StoredThemesSettings());
  }

  protected async _init(): Promise<void> {
    this.applyTheme(this.selectedTheme.entity.theme);
  }

  protected applyTheme(theme: IStandaloneThemeData) {
    monaco.editor.defineTheme(DARK_THEME, theme);
    monaco.editor.setTheme(DARK_THEME);
  }

  clone(): EditorTheme {
    const editorTheme: EditorTheme = {
      theme: this.selectedTheme.entity.theme,
      key: uuid.v4(),
      label: `${this.selectedTheme.entity.label} copy`,
      system: false,
      compatibility: this.selectedTheme.entity.compatibility
    };
    this.storedThemes.themes.push(editorTheme);
    this.storedThemes.save();
    this.selectedTheme.setItem(editorTheme);
    return editorTheme;
  }

  patchTheme(editorTheme: EditorTheme) {
    const index = _.findIndex(this.storedThemes.themes, { key: editorTheme.key });
    this.storedThemes.themes[index] = editorTheme;
    this.storedThemes.save();
    this.selectedTheme.setItem(editorTheme);
    this.selectedTheme.save();
    monaco.editor.defineTheme(DARK_THEME, editorTheme.theme);
    monaco.editor.setTheme(DARK_THEME);
  }

  deleteTheme(editorTheme: EditorTheme) {
    if (this.selectedTheme.entity.key === editorTheme.key) {
      this.selectedTheme.setItem(_.values(this.getSystemThemes())[0]);
    }

    // delete theme
    const index = _.findIndex(this.storedThemes.themes, { key: editorTheme.key });
    this.storedThemes.themes.splice(index, 1);
    this.storedThemes.save();
  }

  addTheme(theme: VSIXTheme) {
    const editorTheme: EditorTheme = {
      theme: normalizeVSCodeTheme(theme),
      key: uuid.v4(),
      label: theme.name,
      system: false,
      compatibility: false
    };
    this.storedThemes.themes.push(editorTheme);
    this.storedThemes.save();
    this.selectedTheme.setItem(editorTheme);
  }

  getMonacoThemeForReactorTheme(theme: string): EditorTheme | null {
    return this.systemThemeStore.getMonacoThemeForReactorTheme(theme);
  }

  getSystemThemes(): { [key: string]: EditorTheme } {
    return this.systemThemeStore.getSystemThemes();
  }

  async getTheme(key: string): Promise<EditorTheme> {
    await this.storedThemes.waitForReady();
    return this.getThemes()[key] || null;
  }

  getThemes(): { [key: string]: EditorTheme } {
    return {
      ...this.getSystemThemes(),
      ..._.mapKeys(this.storedThemes.themes, (t) => t.key)
    };
  }
}
