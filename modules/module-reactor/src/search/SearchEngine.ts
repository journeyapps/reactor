import { SearchResult } from '@journeyapps/reactor-lib-search';
import { SearchEngineParameter } from './params/SearchEngineParameter';

export interface SearchEngineSearchEvent<T extends object = {}> {
  value: string;
  parameters?: T;
}

export abstract class SearchEngine<T extends SearchResult = SearchResult> {
  parameters: Set<SearchEngineParameter>;

  constructor() {
    this.parameters = new Set();
  }

  addParameter(param: SearchEngineParameter) {
    this.parameters.add(param);
  }

  async autoSelectIsolatedItem(event: { value: string | null }): Promise<any | null> {
    return null;
  }

  abstract search(event: SearchEngineSearchEvent): T;
}
