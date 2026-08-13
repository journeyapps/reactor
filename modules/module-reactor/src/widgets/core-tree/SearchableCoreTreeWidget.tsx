import * as React from 'react';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { CoreTreeWidget, CoreTreeWidgetProps } from './CoreTreeWidget';
import { TreeNode } from '@journeyapps-labs/common-tree';
import { createSearchEventMatcher, SearchEvent } from '@journeyapps/reactor-lib-search';
import { UniversalNodeWidget } from './reactor-tree/widgets/UniversalNodeWidget';
import * as _ from 'lodash';

export interface SearchableCoreTreeWidgetProps extends Omit<CoreTreeWidgetProps, 'search'> {
  search?: string;
}

const useSearchMatcher = (search: string) => {
  return useMemo<SearchEvent>(() => {
    if (!search) {
      return null;
    }
    return {
      search,
      matches: createSearchEventMatcher(search)
    };
  }, [search]);
};

export const SearchableCoreTreeWidgetInner: React.FC<SearchableCoreTreeWidgetProps> = (props) => {
  const matcher = useSearchMatcher(props.search);
  const [initialState] = useState(() => {
    if (props.tree instanceof TreeNode) {
      return props.tree.serialize();
    }
    return null;
  });

  useEffect(() => {
    return () => {
      if (props.tree instanceof TreeNode) {
        props.tree.deserialize(initialState);
      }
    };
  }, []);

  return <CoreTreeWidget {...props} search={matcher} />;
};

export const SearchableCoreTreeWidget: React.FC<SearchableCoreTreeWidgetProps> = (props) => {
  let _search = props.search;
  if (_search && _search.trim() === '') {
    _search = null;
  }
  if (!_search) {
    return <UniversalNodeWidget {...props} event={_.omit(props, 'search')} />;
  }
  return <SearchableCoreTreeWidgetInner {...props} />;
};
