import * as React from 'react';
import { useState } from 'react';
import { ControlledSearchWidget } from './ControlledSearchWidget';
import { getScrollableCSS, PANEL_CONTENT_PADDING } from '../panel/panel/PanelWidget';
import { observer } from 'mobx-react';
import { createSearchEventMatcher, SearchEvent } from '@journeyapps/reactor-lib-search';
import { BorderLayoutWidget } from '../layout/BorderLayoutWidget';
import { styled } from '../../stores/themes/reactor-theme-fragment';

export interface SearchablePanelWidgetProps {
  getContent: (event: SearchEvent) => any;
  className?: any;
  historyContext?: string;
}

namespace S {
  export const ControlledSearch = styled(ControlledSearchWidget)`
    flex-grow: 1;
  `;

  export const Top = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px;
  `;
  export const Content = styled.div`
    padding: ${PANEL_CONTENT_PADDING}px;
    overflow: auto;
    position: relative;
    flex-grow: 1;
    ${(p) => getScrollableCSS(p.theme)};
  `;
}

export const SearchablePanelWidget: React.FC<React.PropsWithChildren<SearchablePanelWidgetProps>> = observer(
  (props) => {
    const [search, setSearch] = useState(null);
    return (
      <BorderLayoutWidget
        top={
          <S.Top>
            <S.ControlledSearch historyContext={props.historyContext} searchChanged={setSearch} />
            {props.children}
          </S.Top>
        }
      >
        <S.Content>
          {props.getContent({
            search: search,
            matches: createSearchEventMatcher(search)
          })}
        </S.Content>
      </BorderLayoutWidget>
    );
  }
);
