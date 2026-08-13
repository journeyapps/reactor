import { EntityDefinitionComponent } from '../../EntityDefinitionComponent';
import { CMDPalletEntitySearchEngine } from '../../../cmd-pallet/CMDPalletEntitySearchEngine';
import { CMDPalletSearchEngine, CommandPalletSearchEngineOptions } from '../../../cmd-pallet/CMDPalletSearchEngine';
import { SearchEngine } from '../../../search/SearchEngine';
import { MousePosition } from '../../../layers/combo/SmartPositionWidget';
import { SearchEngineComboBoxDirective } from '../../../stores/combo2/directives/SearchEngineComboBoxDirective';
import { ComboBoxItem } from '../../../stores/combo/ComboBoxDirectives';
import { SearchResult, SearchResultEntry } from '@journeyapps/reactor-lib-search';

export interface EntitySearchResultEntry<T = any> extends SearchResultEntry {
  entity: T;
}

export interface EntitySearchEngineComponentOptions {
  label: string;
}

export interface EntityComboBoxItem<T> extends ComboBoxItem {
  entity: T;
}

export interface GetComboBoxDirectiveOptions<T> {
  position: MousePosition;
  filter?: (entity: T) => boolean;
  transformItem?: (entity: T, item: EntityComboBoxItem<T>) => EntityComboBoxItem<T>;
}

export abstract class EntitySearchEngineComponent<T extends any = any> extends EntityDefinitionComponent {
  static TYPE = 'search-engine';

  constructor(protected options: EntitySearchEngineComponentOptions) {
    super(EntitySearchEngineComponent.TYPE);
  }

  abstract getSearchEngine(): SearchEngine<SearchResult<EntitySearchResultEntry<T>>>;

  getCmdPaletteSearchEngine(
    options: Omit<CommandPalletSearchEngineOptions, 'displayName'> = {}
  ): CMDPalletSearchEngine {
    return new CMDPalletEntitySearchEngine<T>({
      ...options,
      component: this
    });
  }

  getLabel() {
    if (this.definition.getSearchEngines().length > 1) {
      return this.options.label;
    }
    return `Select ${this.definition.label}`;
  }

  getComboBoxDirective(
    event: GetComboBoxDirectiveOptions<T>
  ): SearchEngineComboBoxDirective<EntitySearchResultEntry<T>, EntityComboBoxItem<T>> {
    return new SearchEngineComboBoxDirective<EntitySearchResultEntry<T>, EntityComboBoxItem<T>>({
      event: event.position,
      engine: this.getSearchEngine(),
      title: this.getLabel(),
      hideSearchOnMobile: this.hideSearchOnMobile(),
      filter: (r) => {
        if (!event.filter) {
          return true;
        }
        return event.filter(r.entity);
      },
      transformResult: (e) => {
        const item = this.definition.getAsComboBoxItem(e.entity);
        return event.transformItem?.(e.entity, item) || item;
      }
    });
  }

  hideSearchOnMobile() {
    return false;
  }
}
