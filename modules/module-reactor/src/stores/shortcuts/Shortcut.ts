import { ShortcutHandler, ShortcutHandlerAction } from './ShortcutHandler';
import { observable, toJS } from 'mobx';
import * as _ from 'lodash';
import { BaseObserver } from '@journeyapps/common-utils';

export enum keyType {
  SHIFT = 'shift',
  META = 'meta',
  CTRL = 'ctrl',
  ALT = 'alt',
  STANDARD = 'standard'
}

export interface ShortcutKey {
  type: keyType;
  key?: string;
}

export interface ShortcutListener {
  deleted?: () => any;
  changed?: () => any;
}

export interface ShortcutSerialized {
  primary: ShortcutKey[];
  secondary: ShortcutKey[];
  action: string;
}

export class ShortcutChord {
  primary: ShortcutKey[];
  secondary: ShortcutKey[];
  uuid: string;

  constructor(primary: ShortcutKey[] = [], secondary: ShortcutKey[] = []) {
    this.primary = primary;
    this.secondary = secondary;
    this.uuid = JSON.stringify([toJS(this.primary), toJS(this.secondary)]);
  }

  matches(primary: ShortcutKey[] = [], secondary: ShortcutKey[] = []) {
    return _.isEqual(this.primary, primary) && _.isEqual(this.secondary, secondary);
  }

  hasSecondary() {
    return this.secondary && this.secondary.length > 0;
  }

  getAsArray(): ShortcutKey[][] {
    if (!this.secondary || this.secondary.length === 0) {
      return [this.primary];
    }
    return [this.primary, this.secondary];
  }

  getShortcutKey(type: keyType, primary: boolean = true): ShortcutKey {
    for (let k of primary ? this.primary : this.secondary) {
      if (k.type === type) {
        return k;
      }
    }
    return null;
  }
}

export abstract class Shortcut<
  H extends ShortcutHandler = ShortcutHandler<any>
> extends BaseObserver<ShortcutListener> {
  @observable
  accessor chord: ShortcutChord;
  enabled: boolean;
  action: ShortcutHandlerAction<H>;

  constructor(action: ShortcutHandlerAction<H>) {
    super();
    this.chord = new ShortcutChord();
    this.enabled = true;
    this.action = action;
  }

  abstract dispose();

  enable(enabled: boolean) {
    this.enabled = enabled;
  }

  setChord(chord: ShortcutChord, fire: boolean = true) {
    this.chord = chord;
    if (fire) {
      this.iterateListeners((listener) => {
        if (listener.changed) {
          listener.changed();
        }
      });
    }
  }

  serialize(): ShortcutSerialized {
    return {
      primary: this.chord.primary,
      secondary: this.chord.secondary,
      action: this.action.id
    };
  }

  deserialize(data: ShortcutSerialized) {
    this.setChord(new ShortcutChord(data.primary, data.secondary), false);
  }

  delete() {
    this.dispose();
    this.iterateListeners((listener) => {
      if (listener.deleted) {
        listener.deleted();
      }
    });
  }
}
