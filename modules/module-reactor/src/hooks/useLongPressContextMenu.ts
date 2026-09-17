import * as React from 'react';
import { useDelay } from './useDelay';
import { MousePosition } from '../layers/combo/SmartPositionWidget';
import { getReactorViewportMode, ReactorViewportMode } from './useReactorViewportMode';

const LONG_PRESS_DELAY = 550;
const LONG_PRESS_ANIMATION_DELAY = 120;
const MOVE_CANCEL_DISTANCE = 20;
const FOLLOW_UP_EVENT_SUPPRESSION = 750;
const LONG_PRESS_PENDING_CLASS = 'reactor-long-press-pending';

export type LongPressContextMenuHandler = (position: MousePosition) => any;

const suppressFollowUpEvents = () => {
  const controller = new AbortController();
  const options = {
    capture: true,
    passive: false,
    signal: controller.signal
  };
  const stop = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  document.addEventListener('click', stop, options);
  document.addEventListener('mousedown', stop, options);
  document.addEventListener('mouseup', stop, options);
  document.addEventListener('contextmenu', stop, options);
  document.addEventListener('touchend', stop, options);
  window.setTimeout(() => {
    controller.abort();
  }, FOLLOW_UP_EVENT_SUPPRESSION);
};

export const useLongPressContextMenu = <T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler?: LongPressContextMenuHandler,
  disabled?: boolean
) => {
  const pressDelay = useDelay();
  const animationDelay = useDelay();
  const triggeredRef = React.useRef(false);
  const suppressNextClickRef = React.useRef(false);

  const clearLongPress = React.useCallback(() => {
    pressDelay.cancel();
    animationDelay.cancel();
  }, [pressDelay, animationDelay]);

  React.useEffect(() => {
    const element = ref.current;
    if (!element || disabled || !handler) {
      return () => clearLongPress();
    }

    let startPosition: MousePosition | null = null;

    const cancelPendingPress = () => {
      clearLongPress();
      element.classList.remove(LONG_PRESS_PENDING_CLASS);
    };

    const cancelIfMoved = (touch: Touch) => {
      if (!startPosition) {
        return;
      }
      const deltaX = Math.abs(touch.clientX - startPosition.clientX);
      const deltaY = Math.abs(touch.clientY - startPosition.clientY);
      if (deltaX > MOVE_CANCEL_DISTANCE || deltaY > MOVE_CANCEL_DISTANCE) {
        cancelPendingPress();
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (getReactorViewportMode() === ReactorViewportMode.MOBILE) {
        suppressFollowUpEvents();
      }
      handler(event);
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!suppressNextClickRef.current) {
        return;
      }
      suppressNextClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return;
      }
      event.stopPropagation();
      const touch = event.touches[0];
      const position = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
      startPosition = position;
      triggeredRef.current = false;
      cancelPendingPress();
      animationDelay.schedule(() => {
        element.classList.add(LONG_PRESS_PENDING_CLASS);
      }, LONG_PRESS_ANIMATION_DELAY);
      pressDelay.schedule(() => {
        triggeredRef.current = true;
        suppressNextClickRef.current = true;
        element.classList.remove(LONG_PRESS_PENDING_CLASS);
        suppressFollowUpEvents();
        handler(position);
      }, LONG_PRESS_DELAY);
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        cancelPendingPress();
        return;
      }
      cancelIfMoved(event.touches[0]);
    };

    const onTouchEnd = (event: TouchEvent) => {
      cancelPendingPress();
      startPosition = null;
      if (triggeredRef.current) {
        event.preventDefault();
        event.stopPropagation();
      }
      triggeredRef.current = false;
    };

    const onTouchCancel = () => {
      cancelPendingPress();
      startPosition = null;
      triggeredRef.current = false;
      suppressNextClickRef.current = false;
    };

    element.addEventListener('contextmenu', onContextMenu);
    element.addEventListener('click', onClickCapture, true);
    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: true });
    element.addEventListener('touchend', onTouchEnd, { passive: false });
    element.addEventListener('touchcancel', onTouchCancel);

    return () => {
      cancelPendingPress();
      element.removeEventListener('contextmenu', onContextMenu);
      element.removeEventListener('click', onClickCapture, true);
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
      element.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [clearLongPress, disabled, handler, ref, pressDelay, animationDelay]);
};
