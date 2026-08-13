import { getDarkenedColor } from '@journeyapps/reactor-lib-utils';
import * as React from 'react';
import { styled } from '../../stores/themes/reactor-theme-fragment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HoverWidget } from '../info/tooltips';
import ReactMarkdown from 'react-markdown';

export enum InputContainerContentAlignment {
  LEFT = 'start',
  CENTER = 'center',
  RIGHT = 'end'
}
export interface InputContainerWidgetProps {
  label: string;
  error?: string;
  warning?: string;
  className?: any;
  inline?: boolean;
  inlineWidth?: number;
  suggestionWidget?: React.JSX.Element;
  alignContent?: InputContainerContentAlignment;
  desc?: string;
  tooltip?: string;
}

namespace S {
  export const Container = styled.div<{ inline: boolean }>`
    ${(p) =>
      p.inline
        ? `display: flex; background: ${getDarkenedColor(
            p.theme.panels.trayBackground,
            0.3
          )}; border-radius: 3px;align-items: center`
        : ''};
  `;

  export const Label = styled.div<{ inline: boolean; inlineWidth: number }>`
    font-size: 13px;
    color: ${(p) => p.theme.text.primary};
    margin-bottom: ${(p) => (p.inline ? 0 : 5)}px;
    user-select: none;
    flex-shrink: 0;
    min-width: ${(p) => p.inlineWidth || 0}px;
    box-sizing: border-box;
    ${(p) => (p.inline ? `padding-left: 10px; padding-right: 10px` : '')}
  `;

  export const Error = styled.div`
    color: ${(p) => p.theme.status.failed};
    font-size: 12px;
    margin-top: 5px;
  `;

  export const Warning = styled.div`
    color: ${(p) => p.theme.status.loading};
    font-size: 12px;
    margin-top: 5px;
  `;

  export const Content = styled.div<{ inline: boolean; alignment?: InputContainerContentAlignment }>`
    display: ${(p) => (!!p.alignment ? 'flex' : 'inherit')};
    justify-content: ${(p) => p.alignment};
    ${(p) => (p.inline ? 'flex-grow: 1' : '')};
  `;

  export const Desc = styled.p`
    color: ${(p) => p.theme.text.secondary};
    font-size: 12px;
    padding-top: 3px;
  `;

  export const LabelInner = styled.div`
    opacity: 0.8;
  `;

  export const Top = styled.div`
    display: flex;
    flex-direction: row;
    column-gap: 5px;
  `;

  export const Icon = styled.div``;

  export const Markdown = styled.div`
    color: white;
    padding: 10px;
    > * {
      padding-bottom: 20px;
      &:last-of-type {
        padding-bottom: 0px;
      }
    }
    p {
      font-size: 14px;
      color: ${(p) => p.theme.text.primary};
      max-width: 400px;
    }
    b {
      font-weight: normal;
      color: ${(p) => p.theme.guide.accent};
    }
    code {
      user-select: all;
    }
  `;
}

export class InputContainerWidget extends React.Component<React.PropsWithChildren<InputContainerWidgetProps>> {
  render() {
    return (
      <S.Container inline={this.props.inline} className={this.props.className}>
        <S.Label inlineWidth={this.props.inlineWidth} inline={this.props.inline}>
          <S.Top>
            <S.LabelInner>{this.props.label}</S.LabelInner>
            {this.props.tooltip ? (
              <HoverWidget
                getOverlay={() => {
                  return (
                    <S.Markdown>
                      <ReactMarkdown children={this.props.tooltip} />
                    </S.Markdown>
                  );
                }}
              >
                <FontAwesomeIcon icon="info-circle" />
              </HoverWidget>
            ) : null}
          </S.Top>
          {this.props.desc ? <S.Desc>{this.props.desc}</S.Desc> : null}
        </S.Label>
        <S.Content inline={this.props.inline} alignment={this.props.alignContent}>
          {this.props.children}
        </S.Content>
        {this.props.warning ? <S.Warning>{this.props.warning}</S.Warning> : null}
        {this.props.error ? <S.Error>{this.props.error}</S.Error> : null}
        {this.props.error ? this.props.suggestionWidget : null}
      </S.Container>
    );
  }
}
