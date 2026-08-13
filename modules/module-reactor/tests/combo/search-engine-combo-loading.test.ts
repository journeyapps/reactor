import { describe, expect, it } from 'vitest';
import { SearchResult } from '@journeyapps/reactor-lib-search';
import { SearchEngine } from '../../src/search/SearchEngine';
import { SearchEngineComboBoxDirective } from '../../src/stores/combo2/directives/SearchEngineComboBoxDirective';

class TestSearchEngine extends SearchEngine<SearchResult> {
  search() {
    return new SearchResult();
  }
}

const generateDirective = (options: { loadingMessage?: string; loadingMoreMessage?: string } = {}) => {
  return new SearchEngineComboBoxDirective({
    ...options,
    engine: new TestSearchEngine(),
    transformResult: (item) => ({ key: item.key, title: item.key })
  });
};

describe('search engine combobox loading', () => {
  it('tracks loading from the active search result', () => {
    const directive = generateDirective();
    const result = new SearchResult();

    expect(directive.isLoading()).toBe(true);
    expect(directive.getLoadingStatus()).toBe('Loading...');

    directive.setResult(result);
    expect(directive.isLoading()).toBe(true);

    result.setValues([{ key: 'deployment-1' }]);
    expect(directive.isLoading()).toBe(false);
    expect(directive.getItems()).toEqual([{ key: 'deployment-1', title: 'deployment-1' }]);
    expect(directive.getLoadingStatus()).toBeNull();

    result.loading = true;
    expect(directive.getLoadingStatus()).toBe('Loading more...');
  });

  it('provides default and configurable loading messages', () => {
    expect(generateDirective().loadingMessage).toBe('Loading...');
    expect(generateDirective().loadingMoreMessage).toBe('Loading more...');

    const directive = generateDirective({
      loadingMessage: 'Loading deployments...',
      loadingMoreMessage: 'Loading more deployments...'
    });

    expect(directive.loadingMessage).toBe('Loading deployments...');
    expect(directive.loadingMoreMessage).toBe('Loading more deployments...');
  });
});
