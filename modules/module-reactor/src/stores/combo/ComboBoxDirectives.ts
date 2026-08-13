import { ReactorIcon } from '../../widgets/icons/IconWidget';
import { MousePosition } from '../../layers/combo/SmartPositionWidget';
import { SearchEventMatch, SearchResultEntry, SearchEngineInterface } from '@journeyapps/reactor-lib-search';
import type { Validator } from '../../actions/validators/ActionValidator';

export interface ComboBoxItem {
  title: string;
  titleMatch?: SearchEventMatch;
  key: string;
  children?: ComboBoxItem[];
  icon?: ReactorIcon;
  link?: string;
  download?: {
    name: string;
    url: string;
  };
  color?: string;
  group?: string;
  action?: (event: MousePosition) => Promise<any>;
  right?: React.JSX.Element;
  disabled?: boolean;
  validator?: Validator;
  forwardRef?: React.RefObject<HTMLDivElement>;
  badge?: {
    label: string;
    foreground: string;
    background: string;
    action?: (event: MousePosition) => any;
  };
}

export interface ComboBoxCheckedItem extends ComboBoxItem {
  checked?: boolean;
}

export enum UIDirectiveType {
  ITEMS = 'items',
  SEARCH_ENGINE = 'search',
  MULTI = 'multi'
}

export interface RenderCalloutEvent<T extends ComboBoxItem = ComboBoxItem> {
  search: string;
  options: T[];
}

export type RenderCalloutFunction<T extends ComboBoxItem = ComboBoxItem> = (event: RenderCalloutEvent<T>) => T;

export interface UIDirective {
  position: MousePosition;
  resolve: (item: ComboBoxItem[]) => any;
  type: UIDirectiveType;
  renderCallout?: RenderCalloutFunction;
  initialValue?: string;
  title?: string;
  title2?: string;
}

export interface UIItemsDirective<T extends ComboBoxItem = ComboBoxItem> extends UIDirective {
  items: T[];
  buttons?: boolean;
}

export interface UISearchEngineDirective extends UIDirective {
  engine: ComboBoxSearchEngine;
}

export interface ComboBoxSearchEngineResultEntry extends SearchResultEntry, ComboBoxItem {}

export interface ComboBoxSearchEngine<
  T extends ComboBoxSearchEngineResultEntry = ComboBoxSearchEngineResultEntry
> extends SearchEngineInterface<T> {}
