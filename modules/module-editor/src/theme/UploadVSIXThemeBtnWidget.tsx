import * as React from 'react';
import { PanelButtonWidget, ComboBoxStore, inject, MousePosition } from '@journeyapps/reactor-mod';
import { selectFile, readFileAsArrayBuffer, MimeTypes } from '@journeyapps/reactor-lib-utils';
import * as path from 'path';
import JSZip from 'jszip';
import * as json5 from 'json5';
import { VSIXTheme, VSIXPackage } from './theme-utils';
import { MonacoThemeStore } from '../stores/MonacoThemeStore';
import { Log } from '@journeyapps-labs/common-logger';

export interface EditorThemePreferencesWidgetProps {
  gotTheme: (theme: VSIXTheme) => any;
}

const SUPPORTED_EXTENSIONS = [
  /**
   * Visual studio extension
   */
  '.vsix'
];

export class UploadVSIXThemeBtnWidget extends React.Component<EditorThemePreferencesWidgetProps> {
  @inject(ComboBoxStore)
  accessor comboBoxStore: ComboBoxStore;

  @inject(MonacoThemeStore)
  accessor themeStore: MonacoThemeStore;

  constructor(props: EditorThemePreferencesWidgetProps) {
    super(props);
    this.state = {};
  }

  async doUpload(event: MousePosition, file: File) {
    if (!file) {
      return;
    }

    // check for supported extensions
    if (SUPPORTED_EXTENSIONS.indexOf(path.extname(file.name)) === -1) {
      return;
    }
    const data = await readFileAsArrayBuffer(file);
    const new_zip = new JSZip();
    const extraction = await new_zip.loadAsync(data);

    //load package.json
    try {
      const packageContent = await extraction.files['extension/package.json'].async('text');
      const content: VSIXPackage = json5.parse(packageContent);

      // extension might now have themes
      if (!content.contributes.themes || content.contributes.themes.length === 0) {
        return;
      }

      let selected = content.contributes.themes[0].path;
      if (content.contributes.themes.length > 1) {
        const userSelected = await this.comboBoxStore.showComboBox(
          content.contributes.themes.map((theme) => {
            return {
              key: theme.path,
              title: theme.label
            };
          }),
          event
        );
        if (!userSelected) {
          return;
        }
        selected = userSelected.key;
      }

      const themeFile = path.join('extension', selected);

      const themeContent = await extraction.files[themeFile].async('text');
      const themeObject: VSIXTheme = json5.parse(themeContent);

      this.props.gotTheme(themeObject);
    } catch (ex) {
      this.themeStore.logger.error('Failed to import VS Code theme package', Log.bold(Log.cyan(file.name)), ex);
      return;
    }
  }

  render() {
    return (
      <PanelButtonWidget
        action={async (event, loading) => {
          const file = await selectFile({
            mimeTypes: [MimeTypes.VSIX]
          });
          loading(true);
          await this.doUpload(event, file);
          loading(false);
        }}
        label="Upload VSCode theme"
      />
    );
  }
}
