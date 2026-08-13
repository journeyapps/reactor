import {
  Action,
  ActionEvent,
  ActionStore,
  ActionValidationState,
  ActionValidator,
  ioc,
  ValidationResult
} from '@journeyapps/reactor-mod';

export interface PlaygroundValidationActionEvent extends ActionEvent {
  validationState?: ActionValidationState;
  onExecute?: () => void;
  onRemediate?: () => void;
}

class PlaygroundActionValidator extends ActionValidator<PlaygroundValidationActionEvent> {
  validate(event: Partial<PlaygroundValidationActionEvent> = {}): ValidationResult {
    switch (event.validationState) {
      case ActionValidationState.PENDING:
        return {
          type: ActionValidationState.PENDING,
          message: 'Checking whether this action is available'
        };
      case ActionValidationState.DISABLED:
        return {
          type: ActionValidationState.DISABLED,
          message: 'You do not have permission to perform this action'
        };
      case ActionValidationState.BLOCKED:
        return {
          type: ActionValidationState.BLOCKED,
          message: 'Your current plan does not include this action',
          indicator: {
            icon: 'dollar-sign',
            background: '#00945b',
            foreground: '#fff',
            tooltip: 'Upgrade required'
          },
          onActivate: () => event.onRemediate?.()
        };
      case ActionValidationState.HIDDEN:
        return { type: ActionValidationState.HIDDEN };
      default:
        return { type: ActionValidationState.ALLOWED };
    }
  }
}

export class PlaygroundValidationAction extends Action<{ EVENT: PlaygroundValidationActionEvent }> {
  static ID = 'PLAYGROUND_VALIDATION_ACTION';

  constructor() {
    super({
      id: PlaygroundValidationAction.ID,
      name: 'Run playground action',
      tags: ['playground', 'demo', 'validation'],
      icon: 'wand-magic-sparkles',
      validators: [new PlaygroundActionValidator()]
    });
  }

  protected async fireEvent(event: PlaygroundValidationActionEvent): Promise<boolean> {
    event.onExecute?.();
    return true;
  }

  static get() {
    return ioc.get(ActionStore).getActionByID<PlaygroundValidationAction>(PlaygroundValidationAction.ID);
  }
}
