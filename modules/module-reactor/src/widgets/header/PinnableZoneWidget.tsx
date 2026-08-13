import * as React from 'react';
import { useRef, useState } from 'react';
import * as _ from 'lodash';
import { EntityHeaderButtonWidget } from './EntityHeaderButtonWidget';
import { styled } from '../../stores/themes/reactor-theme-fragment';
import { ToolbarDropZone } from '../../stores/dnd/zones/ToolbarDropZone';
import { observer } from 'mobx-react';
import { useDroppableBetweenZone } from '../dnd3/useDroppableBetweenZone';
import { getTransparentColor } from '@journeyapps/reactor-lib-utils/dist';
import { ToolbarPreference } from '../../settings/ToolbarPreference';

export interface PinnableZoneWidgetProps {
  size: number;
  className?;
  vertical: boolean;
  preference: ToolbarPreference;
}

export const PinnableZoneWidget: React.FC<PinnableZoneWidgetProps> = observer((props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [zone] = useState(() => {
    return new ToolbarDropZone(props.preference);
  });
  const { hint, hover, children } = useDroppableBetweenZone({
    forwardRef: ref,
    vertical: props.vertical,
    setIndex: (zone, index) => {
      zone.index = index;
    },
    children: _.map(props.preference.buttons, (btn) => {
      return (
        <EntityHeaderButtonWidget
          vertical={props.vertical}
          remove={() => {
            props.preference.removeButton(btn);
          }}
          entity={btn}
          key={btn.id}
        />
      );
    }),
    dropzone: zone
  });

  return (
    <S.Container
      className={props.className}
      $vertical={props.vertical}
      $dropzoneHint={hint}
      $dropzoneHover={hover}
      ref={ref}
    >
      {children}
    </S.Container>
  );
});
namespace S {
  export const Container = styled.div<{ $dropzoneHint: boolean; $dropzoneHover: boolean; $vertical: boolean }>`
    height: 100%;
    box-sizing: border-box;
    border: solid 1px transparent;
    align-items: center;
    display: flex;
    border-radius: 5px;
    padding: 2px;
    flex-direction: ${(p) => (p.$vertical ? 'column' : 'row')};
    ${(p) => (p.$dropzoneHint ? `border-color: ${p.theme.dnd.hintColor};` : '')};
    ${(p) => (p.$dropzoneHover ? `background: ${getTransparentColor(p.theme.dnd.hoverColor, 0.5)};` : '')};
  `;
}
