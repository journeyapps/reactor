import { AbstractSetting } from '../settings/AbstractSetting';
import { observable } from 'mobx';
import { Log, Logger } from '@journeyapps/common-logger';
import { BaseObserver } from '@journeyapps/common-utils';
import { createLogger } from '../core/logging';

export interface AbstractStoreOptions {
  name: string;
}

export interface AbstractStoreListener {
  initialized: () => any;
}

export class AbstractStore<L extends AbstractStoreListener = AbstractStoreListener> extends BaseObserver<L> {
  private _controls: Set<AbstractSetting>;
  private initialization?: Promise<void>;
  logger: Logger;

  @observable
  accessor initialized: boolean;

  constructor(protected options: AbstractStoreOptions) {
    super();
    this.initialized = false;
    this.logger = createLogger(`STORE:${options.name}`);
    this._controls = new Set();
  }

  get name() {
    return this.options.name;
  }

  setLogger(logger: Logger) {
    this.logger = logger;
  }

  async waitForReady() {
    if (!this.initialized) {
      await new Promise<void>((resolve) => {
        // @ts-ignore
        const l1 = this.registerListener({
          initialized: () => {
            l1();
            resolve();
          }
        });
      });
    }
  }

  protected async _init() {}

  public init(): Promise<void> {
    this.initialization ??= (async () => {
      this.logger.debug(Log.dim('Initializing…'));
      try {
        await this._init();
        this.initialized = true;
        this.iterateListeners((listener) => listener.initialized?.());
        this.logger.debug(Log.bold(Log.green('Ready')));
      } catch (error) {
        this.logger.error(Log.bold(Log.red('Initialization failed')), error);
        throw error;
      }
    })();
    return this.initialization;
  }

  protected addControl<T extends AbstractSetting>(control: T): T {
    this._controls.add(control);
    return control;
  }

  getControls(): AbstractSetting[] {
    return Array.from(this._controls.values());
  }
}
