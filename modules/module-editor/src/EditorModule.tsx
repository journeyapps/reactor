import {
  ActionStore,
  AbstractReactorModule,
  CMDPalletStore,
  PrefsStore,
  ShortcutStore,
  System,
  ThemeStore,
  WorkspaceStore,
  ReactorModuleInitEvent,
  ReactorModuleRegisterEvent
} from '@journeyapps/reactor-mod';
import { MonacoStore } from './stores/MonacoStore';
import { MonacoShortcutHandler } from './shortcuts/MonacoShortcutHandler';
import { MonacoCommandPalletSearchEngine } from './MonacoCommandPalletSearchEngine';
import * as React from 'react';
import { MonacoThemeStore } from './stores/MonacoThemeStore';
import { MonacoSystemThemeStore } from './stores/MonacoSystemThemeStore';
import { ChangeEditorThemeAction } from './actions/ChangeEditorThemeAction';
import { SmartEditorThemePreferencesWidget } from './theme/SmartEditorThemePreferencesWidget';
import { patchThemeService } from './theme/patchThemeService';
import { EnableVimSetting } from './settings/VimSupportSetting';
import { theme } from './theme-reactor/editor-theme-fragment';
import { MonacoKeybindingStore } from './stores/keybindings/MonacoKeybindingStore';
import { EditorThemeEntityDefinition } from './entities/EditorThemeEntityDefinition';

const EDITOR_LAYER_MANAGER_INITIAL_Z_INDEX = 10;

export class EditorModule extends AbstractReactorModule {
  constructor() {
    super({
      name: 'Monaco editor'
    });
  }

  register(event: ReactorModuleRegisterEvent) {
    const { ioc } = event;
    const prefsStore = ioc.get(PrefsStore);
    const themeStore = ioc.get(ThemeStore);
    const cmdPalletStore = ioc.get(CMDPalletStore);
    const system = ioc.get(System);
    const workspaceStore = ioc.get(WorkspaceStore);

    workspaceStore.engine.layerManager.setInitialZIndex(EDITOR_LAYER_MANAGER_INITIAL_Z_INDEX);

    // new instances
    const monacoSystemThemeStore = new MonacoSystemThemeStore();
    const monacoThemeStore = new MonacoThemeStore(monacoSystemThemeStore);
    const monacoStore = new MonacoStore();
    const monacoKeybindingsStore = new MonacoKeybindingStore({
      editorStore: monacoStore,
      cmdPaletteStore: cmdPalletStore
    });
    const handler = new MonacoShortcutHandler({
      keybindingStore: monacoKeybindingsStore
    });
    const commandPallet = new MonacoCommandPalletSearchEngine({
      keybindingStore: monacoKeybindingsStore,
      handler
    });

    // register stores
    event.registerStore(MonacoStore, monacoStore);
    event.registerStore(MonacoSystemThemeStore, monacoSystemThemeStore);
    event.registerStore(MonacoThemeStore, monacoThemeStore);
    event.registerStore(MonacoKeybindingStore, monacoKeybindingsStore);

    ioc.get(ShortcutStore).registerHandler(handler);
    cmdPalletStore.registerSearchEngine(commandPallet);
    prefsStore.registerPreferenceCategory({
      key: 'editor',
      name: 'Code Theme',
      generateUI: () => {
        return <SmartEditorThemePreferencesWidget />;
      }
    });
    prefsStore.registerPreference(new EnableVimSetting());
    ioc.get(ActionStore).registerAction(new ChangeEditorThemeAction());
    system.registerDefinition(new EditorThemeEntityDefinition());

    // changing an IDE theme should change the corresponding editor theme
    const selectedTheme = themeStore.selectedTheme;
    selectedTheme.registerListener({
      updated(): any {
        const monacoTheme = monacoThemeStore.getMonacoThemeForReactorTheme(selectedTheme.entity.key);
        if (monacoTheme) {
          monacoThemeStore.selectedTheme.setItem(monacoTheme);
        }
      }
    });

    themeStore.addThemeFragment(theme);
    patchThemeService();
  }

  async init(event: ReactorModuleInitEvent): Promise<any> {
    // Registered stores are initialized by the Reactor boot process.
  }
}
