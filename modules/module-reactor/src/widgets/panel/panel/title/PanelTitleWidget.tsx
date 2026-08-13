import * as React from 'react';
import { Btn } from '../../../../definitions/common';
import { inject, ioc } from '../../../../inversify.config';
import { WorkspaceCollectionModel, WorkspaceNodeModel } from '@projectstorm/react-workspaces-core';
import { WorkspaceStore } from '../../../../stores/workspace/WorkspaceStore';
import { observer } from 'mobx-react';
import { AttentionWrapperWidget } from '../../../guide/AttentionWrapperWidget';
import { PanelTitleIconSimpleWidget, PanelTitleIconWidget } from './PanelTitleIconWidget';
import { WorkspaceModelContext } from '../WorkspaceModelContext';
import { ButtonComponentSelection, ReactorComponentType } from '../../../../stores/guide/selections/common';
import { ReactorPanelModel } from '../../../../stores/workspace/react-workspaces/ReactorPanelModel';
import { ComboBoxStore2 } from '../../../../stores/combo2/ComboBoxStore2';
import { SimpleComboBoxDirective } from '../../../../stores/combo2/directives/simple/SimpleComboBoxDirective';
import { styled } from '../../../../stores/themes/reactor-theme-fragment';
import { System } from '../../../../core/System';
import { IconWidget, ReactorIcon } from '../../../icons/IconWidget';
import { FloatingWindowModel } from '@projectstorm/react-workspaces-model-floating-window';
import { ReactorWindowModel } from '../../../../stores/workspace/react-workspaces/ReactorWindowFactory';
import { ReactorPanelFactory } from '../../../../stores/workspace/react-workspaces/ReactorPanelFactory';
import { ActionSource } from '../../../../actions/Action';
import { ReactorEntities } from '../../../../entities-reactor/ReactorEntities';
import { useButton } from '../../../../hooks/useButton';
import { ActionValidationState } from '../../../../actions/validators/ActionValidator';
import { WorkspaceTabModel } from '@projectstorm/react-workspaces-model-tabs';
import { WORKSPACE_PANEL_RADIUS } from '../../../workspace/workspacePanelChrome';
import { ReactorTooltipWidget, TooltipPosition } from '../../../info/tooltips';
import { ContextMenuTriggerWidget } from '../../../context-menu/ContextMenuTriggerWidget';

export interface PanelTitleWidgetProps {
  name: string;
  icon?: ReactorIcon;
  icon2?: ReactorIcon;
  color?: string;
  btns?: (Btn & { highlight?: boolean })[];
  active?: boolean;
  model: ReactorPanelModel | null;
}

namespace S {
  export const TitleName = styled.div`
    align-self: center;
    color: ${(p) => p.theme.panels.titleForeground};
    font-size: 14px;
    margin-left: 5px;
    font-weight: 500;
    white-space: nowrap;
  `;

  export const Button = styled.div<{ selected: boolean; highlight: boolean }>`
    align-self: stretch;
    padding-left: ${(p) => (p.selected ? 10 : 2)}px;
    padding-right: ${(p) => (p.selected ? 10 : 2)}px;
    margin-right: 2px;
    opacity: ${(p) => (p.highlight || p.selected ? 1 : 0.2)};
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 12px;
    border-radius: 3px;

    background: ${(p) => (p.selected ? p.theme.guide.accent : 'transparent')};
    color: ${(p) => (p.selected ? p.theme.guide.accentText : p.theme.panels.titleForeground)};

    &:hover {
      opacity: 1;
    }
  `;

  export const Buttons = styled.div`
    flex-shrink: 0;
    display: flex;
    margin-right: 5px;
    margin-left: 5px;
  `;

  export const Spacer = styled.div`
    flex-grow: 1;
  `;

  export const Title = styled(ContextMenuTriggerWidget)<{ $attention: boolean; $rounded: boolean }>`
    width: 100%;
    display: flex;
    min-height: 30px;
    flex-shrink: 0;
    background: ${(p) => (p.$attention ? 'black' : p.theme.panels.titleBackground)};
    border-radius: ${(p) => (p.$rounded ? `${WORKSPACE_PANEL_RADIUS}px ${WORKSPACE_PANEL_RADIUS}px 0 0` : '0')};
    overflow: hidden;
    ${(p) => (p.$attention ? `border: solid 1px ${p.theme.guide.accent}; border-bottom: none` : '')};
    box-sizing: border-box;
  `;

  export const SimpleIcon = styled.div`
    width: 30px;
    height: 30px;
    position: relative;
  `;

  export const PanelMicroButtonIcon = styled(IconWidget)<{ highlight: boolean }>`
    ${(p) => (p.highlight ? `color:${p.theme.panels.itemIconColorSelected};` : ``)}
  `;
}

const PanelIconButton: React.FC<{ btn: Btn; highlight: boolean }> = ({ btn, highlight }) => {
  const { onClick, disabled, ref, validationResult } = useButton({ btn });

  if (validationResult?.type === ActionValidationState.HIDDEN) {
    return null;
  }

  return (
    <AttentionWrapperWidget<ButtonComponentSelection>
      forwardRef={ref}
      selection={{
        label: btn.tooltip || btn.label
      }}
      type={ReactorComponentType.PANEL_MICRO_BUTTON}
      activated={(selected) => {
        return (
          <ReactorTooltipWidget tooltip={btn.tooltip || btn.label} tooltipPos={btn.tooltipPos || TooltipPosition.TOP}>
            <S.Button
              ref={ref}
              highlight={highlight && !disabled}
              selected={!!selected}
              aria-label={btn.tooltip || btn.label}
              onClick={(event) => {
                event.persist();
                onClick(event);
              }}
            >
              <S.PanelMicroButtonIcon highlight={highlight && !disabled} icon={btn.icon} />
            </S.Button>
          </ReactorTooltipWidget>
        );
      }}
    />
  );
};

@observer
export class PanelTitleWidget extends React.Component<PanelTitleWidgetProps> {
  @inject(ComboBoxStore2)
  accessor comboBoxStore: ComboBoxStore2;

  btn(p: Btn & { highlight?: boolean }, index) {
    return <PanelIconButton highlight={p.highlight} btn={p} key={p.tooltip || p.label || index} />;
  }

  getIconWrapped() {
    const { model } = this.props;
    if (model && ioc.get(WorkspaceStore).getActiveWorkspace()?.mutable) {
      return (
        <div
          onClick={async (event) => {
            const definition = ioc.get(System).getDefinition<ReactorPanelFactory>(ReactorEntities.PANEL);
            const factoryOb = await definition.selectEntity({
              position: event,
              source: ActionSource.BUTTON,
              entity: null
            });

            if (model.parent instanceof FloatingWindowModel) {
              model.parent.setChild(factoryOb.generateModel());
            } else if (model.parent instanceof WorkspaceCollectionModel) {
              model.parent.replaceModel(model, factoryOb.generateModel());
            }
          }}
        >
          {this.getIcon()}
        </div>
      );
    }
    return this.getIcon();
  }

  getIcon() {
    if (!ioc.get(WorkspaceStore).getActiveWorkspace()?.mutable) {
      return (
        <S.SimpleIcon>
          <PanelTitleIconSimpleWidget color={this.props.color} icon={this.props.icon} icon2={this.props.icon2} />
        </S.SimpleIcon>
      );
    }
    if (this.props.icon) {
      return <PanelTitleIconWidget color={this.props.color} icon={this.props.icon} icon2={this.props.icon2} />;
    }
    return null;
  }

  render() {
    const { model } = this.props;
    const rounded = !model || !(model.parent instanceof WorkspaceTabModel);

    return (
      <WorkspaceModelContext.Provider value={model}>
        <S.Title
          onDoubleClick={() => {
            if (!model) {
              return;
            }
            if (model.parent instanceof FloatingWindowModel) {
              (model.parent as ReactorWindowModel).toggleMaximized();
              return;
            }
            const workspaceStore = ioc.get(WorkspaceStore);
            if (workspaceStore.fullscreenModel) {
              workspaceStore.setFullscreenModel(null);
            } else {
              workspaceStore.setFullscreenModel(model);
            }
          }}
          $attention={!!model?.grabAttention}
          $rounded={rounded}
          onContextMenu={async (position) => {
            if (!model) {
              return;
            }

            const workspaceStore = ioc.get(WorkspaceStore);
            const window = model.parent instanceof FloatingWindowModel ? model.parent : null;
            if (!window && !workspaceStore.getActiveWorkspace()?.mutable) {
              return;
            }

            await this.comboBoxStore.show(
              new SimpleComboBoxDirective({
                event: position,
                items: window
                  ? [
                      {
                        key: 'close',
                        title: 'Close',
                        action: async () => {
                          window.delete();
                        }
                      },
                      ...(window instanceof ReactorWindowModel && window.standalone
                        ? [
                            {
                              key: 'dock',
                              title: 'Dock into workspace',
                              action: async () => {
                                window.delete();
                                workspaceStore.addModel(model);
                              }
                            }
                          ]
                        : [])
                    ]
                  : [
                      {
                        key: 'close',
                        title: 'Close',
                        action: async () => {
                          model.delete();
                          workspaceStore.engine.normalize();
                        }
                      },
                      {
                        key: 'tabs',
                        title: 'Convert to tabs',
                        action: async () => {
                          const tabs = workspaceStore.engine.generateReactorTabModel();
                          (model.parent as WorkspaceNodeModel).replaceModel(model, tabs);
                          tabs.addModel(model);
                        }
                      },
                      {
                        key: 'tray',
                        title: 'Convert to tray',
                        action: async () => {
                          const tray = workspaceStore.engine.generateReactorTrayModel();
                          (model.parent as WorkspaceNodeModel).replaceModel(model, tray);
                          tray.addModel(model);
                        }
                      }
                    ]
              })
            );
          }}
        >
          {this.getIconWrapped()}
          <S.TitleName>{this.props.name}</S.TitleName>
          <S.Spacer />
          <S.Buttons>
            {(this.props.btns || []).map((btn, index) => {
              return this.btn(btn, index);
            })}
          </S.Buttons>
        </S.Title>
      </WorkspaceModelContext.Provider>
    );
  }
}
