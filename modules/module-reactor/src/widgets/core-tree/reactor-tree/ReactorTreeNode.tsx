import {
  TreeEntity,
  TreeNode,
  TreeNodeListener,
  TreeSerialized,
  TreeSerializedV2
} from '@journeyapps-labs/common-tree';
import * as _ from 'lodash';
import * as React from 'react';
import { CoreTreeWidgetProps } from '../CoreTreeWidget';
import { PatchTree, ReactorTreeListener } from './PatchTree';
import { isBaseReactorTree, ReactorTreeOptions, setupReactorTree } from './reactor-tree-utils';
import { SearchEvent, SearchEventMatch } from '@journeyapps/reactor-lib-search';
import { ReactorTreeNodeWidget } from './widgets/ReactorTreeNodeWidget';
import { RenderTreeChild } from './widgets/useTreeChildren';

export enum ReactorTreeNodeDefaultOpenPolicy {
  NEVER = 'never',
  FIRST_RENDER = 'first-render',
  ALWAYS = 'always'
}

export interface ReactorTreeNodeListener extends ReactorTreeListener, TreeNodeListener {
  childrenSortChanged: () => any;
}

export class ReactorTreeNode<T extends ReactorTreeNodeListener = ReactorTreeNodeListener> extends PatchTree(
  TreeNode
)<T> {
  private hasHydratedTreeState: boolean;
  private hasPersistedTreeState: boolean;

  constructor(public options: ReactorTreeOptions) {
    super(options.key || null);
    this.hasHydratedTreeState = false;
    this.hasPersistedTreeState = false;
    setupReactorTree(this, options);
  }

  private getRootNode(): ReactorTreeNode {
    return this.getRoot() as ReactorTreeNode;
  }

  private static didPersistTreeState(payload: TreeSerialized | TreeSerializedV2): boolean {
    if (Array.isArray((payload as TreeSerializedV2).open)) {
      return true;
    }
    return Object.keys(payload || {}).length > 0;
  }

  get defaultOpenPolicy() {
    return this.options.defaultOpenPolicy || ReactorTreeNodeDefaultOpenPolicy.NEVER;
  }

  private shouldApplyDefaultOpenPolicy() {
    if (this.defaultOpenPolicy === ReactorTreeNodeDefaultOpenPolicy.ALWAYS) {
      return true;
    }
    if (this.defaultOpenPolicy === ReactorTreeNodeDefaultOpenPolicy.FIRST_RENDER) {
      return !this.getRootNode().hasPersistedTreeState;
    }
    return false;
  }

  private applyDefaultOpenPolicyToSubtree() {
    const stack: ReactorTreeNode[] = [this];
    while (stack.length > 0) {
      const node = stack.pop() as ReactorTreeNode;
      if (node.shouldApplyDefaultOpenPolicy()) {
        node.open({ reveal: false });
      }
      node.children.forEach((child) => {
        if (child instanceof ReactorTreeNode) {
          stack.push(child);
        }
      });
    }
  }

  deserialize(payload: TreeSerialized | TreeSerializedV2) {
    // when searching, dont deserialize
    if (this.currentSearch) {
      return;
    }
    super.deserialize(payload);
    const root = this.getRootNode();
    root.hasHydratedTreeState = true;
    root.hasPersistedTreeState = ReactorTreeNode.didPersistTreeState(payload);
    root.applyDefaultOpenPolicyToSubtree();
  }

  renderWidget(event: CoreTreeWidgetProps, renderChild: RenderTreeChild): React.JSX.Element {
    return <ReactorTreeNodeWidget event={event} tree={this} renderChild={renderChild} />;
  }

  match(event: SearchEvent): SearchEventMatch {
    return this.options.match?.(event);
  }

  setAttached(attached: boolean): any {
    super.setAttached(attached);
    this.children.forEach((child) => {
      if (isBaseReactorTree(child)) {
        child.setAttached(this.attached);
      }
    });
  }

  addChild(child: TreeEntity) {
    super.addChild(child);
    if (isBaseReactorTree(child)) {
      child.setAttached(this.attached);
      const l1 = child.registerListener({
        deleted: () => {
          l1?.();
          child.setAttached(false);
        },
        sortChanged: () => {
          this.iterateListeners((cb) => cb.childrenSortChanged?.());
        }
      });
    }

    if (child instanceof ReactorTreeNode) {
      const root = this.getRootNode();
      if (root.hasHydratedTreeState && child.shouldApplyDefaultOpenPolicy()) {
        child.open({ reveal: false });
      }
    }
  }

  get children() {
    return _.sortBy(super.children, (c) => {
      if (isBaseReactorTree(c)) {
        return c.getSortKey();
      }
      return c.getKey();
    });
  }
}
