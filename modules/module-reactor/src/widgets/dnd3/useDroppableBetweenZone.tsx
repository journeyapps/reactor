import { useDroppableZone, UseDroppableZoneOptions } from './useDroppableZone';
import * as React from 'react';
import { useRef, useState } from 'react';
import { useDroppableRaw } from './useDroppableRaw';
import { AbstractDropZone } from '../../stores/dnd/zones/AbstractDropZone';
import { getTransparentColor } from '@journeyapps/reactor-lib-utils/dist';
import { useDraggingElement } from './useDraggingElement';
import { styled } from '../../stores/themes/reactor-theme-fragment';

const BETWEEN_ZONE_ITEM_INDEX_ATTR = 'data-droppable-between-item-index';

const isZoneHidden = (options: { zoneIndex: number; draggedChildIndex: number | null }) => {
  return (
    options.draggedChildIndex !== null &&
    (options.zoneIndex === options.draggedChildIndex || options.zoneIndex === options.draggedChildIndex + 1)
  );
};

export interface SharedDropZoneProps {
  gap_standard?: number;
  gap_hint?: number;
  gap_expand?: number;
  vertical: boolean;
}

export interface UseDroppableBetweenZoneOption<T extends AbstractDropZone>
  extends UseDroppableZoneOptions<T>, SharedDropZoneProps {
  children: React.JSX.Element[];
  setIndex: (zone: T, index: number) => any;
}

interface BetweenZoneEntryWidgetProps extends SharedDropZoneProps {
  index: number;
  child: React.JSX.Element;
  hint: boolean;
  hover: boolean;
  draggedChildIndex: number | null;
  setIndex: (index: number) => any;
}

const BetweenZoneEntryWidget: React.FC<BetweenZoneEntryWidgetProps> = (props) => {
  const hidden = isZoneHidden({
    zoneIndex: props.index,
    draggedChildIndex: props.draggedChildIndex
  });
  return (
    <>
      <ExpandZoneWidget
        {...props}
        dragEvent={(entered) => {
          if (entered && !hidden) {
            props.setIndex(props.index);
          }
        }}
        vertical={props.vertical}
        hint={(props.hint || props.hover) && !hidden}
      />
      <S.IndexedChild {...{ [BETWEEN_ZONE_ITEM_INDEX_ATTR]: props.index }}>{props.child}</S.IndexedChild>
    </>
  );
};

export const useDroppableBetweenZone = <T extends AbstractDropZone>(props: UseDroppableBetweenZoneOption<T>) => {
  const { hint, hover } = useDroppableZone({
    ...props
  });
  const draggingElement = useDraggingElement();
  const children = [];
  const ref = useRef(props.dropzone);
  ref.current = props.dropzone;
  let draggedChildIndex: number;
  if (draggingElement && props.forwardRef.current?.contains(draggingElement)) {
    const itemElement = draggingElement.closest(`[${BETWEEN_ZONE_ITEM_INDEX_ATTR}]`);
    if (itemElement) {
      draggedChildIndex = Number(itemElement.getAttribute(BETWEEN_ZONE_ITEM_INDEX_ATTR));
    }
  }
  props.children.forEach((c, index) => {
    children.push(
      <BetweenZoneEntryWidget
        {...props}
        index={index}
        child={c}
        hint={hint}
        hover={hover}
        draggedChildIndex={draggedChildIndex}
        setIndex={(zoneIndex) => {
          props.setIndex(ref.current, zoneIndex);
        }}
        key={`between-entry-${c.key || index}`}
      />
    );
  });
  if (props.children.length > 1) {
    const endIndex = props.children.length;
    const hidden = isZoneHidden({
      zoneIndex: endIndex,
      draggedChildIndex
    });
    children.push(
      <ExpandZoneWidget
        {...props}
        dragEvent={(entered) => {
          if (entered && !hidden) {
            props.setIndex(ref.current, endIndex);
          }
        }}
        key={`expand-end`}
        vertical={props.vertical}
        hint={(hint || hover) && !hidden}
      />
    );
  }

  return {
    hint,
    hover,
    children
  };
};

export interface ExpandZoneWidgetProps extends SharedDropZoneProps {
  hint: boolean;
  dragEvent: (entered: boolean) => any;
}

export const ExpandZoneWidget: React.FC<ExpandZoneWidgetProps> = (props) => {
  const ref = useRef(null);
  const [expand, setExpand] = useState(false);
  useDroppableRaw({
    key: 'expand-zone',
    forwardRef: ref,
    accepts: () => true,
    dragover: () => {
      setExpand(true);
      props.dragEvent(true);
    },
    dragexit: () => {
      setExpand(false);
      props.dragEvent(false);
    }
  });

  let amount = props.gap_standard || 0;
  if (props.hint) {
    amount = props.gap_hint || 4;
  }
  if (expand) {
    amount = props.gap_expand || 30;
  }
  if (props.vertical) {
    return (
      <S.ContainerVertical hint={props.hint} amount={amount} expand={expand}>
        <S.ChildVertical show={props.hint} ref={ref} />
      </S.ContainerVertical>
    );
  }
  return (
    <S.ContainerHorizontal hint={props.hint} amount={amount} expand={expand}>
      <S.ChildHorizontal show={props.hint} ref={ref} />
    </S.ContainerHorizontal>
  );
};
namespace S {
  export const IndexedChild = styled.div`
    display: contents;
  `;

  export const ContainerVertical = styled.div<{ amount: number; hint: boolean; expand: boolean }>`
    height: ${(p) => p.amount}px;
    width: 100%;
    transition: height 0.3s;
    position: relative;
    border: solid 1px transparent;
    box-sizing: border-box;
    visibility: ${(p) => (p.hint ? 'visible' : 'hidden')};
    margin: ${(p) => (p.hint ? 2 : 0)}px 0px;
    opacity: ${(p) => (p.expand ? 1 : 0.5)};
    ${(p) => `background-color: ${getTransparentColor(p.theme.dnd.hoverColor, 0.4)}`};
    ${(p) => `border-color: ${p.theme.dnd.hoverColor}`};
  `;

  export const ContainerHorizontal = styled.div<{ amount: number; hint: boolean; expand: boolean }>`
    width: ${(p) => p.amount}px;
    align-self: stretch;
    transition: width 0.3s;
    position: relative;
    border: solid 1px transparent;
    box-sizing: border-box;
    visibility: ${(p) => (p.hint ? 'visible' : 'hidden')};
    margin: 0px ${(p) => (p.hint ? 2 : 0)}px;
    opacity: ${(p) => (p.expand ? 1 : 0.5)};
    ${(p) => `background-color: ${getTransparentColor(p.theme.dnd.hoverColor, 0.4)}`};
    ${(p) => `border-color: ${p.theme.dnd.hoverColor}`};
  `;

  const amount = 13;

  export const ChildVertical = styled.div<{ show: boolean }>`
    position: absolute;
    top: -${amount}px;
    bottom: -${amount}px;
    width: 100%;
    visibility: ${(p) => (p.show ? 'visible' : 'hidden')};
  `;

  export const ChildHorizontal = styled.div<{ show: boolean }>`
    position: absolute;
    left: -${amount}px;
    right: -${amount}px;
    height: 100%;
    visibility: ${(p) => (p.show ? 'visible' : 'hidden')};
  `;
}
