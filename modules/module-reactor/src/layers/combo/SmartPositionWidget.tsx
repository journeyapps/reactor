import * as React from 'react';
import { useRef } from 'react';
import styled from '@emotion/styled';
import { observer } from 'mobx-react';
import { useDimensionObserver } from '../../hooks/useDimensionObserver';
import { REACTOR_MOBILE_MEDIA_QUERY } from '../../hooks/useReactorViewportMode';

export interface MousePosition {
  clientX: number;
  clientY: number;
}

export interface SmartPositionWidgetProps {
  position?: MousePosition;
  className?: any;
  animate?: boolean;
  centerOnMobile?: boolean;
}

namespace S {
  export const Box = styled.div<{ $animate?: boolean; $centerOnMobile?: boolean }>`
    position: fixed;
    ${(p) => (p.$animate ? `transition: top 0.3s, left 0.3s` : '')};

    ${(p) =>
      p.$centerOnMobile
        ? `
          ${REACTOR_MOBILE_MEDIA_QUERY} {
            bottom: calc(24px + env(safe-area-inset-bottom));
            display: flex;
            left: 24px !important;
            position: fixed;
            right: 24px;
            top: calc(24px + env(safe-area-inset-top)) !important;
          }

          ${REACTOR_MOBILE_MEDIA_QUERY} {
            > * {
              height: 100%;
              min-height: 0;
              width: 100%;
            }
          }
        `
        : ''};
  `;
}

export const SmartPositionWidget: React.FC<React.PropsWithChildren<SmartPositionWidgetProps>> = observer((props) => {
  const ref = useRef<HTMLDivElement>(null);

  const getStyle = (options: { width: number; height: number }): Partial<CSSStyleDeclaration> => {
    if (!props.position) {
      return {
        top: `${Math.max(0, (window.innerHeight - options.height) / 2)}px`,
        left: `${Math.max(0, (window.innerWidth - options.width) / 2)}px`
      };
    }
    if (ref.current) {
      let x = props.position.clientX;
      if (x + options.width > window.innerWidth) {
        x = x - options.width - 10;
      }

      let y = props.position.clientY;
      if (y + options.height > window.innerHeight) {
        y = y - options.height - 10;
      }

      return {
        left: `${Math.max(0, Math.min(x, window.innerWidth - options.width))}px`,
        top: `${Math.max(0, Math.min(y, window.innerHeight - options.height))}px`
      };
    }
    return {
      left: `${props.position.clientX}px`,
      top: `${props.position.clientY}px`
    };
  };

  useDimensionObserver(
    {
      element: ref,
      changed: (dimensions) => {
        const s = getStyle(dimensions);
        ref.current.style.top = s.top;
        ref.current.style.left = s.left;
      }
    },
    [props.position?.clientX, props.position?.clientY]
  );

  return (
    <S.Box $animate={props.animate} $centerOnMobile={props.centerOnMobile} className={props.className} ref={ref}>
      {props.children}
    </S.Box>
  );
});
