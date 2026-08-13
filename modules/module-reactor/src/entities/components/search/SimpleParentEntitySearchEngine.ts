import { MousePosition } from '../../../layers/combo/SmartPositionWidget';
import {
  SimpleEntitySearchEngineComponent,
  SimpleEntitySearchEngineComponentOptions
} from './SimpleEntitySearchEngineComponent';
import { CascadingSearchEngineComboBoxDirective } from '../../../stores/combo2/directives/CascadingSearchEngineComboBoxDirective';
import { SearchEngineComboBoxDirective } from '../../../stores/combo2/directives/SearchEngineComboBoxDirective';
import {
  EntityComboBoxItem,
  EntitySearchResultEntry,
  GetComboBoxDirectiveOptions
} from './EntitySearchEngineComponent';
import { SearchEngine, SearchEngineSearchEvent } from '../../../search/SearchEngine';
import { EntitySearchEngineParameter } from '../../../search/params/EntitySearchEngineParameter';
import { CMDPalletSearchEngine } from '../../../cmd-pallet/CMDPalletSearchEngine';
import { SearchResult } from '@journeyapps/reactor-lib-search';
import { ComboBoxDirective } from '../../../stores/combo2/ComboBoxDirective';

export const PARENT_VARIABLE = 'parent';

export interface SimpleParentEntitySearchEngineOptions<
  Parent,
  Item
> extends SimpleEntitySearchEngineComponentOptions<Item> {
  type: string;
  getEntities: (event: SearchEngineSearchEvent<{ [PARENT_VARIABLE]: Parent }>) => Promise<Item[]>;
}

export class SimpleParentEntitySearchEngine<P, E> extends SimpleEntitySearchEngineComponent<E> {
  constructor(protected options3: SimpleParentEntitySearchEngineOptions<P, E>) {
    super(options3);
  }

  getParents(event: { position: MousePosition }) {
    const directive = this.system.getDefinition(this.options3.type).getComboBoxDirective({ event: event.position });
    if (directive instanceof CascadingSearchEngineComboBoxDirective) {
      return directive.directives;
    }
  }

  getCmdPaletteSearchEngine(): CMDPalletSearchEngine {
    return null;
  }

  getSearchEngine(): SearchEngine<SearchResult<EntitySearchResultEntry<E>>> {
    const engine = super.getSearchEngine();
    engine.addParameter(
      new EntitySearchEngineParameter({
        key: PARENT_VARIABLE,
        label: 'Parent',
        required: true,
        entityType: this.options3.type
      })
    );
    return engine;
  }

  getFlattenedComboBoxDirective(event: GetComboBoxDirectiveOptions<E>): ComboBoxDirective<EntityComboBoxItem<any>>[] {
    const directive = this.system.getDefinition(this.options3.type).getComboBoxDirective(event);
    if (directive instanceof CascadingSearchEngineComboBoxDirective) {
      return directive.directives;
    }
    return [directive];
  }

  getComboBoxDirective(event: GetComboBoxDirectiveOptions<E>): any {
    return new CascadingSearchEngineComboBoxDirective({
      event: event.position,
      title: `Select ${this.definition.label}`,
      passValueToNextDirective: (item, directive) => {
        if (directive instanceof SearchEngineComboBoxDirective) {
          directive.parameters[PARENT_VARIABLE] = item.entity;
        }
      },
      directives: [...this.getFlattenedComboBoxDirective(event), super.getComboBoxDirective(event)]
    });
  }
}
