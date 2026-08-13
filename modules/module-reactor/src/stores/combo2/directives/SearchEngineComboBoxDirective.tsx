import { ComboBoxDirective, ComboBoxDirectiveOptions } from '../ComboBoxDirective';
import { makeObservable, observable } from 'mobx';
import { ComboBoxItem } from '../../combo/ComboBoxDirectives';
import { SearchEngine } from '../../../search/SearchEngine';
import * as React from 'react';
import { SearchEngineFieldWidget } from '../../../search/widgets/SearchEngineFieldWidget';
import { ComboBoxWidget } from '../../../layers/combo/ComboBoxWidget';
import { observer } from 'mobx-react';
import { activateWithValidation } from '../../../hooks/useValidator';
import styled from '@emotion/styled';
import { SearchResult, SearchResultEntry } from '@journeyapps/reactor-lib-search';
import { ReactorViewportMode, useReactorViewportMode } from '../../../hooks/useReactorViewportMode';
import { isValidationHidden } from '../../../actions/validators/ActionValidator';
import { IconWidget } from '../../../widgets/icons/IconWidget';
import { themed } from '../../../stores/themes/reactor-theme-fragment';

export interface SearchEngineComboBoxDirectiveOptions<
  E extends SearchResultEntry,
  T extends ComboBoxItem = ComboBoxItem
> extends ComboBoxDirectiveOptions {
  engine: SearchEngine<SearchResult<E>>;
  transformResult: (item: E) => T;
  filter?: (entity: E) => boolean;
  hideSearchOnMobile?: boolean;
  /** Message shown before the first search results arrive. Defaults to "Loading...". */
  loadingMessage?: string;
  /** Message shown while more results load beneath existing items. Defaults to "Loading more...". */
  loadingMoreMessage?: string;
}

export class SearchEngineComboBoxDirective<
  E extends SearchResultEntry = SearchResultEntry,
  T extends ComboBoxItem = ComboBoxItem
> extends ComboBoxDirective<T, SearchEngineComboBoxDirectiveOptions<E, T>> {
  @observable
  private accessor result: SearchResult<E>;

  @observable
  accessor parameters: {};

  constructor(options: SearchEngineComboBoxDirectiveOptions<E, T>) {
    super(options);
    this.result = null;
    this.parameters = {};
  }

  get engine() {
    return this.options.engine;
  }

  showSearch(viewportMode: ReactorViewportMode) {
    return !(viewportMode === ReactorViewportMode.MOBILE && this.options.hideSearchOnMobile);
  }

  dismiss() {
    super.dismiss();
    this.result?.dispose();
  }

  setResult(result: SearchResult<E>) {
    this.result?.dispose();
    this.result = result;
  }

  isLoading() {
    return this.result?.loading ?? true;
  }

  get loadingMessage() {
    return this.options.loadingMessage || 'Loading...';
  }

  get loadingMoreMessage() {
    return this.options.loadingMoreMessage || 'Loading more...';
  }

  getLoadingStatus(items: T[] = this.getItems()) {
    if (!this.isLoading()) {
      return null;
    }
    return items.length > 0 ? this.loadingMoreMessage : this.loadingMessage;
  }

  getItems() {
    if (!this.result) {
      return [];
    }
    return this.result?.results
      .filter((r) => {
        if (!this.options.filter) {
          return true;
        }
        return this.options.filter(r);
      })
      .map((r) => this.options.transformResult(r))
      .filter((item) => !item.validator || !isValidationHidden(item.validator()));
  }

  selectItem(item: T) {
    if (item.disabled) {
      return;
    }
    const validation = item.validator?.();
    if (!validation) {
      this.setSelected([item]);
      return;
    }
    void activateWithValidation(validation, () => this.setSelected([item]));
  }

  setSelected(items: T[]) {
    super.setSelected(items);
    this.dismiss();
    this.getItems().forEach((i) => {
      i.action?.(this.getPosition());
    });
  }

  getContent(): React.JSX.Element {
    return <SearchEngineComboBoxDirectiveWidget directive={this} />;
  }
}

export interface SearchEngineComboBoxDirectiveWidgetProps {
  directive: SearchEngineComboBoxDirective;
}

export const SearchEngineComboBoxDirectiveWidget: React.FC<SearchEngineComboBoxDirectiveWidgetProps> = observer(
  (props) => {
    const viewportMode = useReactorViewportMode();
    const showSearch = props.directive.showSearch(viewportMode);
    const loading = props.directive.isLoading();
    const items = props.directive.getItems();
    const loadingStatus = props.directive.getLoadingStatus(items);

    React.useEffect(() => {
      if (showSearch) {
        return;
      }

      const result = props.directive.engine.search({
        value: null,
        parameters: props.directive.parameters
      });
      props.directive.setResult(result);

      return () => {
        result.dispose();
      };
    }, [props.directive, showSearch]);

    return (
      <>
        {showSearch ? (
          <S.Search
            engine={props.directive.engine}
            focusOnMount={true}
            parameters={props.directive.parameters}
            placeholder={props.directive.searchPlaceholder}
            gotSearchResult={(result) => {
              props.directive.setResult(result);
            }}
          />
        ) : null}
        <ComboBoxWidget
          initialSelected={null}
          placeholder={loading && items.length === 0 ? loadingStatus : undefined}
          items={items}
          selected={(item, event) => {
            props.directive.selectItem(item);
          }}
        />
        {loading && items.length > 0 ? (
          <S.LoadingMore>
            <IconWidget icon="sync-alt" spin />
            <span>{loadingStatus}</span>
          </S.LoadingMore>
        ) : null}
      </>
    );
  }
);

namespace S {
  export const Search = styled(SearchEngineFieldWidget)`
    margin-bottom: 5px;
    min-width: 200px;
  `;

  export const LoadingMore = themed.div`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    font-size: 12px;
    color: ${(p) => p.theme.combobox.text};
    opacity: 0.55;
  `;
}
