import { action, autorun, IObservableArray, observable } from 'mobx';
import { BaseObserver } from '@journeyapps/common-utils';

export interface SearchResultEntry {
  key: string;
}

export interface SearchResultListener {
  /**
   * Called when the search results are disposed of
   */
  dispose: () => any;

  loadMore: () => any;
}

export class SearchResult<T extends SearchResultEntry = SearchResultEntry> extends BaseObserver<SearchResultListener> {
  @observable
  accessor loading: boolean;

  @observable
  accessor results: T[];

  @observable
  accessor moreEntries: boolean;

  private disposed = false;

  constructor(items: T[] = []) {
    super();
    this.moreEntries = false;
    this.loading = true;
    this.results = items;
  }

  loadMore() {
    this.iterateListeners((cb) => cb.loadMore?.());
  }

  @action setValues(results: T[]) {
    if (this.disposed) {
      return;
    }
    (this.results as IObservableArray).replace(results);
    this.loading = false;
  }

  dispose() {
    this.disposed = true;
    this.iterateListeners((listener) => {
      listener?.dispose();
    });
  }

  pipe<S extends SearchResultEntry>(
    result: SearchResult<S>,
    transform: (res: T[]) => S[],
    additionalAutorun?: (source: this) => any
  ) {
    const dispose = autorun(() => {
      if (!this.loading) {
        result.setValues(transform(this.results));
      }
      result.loading = this.loading;
      if (additionalAutorun) {
        additionalAutorun(this);
      }
    });
    result.registerListener({
      dispose: () => {
        this.dispose();
        dispose();
      }
    });
  }
}
