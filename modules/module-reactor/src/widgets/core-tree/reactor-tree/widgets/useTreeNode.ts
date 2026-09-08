import { TreeNode } from '@journeyapps/common-tree';
import { useEffect } from 'react';
import { useForceUpdate } from '../../../../hooks/useForceUpdate';

export const useTreeNode = (tree: TreeNode, updated: () => any) => {
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    const disposer = tree.registerListener({
      collapsedChanged: () => {
        forceUpdate({
          defer: true
        });
        updated?.();
      }
    });
    forceUpdate();
    return disposer;
  }, [tree, updated]);
};
