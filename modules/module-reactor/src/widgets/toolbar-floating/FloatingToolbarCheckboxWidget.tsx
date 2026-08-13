import * as React from 'react';
import styled from '@emotion/styled';
import Switch from 'react-switch';
import { observer } from 'mobx-react';
import { inject } from '../../inversify.config';
import { normalizeColorToHex } from '@journeyapps/reactor-lib-utils';
import { ThemeStore } from '../../stores/themes/ThemeStore';
import { theme, themed } from '../../stores/themes/reactor-theme-fragment';

export interface FloatingToolbarCheckboxWidgetProps {
  name: string;
  checked: boolean;
  changed: (newValue: boolean) => any;
}

namespace S {
  export const Container = styled.div`
    display: flex;
    align-items: center;
  `;

  export const Title = themed.div`
    font-size: 13px;
    color: ${(p) => p.theme.combobox.text};
    opacity: 0.5;
    margin-left: 5px;
  `;
}

@observer
export class FloatingToolbarCheckboxWidget extends React.Component<FloatingToolbarCheckboxWidgetProps> {
  @inject(ThemeStore)
  accessor themeStore: ThemeStore;

  render() {
    const currentTheme = this.themeStore.getCurrentTheme(theme);
    return (
      <S.Container>
        <Switch
          onHandleColor={normalizeColorToHex(currentTheme.forms.toggleHandleColor)}
          offHandleColor={normalizeColorToHex(currentTheme.forms.toggleHandleColor)}
          onColor={normalizeColorToHex(currentTheme.forms.toggleOnColor)}
          offColor={normalizeColorToHex(currentTheme.forms.checkbox)}
          height={12}
          width={30}
          onChange={this.props.changed}
          checked={this.props.checked}
        />
        <S.Title>{this.props.name}</S.Title>
      </S.Container>
    );
  }
}
