import { TreeNode } from '@journeyapps/common-tree';
import * as React from 'react';
import { useEffect } from 'react';
import { observer } from 'mobx-react';
import { TreeWidget } from '../../../tree/TreeWidget';
import { CoreTreeWidgetProps } from '../../CoreTreeWidget';
import { ReactorTreeEntity } from '../reactor-tree-utils';
import { useForceUpdate } from '../../../../hooks/useForceUpdate';
import { useTreeEntity } from './useTreeEntity';
import { useTreeNode } from './useTreeNode';
import { RenderTreeChild, useTreeChildren } from './useTreeChildren';

export interface ReactorTreeNodeWidgetProps {
  tree: TreeNode & ReactorTreeEntity;
  event: CoreTreeWidgetProps;
  renderChild: RenderTreeChild;
}

export const ReactorTreeNodeWidget: React.FC<ReactorTreeNodeWidgetProps> = observer((props) => {
  const { tree, event, renderChild } = props;
  const forceUpdate = useForceUpdate();
  useTreeNode(tree, event.events?.updated);
  const { render } = useTreeEntity({ tree, event });
  const { renderChildren, childrenHasMatches } = useTreeChildren({ tree, event, renderChild });

  useEffect(() => {
    return tree.registerListener({
      sortChanged: () => {
        forceUpdate({
          defer: true
        });
      }
    });
  }, [tree]);

  const treeProps = tree.getProps(event);

  if (childrenHasMatches || render) {
    return (
      <TreeWidget
        {...treeProps}
        forwardRef={event.forwardRef}
        depth={event.depth}
        empty={tree.children.length === 0}
        emptyMessage="Empty"
        collapsed={tree.collapsed}
        onCollapsedChanged={(collapsed, deep) => {
          treeProps.onCollapsedChanged?.(collapsed, deep);
          tree.setCollapsed(collapsed);
          if (deep) {
            tree.openChildren(!collapsed);
          }
        }}
      >
        {(depth) => {
          return renderChildren(depth);
        }}
      </TreeWidget>
    );
  }

  return <>{renderChildren(event.depth + 1)}</>;
});
