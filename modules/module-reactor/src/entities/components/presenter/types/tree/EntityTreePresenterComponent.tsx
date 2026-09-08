import { TreeSerialized, TreeSerializedV2 } from '@journeyapps/common-tree';
import {
  EntityPresenterComponent,
  EntityPresenterComponentOptions,
  EntityPresenterComponentRenderType
} from '../../EntityPresenterComponent';
import { inject } from '../../../../../inversify.config';
import { BatchStore } from '../../../../../stores/batch/BatchStore';
import { AbstractEntityTreePresenterContext } from './presenter-contexts/AbstractEntityTreePresenterContext';
import { SearchableTreeSearchScope } from '../../../../../widgets/core-tree/SearchableTreeSearchScope';
import { AbstractPresenterContextSettings, GroupBySettingOptions } from '../../AbstractPresenterContext';
import { MetadataDisplayOptions, TagDisplayMode } from './EntityTreeDisplayMode';

export enum EntityTreePresenterSetting {
  SORT = 'sort'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export interface EntityTreePresenterSettings extends AbstractPresenterContextSettings {
  [EntityTreePresenterSetting.SORT]: SortDirection;
}

export interface EntityTreePresenterState {
  trees: TreeSerialized | TreeSerializedV2;
}

export interface EntityTreePresenterComponentOptions<T = any>
  extends Omit<EntityPresenterComponentOptions, 'label'>, GroupBySettingOptions {
  loadChildrenAsNodesAreOpened?: boolean;
  searchScope?: SearchableTreeSearchScope;
  label?: string;
  tagDisplayMode?: TagDisplayMode;
  metadataDisplayOptions?: MetadataDisplayOptions;
  maxTags?: number;
}

export abstract class EntityTreePresenterComponent<T> extends EntityPresenterComponent<
  T,
  AbstractEntityTreePresenterContext<T>
> {
  static DEFAULT_LABEL = 'Tree view';

  @inject(BatchStore)
  accessor batchStore: BatchStore;

  constructor(public readonly options2: EntityTreePresenterComponentOptions<T> = {}) {
    super(EntityPresenterComponentRenderType.TREE, {
      ...options2,
      label: options2.label || EntityTreePresenterComponent.DEFAULT_LABEL
    });
  }

  get loadChildrenAsNodesAreOpened() {
    return this.options2.loadChildrenAsNodesAreOpened;
  }

  get searchScope() {
    return this.options2.searchScope || SearchableTreeSearchScope.FULL_TREE;
  }

  get tagDisplayMode() {
    return this.options2.tagDisplayMode || TagDisplayMode.NONE;
  }

  get metadataDisplayOptions() {
    return this.options2.metadataDisplayOptions || {};
  }

  get maxTags() {
    return this.options2.maxTags;
  }
}
