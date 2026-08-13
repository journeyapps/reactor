import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionValidationState, ValidationResult } from '../actions/validators/ActionValidator';
import { Btn } from '../definitions/common';

import { MousePosition } from '../layers/combo/SmartPositionWidget';
import { CommonKeys, KeyboardStore } from '../stores/KeyboardStore';
import { ButtonComponentSelection, ReactorComponentType } from '../stores/guide/selections/common';
import { ThemeStore } from '../stores/themes/ThemeStore';
import { theme } from '../stores/themes/reactor-theme-fragment';
import { useAttention } from '../widgets/guide/AttentionWrapperWidget';
import { ReactorIcon } from '../widgets/icons/IconWidget';
import { activateWithValidation, useValidator } from './useValidator';
import { ioc } from '../inversify.config';

export interface UseButtonProps {
  btn: Btn;
  forwardRef?: React.RefObject<HTMLDivElement>;
}

/**
 * Resolve button tooltip text after applying validation feedback.
 *
 * Disabled, pending, and blocked validation messages take priority. A tooltip
 * that duplicates the visible button label is omitted.
 */
export const resolveButtonTooltip = (btn: Btn, validationResult: ValidationResult) => {
  let tooltip = btn.tooltip;
  // Disabled and blocked actions should explain why they cannot currently run.
  if (
    validationResult.type === ActionValidationState.DISABLED ||
    validationResult.type === ActionValidationState.PENDING ||
    validationResult.type === ActionValidationState.BLOCKED
  ) {
    tooltip = validationResult.message || tooltip;
  }

  // A visible label already communicates identical text, so avoid showing a redundant tooltip.
  return tooltip === btn.label ? undefined : tooltip;
};

export const useButton = (props: UseButtonProps) => {
  const ref = props.forwardRef || useRef(null);
  let [loading, setLoading] = useState<boolean>(false);
  const { validationResult, disabled: validationDisabled } = useValidator({ validator: props.btn.validator });
  const disabled = (props.btn.disabled ?? false) || validationDisabled;

  let action = useCallback(
    async (event: MousePosition) => {
      await activateWithValidation(validationResult, async () => {
        if (loading || disabled) {
          return;
        }
        let loadingCalledManually = false;
        try {
          setLoading(true);
          await props.btn.action(event, (_loading: boolean) => {
            loadingCalledManually = true;
            setLoading(_loading);
          });
        } finally {
          if (!loadingCalledManually) {
            setLoading(false);
          }
        }
      });
    },
    [props.btn.action, loading, disabled, validationResult]
  );

  const selected = useAttention<ButtonComponentSelection>({
    type: ReactorComponentType.BTN,
    selection: {
      label: props.btn.label || props.btn.tooltip
    },
    forwardRef: ref
  });

  // submit button
  useEffect(() => {
    if (props.btn.submitButton) {
      const context = ioc.get(KeyboardStore).pushContext();
      context.handle({
        key: CommonKeys.ENTER,
        action: () => {
          const bounds = ref.current.getBoundingClientRect();
          action({ clientX: bounds.left, clientY: bounds.top });
        }
      });
      return () => {
        context.dispose();
      };
    }
  }, [props.btn.submitButton]);

  // icons and color
  let icon: { icon: ReactorIcon; spin: boolean; color?: string } = null;
  let color: string;
  if (props.btn.highlight) {
    const buttonTheme = ioc.get(ThemeStore).getCurrentTheme(theme).buttonPrimary;
    color = buttonTheme.border;
  }
  if (props.btn.icon) {
    icon = {
      icon: loading ? 'sync-alt' : props.btn.icon,
      spin: loading,
      color: color
    };
  }

  // tooltips
  const tooltip = resolveButtonTooltip(props.btn, validationResult);

  return {
    border: color,
    attention: selected,
    onClick: action,
    loading: loading,
    disabled: disabled,
    tooltip: tooltip,
    icon,
    ref,
    validationResult
  };
};
