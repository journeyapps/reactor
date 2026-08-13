import * as React from 'react';
import { ReactorPanelFactory, ReactorIcon, ReactorPanelModel } from '@journeyapps/reactor-mod';
import { WorkspaceModelFactoryEvent } from '@projectstorm/react-workspaces-core';
import { PlaygroundSizeSelector } from './PlaygroundSizeSelector';

export interface PlaygroundPanelWidgetProps {
  model: ReactorPanelModel;
}

export class PlaygroundPanelModel extends ReactorPanelModel {
  constructor(type: string) {
    super(type);
    this.setExpand(true, true);
  }
}

export interface PlaygroundPanelFactoryOptions {
  type: string;
  name: string;
  icon: ReactorIcon;
  widget: React.FC<PlaygroundPanelWidgetProps>;
}

export class PlaygroundPanelFactory extends ReactorPanelFactory<PlaygroundPanelModel> {
  protected panelOptions: PlaygroundPanelFactoryOptions;

  constructor(panelOptions: PlaygroundPanelFactoryOptions) {
    super({
      type: panelOptions.type,
      icon: panelOptions.icon,
      name: panelOptions.name,
      category: 'Playground',
      isMultiple: true,
      padding: true
    });
    this.panelOptions = panelOptions;
  }

  protected generatePanelContent(event: WorkspaceModelFactoryEvent<PlaygroundPanelModel>): React.JSX.Element {
    return (
      <PlaygroundSizeSelector>
        <this.panelOptions.widget model={event.model} />
      </PlaygroundSizeSelector>
    );
  }

  protected _generateModel(): PlaygroundPanelModel {
    return new PlaygroundPanelModel(this.panelOptions.type);
  }
}
