import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { styled } from '../../../stores/themes/reactor-theme-fragment';
import { DateTime, Duration } from 'luxon';
import { ioc } from '../../../inversify.config';
import { ComboBoxItem } from '../../../stores/combo/ComboBoxDirectives';
import { Layer, LayerManager } from '../../../stores/layer/LayerManager';
import { getTransparentColor } from '@journeyapps/reactor-lib-utils';
import { DateTimePickerLayerWidget } from './DateTimePickerLayerWidget';
import { ComboBoxStore2 } from '../../../stores/combo2/ComboBoxStore2';
import { SimpleComboBoxDirective } from '../../../stores/combo2/directives/simple/SimpleComboBoxDirective';
import { SmartDateDisplayWidget } from '../../info/DateDisplayWidget';

export interface DateRangeSelectorWidgetProps {
  start: Date;
  end: Date;
  changed: (start: Date, end: Date) => any;
  durations?: Duration[];
  transformDurations?: (item: ComboBoxItem, duration: Duration) => ComboBoxItem;
}

const DEFAULT_DURATIONS = [
  Duration.fromObject({
    minutes: 15
  }),
  Duration.fromObject({
    hours: 1
  }),
  Duration.fromObject({
    days: 1
  }),
  Duration.fromObject({
    weeks: 1
  }),
  Duration.fromObject({
    months: 1
  })
];

const FloatingDatePicker: React.FC<
  React.PropsWithChildren<{ date: Date; label: string; changed: (date: Date) => any }>
> = (props) => {
  return (
    <S.Span
      onClick={(position) => {
        ioc.get(LayerManager).registerLayer(
          new Layer({
            render: (event) => {
              return (
                <DateTimePickerLayerWidget
                  {...props}
                  close={() => {
                    event.layer.dispose();
                  }}
                  dateChanged={(date) => {
                    event.layer.dispose();
                    props.changed(date);
                  }}
                  position={position}
                />
              );
            }
          })
        );
      }}
    >
      {props.children}
    </S.Span>
  );
};

export const DateRangeSelectorWidget: React.FC<DateRangeSelectorWidgetProps> = (props) => {
  const start = DateTime.fromJSDate(props.start);
  const end = DateTime.fromJSDate(props.end);

  let rel = '(custom)';
  if (DateTime.fromJSDate(new Date()).diff(end).seconds < 60) {
    rel = start.toRelative();
  }

  return (
    <S.Container>
      <FloatingDatePicker
        label="Start time"
        date={props.start}
        changed={(date) => {
          if (date < props.end) {
            props.changed(date, props.end);
          }
        }}
      >
        <S.Date>
          <SmartDateDisplayWidget date={props.start} />
        </S.Date>
      </FloatingDatePicker>
      <S.Icon icon="arrow-right" />
      <FloatingDatePicker
        label="End time"
        date={props.end}
        changed={(date) => {
          if (date >= props.start) {
            props.changed(props.start, date);
          }
        }}
      >
        <S.Date>
          <SmartDateDisplayWidget date={props.end} />
        </S.Date>
      </FloatingDatePicker>
      <S.Relative
        onClick={async (event) => {
          await ioc.get(ComboBoxStore2).show(
            new SimpleComboBoxDirective({
              items: (props.durations || DEFAULT_DURATIONS).map((duration, index) => {
                const d = DateTime.fromJSDate(new Date()).minus(duration);
                let item: ComboBoxItem = {
                  key: `${index}`,
                  title: `${DateTime.fromJSDate(new Date()).minus(duration).toRelative()}`,
                  action: async () => {
                    // recompute at the time the action is fired
                    props.changed(DateTime.fromJSDate(new Date()).minus(duration).toJSDate(), new Date());
                  }
                };

                if (props.transformDurations) {
                  item = props.transformDurations(item, duration);
                }
                return item;
              }),
              event
            })
          );
        }}
      >
        {rel}
      </S.Relative>
    </S.Container>
  );
};
namespace S {
  export const Container = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
  `;

  export const Date = styled.div`
    color: ${(p) => p.theme.text.primary};
    margin-right: 5px;
    font-size: 14px;
    white-space: nowrap;
  `;

  export const Span = styled.div`
    display: flex;
    cursor: pointer;
  `;

  export const Icon = styled(FontAwesomeIcon)`
    margin-left: 10px;
    margin-right: 10px;
    font-size: 17px;
    color: ${(p) => getTransparentColor(p.theme.text.primary, 0.5)};
    opacity: 0.6;
  `;

  export const Time = styled.div`
    color: ${(p) => p.theme.text.secondary};
    font-size: 14px;
    white-space: nowrap;
  `;
  export const Relative = styled.div`
    margin-left: 10px;
    color: ${(p) => getTransparentColor(p.theme.buttonLink.color, 0.7)};
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      color: ${(p) => p.theme.buttonLink.color};
    }
  `;
}
