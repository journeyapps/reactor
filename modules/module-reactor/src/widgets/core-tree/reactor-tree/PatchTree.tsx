import { TreeEntity, TreeEntityInterface, TreeEntityListener } from '@journeyapps-labs/common-tree';
import { TreeWidgetProps } from '../../tree/TreeWidget';
import * as React from 'react';
import { CoreTreeWidgetProps } from '../CoreTreeWidget';
import { SearchEvent, SearchEventMatch } from '@journeyapps/reactor-lib-search';
import { MousePosition } from '../../../layers/combo/SmartPositionWidget';

type GConstructor<T = {}> = new (...args: any[]) => T;

export interface ReactorTreeListener extends TreeEntityListener {
  action: (event: React.MouseEvent) => any;
  contextAction: (event: MousePosition) => any;
  propGeneratorsChanged: () => any;
  visibilityChanged: () => any;
  attachedChanged: () => any;
  sortChanged: () => any;
}

export type ReactorTreeProps = Omit<TreeWidgetProps, 'openDefault' | 'depth'>;

export type ReactorTreePropsTransformer = (
  props: Partial<ReactorTreeProps>,
  depth: number,
  mouseOver: boolean
) => Partial<ReactorTreeProps>;

export interface IBaseReactorTree extends TreeEntityInterface {
  addPropGenerator(transformer: ReactorTreePropsTransformer): () => any;
  match(event: SearchEvent): SearchEventMatch;
  setSearch(event: SearchEvent): boolean;
  setSortKey(key: string): void;

  /**
   * Set whether the leaf is attached or detached from a parent. Attached does not
   * explicitly mean that the leaf is visible though, for that the setVisible method is used
   */
  setAttached(attached: boolean): any;
  setVisible(visible: boolean): any;
  getProps(event: CoreTreeWidgetProps): ReactorTreeProps;
  getSortKey(): string;

  /**
   * The entity is part of a rendered tree
   */
  attached: boolean;
  /**
   * The entity itself is visible
   */
  visible: boolean;
  /**
   * The current search value
   */
  currentSearch?: SearchEvent;
}

export function PatchTree<T extends GConstructor<TreeEntity<ReactorTreeListener>>>(
  SuperClass: T
): T & GConstructor<IBaseReactorTree> {
  class BaseReactorTreeInternal extends SuperClass implements IBaseReactorTree {
    propGenerator: Set<ReactorTreePropsTransformer>;
    sortKey: string;
    attached: boolean;
    visible: boolean;
    mouseOver: boolean;
    currentSearch?: SearchEvent;

    protected searchGeneratorDisposer: () => any;

    constructor(...params) {
      super(...params);
      this.attached = false;
      this.visible = false;
      this.sortKey = null;
      this.mouseOver = false;
      this.propGenerator = new Set();
      this.currentSearch = null;
    }

    setVisible(visible: boolean): any {
      if (this.visible === visible) {
        return;
      }
      this.visible = visible;
      this.iterateListeners((cb) => cb.visibilityChanged?.());
    }

    setAttached(attached: boolean): any {
      if (this.attached === attached) {
        return;
      }
      this.attached = attached;
      this.iterateListeners((cb) => cb.attachedChanged?.());
    }

    addPropGenerator(transformer: ReactorTreePropsTransformer) {
      this.propGenerator.add(transformer);
      this.iterateListeners((cb) => cb.propGeneratorsChanged?.());
      return () => {
        this.propGenerator.delete(transformer);
        this.iterateListeners((cb) => cb.propGeneratorsChanged?.());
      };
    }

    getProps(event: CoreTreeWidgetProps & { hover: boolean }): ReactorTreeProps {
      let props: Partial<ReactorTreeProps> = {
        normalClick: (event) => {
          this.iterateListeners((cb) => cb.action?.(event));
        },
        rightClick: (event) => {
          this.iterateListeners((cb) => cb.contextAction?.(event));
        },
        mouseOver: (event, hover) => {
          this.mouseOver = hover;
          this.iterateListeners((cb) => cb.propGeneratorsChanged?.());
        }
      };
      for (let transformer of this.propGenerator) {
        let propsTransformed = transformer(props, event.depth, this.mouseOver);
        if (propsTransformed) {
          props = {
            ...props,
            ...propsTransformed
          };
        }
      }
      return {
        label: this.getKey(),
        ...props
      };
    }

    setSearch(event: SearchEvent) {
      this.currentSearch = event;
      this.searchGeneratorDisposer?.();
      this.searchGeneratorDisposer = null;
      if (!event) {
        return true;
      }
      const result = this.match(event);
      if (result) {
        this.searchGeneratorDisposer = this.addPropGenerator(() => {
          return {
            matches: result
          };
        });
        return true;
      }
      return false;
    }

    match(event: SearchEvent): SearchEventMatch {
      return null;
    }

    getSortKey(): string {
      return this.sortKey?.toLowerCase();
    }

    setSortKey(key: string) {
      if (key !== this.sortKey) {
        this.sortKey = key;
        this.iterateListeners((cb) => cb.sortChanged?.());
      }
    }
  }

  return BaseReactorTreeInternal;
}
