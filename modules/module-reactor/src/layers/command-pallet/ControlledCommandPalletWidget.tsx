import * as React from 'react';
import * as _ from 'lodash';
import { CommandPalletWidget } from './CommandPalletWidget';
import { CMDPalletSearchEngineResult, CommandPalletSearchResultEntry } from '../../cmd-pallet/CMDPalletSearchEngine';
import { ioc } from '../../inversify.config';
import { MousePosition } from '../combo/SmartPositionWidget';
import { TabDirective } from '../../widgets/tabs/TabListWidget';
import { SmartCommandPalletCategorywidget } from './SmartCommandPalletCategorywidget';
import { autorun, IReactionDisposer } from 'mobx';
import { CommonKeys, KeyboardContext, KeyboardStore } from '../../stores/KeyboardStore';

export interface ControlledCommandPalletWidgetProps {
  mobile?: boolean;
  getSearchResults: (search: string, tab: string) => CMDPalletSearchEngineResult[];
  selected: (entry: CommandPalletSearchResultEntry, position: MousePosition) => any;
  enter: (entry: CommandPalletSearchResultEntry, position: MousePosition) => any;
  focused: boolean;
  tabSelected: string;
  tabs: TabDirective[];
  close: () => any;
}

export interface ControlledCommandPalletWidgetState {
  highlighted: string;
  highlightedCategory: string;
  scrollIntoViewEnabled: boolean;
  searchResults: CMDPalletSearchEngineResult[];
}

export class ControlledCommandPalletWidget extends React.Component<
  ControlledCommandPalletWidgetProps,
  ControlledCommandPalletWidgetState
> {
  selectFirstDisposer: IReactionDisposer;
  scrollTimeout: any;

  keyboardContext: KeyboardContext;

  constructor(props: ControlledCommandPalletWidgetProps) {
    super(props);
    this.state = {
      highlighted: null,
      highlightedCategory: null,
      searchResults: [],
      scrollIntoViewEnabled: true
    };
  }

  protected handleCategoryEntryEntered = (res: CommandPalletSearchResultEntry) => {
    if (this.state.highlighted === res.key && this.state.highlightedCategory === res.engine.id) {
      return;
    }
    this.setState({
      highlighted: res.key,
      highlightedCategory: res.engine.id
    });
  };

  protected handleCategoryEntrySelected = (res: CommandPalletSearchResultEntry, event: MousePosition) => {
    this.props.selected(res, event);
  };

  protected handleCategoryClear = () => {
    this.selectFirst(this.state.searchResults);
  };

  protected handleClose = () => {
    this.props.close();
  };

  static _getHighlighted(state: ControlledCommandPalletWidgetState): CommandPalletSearchResultEntry {
    for (let result of state.searchResults) {
      for (let r of result.results) {
        if (r.key === state.highlighted) {
          return r;
        }
      }
    }
  }

  getHighlighted(): CommandPalletSearchResultEntry {
    return ControlledCommandPalletWidget._getHighlighted(this.state);
  }

  selectFirst(res: CMDPalletSearchEngineResult[]) {
    this.selectFirstDisposer?.();
    this.selectFirstDisposer = autorun((reaction) => {
      for (let searchResult of res) {
        if (!searchResult.loading && searchResult.results.length > 0) {
          this.setState(
            {
              highlighted: searchResult.results[0].key,
              highlightedCategory: searchResult.engine.id
            },
            () => {
              this.selectFirstDisposer = null;
              reaction.dispose();
            }
          );
          return;
        }
      }
    });
  }

  componentDidMount(): void {
    // get initial results
    _.defer(() => {
      const res = this.props.getSearchResults(null, this.props.tabSelected);
      this.selectFirst(res);
      this.setState({
        searchResults: res
      });
    });

    this.keyboardContext = ioc.get(KeyboardStore).pushContext();
    this.keyboardContext.handle({
      key: CommonKeys.ENTER,
      action: () => {
        const entry = this.getHighlighted();
        if (entry) {
          this.props.enter(entry, null);
        }
      }
    });
    this.keyboardContext.handle({
      key: CommonKeys.UP,
      action: () => {
        // get the previous available entry
        const flattened = this.getFlattened();
        if (flattened.length === 0) {
          return;
        }
        const flattenedKeys = _.map(this.getFlattened(), 'key');
        let index = flattenedKeys.indexOf(this.state.highlighted);
        index--;
        if (index < 0) {
          index = 0;
        }
        this.setState({
          highlighted: flattened[index].key,
          highlightedCategory: flattened[index].engine.id
        });
      }
    });
    this.keyboardContext.handle({
      key: CommonKeys.DOWN,
      action: () => {
        // get the next available entry
        const flattened = this.getFlattened();
        if (flattened.length === 0) {
          return;
        }
        const flattenedKeys = _.map(this.getFlattened(), 'key');
        let index = flattenedKeys.indexOf(this.state.highlighted);
        index++;
        if (index > flattened.length - 1) {
          index = flattened.length - 1;
        }
        this.setState({
          highlighted: flattened[index].key,
          highlightedCategory: flattened[index].engine.id
        });
      }
    });
  }

  getFlattened(res?: CMDPalletSearchEngineResult[]): CommandPalletSearchResultEntry[] {
    return _.flatMap(res || this.state.searchResults, (result) => {
      return _.map(result.getLimitedResults(), (entry) => {
        return entry;
      });
    });
  }

  componentWillUnmount(): void {
    this.keyboardContext.dispose();
    this.selectFirstDisposer?.();
    this.scrollTimeout && clearTimeout(this.scrollTimeout);
  }

  componentDidUpdate(
    prevProps: Readonly<ControlledCommandPalletWidgetProps>,
    prevState: Readonly<ControlledCommandPalletWidgetState>,
    snapshot?: any
  ): void {
    let found: CMDPalletSearchEngineResult = null;
    for (let searchResult of this.state.searchResults) {
      if (searchResult.engine.id === this.state.highlightedCategory) {
        found = searchResult;
        break;
      }
    }

    // category was not found
    if (!found) {
      this.selectFirst(this.state.searchResults);
    }
  }

  render() {
    return (
      <CommandPalletWidget
        close={this.props.close}
        mobile={this.props.mobile}
        wheelScroll={() => {
          if (this.state.scrollIntoViewEnabled) {
            this.setState({
              scrollIntoViewEnabled: false
            });
            if (this.scrollTimeout) {
              clearTimeout(this.scrollTimeout);
            }
            setTimeout(() => {
              this.setState({
                scrollIntoViewEnabled: true
              });
              this.scrollTimeout = null;
            }, 500);
          }
        }}
        tabSelected={this.props.tabSelected}
        tabs={this.props.tabs}
        searchChanged={(search: string, tab) => {
          // dispose older results
          _.forEach(this.state.searchResults, (result) => {
            result.dispose();
          });
          const results = this.props.getSearchResults(search, tab);
          this.setState({
            searchResults: results
          });
        }}
      >
        {_.map(this.state.searchResults, (result) => {
          return (
            <SmartCommandPalletCategorywidget
              scrollIntoViewEnabled={this.state.scrollIntoViewEnabled}
              close={this.handleClose}
              clear={this.handleCategoryClear}
              highlighted={this.state.highlightedCategory === result.engine.id ? this.state.highlighted : null}
              selected={this.handleCategoryEntrySelected}
              key={result.engine.id}
              entered={this.handleCategoryEntryEntered}
              result={result}
            />
          );
        })}
      </CommandPalletWidget>
    );
  }
}
