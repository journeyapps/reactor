import { AbstractStore, AbstractStoreListener, AbstractStoreOptions } from './AbstractStore';
import { AbstractSerializer } from './serializers/AbstractSerializer';
import { Log } from '@journeyapps/common-logger';

export interface AbstractPersistedStoreOptions<T> extends AbstractStoreOptions {
  serializer: AbstractSerializer<T>;
  listenToExternalChanges?: boolean;
}

export interface AbstractPersistedStoreListener extends AbstractStoreListener {
  deserialized: () => any;
}

export abstract class AbstractPersistedStore<
  T,
  L extends AbstractPersistedStoreListener = AbstractPersistedStoreListener
> extends AbstractStore<L> {
  private serializationListener?: () => void;

  constructor(protected options: AbstractPersistedStoreOptions<T>) {
    super(options);
    this.bootstrapSerializer();
  }

  private bootstrapSerializer() {
    this.serializationListener?.();
    this.serializationListener = undefined;

    if (this.options.listenToExternalChanges) {
      this.serializationListener = this.options.serializer.registerListener({
        gotExternalChanges: () => {
          this.logger.debug(Log.yellow('External persisted state changed'));
          this.runDeserialization();
        }
      });
    }
  }

  protected abstract serialize(): T;

  protected abstract deserialize(data: T): Promise<any>;

  public async runDeserialization(): Promise<boolean> {
    this.logger.debug(Log.dim('Restoring persisted state…'));
    const data = await this.options.serializer.deserialize();
    if (data) {
      await this.deserialize(data);
      this.iterateListeners((listener) => listener.deserialized?.());
      this.logger.debug(Log.green('Persisted state restored'));
      return true;
    }
    this.logger.debug(Log.dim('No persisted state found'));
    return false;
  }

  protected async _initPersisted(deserialized: boolean) {}

  protected async _init() {
    const deserialized = await this.runDeserialization();
    await this._initPersisted(deserialized);
  }

  updateOptions(options: Partial<Omit<AbstractPersistedStoreOptions<T>, 'name'>>) {
    this.logger.debug(Log.dim('Updating persistence options'));
    this.options.serializer.dispose?.();
    this.options = {
      ...this.options,
      ...options
    };
    this.bootstrapSerializer();
  }

  public async save() {
    const payload = this.serialize();
    this.logger.debug(Log.dim('Saving persisted state…'));
    await this.options.serializer.serialize(payload);
  }
}
