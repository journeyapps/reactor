import * as React from 'react';
import { observer } from 'mobx-react';
import {
  CardWidget,
  PanelButtonMode,
  PanelButtonWidget,
  ReactorPanelModel,
  StatusCardState,
  StatusCardWidget,
  styled,
  useDraggableRaw,
  useDroppableBetweenZone
} from '@journeyapps/reactor-mod';

const VERTICAL_DEMO_MIME = 'playground/demo-item-vertical';
const HORIZONTAL_DEMO_MIME = 'playground/demo-item-horizontal';

interface DemoItem {
  id: string;
  label: string;
  status: StatusCardState;
}

interface DropZoneListener {
  highlight?: (highlight: boolean) => any;
}

class DemoBetweenDropZone {
  private listeners = new Set<DropZoneListener>();
  index = 0;

  constructor(
    private mime: string,
    private dropped: (itemId: string, index: number) => any
  ) {}

  registerListener(listener: DropZoneListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  highlight(highlight: boolean) {
    this.listeners.forEach((listener) => listener.highlight?.(highlight));
  }

  acceptsMimeType(type: string) {
    return type === this.mime;
  }

  handleDrop(event: { data: { [key: string]: string } }) {
    const itemId = event.data[this.mime];
    if (!itemId) {
      return;
    }
    this.dropped(itemId, this.index);
  }
}

interface DemoDraggableItemProps {
  item: DemoItem;
  mime: string;
}

const DemoDraggableItem: React.FC<DemoDraggableItemProps> = (props) => {
  const ref = React.useRef<HTMLDivElement>(null);
  useDraggableRaw({
    forwardRef: ref,
    encode: () => {
      return {
        data: {
          [props.mime]: props.item.id
        },
        icon: ref.current || document.body
      };
    }
  });

  return (
    <S.Item ref={ref}>
      <StatusCardWidget
        label={{
          label: props.item.label,
          icon: 'arrows-alt'
        }}
        status={props.item.status}
      />
    </S.Item>
  );
};

export interface PlaygroundDragDropPanelWidgetProps {
  model: ReactorPanelModel;
}

const initialItems: DemoItem[] = [
  { id: 'a', label: 'Alpha', status: StatusCardState.COMPLETE },
  { id: 'b', label: 'Beta', status: StatusCardState.LOADING },
  { id: 'c', label: 'Gamma', status: StatusCardState.WAITING },
  { id: 'd', label: 'Delta', status: StatusCardState.FAILED }
];

const reorderItems = (prev: DemoItem[], itemId: string, index: number) => {
  const currentIndex = prev.findIndex((item) => item.id === itemId);
  if (currentIndex === -1) {
    return prev;
  }
  const next = prev.slice();
  const [moved] = next.splice(currentIndex, 1);
  const adjustedIndex = currentIndex < index ? index - 1 : index;
  const targetIndex = Math.max(0, Math.min(adjustedIndex, next.length));
  next.splice(targetIndex, 0, moved);
  return next;
};

interface DemoLaneProps {
  vertical: boolean;
  mime: string;
  items: DemoItem[];
  setItems: React.Dispatch<React.SetStateAction<DemoItem[]>>;
}

const DemoLane: React.FC<DemoLaneProps> = (props) => {
  const dropZone = React.useMemo(() => {
    return new DemoBetweenDropZone(props.mime, (itemId, index) => {
      props.setItems((prev) => {
        return reorderItems(prev, itemId, index);
      });
    });
  }, [props.mime, props.setItems]);

  const laneRef = React.useRef<HTMLDivElement>(null);
  const { children } = useDroppableBetweenZone({
    forwardRef: laneRef,
    vertical: props.vertical,
    dropzone: dropZone as any,
    gap_standard: 4,
    gap_hint: 8,
    setIndex: (zone: any, index) => {
      zone.index = index;
    },
    children: props.items.map((item) => {
      return <DemoDraggableItem item={item} mime={props.mime} key={item.id} />;
    })
  });

  return (
    <S.DemoArea ref={laneRef} vertical={props.vertical}>
      {children}
    </S.DemoArea>
  );
};

export const PlaygroundDragDropPanelWidget: React.FC<PlaygroundDragDropPanelWidgetProps> = observer(() => {
  const [verticalItems, setVerticalItems] = React.useState<DemoItem[]>(initialItems);
  const [horizontalItems, setHorizontalItems] = React.useState<DemoItem[]>(initialItems);

  return (
    <S.Container>
      <CardWidget
        title="Drag + Drop"
        subHeading="Between-zone drop indicators now use Reactor DnD hint and hover colors"
        sections={[
          {
            key: 'dnd-zone-vertical',
            content: () => {
              return (
                <DemoLane vertical={true} mime={VERTICAL_DEMO_MIME} items={verticalItems} setItems={setVerticalItems} />
              );
            }
          },
          {
            key: 'dnd-zone-horizontal',
            content: () => {
              return (
                <DemoLane
                  vertical={false}
                  mime={HORIZONTAL_DEMO_MIME}
                  items={horizontalItems}
                  setItems={setHorizontalItems}
                />
              );
            }
          },
          {
            key: 'dnd-actions',
            content: () => {
              return (
                <S.Actions>
                  <PanelButtonWidget
                    label="Reset order"
                    icon="redo"
                    mode={PanelButtonMode.PRIMARY}
                    action={() => {
                      setVerticalItems(initialItems);
                      setHorizontalItems(initialItems);
                    }}
                  />
                </S.Actions>
              );
            }
          }
        ]}
      />
    </S.Container>
  );
});

namespace S {
  export const Container = styled.div`
    padding: 12px;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    min-height: 100%;
    box-sizing: border-box;
  `;

  export const DemoArea = styled.div<{ vertical: boolean }>`
    border-radius: 8px;
    padding: 8px;
    display: flex;
    flex-direction: ${(p) => (p.vertical ? 'column' : 'row')};
    align-items: ${(p) => (p.vertical ? 'flex-start' : 'stretch')};
    width: ${(p) => (p.vertical ? '280px' : '100%')};
    max-width: 100%;
    overflow: visible;
  `;

  export const Item = styled.div`
    cursor: grab;
    user-select: none;
    width: 260px;
    display: flex;
  `;

  export const Actions = styled.div`
    display: flex;
    gap: 8px;
  `;
}
