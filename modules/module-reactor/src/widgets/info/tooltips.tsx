import * as React from 'react';
import { useEffect, useState } from 'react';
import { MousePosition, SmartPositionWidget } from '../../layers/combo/SmartPositionWidget';
import { ioc } from '../../inversify.config';
import { Layer, LayerManager } from '../../stores/layer/LayerManager';
import { styled } from '../../stores/themes/reactor-theme-fragment';
import { FloatingPanelWidget } from '../floating/FloatingPanelWidget';
import { useAnchoredOverlay } from '../../hooks/useAnchoredOverlay';
import { useDelay } from '../../hooks/useDelay';
import { AnchoredOverlayPlacement } from '../../stores/overlay/AnchoredOverlayStore';

export enum TooltipPosition {
  TOP = 'up',
  LEFT = 'left',
  BOTTOM = 'down',
  BOTTOM_RIGHT = 'down-right',
  RIGHT = 'right'
}

export enum TooltipState {
  SHOW = 'SHOW'
}

export interface TooltipProps {
  tooltip?: string;
  tooltipPos?: TooltipPosition;
  tooltipState?: TooltipState;
  /**
   * Hover delay in milliseconds before showing the tooltip. Defaults to zero.
   */
  tooltipDelay?: number;
}

export const setupTooltipProps = (props: Partial<TooltipProps>) => {
  return props.tooltip ? { 'aria-label': props.tooltip } : {};
};

namespace S {
  export const Content = styled.div`
    pointer-events: none;
    max-width: 320px;
    padding: 6px 9px;
    border: solid 1px ${(p) => p.theme.combobox.border};
    border-radius: 5px;
    background: ${(p) => p.theme.tooltips.background};
    box-shadow: 0 4px 12px ${(p) => p.theme.combobox.shadowColor};
    color: ${(p) => p.theme.text.primary};
    font-size: 12px;
    line-height: 1.35;
    white-space: pre-wrap;
  `;

  export const Anchor = styled.span`
    display: inline-flex;
  `;
}

const placementFor = (position: TooltipPosition) => {
  if (position === TooltipPosition.TOP) return AnchoredOverlayPlacement.TOP;
  if (position === TooltipPosition.LEFT) return AnchoredOverlayPlacement.LEFT;
  if (position === TooltipPosition.RIGHT) return AnchoredOverlayPlacement.RIGHT;
  if (position === TooltipPosition.BOTTOM_RIGHT) return AnchoredOverlayPlacement.BOTTOM;
  return AnchoredOverlayPlacement.BOTTOM;
};

export interface ReactorTooltipWidgetProps extends TooltipProps {
  children: React.ReactNode;
}

export const ReactorTooltipWidget: React.FC<ReactorTooltipWidgetProps> = (props) => {
  const [hovered, setHovered] = useState(false);
  const [hoverReady, setHoverReady] = useState(false);
  const delay = props.tooltipDelay ?? 0;
  const hoverDelay = useDelay();
  useEffect(() => {
    setHoverReady(false);
    if (!hovered || !props.tooltip || delay <= 0) {
      return;
    }
    hoverDelay.schedule(() => setHoverReady(true), delay);
    return hoverDelay.cancel;
  }, [hovered, props.tooltip, delay, hoverDelay]);
  const active = (hovered && (delay <= 0 || hoverReady)) || props.tooltipState === TooltipState.SHOW;
  const position = props.tooltipPos || TooltipPosition.TOP;
  const render = React.useCallback(() => <S.Content>{props.tooltip}</S.Content>, [props.tooltip]);
  const overlay = useAnchoredOverlay({
    source: 'tooltip',
    placement: placementFor(position),
    clickThrough: true,
    enabled: active && !!props.tooltip,
    render
  });

  if (!props.tooltip) {
    return <>{props.children}</>;
  }

  return (
    <S.Anchor
      ref={overlay.ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        hoverDelay.cancel();
        setHovered(false);
        setHoverReady(false);
      }}
    >
      {props.children}
    </S.Anchor>
  );
};

export interface HoverWidgetProps {
  children: React.JSX.Element;
  getOverlay: () => React.JSX.Element;
  className?: any;
}

export const HoverWidget: React.FC<HoverWidgetProps> = (props) => {
  const [hoverPosition, setHoverPosition] = useState<MousePosition>();

  useEffect(() => {
    if (hoverPosition) {
      const layer = new Layer({
        render: () => (
          <SmartPositionWidget position={hoverPosition}>
            <FloatingPanelWidget center={false}>{props.getOverlay()}</FloatingPanelWidget>
          </SmartPositionWidget>
        )
      });
      layer.registerListener({ dispose: () => setHoverPosition(null) });
      ioc.get(LayerManager).registerLayer(layer);
      return () => layer.dispose();
    }
  }, [hoverPosition]);

  return (
    <div
      className={props.className}
      onMouseEnter={(event) => {
        setHoverPosition({ clientX: event.clientX, clientY: event.clientY });
      }}
      onMouseLeave={() => setHoverPosition(null)}
    >
      {props.children}
    </div>
  );
};
