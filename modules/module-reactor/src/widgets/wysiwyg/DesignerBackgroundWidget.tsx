import * as React from 'react';
import { getTransparentColor } from '@journeyapps/reactor-lib-utils';
import { themed } from '../../stores/themes/reactor-theme-fragment';

namespace S {
  export const Container = themed.div<{ error: boolean }>`
      height: 100%;
      width: 100%;
      background: ${(p) => p.theme.canvas.background};
      border: solid 1px ${(p) =>
        p.error ? getTransparentColor(p.theme.status.failed, 0.3) : p.theme.canvas.background};
      position: relative;
      background-image: linear-gradient(
        0deg,
        transparent 24%,
        ${(p) => p.theme.canvas.grid} 25%,
        ${(p) => p.theme.canvas.grid} 26%,
        transparent 27%,
        transparent 74%,
        ${(p) => p.theme.canvas.grid} 75%,
        ${(p) => p.theme.canvas.grid} 76%,
        transparent 77%,
        transparent
      ),
      linear-gradient(
        90deg,
        transparent 24%,
        ${(p) => p.theme.canvas.grid} 25%,
        ${(p) => p.theme.canvas.grid} 26%,
        transparent 27%,
        transparent 74%,
        ${(p) => p.theme.canvas.grid} 75%,
        ${(p) => p.theme.canvas.grid} 76%,
        transparent 77%,
        transparent
      );
    background-size: 50px 50px;
  `;

  export const Error = themed.div`
      background: ${(p) => getTransparentColor(p.theme.status.failed, 0.3)};
      color: rgba(255,255,255,0.7);
      font-size: 13px;
      padding: 5px 10px;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
  `;
}

export interface DesignerBackgroundWidgetProps {
  error?: string;
  forwardRef?: React.RefObject<HTMLDivElement>;
}

export class DesignerBackgroundWidget extends React.Component<React.PropsWithChildren<DesignerBackgroundWidgetProps>> {
  getError() {
    if (!!this.props.error) {
      return <S.Error>{this.props.error}</S.Error>;
    }
    return null;
  }

  render() {
    return (
      <S.Container ref={this.props.forwardRef as any} error={!!this.props.error}>
        {this.props.children}
        {this.getError()}
      </S.Container>
    );
  }
}
