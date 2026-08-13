import React from 'react';
import _ from 'lodash';
import { CoreTreeWidget } from '../../../../../../widgets/core-tree/CoreTreeWidget';
import { ReactorTreeEntity } from '../../../../../../widgets/core-tree/reactor-tree/reactor-tree-utils';
import {
  ReactorTreeNode,
  ReactorTreeNodeDefaultOpenPolicy
} from '../../../../../../widgets/core-tree/reactor-tree/ReactorTreeNode';
import {
  AbstractPresenterContext,
  AbstractPresenterContextSetting,
  GroupingOptionValue,
  PresenterContextListener,
  RenderCollectionOptions
} from '../../../AbstractPresenterContext';
import { EntityTreeCollectionWidget } from '../EntityTreeCollectionWidget';
import {
  EntityTreePresenterComponent,
  EntityTreePresenterSetting,
  EntityTreePresenterSettings,
  EntityTreePresenterState,
  SortDirection
} from '../EntityTreePresenterComponent';
import { SelectEntityListener } from '../../../EntityPresenterComponent';
import { BatchStore } from '../../../../../../stores/batch/BatchStore';
import { inject } from '../../../../../../inversify.config';
import { ActionSource } from '../../../../../../actions/Action';
import { System } from '../../../../../../core/System';
import { SetControl } from '../../../../../../controls/SetControl';
import { TreeNode } from '@journeyapps-labs/common-tree';
import { EntityReactorNode } from '../EntityReactorNode';
import { BaseObserverInterface } from '@journeyapps-labs/common-utils';
import { AbstractDescendentContextOptions } from '../descendent/AbstractDescendentContext';
import { LazyDescendentContext } from '../descendent/LazyDescendentContext';
import { ImmediateDescendentContext } from '../descendent/ImmediateDescendentContext';
import { untracked } from 'mobx';
import { MetadataDisplayMode, TagDisplayMode } from '../EntityTreeDisplayMode';

export interface GenerateTreeOptions<T> {
  events?: BaseObserverInterface<SelectEntityListener<T>>;
  disableCache?: boolean;
}

export interface TreePresenterGenerationEvent<T> {
  entity: T;
  tree: ReactorTreeEntity;
}

export interface AbstractTreePresenterContextListener<T extends any = any> extends PresenterContextListener {
  treeGenerated?: (event: TreePresenterGenerationEvent<T>) => any;
}

export abstract class AbstractEntityTreePresenterContext<
  T extends any = any,
  Settings extends EntityTreePresenterSettings = EntityTreePresenterSettings
> extends AbstractPresenterContext<T, EntityTreePresenterState, Settings, AbstractTreePresenterContextListener<T>> {
  @inject(BatchStore)
  accessor batchStore: BatchStore;

  @inject(System)
  accessor system: System;

  nodeCache: Set<TreeNode>;
  rootContext: AbstractEntityTreePresenterContext;

  constructor(public presenter: EntityTreePresenterComponent<T>) {
    super(presenter);
    this.state = { trees: {} };
    this.rootContext = null;
    this.nodeCache = new Set();
    this.addSetting({
      icon: 'sort',
      label: 'Sort',
      key: EntityTreePresenterSetting.SORT,
      control: new SetControl<SortDirection>({
        initialValue: SortDirection.ASC,
        options: [
          {
            key: SortDirection.ASC,
            icon: 'sort-alpha-asc',
            label: 'Sort Asc'
          },
          {
            key: SortDirection.DESC,
            icon: 'sort-alpha-desc',
            label: 'Sort Desc'
          }
        ]
      })
    });
  }

  generateDescendentContext(options: AbstractDescendentContextOptions<T>) {
    if (options.presenter.loadChildrenAsNodesAreOpened) {
      return new LazyDescendentContext(options);
    }
    return new ImmediateDescendentContext(options);
  }

  saveState() {
    this.setState({
      trees: {
        open: _.flatMap(Array.from(this.nodeCache.values()).map((n) => n.serialize().open))
      }
    });
  }

  setRootContext(rootContext: AbstractEntityTreePresenterContext) {
    this.rootContext = rootContext;
  }

  get definition() {
    return this.presenter.definition;
  }

  getSortedEntities(entities: T[]) {
    const controlValues = this.getControlValues();
    if (controlValues[EntityTreePresenterSetting.SORT] === SortDirection.ASC) {
      entities = _.sortBy(entities, (e) => {
        // Sorting should not subscribe the outer tree-generation reaction to entity UI state
        // (for example active/highlighted describer fields), otherwise cosmetic updates can
        // trigger full node regeneration and visible flicker when cacheTreeEntities is disabled.
        return untracked(() => {
          return this.definition.describeEntity(e).simpleName?.toLowerCase();
        });
      });
    }
    if (controlValues[EntityTreePresenterSetting.SORT] === SortDirection.DESC) {
      entities = _.sortBy(entities, (e) => {
        return untracked(() => {
          return this.definition.describeEntity(e).simpleName?.toLowerCase();
        });
      }).reverse();
    }
    return entities;
  }

  getRootContext() {
    return this.rootContext || this;
  }

  private buildGroupedTreeNodes(entities: T[], nodes: ReactorTreeEntity[]): ReactorTreeEntity[] {
    const groupedEntities = this.groupEntitiesBySelectedSetting({
      entities
    });
    const metadataGroupingLabel = this.getSelectedMetadataGroupingLabel();

    const nodesByEntity = new Map<T, ReactorTreeEntity>(entities.map((entity, index) => [entity, nodes[index]]));

    return _.map(groupedEntities, (grouped, group) => {
      const groupNode = new ReactorTreeNode({
        key: `group-${group}`,
        getTreeProps: () => ({
          label: metadataGroupingLabel ? `${metadataGroupingLabel}: ${group}` : group,
          icon: 'layer-group'
        }),
        match: (searchEvent) => searchEvent.matches(group),
        defaultOpenPolicy: ReactorTreeNodeDefaultOpenPolicy.FIRST_RENDER
      });
      grouped.forEach((entity) => {
        const node = nodesByEntity.get(entity);
        if (node) {
          groupNode.addChild(node);
        }
      });
      return groupNode;
    });
  }

  getTreeNodes(event: RenderCollectionOptions<T>): ReactorTreeEntity[] {
    const entities = this.getSortedEntities(event.entities);

    // convert entities into nodes
    const renderedNodes = this.doGetTreeNodes({
      ...event,
      entities: entities
    });

    let nodes = renderedNodes;
    if (this.isGroupingEnabled()) {
      nodes = this.buildGroupedTreeNodes(entities, renderedNodes);
    }

    nodes.forEach((n) => {
      if (n instanceof ReactorTreeNode) {
        n.deserialize(this.getRootContext().state.trees);
      }
      if (n instanceof EntityReactorNode) {
        n.setRootPresenterContext(this.getRootContext());
      }
    });

    // if we are actually the root
    if (!this.rootContext) {
      this.nodeCache.clear();
      nodes.forEach((n) => {
        if (n instanceof TreeNode) {
          this.nodeCache.add(n);
        }
      });
    }

    return nodes;
  }

  private shouldRenderSecondaryLabel() {
    if (!this.getRootContext().isGroupingEnabled()) {
      return true;
    }
    const controlValues = this.getRootContext().getControlValues();
    return controlValues[AbstractPresenterContextSetting.GROUP_BY] !== GroupingOptionValue.COMPLEX_NAME;
  }

  protected abstract doGetTreeNodes(event: RenderCollectionOptions<T>): ReactorTreeEntity[];

  protected abstract doGenerateTreeNode(entity: T, options?: GenerateTreeOptions<T>): ReactorTreeEntity;

  generateTreeNode(entity: T, options?: GenerateTreeOptions<T>): ReactorTreeEntity {
    let node = this.doGenerateTreeNode(entity, options);
    node.addPropGenerator(() => {
      const described = this.definition.describeEntity(entity);
      const rootPresenter = this.getRootContext().presenter;
      const renderDescription =
        rootPresenter.tagDisplayMode !== TagDisplayMode.NONE ||
        Object.values(rootPresenter.metadataDisplayOptions).some((option) => option.mode !== MetadataDisplayMode.NONE);
      const rootContext = this.getRootContext();
      const metadataGroupingLabel = rootContext.getSelectedMetadataGroupingLabel();
      const groupingByTags =
        rootContext.getControlValues()[AbstractPresenterContextSetting.GROUP_BY] === GroupingOptionValue.TAGS;
      return {
        icon: described.icon,
        iconColor: described.iconColor,
        icon2: described.icon2,
        icon2Color: described.icon2Color,
        label: described.simpleName,
        label2: this.shouldRenderSecondaryLabel() ? described.complexName : null,
        tags: renderDescription && !groupingByTags ? described.tags : [],
        metadata: renderDescription ? described.labels?.filter((label) => label.label !== metadataGroupingLabel) : [],
        tagDisplayMode: rootPresenter.tagDisplayMode,
        metadataDisplayOptions: rootPresenter.metadataDisplayOptions,
        maxTags: rootPresenter.maxTags
      };
    });
    this.patchTreeInteractions(node, entity);
    return node;
  }

  protected patchTreeInteractions(tree: ReactorTreeEntity, entity: T) {
    tree.addPropGenerator(() => {
      let encoded = this.definition.encode(entity, false);
      return {
        selected: this.batchStore.isSelected(encoded)
      };
    });

    tree.registerListener({
      action: (event) => {
        let encoded = this.definition.encode(entity, false);
        if (encoded && this.definition.isMultiSelectable()) {
          if (event.shiftKey) {
            return this.batchStore.select(encoded);
          }
          this.batchStore.selectOne(encoded);
        }
        this.definition.selectEntity({
          entity: entity,
          position: event,
          source: ActionSource.TREE_LEAF
        });
      },
      contextAction: (event) => {
        if (this.batchStore.selections.length > 1) {
          this.batchStore.showContextMenu(event);
          return;
        }
        this.definition.showContextMenuForEntity(entity, event);
      }
    });
  }

  renderCollection(event: RenderCollectionOptions<T>): React.JSX.Element {
    return <EntityTreeCollectionWidget event={event} presenterContext={this} />;
  }

  render(entity: T): React.JSX.Element {
    let node = this.generateTreeNode(entity);

    if (!node) {
      return null;
    }
    return <CoreTreeWidget tree={node} reserveNodeToggleSpace={false}></CoreTreeWidget>;
  }
}
