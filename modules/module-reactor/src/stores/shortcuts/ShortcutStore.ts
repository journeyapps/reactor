import * as _ from 'lodash';
import { Shortcut, ShortcutChord } from './Shortcut';
import { inject, ioc } from '../../inversify.config';
import { PrefsStore } from '../PrefsStore';
import { ShortcutHandler, ShortcutHandlerAction, ShortcutHandlerSerialized } from './ShortcutHandler';
import { observable } from 'mobx';
import { MimeTypes, readFileAsText, selectFile } from '@journeyapps/reactor-lib-utils';
import { DialogStore } from '../DialogStore';
import { AbstractStore } from '../AbstractStore';

export interface PossibleShortcutAction extends ShortcutHandlerAction {
  shortcuts: Shortcut[];
}

export interface ShortcutDialogDirective {
  action: ShortcutHandlerAction;
  gotKeys: (keys: ShortcutChord) => any;
}

export interface ShortcutsSerialized {
  type: 'shortcuts';
  handlers: {
    [handler: string]: ShortcutHandlerSerialized;
  };
}

export class ShortcutStore extends AbstractStore {
  handlers: ShortcutHandler[];

  @observable
  accessor showKeyCommandDialog: ShortcutDialogDirective;

  @inject(DialogStore)
  accessor dialogStore: DialogStore;

  constructor() {
    super({ name: 'SHORTCUT_STORE' });
    this.handlers = [];
    this.showKeyCommandDialog = null;
  }

  async importShortcuts() {
    const file = await selectFile({
      mimeTypes: [MimeTypes.A_JSON, MimeTypes.T_JSON]
    });
    if (!file) {
      return;
    }
    const textFromFileLoaded = await readFileAsText(file);
    // try decode workspaces
    try {
      const decoded: ShortcutsSerialized = JSON.parse(textFromFileLoaded);
      for (let handler in decoded.handlers) {
        await this.getHandler(handler).deserialize(decoded.handlers[handler]);
      }

      await this.save();
      return true;
    } catch (ex) {
      this.logger.error('Failed to import shortcuts', ex);
      await this.dialogStore.showErrorDialog({
        title: 'Failed to import workspaces',
        message:
          'The target file is not valid JSON, it was probably tampered with or has changed encoding through transmission.'
      });
    }
  }

  getExportedShortcutsURL() {
    return URL.createObjectURL(
      new Blob([
        JSON.stringify(
          {
            type: 'shortcuts',
            handlers: _.reduce(
              this.handlers,
              (acc, value) => {
                acc[value.options.key] = value.serialize();
                return acc;
              },
              {}
            )
          } as ShortcutsSerialized,
          null,
          2
        )
      ])
    ).toString();
  }

  showShortcutDialog(action: ShortcutHandlerAction): Promise<ShortcutChord> {
    // disable all shortcuts so we can listen for them
    this.getAllShortcuts().forEach((shortcut) => {
      shortcut.enable(false);
    });
    // wait for user to select something
    return new Promise<ShortcutChord>((resolve) => {
      this.showKeyCommandDialog = {
        action: action,
        gotKeys: (keys) => {
          // will close the dialog
          this.showKeyCommandDialog = null;

          // re-enable all the shortcuts
          this.getAllShortcuts().forEach((shortcut) => {
            shortcut.enable(true);
          });
          resolve(keys);
        }
      };
    });
  }

  getHandler<T extends ShortcutHandler>(key: string): T {
    return this.handlers.find((h) => h.options.key === key) as T;
  }

  registerHandler(handler: ShortcutHandler) {
    this.handlers.push(handler);
    ioc.get(PrefsStore).registerPreference(handler);
  }

  getAllShortcuts(): Shortcut[] {
    return _.flatMap(this.handlers, (handler) => {
      return handler.getShortcuts();
    });
  }

  getAllPossibleActions(): PossibleShortcutAction[] {
    return _.flatMap(this.handlers, (handler) => {
      return handler.getPossibleActions().map((action) => {
        return {
          ...action,
          shortcuts: handler.getShortcutsForAction(action)
        };
      });
    });
  }

  async reset() {
    for (let handler of this.handlers) {
      await handler.reset();
    }
    await this.save();
  }

  async save() {
    for (let handler of this.handlers.values()) {
      handler.save();
    }
  }

  isInitialized() {
    for (let handler of this.handlers) {
      if (!handler.initialized) {
        return false;
      }
    }
    return true;
  }
}
