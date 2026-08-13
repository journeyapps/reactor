import * as React from 'react';
import { MouseEvent, useRef } from 'react';
import styled from '@emotion/styled';
import { themed } from '../../stores/themes/reactor-theme-fragment';
import { IconWidget, ReactorIcon } from '../../widgets/icons/IconWidget';
import { getTransparentColor } from '@journeyapps/reactor-lib-utils';
import { REACTOR_MOBILE_MEDIA_QUERY } from '../../hooks/useReactorViewportMode';

namespace S {
  export const Container = themed.div<{ selected: boolean; disabled: boolean }>`
    display: flex;
    height: 23px;
    align-items: center;
    cursor: pointer;
    background: ${(p) => (p.selected ? p.theme.combobox.backgroundSelected : 'transparent')};
    ${(p) => (p.selected ? p.theme.combobox.backgroundSelected : 'transparent')};
    user-select: none;

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      min-height: 42px;
      height: auto;
    }
  `;
  export const IconContainer = styled.div<{ color: string; background: string }>`
    width: 30px;
    align-self: stretch;
    color: ${(p) => p.color};
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(p) => p.background};
    flex-shrink: 0;

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      width: 48px;
    }
  `;

  export const Icon = styled(IconWidget)`
    max-height: 20px;

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      max-height: 26px;
    }
  `;

  export const Primary = themed.div<{ selected: boolean; disabled: boolean }>`
    margin-left: 10px;
    color: ${(p) => (p.selected ? p.theme.combobox.textSelected : p.theme.combobox.text)};
    font-family: "Source Sans Pro";
    font-size: 14px;
    white-space: nowrap;
    opacity: ${(p) => (p.disabled ? 0.3 : 1)};

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      margin-left: 12px;
      font-size: 18px;
      line-height: 1.2;
    }
  `;
  export const Secondary = themed.div<{ selected: boolean }>`
    margin-left: 10px;
    color: ${(p) => (p.selected ? p.theme.combobox.textSelected : p.theme.combobox.text)};
    font-family: "Source Sans Pro";
    opacity: 0.2;
    font-size: 14px;
    white-space: nowrap;

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      font-size: 18px;
    }
  `;

  export const Label = styled.div`
    flex-grow: 1;
    display: flex;
    align-items: center;
    min-width: 0;
  `;

  export const Children = styled.div`
    display: flex;
    align-items: center;

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      display: none;
    }
  `;
}

export interface PartialEntryProps {
  icon: ReactorIcon;
  disabled?: boolean;
  primary: string;
  secondary?: string;
  color: string;
  selected?: boolean;
}

export const RawEntry: React.FC<PartialEntryProps> = React.memo((props: PartialEntryProps) => {
  let iconBackground = 'transparent';
  if (props.selected) {
    iconBackground = getTransparentColor(props.color, 0.3);
  }
  return (
    <>
      <S.IconContainer color={props.color} background={iconBackground}>
        <S.Icon icon={props.icon} />
      </S.IconContainer>
      <S.Label>
        <S.Primary disabled={props.disabled} selected={props.selected}>
          {props.disabled ? '[disabled] ' : ''}
          {props.primary}
        </S.Primary>
        <S.Secondary selected={props.selected}>{props.secondary}</S.Secondary>
      </S.Label>
    </>
  );
});

export interface CommandPalletEntryWidgetProps extends PartialEntryProps {
  forwardRef?: React.RefObject<HTMLDivElement>;
  mouseEntered?: () => any;
  mouseClicked?: (event: MouseEvent) => any;
}

export const CommandPalletEntryWidget: React.FC<React.PropsWithChildren<CommandPalletEntryWidgetProps>> = (props) => {
  let _ref = useRef<HTMLDivElement>(null);
  return (
    <S.Container
      disabled={props.disabled}
      onClick={(event) => {
        if (props.mouseClicked) {
          props.mouseClicked(event);
        }
      }}
      onMouseEnter={props.mouseEntered}
      ref={props.forwardRef || _ref}
      selected={props.selected}
    >
      <RawEntry {...props} />
      {props.children ? <S.Children>{props.children}</S.Children> : null}
    </S.Container>
  );
};
