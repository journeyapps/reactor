import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { ImageMedia, ImageMediaURL } from './ImageMedia';
import { LoadingPanelWidget } from '../../../widgets/panel/panel/LoadingPanelWidget';
import { PanelToolbarWidget } from '../../../widgets/panel/toolbar/PanelToolbarWidget';
import { usePanZoom } from '../../../hooks/usePanZoom';

export interface ImageMediaPanelWidgetProps {
  asset: ImageMedia;
}

namespace S {
  export const Container = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    position: absolute;
  `;

  export const Viewer = styled.div<{ $dragging: boolean }>`
    flex: 1;
    min-height: 0;
    overflow: hidden;
    position: relative;
    touch-action: none;
    user-select: none;
    cursor: ${(p) => (p.$dragging ? 'grabbing' : 'grab')};
  `;

  export const Image = styled.img`
    position: absolute;
    top: 50%;
    left: 50%;
    max-width: none;
    max-height: none;
    pointer-events: none;
    transform-origin: center;
  `;
}

const ImageViewer: React.FC<{ asset: ImageMedia; url: string }> = ({ asset, url }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const zoom = usePanZoom(dimensions);
  const options = asset.getOptions();
  return (
    <S.Container>
      <PanelToolbarWidget
        btns={[
          { label: '−', tooltip: 'Zoom out', action: zoom.zoomOut },
          { label: `Zoom ${Math.round(zoom.scale * 100)}%`, tooltip: 'Show at actual size', action: zoom.actualSize },
          { label: '+', tooltip: 'Zoom in', action: zoom.zoomIn },
          { label: 'Fit', tooltip: 'Fit image to window', action: zoom.fit, highlight: zoom.fitting },
          { label: '100%', tooltip: 'Show at actual size', action: zoom.actualSize }
        ]}
        meta={[
          { label: 'Name', value: options.name },
          { label: 'Type', value: `${options.type.options.displayName} (${options.type.options.mime})` },
          { label: 'Width', value: `${dimensions.width}px` },
          { label: 'Height', value: `${dimensions.height}px` },
          { label: 'Size', value: `${asset.getMB().toFixed(2)} MB` }
        ]}
      />
      <S.Viewer ref={zoom.ref} $dragging={zoom.dragging}>
        <S.Image
          src={url}
          alt={options.name}
          draggable={false}
          onLoad={(event) =>
            setDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })
          }
          style={{
            width: dimensions.width || undefined,
            height: dimensions.height || undefined,
            visibility: dimensions.width ? 'visible' : 'hidden',
            marginLeft: -dimensions.width / 2,
            marginTop: -dimensions.height / 2,
            transform: zoom.transform
          }}
        />
      </S.Viewer>
    </S.Container>
  );
};

export const ImageMediaPanelWidget: React.FC<ImageMediaPanelWidgetProps> = ({ asset }) => {
  const [loaded, setLoaded] = useState<{ asset: ImageMedia; handler: ImageMediaURL }>(null);
  useEffect(() => {
    let disposed = false;
    let handler: ImageMediaURL;
    asset.getImageURL().then((url) => {
      if (disposed) {
        url.dispose();
      } else {
        handler = url;
        setLoaded({ asset, handler });
      }
    });
    return () => {
      disposed = true;
      handler?.dispose();
    };
  }, [asset]);
  return (
    <LoadingPanelWidget
      loading={loaded?.asset !== asset}
      children={() => <ImageViewer key={loaded.handler.url} asset={asset} url={loaded.handler.url} />}
    />
  );
};
