import { RepresentAsComboBoxItemsEvent } from './AbstractControl';
import { ComboBoxItem } from '../stores/combo/ComboBoxDirectives';
import * as React from 'react';
import { useEffect } from 'react';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { inject, ioc } from '../inversify.config';
import { ComboBoxStore2 } from '../stores/combo2/ComboBoxStore2';
import { v4 } from 'uuid';
import { Btn } from '../definitions/common';
import { ThemeStore } from '../stores/themes/ThemeStore';
import { styled, theme } from '../stores/themes/reactor-theme-fragment';
import { AbstractValueControl, AbstractValueControlOptions } from './AbstractValueControl';
import { IconWidget, ReactorIcon } from '../widgets/icons/IconWidget';
import { ReactorTooltipWidget } from '../widgets/info/tooltips';
import { getReactorControlBorderRadius, size, Size, useReactorSize } from '../hooks/useReactorSize';
import { MousePosition } from '../layers/combo/SmartPositionWidget';
import { PanelButtonWidget } from '../widgets/forms/PanelButtonWidget';
import { SimpleComboBoxDirective } from '../stores/combo2/directives/simple/SimpleComboBoxDirective';

export interface SetControlOption<T extends string> {
  key: T;
  label: string;
  icon?: ReactorIcon;
  group?: string;
}

export interface SetControlOptions<T extends string> extends AbstractValueControlOptions<T> {
  options: SetControlOption<T>[];
  disabled?: boolean;
  tooltip?: string;
}

export class SetControl<T extends string = string> extends AbstractValueControl<T, SetControlOptions<T>> {
  @inject(ComboBoxStore2)
  accessor comboBoxStore: ComboBoxStore2;

  @inject(ThemeStore)
  accessor themeStore: ThemeStore;

  get tooltip() {
    return this.options.tooltip;
  }

  get disabled() {
    return this.options.disabled;
  }

  get hasOptions() {
    return this.options.options.length > 0;
  }

  representAsComboBoxItems(options: RepresentAsComboBoxItemsEvent = {}): ComboBoxItem[] {
    const id = v4();
    return this.options.options.map((o) => {
      const selected = o.key === this.value;
      return {
        key: `${id}-${o.key}`,
        title: o.label,
        group: o.group || options.label,
        icon: selected ? 'check-square' : 'square',
        color: selected ? this.themeStore.getCurrentTheme(theme).status.success : null,
        action: async () => {
          this.value = o.key;
        }
      };
    });
  }

  select(event: MousePosition) {
    if (this.options.disabled) {
      return;
    }
    ioc.get(ComboBoxStore2).show(
      new SimpleComboBoxDirective({
        items: this.representAsComboBoxItems(),
        event: event
      })
    );
  }

  getSelectedOption() {
    return this.options.options.find((o) => o.key === this.value);
  }

  representAsControl(): React.JSX.Element {
    return <SetControlWidget control={this} />;
  }

  representAsBtn(): Btn {
    return {
      action: (event) => {
        this.select(event);
      }
    };
  }
}

namespace S {
  export const Placeholder = styled.em`
    color: ${(p) => p.theme.text.secondary};
  `;

  export const Empty = styled.button<{ $size: Size }>`
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: ${(p) => size(p, ['4px 10px', '6px 14px', '8px 18px'])};
    height: ${(p) => size(p, ['28px', '34px', '42px'])};
    border: 1px solid ${(p) => p.theme.button.border};
    border-radius: ${(p) => getReactorControlBorderRadius(p.$size)}px;
    background: ${(p) => p.theme.button.background};
    color: ${(p) => p.theme.text.secondary};
    font-family: inherit;
    font-size: ${(p) => size(p, ['14px', '15px', '17px'])};
    cursor: pointer;

    &:disabled {
      opacity: 0.3;
      cursor: default;
    }
  `;
}

export interface SetControlWidgetProps {
  control: SetControl;
}

export const SetControlWidget: React.FC<SetControlWidgetProps> = (props) => {
  const forceUpdate = useForceUpdate();
  const controlSize = useReactorSize();
  useEffect(() => {
    return props.control.registerListener({
      valueChanged: () => {
        forceUpdate();
      },
      optionsUpdated: () => {
        forceUpdate();
      }
    });
  }, []);

  if (!props.control.hasOptions) {
    return <S.Placeholder>(No values)</S.Placeholder>;
  }

  const label = props.control.getSelectedOption()?.label;
  if (!label) {
    return (
      <ReactorTooltipWidget tooltip={props.control.tooltip}>
        <S.Empty
          type="button"
          $size={controlSize}
          disabled={props.control.disabled}
          onClick={(event) => props.control.select(event)}
        >
          <em>Select a value</em>
          <IconWidget icon="sort" />
        </S.Empty>
      </ReactorTooltipWidget>
    );
  }
  return (
    <PanelButtonWidget
      label={label}
      tooltip={props.control.tooltip}
      disabled={props.control.disabled}
      icon="sort"
      action={(event) => {
        props.control.select(event);
      }}
    />
  );
};
