import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface PanZoomPoint {
  x: number;
  y: number;
}

export interface PanZoomGesture {
  /**
   * Scale multiplier, anchored between the previous and current gesture centers.
   */
  factor: number;
  from: PanZoomPoint;
  to: PanZoomPoint;
}

const WHEEL_LINE_HEIGHT = 16;
const MAX_WHEEL_DELTA = 100;
const WHEEL_ZOOM_SENSITIVITY = 0.01;

const midpoint = (a: PanZoomPoint, b: PanZoomPoint): PanZoomPoint => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2
});

/**
 * One pointer moved while the other stayed still. Distance controls scale;
 * the moving midpoint allows the same gesture to pan and zoom together.
 */
const getPinchGesture = (previous: PanZoomPoint, next: PanZoomPoint, other: PanZoomPoint): PanZoomGesture | null => {
  const previousDistance = Math.hypot(previous.x - other.x, previous.y - other.y);
  if (previousDistance === 0) return null;
  return {
    factor: Math.hypot(next.x - other.x, next.y - other.y) / previousDistance,
    from: midpoint(previous, other),
    to: midpoint(next, other)
  };
};

const getWheelZoomFactor = (event: WheelEvent, viewportHeight: number): number => {
  // Wheel deltas may be pixels, lines or pages. Limit each step to avoid jumps.
  const units = event.deltaMode === 1 ? WHEEL_LINE_HEIGHT : event.deltaMode === 2 ? viewportHeight : 1;
  const delta = Math.max(-MAX_WHEEL_DELTA, Math.min(MAX_WHEEL_DELTA, event.deltaY * units));
  return Math.exp(-delta * WHEEL_ZOOM_SENSITIVITY);
};

export interface UsePanZoomGesturesOptions {
  forwardRef: RefObject<HTMLElement>;
  enabled?: boolean;
  pan: (delta: PanZoomPoint) => void;
  zoom: (gesture: PanZoomGesture) => void;
}

/**
 * Emit drag, wheel and pinch gestures in coordinates relative to the viewport
 * center. The target should use touch-action: none. Listeners and pointer capture
 * are released when disabled or unmounted.
 */
export const usePanZoomGestures = (options: UsePanZoomGesturesOptions) => {
  const { forwardRef, enabled = true } = options;
  const callbacks = useRef(options);
  const [dragging, setDragging] = useState(false);
  // Keep handlers current without reconnecting listeners during an active gesture.
  useLayoutEffect(() => {
    callbacks.current = options;
  });
  useEffect(() => {
    const element = forwardRef.current;
    setDragging(false);
    if (!element || !enabled) return;
    const pointers = new Map<number, PanZoomPoint>();
    const listeners = new AbortController();

    // The zoom state uses the viewport center as its origin, not the page corner.
    const getPoint = (event: { clientX: number; clientY: number }): PanZoomPoint => {
      const rect = element.getBoundingClientRect();
      return {
        x: event.clientX - rect.left - element.clientWidth / 2,
        y: event.clientY - rect.top - element.clientHeight / 2
      };
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const anchor = getPoint(event);
      callbacks.current.zoom({
        factor: getWheelZoomFactor(event, element.clientHeight),
        from: anchor,
        to: anchor
      });
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || pointers.size >= 2) return;
      event.preventDefault();
      event.stopPropagation();
      pointers.set(event.pointerId, getPoint(event));
      // Continue receiving movement and release events outside the viewport.
      element.setPointerCapture(event.pointerId);
      setDragging(true);
    };
    const onPointerMove = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      event.preventDefault();
      const next = getPoint(event);
      pointers.set(event.pointerId, next);

      for (const [id, other] of pointers) {
        if (id === event.pointerId) continue;
        const gesture = getPinchGesture(previous, next, other);
        if (gesture) callbacks.current.zoom(gesture);
        return;
      }
      callbacks.current.pan({ x: next.x - previous.x, y: next.y - previous.y });
    };
    const onPointerEnd = (event: PointerEvent) => {
      // Removing first makes repeated release/cancel/lost-capture events harmless.
      if (!pointers.delete(event.pointerId)) return;
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      setDragging(pointers.size > 0);
    };
    const listenerOptions = { signal: listeners.signal };
    element.addEventListener('wheel', onWheel, { ...listenerOptions, passive: false });
    element.addEventListener('pointerdown', onPointerDown, listenerOptions);
    element.addEventListener('pointermove', onPointerMove, listenerOptions);
    element.addEventListener('pointerup', onPointerEnd, listenerOptions);
    element.addEventListener('pointercancel', onPointerEnd, listenerOptions);
    element.addEventListener('lostpointercapture', onPointerEnd, listenerOptions);
    return () => {
      // Detach before releasing capture so cleanup cannot invoke a state update.
      listeners.abort();
      pointers.forEach((_, id) => {
        if (element.hasPointerCapture(id)) element.releasePointerCapture(id);
      });
    };
  }, [forwardRef, enabled]);
  return { dragging };
};
