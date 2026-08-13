import * as React from 'react';
import { BodyWidget } from '@journeyapps/reactor-mod';

export interface DemoBodyWidgetProps {}

export const DemoBodyWidget: React.FC<DemoBodyWidgetProps> = () => {
  return <BodyWidget logo={'#'} logoClicked={() => {}} />;
};
