import { ReactorPanelModel } from '@journeyapps/reactor-mod';

export const LOGGING_DEBUG_PANEL_TYPE = 'reactor-debug';

export class LoggingDebugPanelModel extends ReactorPanelModel {
  constructor() {
    super(LOGGING_DEBUG_PANEL_TYPE);
    this.setExpand(true, true);
  }
}
