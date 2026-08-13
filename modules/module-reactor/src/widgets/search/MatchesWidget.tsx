import * as React from 'react';
import styled from '@emotion/styled';
import { SearchEventLocators } from '@journeyapps/reactor-lib-search';

export interface MatchesWidgetProps {
  locators: SearchEventLocators;
  text: string;
  className?: any;
}

namespace S {
  export const Container = styled.div<{}>`
    display: flex;
    align-items: center;
  `;

  export const Matched = styled.span`
    color: white !important;
    background: linear-gradient(rgb(0, 164, 255), rgba(0, 116, 255));
    border-radius: 5px;
    padding-left: 5px;
    padding-right: 5px;
  `;
}

export const MatchesWidget: React.FC<MatchesWidgetProps> = React.memo((props) => {
  let parts: { text: string; match: boolean }[] = [];
  let index = 0;

  props.locators.forEach((locator) => {
    if (locator.locatorStart > index) {
      parts.push({
        text: props.text.substring(index, locator.locatorStart),
        match: false
      });
    }

    parts.push({
      text: props.text.substring(locator.locatorStart, locator.locatorEnd),
      match: true
    });
    index = locator.locatorEnd;
  });
  if (index <= props.text.length - 1) {
    parts.push({
      text: props.text.substring(index, props.text.length),
      match: false
    });
  }

  return (
    <S.Container className={props.className}>
      {parts.map((part, index) => {
        const key = `${index}-${part.text}`;
        if (part.match) {
          return <S.Matched key={key}>{part.text}</S.Matched>;
        }
        return <span key={key}>{part.text}</span>;
      })}
    </S.Container>
  );
});
