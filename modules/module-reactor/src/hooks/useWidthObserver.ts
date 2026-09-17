import * as React from 'react';
import { useSizeObserver } from './useSizeObserver';

export const useWidthObserver = (forwardRef?: React.RefObject<HTMLElement>): number => {
  return useSizeObserver(forwardRef).width;
};
