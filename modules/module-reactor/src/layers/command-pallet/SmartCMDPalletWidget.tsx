import * as React from 'react';
import { inject } from '../../inversify.config';
import { CMDPalletStore } from '../../stores/CMDPalletStore';
import { CommandPalletSearchResultEntry } from '../../cmd-pallet/CMDPalletSearchEngine';
import { ControlledCommandPalletWidget } from './ControlledCommandPalletWidget';
import * as _ from 'lodash';
import { MousePosition } from '../combo/SmartPositionWidget';
import { createSearchEventMatcher } from '@journeyapps/reactor-lib-search';
import { ReactorViewportMode, useReactorViewportMode } from '../../hooks/useReactorViewportMode';

export interface SmartCMDPalletWidgetProps {
  focused: boolean;
  selected: string;
}

export const SmartCMDPalletWidget: React.FC<SmartCMDPalletWidgetProps> = (props) => {
  const viewportMode = useReactorViewportMode();
  return <SmartCMDPalletWidgetInternal {...props} mobile={viewportMode === ReactorViewportMode.MOBILE} />;
};

interface SmartCMDPalletWidgetInternalProps extends SmartCMDPalletWidgetProps {
  mobile: boolean;
}

export class SmartCMDPalletWidgetInternal extends React.Component<SmartCMDPalletWidgetInternalProps> {
  listener: any;

  @inject(CMDPalletStore)
  accessor commandPalletStore: CMDPalletStore;

  render() {
    return (
      <ControlledCommandPalletWidget
        mobile={this.props.mobile}
        close={() => {
          this.commandPalletStore.showPallet(false);
        }}
        tabSelected={this.props.selected}
        tabs={this.commandPalletStore.getCategories().map((category) => {
          return {
            key: category.name,
            name: category.name
          };
        })}
        focused={this.props.focused}
        enter={(entry: CommandPalletSearchResultEntry, event: MousePosition) => {
          requestAnimationFrame(async () => {
            // we might not want to close the pallet on selection (such as when selecting preference toggles)
            if (entry.engine.handleEnter(entry, event)) {
              if (entry.immediatelyClose == null || entry.immediatelyClose) {
                this.commandPalletStore.showPallet(false);
              }
            }
          });
        }}
        selected={async (entry: CommandPalletSearchResultEntry, event: MousePosition) => {
          // we might not want to close the pallet on selection (such as when selecting preference toggles)
          if (entry.engine.handleSelection(entry, event)) {
            this.commandPalletStore.showPallet(false);
          }
        }}
        getSearchResults={(search: string, tab) => {
          return _.map(this.commandPalletStore.getSearchEngines(tab), (engine) => {
            return engine.doSearch({
              search: search,
              matches: createSearchEventMatcher(search)
            });
          });
        }}
      />
    );
  }
}
