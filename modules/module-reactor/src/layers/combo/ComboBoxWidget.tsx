import * as React from 'react';
import * as _ from 'lodash';
import { ComboBoxItem } from '../../stores/combo/ComboBoxDirectives';
import { ComboBoxItemWidget } from './ComboBoxItemWidget';
import { ListItem, ListItemRenderEvent } from '../../widgets/list/ControlledListWidget';
import { RawComboBoxWidget } from './RawComboBoxWidget';
import { getTransparentColor } from '@journeyapps/reactor-lib-utils';
import { themed } from '../../stores/themes/reactor-theme-fragment';
import { COMBOBOX_ITEM_H_PADDING } from '../../layout';
import { Dimensions } from '../../hooks/useDimensionObserver';
import { REACTOR_MOBILE_MEDIA_QUERY } from '../../hooks/useReactorViewportMode';

export interface ComboBoxWidgetProps {
  items: ComboBoxItem[];
  initialSelected?: string;
  selected: (selected: ComboBoxItem, event: React.MouseEvent) => any;
  hovered?: (selected: ComboBoxItem, dimensions?: Dimensions) => any;
  className?: any;
  placeholder?: string;
  maxHeight?: number;
}

namespace S {
  export const Divider = themed.div`
    color: ${(p) => p.theme.combobox.text};
    margin: 4px ${COMBOBOX_ITEM_H_PADDING}px;
    font-size: 11px;
    border-bottom: solid 1px ${(p) => getTransparentColor(p.theme.combobox.text, 0.5)};
    opacity: 0.4;

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      font-size: 16px;
      margin: 10px 14px 6px 14px;
      padding-bottom: 5px;
    }
  `;
}

export const ComboBoxWidget: React.FC<ComboBoxWidgetProps> = (props) => {
  const currentHoverRef = React.useRef<string>(null);
  const dimensionRefs = React.useRef<Record<string, Dimensions>>({});

  const items = React.useMemo<ListItem[]>(() => {
    const groups = _.groupBy(props.items, (item) => item.group);
    return _.flatMap(groups, (group, groupName) => {
      return _.map(group, (item, index) => {
        return {
          key: item.key,
          render: (event: ListItemRenderEvent) => {
            return (
              <React.Fragment key={item.key}>
                {/* only output a group if it's the first item, there is more than 1 group and the group is not 'undefined' */}
                {index === 0 && _.keys(groups).length > 1 && !!item.group ? <S.Divider>{groupName}</S.Divider> : null}
                <ComboBoxItemWidget
                  selected={event.selected}
                  item={item}
                  onMouseOver={() => {
                    currentHoverRef.current = item.key;
                    event.hover();
                  }}
                  gotDimensions={(dimensions) => {
                    if (_.isEqual(dimensionRefs.current[item.key], dimensions)) {
                      return;
                    }
                    dimensionRefs.current[item.key] = dimensions;
                    if (currentHoverRef.current === item.key) {
                      event.hover();
                    }
                  }}
                  onMouseClick={(event) => {
                    props.selected(item, event);
                  }}
                  forwardRef={event.ref}
                />
              </React.Fragment>
            );
          }
        };
      });
    });
  }, [props.items, props.selected]);

  return (
    <RawComboBoxWidget
      {...props}
      hovered={(item) => {
        const found = _.find(props.items, { key: item.key });
        props.hovered?.(found, dimensionRefs.current[item.key]);
      }}
      selected={(selected, event) => {
        if (!selected) {
          props.selected(null, null);
          return;
        }
        props.selected(_.find(props.items, { key: selected.key }), event);
      }}
      items={items}
    />
  );
};
