import { IObservableArray, observable } from 'mobx';
import { BaseObserver } from '@journeyapps/common-utils';

export interface CollectionListener {
  cleared: () => any;
}

export interface LoadEvent {
  aborted: boolean;
}

export class Collection<T> extends BaseObserver<CollectionListener> {
  @observable
  accessor items: IObservableArray<T>;

  @observable
  accessor loading: boolean;

  @observable
  accessor failed: boolean;

  protected promise: Promise<T[]>;

  constructor() {
    super();
    this.items = [] as IObservableArray<T>;
    this.loading = false;
    this.failed = false;
  }

  clear() {
    this.loading = false;
    this.failed = false;
    this.items.clear();
    this.iterateListeners((cb) => cb.cleared?.());
  }

  async load(loader: (event: LoadEvent) => Promise<T[]>) {
    if (this.promise) {
      return this.promise;
    }
    const loadEvent: LoadEvent = {
      aborted: false
    };
    this.loading = true;
    this.promise = loader(loadEvent);
    const l = this.registerListener({
      cleared: () => {
        loadEvent.aborted = true;
      }
    });
    try {
      const items = await this.promise;
      if (!items || loadEvent.aborted) {
        return;
      }
      this.items.replace(items);
    } catch (ex) {
      this.failed = true;
      throw ex;
    } finally {
      l();
      this.loading = false;
      this.promise = null;
    }
    return this.items;
  }
}
