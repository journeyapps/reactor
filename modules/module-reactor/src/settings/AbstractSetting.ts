import { observable } from 'mobx';
import * as uuid from 'uuid';
import * as _ from 'lodash';
import { BaseObserver } from '@journeyapps/common-utils';
import { Logger } from '@journeyapps/common-logger';
import { createLogger } from '../core/logging';

export interface AbstractSettingOptions {
  key: string;
  /**
   * used for busting the serialization if we have made fundamental changes
   * that are not backwards compatible
   */
  serializeID?: string;
}

export interface AbstractSettingListener {
  updated();
}

export abstract class AbstractSetting<
  T extends AbstractSettingOptions = AbstractSettingOptions
> extends BaseObserver<AbstractSettingListener> {
  options: T;

  @observable
  accessor initialized: boolean;

  logger: Logger;
  deserialized: boolean;

  private promiseResolvers: { [key: string]: () => any };

  constructor(options: T) {
    super();
    this.options = options;
    this.initialized = false;
    this.logger = createLogger(`control: ${options.key}`);
    this.deserialized = false;
    this.promiseResolvers = {};
  }

  updateOptions(options: Partial<T>) {
    this.options = {
      ...this.options,
      ...options
    };
  }

  save() {
    this.iterateListeners((listener) => {
      listener.updated && listener.updated();
    });
  }

  async init() {
    if (this.initialized) {
      return;
    }
    if (!this.deserialized) {
      await this.reset();
    }
    this.initialized = true;
    _.forEach(this.promiseResolvers, (f) => f());
  }

  async waitForReady(): Promise<this> {
    if (this.initialized) {
      return this;
    }
    const id = uuid.v4();
    return new Promise<void>((resolve) => {
      this.promiseResolvers[id] = resolve;
    })
      .then(() => this)
      .finally(() => {
        delete this.promiseResolvers[id];
      });
  }

  doSerialize() {
    return {
      serializeID: this.options.serializeID,
      ...this.serialize()
    };
  }

  /**
   * FYI: This is called after init()
   */
  doDeserialize(data: ReturnType<this['doSerialize']>) {
    if (this.options.serializeID != data.serializeID) {
      this.logger.debug('Ignoring persisted setting with a different serialization version', {
        expected: this.options.serializeID,
        received: data.serializeID
      });
      return;
    }
    try {
      this.deserialize(data);
      this.deserialized = true;
    } catch (ex) {
      this.logger.error('Failed to restore setting', ex);
    }
  }

  abstract reset();

  protected abstract serialize();

  protected abstract deserialize(data);
}
