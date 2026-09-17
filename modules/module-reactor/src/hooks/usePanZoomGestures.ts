import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface PanZoomPoint {
  x: number;
  y: number;
}

export interface PanZoomGesture {
  factor: number;
  from: PanZoomPoint;
  to: PanZoomPoint;
}

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
  useLayoutEffect(() => {
    callbacks.current = options;
  });
  useEffect(() => {
    const element = forwardRef.current;
    setDragging(false);
    if (!element || !enabled) return;
    const pointers = new Map<number, PanZoomPoint>();
    const point = (event: { clientX: number; clientY: number }): PanZoomPoint => {
      const rect = element.getBoundingClientRect();
      return {
        x: event.clientX - rect.left - element.clientWidth / 2,
        y: event.clientY - rect.top - element.clientHeight / 2
      };
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const units = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1;
      const anchor = point(event);
      callbacks.current.zoom({
        factor: Math.exp(-Math.max(-100, Math.min(100, event.deltaY * units)) * 0.01),
        from: anchor,
        to: anchor
      });
    };
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || pointers.size >= 2) return;
      event.preventDefault();
      event.stopPropagation();
      pointers.set(event.pointerId, point(event));
      element.setPointerCapture(event.pointerId);
      setDragging(true);
    };
    const move = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      event.preventDefault();
      const before = Array.from(pointers.values());
      const next = point(event);
      pointers.set(event.pointerId, next);
      if (pointers.size === 2) {
        const after = Array.from(pointers.values());
        const distance = (points: PanZoomPoint[]) => Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
        const center = (points: PanZoomPoint[]) => ({
          x: (points[0].x + points[1].x) / 2,
          y: (points[0].y + points[1].y) / 2
        });
        const oldDistance = distance(before);
        if (oldDistance > 0)
          callbacks.current.zoom({ factor: distance(after) / oldDistance, from: center(before), to: center(after) });
      } else {
        callbacks.current.pan({ x: next.x - previous.x, y: next.y - previous.y });
      }
    };
    const up = (event: PointerEvent) => {
      if (!pointers.delete(event.pointerId)) return;
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      setDragging(pointers.size > 0);
    };
    element.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('pointerdown', down);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', up);
    element.addEventListener('pointercancel', up);
    element.addEventListener('lostpointercapture', up);
    return () => {
      element.removeEventListener('wheel', wheel);
      element.removeEventListener('pointerdown', down);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up);
      element.removeEventListener('pointercancel', up);
      element.removeEventListener('lostpointercapture', up);
      pointers.forEach((_, id) => {
        if (element.hasPointerCapture(id)) element.releasePointerCapture(id);
      });
    };
  }, [forwardRef, enabled]);
  return { dragging };
};
