import {
  SerializedWorkspaceTrayModel,
  WorkspaceTrayFactory,
  WorkspaceTrayMode,
  WorkspaceTrayModel
} from '@projectstorm/react-workspaces-model-tray';
import { WorkspaceModelFactoryEvent } from '@projectstorm/react-workspaces-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { AdvancedWorkspacePreference } from '../../../preferences/AdvancedWorkspacePreference';
import { getTransparentColor } from '@journeyapps/reactor-lib-utils';
import { SmartTrayTitleWidget } from '../../../widgets/panel/tray/SmartTrayTitleWidget';
import { FloatingWindowFactory } from '@projectstorm/react-workspaces-model-floating-window';
import { styled } from '../../themes/reactor-theme-fragment';
import { serializeChildren } from './ReactorExpandNodeFactory';
import { WORKSPACE_PANEL_RADIUS } from '../../../widgets/workspace/workspacePanelChrome';

namespace S {
  export const GroupSurface = styled.div`
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border-radius: ${WORKSPACE_PANEL_RADIUS}px;
  `;

  export const Pin = styled.div`
    color: ${(p) => getTransparentColor(p.theme.panels.titleForeground, 0.5)};
    cursor: pointer;
    font-size: 13px;
    height: 20px;
    width: 20px;
    margin: auto;
    margin-bottom: 3px;
    margin-top: 5px;
    line-height: 20px;
    text-align: center;
    vertical-align: middle;

    &:hover {
      color: ${(p) => p.theme.panels.titleForeground};
    }
  `;
}

export class ReactorTrayModel extends WorkspaceTrayModel {
  constructor(factory: FloatingWindowFactory) {
    super({
      iconWidth: 30,
      factory: factory
    });
    this.setExpand(false, true);
  }

  toArray(): SerializedWorkspaceTrayModel {
    return {
      ...super.toArray(),
      children: serializeChildren(this.children)
    };
  }
}

export class ReactorTrayFactory extends WorkspaceTrayFactory<ReactorTrayModel> {
  protected _generateModel() {
    return new ReactorTrayModel(this.options.windowFactory);
  }

  generateContent(event: WorkspaceModelFactoryEvent<WorkspaceTrayModel>): React.JSX.Element {
    return <S.GroupSurface>{super.generateContent(event)}</S.GroupSurface>;
  }

  generateTrayHeader(event: WorkspaceModelFactoryEvent<WorkspaceTrayModel>): any {
    if (event.model.mode === WorkspaceTrayMode.COLLAPSED) {
      // micro button should be hidden in simple mode
      if (!AdvancedWorkspacePreference.enabled()) {
        return null;
      }
      return (
        <S.Pin
          onClick={() => {
            event.model.setMode(WorkspaceTrayMode.NORMAL);
          }}
        >
          <FontAwesomeIcon icon="expand" />
        </S.Pin>
      );
    }
    return <SmartTrayTitleWidget engine={event.engine} model={event.model} />;
  }
}
