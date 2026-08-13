import { AbstractSetting } from '@journeyapps/reactor-mod';
import { observable, toJS, IObservableArray, makeObservable } from 'mobx';
import { EditorTheme } from '../stores/MonacoThemeStore';

export class StoredThemesSettings extends AbstractSetting {
  static KEY = 'EDITOR_VS_THEMES';

  @observable
  accessor themes: IObservableArray<EditorTheme>;

  constructor() {
    super({
      key: StoredThemesSettings.KEY
    });
    this.themes = [] as IObservableArray;
  }

  reset() {
    this.themes.clear();
  }

  protected serialize() {
    return {
      items: toJS(this.themes)
    };
  }

  protected deserialize(data: any) {
    this.themes.replace(data.items);
  }
}
