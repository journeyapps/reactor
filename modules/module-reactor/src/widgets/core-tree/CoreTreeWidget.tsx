import * as React from 'react';
import { TreeEntity, TreeEntityInterface, TreeNode } from '@journeyapps-labs/common-tree';
import { TreeWidgetProps } from '../tree/TreeWidget';
import { observer } from 'mobx-react';
import { UniversalNodeWidget } from './reactor-tree/widgets/UniversalNodeWidget';
import { SearchEvent } from '@journeyapps/reactor-lib-search';
import { SearchableTreeSearchScope } from './SearchableTreeSearchScope';

export interface CoreRenderTreeEvent<T extends TreeEntityInterface = TreeEntityInterface> {
  entity: T;
  depth: number;
}

export interface CoreRenderTreeNodeEvent<T extends TreeNode = TreeNode> extends CoreRenderTreeEvent<T> {
  children: () => any;
  props: Pick<TreeWidgetProps, 'onCollapsedChanged' | 'collapsed' | 'empty' | 'emptyMessage'>;
}

export interface CoreRenderTreeLeafEvent<T extends TreeEntity = TreeEntity> extends CoreRenderTreeEvent<T> {}

export interface CoreTreeWidgetProps {
  tree: TreeEntity;
  depth?: number;
  /**
   * Reserve one level of indentation for a node toggle when rendering a leaf.
   * Disable this for inline trees whose leaves should align with their containing content.
   * @defaultValue true
   */
  reserveNodeToggleSpace?: boolean;
  forwardRef?: React.RefObject<HTMLDivElement>;
  renderTreeNode?: (event: CoreRenderTreeNodeEvent) => React.JSX.Element;
  renderTreeLeaf?: (event: CoreRenderTreeLeafEvent) => React.JSX.Element;
  hasMatchedChildren?: (matched: boolean) => any;
  search?: SearchEvent;
  searchScope?: SearchableTreeSearchScope;
  events?: {
    updated: () => any;
  };
}

export const CoreTreeWidget: React.FC<CoreTreeWidgetProps> = observer((props) => {
  return <UniversalNodeWidget tree={props.tree} event={props} />;
});
