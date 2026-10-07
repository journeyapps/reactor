import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getDarkenedColor } from '@journeyapps/reactor-lib-utils';
import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { styled } from '../../stores/themes/reactor-theme-fragment';
import { HoverWidget } from '../info/tooltips';

export enum InputContainerContentAlignment {
  LEFT = 'start',
  CENTER = 'center',
  RIGHT = 'end'
}
export interface InputContainerWidgetProps {
  label?: string;
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

export const InputContainerWidget: React.FC<React.PropsWithChildren<InputContainerWidgetProps>> = (props) => {
  const {
    label,
    tooltip,
    desc,
    inlineWidth,
    inline,
    className,
    alignContent,
    children,
    warning,
    error,
    suggestionWidget
  } = props;

  const labelEl =
    !label && !tooltip && !desc ? null : (
      <S.Label inlineWidth={inlineWidth} inline={inline}>
        <S.Top>
          <S.LabelInner>{label}</S.LabelInner>
          {!tooltip ? null : (
            <HoverWidget
              getOverlay={() => (
                <S.Markdown>
                  <ReactMarkdown children={tooltip} />
                </S.Markdown>
              )}
            >
              <FontAwesomeIcon icon="info-circle" />
            </HoverWidget>
          )}
        </S.Top>
        {desc ? <S.Desc>{desc}</S.Desc> : null}
      </S.Label>
    );

  return (
    <S.Container inline={inline} className={className}>
      {labelEl}
      <S.Content inline={inline} alignment={alignContent}>
        {children}
      </S.Content>
      {warning ? <S.Warning>{warning}</S.Warning> : null}
      {error ? <S.Error>{error}</S.Error> : null}
      {error ? suggestionWidget : null}
    </S.Container>
  );
};
