import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useSizeObserver } from './useSizeObserver';
import { PanZoomGesture, PanZoomPoint, usePanZoomGestures } from './usePanZoomGestures';

export interface UsePanZoomOptions {
  width: number;
  height: number;
  minScale?: number;
  maxScale?: number;
}

interface PanZoomView {
  x: number;
  y: number;
  scale: number;
  fitting: boolean;
}

/**
 * Maintain bounded pan/zoom state for centered content, composing size observation
 * and gesture handling. Apply transform to content with a centered transform
 * origin inside a viewport using touch-action: none and overflow: hidden.
 */
export const usePanZoom = ({ width, height, minScale = 0.05, maxScale = 16 }: UsePanZoomOptions) => {
  const ref = useRef<HTMLDivElement>(null);
  const viewport = useSizeObserver(ref);
  const [view, setView] = useState<PanZoomView>({ x: 0, y: 0, scale: 1, fitting: true });
  const ready = width > 0 && height > 0 && viewport.width > 0 && viewport.height > 0;
  const fitScale = ready ? Math.min(1, viewport.width / width, viewport.height / height) : 1;
  const lowerScale = Math.min(minScale, fitScale);

  const constrain = useCallback(
    (next: PanZoomView): PanZoomView => {
      const limitX = Math.max(0, (width * next.scale - viewport.width) / 2);
      const limitY = Math.max(0, (height * next.scale - viewport.height) / 2);
      return {
        ...next,
        x: Math.max(-limitX, Math.min(limitX, next.x)),
        y: Math.max(-limitY, Math.min(limitY, next.y))
      };
    },
    [width, height, viewport.width, viewport.height]
  );

  const zoom = useCallback(
    (gesture: PanZoomGesture) => {
      if (!ready) return;
      setView((current) => {
        const scale = Math.max(lowerScale, Math.min(maxScale, current.scale * gesture.factor));
        const ratio = scale / current.scale;
        return constrain({
          scale,
          x: gesture.to.x - (gesture.from.x - current.x) * ratio,
          y: gesture.to.y - (gesture.from.y - current.y) * ratio,
          fitting: false
        });
      });
    },
    [ready, lowerScale, maxScale, constrain]
  );

  const pan = useCallback(
    (delta: PanZoomPoint) => {
      setView((current) => constrain({ ...current, x: current.x + delta.x, y: current.y + delta.y }));
    },
    [constrain]
  );
  const { dragging } = usePanZoomGestures({ forwardRef: ref, enabled: ready, pan, zoom });

  // New content starts fitted; viewport and limit changes preserve manual zoom.
  useLayoutEffect(() => {
    setView({ x: 0, y: 0, scale: 1, fitting: true });
  }, [width, height]);
  useLayoutEffect(() => {
    if (!ready) return;
    setView((current) =>
      constrain(
        current.fitting
          ? { x: 0, y: 0, scale: fitScale, fitting: true }
          : { ...current, scale: Math.max(lowerScale, Math.min(maxScale, current.scale)) }
      )
    );
  }, [ready, fitScale, lowerScale, maxScale, constrain]);

  const fit = useCallback(() => {
    if (ready) setView({ x: 0, y: 0, scale: fitScale, fitting: true });
  }, [ready, fitScale]);
  const actualSize = useCallback(() => {
    if (!ready) return;
    setView((current) => {
      const scale = Math.max(lowerScale, Math.min(maxScale, 1));
      return constrain({
        ...current,
        scale,
        x: (current.x * scale) / current.scale,
        y: (current.y * scale) / current.scale,
        fitting: false
      });
    });
  }, [ready, lowerScale, maxScale, constrain]);
  const zoomBy = (factor: number) => zoom({ factor, from: { x: 0, y: 0 }, to: { x: 0, y: 0 } });

  return {
    ref,
    scale: view.scale,
    fitting: view.fitting,
    dragging,
    transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
    zoomIn: () => zoomBy(1.25),
    zoomOut: () => zoomBy(1 / 1.25),
    actualSize,
    fit
  };
};
