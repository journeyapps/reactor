import * as React from 'react';
import { IconWidget } from '../icons/IconWidget';
import { ButtonAction } from '../../definitions/common';
import styled from '@emotion/styled';
import { getDarkenedColor } from '@journeyapps/reactor-lib-utils';
import { REACTOR_MOBILE_MEDIA_QUERY } from '../../hooks/useReactorViewportMode';
import { ReactorTooltipWidget, TooltipPosition } from '../info/tooltips';
import type { ValidationIndicator } from '../../actions/validators/ActionValidator';

namespace S {
  export const Symbol = styled.div<{ color?: string; foreground: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    background: ${(p) => p.color || 'transparent'};
    border: solid 1px ${(p) => (p.color ? getDarkenedColor(p.color, 0.4) : 'transparent')};
    color: ${(p) => p.foreground};
    font-size: 10px;
    font-weight: 600;
    line-height: 1;
    flex-shrink: 0;

    svg {
      font-size: 10px;
    }

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      width: 19px;
      height: 19px;
      font-size: 12px;

      svg {
        font-size: 12px;
      }
    }
  `;
}

export interface TreeBadgeWidgetProps extends ValidationIndicator {
  action?: ButtonAction;
}

export const TreeBadgeWidget: React.FC<TreeBadgeWidgetProps> = (props) => {
  const { background, foreground, icon, value, tooltip, action } = props;
  return (
    <ReactorTooltipWidget tooltip={tooltip} tooltipPos={TooltipPosition.LEFT}>
      <S.Symbol
        key={`${tooltip}-${icon || value}`}
        color={background}
        foreground={foreground || '#fff'}
        aria-label={tooltip}
        onClick={(event) => {
          event.stopPropagation();
          action?.(event);
        }}
      >
        {value || (icon ? <IconWidget icon={icon} /> : null)}
      </S.Symbol>
    </ReactorTooltipWidget>
  );
};
