import * as React from 'react';
import { observer } from 'mobx-react';
import { Observer } from 'mobx-react';
import { inject } from '../../inversify.config';
import { LayerDirective } from '../../stores/layer/LayerDirective';
import {
  AnchoredOverlayPlacement,
  AnchoredOverlayRecord,
  AnchoredOverlayStore
} from '../../stores/overlay/AnchoredOverlayStore';
import { SmartPositionWidget } from '../combo/SmartPositionWidget';
import { styled } from '../../stores/themes/reactor-theme-fragment';
import { useRef } from 'react';
import { SizeMeasurement, useSizeObserver } from '../../hooks/useSizeObserver';

namespace S {
  export const Container = styled.div<{ $clickThrough: boolean }>`
    position: relative;
    pointer-events: ${(p) => (p.$clickThrough ? 'none' : 'auto')};
  `;
}

const getBounds = (bounds: AnchoredOverlayRecord['bounds']) => ({
  top: bounds.top,
  left: bounds.left,
  right: bounds.right ?? bounds.left + bounds.width,
  bottom: bounds.bottom ?? bounds.top + bounds.height
});

const AnchoredOverlayWidget: React.FC<{ overlay: AnchoredOverlayRecord }> = observer(({ overlay }) => {
  const ref = useRef<HTMLDivElement>(null);
  const dimensions = useSizeObserver(ref, SizeMeasurement.BOUNDS);
  const bounds = getBounds(overlay.bounds);
  const viewportWidth = typeof document === 'undefined' ? 0 : document.documentElement.clientWidth;
  const viewportHeight = typeof document === 'undefined' ? 0 : document.documentElement.clientHeight;
  const gap = 8;
  const viewportPadding = 8;
  const placement =
    overlay.placement === AnchoredOverlayPlacement.AUTO
      ? bounds.bottom + dimensions.height + gap <= viewportHeight
        ? AnchoredOverlayPlacement.BOTTOM
        : AnchoredOverlayPlacement.TOP
      : overlay.placement;

  const position = (() => {
    let clientX: number;
    let clientY: number;

    if (placement === AnchoredOverlayPlacement.TOP) {
      clientX = bounds.left + overlay.bounds.width / 2 - dimensions.width / 2;
      clientY = bounds.top - dimensions.height - gap;
    } else if (placement === AnchoredOverlayPlacement.RIGHT) {
      clientX = bounds.right + gap;
      clientY = bounds.top + overlay.bounds.height / 2 - dimensions.height / 2;
    } else if (placement === AnchoredOverlayPlacement.LEFT) {
      clientX = bounds.left - dimensions.width - gap;
      clientY = bounds.top + overlay.bounds.height / 2 - dimensions.height / 2;
    } else {
      clientX = bounds.left + overlay.bounds.width / 2 - dimensions.width / 2;
      clientY = bounds.bottom + gap;
    }

    return {
      clientX: Math.max(viewportPadding, Math.min(clientX, viewportWidth - dimensions.width - viewportPadding)),
      clientY: Math.max(viewportPadding, Math.min(clientY, viewportHeight - dimensions.height - viewportPadding))
    };
  })();

  return (
    <SmartPositionWidget position={position}>
      <S.Container ref={ref} $clickThrough={overlay.clickThrough}>
        {overlay.render({ placement, above: placement === AnchoredOverlayPlacement.TOP })}
      </S.Container>
    </SmartPositionWidget>
  );
});

export class AnchoredOverlayLayer extends LayerDirective {
  @inject(AnchoredOverlayStore)
  accessor overlayStore: AnchoredOverlayStore;

  getLayerContent(): React.JSX.Element {
    return (
      <Observer
        render={() => (
          <>
            {this.overlayStore.overlays.map((overlay) => (
              <AnchoredOverlayWidget key={overlay.id} overlay={overlay} />
            ))}
          </>
        )}
      />
    );
  }

  show() {
    return this.overlayStore.hasOverlays();
  }

  transparent() {
    return this.overlayStore.isClickThrough();
  }

  layerWillHide() {
    // Overlay lifetime is owned by AnchoredOverlayStore. Disposing only the
    // rendered layer would leave the store and its caller out of sync.
    return false;
  }

  alwaysOnTop() {
    return true;
  }
}
