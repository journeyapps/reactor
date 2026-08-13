import { MouseEvent } from 'react';
import { MousePosition } from '../layers/combo/SmartPositionWidget';
import * as _ from 'lodash';
import { Btn } from '../definitions/common';
import { SearchEngineInterface, SearchEvent, SearchResult, SearchResultEntry } from '@journeyapps/reactor-lib-search';
import { v4 } from 'uuid';

export interface CMDPalletGenerateResultWidgetEvent {
  key: string;
  selected: boolean;
  mouseEntered: () => any;
  mouseClicked: (event: MouseEvent) => any;
  ref: React.RefObject<HTMLDivElement>;
}

export interface CommandPalletSearchResultEntry extends SearchResultEntry {
  getWidget: (event: CMDPalletGenerateResultWidgetEvent) => React.JSX.Element;
  engine: CMDPalletSearchEngine;
  immediatelyClose?: boolean;
}

export interface CMDPalletSearchEngineResultOptions {
  showMore?: () => any;
  showMoreText?: string;
  buttons?: Btn[];
}

export class CMDPalletSearchEngineResult<
  T extends CommandPalletSearchResultEntry = CommandPalletSearchResultEntry
> extends SearchResult<T> {
  engine: CMDPalletSearchEngine;
  options: CMDPalletSearchEngineResultOptions;

  constructor(engine: CMDPalletSearchEngine<T>, options: CMDPalletSearchEngineResultOptions = {}) {
    super();
    this.engine = engine;
    this.options = options;
  }

  getLimitedResults(): T[] {
    if (this.engine.options.limit === false) {
      return this.results;
    }
    return _.take(this.results, this.engine.options.limit);
  }
}

export interface CommandPalletSearchEngineOptions {
  displayName: string;
  limit?: number | false;
  priority?: number;
}

export abstract class CMDPalletSearchEngine<
  T extends CommandPalletSearchResultEntry = CommandPalletSearchResultEntry
> implements SearchEngineInterface<T> {
  options: CommandPalletSearchEngineOptions;
  id: string;

  constructor(options: CommandPalletSearchEngineOptions) {
    this.options = {
      ...options,
      limit: options.limit == null ? 10 : options.limit
    };
    this.id = v4();
  }

  abstract doSearch(event: SearchEvent): CMDPalletSearchEngineResult<T>;

  async handleEnter(entry: T, position: MousePosition): Promise<boolean> {
    return this.handleSelection(entry, position);
  }

  abstract handleSelection(entry: T, position: MousePosition): Promise<boolean>;
}
