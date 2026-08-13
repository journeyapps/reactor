import * as React from 'react';
import { observer } from 'mobx-react';
import { CardWidget, PanelButtonMode, PanelButtonWidget, ReactorPanelModel, styled } from '@journeyapps/reactor-mod';

export interface PlaygroundButtonsPanelWidgetProps {
  model: ReactorPanelModel;
}

export const PlaygroundButtonsPanelWidget: React.FC<PlaygroundButtonsPanelWidgetProps> = observer(() => {
  const [counter, setCounter] = React.useState(0);

  const increment = () => {
    setCounter((c) => c + 1);
  };

  const decrement = () => {
    setCounter((c) => c - 1);
  };

  const reset = () => {
    setCounter(0);
  };

  const openReactDocs = () => {
    window.open('https://react.dev/reference/react/useState', '_blank');
  };

  return (
    <S.Container>
      <CardWidget
        title="Variant Buttons"
        subHeading="Primary, normal, link, icon-only and disabled states"
        sections={[
          {
            key: 'button-variants',
            content: () => {
              return (
                <>
                  <S.Buttons>
                    <PanelButtonWidget
                      label="Increment"
                      icon="plus"
                      action={increment}
                      mode={PanelButtonMode.PRIMARY}
                    />
                    <PanelButtonWidget label="Decrement" icon="minus" action={decrement} />
                    <PanelButtonWidget label="Reset" icon="redo" action={reset} mode={PanelButtonMode.LINK} />
                    <PanelButtonWidget
                      label="Docs link"
                      icon="external-link-alt"
                      action={openReactDocs}
                      mode={PanelButtonMode.LINK}
                    />
                    <PanelButtonWidget icon="star" tooltip="Icon only button" action={increment} />
                    <PanelButtonWidget label="Text only button" action={increment} />
                  </S.Buttons>
                  <S.Counter>Counter: {counter}</S.Counter>
                </>
              );
            }
          }
        ]}
      />
    </S.Container>
  );
});

namespace S {
  export const Container = styled.div`
    padding: 12px;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    min-height: 100%;
    box-sizing: border-box;
  `;

  export const Buttons = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  `;

  export const Counter = styled.div`
    margin-top: 10px;
    color: ${(p) => p.theme.text.secondary};
  `;
}
