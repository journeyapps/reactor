import { SearchEngine } from '../SearchEngine';
import { useEffect, useState } from 'react';
import { SearchResult } from '@journeyapps/reactor-lib-search';

export interface UseSearchEngineProps {
  searchEngine: SearchEngine;
  searchText: string;
  parameters: object;
}

export const useSearchEngine = (props: UseSearchEngineProps) => {
  const [searchResult, setSearchResult] = useState<SearchResult>(null);

  useEffect(() => {
    let value = props.searchText;
    if (value && value.trim() === '') {
      value = null;
    }

    const result = props.searchEngine.search({
      value,
      parameters: props.parameters
    });

    setSearchResult(result);

    return () => {
      result.dispose();
    };
  }, [props.searchEngine, props.searchText, props.parameters]);

  return searchResult;
};
