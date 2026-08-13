import { keyType, Shortcut, ShortcutChord } from '@journeyapps/reactor-mod';
import { MonacoShortcutHandler } from './MonacoShortcutHandler';
import { MonacoMap } from './MonacoShortcutMap';
import { KeyCodeChord } from 'monaco-editor/base/common/keybindings';
import { MonacoStoreAction } from '../stores/keybindings/definitions';

export class MonacoShortcut extends Shortcut<MonacoShortcutHandler> {
  dispose() {
    this.action.handler.store.unbindAction(
      this.action.id,
      [this.getAsMonacoPrimitive(true), this.getAsMonacoPrimitive(false)].filter((p) => !!p)
    );
  }

  getMonacoStoreAction(): MonacoStoreAction {
    return this.action.handler.store.getActionFromID(this.action.id);
  }

  getAsMonacoPrimitive(primary: boolean) {
    if (!primary && this.chord.secondary.length === 0) {
      return null;
    }
    return new KeyCodeChord(
      !!this.chord.getShortcutKey(keyType.CTRL, primary),
      !!this.chord.getShortcutKey(keyType.SHIFT, primary),
      !!this.chord.getShortcutKey(keyType.ALT, primary),
      !!this.chord.getShortcutKey(keyType.META, primary),
      MonacoMap[this.chord.getShortcutKey(keyType.STANDARD, primary)?.key || undefined]
    );
  }

  setChord(chord: ShortcutChord, fire = true): void {
    super.setChord(chord, fire);
    this.action.handler.store.updateAction({
      action: this.getMonacoStoreAction(),
      binding: this.getAsMonacoPrimitive(true),
      binding2: this.getAsMonacoPrimitive(false)
    });
  }
}
