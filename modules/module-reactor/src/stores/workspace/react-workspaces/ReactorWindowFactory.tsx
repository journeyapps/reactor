import {
  FloatingWindowFactory,
  FloatingWindowModel,
  FloatingWindowRendererEvent
} from '@projectstorm/react-workspaces-model-floating-window';
import * as React from 'react';
import { WorkspaceEngine, WorkspaceModel } from '@projectstorm/react-workspaces-core';
import { observable } from 'mobx';
import { styled } from '../../themes/reactor-theme-fragment';
import { WORKSPACE_PANEL_RADIUS } from '../../../widgets/workspace/workspacePanelChrome';

export class ReactorWindowModel extends FloatingWindowModel {
  private static MAXIMIZE_INSET = 20;

  @observable
  accessor pinned: boolean;

  @observable
  accessor maximized: boolean;

  private restoreBounds: { left: number; top: number; width: number; height: number } | null;

  /**
   * Whether this is an independent window rather than a temporary window coupled to a tray.
   * Standalone windows can be docked into the active workspace.
   */
  standalone: boolean;

  constructor(child: WorkspaceModel) {
    super(ReactorWindowFactory.TYPE, child);
    this.standalone = false;
    this.setSize({
      width: 300,
      height: 400
    });
    this.pinned = false;
    this.maximized = false;
    this.restoreBounds = null;
  }

  toggleMaximized() {
    if (this.maximized) {
      const bounds = this.restoreBounds;
      this.maximized = false;
      this.restoreBounds = null;
      this.setDraggable(true);

      if (bounds) {
        this.dimension.update(bounds);
      }
      return;
    }

    const parentDimensions = this.parent?.r_dimensions;
    if (!parentDimensions) {
      return;
    }

    this.restoreBounds = {
      left: this.position.left,
      top: this.position.top,
      width: this.size.width,
      height: this.size.height
    };

    const inset = ReactorWindowModel.MAXIMIZE_INSET;
    this.maximized = true;
    this.setDraggable(false);
    this.dimension.update({
      left: parentDimensions.position.left + inset,
      top: parentDimensions.position.top + inset,
      width: Math.max(0, parentDimensions.size.width - inset * 2),
      height: Math.max(0, parentDimensions.size.height - inset * 2)
    });
  }
}

export class ReactorWindowFactory extends FloatingWindowFactory<ReactorWindowModel> {
  static TYPE = 'reactor-window';

  constructor() {
    super(ReactorWindowFactory.TYPE);
  }

  protected _generateModel(): ReactorWindowModel {
    return new ReactorWindowModel(null);
  }

  generateContent(event: FloatingWindowRendererEvent): React.JSX.Element {
    return <DefaultFloatingWindowWidget {...event} />;
  }
}

export interface DefaultFloatingWindowWidgetProps {
  model: FloatingWindowModel;
  engine: WorkspaceEngine;
  titlebar: React.JSX.Element;
  content: React.JSX.Element;
}

export const DefaultFloatingWindowWidget: React.FC<DefaultFloatingWindowWidgetProps> = (props) => {
  return (
    <S.Container>
      {props.titlebar}
      {props.content}
    </S.Container>
  );
};

namespace S {
  export const Container = styled.div`
    box-shadow:
      0 18px 48px ${(p) => p.theme.floating.shadowColor},
      0 0 0 1px ${(p) => p.theme.floating.backgroundInactive};
    pointer-events: all;
    border: solid 2px ${(p) => p.theme.floating.border};
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    background: ${(p) => p.theme.floating.background};
    border-radius: ${WORKSPACE_PANEL_RADIUS}px;
    overflow: hidden;
  `;
}
