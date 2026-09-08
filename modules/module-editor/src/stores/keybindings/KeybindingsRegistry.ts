import { KeybindingsRegistry as K2 } from 'monaco-editor/platform/keybinding/common/keybindingsRegistry';
import { EditorContextKeys } from 'monaco-editor/editor/common/editorContextKeys';
import { ContextKey, Keybinding } from './definitions';
import * as _ from 'lodash';
import { compareChords } from './utils';
import { BaseObserver } from '@journeyapps/common-utils';

export interface ResolvedKeybindingItem {
  command: string;
  keybinding: Keybinding;
  when: ContextKey;
}

export interface CommandBindingsListener {
  updated: () => any;
}

export abstract class CommandBindings extends BaseObserver<CommandBindingsListener> {
  protected custom: Keybinding[];

  constructor() {
    super();
    this.custom = [];
  }

  updated() {
    this.iterateListeners((cb) => cb.updated?.());
  }

  abstract serialize(): ResolvedKeybindingItem[];

  abstract getDefaults(): Keybinding[];

  addKeybinding(binding: Keybinding) {
    this.custom.push(binding);
    this.updated();
  }

  deleteKeybinding(binding: Keybinding) {
    const index = this.custom.findIndex((c) => compareChords(c, binding));
    if (index === -1) {
      return;
    }
    this.custom.splice(index, 1);
    this.updated();
  }
}

export class CustomCommandBindings extends CommandBindings {
  constructor(protected command: string) {
    super();
  }

  serialize(): ResolvedKeybindingItem[] {
    if (!this.custom) {
      return [];
    }

    return this.custom.map((c) => {
      return {
        command: this.command,
        keybinding: c,
        when: EditorContextKeys.editorTextFocus
      };
    });
  }

  getDefaults(): Keybinding[] {
    return [];
  }
}

export class ExistingCommandBindings extends CommandBindings {
  touched: boolean;

  constructor(
    protected command: string,
    public defaults: ResolvedKeybindingItem[]
  ) {
    super();
    this.touched = false;
  }

  addKeybinding(binding: Keybinding) {
    this.touched = true;
    super.addKeybinding(binding);
  }

  deleteKeybinding(binding: Keybinding) {
    this.touched = true;
    super.deleteKeybinding(binding);
  }

  serialize(): ResolvedKeybindingItem[] {
    if (!this.touched) {
      return this.defaults;
    }

    return this.custom.map((c) => {
      // first try existing
      const existing = this.defaults.find((b) => {
        return compareChords(b.keybinding, c);
      });
      if (existing) {
        return existing;
      }

      // okay there's one, this is easy
      if (this.defaults.length === 1) {
        return {
          ...this.defaults[0],
          keybinding: c
        };
      }

      // rip, just make a new one, even though the 'when' condition might not contain other
      // required entries such as EditorContextKeys.XYZ
      return {
        command: this.command,
        keybinding: c,
        when: EditorContextKeys.editorTextFocus
      };
    });
  }

  getDefaults(): Keybinding[] {
    return this.defaults.map((d) => d.keybinding);
  }
}

export interface KeybindingsRegistryListener {
  saved: () => any;
}

export class KeybindingsRegistry extends BaseObserver<KeybindingsRegistryListener> {
  map: Map<string, CommandBindings>;

  constructor() {
    super();
    this.map = new Map();
  }

  getCommandKeybinding(id: string) {
    if (!this.map.has(id)) {
      const binding = new CustomCommandBindings(id);
      binding.registerListener({
        updated: () => {
          this.save();
        }
      });
      this.map.set(id, binding);
    }
    return this.map.get(id);
  }

  load() {
    this.map.clear();
    _.chain(K2.getDefaultKeybindings())
      .groupBy('command')
      .forEach((commands: ResolvedKeybindingItem[], key) => {
        const c = new ExistingCommandBindings(key, commands);
        c.registerListener({
          updated: () => {
            this.save();
          }
        });
        this.map.set(key, c);
      })
      .value();
  }

  save = _.debounce(() => {
    K2._cachedMergedKeybindings = [];
    for (let [command, group] of this.map.entries()) {
      group.serialize().forEach((e) => {
        K2._cachedMergedKeybindings.push(command, e);
      });
    }
    this.iterateListeners((cb) => cb.saved?.());
  }, 100);
}
