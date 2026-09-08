import { AbstractStore } from './AbstractStore';
import { v4 } from 'uuid';
import * as _ from 'lodash';
import { BaseObserver } from '@journeyapps/common-utils';

export enum CommonKeys {
  ENTER = 'Enter',
  LEFT = 'ArrowLeft',
  RIGHT = 'ArrowRight',
  UP = 'ArrowUp',
  DOWN = 'ArrowDown'
}

export interface KeyboardContextListener {
  dispose: () => any;
}

export interface HandleKeyboardActionOptions {
  key: CommonKeys;
  action: (event: KeyboardEvent) => any;
}

export class KeyboardContext extends BaseObserver<KeyboardContextListener> {
  handlers: Map<string, HandleKeyboardActionOptions>;
  deactivateListener: () => any;

  constructor() {
    super();
    this.handlers = new Map();
  }

  handle(options: HandleKeyboardActionOptions) {
    const id = v4();
    this.handlers.set(id, options);
    return () => {
      this.handlers.delete(id);
    };
  }

  setupListener() {
    const listener = (event: KeyboardEvent) => {
      for (let listener of this.handlers.values()) {
        if (listener.key === event.key) {
          event.preventDefault();
          listener.action(event);
        }
      }
    };
    window.addEventListener('keydown', listener);
    return () => {
      window.removeEventListener('keydown', listener);
    };
  }

  dispose() {
    this.deactivate();
    this.iterateListeners((cb) => cb.dispose?.());
  }

  deactivate() {
    this.deactivateListener?.();
    this.deactivateListener = null;
  }

  activate() {
    if (this.deactivateListener) {
      return;
    }
    this.deactivateListener = this.setupListener();
  }
}

export class KeyboardStore extends AbstractStore {
  contexts: Set<KeyboardContext>;

  constructor() {
    super({ name: 'KEYBOARD' });
    this.contexts = new Set();
  }

  getCurrentContext() {
    const contexts = Array.from(this.contexts.values());
    return _.last(contexts);
  }

  pushContext() {
    this.getCurrentContext()?.deactivate();
    const context = new KeyboardContext();
    const l = context.registerListener({
      dispose: () => {
        this.contexts.delete(context);
        this.getCurrentContext()?.activate();
        l();
      }
    });
    this.contexts.add(context);
    context.activate();
    return context;
  }
}
