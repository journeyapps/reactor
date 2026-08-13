import { observer } from 'mobx-react';
import * as React from 'react';
import * as _ from 'lodash';
import {
  ComboBoxItem,
  ComboBoxSearchEngineResultEntry,
  UISearchEngineDirective
} from '../../../stores/combo/ComboBoxDirectives';
import { SmartPositionWidget } from '../SmartPositionWidget';
import { ComboSearchBoxWidget } from '../ComboSearchBoxWidget';
import { createSearchEventMatcher, SearchResult } from '@journeyapps/reactor-lib-search';

export interface SearchEngineDirectiveComboWidgetProps {
  directive: UISearchEngineDirective;
  resolve: (item: ComboBoxSearchEngineResultEntry) => any;
}

export interface SearchEngineDirectiveComboWidgetState {
  searchResult: SearchResult<ComboBoxSearchEngineResultEntry>;
}

export interface SearchComboBoxItem extends ComboBoxItem {
  original: ComboBoxSearchEngineResultEntry;
}

@observer
export class SearchEngineDirectiveComboWidget extends React.Component<
  SearchEngineDirectiveComboWidgetProps,
  SearchEngineDirectiveComboWidgetState
> {
  constructor(props) {
    super(props);
    this.state = {
      searchResult: null
    };
  }

  getItems() {
    if (!this.state.searchResult) {
      return [];
    }
    return _.map(this.state.searchResult.results, (result) => {
      return {
        ...result,
        original: result
      } as SearchComboBoxItem;
    });
  }

  isLoading() {
    if (!this.state.searchResult) {
      return true;
    }
    return this.state.searchResult.loading;
  }

  componentDidMount(): void {
    this.setState({
      searchResult: this.props.directive.engine.doSearch({
        search: null,
        matches: createSearchEventMatcher(null)
      })
    });
  }

  render() {
    return (
      <SmartPositionWidget position={this.props.directive.position} centerOnMobile>
        <ComboSearchBoxWidget
          scaleInOnMobile
          loading={this.isLoading()}
          searchChanged={(search) => {
            // stop listening to the old search result
            if (this.state.searchResult) {
              this.state.searchResult.dispose();
            }

            this.setState({
              searchResult: this.props.directive.engine.doSearch({
                search: search,
                matches: createSearchEventMatcher(search)
              })
            });
          }}
          items={this.getItems()}
          selected={(item: SearchComboBoxItem) => {
            this.props.resolve(item.original);
          }}
        />
      </SmartPositionWidget>
    );
  }
}
