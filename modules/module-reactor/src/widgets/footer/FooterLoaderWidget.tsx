import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { LoadingDirectiveState } from '../../stores/visor/VisorLoadingDirective';
import { ioc } from '../../inversify.config';
import { ThemeStore } from '../../stores/themes/ThemeStore';
import { theme } from '../../stores/themes/reactor-theme-fragment';
import { useDelay } from '../../hooks/useDelay';

const loader = require('../../../media/loader.png');

export interface FooterLoaderWidgetProps {
  percentage?: number;
  mode: LoadingDirectiveState;
  show: boolean;
  className?: any;
  color?: string;
}

export const FooterLoaderWidget: React.FC<FooterLoaderWidgetProps> = (props) => {
  const currentTheme = ioc.get(ThemeStore).getCurrentTheme(theme);
  const [show, setShow] = useState(false);
  const delay = useDelay();

  let color = props.color || null;
  if (props.mode === LoadingDirectiveState.ERROR) {
    color = currentTheme.status.failed;
  }
  if (props.mode === LoadingDirectiveState.SUCCESS) {
    color = currentTheme.status.success;
  }

  useEffect(() => {
    delay.schedule(() => {
      if (props.mode !== LoadingDirectiveState.LOADING) {
        setShow(false);
      } else {
        setShow(true);
      }
    }, 500);
    return delay.cancel;
  }, [props.mode, delay]);

  return (
    <S.Container className={props.className} show={show}>
      {props.show ? (
        <S.Loader percent={props.percentage} color={color}>
          {props.mode === LoadingDirectiveState.LOADING ? <S.LoaderBackground /> : null}
        </S.Loader>
      ) : null}
    </S.Container>
  );
};
namespace S {
  export const SIZE = 30;

  export const Keyframes = keyframes`
    0% {
      background-position: 100%
    }
    100% {
      background-position: 0
    }
  `;

  export const Keyframes2 = keyframes`
    0% {
      background-position: 0;
    }
    100% {
      background-position: ${SIZE}px;
    }
  `;

  export const Loader = styled.div<{ color: string; percent: number }>`
    display: block;
    background: ${(p) => (p.color ? p.color : 'linear-gradient(90deg, cyan, #b34bff, orange)')};
    background-size: 300% 100%;
    animation: ${S.Keyframes} 1.4s linear infinite alternate;
    width: ${(p) => p.percent}%;
    position: relative;
    bottom: 0;
    height: 100%;
    transition: width 0.5s;
  `;

  export const LoaderBackground = styled.div`
    background: url('${loader}');
    background-size: ${SIZE}px ${SIZE}px;
    opacity: 0.6;
    position: absolute;
    animation: ${S.Keyframes2} 2s linear infinite;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  `;

  export const Container = styled.div<{ show: boolean }>`
    opacity: ${(p) => (p.show ? 1 : 0)};
    transition: opacity 0.5s;
    height: 4px;
    background: rgb(30, 30, 30);
    position: relative;
  `;
}
