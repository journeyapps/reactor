import React from 'react';
import styled from '@emotion/styled';
import { themed } from '../../../../../stores/themes/reactor-theme-fragment';
import { IconWidget } from '../../../../../widgets/icons/IconWidget';
import { MatchesWidget } from '../../../../../widgets/search/MatchesWidget';
import { SearchEventMatch } from '@journeyapps/reactor-lib-search';
import { EntityDescription } from '../../../meta/EntityDescriberComponent';

export interface EntityCardTitleWidgetProps {
  description: EntityDescription;
  titleMatch?: SearchEventMatch;
}

namespace S {
  export const CardTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
  `;

  export const CardTitleLabel = themed.div`
    font-size: 14px;
    font-weight: bold;
    color: ${(p) => p.theme.cards.foreground};
  `;

  export const CardTitleIcon = themed(IconWidget)<{ color?: string }>`
    color: ${(p) => p.color || p.theme.cards.foreground};
  `;
}

export function EntityCardTitleWidget(props: EntityCardTitleWidgetProps) {
  return (
    <S.CardTitle>
      {props.description.icon ? (
        <S.CardTitleIcon icon={props.description.icon} color={props.description.iconColor} />
      ) : null}
      <S.CardTitleLabel>
        {props.titleMatch ? (
          <MatchesWidget text={props.description.simpleName} locators={props.titleMatch.locators} />
        ) : (
          props.description.simpleName
        )}
      </S.CardTitleLabel>
    </S.CardTitle>
  );
}
