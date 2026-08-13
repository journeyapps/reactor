import * as React from 'react';
import { useRef } from 'react';
import { Btn } from '../../definitions/common';
import { themed } from '../../stores/themes/reactor-theme-fragment';
import { IconWidget } from '../icons/IconWidget';
import styled from '@emotion/styled';
import { getTransparentColor } from '@journeyapps/reactor-lib-utils';
import { useButton } from '../../hooks/useButton';
import { ReactorTooltipWidget, setupTooltipProps, TooltipPosition } from '../info/tooltips';
import { REACTOR_MOBILE_MEDIA_QUERY } from '../../hooks/useReactorViewportMode';
import { ButtonValidationIndicatorWidget } from '../buttons/ButtonValidationIndicatorWidget';
import { ActionValidationState } from '../../actions/validators/ActionValidator';

export interface FloatingPanelButtonWidgetProps {
  btn: Btn;
  className?;
}

namespace S {
  export const Button = themed.div<{ primary: boolean; disabled?: boolean; highlight: boolean }>`
    border-radius: 3px;
    cursor: pointer;
    color: ${(p) => p.theme.combobox.text};
    font-size: 13px;
    padding: 4px 8px;
    border: solid 1px ${(p) =>
      p.highlight
        ? p.theme.guide.accent
        : p.primary
          ? p.theme.buttonPrimary.border
          : getTransparentColor(p.theme.combobox.text, 0.2)};
    display: flex;
    background-color: rgba(0, 0, 0, 0);
    margin-left: 5px;
    align-items: center;
    pointer-events: all;
    opacity: ${(p) => (p.disabled ? 0.5 : 1)};
    column-gap: 10px;
    position: relative;

    &:hover {
      border-color: ${(p) => p.theme.combobox.text};
    }

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      min-width: 88px;
      min-height: 40px;
      padding: 8px 12px;
      font-size: 16px;
      justify-content: center;
    }
  `;

  export const Label = styled.div`
    flex-grow: 1;
    user-select: none;

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      text-align: center;
    }
  `;

  export const Icon = styled.div`
    opacity: 0.4;
  `;
}

export const FloatingPanelButtonWidget: React.FC<FloatingPanelButtonWidgetProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { icon, attention, onClick, tooltip, disabled, validationResult } = useButton({
    btn: props.btn,
    forwardRef: ref
  });
  if (validationResult.type === ActionValidationState.HIDDEN) {
    return null;
  }
  const label = props.btn.label || props.btn.tooltip;
  return (
    <ReactorTooltipWidget tooltip={tooltip} tooltipPos={TooltipPosition.BOTTOM}>
      <S.Button
        highlight={!!attention}
        primary={props.btn.submitButton}
        {...setupTooltipProps({ tooltip: tooltip, tooltipPos: TooltipPosition.BOTTOM })}
        ref={ref}
        className={props.className}
        disabled={disabled}
        onClick={onClick}
      >
        <ButtonValidationIndicatorWidget validationResult={validationResult} />
        {label ? <S.Label>{label}</S.Label> : null}
        {icon ? (
          <S.Icon>
            <IconWidget {...icon} />
          </S.Icon>
        ) : null}
      </S.Button>
    </ReactorTooltipWidget>
  );
};
