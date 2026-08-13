import * as React from 'react';
import styled from '@emotion/styled';
import { computeDateTimeParts, ComputeDateTimePartsOptions, ReactorDateType } from '@journeyapps/reactor-lib-utils';
import { useDisplayDateOptions } from '../../hooks/useDisplayDateOptions';

export interface DateDisplayWidgetProps extends ComputeDateTimePartsOptions {
  zone: boolean;
  className?: any;
}

export const DateDisplayWidget: React.FC<DateDisplayWidgetProps> = (props) => {
  let { zone, display } = computeDateTimeParts(props);

  return (
    <S.Container className={props.className}>
      <S.Time>{display}</S.Time>
      {props.zone ? <S.Zone>{zone}</S.Zone> : null}
    </S.Container>
  );
};
namespace S {
  export const Container = styled.div`
    display: inline-flex;
    column-gap: 4px;
  `;

  export const Time = styled.div``;
  export const Zone = styled.div`
    opacity: 0.5;
  `;
}

export interface SmartDateDisplayWidgetProps {
  date: ReactorDateType;
  className?: any;
}

export const SmartDateDisplayWidget: React.FC<SmartDateDisplayWidgetProps> = (props) => {
  let options = useDisplayDateOptions();
  return <DateDisplayWidget className={props.className} date={props.date} {...options} />;
};
