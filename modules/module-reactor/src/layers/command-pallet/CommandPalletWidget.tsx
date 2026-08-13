import * as React from 'react';
import styled from '@emotion/styled';
import { ControlledSearchWidget } from '../../widgets/search/ControlledSearchWidget';
import { TabSelectionKeyboardWidget } from '../../widgets/tabs/TabSelectionKeyboardWidget';
import { TabKeyboardHelpWidget } from '../../widgets/tabs/TabKeyboardHelpWidget';
import { FloatingPanelWidget } from '../../widgets/floating/FloatingPanelWidget';
import { TabDirective } from '../../widgets/tabs/TabListWidget';
import { LargerCMDPalletSetting } from '../../preferences/LargerCMDPalletSetting';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import { themed } from '../../stores/themes/reactor-theme-fragment';
import { getScrollableCSS } from '../../widgets/panel/panel/PanelWidget';
import { IconWidget } from '../../widgets/icons/IconWidget';

export interface CommandPalletWidgetProps {
  close?: () => any;
  mobile?: boolean;
  searchChanged: (search: string, tab: string) => any;
  tabSelected: string;
  tabs: TabDirective[];
  wheelScroll: () => any;
}

export interface CommandPalletWidgetState {
  selected: string;
  search: string;
}

namespace S {
  export const FloatingContainer = themed.div<{ larger: boolean }>`
    width: ${(p) => (p.larger ? 950 : 700)}px;

    // Keep the native drag source interactive when the surrounding layer becomes
    // click-through so that entities can be dragged onto controls behind it.
    pointer-events: all;
  `;
  export const MobileContainer = themed.div`
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    box-sizing: border-box;
    padding: 0 8px 8px 8px;
    background: ${(p) => p.theme.combobox.background};
  `;
  export const Content = themed.div<{ larger: boolean; mobile?: boolean }>`
    height: ${(p) => (p.mobile ? 'auto' : p.larger ? '450px' : '300px')};
    flex-grow: ${(p) => (p.mobile ? 1 : 0)};
    min-height: 0;
    padding-top: 10px;
    padding-bottom: 10px;
    box-sizing: border-box;
    overflow-y: auto;
    ${(p) => (p.mobile ? getScrollableCSS(p.theme) : '')};
  `;
  export const Search = styled.div`
    padding-top: 5px;
    padding-bottom: 5px;
  `;
  export const Top = styled.div`
    display: flex;
    align-items: center;
    flex-shrink: 0;
    min-height: 44px;
  `;

  export const MobileCloseButton = themed.button`
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 6px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(p) => p.theme.combobox.text};
    background: transparent;
    font-size: 18px;
  `;

  export const Tabs = styled(TabSelectionKeyboardWidget)`
    flex-grow: 1;
  `;
}

@observer
export class CommandPalletWidget extends React.Component<
  React.PropsWithChildren<CommandPalletWidgetProps>,
  CommandPalletWidgetState
> {
  searchInputRef: React.RefObject<HTMLInputElement>;
  constructor(props: CommandPalletWidgetProps) {
    super(props);
    this.state = {
      selected: props.tabSelected,
      search: ''
    };
    this.searchInputRef = React.createRef();
  }

  componentDidUpdate(
    prevProps: Readonly<CommandPalletWidgetProps>,
    prevState: Readonly<CommandPalletWidgetState>,
    snapshot?: any
  ) {
    if (prevState.selected !== this.state.selected) {
      this.searchInputRef.current?.focus();
    }
  }

  render() {
    const larger = LargerCMDPalletSetting.get().checked;
    const content = (
      <>
        <S.Top>
          <S.Tabs
            tabSelected={(key: string) => {
              this.setState(
                {
                  selected: key
                },
                () => {
                  _.defer(() => {
                    this.props.searchChanged(this.state.search, this.state.selected);
                  });
                }
              );
            }}
            selected={this.state.selected}
            tabs={this.props.tabs}
          />
          {this.props.mobile ? null : <TabKeyboardHelpWidget />}
          {this.props.mobile ? (
            <S.MobileCloseButton onClick={this.props.close}>
              <IconWidget icon="times" />
            </S.MobileCloseButton>
          ) : null}
        </S.Top>
        <S.Search>
          <ControlledSearchWidget
            historyContext="cmd-palette"
            focusOnMount={true}
            inputRef={this.searchInputRef}
            searchChanged={(search) => {
              this.setState(
                {
                  search: search
                },
                () => {
                  _.defer(() => {
                    this.props.searchChanged(this.state.search, this.state.selected);
                  });
                }
              );
            }}
          />
        </S.Search>
        <S.Content
          onWheel={() => {
            this.props.wheelScroll();
          }}
          larger={larger}
          mobile={this.props.mobile}
        >
          {this.props.children}
        </S.Content>
      </>
    );

    if (this.props.mobile) {
      return (
        <S.MobileContainer
          onMouseDown={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
        >
          {content}
        </S.MobileContainer>
      );
    }

    return (
      <FloatingPanelWidget center={true}>
        <S.FloatingContainer larger={larger}>{content}</S.FloatingContainer>
      </FloatingPanelWidget>
    );
  }
}
