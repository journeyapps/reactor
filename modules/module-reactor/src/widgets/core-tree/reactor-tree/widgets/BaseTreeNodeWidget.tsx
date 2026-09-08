import { TreeNode } from '@journeyapps/common-tree';
import * as React from 'react';
import { observer } from 'mobx-react';
import { CoreTreeWidgetProps } from '../../CoreTreeWidget';
import { useTreeNode } from './useTreeNode';
import { useTreeChildren, RenderTreeChild } from './useTreeChildren';

export interface BaseTreeNodeWidgetProps {
  tree: TreeNode;
  event: CoreTreeWidgetProps;
  renderChild: RenderTreeChild;
}

export const BaseTreeNodeWidget: React.FC<BaseTreeNodeWidgetProps> = observer((props) => {
  const { event, tree, renderChild } = props;
  useTreeNode(tree, event.events?.updated);
  const { renderChildren, childrenHasMatches } = useTreeChildren({ tree, event, renderChild });

  if (childrenHasMatches) {
    return event.renderTreeNode({
      depth: event.depth,
      children: () => renderChildren(event.depth + 1),
      entity: tree,
      props: {
        emptyMessage: 'Empty',
        empty: tree.children.length === 0,
        collapsed: tree.collapsed,
        onCollapsedChanged: (collapsed, deep) => {
          tree.setCollapsed(collapsed);
          if (deep) {
            tree.openChildren(!collapsed);
          }
          props.event.events.updated?.();
        }
      }
    });
  }

  return <>{renderChildren(event.depth + 1)}</>;
});
