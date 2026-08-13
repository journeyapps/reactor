import * as React from 'react';
import { useRef } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis
} from 'recharts';
import { DateTime } from 'luxon';
import * as _ from 'lodash';
import { formatNumber } from '@journeyapps/reactor-lib-utils';
import { PanelPlaceholderWidget } from '../panel/panel/PanelPlaceholderWidget';
import { FloatingPanelWidget } from '../floating/FloatingPanelWidget';
import { ioc } from '../../inversify.config';
import { ThemeStore } from '../../stores/themes/ThemeStore';
import { styled, theme } from '../../stores/themes/reactor-theme-fragment';
import { observer } from 'mobx-react';
import Color from 'color';
import { SmartDateDisplayWidget } from '../info/DateDisplayWidget';

export interface GraphThreshold {
  value: number;
  key: string;
  above: boolean;
}

export interface GraphWidgetProps {
  data: {
    value: number;
    timestamp: Date;
    realtime?: boolean;
  }[];
  yAxis: string;
  start: Date;
  end: Date;
  formatDate: (date: DateTime) => string;
  formatValue: (value: number) => string;
  thresholds?: GraphThreshold[];
  animate?: boolean;
}

export const CustomTooltip: React.FC<TooltipContentProps<number, number | string> & { props: GraphWidgetProps }> = (
  props
) => {
  if (!props.active) {
    return null;
  }

  const dt = DateTime.fromMillis(props.label as number);
  return (
    <S.Floating center={false}>
      <S.MetaKey>
        <SmartDateDisplayWidget date={dt} />
      </S.MetaKey>
      <S.MetaValue>{props.props.formatValue(props.payload?.[0]?.value as number)}</S.MetaValue>
    </S.Floating>
  );
};

export const InnerGraphWidget: React.FC<GraphWidgetProps> = observer((props) => {
  const _theme = ioc.get(ThemeStore).getCurrentTheme(theme);

  const stops = [_theme.graphs.fillStop1, _theme.graphs.fillStop2, _theme.graphs.fillStop3].map((s) => {
    return new Color(s);
  });
  const stop_offsets = [5, 50, 95];

  let lowest_value = _.minBy(props.data, (d) => d.value)?.value;
  let lowest_threshold = _.minBy(props.thresholds || [], (t) => t.value)?.value;

  let highest_value = _.maxBy(props.data, (d) => d.value)?.value;
  let highest_threshold = _.maxBy(props.thresholds || [], (t) => t.value)?.value;

  return (
    <S.Responsive height="100%">
      <AreaChart
        data={props.data.map((d) => {
          return {
            ...d,
            timestamp: d.timestamp.getTime(),
            realtime: d.realtime ? d.value : undefined
          };
        })}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      >
        <defs>
          <linearGradient id="colorPv" x1="0" y1="0" x2="1" y2="0">
            {stops.map((s, index) => {
              return (
                <stop key={index} offset={`${stop_offsets[index]}%`} stopColor={s.hex()} stopOpacity={s.alpha()} />
              );
            })}
          </linearGradient>
          <linearGradient id="colorPv2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFA500" stopOpacity={1}>
              <animate attributeName="stop-opacity" dur="1600ms" values="0;1;0" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#FFA500" stopOpacity={1}>
              <animate attributeName="stop-opacity" dur="1600ms" values="0;1;0" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <Area
          isAnimationActive={props.animate ?? true}
          type="monotone"
          dataKey="value"
          stroke={_theme.graphs.line}
          strokeWidth={2}
          fill="url(#colorPv)"
        />
        <Area
          isAnimationActive={props.animate ?? true}
          type="monotone"
          dataKey="realtime"
          stroke="orange"
          strokeWidth={2}
          fill="url(#colorPv2)"
        />
        <CartesianGrid stroke={_theme.graphs.grid} />
        <XAxis
          scale="time"
          type="number"
          domain={[props.start.getTime(), props.end.getTime()]}
          style={{
            fontSize: '12px',
            stroke: 'none'
          }}
          dataKey="timestamp"
          tickFormatter={(v) => {
            const dt = DateTime.fromMillis(v);
            return props.formatDate(dt);
          }}
        />
        <YAxis
          style={{
            fontSize: '12px',
            stroke: 'none'
          }}
          tickFormatter={(v) => {
            return formatNumber(v);
          }}
          domain={
            (props.thresholds || []).length > 0
              ? [
                  Math.min(...[lowest_threshold, lowest_value].filter((f) => !!f)),
                  Math.max(...[highest_threshold, highest_value].filter((f) => !!f))
                ]
              : undefined
          }
        >
          <Label
            fontSize={12}
            style={{
              textAnchor: 'middle'
            }}
            angle={-90}
            value={props.yAxis}
            position="insideLeft"
          >
            {props.yAxis}
          </Label>
        </YAxis>
        {(props.thresholds || []).map((t) => {
          return (
            <React.Fragment key={t.key}>
              <ReferenceLine stroke={_theme.graphs.thresholdLine} strokeWidth={2} y={t.value} />
              <ReferenceArea
                fill={_theme.graphs.thresholdLine}
                fillOpacity={0.2}
                x1={props.start.getTime()}
                y1={t.value}
                x2={props.end.getTime()}
                y2={t.above ? _.maxBy(props.data, (d) => d.value).value : 0}
              />
            </React.Fragment>
          );
        })}
        <Tooltip
          content={(_props) => {
            return <CustomTooltip {..._props} props={props} />;
          }}
        />
      </AreaChart>
    </S.Responsive>
  );
});

export const GraphWidget: React.FC<GraphWidgetProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <S.Container ref={ref}>
      {props.data.length > 0 ? (
        <InnerGraphWidget {...props} />
      ) : (
        <PanelPlaceholderWidget center={true} text="No data found" icon="warning" />
      )}
    </S.Container>
  );
};
namespace S {
  export const Responsive = styled(ResponsiveContainer)`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
  `;

  export const Container = styled.div`
    height: 100%;
    overflow: hidden;
    position: relative;
  `;

  export const MetaKey = styled.div`
    color: ${(p) => p.theme.text.primary};
  `;

  export const MetaValue = styled.div`
    color: ${(p) => p.theme.graphs.line};
  `;

  export const Floating = styled(FloatingPanelWidget)`
    padding: 10px;
  `;
}
