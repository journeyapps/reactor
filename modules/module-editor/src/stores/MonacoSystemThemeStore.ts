import { AbstractStore, Themes } from '@journeyapps/reactor-mod';
import { COUPLED_IDE_THEMES } from '../theme/theme-utils';
import * as _ from 'lodash';
import type { EditorTheme } from './MonacoThemeStore';

export type MonacoSystemTheme = {
  coupledIDEThemeKey: string;
  editorTheme: EditorTheme;
};

export class MonacoSystemThemeStore extends AbstractStore {
  private systemThemes: Set<MonacoSystemTheme>;

  constructor() {
    super({
      name: 'MONACO_SYSTEM_THEME_STORE'
    });
    this.systemThemes = new Set();
    this.registerBuiltInThemes();
  }

  registerSystemTheme(theme: MonacoSystemTheme) {
    for (const existingTheme of Array.from(this.systemThemes)) {
      if (existingTheme.editorTheme.key === theme.editorTheme.key) {
        this.systemThemes.delete(existingTheme);
      }
    }
    this.systemThemes.add({
      coupledIDEThemeKey: theme.coupledIDEThemeKey,
      editorTheme: {
        ...theme.editorTheme,
        system: true
      }
    });
  }

  getMonacoThemeForReactorTheme(themeKey: string): EditorTheme | null {
    const direct = Array.from(this.systemThemes).find((theme) => theme.editorTheme.key === themeKey);
    if (direct) {
      return direct.editorTheme;
    }

    const coupled = Array.from(this.systemThemes).find((theme) => theme.coupledIDEThemeKey === themeKey);
    if (coupled) {
      return coupled.editorTheme;
    }

    return null;
  }

  getSystemThemes(): { [key: string]: EditorTheme } {
    return _.mapKeys(
      Array.from(this.systemThemes.values()).map((theme) => theme.editorTheme),
      (theme) => theme.key
    );
  }

  private registerBuiltInThemes() {
    this.registerSystemTheme({
      coupledIDEThemeKey: Themes.JOURNEY,
      editorTheme: {
        key: Themes.JOURNEY,
        label: 'Journey',
        theme: COUPLED_IDE_THEMES[Themes.JOURNEY],
        system: true,
        compatibility: false
      }
    });
    this.registerSystemTheme({
      coupledIDEThemeKey: Themes.REACTOR,
      editorTheme: {
        key: Themes.REACTOR,
        label: 'Reactor',
        theme: COUPLED_IDE_THEMES[Themes.REACTOR],
        system: true,
        compatibility: false
      }
    });
    this.registerSystemTheme({
      coupledIDEThemeKey: Themes.REACTOR_DARK,
      editorTheme: {
        key: Themes.REACTOR_DARK,
        label: 'Reactor dark',
        theme: COUPLED_IDE_THEMES[Themes.REACTOR_DARK],
        system: true,
        compatibility: false
      }
    });
    this.registerSystemTheme({
      coupledIDEThemeKey: Themes.OXIDE,
      editorTheme: {
        key: Themes.OXIDE,
        label: 'OXIDE',
        theme: COUPLED_IDE_THEMES[Themes.OXIDE],
        system: true,
        compatibility: true
      }
    });
    this.registerSystemTheme({
      coupledIDEThemeKey: Themes.SCARLET,
      editorTheme: {
        key: Themes.SCARLET,
        label: 'Scarlet',
        theme: COUPLED_IDE_THEMES[Themes.SCARLET],
        system: true,
        compatibility: true
      }
    });
    this.registerSystemTheme({
      coupledIDEThemeKey: Themes.HEXAGON,
      editorTheme: {
        key: Themes.HEXAGON,
        label: 'Hexagon',
        theme: COUPLED_IDE_THEMES[Themes.HEXAGON],
        system: true,
        compatibility: true
      }
    });
    this.registerSystemTheme({
      coupledIDEThemeKey: Themes.BUNNY,
      editorTheme: {
        key: Themes.BUNNY,
        label: 'Bunny',
        theme: COUPLED_IDE_THEMES[Themes.BUNNY],
        system: true,
        compatibility: true
      }
    });
    this.registerSystemTheme({
      coupledIDEThemeKey: Themes.REACTOR_LIGHT,
      editorTheme: {
        key: Themes.REACTOR_LIGHT,
        label: 'Reactor Light',
        theme: COUPLED_IDE_THEMES[Themes.REACTOR_LIGHT],
        system: true,
        compatibility: true
      }
    });
  }
}
