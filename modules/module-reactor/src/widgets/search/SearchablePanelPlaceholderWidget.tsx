import * as React from 'react';
import styled from '@emotion/styled';
import { SearchEvent } from '@journeyapps/reactor-lib-search';
import { themed } from '../../stores/themes/reactor-theme-fragment';
const no_results = require('../../../media/panel-search-empty.svg');

export interface SearchablePanelPlaceholderWidgetProps {
  searchEvent: SearchEvent;
  entityName?: string;
}

namespace S {
  export const Container = styled.div<{}>`
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  `;

  export const Image = styled.img`
    width: 70px;
    margin-bottom: 10px;
  `;

  export const Title = themed.div`
    font-size: 14px;
    margin-bottom: 10px;
    color: ${(p) => p.theme.text.primary};
  `;

  export const Desc = themed.div`
    font-size: 14px;
    margin-bottom: 10px;
    color: ${(p) => p.theme.text.secondary};
  `;
}

export const SearchablePanelPlaceholderWidget: React.FC<SearchablePanelPlaceholderWidgetProps> = (props) => {
  const getText = () => {
    if (!props.searchEvent.search) {
      return <S.Title>No {props.entityName || 'entities'} found</S.Title>;
    }
    return (
      <>
        <S.Title>No {props.entityName || 'search results'} found for</S.Title>
        <S.Desc>"{props.searchEvent.search}"</S.Desc>
      </>
    );
  };

  return (
    <S.Container>
      <S.Image src={no_results} />
      {getText()}
    </S.Container>
  );
};
