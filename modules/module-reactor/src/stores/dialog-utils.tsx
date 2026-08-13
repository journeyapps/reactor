import * as React from 'react';
import { copyTextToClipboard } from '@journeyapps/reactor-lib-utils';
import { ioc } from '../inversify.config';
import { DialogStore } from './DialogStore';
import { styled } from './themes/reactor-theme-fragment';
import { Duration } from 'luxon';
import { ScrollableDivCss } from '../widgets/panel/panel/PanelWidget';
import { NotificationStore } from './NotificationStore';

namespace S {
  export const Pre = styled.pre`
    color: ${(p) => p.theme.text.primary};
    background: ${(p) => p.theme.combobox.headerBackground};
    padding: 10px;
    border-radius: 5px;
    max-width: 500px;
    overflow: auto;

    ${ScrollableDivCss};
  `;

  export const Description = styled.div`
    color: ${(p) => p.theme.text.secondary};
    font-size: 13px;
    padding-top: 10px;
  `;

  export const Container: any = styled.div``;
}

export enum TokenDialogType {
  TOKEN = 'Token',
  SECRET = 'Secret'
}

export interface ShowTokenDialogOptions {
  type: TokenDialogType;
  token: string;
  expire_seconds?: number;
}

export const showTokenDialog = async (options: ShowTokenDialogOptions) => {
  const { token, type, expire_seconds } = options;
  copyTextToClipboard(token);
  await ioc.get(DialogStore).showCustomDialog({
    title: `${type} copied to clipboard`,
    generateUI: (options) => {
      options.registerListener(async (btn) => {
        if (btn.label == 'Copy') {
          copyTextToClipboard(token);
          ioc.get(NotificationStore).showNotification({
            title: 'Copied',
            description: `${type} copied to clipboard`
          });
          return false;
        } else {
          return true;
        }
      }, 'copy');

      return (
        <S.Container>
          <S.Pre>{token}</S.Pre>
          {expire_seconds ? (
            <S.Description>
              {type} will expire in{' '}
              {Duration.fromObject({
                seconds: expire_seconds
              })
                .rescale()
                .toHuman()}
            </S.Description>
          ) : null}
        </S.Container>
      );
    },
    btns: [
      {
        icon: 'copy',
        label: 'Copy'
      },
      {
        label: 'Close',
        submitButton: true
      }
    ]
  });
};
