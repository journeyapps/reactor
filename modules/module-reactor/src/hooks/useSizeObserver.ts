import * as React from 'react';
import { useLayoutEffect, useState } from 'react';

export enum SizeMeasurement {
  CLIENT = 'client',
  BOUNDS = 'bounds'
}

export interface ObservedSize {
  width: number;
  height: number;
}

/**
 * Observe an element's size, with an initial measurement and automatic cleanup.
 * Use client dimensions for available content space, or bounds for rendered size.
 */
export const useSizeObserver = (
  forwardRef?: React.RefObject<HTMLElement>,
  measurement: SizeMeasurement = SizeMeasurement.CLIENT
): ObservedSize => {
  const [size, setSize] = useState<ObservedSize>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = forwardRef?.current;
    if (!element) return;
    const update = () => {
      const bounds = measurement === SizeMeasurement.BOUNDS ? element.getBoundingClientRect() : null;
      const next = { width: bounds?.width ?? element.clientWidth, height: bounds?.height ?? element.clientHeight };
      setSize((current) => (current.width === next.width && current.height === next.height ? current : next));
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    update();
    return () => observer.disconnect();
  }, [forwardRef, measurement]);

  return size;
};
