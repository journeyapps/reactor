import * as React from 'react';
import { ActionShortcutPillsWidget } from '../../panels/settings/keys/ActionShortcutPillsWidget';
import { TabAction } from '../../actions/builtin-actions/TabAction';
import { styled, themed } from '../../stores/themes/reactor-theme-fragment';
import { getTransparentColor } from '@journeyapps/reactor-lib-utils';

namespace S {
  export const Help = themed.div`
    display: flex;
    align-items: center;
    color: ${(p) => getTransparentColor(p.theme.combobox.text, 0.3).toString()};
    margin-right: 12px;
    font-size: 12px;
    user-select: none;
  `;

  export const ActionPill = styled(ActionShortcutPillsWidget)`
    margin-left: 5px;
    margin-right: 5px;
  `;
}

export interface TabKeyboardHelpWidgetProps {
  hideHelperText?: boolean;
  className?: any;
}

export class TabKeyboardHelpWidget extends React.Component<TabKeyboardHelpWidgetProps> {
  render() {
    return (
      <S.Help className={this.props.className}>
        <S.ActionPill action={TabAction.get(true)} />
        or <S.ActionPill action={TabAction.get(false)} /> {this.props.hideHelperText ? '' : 'to tab left or right'}
      </S.Help>
    );
  }
}
