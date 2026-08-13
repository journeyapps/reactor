import { autorun, IReactionDisposer, observable } from 'mobx';
import { Collection } from './Collection';
import { SearchResult, SearchResultEntry } from '@journeyapps/reactor-lib-search';

export interface PaginatedCollectionOptions<T, R> {
  transformer: (res: R) => T[];
  loaderIterator?: () => Promise<AsyncIterator<R>> | AsyncIterator<R>;
  hasMore?: (res: R) => boolean;
}

export interface AsSearchResultOptions<T> {
  idTransformer: (item: T) => string;
  match: (item: T) => boolean;
}

export interface PaginatedSearchResultEntry<T = any> extends SearchResultEntry {
  item: T;
}

export class PaginatedSearchResult<T extends any> extends SearchResult<PaginatedSearchResultEntry<T>> {
  observer: PaginatedCollection;
  disposer: IReactionDisposer;

  constructor(observer: PaginatedCollection) {
    super();
    this.observer = observer;
    this.disposer = autorun(() => {
      this.loading = observer ? observer.loading : false;
    });
  }

  dispose() {
    super.dispose();
    this.disposer?.();
  }

  hasMore() {
    if (!this.observer) {
      return false;
    }
    return this.observer.hasMore;
  }

  loadMore() {
    if (!this.observer) {
      return;
    }
    return this.observer.loadMore();
  }
}

export class PaginatedCollection<T = any, R = any> extends Collection<T> {
  @observable
  protected accessor lastResponse: R;

  protected iterator: AsyncIterator<R>;
  protected options: PaginatedCollectionOptions<T, R>;

  public hasMore: boolean;

  constructor(options: PaginatedCollectionOptions<T, R>) {
    super();
    this.lastResponse = null;
    this.iterator = null;
    this.options = options;
  }

  getData(res: R) {
    return this.options.transformer(res);
  }

  async loadAll(
    load?: () => Promise<AsyncIterator<R>> | AsyncIterator<R>,
    options?: { abort: AbortController }
  ): Promise<any> {
    const loader = load ?? this.options.loaderIterator;
    this.hasMore = await this.loadInitialData(loader);
    while (!options?.abort.signal.aborted && this.hasMore) {
      this.hasMore = await this.loadMore();
    }
  }

  clear() {
    this.lastResponse = null;
    this.hasMore = false;
    this.iterator = null;
    super.clear();
  }

  async loadMore(): Promise<boolean> {
    if (!this.iterator) {
      return false;
    }
    this.hasMore = false;
    await this.load(async (event) => {
      const res = await this.iterator.next();
      if (event.aborted || res.done || !res.value) {
        return this.items;
      }
      this.hasMore = this.options.hasMore(res.value);
      this.lastResponse = res.value;
      return this.items.concat(this.getData(res.value));
    });
    return this.hasMore;
  }

  async loadInitialData(load?: () => Promise<AsyncIterator<R>> | AsyncIterator<R>): Promise<boolean> {
    const loader = load ?? this.options.loaderIterator;

    await this.load(async (event) => {
      this.iterator = await loader();
      const next = await this.iterator.next();
      if (event.aborted || next.done || !next.value) {
        return [];
      }
      this.lastResponse = next.value;
      this.hasMore = this.options.hasMore(this.lastResponse);
      return this.getData(this.lastResponse);
    });
    return this.hasMore;
  }

  asSearchResult(options: AsSearchResultOptions<T>): PaginatedSearchResult<T> {
    const result = new PaginatedSearchResult<T>(this);
    const runner = autorun(() => {
      if (!this.lastResponse) {
        return;
      }
      result.setValues(
        this.items
          .filter((d) => options.match(d))
          .map((d) => {
            return {
              item: d,
              key: options.idTransformer(d)
            };
          })
      );
    });
    result.registerListener({
      dispose: () => {
        runner();
      }
    });

    // also load the entries
    this.loadMore();
    return result;
  }
}
