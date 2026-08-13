import * as React from 'react';
import { ioc } from '../../inversify.config';
import ReactSwitch from 'react-switch';
import { getDarkenedColor, normalizeColorToHex } from '@journeyapps/reactor-lib-utils';
import { ThemeStore } from '../../stores/themes/ThemeStore';
import { styled, theme } from '../../stores/themes/reactor-theme-fragment';
import { observer } from 'mobx-react';
import { size, Size, useReactorSize } from '../../hooks/useReactorSize';

export interface SwitchWidgetProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: Size;
}

export const Switch: React.FC<SwitchWidgetProps> = observer((props) => {
  const resolvedSize = useReactorSize(props.size);
  const currentTheme = ioc.get(ThemeStore).getCurrentTheme(theme);
  return (
    <S.SwitchComp
      disabled={props.disabled}
      onHandleColor={normalizeColorToHex(currentTheme.forms.toggleHandleColor)}
      offHandleColor={normalizeColorToHex(currentTheme.forms.toggleHandleColor)}
      onColor={normalizeColorToHex(getDarkenedColor(currentTheme.forms.toggleOnColor, 0.5))}
      offColor={normalizeColorToHex(currentTheme.forms.checkbox)}
      handleDiameter={size(resolvedSize, [12, 14, 17])}
      height={size(resolvedSize, [15, 18, 22])}
      width={size(resolvedSize, [36, 45, 54])}
      borderRadius={size(resolvedSize, [3, 4, 5])}
      onChange={props.onChange}
      checked={props.checked}
    />
  );
});

namespace S {
  export const SwitchComp = styled(ReactSwitch)<{ checked: boolean }>`
    .react-switch-bg {
      border: solid 1px ${(p) => (p.checked ? p.theme.forms.toggleOnColor : p.theme.forms.checkbox)};
    }
  `;
}
