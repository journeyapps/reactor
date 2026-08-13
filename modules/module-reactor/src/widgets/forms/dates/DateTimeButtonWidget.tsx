import * as React from 'react';
import { PanelButtonWidget } from '../PanelButtonWidget';
import { DateTimePickerType, DateTimePickerWidgetProps } from './DateTimePickerWidget';
import { DateTimePickerLayerWidget } from './DateTimePickerLayerWidget';
import { ioc } from '../../../inversify.config';
import { Layer, LayerManager } from '../../../stores/layer/LayerManager';
import { useDisplayDateOptions } from '../../../hooks/useDisplayDateOptions';
import { computeDateTimeParts } from '@journeyapps/reactor-lib-utils';

export const DateTimeButtonWidget: React.FC<DateTimePickerWidgetProps> = (props) => {
  let options = useDisplayDateOptions();

  let label = 'Not set';
  if (props.date) {
    let { display_time, display_date, zone, display } = computeDateTimeParts({
      ...options,
      date: props.date
    });

    label = display;
    if (props.type === DateTimePickerType.DATE) {
      label = display_date;
    } else if (props.type === DateTimePickerType.TIME) {
      label = display_time;
    }
    if (zone) {
      label = `${label} [${zone}]`;
    }
  }

  return (
    <PanelButtonWidget
      className={props.className}
      label={label}
      action={(event2) => {
        ioc.get(LayerManager).registerLayer(
          new Layer({
            render: (event) => {
              return (
                <DateTimePickerLayerWidget
                  {...props}
                  date={props.date || new Date()}
                  label="Select a date"
                  close={() => {
                    event.layer.dispose();
                  }}
                  dateChanged={(date) => {
                    event.layer.dispose();
                    props.dateChanged(date);
                  }}
                  position={event2}
                />
              );
            }
          })
        );
      }}
    />
  );
};
