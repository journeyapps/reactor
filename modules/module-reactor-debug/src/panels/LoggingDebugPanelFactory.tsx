import * as React from 'react';
import { WorkspaceModelFactoryEvent } from '@projectstorm/react-workspaces-core';
import { ReactorEntityCategories, ReactorPanelFactory } from '@journeyapps/reactor-mod';
import { LOGGING_DEBUG_PANEL_TYPE, LoggingDebugPanelModel } from './LoggingDebugPanelModel';
import { LoggerDebugPanelWidget } from './LoggerDebugPanelWidget';

export class LoggingDebugPanelFactory extends ReactorPanelFactory<LoggingDebugPanelModel> {
  static TYPE = LOGGING_DEBUG_PANEL_TYPE;

  constructor() {
    super({
      type: LoggingDebugPanelFactory.TYPE,
      icon: 'bug',
      name: 'Reactor debug: Logging',
      category: ReactorEntityCategories.CORE,
      isMultiple: false,
      padding: false
    });
  }

  protected generatePanelContent(event: WorkspaceModelFactoryEvent<LoggingDebugPanelModel>): React.JSX.Element {
    return <LoggerDebugPanelWidget model={event.model} />;
  }

  protected _generateModel() {
    return new LoggingDebugPanelModel();
  }
}
