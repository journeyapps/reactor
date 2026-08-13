import * as React from 'react';
import { observer } from 'mobx-react';
import { CardWidget, ReactorPanelModel, SurfaceWidget, styled } from '@journeyapps/reactor-mod';

export interface PlaygroundSurfacesPanelWidgetProps {
  model: ReactorPanelModel;
}

export const PlaygroundSurfacesPanelWidget: React.FC<PlaygroundSurfacesPanelWidgetProps> = observer(() => {
  return (
    <S.Container>
      <CardWidget
        title="Surface Depths"
        subHeading="Theme-driven background and border colors for nested containers"
        sections={[
          {
            key: 'surface-depths',
            content: () => {
              return (
                <S.Grid>
                  <S.DepthSurface depth={0}>
                    <S.Label>Depth 0</S.Label>
                    <S.Description>Explicit top-level surface.</S.Description>
                  </S.DepthSurface>
                  <S.DepthSurface depth={1}>
                    <S.Label>Depth 1</S.Label>
                    <S.Description>Useful for cards inside cards.</S.Description>
                  </S.DepthSurface>
                  <S.DepthSurface depth={2}>
                    <S.Label>Depth 2</S.Label>
                    <S.Description>Useful for controls inside framed examples.</S.Description>
                  </S.DepthSurface>
                  <S.DepthSurface depth={3}>
                    <S.Label>Depth 3</S.Label>
                    <S.Description>Maximum depth, clamped for consistency.</S.Description>
                  </S.DepthSurface>
                </S.Grid>
              );
            }
          }
        ]}
      />

      <CardWidget
        title="Auto Depth"
        subHeading="Nested surfaces increment depth through React context"
        sections={[
          {
            key: 'surface-auto-depth',
            content: () => {
              return (
                <S.AutoSurface>
                  <S.Label>Automatic depth 1</S.Label>
                  <S.Description>This surface is nested inside a card section.</S.Description>
                  <S.AutoSurface>
                    <S.Label>Automatic depth 2</S.Label>
                    <S.Description>Nested again, no explicit depth prop.</S.Description>
                    <S.AutoSurface>
                      <S.Label>Automatic depth 3</S.Label>
                      <S.Description>Further nesting clamps at the maximum depth.</S.Description>
                    </S.AutoSurface>
                  </S.AutoSurface>
                </S.AutoSurface>
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

  export const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  `;

  export const DepthSurface = styled(SurfaceWidget)`
    padding: 12px;
    min-height: 110px;
  `;

  export const AutoSurface = styled(SurfaceWidget)`
    padding: 12px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
  `;

  export const Label = styled.div`
    color: ${(p) => p.theme.text.primary};
    font-weight: 700;
    font-size: 14px;
  `;

  export const Description = styled.div`
    color: ${(p) => p.theme.text.secondary};
    font-size: 13px;
  `;
}
