import * as React from 'react';
import { useSizeObserver } from './useSizeObserver';

/**
 * @deprecated Use useSizeObserver(forwardRef).width instead.
 */
export const useWidthObserver = (forwardRef?: React.RefObject<HTMLElement>): number => {
  return useSizeObserver(forwardRef).width;
};
