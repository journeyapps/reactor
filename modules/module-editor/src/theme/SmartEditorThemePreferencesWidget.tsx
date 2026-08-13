import * as React from 'react';
import { ComboBoxStore, inject } from '@journeyapps/reactor-mod';
import { observer } from 'mobx-react';
import { MonacoThemeStore } from '../stores/MonacoThemeStore';
import { EditorThemePreferencesWidget } from './EditorThemePreferencesWidget';

@observer
export class SmartEditorThemePreferencesWidget extends React.Component {
  @inject(ComboBoxStore)
  accessor comboBoxStore: ComboBoxStore;

  @inject(MonacoThemeStore)
  accessor monacoThemeStore: MonacoThemeStore;

  render() {
    const currentTheme = this.monacoThemeStore.selectedTheme.entity;

    return (
      <EditorThemePreferencesWidget
        theme={currentTheme}
        key={currentTheme.key}
        save={(theme) => {
          if (theme.system) {
            const cloned = this.monacoThemeStore.clone();
            this.monacoThemeStore.patchTheme({
              ...cloned,
              theme: theme.theme
            });
          } else {
            this.monacoThemeStore.patchTheme(theme);
          }
        }}
      />
    );
  }
}
