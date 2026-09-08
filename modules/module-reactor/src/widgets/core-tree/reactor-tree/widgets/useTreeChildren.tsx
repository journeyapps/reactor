import { TreeNode } from '@journeyapps/common-tree';
import * as React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { SearchableTreeSearchScope } from '../../SearchableTreeSearchScope';
import { useForceUpdate } from '../../../../hooks/useForceUpdate';
import { CoreTreeWidgetProps } from '../../CoreTreeWidget';

export interface RenderTreeChildOptions {
  child: any;
  depth: number;
  event: CoreTreeWidgetProps;
  reportMatched: (match: boolean) => any;
}

export type RenderTreeChild = (options: RenderTreeChildOptions) => React.ReactNode;

export const useTreeChildren = (options: {
  tree: TreeNode;
  event: CoreTreeWidgetProps;
  renderChild: RenderTreeChild;
}) => {
  const { tree, event, renderChild } = options;
  const forceUpdate = useForceUpdate();
  const [childrenHasMatches, setChildrenHasMatches] = useState(false);

  useLayoutEffect(() => {
    const disposer = tree.registerListener({
      childAdded: () => {
        forceUpdate({
          defer: true
        });
      },
      childRemoved: () => {
        forceUpdate({
          defer: true
        });
      }
    });
    forceUpdate();
    return disposer;
  }, [tree]);

  useEffect(() => {
    if (event.search && event.searchScope === SearchableTreeSearchScope.FULL_TREE) {
      tree.open();
    } else {
      setChildrenHasMatches(false);
    }
  }, [tree, event.search, event.searchScope]);

  return {
    childrenHasMatches: event.search ? childrenHasMatches : true,
    renderChildren: (depth: number) => {
      if (event.searchScope === SearchableTreeSearchScope.VISIBLE_ONLY && tree.collapsed) {
        return null;
      }

      return (
        <>
          {tree.children.map((child) =>
            renderChild({
              child,
              depth,
              event,
              reportMatched: (match) => {
                if (match) {
                  setChildrenHasMatches(true);
                  event.hasMatchedChildren?.(true);
                }
              }
            })
          )}
        </>
      );
    }
  };
};
