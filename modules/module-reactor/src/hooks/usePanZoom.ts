import { useEffect, useRef, useState } from 'react';

export interface UsePanZoomOptions {
  width: number;
  height: number;
  minScale?: number;
  maxScale?: number;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Pan and zoom centered content with wheel, pointer dragging, and touch pinch.
 * Apply transform to content positioned at the viewport center with a centered
 * transform origin. The viewport must use touch-action: none and overflow: hidden.
 */
export const usePanZoom = ({ width, height, minScale = 0.05, maxScale = 16 }: UsePanZoomOptions) => {
  const [element, ref] = useState<HTMLElement | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1, fitting: true, dragging: false });
  const controls = useRef({ zoom: (_factor: number) => {}, actualSize: () => {}, fit: () => {} });

  useEffect(() => {
    if (!element || !width || !height) return;
    let viewportWidth = element.clientWidth;
    let viewportHeight = element.clientHeight;
    let current = { x: 0, y: 0, scale: 1, fitting: true, dragging: false };
    const pointers = new Map<number, Point>();
    const fitScale = () => Math.min(1, viewportWidth / width, viewportHeight / height);
    const commit = (next: typeof current) => {
      const limitX = Math.max(0, (width * next.scale - viewportWidth) / 2);
      const limitY = Math.max(0, (height * next.scale - viewportHeight) / 2);
      current = {
        ...next,
        x: Math.max(-limitX, Math.min(limitX, next.x)),
        y: Math.max(-limitY, Math.min(limitY, next.y))
      };
      setView(current);
    };
    const zoom = (scale: number, from: Point = { x: 0, y: 0 }, to = from) => {
      const bounded = Math.max(Math.min(minScale, fitScale()), Math.min(maxScale, scale));
      const ratio = bounded / current.scale;
      commit({
        ...current,
        scale: bounded,
        x: to.x - (from.x - current.x) * ratio,
        y: to.y - (from.y - current.y) * ratio,
        fitting: false
      });
    };
    const fit = () => {
      if (viewportWidth > 0 && viewportHeight > 0) {
        commit({ ...current, scale: fitScale(), x: 0, y: 0, fitting: true });
      }
    };
    controls.current = { zoom: (factor) => zoom(current.scale * factor), actualSize: () => zoom(1), fit };
    fit();
    const observer = new ResizeObserver(() => {
      viewportWidth = element.clientWidth;
      viewportHeight = element.clientHeight;
      if (current.fitting) fit();
      else commit(current);
    });
    observer.observe(element);

    const point = (event: { clientX: number; clientY: number }): Point => {
      const rect = element.getBoundingClientRect();
      return { x: event.clientX - rect.left - viewportWidth / 2, y: event.clientY - rect.top - viewportHeight / 2 };
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const units = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewportHeight : 1;
      zoom(current.scale * Math.exp(-Math.max(-100, Math.min(100, event.deltaY * units)) * 0.01), point(event));
    };
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || pointers.size >= 2) return;
      event.preventDefault();
      event.stopPropagation();
      pointers.set(event.pointerId, point(event));
      element.setPointerCapture(event.pointerId);
      commit({ ...current, dragging: true });
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
        const distance = (points: Point[]) => Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
        const center = (points: Point[]) => ({
          x: (points[0].x + points[1].x) / 2,
          y: (points[0].y + points[1].y) / 2
        });
        const oldDistance = distance(before);
        if (oldDistance > 0) zoom((current.scale * distance(after)) / oldDistance, center(before), center(after));
      } else {
        commit({ ...current, x: current.x + next.x - previous.x, y: current.y + next.y - previous.y });
      }
    };
    const up = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      commit({ ...current, dragging: pointers.size > 0 });
    };
    element.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('pointerdown', down);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', up);
    element.addEventListener('pointercancel', up);
    element.addEventListener('lostpointercapture', up);
    return () => {
      observer.disconnect();
      element.removeEventListener('wheel', wheel);
      element.removeEventListener('pointerdown', down);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up);
      element.removeEventListener('pointercancel', up);
      element.removeEventListener('lostpointercapture', up);
      pointers.forEach((_, id) => {
        if (element.hasPointerCapture(id)) element.releasePointerCapture(id);
      });
      controls.current = { zoom: () => {}, actualSize: () => {}, fit: () => {} };
    };
  }, [element, width, height, minScale, maxScale]);

  return {
    ref,
    scale: view.scale,
    fitting: view.fitting,
    dragging: view.dragging,
    transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
    zoomIn: () => controls.current.zoom(1.25),
    zoomOut: () => controls.current.zoom(1 / 1.25),
    actualSize: () => controls.current.actualSize(),
    fit: () => controls.current.fit()
  };
};
