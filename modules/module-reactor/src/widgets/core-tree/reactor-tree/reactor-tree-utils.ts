import { ReactorTreeNode, ReactorTreeNodeDefaultOpenPolicy } from './ReactorTreeNode';
import { ReactorTreeLeaf } from './ReactorTreeLeaf';
import { IBaseReactorTree, ReactorTreeProps } from './PatchTree';
import { TreeEntityInterface } from '@journeyapps-labs/common-tree';
import { SearchEvent, SearchEventMatch } from '@journeyapps/reactor-lib-search';

export type ReactorTreeEntity = ReactorTreeNode | ReactorTreeLeaf;

export const isBaseReactorTree = (tree: TreeEntityInterface): tree is ReactorTreeEntity => {
  return tree instanceof ReactorTreeNode || tree instanceof ReactorTreeLeaf;
};

export interface ReactorTreeOptions {
  key?: string;
  getTreeProps?: (event: Partial<ReactorTreeProps>) => Partial<ReactorTreeProps>;
  match?: (event: SearchEvent) => SearchEventMatch;
  defaultOpenPolicy?: ReactorTreeNodeDefaultOpenPolicy;
}

export const setupReactorTree = (node: IBaseReactorTree & TreeEntityInterface, options: ReactorTreeOptions) => {
  if (!options.getTreeProps) {
    return;
  }
  node.addPropGenerator((props, depth) => {
    return options.getTreeProps({});
  });
  return node;
};
