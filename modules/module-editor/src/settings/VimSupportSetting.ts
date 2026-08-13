import { BooleanSetting, ioc, PrefsStore } from '@journeyapps/reactor-mod';

export class EnableVimSetting extends BooleanSetting {
  static KEY = '/editor/vim-enabled';

  constructor() {
    super({
      name: 'Enable Vim keybindings',
      category: 'Advanced',
      checked: false,
      key: EnableVimSetting.KEY
    });
  }

  static enabled() {
    return EnableVimSetting.get().checked;
  }

  static get(): EnableVimSetting {
    return ioc.get(PrefsStore).getPreference(EnableVimSetting.KEY);
  }
}
