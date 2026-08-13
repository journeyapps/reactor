import _ from 'lodash';
import { SearchEvent } from '@journeyapps/reactor-lib-search';
import { EntityPresenterComponent, SelectEntityListener } from './EntityPresenterComponent';
import { observable } from 'mobx';
import { ReactorIcon } from '../../../widgets/icons/IconWidget';
import { AbstractValueControl } from '../../../controls/AbstractValueControl';
import { ButtonControl } from '../../../controls/ButtonControl';
import { BaseObserver, BaseObserverInterface } from '@journeyapps-labs/common-utils';
import { SetControl, SetControlOption } from '../../../controls/SetControl';
import type { EntityLabel } from '../meta/EntityDescriberComponent';

export interface RenderCollectionOptions<T> {
  entities: T[];
  searchEvent?: SearchEvent;
  events?: BaseObserverInterface<SelectEntityListener<T>>;
}

export interface PresenterContextListener {
  stateChanged?: () => any;
  disposed?: () => any;
}

export type SerializedPresenterContext<State extends {} = {}, Settings extends {} = {}> = {
  state: State;
  controlValues: Settings;
};

export interface PresenterSetting {
  icon: ReactorIcon;
  label: string;
  key: string;
  control: AbstractValueControl;
}

export interface ExposedPresenterSetting extends PresenterSetting {
  component: EntityPresenterComponent;
  context: AbstractPresenterContext;
}

export enum GroupingOptionValue {
  NONE = 'none',
  COMPLEX_NAME = 'complexName',
  TAGS = 'tags'
}

type MetadataLabelGroupingOption = `metadata-label:${string}`;

/** Serializable grouping values, including metadata-label grouping. */
export type GroupingOption = GroupingOptionValue | MetadataLabelGroupingOption;

export const GroupingOption = {
  metadataLabel(label: string): MetadataLabelGroupingOption {
    return `metadata-label:${label}`;
  },

  getMetadataLabel(option: GroupingOption): string | null {
    const prefix = 'metadata-label:';
    return option.startsWith(prefix) ? option.slice(prefix.length) : null;
  }
};

export interface GroupBySettingOptions {
  allowedGroupingSettings?: {
    complexName?: boolean;
    tags?: boolean;
    labels?: string[];
  };
  defaultGroupingSetting?: GroupingOption;
}

export interface GroupByEntityOptions<T> {
  entities: T[];
  describe?: (entity: T) => {
    complexName?: string;
    tags?: string[];
    labels?: EntityLabel[];
  };
}

export enum AbstractPresenterContextSetting {
  GROUP_BY = 'groupBy'
}

export interface AbstractPresenterContextSettings {
  [AbstractPresenterContextSetting.GROUP_BY]: GroupingOption;
}

export abstract class AbstractPresenterContext<
  T = any,
  State extends {} = {},
  Settings extends AbstractPresenterContextSettings = AbstractPresenterContextSettings,
  Listener extends PresenterContextListener = PresenterContextListener
> extends BaseObserver<Listener> {
  public state: State;

  @observable
  accessor settings: Map<string, PresenterSetting>;
  @observable
  accessor toolbarButtons: Set<ButtonControl>;

  constructor(public presenter: EntityPresenterComponent) {
    super();
    this.state = null;
    this.settings = new Map();
    this.toolbarButtons = new Set();
    if (presenter.options.allowedGroupingSettings) {
      this.registerGroupBySetting(presenter.options);
    }
  }

  dispose() {
    this.iterateListeners((cb) => cb.disposed?.());
  }

  setState(state: State) {
    this.state = state;
    this.iterateListeners((cb) => cb.stateChanged?.());
  }

  deserialize(data: SerializedPresenterContext<State, Settings>) {
    if (data.state) {
      this.state = data.state;
    }
    _.forEach(data.controlValues, (value, key) => {
      this.settings.get(key).control.value = value;
    });
  }

  serialize(): SerializedPresenterContext<State, Settings> {
    return {
      state: this.state,
      controlValues: this.getControlValues()
    };
  }

  getControls(): AbstractValueControl[] {
    return Array.from(this.settings.values()).map((s) => s.control);
  }

  getControlValues(): Settings {
    return _.chain(Array.from(this.settings.entries()))
      .keyBy(([key]) => key)
      .mapValues(([key, setting]) => setting.control.value)
      .value() as Settings;
  }

  getDefaultSettings(): Settings {
    return this.getSettings().reduce((prev, cur) => {
      prev[cur.key] = cur.control.value;
      return prev;
    }, {}) as Settings;
  }

  addSetting(setting: PresenterSetting) {
    this.settings.set(setting.key, setting);
  }

  protected registerGroupBySetting(options: GroupBySettingOptions) {
    const allowed = options.allowedGroupingSettings || {};
    const groupByOptions: SetControlOption<GroupingOption>[] = [
      { key: GroupingOptionValue.NONE, icon: 'layer-group', label: 'No grouping' }
    ];

    if (allowed.complexName) {
      groupByOptions.push({
        key: GroupingOptionValue.COMPLEX_NAME,
        icon: 'grip-lines',
        label: 'Secondary label'
      });
    }

    if (allowed.tags) {
      groupByOptions.push({
        key: GroupingOptionValue.TAGS,
        icon: 'tags',
        label: 'Tags'
      });
    }

    for (const label of allowed.labels || []) {
      groupByOptions.push({
        key: GroupingOption.metadataLabel(label),
        icon: 'list',
        label,
        group: 'Metadata'
      });
    }

    if (groupByOptions.length <= 1) {
      return;
    }

    this.addSetting({
      icon: 'layer-group',
      label: 'Group by',
      key: AbstractPresenterContextSetting.GROUP_BY,
      control: new SetControl<GroupingOption>({
        initialValue: options.defaultGroupingSetting || GroupingOptionValue.NONE,
        options: groupByOptions
      })
    });
  }

  protected groupBySelectedSetting<Item extends { complexName?: string; tags?: string[]; labels?: EntityLabel[] }>(
    items: Item[],
    selectedGrouping: GroupingOption,
    fallback: string
  ): Record<string, Item[]> {
    if (selectedGrouping === GroupingOptionValue.COMPLEX_NAME) {
      return _.groupBy(items, (item) => item.complexName || fallback);
    }

    if (selectedGrouping === GroupingOptionValue.TAGS) {
      const taggedEntries = _.flatMap(items, (item) => {
        const tags = (item.tags || []).filter((tag) => !!tag);
        const selectedTags = tags.length > 0 ? tags : [fallback];
        return selectedTags.map((tag) => ({
          key: tag,
          item
        }));
      });

      const grouped = _.groupBy(taggedEntries, (entry) => entry.key);
      return _.mapValues(grouped, (groupedEntries) => groupedEntries.map((entry) => entry.item));
    }

    const metadataLabel = GroupingOption.getMetadataLabel(selectedGrouping);
    if (metadataLabel) {
      return _.groupBy(items, (item) => {
        return item.labels?.find((label) => label.label === metadataLabel)?.value || fallback;
      });
    }

    return _.groupBy(items, () => fallback);
  }

  isGroupingEnabled(): boolean {
    const controlValues = this.getControlValues();
    const selectedGrouping = controlValues[AbstractPresenterContextSetting.GROUP_BY] || GroupingOptionValue.NONE;
    return selectedGrouping !== GroupingOptionValue.NONE;
  }

  getSelectedMetadataGroupingLabel(): string | null {
    const controlValues = this.getControlValues();
    const selectedGrouping = controlValues[AbstractPresenterContextSetting.GROUP_BY] || GroupingOptionValue.NONE;
    return GroupingOption.getMetadataLabel(selectedGrouping);
  }

  groupEntitiesBySelectedSetting<T>(options: GroupByEntityOptions<T>): Record<string, T[]> {
    const controlValues = this.getControlValues();
    const selectedGrouping = controlValues[AbstractPresenterContextSetting.GROUP_BY] || GroupingOptionValue.NONE;
    const describe =
      options.describe ||
      ((entity: T) => {
        return (this.presenter.definition as any).describeEntity(entity);
      });

    const grouped = this.groupBySelectedSetting(
      options.entities.map((entity) => {
        return {
          entity,
          ...describe(entity)
        };
      }),
      selectedGrouping,
      'Ungrouped'
    );

    return _.mapValues(grouped, (groupedEntities) => groupedEntities.map((entry) => entry.entity));
  }

  addToolbarButton(btn: ButtonControl) {
    this.toolbarButtons.add(btn);
  }

  removeSetting(key: string) {
    this.settings.delete(key);
  }

  getSettings(): ExposedPresenterSetting[] {
    return Array.from(this.settings.values()).map((s) => {
      return {
        ...s,
        component: this.presenter,
        context: this
      };
    });
  }

  abstract render(entity: T): React.JSX.Element;

  abstract renderCollection(event: RenderCollectionOptions<T>): React.JSX.Element;
}
