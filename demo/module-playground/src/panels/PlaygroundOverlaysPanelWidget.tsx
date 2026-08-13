import * as React from 'react';
import { observer } from 'mobx-react';
import {
  AnchoredOverlayPlacement,
  AnchoredOverlayRecord,
  AnchoredOverlayStore,
  CardWidget,
  FloatingPanelWidget,
  getAnchoredOverlayBounds,
  ioc,
  PanelButtonMode,
  PanelButtonWidget,
  ReactorPanelModel,
  styled,
  useDimensionObserver
} from '@journeyapps/reactor-mod';

export interface PlaygroundOverlaysPanelWidgetProps {
  model: ReactorPanelModel;
}

export const PlaygroundOverlaysPanelWidget: React.FC<PlaygroundOverlaysPanelWidgetProps> = observer(() => {
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [overlay, setOverlay] = React.useState<AnchoredOverlayRecord>();
  const overlayStore = ioc.get(AnchoredOverlayStore);

  useDimensionObserver(
    {
      element: anchorRef,
      changed: () => {
        if (overlay && anchorRef.current) {
          overlay.update({ bounds: getAnchoredOverlayBounds(anchorRef.current) });
        }
      },
      enabled: !!overlay
    },
    [overlay]
  );

  React.useEffect(() => {
    return () => {
      overlay?.hide();
    };
  }, [overlay]);

  const toggleOverlay = () => {
    if (overlay) {
      overlay.hide();
      setOverlay(undefined);
      return;
    }
    if (!anchorRef.current) {
      return;
    }
    const record = overlayStore.show(
      new AnchoredOverlayRecord({
        source: 'playground.overlay-store',
        bounds: getAnchoredOverlayBounds(anchorRef.current),
        placement: AnchoredOverlayPlacement.AUTO,
        clickThrough: true,
        render: ({ above }) => (
          <FloatingPanelWidget center={false} highlight={true}>
            <S.Overlay>
              <S.OverlayTitle>Anchored overlay</S.OverlayTitle>
              <S.OverlayText>Rendered by AnchoredOverlayStore {above ? 'above' : 'below'} the target.</S.OverlayText>
            </S.Overlay>
          </FloatingPanelWidget>
        )
      })
    );
    setOverlay(record);
  };

  return (
    <S.Container>
      <CardWidget
        title="Anchored Overlay Store"
        subHeading="Directly register, position, and remove an overlay through the shared store"
        sections={[
          {
            key: 'overlay-store-demo',
            content: () => (
              <S.Demo>
                <PanelButtonWidget
                  forwardRef={anchorRef}
                  label={overlay ? 'Hide overlay' : 'Show overlay'}
                  icon={overlay ? 'eye-slash' : 'eye'}
                  mode={PanelButtonMode.NORMAL}
                  action={toggleOverlay}
                />
                <S.Help>Click the button, then resize or scroll the workspace to inspect the anchored layer.</S.Help>
              </S.Demo>
            )
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
    gap: 12px;
  `;

  export const Demo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  `;

  export const Help = styled.div`
    color: ${(p) => p.theme.text.secondary};
    font-size: 13px;
  `;

  export const Overlay = styled.div`
    min-width: 220px;
    padding: 10px;
  `;

  export const OverlayTitle = styled.div`
    color: ${(p) => p.theme.text.primary};
    font-weight: 700;
  `;

  export const OverlayText = styled.div`
    margin-top: 4px;
    color: ${(p) => p.theme.text.secondary};
    font-size: 12px;
  `;
}
