import * as React from 'react';
import { observer } from 'mobx-react';
import {
  AbstractControl,
  ActionValidationState,
  BooleanControl,
  CardWidget,
  ComboBoxStore2,
  DateControl,
  DateTimePickerType,
  FloatingPanelButtonWidget,
  LayoutContextSize,
  PanelButtonMode,
  PanelButtonWidget,
  ReactorPanelModel,
  SetControl,
  SimpleComboBoxDirective,
  ioc,
  styled
} from '@journeyapps/reactor-mod';
import { PlaygroundValidationAction, PlaygroundValidationActionEvent } from '../actions/PlaygroundValidationAction';

export interface PlaygroundActionsPanelWidgetProps {
  model: ReactorPanelModel;
}

interface RepresentationRowProps {
  name: string;
  description: string;
  control: AbstractControl;
  buttonLabel: string;
}

interface ActionRepresentationExampleProps {
  api: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

const ActionRepresentationExample: React.FC<ActionRepresentationExampleProps> = (props) => {
  return (
    <CardWidget
      title={props.title}
      subHeading={props.api}
      sections={[
        {
          key: props.api,
          content: () => (
            <S.ExampleContent>
              <S.Description>{props.description}</S.Description>
              <S.ExampleOutput>{props.children}</S.ExampleOutput>
            </S.ExampleContent>
          )
        }
      ]}
    />
  );
};

const RepresentationRow: React.FC<RepresentationRowProps> = observer((props) => {
  const comboItems = props.control.representAsComboBoxItems({ label: props.name });

  return (
    <CardWidget
      title={props.name}
      subHeading={props.description}
      sections={[
        {
          key: `${props.name}-representations`,
          content: () => (
            <S.ControlOutputs>
              <S.Output>
                <S.Api>representAsControl()</S.Api>
                {props.control.representAsControl()}
              </S.Output>
              <S.Output>
                <S.Api>representAsBtn()</S.Api>
                <PanelButtonWidget {...props.control.representAsBtn()} label={props.buttonLabel} />
              </S.Output>
              <S.Output>
                <S.Api>representAsComboBoxItems()</S.Api>
                <PanelButtonWidget
                  label={`Open ${comboItems.length} item${comboItems.length === 1 ? '' : 's'}`}
                  icon="list"
                  action={(event) => {
                    return ioc.get(ComboBoxStore2).show(
                      new SimpleComboBoxDirective({
                        event,
                        items: props.control.representAsComboBoxItems({ label: props.name })
                      })
                    );
                  }}
                />
              </S.Output>
            </S.ControlOutputs>
          )
        }
      ]}
    />
  );
});

export const PlaygroundActionsPanelWidget: React.FC<PlaygroundActionsPanelWidgetProps> = observer(() => {
  const [executionCount, setExecutionCount] = React.useState(0);
  const [remediationCount, setRemediationCount] = React.useState(0);
  const [showHiddenAction, setShowHiddenAction] = React.useState(false);
  const [controls] = React.useState(() => ({
    boolean: new BooleanControl({ initialValue: true }),
    set: new SetControl({
      initialValue: 'review',
      options: [
        { key: 'draft', label: 'Draft', icon: 'pencil' },
        { key: 'review', label: 'In review', icon: 'eye' },
        { key: 'published', label: 'Published', icon: 'check' }
      ]
    }),
    date: new DateControl({
      initialValue: new Date(2026, 6, 27),
      type: DateTimePickerType.DATE
    })
  }));
  const action = PlaygroundValidationAction.get();

  const eventFor = (validationState: ActionValidationState): Partial<PlaygroundValidationActionEvent> => ({
    validationState,
    onExecute: () => setExecutionCount((count) => count + 1),
    onRemediate: () => setRemediationCount((count) => count + 1)
  });

  const allowedEvent = eventFor(ActionValidationState.ALLOWED);
  const actionControl = action.representAsControl({ eventData: allowedEvent });

  return (
    <S.Container>
      <CardWidget
        title="Action validation"
        subHeading="The same action with different event-bound validation contexts"
        sections={[
          {
            key: 'action-validation-states',
            content: () => (
              <>
                <S.Buttons>
                  {action.renderAsButton(
                    (btn) => (
                      <PanelButtonWidget {...btn} label="Allowed" icon="unlock" />
                    ),
                    eventFor(ActionValidationState.ALLOWED)
                  )}
                  {action.renderAsButton(
                    (btn) => (
                      <PanelButtonWidget {...btn} label="Pending" icon="sync-alt" />
                    ),
                    eventFor(ActionValidationState.PENDING)
                  )}
                  {action.renderAsButton(
                    (btn) => (
                      <PanelButtonWidget {...btn} label="Disabled" icon="lock" />
                    ),
                    eventFor(ActionValidationState.DISABLED)
                  )}
                  {action.renderAsButton(
                    (btn) => (
                      <PanelButtonWidget {...btn} label="Upgrade required" icon="rocket" />
                    ),
                    eventFor(ActionValidationState.BLOCKED)
                  )}
                  <PanelButtonWidget
                    label={showHiddenAction ? 'Hide hidden action' : 'Show hidden action'}
                    icon="eye"
                    mode={PanelButtonMode.LINK}
                    action={() => setShowHiddenAction((visible) => !visible)}
                  />
                  {action.renderAsButton(
                    (btn) => (
                      <PanelButtonWidget {...btn} label="Conditionally hidden" icon="eye-slash" />
                    ),
                    eventFor(showHiddenAction ? ActionValidationState.ALLOWED : ActionValidationState.HIDDEN)
                  )}
                </S.Buttons>
                <S.Status>
                  Executions: {executionCount} · Remediations: {remediationCount}
                </S.Status>
              </>
            )
          }
        ]}
      />

      <CardWidget
        title="Action representations"
        subHeading="How one action is adapted for different Reactor surfaces"
        sections={[
          {
            key: 'action-representations',
            content: () => (
              <>
                <S.Explanation>
                  Every example is generated from the same event-bound action. Activating one runs that action; only the
                  representation and consuming widget change. Total executions: {executionCount}.
                </S.Explanation>
                <S.ExampleGrid>
                  <ActionRepresentationExample
                    title="Standard button descriptor"
                    api="action.representAsButton(event)"
                    description="Returns a Btn containing the action label, icon, validator and activation callback."
                  >
                    <PanelButtonWidget {...action.representAsButton(allowedEvent)} />
                  </ActionRepresentationExample>

                  <ActionRepresentationExample
                    title="Icon-only descriptor"
                    api="action.representAsIcon(event)"
                    description="Returns the same validated Btn with its visible label removed for icon toolbars."
                  >
                    <PanelButtonWidget {...action.representAsIcon(allowedEvent)} />
                  </ActionRepresentationExample>

                  <ActionRepresentationExample
                    title="Panel-sized control"
                    api="control.representAsControl({ size: MEDIUM })"
                    description="Lets ActionButtonControl select the standard panel button renderer."
                  >
                    {actionControl.representAsControl({ size: LayoutContextSize.MEDIUM })}
                  </ActionRepresentationExample>

                  <ActionRepresentationExample
                    title="Compact control"
                    api="control.representAsControl({ size: SMALL })"
                    description="The same control selects the floating compact renderer for a small layout context."
                  >
                    {actionControl.representAsControl({ size: LayoutContextSize.SMALL })}
                  </ActionRepresentationExample>

                  <ActionRepresentationExample
                    title="Control converted back to Btn"
                    api="control.representAsBtn()"
                    description="Exposes the control's current Btn so a caller can choose the final button widget."
                  >
                    <PanelButtonWidget {...actionControl.representAsBtn()} />
                  </ActionRepresentationExample>

                  <ActionRepresentationExample
                    title="Btn consumed by floating renderer"
                    api="<FloatingPanelButtonWidget btn={control.representAsBtn()} />"
                    description="Demonstrates that the same Btn descriptor can be consumed by another renderer."
                  >
                    <FloatingPanelButtonWidget btn={actionControl.representAsBtn()} />
                  </ActionRepresentationExample>

                  <ActionRepresentationExample
                    title="Combobox item descriptor"
                    api="action.representAsComboBoxItem({ installAction: true })"
                    description="Builds an item with action metadata and an installed callback for menu surfaces."
                  >
                    <PanelButtonWidget
                      label="Open generated item"
                      icon="list"
                      action={(event) => {
                        return ioc.get(ComboBoxStore2).show(
                          new SimpleComboBoxDirective({
                            event,
                            items: [
                              action.representAsComboBoxItem({
                                installAction: true,
                                eventData: allowedEvent
                              })
                            ]
                          })
                        );
                      }}
                    />
                  </ActionRepresentationExample>
                </S.ExampleGrid>
              </>
            )
          }
        ]}
      />

      <CardWidget
        title="Control representation matrix"
        subHeading="Each control rendered through the shared AbstractControl contract"
        sections={[
          {
            key: 'control-representations',
            content: () => (
              <S.Matrix>
                <RepresentationRow
                  name="ActionButtonControl"
                  description="Event-bound action adapter"
                  control={actionControl}
                  buttonLabel="Run action"
                />
                <RepresentationRow
                  name="BooleanControl"
                  description={`Current value: ${controls.boolean.value}`}
                  control={controls.boolean}
                  buttonLabel="Toggle"
                />
                <RepresentationRow
                  name="SetControl"
                  description={`Current value: ${controls.set.value}`}
                  control={controls.set}
                  buttonLabel="Choose status"
                />
                <RepresentationRow
                  name="DateControl"
                  description={`Current value: ${controls.date.value.toLocaleDateString()}`}
                  control={controls.date}
                  buttonLabel="Choose date"
                />
              </S.Matrix>
            )
          }
        ]}
      />
    </S.Container>
  );
});

namespace S {
  export const Container = styled.div`
    padding: 12px;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    min-height: 100%;
    box-sizing: border-box;
  `;

  export const Buttons = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  `;

  export const Status = styled.div`
    margin-top: 10px;
    color: ${(p) => p.theme.text.secondary};
    font-size: 12px;
  `;

  export const Explanation = styled.div`
    margin-bottom: 12px;
    color: ${(p) => p.theme.text.secondary};
    font-size: 12px;
    line-height: 1.5;
  `;

  export const ExampleGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 10px;
  `;

  export const ExampleContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 7px;
  `;

  export const Api = styled.code`
    color: ${(p) => p.theme.text.secondary};
    font-size: 11px;
    overflow-wrap: anywhere;
  `;

  export const ExampleOutput = styled.div`
    display: flex;
    align-items: center;
    min-height: 34px;
    margin-top: auto;
    padding-top: 3px;
  `;

  export const Matrix = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;

  export const ControlOutputs = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(180px, 1fr));
    gap: 12px;
    overflow-x: auto;
  `;

  export const Output = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
  `;

  export const Description = styled.div`
    margin-top: 3px;
    color: ${(p) => p.theme.text.secondary};
    font-size: 11px;
  `;
}
