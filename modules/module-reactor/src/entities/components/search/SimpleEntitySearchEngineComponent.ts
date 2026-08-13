import {
  EntitySearchEngineComponent,
  EntitySearchEngineComponentOptions,
  EntitySearchResultEntry
} from './EntitySearchEngineComponent';
import { SearchEngine, SearchEngineSearchEvent } from '../../../search/SearchEngine';
import { createSearchEventMatcherBool, SearchResult } from '@journeyapps/reactor-lib-search';

export interface SimpleEntitySearchEngineComponentOptions<T> extends EntitySearchEngineComponentOptions {
  getEntities: (event: SearchEngineSearchEvent) => Promise<T[]>;
  /**
   * Defaults to true
   */
  filterResultsWithMatcher?: boolean;
}

export class SimpleEntitySearchEngineComponent<T extends any = any> extends EntitySearchEngineComponent<T> {
  constructor(public options2: SimpleEntitySearchEngineComponentOptions<T>) {
    super(options2);
  }

  getEntities(event: SearchEngineSearchEvent) {
    return this.options2.getEntities(event);
  }

  getSearchEngine(): SearchEngine<SearchResult<EntitySearchResultEntry<T>>> {
    return new SimpleEntitySearchEngine<T>(this);
  }

  hideSearchOnMobile() {
    return true;
  }
}

export class SimpleEntitySearchEngine<T> extends SearchEngine<SearchResult<EntitySearchResultEntry<T>>> {
  constructor(protected component: SimpleEntitySearchEngineComponent) {
    super();
  }

  async autoSelectIsolatedItem(event: { value: string | null }) {
    let result = await this.getFilteredEntities({
      ...event,
      value: event.value || ''
    });
    if (result.length === 1) {
      return result[0];
    }
    return null;
  }

  async getFilteredEntities(event: SearchEngineSearchEvent) {
    let matcher = createSearchEventMatcherBool(event.value);
    let entities = await this.component.getEntities(event);

    // if we are searching with an ID for example, we don't want to further filter these items
    if (this.component.options2.filterResultsWithMatcher ?? true) {
      return entities.filter((e) => {
        return matcher(this.component.definition.describeEntity(e).simpleName);
      });
    }
    return entities;
  }

  search(event: SearchEngineSearchEvent): SearchResult<EntitySearchResultEntry<T>> {
    const result = new SearchResult<EntitySearchResultEntry<T>>();
    this.getFilteredEntities(event).then((entities) => {
      result.setValues(
        entities.map((entity, index) => {
          return {
            entity: entity,
            key: this.component.definition.getEntityUID(entity)
          };
        }) as EntitySearchResultEntry<T>[]
      );
    });
    return result;
  }
}
