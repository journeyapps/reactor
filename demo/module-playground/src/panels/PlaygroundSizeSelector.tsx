import * as React from 'react';
import {
  ReactorSizeProvider,
  SurfaceWidget,
  Size,
  TabSelectionWidget,
  TabDirective,
  styled
} from '@journeyapps/reactor-mod';

const sizeTabs: TabDirective[] = [
  { key: Size.SMALL, name: 'Small' },
  { key: Size.MEDIUM, name: 'Medium' },
  { key: Size.LARGE, name: 'Large' }
];

export interface PlaygroundSizeSelectorProps {
  children?: React.ReactNode;
}

export const PlaygroundSizeSelector: React.FC<PlaygroundSizeSelectorProps> = (props) => {
  const [size, setSize] = React.useState(Size.SMALL);

  return (
    <ReactorSizeProvider size={size}>
      <S.Container>
        <S.Label>Widget size</S.Label>
        <TabSelectionWidget tabs={sizeTabs} selected={size} tabSelected={(key) => setSize(key as Size)} />
      </S.Container>
      {props.children}
    </ReactorSizeProvider>
  );
};

namespace S {
  export const Container = styled(SurfaceWidget)`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
  `;

  export const Label = styled.div`
    color: ${(p) => p.theme.text.secondary};
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  `;
}
